import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, Lock, User, KeyRound, ShieldCheck, Sparkles, ArrowRight, AlertCircle, Sun, Moon, Building2, PlusCircle, Search, ChevronDown, Check, Trash2, ExternalLink, Layers, Activity, RefreshCw } from 'lucide-react';
import { loginKullanici, getAkademiler, getAkademilerDetayli, kurAkademi, deleteAkademi, triggerSetupBackup } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import ConfirmModal from '../components/ConfirmModal';

const Login = ({ onLoginSuccess }) => {
  const { theme, toggleTheme } = useTheme();
  const [selectedAkademi, setSelectedAkademi] = useState('Test1');
  const [akademiler, setAkademiler] = useState([{ id: 1, name: 'Test1' }, { id: 2, name: 'Test2' }]);
  const [akademiComboboxOpen, setAkademiComboboxOpen] = useState(false);
  const [akademiSearchQuery, setAkademiSearchQuery] = useState('');
  const comboboxRef = useRef(null);

  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Setup Modal & SuperAdmin Panel State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [showKurulumModal, setShowKurulumModal] = useState(false);
  const [akademilerDetayli, setAkademilerDetayli] = useState([]);
  const [panelTab, setPanelTab] = useState('list'); // 'list' | 'create'
  const [panelSearch, setPanelSearch] = useState('');
  const [panelLoading, setPanelLoading] = useState(false);

  const [kurulumForm, setKurulumForm] = useState({
    akademi_adi: '',
    ad_soyad: '',
    kullanici_adi: '',
    sifre: '',
  });
  const [kurulumLoading, setKurulumLoading] = useState(false);
  const [kurulumMsg, setKurulumMsg] = useState({ type: '', text: '' });

  const [panelListMsg, setPanelListMsg] = useState({ type: '', text: '' });
  const [backupLoading, setBackupLoading] = useState(false);

  const handleManualBackup = async () => {
    try {
      setBackupLoading(true);
      setPanelListMsg({ type: 'success', text: 'Yedekleme başlatıldı, Google Sheets\'e aktarılıyor...' });
      await triggerSetupBackup('8907');
      setPanelListMsg({ type: 'success', text: 'Yedekleme komutu başarıyla gönderildi!' });
      setTimeout(() => setPanelListMsg({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Yedekleme hatası:', err);
      setPanelListMsg({ type: 'error', text: 'Yedekleme sırasında bir hata oluştu.' });
      setTimeout(() => setPanelListMsg({ type: '', text: '' }), 5000);
    } finally {
      setBackupLoading(false);
    }
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [akademiToDelete, setAkademiToDelete] = useState(null);

  // Mouse cursor tracking for dynamic neon glow effect
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const fetchAkademiler = async () => {
      try {
        const res = await getAkademiler();
        if (res.data && res.data.length > 0) {
          setAkademiler(res.data);
        }
      } catch (err) {
        console.log('Akademiler yüklenirken varsayılan liste kullanıldı.');
      }
    };
    fetchAkademiler();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        setAkademiComboboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kullaniciAdi.trim() || !sifre.trim()) {
      setErrorMsg('Lütfen kullanıcı adı ve şifre giriniz.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await loginKullanici({
        kullanici_adi: kullaniciAdi.trim(),
        sifre: sifre.trim(),
        akademi_adi: selectedAkademi,
      });

      const responseData = res.data;
      const token = responseData.access_token;
      const userData = responseData.user || responseData;

      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(userData));

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (err) {
      console.error('Giriş hatası:', err);
      let detail = 'Giriş başarısız. Kullanıcı adı veya şifre hatalı!';
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        detail = 'Sunucuya bağlanılamadı (Zaman Aşımı). Lütfen arka plan servislerinin çalıştığından emin olun.';
      } else if (err.response?.data?.detail) {
        detail = err.response.data.detail;
      }
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  const fetchAkademilerDetayli = async () => {
    try {
      setPanelLoading(true);
      const res = await getAkademilerDetayli();
      if (res.data) {
        setAkademilerDetayli(res.data);
      }
    } catch (err) {
      console.error('Detaylı akademiler yüklenemedi:', err);
    } finally {
      setPanelLoading(false);
    }
  };

  const handleDeleteAkademiClick = (id, name) => {
    setAkademiToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAkademi = async () => {
    if (!akademiToDelete) return;
    try {
      await deleteAkademi(akademiToDelete.id);
      await fetchAkademilerDetayli();
      const akRes = await getAkademiler();
      if (akRes.data) setAkademiler(akRes.data);

      setPanelListMsg({ type: 'success', text: `'${akademiToDelete.name}' akademisi başarıyla silindi.` });
      setTimeout(() => setPanelListMsg({ type: '', text: '' }), 5000);
    } catch (err) {
      setPanelListMsg({ type: 'error', text: 'Akademi silinirken hata oluştu.' });
      setTimeout(() => setPanelListMsg({ type: '', text: '' }), 5000);
    } finally {
      setDeleteConfirmOpen(false);
      setAkademiToDelete(null);
    }
  };

  const handleSelectAkademiFromPanel = (akName) => {
    setSelectedAkademi(akName);
    setShowKurulumModal(false);
  };

  const handleOpenKurulumClick = () => {
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === '8907') {
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      setShowKurulumModal(true);
      setKurulumMsg({ type: '', text: '' });
      setPanelTab('list');
      fetchAkademilerDetayli();
    } else {
      setPinError('Kurulum yetkili şifresi hatalı! Erişim engellendi.');
    }
  };

  const handleKurulumSubmit = async (e) => {
    e.preventDefault();
    if (!kurulumForm.akademi_adi.trim() || !kurulumForm.kullanici_adi.trim() || !kurulumForm.sifre.trim()) {
      setKurulumMsg({ type: 'error', text: 'Lütfen akademi adı, kullanıcı adı ve şifre giriniz.' });
      return;
    }

    try {
      setKurulumLoading(true);
      setKurulumMsg({ type: '', text: '' });
      await kurAkademi({
        akademi_adi: kurulumForm.akademi_adi.trim(),
        ad_soyad: kurulumForm.ad_soyad.trim() || undefined,
        kullanici_adi: kurulumForm.kullanici_adi.trim(),
        sifre: kurulumForm.sifre.trim(),
      });

      // Güncel akademiler listesini yeniden çek
      const akRes = await getAkademiler();
      if (akRes.data && akRes.data.length > 0) {
        setAkademiler(akRes.data);
      }
      await fetchAkademilerDetayli();

      // Yeni oluşturulan akademiyi ve kullanıcı bilgilerini forma otomatik doldur
      const createdAkademiName = kurulumForm.akademi_adi.trim();
      const createdUsername = kurulumForm.kullanici_adi.trim();
      const createdPassword = kurulumForm.sifre.trim();

      setSelectedAkademi(createdAkademiName);
      setKullaniciAdi(createdUsername);
      setSifre(createdPassword);

      setKurulumMsg({ type: 'success', text: 'Akademi ve yönetici hesabı başarıyla oluşturuldu!' });

      setTimeout(() => {
        setPanelTab('list');
        setKurulumForm({ akademi_adi: '', ad_soyad: '', kullanici_adi: '', sifre: '' });
        setKurulumMsg({ type: '', text: '' });
      }, 1000);

    } catch (err) {
      console.error('Kurulum hatası:', err);
      let detail = 'Kurulum başarısız oldu.';
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        detail = 'Sunucuya bağlanılamadı (Zaman Aşımı). Lütfen arka plan servislerinin çalıştığından emin olun.';
      } else if (err.response?.data?.detail) {
        detail = err.response.data.detail;
      }
      setKurulumMsg({ type: 'error', text: detail });
    } finally {
      setKurulumLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans duration-300">

      {/* 1. Mouse Tracking Spotlight Gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          background: theme === 'light'
            ? `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(46, 184, 46, 0.16), rgba(2, 132, 199, 0.10) 45%, transparent 75%)`
            : `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(46, 184, 46, 0.20), rgba(2, 132, 199, 0.14) 45%, transparent 80%)`
        }}
      />

      {/* 2. Lagged Neon Green Blob Following Mouse */}
      <div
        className="absolute w-[320px] h-[320px] rounded-full blur-[70px] pointer-events-none transition-all duration-700 ease-out z-0 opacity-70 dark:opacity-80"
        style={{
          left: `${mousePos.x - 160}px`,
          top: `${mousePos.y - 160}px`,
          background: theme === 'light'
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0) 70%)'
            : 'radial-gradient(circle, rgba(46, 184, 46, 0.30) 0%, rgba(46, 184, 46, 0) 70%)'
        }}
      />

      {/* 3. Lagged Neon Blue Blob Following Mouse */}
      <div
        className="absolute w-[280px] h-[280px] rounded-full blur-[65px] pointer-events-none transition-all duration-1000 ease-out z-0 opacity-60 dark:opacity-75"
        style={{
          left: `${mousePos.x - 120}px`,
          top: `${mousePos.y - 120}px`,
          background: theme === 'light'
            ? 'radial-gradient(circle, rgba(2, 132, 199, 0.22) 0%, rgba(2, 132, 199, 0) 70%)'
            : 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(14, 165, 233, 0) 70%)'
        }}
      />

      {/* Top Right Theme Toggle Switch */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${theme === 'light'
            ? '/90 border-amber-300 text-amber-900 hover:bg-amber-100'
            : ' text-slate-200 hover:'
            }`}
          title={theme === 'light' ? 'Koyu Temaya Geç (Gece)' : 'Açık Temaya Geç (Gündüz)'}
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-600 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>
      </div>

      <div className="max-w-sm w-full space-y-4 z-10">

        {/* Header Branding */}
        <div className="text-center space-y-2 mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#2eb82e] to-[#0284c7] text-white shadow-lg shadow-emerald-500/20 mb-1">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-none">
            KU<span className="text-[#2eb82e]">YO</span>
          </h1>
          <div className="text-xs font-black text-sky-500 uppercase tracking-widest leading-none mt-1.5">
            Kurum Yönetim Sistemi
          </div>
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-2">
            Yönetici ve Personel Giriş Portalı
          </p>
        </div>

        {/* Login Form Card */}
        <div className="neo-card p-5 sm:p-6 space-y-4">

          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2eb82e]" />
              <span>Sisteme Giriş Yapın</span>
            </h2>
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full border">
              Güvenli Oturum
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 -transparent rounded-full flex items-center gap-2.5 text-xs font-semibold animate-shake bg-rose-600 hover:bg-rose-700 transition-colors text-white border-transparent shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Akademi Seçimi (Tek Entegre Aranabilir Kutu) */}
            <div className={`relative ${akademiComboboxOpen ? 'z-50' : ''}`} ref={comboboxRef}>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kurum Seçin
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-3 text-[#2eb82e] z-10" />
                <input
                  type="text"
                  value={
                    akademiComboboxOpen
                      ? akademiSearchQuery
                      : selectedAkademi ? `${selectedAkademi}` : ''
                  }
                  onChange={(e) => {
                    setAkademiSearchQuery(e.target.value);
                    if (!akademiComboboxOpen) setAkademiComboboxOpen(true);
                  }}
                  onFocus={() => {
                    setAkademiSearchQuery('');
                    setAkademiComboboxOpen(true);
                  }}
                  placeholder="Kurum ismi yazın veya seçin..."
                  className="w-full neo-input w-full rounded-full pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition cursor-pointer"
                />
                <ChevronDown className={`w-4 h-4 absolute right-3 top-3 text-slate-400 transition-transform duration-200 pointer-events-none ${akademiComboboxOpen ? 'rotate-180 text-[#2eb82e]' : ''}`} />
              </div>

              {/* Açılır Arama Listesi */}
              {akademiComboboxOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-xl rounded-2xl z-50 max-h-48 overflow-y-auto p-1.5 space-y-0.5 text-xs animate-scale-in custom-scrollbar">
                  {akademiler.filter((ak) => ak.name.toLowerCase().includes(akademiSearchQuery.toLowerCase().trim())).length > 0 ? (
                    akademiler
                      .filter((ak) => ak.name.toLowerCase().includes(akademiSearchQuery.toLowerCase().trim()))
                      .map((ak) => (
                        <button
                          key={ak.id || ak.name}
                          type="button"
                          onClick={() => {
                            setSelectedAkademi(ak.name);
                            setAkademiComboboxOpen(false);
                            setAkademiSearchQuery('');
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-bold transition cursor-pointer ${selectedAkademi === ak.name
                            ? 'bg-emerald-950/90 text-[#2eb82e] border border-emerald-800/80 '
                            : 'text-slate-900 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5 dark:hover:text-white'
                            }`}
                        >
                          <span>{ak.name}</span>
                          {selectedAkademi === ak.name && (
                            <Check className="w-3.5 h-3.5 text-[#2eb82e]" />
                          )}
                        </button>
                      ))
                  ) : (
                    <div className="p-3 text-center text-slate-400 dark:text-slate-500 italic text-[11px]">
                      Aranan kriterlere uygun akademi bulunamadı.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Kullanıcı Adı */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  className="w-full neo-input w-full rounded-full pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Şifre
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="w-full neo-input w-full rounded-full pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 neo-button-primary text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer"
            >
              <span>{loading ? 'Doğrulanıyor...' : 'Giriş Yap'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Setup Screen Button */}
          <div className="pt-2 border-t flex">
            <button
              type="button"
              onClick={handleOpenKurulumClick}
              className="w-full py-2 px-2.5 neo-button rounded-full text-[11px] font-bold transition flex items-center justify-center gap-1.5 group cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition shrink-0" />
              <span className="truncate">Kurulum Ekranı</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 font-medium">
          © 2026 KUYO Kurum Yönetim Sistemi - Tüm Hakları Saklıdır
        </div>

      </div>

      {/* ================= MODAL 1: Kurulum Ekranı Yetkili Şifresi Doğrulama (8907) ================= */}
      {showPinModal && (
        <div className="fixed inset-0 backdrop-blur-md z-[105] flex items-center justify-center p-4">
          <div className="neo-card max-w-xs w-full p-5 space-y-4 text-slate-800 dark:text-slate-100 animate-scale-in">
            <div className="flex justify-between items-center border-b pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Kurulum Yetkili Doğrulaması</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {pinError && (
              <div className="p-2.5 -transparent rounded-full flex items-center gap-2 text-xs font-semibold animate-shake bg-rose-600 hover:bg-rose-700 transition-colors text-white border-transparent shadow-sm">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kurulum Yetkili Şifresi
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    autoFocus
                    required
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="Şifreyi giriniz"
                    className="w-full neo-input w-full rounded-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3 py-1.5 neo-button text-xs font-semibold rounded-full transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 neo-button-primary text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Giriş Yap</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: Süper Yönetici & Akademi Yönetim Paneli ================= */}
      {showKurulumModal && (
        <div className="fixed inset-0 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="neo-card max-w-4xl w-full p-6 space-y-5 text-slate-800 dark:text-slate-100 animate-scale-in max-h-[90vh] flex flex-col">

            {/* Panel Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2eb82e]" />
                  <span>Süper Yönetici & Akademi Yönetim Paneli</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Sistemde hizmet veren akademileri görüntüleyin, yönetin ve yeni akademi kurulumu yapın.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowKurulumModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-2xl cursor-pointer p-1 transition"
              >
                &times;
              </button>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 neo-input rounded-full flex items-center gap-3">
                <div className="p-2.5 rounded-full shrink-0 bg-[#0284c7] hover:bg-[#026aa3] transition-colors text-white border-transparent shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Kayıtlı Akademiler</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{akademilerDetayli.length} Adet</div>
                </div>
              </div>

              <div className="p-3.5 neo-input rounded-full flex items-center gap-3">
                <div className="p-2.5 rounded-full shrink-0 bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Sistem Durumu</div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Canlı & Aktif</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 neo-input rounded-full flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Hızlı Eylem</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Yeni Akademi Kur</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelTab('create')}
                  className="p-2 rounded-full neo-button-primary transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 neo-input rounded-full flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Yedekleme</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Sistemi Yedekle</div>
                </div>
                <button
                  type="button"
                  onClick={handleManualBackup}
                  disabled={backupLoading}
                  className="p-2 rounded-full neo-button-primary transition cursor-pointer disabled:opacity-50"
                  title="Tüm veriyi Google Sheets'e yedekle"
                >
                  <RefreshCw className={`w-4 h-4 ${backupLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b gap-2">
              <button
                type="button"
                onClick={() => setPanelTab('list')}
                className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${panelTab === 'list'
                  ? 'border-[#2eb82e] text-[#2eb82e]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Kayıtlı Akademiler ({akademilerDetayli.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setPanelTab('create')}
                className={`pb-2.5 px-4 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${panelTab === 'create'
                  ? 'border-[#2eb82e] text-[#2eb82e]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Yeni Akademi & Yönetici Kur</span>
              </button>
            </div>

            {/* Tab 1: Kayıtlı Akademiler Listesi */}
            {panelTab === 'list' && (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">

                {panelListMsg.text && (
                  <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${panelListMsg.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200'
                    }`}>
                    {panelListMsg.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>{panelListMsg.text}</span>
                  </div>
                )}

                {/* Search Bar & Refresh */}
                <div className="flex justify-between items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={panelSearch}
                      onChange={(e) => setPanelSearch(e.target.value)}
                      placeholder="Akademi ismi veya yönetici kullanıcı adıyla ara..."
                      className="w-full neo-input w-full rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2eb82e]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchAkademilerDetayli}
                    className="p-2 hover: dark:hover: text-slate-600 dark:text-slate-300 rounded-full transition cursor-pointer"
                    title="Listeyi Yenile"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${panelLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Table */}
                <div className="neo-card overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b text-slate-600 dark:text-slate-400 font-bold">
                        <th className="p-3"># ID</th>
                        <th className="p-3">Akademi İsmi</th>
                        <th className="p-3">İlk Yönetici Hesabı</th>
                        <th className="p-3 text-center">İşlem / Girişe Aktar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {akademilerDetayli.filter(ak =>
                        ak.name.toLowerCase().includes(panelSearch.toLowerCase().trim()) ||
                        ak.admin_kullanici_adi.toLowerCase().includes(panelSearch.toLowerCase().trim())
                      ).length > 0 ? (
                        akademilerDetayli
                          .filter(ak =>
                            ak.name.toLowerCase().includes(panelSearch.toLowerCase().trim()) ||
                            ak.admin_kullanici_adi.toLowerCase().includes(panelSearch.toLowerCase().trim())
                          )
                          .map((ak) => (
                            <tr key={ak.id} className="hover: dark:hover: transition">
                              <td className="p-3 font-mono font-bold text-slate-400">#{ak.id}</td>
                              <td className="p-3 font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-[#2eb82e]" />
                                <span>{ak.name}</span>
                              </td>
                              <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-800 dark:text-slate-200 mr-1.5">
                                  @{ak.admin_kullanici_adi}
                                </span>
                                <span className="text-slate-400 font-normal">({ak.admin_ad_soyad})</span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAkademiFromPanel(ak.name)}
                                    className="px-3 py-1 dark: text-[#2eb82e] -transparent rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Girişe Aktar</span>
                                  </button>
                                  {akademilerDetayli.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAkademiClick(ak.id, ak.name)}
                                      className="p-1 dark: rounded-full transition cursor-pointer bg-rose-600 hover:bg-rose-700 transition-colors text-white border-transparent shadow-sm"
                                      title="Akademiyi Sil"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400 italic text-xs">
                            Aranan kriterlere uygun akademi kaydı bulunamadı.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: + Yeni Akademi Kurulumu Formu */}
            {panelTab === 'create' && (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {kurulumMsg.text && (
                  <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${kurulumMsg.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800  dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800  dark:text-emerald-200'
                    }`}>
                    {kurulumMsg.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>{kurulumMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleKurulumSubmit} className="space-y-3 max-w-lg mx-auto p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hizmet Alan Akademi İsmi *
                    </label>
                    <input
                      type="text"
                      required
                      value={kurulumForm.akademi_adi}
                      onChange={(e) => setKurulumForm({ ...kurulumForm, akademi_adi: e.target.value })}
                      placeholder="Örn: Pusula Spor Akademisi"
                      className="w-full neo-input w-full rounded-full px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2eb82e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Yönetici Adı Soyadı (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={kurulumForm.ad_soyad}
                      onChange={(e) => setKurulumForm({ ...kurulumForm, ad_soyad: e.target.value })}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full neo-input w-full rounded-full px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2eb82e]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        İlk Kullanıcı Adı *
                      </label>
                      <input
                        type="text"
                        required
                        value={kurulumForm.kullanici_adi}
                        onChange={(e) => setKurulumForm({ ...kurulumForm, kullanici_adi: e.target.value })}
                        placeholder="Örn: ahmet"
                        className="w-full neo-input w-full rounded-full px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2eb82e]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        İlk Şifre *
                      </label>
                      <input
                        type="password"
                        required
                        value={kurulumForm.sifre}
                        onChange={(e) => setKurulumForm({ ...kurulumForm, sifre: e.target.value })}
                        placeholder="Örn: 123456"
                        className="w-full neo-input w-full rounded-full px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2eb82e]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setPanelTab('list')}
                      className="px-3.5 py-2 neo-button text-xs font-semibold rounded-full transition cursor-pointer"
                    >
                      İptal / Listeye Dön
                    </button>
                    <button
                      type="submit"
                      disabled={kurulumLoading}
                      className="px-4 py-2 bg-gradient-to-r from-[#2eb82e] to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-full transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>{kurulumLoading ? 'Kuruluyor...' : 'Akademiyi Oluştur'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL: Confirm Delete Akademi ================= */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Akademi Silme Onayı"
        message={akademiToDelete ? `'${akademiToDelete.name}' akademisini sistemden silmek istediğinize emin misiniz?` : ''}
        confirmText="Evet, Akademiyi Sil"
        cancelText="İptal"
        type="danger"
        requireHold={false}
        onConfirm={confirmDeleteAkademi}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setAkademiToDelete(null);
        }}
      />
    </div>
  );
};

export default Login;
