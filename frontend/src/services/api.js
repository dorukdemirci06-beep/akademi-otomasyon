import axios from 'axios';

// FastAPI Backend URL (Localhost & Production Fallback)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Oturum açılmışsa JWT Token'ını istek başlığına (Authorization Header) ekle
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Unauthorized alındığında oturumu sonlandır ve login sayfasına yönlendir
API.interceptors.response.use(
  (response) => response,
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

// Öğrenci Endpointleri
export const getOgrenciler = (durum) => API.get('/ogrenciler/', { params: durum ? { durum } : {} });
export const createOgrenci = (params) => API.post('/ogrenciler/', null, { params });
export const deleteOgrenci = (id) => API.delete(`/ogrenciler/${id}`);
export const updateOgrenciDurum = (id, durum) => API.put(`/ogrenciler/${id}/durum`, null, { params: { durum } });
export const updateOgrenciInfo = (id, data) => API.put(`/ogrenciler/${id}`, data);
export const araOgrenci = (q) => API.get('/ogrenciler/ara', { params: { q } });
export const getOgrenciSiniflar = (id) => API.get(`/ogrenciler/${id}/siniflar/`);

// Sınıf Endpointleri
export const getSiniflar = () => API.get('/siniflar/');
export const createSinif = (params) => API.post('/siniflar/', null, { params });
export const deleteSinif = (id) => API.delete(`/siniflar/${id}`);
export const getSinifOgrencileri = (id) => API.get(`/siniflar/${id}/ogrenciler/`);

// Finans & Ders Kayıt Endpointleri
export const getOdemeler = () => API.get('/odemeler-list/');
export const createOdeme = (data) => API.post('/odemeler/', data, { params: data });
export const odemeTahsilEt = (id, data) => API.put(`/odemeler/${id}/odendi`, data);
export const updateOdeme = (id, data) => API.put(`/odemeler/${id}`, data);
export const deleteOdeme = (id) => API.delete(`/odemeler/${id}`);
export const odemeGeriAl = (id) => API.put(`/odemeler/${id}/geri-al`);
export const kaydetOgrenciSinif = (params) => API.post('/ogrenci-sinif/', null, { params });
export const deleteOgrenciSinif = (id) => API.delete(`/ogrenci-sinif/${id}`);

// Ön Kayıt Endpointleri
export const getOnKayitlar = () => API.get('/on-kayitlar/');
export const createOnKayit = (data) => API.post('/on-kayitlar/', data);
export const updateOnKayit = (id, data) => API.put(`/on-kayitlar/${id}`, data);
export const updateOnKayitDurum = (id, durum) => API.put(`/on-kayitlar/${id}/durum`, { durum });
export const deleteOnKayit = (id) => API.delete(`/on-kayitlar/${id}`);

// Akademi Endpointleri
export const getAkademiler = () => API.get('/akademiler/');
export const getAkademilerDetayli = () => API.get('/akademiler/detayli');
export const kurAkademi = (data) => API.post('/akademiler/kurulum', data);
export const deleteAkademi = (id) => API.delete(`/akademiler/${id}`);

// Kullanıcı & Auth Endpointleri
export const loginKullanici = (credentials) => API.post('/kullanicilar/login', credentials);
export const getKullanicilar = () => API.get('/kullanicilar/');
export const createKullanici = (data) => API.post('/kullanicilar/', data);
export const deleteKullanici = (id) => API.delete(`/kullanicilar/${id}`);

// Ders Programı Endpointleri
export const getDersProgrami = () => API.get('/ders-programi/');
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

export default API;

