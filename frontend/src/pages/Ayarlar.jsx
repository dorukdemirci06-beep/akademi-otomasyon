import React, { useState, useEffect } from 'react';
import { getAkademiAyarlar, updateAkademiAyarlar, getOgrenciler, getSiniflarBasic, sendBulkWhatsAppMessage } from '../services/api';
import { Save, Smartphone, Key, MessageCircle, AlertCircle, Type, Send, Users, BookOpen, UserCheck, RefreshCw } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

export default function Ayarlar({ showToast, user }) {
  // Tabs: 'otomatik' | 'toplu'
  const [activeTab, setActiveTab] = useState('otomatik');

  const [formData, setFormData] = useState({
    whatsapp_provider: 'callmebot',
    whatsapp_api_key: '',
    whatsapp_phone_number: '',
    msg_kayit: '',
    msg_ders_hatirlatma: '',
    msg_odeme_hatirlatma: '',
    msg_devamsizlik: '',
    msg_dogum_gunu: '',
    msg_ozel_gun: '',
    msg_ogretmen_hatirlatma: '',
    is_msg_kayit_active: false,
    is_msg_ders_hatirlatma_active: false,
    is_msg_odeme_hatirlatma_active: false,
    is_msg_devamsizlik_active: false,
    is_msg_dogum_gunu_active: false,
    is_msg_ozel_gun_active: false,
    is_msg_ogretmen_hatirlatma_active: false
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Toplu Mesaj State
  const [targetType, setTargetType] = useState('tumu'); // tumu, sinif, kisi
  const [selectedTarget, setSelectedTarget] = useState([]);
  const [bulkMessage, setBulkMessage] = useState('');
  const [sendingBulk, setSendingBulk] = useState(false);
  
  // Veriler
  const [siniflar, setSiniflar] = useState([]);
  const [ogrenciler, setOgrenciler] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchAyarlar();
  }, []);

  // Sınıf veya Öğrencileri yükle
  useEffect(() => {
    if (activeTab === 'toplu' && targetType === 'sinif' && siniflar.length === 0) {
      loadSiniflar();
    }
    if (activeTab === 'toplu' && targetType === 'kisi' && ogrenciler.length === 0) {
      loadOgrenciler();
    }
  }, [activeTab, targetType]);

  const loadSiniflar = async () => {
    setLoadingData(true);
    try {
      const res = await getSiniflarBasic();
      setSiniflar(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadOgrenciler = async () => {
    setLoadingData(true);
    try {
      // Sadece aktif öğrencileri al
      const res = await getOgrenciler('Aktif');
      setOgrenciler(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAyarlar = async () => {
    setFetching(true);
    try {
      const { data } = await getAkademiAyarlar();
      setFormData({
        whatsapp_provider: data.whatsapp_provider || 'callmebot',
        whatsapp_api_key: data.whatsapp_api_key || '',
        whatsapp_phone_number: data.whatsapp_phone_number || '',
        msg_kayit: data.msg_kayit || '',
        msg_ders_hatirlatma: data.msg_ders_hatirlatma || '',
        msg_odeme_hatirlatma: data.msg_odeme_hatirlatma || '',
        msg_devamsizlik: data.msg_devamsizlik || '',
        msg_dogum_gunu: data.msg_dogum_gunu || '',
        msg_ozel_gun: data.msg_ozel_gun || '',
        msg_ogretmen_hatirlatma: data.msg_ogretmen_hatirlatma || '',
        is_msg_kayit_active: data.is_msg_kayit_active || false,
        is_msg_ders_hatirlatma_active: data.is_msg_ders_hatirlatma_active || false,
        is_msg_odeme_hatirlatma_active: data.is_msg_odeme_hatirlatma_active || false,
        is_msg_devamsizlik_active: data.is_msg_devamsizlik_active || false,
        is_msg_dogum_gunu_active: data.is_msg_dogum_gunu_active || false,
        is_msg_ozel_gun_active: data.is_msg_ozel_gun_active || false,
        is_msg_ogretmen_hatirlatma_active: data.is_msg_ogretmen_hatirlatma_active || false
      });
    } catch (err) {
      if (err.response?.status !== 403) {
        showToast('Ayarlar yüklenirken hata oluştu', 'error');
      }
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.rol !== 'Yönetici') {
      showToast('Sadece yöneticiler ayarları güncelleyebilir.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await updateAkademiAyarlar(formData);
      showToast('Ayarlar başarıyla güncellendi!');
    } catch (err) {
      showToast('Ayarlar güncellenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSend = async (e) => {
    e.preventDefault();
    if (!bulkMessage.trim()) {
      showToast('Lütfen gönderilecek mesajı yazın.', 'error');
      return;
    }
    if ((targetType === 'sinif' || targetType === 'kisi') && selectedTarget.length === 0) {
      showToast('Lütfen en az bir alıcı seçin.', 'error');
      return;
    }

    setSendingBulk(true);
    try {
      await sendBulkWhatsAppMessage({
        target_type: targetType,
        target_ids: selectedTarget,
        message: bulkMessage
      });
      showToast('Toplu mesajlar sıraya eklendi ve başarıyla gönderiliyor!');
      setBulkMessage('');
      setSelectedTarget([]);
    } catch (err) {
      showToast('Mesajlar gönderilirken hata oluştu.', 'error');
    } finally {
      setSendingBulk(false);
    }
  };

  if (user?.rol !== 'Yönetici') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
        <AlertCircle className="w-16 h-16 mb-4 text-rose-500 opacity-80" />
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Erişim Engellendi</h2>
        <p className="mt-2">Bu sayfayı görüntülemek ve ayarları değiştirmek için "Yönetici" yetkisine sahip olmalısınız.</p>
      </div>
    );
  }

  if (fetching) {
    return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;
  }

  const ToggleSwitch = ({ name, checked, label }) => (
    <div className="flex items-center gap-3">
      <button 
        type="button" 
        onClick={() => handleToggle(name)}
        className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 shrink-0 ${checked ? 'bg-[#2eb82e] hover:bg-[#269926] transition-colors' : 'bg-black/10 dark:bg-white/10'}`}
      >
        <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      {label && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-12 text-left">{checked ? 'Açık' : 'Kapalı'}</span>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* TABS HEADER */}
      <div className="flex items-center gap-2 mb-8 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit mx-auto neo-card !border-none">
        <button
          onClick={() => setActiveTab('otomatik')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === 'otomatik'
              ? 'bg-white dark:bg-slate-700 text-[#2eb82e] shadow-sm scale-100'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Otomatik Şablonlar</span>
        </button>
        <button
          onClick={() => setActiveTab('toplu')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === 'toplu'
              ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm scale-100'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Toplu Mesaj Gönder</span>
        </button>
      </div>

      {activeTab === 'otomatik' ? (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* SOL KOLON: Entegrasyon Bilgileri */}
          <div className="neo-card md:w-1/3 rounded-3xl p-6 flex flex-col h-fit">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 dark:border-white/5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">
                <Key className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">API Entegrasyonu</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">WhatsApp bağlantı bilgileri</p>
              </div>
            </div>

            <div className="space-y-5 flex-1">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Sağlayıcı (Altyapı)</label>
                <div className="grid grid-cols-1 gap-3">
                  <label className={`cursor-pointer p-3 transition-all flex items-center gap-3 rounded-2xl ${formData.whatsapp_provider === 'meta' ? 'neo-button-primary' : 'border-white/10 dark:border-white/5 neo-button'}`}>
                    <input type="radio" name="whatsapp_provider" value="meta" checked={formData.whatsapp_provider === 'meta'} onChange={handleChange} className="hidden" />
                    <div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Meta Cloud API (Resmi)</span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Kurumsal hesaplar için işletme onayı gerektirir.</p>
                    </div>
                  </label>
                  
                  <label className={`cursor-pointer p-3 transition-all flex items-center gap-3 rounded-2xl ${formData.whatsapp_provider === 'callmebot' ? 'neo-button-primary' : 'border-white/10 dark:border-white/5 neo-button'}`}>
                    <input type="radio" name="whatsapp_provider" value="callmebot" checked={formData.whatsapp_provider === 'callmebot'} onChange={handleChange} className="hidden" />
                    <div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">CallMeBot (Ücretsiz)</span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">İzin verilen numaralara ücretsiz mesaj gönderimi.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-400" />
                  API Key / Access Token
                </label>
                <input
                  type="password"
                  name="whatsapp_api_key"
                  value={formData.whatsapp_api_key}
                  onChange={handleChange}
                  placeholder="Örn: EAAIxxxx..."
                  className="w-full rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition neo-input"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  {formData.whatsapp_provider === 'meta' ? 'Phone Number ID' : 'Telefon No (CallMeBot)'}
                </label>
                <input
                  type="text"
                  name="whatsapp_phone_number"
                  value={formData.whatsapp_phone_number}
                  onChange={handleChange}
                  placeholder={formData.whatsapp_provider === 'meta' ? "Örn: 104xxxxxxxxx" : "Örn: +90532..."}
                  className="w-full rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition neo-input"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10 dark:border-white/5 mt-auto">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-white font-bold text-sm rounded-full transition flex items-center justify-center gap-2 disabled:opacity-70 neo-button-primary"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
              </button>
            </div>
          </div>

          {/* SAĞ KOLON: Mesaj Şablonları */}
          <div className="neo-card md:w-2/3 rounded-3xl p-6 flex flex-col h-fit">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 dark:border-white/5 shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Mesaj Şablonları</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Öğrencilere atılacak otomatik mesajların içeriklerini özelleştirin</p>
              </div>
            </div>

            <div className="flex-1 space-y-5">
              {/* Şablon 1: Yeni Kayıt */}
              <div className={`neo-card space-y-1.5 p-4 ${formData.is_msg_kayit_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" /> Yeni Kayıt (Hoş Geldiniz)
                  </label>
                  <ToggleSwitch name="is_msg_kayit_active" checked={formData.is_msg_kayit_active} label={true} />
                </div>
                <textarea
                  name="msg_kayit"
                  value={formData.msg_kayit}
                  onChange={handleChange}
                  placeholder="Sayın {isim} {soyisim}, {akademi_adi} akademisine hoş geldiniz!"
                  className="w-full rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
                />
                <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{isim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{soyisim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{akademi_adi}'}</span></p>
              </div>

              {/* Şablon 2: Ders Hatırlatma */}
              <div className={`neo-card space-y-1.5 p-4 ${formData.is_msg_ders_hatirlatma_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" /> Ders Hatırlatma (Önceki Gün)
                  </label>
                  <ToggleSwitch name="is_msg_ders_hatirlatma_active" checked={formData.is_msg_ders_hatirlatma_active} label={true} />
                </div>
                <textarea
                  name="msg_ders_hatirlatma"
                  value={formData.msg_ders_hatirlatma}
                  onChange={handleChange}
                  placeholder="Hatırlatma: Sayın {isim} {soyisim}, Yarın ({gun}) saat {saat}'de {ders_adi} dersiniz bulunmaktadır."
                  className="w-full rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
                />
                <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{isim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{soyisim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{ders_adi}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{gun}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{saat}'}</span></p>
              </div>

              {/* Şablon 7: Öğretmene Ders Hatırlatma */}
              <div className={`neo-card space-y-1.5 p-4 ${formData.is_msg_ogretmen_hatirlatma_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" /> Öğretmene Ders Hatırlatma
                  </label>
                  <ToggleSwitch name="is_msg_ogretmen_hatirlatma_active" checked={formData.is_msg_ogretmen_hatirlatma_active} label={true} />
                </div>
                <textarea
                  name="msg_ogretmen_hatirlatma"
                  value={formData.msg_ogretmen_hatirlatma}
                  onChange={handleChange}
                  placeholder="Sayın {ogretmen_adi}, {tarih} saat {saat}'de {ders_adi} dersiniz bulunmaktadır."
                  className="w-full rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
                />
                <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{ogretmen_adi}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{tarih}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{saat}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{ders_adi}'}</span></p>
              </div>

              {/* Şablon 3: Ödeme Hatırlatma */}
              <div className={`neo-card space-y-1.5 p-4 ${formData.is_msg_odeme_hatirlatma_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" /> Ödeme Hatırlatma
                  </label>
                  <ToggleSwitch name="is_msg_odeme_hatirlatma_active" checked={formData.is_msg_odeme_hatirlatma_active} label={true} />
                </div>
                <textarea
                  name="msg_odeme_hatirlatma"
                  value={formData.msg_odeme_hatirlatma}
                  onChange={handleChange}
                  placeholder="Sayın {isim} {soyisim}, {vade} tarihli {tutar} ₺ tutarındaki ödemenizi hatırlatırız."
                  className="w-full rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
                />
                <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{isim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{soyisim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{tutar}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{vade}'}</span></p>
              </div>

              {/* Şablon 4: Devamsızlık Bildirimi */}
              <div className={`neo-card space-y-1.5 p-4 ${formData.is_msg_devamsizlik_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" /> Devamsızlık Bildirimi
                  </label>
                  <ToggleSwitch name="is_msg_devamsizlik_active" checked={formData.is_msg_devamsizlik_active} label={true} />
                </div>
                <textarea
                  name="msg_devamsizlik"
                  value={formData.msg_devamsizlik}
                  onChange={handleChange}
                  placeholder="Sayın Veli, öğrenciniz {isim} {soyisim} {tarih} tarihindeki dersine katılmamıştır."
                  className="w-full rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
                />
                <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{isim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{soyisim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{tarih}'}</span></p>
              </div>

              {/* Şablon 5: Doğum Günü */}
              <div className={`neo-card space-y-1.5 p-4 ${formData.is_msg_dogum_gunu_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" /> Doğum Günü Tebriği
                  </label>
                  <ToggleSwitch name="is_msg_dogum_gunu_active" checked={formData.is_msg_dogum_gunu_active} label={true} />
                </div>
                <textarea
                  name="msg_dogum_gunu"
                  value={formData.msg_dogum_gunu}
                  onChange={handleChange}
                  placeholder="İyi ki doğdun {isim} {soyisim}, yeni yaşın mutluluk getirsin!"
                  className="w-full rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
                />
                <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{isim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{soyisim}'}</span></p>
              </div>

              {/* Şablon 6: Türkiye Özel Günleri */}
              <div className={`neo-card space-y-1.5 p-4 ${formData.is_msg_ozel_gun_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" /> Türkiye Özel Günleri
                  </label>
                  <ToggleSwitch name="is_msg_ozel_gun_active" checked={formData.is_msg_ozel_gun_active} label={true} />
                </div>
                <textarea
                  name="msg_ozel_gun"
                  value={formData.msg_ozel_gun}
                  onChange={handleChange}
                  placeholder="Sayın {isim} {soyisim}, {ozel_gun_adi} kutlu olsun!"
                  className="w-full rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
                />
                <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{isim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{soyisim}'}</span> <span className="px-1 py-0.5 rounded bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">{'{ozel_gun_adi}'}</span></p>
              </div>


            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
        <form onSubmit={handleBulkSend} className="neo-card md:w-2/3 rounded-3xl p-6 sm:p-8 flex flex-col h-fit">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10 dark:border-white/5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-500/10 text-sky-500">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Manuel Toplu Mesaj Gönderimi</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tek tıkla belirli bir gruba, sınıfa veya tüm öğrencilere aynı anda mesaj yollayın.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* ALICI TÜRÜ SEÇİMİ */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">1. Alıcı Grubu Seçin</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`cursor-pointer p-4 transition-all flex flex-col gap-2 rounded-2xl border text-center ${targetType === 'tumu' ? 'neo-button-primary' : 'neo-button border-slate-200 dark:border-white/10'}`}>
                  <input type="radio" name="targetType" value="tumu" checked={targetType === 'tumu'} onChange={(e) => {setTargetType(e.target.value); setSelectedTarget([]);}} className="hidden" />
                  <Users className={`w-6 h-6 mx-auto ${targetType === 'tumu' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-bold text-sm">Tüm Aktif Öğrenciler</span>
                </label>
                
                <label className={`cursor-pointer p-4 transition-all flex flex-col gap-2 rounded-2xl border text-center ${targetType === 'sinif' ? 'neo-button-primary' : 'neo-button border-slate-200 dark:border-white/10'}`}>
                  <input type="radio" name="targetType" value="sinif" checked={targetType === 'sinif'} onChange={(e) => {setTargetType(e.target.value); setSelectedTarget([]);}} className="hidden" />
                  <BookOpen className={`w-6 h-6 mx-auto ${targetType === 'sinif' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-bold text-sm">Sınıflara Göre Gönder</span>
                </label>

                <label className={`cursor-pointer p-4 transition-all flex flex-col gap-2 rounded-2xl border text-center ${targetType === 'kisi' ? 'neo-button-primary' : 'neo-button border-slate-200 dark:border-white/10'}`}>
                  <input type="radio" name="targetType" value="kisi" checked={targetType === 'kisi'} onChange={(e) => {setTargetType(e.target.value); setSelectedTarget([]);}} className="hidden" />
                  <UserCheck className={`w-6 h-6 mx-auto ${targetType === 'kisi' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="font-bold text-sm">Kişilere Göre Gönder</span>
                </label>
              </div>
            </div>

            {/* ALT SEÇİM KUTULARI */}
            {targetType === 'sinif' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Sınıf Seçimi</label>
                <div className="relative">
                  <SearchableSelect
                    value={selectedTarget}
                    onChange={(val) => setSelectedTarget(val)}
                    options={siniflar.map(s => ({ value: s.sinif_adi, label: s.sinif_adi }))}
                    placeholder="Sınıf ara ve seç..."
                    searchPlaceholder="Sınıf ara..."
                    icon={BookOpen}
                    isMulti={true}
                  />
                  {loadingData && <RefreshCw className="w-4 h-4 absolute right-12 top-2.5 animate-spin text-slate-400" />}
                </div>
              </div>
            )}

            {targetType === 'kisi' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Öğrenci Seçimi</label>
                <div className="relative">
                  <SearchableSelect
                    value={selectedTarget}
                    onChange={(val) => setSelectedTarget(val)}
                    options={ogrenciler.map(o => ({ value: String(o.id), label: `${o.isim} ${o.soyisim}` }))}
                    placeholder="Öğrenci ara ve seç..."
                    searchPlaceholder="Öğrenci ara..."
                    icon={UserCheck}
                    isMulti={true}
                  />
                  {loadingData && <RefreshCw className="w-4 h-4 absolute right-12 top-2.5 animate-spin text-slate-400" />}
                </div>
              </div>
            )}

            {/* MESAJ İÇERİĞİ */}
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/5">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">2. Mesaj İçeriği</label>
              <textarea
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                placeholder="Göndermek istediğiniz metni buraya yazın..."
                className="w-full rounded-2xl px-5 py-4 text-sm bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition resize-none h-32 shadow-inner"
              />
              <p className="text-[11px] text-slate-500 font-medium">Bu mesaj, yukarıda seçtiğiniz gruba aynen gönderilecektir. Kişiye özel değişkenler bu modda desteklenmemektedir.</p>
            </div>

            {/* GÖNDER BUTONU */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={sendingBulk || (!bulkMessage.trim()) || ((targetType !== 'tumu') && selectedTarget.length === 0)}
                className="px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold text-sm rounded-full transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed neo-button shadow-lg shadow-sky-500/20"
              >
                {sendingBulk ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Mesajları Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* SAĞ KOLON: Seçilenler Listesi */}
        <div className="neo-card md:w-1/3 rounded-3xl p-6 flex flex-col h-fit max-h-[600px]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 dark:border-white/5 shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-500/10 text-sky-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Seçilen Alıcılar</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {targetType === 'tumu' ? 'Tüm liste hedefleniyor' : `${selectedTarget.length} alıcı seçildi`}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            {targetType === 'tumu' ? (
              <div className="p-4 rounded-2xl neo-card !border-l-4 !border-l-sky-500 bg-gradient-to-r from-sky-500/10 to-transparent flex items-center justify-center gap-3">
                <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-full shrink-0">
                  <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="text-sky-800 dark:text-sky-200 text-sm font-bold">
                  Sistemdeki tüm aktif öğrencilere mesaj gönderilecek.
                </div>
              </div>
            ) : selectedTarget.length === 0 ? (
              <div className="py-8 text-slate-400 text-center text-sm italic border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Henüz seçim yapılmadı. Yandan alıcıları seçiniz.
              </div>
            ) : (
              selectedTarget.map(idOrName => {
                let label = idOrName;
                if (targetType === 'kisi') {
                  const student = ogrenciler.find(o => String(o.id) === String(idOrName));
                  if (student) label = `${student.isim} ${student.soyisim}`;
                }
                return (
                  <div key={idOrName} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      )}

    </div>
  );
}
