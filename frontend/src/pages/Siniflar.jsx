import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Wallet, ArrowUpRight, TrendingUp, Plus, Trash2, X, Eye, UserPlus, Calendar, Clock } from 'lucide-react';
import { getOgrenciler, getSiniflar, createSinif, deleteSinif, getSinifOgrencileri, getOnKayitlar, createDersProgrami, deleteDersProgrami } from '../services/api';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { formatTL } from '../utils/formatters';

const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const RENK_OPTIONS = [
  { label: 'İndigo', value: 'indigo', bg: 'bg-indigo-100/90 border-indigo-300 text-indigo-950 dark:bg-indigo-950/80 dark:border-indigo-700/80 dark:text-indigo-200 shadow-sm' },
  { label: 'Zümrüt', value: 'emerald', bg: 'bg-emerald-100/90 border-emerald-300 text-emerald-950 dark:bg-emerald-950/80 dark:border-emerald-700/80 dark:text-emerald-200 shadow-sm' },
  { label: 'Turuncu', value: 'amber', bg: 'bg-amber-100/90 border-amber-300 text-amber-950 dark:bg-amber-950/80 dark:border-amber-700/80 dark:text-amber-200 shadow-sm' },
  { label: 'Mor', value: 'purple', bg: 'bg-purple-100/90 border-purple-300 text-purple-950 dark:bg-purple-950/80 dark:border-purple-700/80 dark:text-purple-200 shadow-sm' },
  { label: 'Mavi', value: 'sky', bg: 'bg-sky-100/90 border-sky-300 text-sky-950 dark:bg-sky-950/80 dark:border-sky-700/80 dark:text-sky-200 shadow-sm' },
  { label: 'Gül', value: 'rose', bg: 'bg-rose-100/90 border-rose-300 text-rose-950 dark:bg-rose-950/80 dark:border-rose-700/80 dark:text-rose-200 shadow-sm' },
  { label: 'Yeşil', value: 'green', bg: 'bg-green-100/90 border-green-300 text-green-950 dark:bg-emerald-900/70 dark:border-emerald-600/80 dark:text-emerald-200 shadow-sm' },
  { label: 'Sarı', value: 'yellow', bg: 'bg-yellow-100/90 border-yellow-300 text-yellow-950 dark:bg-yellow-950/80 dark:border-yellow-600/80 dark:text-yellow-200 shadow-sm' },
  { label: 'Kırmızı', value: 'red', bg: 'bg-red-100/90 border-red-300 text-red-950 dark:bg-red-950/80 dark:border-red-600/80 dark:text-red-200 shadow-sm' }
];

