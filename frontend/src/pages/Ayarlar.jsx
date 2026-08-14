import React, { useState, useEffect } from 'react';
import { getAkademiAyarlar, updateAkademiAyarlar } from '../services/api';
import { Save, Smartphone, Key, MessageCircle, AlertCircle, Type } from 'lucide-react';

export default function Ayarlar({ showToast, user }) {
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
    is_msg_kayit_active: false,
    is_msg_ders_hatirlatma_active: false,
    is_msg_odeme_hatirlatma_active: false,
    is_msg_devamsizlik_active: false,
    is_msg_dogum_gunu_active: false,
    is_msg_ozel_gun_active: false
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchAyarlar();
  }, []);

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
        is_msg_kayit_active: data.is_msg_kayit_active || false,
        is_msg_ders_hatirlatma_active: data.is_msg_ders_hatirlatma_active || false,
        is_msg_odeme_hatirlatma_active: data.is_msg_odeme_hatirlatma_active || false,
        is_msg_devamsizlik_active: data.is_msg_devamsizlik_active || false,
        is_msg_dogum_gunu_active: data.is_msg_dogum_gunu_active || false,
        is_msg_ozel_gun_active: data.is_msg_ozel_gun_active || false
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

  const handleToggle = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const ToggleSwitch = ({ name, checked, label }) => (
    <div className="flex items-center gap-3">
      <button 
        type="button" 
        onClick={() => handleToggle(name)}
        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 ${checked ? 'bg-[#2eb82e]' : 'bg-black/10 dark:bg-white/10'}`}
      >
        <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      {label && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-12 text-left">{checked ? 'Açık' : 'Kapalı'}</span>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* SOL KOLON: Entegrasyon Bilgileri */}
        <div className="neo-card md:w-1/3 rounded-3xl p-6 flex flex-col h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 dark:border-white/5 ">
            <div className="w-10 h-10 rounded-xl  dark:bg-emerald-900/30 flex items-center justify-center">
              <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
                  <input type="radio" name="whatsapp_provider" value="meta" checked={formData.whatsapp_provider === 'meta'} onChange={handleChange} className="w-4 h-4 text-emerald-600 neo-input" />
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Meta Cloud API (Resmi)</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Kurumsal hesaplar için işletme onayı gerektirir.</p>
                  </div>
                </label>
                
                <label className={`cursor-pointer p-3 transition-all flex items-center gap-3 rounded-2xl ${formData.whatsapp_provider === 'callmebot' ? 'neo-button-primary' : 'border-white/10 dark:border-white/5 neo-button'}`}>
                  <input type="radio" name="whatsapp_provider" value="callmebot" checked={formData.whatsapp_provider === 'callmebot'} onChange={handleChange} className="w-4 h-4 text-emerald-600 neo-input" />
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
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition neo-input"
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
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition neo-input"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/10 dark:border-white/5  mt-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70 neo-button-primary"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
            </button>
          </div>
        </div>

        {/* SAĞ KOLON: Mesaj Şablonları */}
        <div className="neo-card md:w-2/3 rounded-3xl p-6 flex flex-col h-fit">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 dark:border-white/5  shrink-0">
            <div className="w-10 h-10 rounded-xl  dark:bg-emerald-900/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Mesaj Şablonları</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Öğrencilere atılacak otomatik mesajların içeriklerini özelleştirin</p>
            </div>
          </div>

          <div className="flex-1 space-y-5">
            {/* Şablon 1: Yeni Kayıt */}
            <div className={`neo-card space-y-1.5 p-4 transition-colors ${formData.is_msg_kayit_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
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
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
              />
              <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{isim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{soyisim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{akademi_adi}'}</span></p>
            </div>

            {/* Şablon 2: Ders Hatırlatma */}
            <div className={`neo-card space-y-1.5 p-4 transition-colors ${formData.is_msg_ders_hatirlatma_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
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
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
              />
              <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{isim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{soyisim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{ders_adi}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{gun}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{saat}'}</span></p>
            </div>

            {/* Şablon 3: Ödeme Hatırlatma */}
            <div className={`neo-card space-y-1.5 p-4 transition-colors ${formData.is_msg_odeme_hatirlatma_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
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
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
              />
              <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{isim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{soyisim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{tutar}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{vade}'}</span></p>
            </div>

            {/* Şablon 4: Devamsızlık Bildirimi */}
            <div className={`neo-card space-y-1.5 p-4 transition-colors ${formData.is_msg_devamsizlik_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
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
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
              />
              <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{isim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{soyisim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{tarih}'}</span></p>
            </div>

            {/* Şablon 5: Doğum Günü */}
            <div className={`neo-card space-y-1.5 p-4 transition-colors ${formData.is_msg_dogum_gunu_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
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
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
              />
              <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{isim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{soyisim}'}</span></p>
            </div>

            {/* Şablon 6: Türkiye Özel Günleri */}
            <div className={`neo-card space-y-1.5 p-4 transition-colors ${formData.is_msg_ozel_gun_active ? '  border-emerald-200 dark:border-emerald-800/50' : '  border-white/10 dark:border-white/5 '}`}>
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
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none h-20 neo-input"
              />
              <p className="text-[10px] text-slate-500 font-medium">Değişkenler: <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{isim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{soyisim}'}</span> <span className="text-emerald-500  dark:bg-emerald-900/30 px-1 py-0.5 rounded">{'{ozel_gun_adi}'}</span></p>
            </div>
            
            
          </div>
        </div>

      </form>
    </div>
  );
}
