import axios from 'axios';
import { isArchiveMode, getArchiveData } from './archiveMode';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

const API = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000, // 10 seconds timeout to prevent infinite hang
  headers: {
    'Content-Type': 'application/json',
  },
});


// --- ARŞİV MODU İÇİN API.GET OVERRIDE ---
const originalGet = API.get;
API.get = async (url, config) => {
  if (isArchiveMode()) {
    const archive = getArchiveData();
    if (archive) {
      // Sınıfın Öğrencileri
      const ogrMatch = url.match(/\/siniflar\/(\d+)\/ogrenciler\/?/);
      if (ogrMatch) {
          const sinifId = parseInt(ogrMatch[1]);
          const ogrenciIds = archive.ogrenci_siniflar.filter(os => os.sinif_id === sinifId).map(os => os.ogrenci_id);
          const ogrencilerList = archive.ogrenciler.filter(o => ogrenciIds.includes(o.id)).map(o => ({
              ...o, // Siniflar.jsx o.isim, o.soyisim vb. bekliyor
              id: o.id,
              ogrenci_id: o.id,
              sinif_id: sinifId,
              ogrenci: o // Yoklama.jsx o.ogrenci.isim bekliyor
          }));
          return { data: { sinif_id: sinifId, ogrenciler: ogrencilerList } };
      }

      // Öğrencinin Sınıfları
      const sinifMatch = url.match(/\/ogrenciler\/(\d+)\/siniflar\/?/);
      if (sinifMatch) {
          const ogrenciId = parseInt(sinifMatch[1]);
          const sinifIds = archive.ogrenci_siniflar.filter(os => os.ogrenci_id === ogrenciId).map(os => os.sinif_id);
          const siniflar = archive.siniflar.filter(s => sinifIds.includes(s.id));
          return { data: siniflar };
      }

      if (url.includes('/ogrenciler/')) {
        const ogrencilerWithSiniflar = archive.ogrenciler.map(o => {
            const sinifIds = archive.ogrenci_siniflar.filter(os => os.ogrenci_id === o.id).map(os => os.sinif_id);
            const ogrenciSiniflari = archive.siniflar.filter(s => sinifIds.includes(s.id)).map(s => ({id: s.id, sinif_adi: s.sinif_adi}));
            return { ...o, siniflar: ogrenciSiniflari };
        });

        if (config && config.params && config.params.q) {
           const q = config.params.q.toLowerCase();
           return { data: ogrencilerWithSiniflar.filter(o => 
               o.isim.toLowerCase().includes(q) || 
               o.soyisim.toLowerCase().includes(q) || 
               (o.telefon && o.telefon.includes(q))
           )};
        }

        return { data: ogrencilerWithSiniflar };
      }
      
      if (url.includes('/siniflar/')) {
        const siniflarWithDetails = archive.siniflar.map(s => {
           const ogrenci_sayisi = archive.ogrenci_siniflar.filter(os => os.sinif_id === s.id).length;
           const ders_programi = (archive.ders_programlari || []).filter(dp => dp.sinif_id === s.id);
           return { ...s, ogrenci_sayisi, ders_programi };
        });
        return { data: siniflarWithDetails };
      }
      
      if (url.includes('/odemeler-list/')) {
        const odemeler = (archive.odemeler || []).map(od => ({
            ...od,
            odeme_turu: od.odeme_turu || 'Kurs Ücreti',
            odeme_periyodu: od.odeme_periyodu || 'Aylık',
            taksit_sayisi: od.taksit_sayisi || 1,
            taksit_no: od.taksit_no || 1
        }));
        return { data: odemeler };
      }
      
      if (url.includes('/yoklama/')) {
         // filter yoklamalar if sinif_id is provided in params
         let yoks = archive.yoklamalar;
         if (config && config.params) {
            if (config.params.sinif_id) {
               yoks = yoks.filter(y => y.sinif_id == config.params.sinif_id);
            }
            if (config.params.tarih) {
               yoks = yoks.filter(y => y.tarih == config.params.tarih);
            }
         }
         return { data: yoks };
      }
      
      if (url.includes('/ders-programi/')) {
        const dersler = archive.ders_programlari || [];
        const enrichedDersler = dersler.map(d => {
           const colors = ['sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'emerald', 'teal', 'cyan', 'orange', 'amber'];
           const randomColor = colors[(d.sinif_id || d.id || 0) % colors.length];
           let finalDers = { ...d, renk: d.renk || randomColor };
           if (!finalDers.sinif_adi) {
              const s = archive.siniflar.find(s => s.id === d.sinif_id);
              finalDers.sinif_adi = s ? s.sinif_adi : '';
           }
           return finalDers;
        });
        return { data: enrichedDersler };
      }
      if (url.includes('/on-kayitlar/')) return { data: [] };
    }
  }
  return originalGet.call(API, url, config);
};

// --- AKILLI ÖN BELLEK (CACHE) SİSTEMİ ---
const cache = {};
const CACHE_DURATION = 60000; // 60 Saniye boyunca hafızada tutar

export const clearCache = () => {
  for (let key in cache) {
    delete cache[key];
  }
};

const withCache = async (cacheKey, fetchPromiseCreator, bypassCache = false) => {
  if (!bypassCache && cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
    // Hafızada var ve süresi dolmamışsa anında döndür
    return { data: cache[cacheKey].data, fromCache: true };
  }
  const res = await fetchPromiseCreator();
  cache[cacheKey] = { data: res.data, timestamp: Date.now() };
  return res;
};

// Request Interceptor: Oturum açılmışsa JWT Token'ını istek başlığına ekle
API.interceptors.request.use(
  (config) => {
    // ARŞİV MODU: Veri değiştirici işlemleri tamamen engelle!
    if (isArchiveMode() && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        return Promise.reject(new Error("Arşiv modunda değişiklik yapılamaz. Lütfen önce arşiv modundan çıkın."));
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 kontrolü ve OTOMATİK CACHE TEMİZLİĞİ
API.interceptors.response.use(
  (response) => {
    // Eğer veri değiştirici bir işlemse (Ekleme, Güncelleme, Silme), tüm hafızayı temizle!
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method.toLowerCase())) {
      clearCache();
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      } else {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// Öğrenci Endpointleri (CACHED)
export const getOgrenciler = (durum, bypass = false) => 
  withCache(`/ogrenciler/?durum=${durum||''}`, () => API.get('/ogrenciler/', { params: durum ? { durum } : {} }), bypass);
export const createOgrenci = (params) => API.post('/ogrenciler/', null, { params });
export const deleteOgrenci = (id) => API.delete(`/ogrenciler/${id}`);
export const updateOgrenciDurum = (id, durum) => API.put(`/ogrenciler/${id}/durum`, null, { params: { durum } });
export const updateOgrenciInfo = (id, data) => API.put(`/ogrenciler/${id}`, data);
export const araOgrenci = (q) => API.get('/ogrenciler/ara', { params: { q } });
export const getOgrenciSiniflar = (id) => API.get(`/ogrenciler/${id}/siniflar/`);

// Sınıf Endpointleri (CACHED)
export const getSiniflar = (bypass = false) => withCache('/siniflar/', () => API.get('/siniflar/'), bypass);
export const getSiniflarBasic = (bypass = false) => withCache('/siniflar/?basic=true', () => API.get('/siniflar/?basic=true'), bypass);
export const createSinif = (params) => API.post('/siniflar/', null, { params });
export const deleteSinif = (id) => API.delete(`/siniflar/${id}`);
export const getSinifOgrencileri = (id) => API.get(`/siniflar/${id}/ogrenciler/`);

// Finans & Ders Kayıt Endpointleri (CACHED)
export const getOdemeler = (bypass = false) => withCache('/odemeler-list/', () => API.get('/odemeler-list/'), bypass);
export const createOdeme = (data) => API.post('/odemeler/', data, { params: data });
export const odemeTahsilEt = (id, data) => API.put(`/odemeler/${id}/odendi`, data);
export const updateOdeme = (id, data) => API.put(`/odemeler/${id}`, data);
export const deleteOdeme = (id) => API.delete(`/odemeler/${id}`);
export const odemeGeriAl = (id) => API.put(`/odemeler/${id}/geri-al`);
export const kaydetOgrenciSinif = (params) => API.post('/ogrenci-sinif/', null, { params });
export const deleteOgrenciSinif = (id) => API.delete(`/ogrenci-sinif/${id}`);

// Ön Kayıt Endpointleri (CACHED)
export const getOnKayitlar = (bypass = false) => withCache('/on-kayitlar/', () => API.get('/on-kayitlar/'), bypass);
export const createOnKayit = (data) => API.post('/on-kayitlar/', data);
export const updateOnKayit = (id, data) => API.put(`/on-kayitlar/${id}`, data);
export const updateOnKayitDurum = (id, durum) => API.put(`/on-kayitlar/${id}/durum`, { durum });
export const deleteOnKayit = (id) => API.delete(`/on-kayitlar/${id}`);

// WhatsApp Endpointleri
export const sendBulkWhatsAppMessage = (data) => API.post('/whatsapp/toplu-gonder', data);

// Akademi Endpointleri
export const getAkademiler = () => API.get('/akademiler/');
export const getAkademilerDetayli = () => API.get('/akademiler/detayli');
export const kurAkademi = (data) => API.post('/akademiler/kurulum', data);
export const deleteAkademi = (id) => API.delete(`/akademiler/${id}`);
export const getAkademiAyarlar = () => API.get('/akademiler/ayarlar');
export const getPendingAutomations = () => API.get('/akademiler/ayarlar/pending-automations');
export const updateAkademiAyarlar = (data) => API.put('/akademiler/ayarlar', data);
// Kullanıcı & Auth Endpointleri
export const loginKullanici = (credentials) => API.post('/kullanicilar/login', credentials);
export const getKullanicilar = () => API.get('/kullanicilar/');
export const createKullanici = (data) => API.post('/kullanicilar/', data);
export const deleteKullanici = (id) => API.delete(`/kullanicilar/${id}`);

// Öğretmen Endpointleri
export const getOgretmenler = () => API.get('/ogretmenler/');
export const createOgretmen = (data) => API.post('/ogretmenler/', data);
export const updateOgretmen = (id, data) => API.put(`/ogretmenler/${id}`, data);
export const deleteOgretmen = (id) => API.delete(`/ogretmenler/${id}`);

// Personel Endpointleri
export const getPersoneller = () => API.get('/personeller/');
export const createPersonel = (data) => API.post('/personeller/', data);
export const updatePersonel = (id, data) => API.put(`/personeller/${id}`, data);
export const deletePersonel = (id) => API.delete(`/personeller/${id}`);

// Değerlendirme Endpointleri
export const getDegerlendirmeler = () => API.get('/degerlendirmeler/');
export const createDegerlendirme = (data) => API.post('/degerlendirmeler/', data);
export const updateDegerlendirme = (id, data) => API.put(`/degerlendirmeler/${id}`, data);
export const deleteDegerlendirme = (id) => API.delete(`/degerlendirmeler/${id}`);

// Ders Programı Endpointleri (CACHED)
export const getDersProgrami = (bypass = false) => withCache('/ders-programi/', () => API.get('/ders-programi/'), bypass);
export const createDersProgrami = (data) => API.post('/ders-programi/', data);
export const deleteDersProgrami = (id) => API.delete(`/ders-programi/${id}`);

// Yoklama Endpointleri
export const getYoklama = (sinifId, tarih) => {
  const params = {};
  if (sinifId) params.sinif_id = sinifId;
  if (tarih) params.tarih = tarih;
  return API.get('/yoklama/', { params });
};
export const saveYoklamaToplu = (data) => API.post('/yoklama/toplu', data);
export const deleteYoklamaOturum = (sinifId, tarih) => API.delete('/yoklama/oturum', { params: { sinif_id: sinifId, tarih } });

// Derslik Endpointleri
export const getDerslikler = () => API.get('/derslikler/');
export const createDerslik = (data) => API.post('/derslikler/', data);
export const deleteDerslik = (id) => API.delete(`/derslikler/${id}`);

// Arşiv Endpointleri
export const getGecmisSezonlar = () => API.get('/api/arsiv/sezonlar');
export const getSezonDetay = (id) => API.get(`/api/arsiv/sezonlar/${id}`);
export const arsivleSezonSonu = (data) => API.post('/api/arsiv/sezon-sonu', data);
export const geriAlSezon = (id) => API.post(`/api/arsiv/geri-al/${id}`);

// Yedekleme Endpointleri
export const triggerManualBackup = () => API.post('/api/backup/manual');
export const triggerSetupBackup = (pin) => API.post('/api/backup/setup_pin', { pin });

export default API;