const Siniflar = () => {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();
  const roleLower = (currentUser?.rol || '').toLowerCase();
  const isAdmin = roleLower.includes('yönetici') || roleLower.includes('yonetici') || roleLower.includes('admin') || roleLower.includes('super') || roleLower.includes('süper');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Evet',
    onConfirm: () => {}
  });

  const openConfirm = ({ title, message, type = 'danger', confirmText = 'Evet, Onayla', onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await onConfirm();
      }
    });
  };

  const [ogrenciCount, setOgrenciCount] = useState(0);
  const [sinifCount, setSinifCount] = useState(0);
  const [onKayitCount, setOnKayitCount] = useState(0);
  const [recentOgrenciler, setRecentOgrenciler] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sınıflar Modal State
  const [showSiniflarModal, setShowSiniflarModal] = useState(false);
  const [siniflarList, setSiniflarList] = useState([]);
  const [siniflarLoading, setSiniflarLoading] = useState(false);

  // Sınıf Ekleme Sub-Modal State
  const [showEkleModal, setShowEkleModal] = useState(false);
  const [yeniSinifAdi, setYeniSinifAdi] = useState('');
  const [addSchedule, setAddSchedule] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    gun: 'Pazartesi',
    baslangic_saati: '10:00',
    bitis_saati: '11:30',
    ogretmen_adi: '',
    renk: 'indigo'
  });

  // Sınıf Ders Saati Ata/Düzenle Modal State
  const [selectedSinifSchedule, setSelectedSinifSchedule] = useState(null);
  const [newScheduleForm, setNewScheduleForm] = useState({
    gun: 'Pazartesi',
    baslangic_saati: '10:00',
    bitis_saati: '11:30',
    ders_adi: '',
    ogretmen_adi: '',
    renk: 'indigo'
  });

  // Sınıf Öğrencileri Detay Modal State
  const [selectedSinifDetay, setSelectedSinifDetay] = useState(null);
  const [sinifOgrencileriList, setSinifOgrencileriList] = useState([]);
  const [detayLoading, setDetayLoading] = useState(false);

  useEffect(() => {
    fetchSiniflarModal();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ogrenciRes, sinifRes, onKayitRes] = await Promise.all([
        getOgrenciler(),
        getSiniflar(),
        getOnKayitlar()
      ]);
      
      const ogrenciler = ogrenciRes.data || [];
      const siniflar = sinifRes.data || [];
      const onKayitlar = onKayitRes.data || [];

      setOgrenciCount(ogrenciler.length);
      setSinifCount(siniflar.length);
      setOnKayitCount(onKayitlar.length);
      setSiniflarList(siniflar);

      setRecentOgrenciler(ogrenciler.slice(-5).reverse());
    } catch (err) {
      console.error('Dashboard veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiniflarModal = async () => {
    try {
      setSiniflarLoading(true);
      const res = await getSiniflar();
      setSiniflarList(res.data || []);
      setSinifCount((res.data || []).length);
    } catch (err) {
      console.error('Sınıflar yüklenemedi:', err);
    } finally {
      setSiniflarLoading(false);
    }
  };

  const openSiniflarModal = () => {
    setShowSiniflarModal(true);
    fetchSiniflarModal();
  };

  const getRegisteredTeachers = () => {
    try {
      const saved = localStorage.getItem('system_teachers');
      return saved ? JSON.parse(saved) : [
        { id: 1, isim: 'Ahmet Yılmaz', brans: 'Piyano & Solfej' },
        { id: 2, isim: 'Elif Kaya', brans: 'Keman & Müzik Teorisi' },
        { id: 3, isim: 'Caner Öztürk', brans: 'Dans & Koreografi' }
      ];
    } catch {
      return [
        { id: 1, isim: 'Ahmet Yılmaz', brans: 'Piyano & Solfej' },
        { id: 2, isim: 'Elif Kaya', brans: 'Keman & Müzik Teorisi' },
        { id: 3, isim: 'Caner Öztürk', brans: 'Dans & Koreografi' }
      ];
    }
  };

  const handleCreateSinif = async (e) => {
    e.preventDefault();
    if (!yeniSinifAdi.trim()) return;
    try {
      const payload = { sinif_adi: yeniSinifAdi.trim() };
      const teacherName = scheduleData.ogretmen_adi ? scheduleData.ogretmen_adi.trim() : null;

      if (addSchedule && scheduleData.gun && scheduleData.baslangic_saati && scheduleData.bitis_saati) {
        payload.gun = scheduleData.gun;
        payload.baslangic_saati = scheduleData.baslangic_saati;
        payload.bitis_saati = scheduleData.bitis_saati;
        payload.ogretmen_adi = teacherName;
        payload.renk = scheduleData.renk;
      } else if (teacherName) {
        payload.gun = 'Pazartesi';
        payload.baslangic_saati = '10:00';
        payload.bitis_saati = '11:30';
        payload.ogretmen_adi = teacherName;
        payload.renk = 'indigo';
      }

      await createSinif(payload);
      setYeniSinifAdi('');
      setAddSchedule(false);
      setScheduleData({
        gun: 'Pazartesi',
        baslangic_saati: '10:00',
        bitis_saati: '11:30',
        ogretmen_adi: '',
        renk: 'indigo'
      });
      setShowEkleModal(false);
      await fetchSiniflarModal();
      showToast(`"${yeniSinifAdi.trim()}" sınıfı ${teacherName ? `(${teacherName} öğretmen ataması ile) ` : ''}başarıyla oluşturuldu!`);
    } catch (err) {
      showToast('Hata: Sınıf oluşturulamadı.', 'error');
    }
  };

  const handleDeleteSinif = (id, name) => {
    openConfirm({
      title: 'Sınıf Silme Onayı',
      message: `"${name}" sınıfını ve tüm ilişkili kayıtları silmek istediğinize emin misiniz?`,
      type: 'danger',
      confirmText: 'Sınıfı Sil',
      onConfirm: async () => {
        try {
          await deleteSinif(id);
          showToast(`"${name}" sınıfı başarıyla silindi.`);
          await fetchSiniflarModal();
        } catch (err) {
          console.error('Sınıf silinemedi:', err);
          showToast('Sınıf silinirken bir hata oluştu.', 'error');
        }
      }
    });
  };

  const handleAddScheduleSlot = async (e) => {
    e.preventDefault();
    if (!selectedSinifSchedule) return;
    try {
      await createDersProgrami({
        sinif_id: selectedSinifSchedule.id,
        gun: newScheduleForm.gun,
        baslangic_saati: newScheduleForm.baslangic_saati,
        bitis_saati: newScheduleForm.bitis_saati,
        ders_adi: newScheduleForm.ders_adi || selectedSinifSchedule.sinif_adi,
        ogretmen_adi: newScheduleForm.ogretmen_adi,
        renk: newScheduleForm.renk
      });
      await fetchSiniflarModal();
      const updatedRes = await getSiniflar();
      const match = (updatedRes.data || []).find(s => s.id === selectedSinifSchedule.id);
      if (match) setSelectedSinifSchedule(match);
      setNewScheduleForm({
        gun: 'Pazartesi',
        baslangic_saati: '10:00',
        bitis_saati: '11:30',
        ders_adi: '',
        ogretmen_adi: '',
        renk: 'indigo'
      });
    } catch (err) {
      console.error('Ders saati atanamadı:', err);
    }
  };

  const handleDeleteScheduleSlot = (slotId) => {
    openConfirm({
      title: 'Ders Saati Silme Onayı',
      message: 'Bu ders saatini silmek istediğinize emin misiniz?',
      type: 'danger',
      confirmText: 'Ders Saatini Sil',
      onConfirm: async () => {
        try {
          await deleteDersProgrami(slotId);
          await fetchSiniflarModal();
          const updatedRes = await getSiniflar();
          const match = (updatedRes.data || []).find(s => s.id === selectedSinifSchedule.id);
          if (match) setSelectedSinifSchedule(match);
        } catch (err) {
          console.error('Ders saati silinemedi:', err);
        }
      }
    });
  };

  const openSinifDetayModal = async (sinif) => {
    setSelectedSinifDetay(sinif);
    setSinifOgrencileriList([]);
    setDetayLoading(true);
    try {
      const res = await getSinifOgrencileri(sinif.id);
      setSinifOgrencileriList(res.data?.ogrenciler || []);
    } catch (err) {
      console.error('Sınıf öğrencileri yüklenemedi:', err);
    } finally {
      setDetayLoading(false);
    }
  };

    return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-md flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-500" />
            Mevcut Sınıflar & Branşlar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sınıflarınızı, öğretmen atamalarını ve ders programlarını yönetin.
          </p>
        </div>
        <button
          onClick={() => setShowEkleModal(true)}
          className="px-4 py-2 bg-[#2eb82e] hover:bg-[#269926] text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-900/30 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Sınıf Ekle</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
{/* Modal Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider bg-slate-50 dark:bg-slate-900/50">
                    <th className="py-3 px-4">SINIF ID</th>
                    <th className="py-3 px-4">SINIF / BRANŞ ADI</th>
                    <th className="py-3 px-4">TÜM ATANAN DERS SAATLERİ</th>
                    <th className="py-3 px-4">KAYITLI ÖĞRENCİ</th>
                    <th className="py-3 px-4 text-right">İŞLEMLER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60 text-sm">
                  {siniflarLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">Sınıflar yükleniyor...</td>
                    </tr>
                  ) : siniflarList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">Henüz kayıtlı sınıf yok.</td>
                    </tr>
                  ) : (
                    siniflarList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-500">#{s.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                          <span className="bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            {s.sinif_adi}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {!s.ders_programi || s.ders_programi.length === 0 ? (
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">Henüz saat atanmadı</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {s.ders_programi.map(dp => (
                                <span key={dp.id} className="bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/80 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#2eb82e]" />
                                  <span>{dp.gun} ({dp.baslangic_saati}-{dp.bitis_saati})</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">
                          {s.ogrenci_sayisi || 0} Öğrenci
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedSinifSchedule(s)}
                            className="px-2.5 py-1.5 bg-sky-100 dark:bg-sky-900/80 hover:bg-sky-200 dark:hover:bg-sky-800 text-sky-800 dark:text-sky-200 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 border border-sky-300 dark:border-sky-700 cursor-pointer"
                            title="Ders Gün/Saat Ata & Yönet"
                          >
                            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300" />
                            <span>Ders Saati Ata</span>
                          </button>
                          <button
                            onClick={() => openSinifDetayModal(s)}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 border border-slate-300 dark:border-slate-600 cursor-pointer"
                            title="Sınıftaki Öğrencileri Gör"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-500" />
                            <span>Öğrenciler</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSinif(s.id, s.sinif_adi)}
                            className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/80 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                            title="Sınıfı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Sil</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
      </div>
    </div>
  );
}

export default Siniflar;
