import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Wallet, ArrowUpRight, TrendingUp, Plus, Trash2, X, Eye, UserPlus, Calendar, Clock } from 'lucide-react';
import { getOgrenciler, getSiniflar, createSinif, deleteSinif, getSinifOgrencileri, getOnKayitlar, createDersProgrami, deleteDersProgrami, getDersProgrami, getKullanicilar } from '../services/api';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import HaftalikDersCizelgesi from '../components/HaftalikDersCizelgesi';
import { formatTL } from '../utils/formatters';

const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const RENK_OPTIONS = [
 { label: 'İndigo', value: 'indigo', bg: 'bg-indigo-100/90 border-indigo-300 text-indigo-950 dark:bg-indigo-950/80 dark:border-indigo-700/80 dark:text-indigo-200 ' },
 { label: 'Zümrüt', value: 'emerald', bg: 'bg-emerald-100/90 border-emerald-300 text-emerald-950 dark:bg-emerald-950/80 dark:border-emerald-700/80 dark:text-emerald-200 ' },
 { label: 'Turuncu', value: 'amber', bg: 'bg-amber-100/90 border-amber-300 text-amber-950 dark:bg-amber-950/80 dark:border-amber-700/80 dark:text-amber-200 ' },
 { label: 'Mor', value: 'purple', bg: 'bg-purple-100/90 border-purple-300 text-purple-950 dark:bg-purple-950/80 dark:border-purple-700/80 dark:text-purple-200 ' },
 { label: 'Mavi', value: 'sky', bg: 'bg-sky-100/90 border-sky-300 text-sky-950 dark:bg-sky-950/80 dark:border-sky-700/80 dark:text-sky-200 ' },
 { label: 'Gül', value: 'rose', bg: 'bg-rose-100/90 border-rose-300 text-rose-950 dark:bg-rose-950/80 dark:border-rose-700/80 dark:text-rose-200 ' },
 { label: 'Yeşil', value: 'green', bg: 'bg-green-100/90 border-green-300 text-green-950 dark:bg-emerald-900/70 dark:border-emerald-600/80 dark:text-emerald-200 ' },
 { label: 'Sarı', value: 'yellow', bg: 'bg-yellow-100/90 border-yellow-300 text-yellow-950 dark:bg-yellow-950/80 dark:border-yellow-600/80 dark:text-yellow-200 ' },
 { label: 'Kırmızı', value: 'red', bg: 'bg-red-100/90 border-red-300 text-red-950 dark:bg-red-950/80 dark:border-red-600/80 dark:text-red-200 ' }
];

const Dashboard = () => {
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
 const [dersProgrami, setDersProgrami] = useState([]);
 const [expandedGun, setExpandedGun] = useState(null);
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

 const [teachersList, setTeachersList] = useState([]);
 const fetchTeachers = async () => {
 try {
 const res = await getKullanicilar();
 const ogretmenler = res.data.filter(k => k.rol === 'Öğretmen');
 setTeachersList(ogretmenler);
 } catch (err) {
 console.error('Öğretmenler yüklenirken hata:', err);
 }
 };

 useEffect(() => {
 loadDashboardData();
 fetchTeachers();
 }, []);

 const loadDashboardData = async () => {
 try {
 setLoading(true);
 const [ogrenciRes, sinifRes, onKayitRes, dersRes] = await Promise.all([
 getOgrenciler(),
 getSiniflar(),
 getOnKayitlar(),
 getDersProgrami()
 ]);
 
 const ogrenciler = ogrenciRes.data || [];
 const siniflar = sinifRes.data || [];
 const onKayitlar = onKayitRes.data || [];
 const dersler = dersRes.data || [];

 setOgrenciCount(ogrenciler.length);
 setSinifCount(siniflar.length);
 setOnKayitCount(onKayitlar.length);
 setSiniflarList(siniflar);

 setDersProgrami(dersler);

 const sortedOgrenciler = [...ogrenciler].sort((a, b) => new Date(b.kayit_tarihi) - new Date(a.kayit_tarihi));
 setRecentOgrenciler(sortedOgrenciler.slice(0, 5));
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
 return teachersList.map(t => ({ isim: t.ad_soyad, soyisim: '' }));
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
 {/* Header Banner */}
 <div className="neo-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hoş Geldiniz 👋</h1>
 <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kurum öğrenci, yoklama ve finans süreçlerinizi buradan yönetin.</p>
 </div>
  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 md:mt-0">
  <Link
  to="/kayit"
  className="px-4 py-2.5 bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white font-bold text-sm rounded-full transition -emerald-900/20 flex items-center justify-center gap-2 w-full sm:w-auto"
  >
  <span>Yeni Öğrenci Ekle</span>
  <ArrowUpRight className="w-4 h-4" />
  </Link>
  <Link
  to="/finans"
  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 transition-colors text-white font-bold text-sm rounded-full transition -sky-900/20 flex items-center justify-center gap-2 w-full sm:w-auto"
  >
  <span>Ödeme Girişi</span>
  <Wallet className="w-4 h-4" />
  </Link>
 </div>
 </div>

 {/* KPI Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 
 {/* Total Ogrenci Card */}
 <Link 
 to="/kayit" 
 className="neo-card p-6 rounded-full hover:-[#2eb82e] hover:scale-[1.01] transition block group"
 >
 <div className="flex justify-between items-center">
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider group-hover:text-[#2eb82e] transition">TOPLAM ÖĞRENCİ</p>
 <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{loading ? '...' : ogrenciCount}</h3>
 </div>
 <div className="w-12 h-12 rounded-full -transparent text-[#2eb82e] flex items-center justify-center shrink-0 bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">
 <Users className="w-6 h-6" />
 </div>
 </div>
 <div className="mt-4 flex items-center text-xs text-[#2eb82e] font-semibold gap-1">
 <TrendingUp className="w-4 h-4 shrink-0" />
 <span>Kayıtlı Öğrenci Listesi →</span>
 </div>
 </Link>

 {/* Aktif Sinif & Brans Card - CLICKABLE */}
 <Link to="/siniflar"
 className="neo-card p-6 rounded-full hover:-sky-500 hover:scale-[1.01] transition cursor-pointer group"
 title="Tıklayarak sınıfları görüntüleyin ve yönetin"
 >
 <div className="flex justify-between items-center">
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider group-hover:text-sky-500 transition">AKTİF SINIF & BRANŞ</p>
 <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{loading ? '...' : sinifCount}</h3>
 </div>
 <div className="w-12 h-12 rounded-full -transparent flex items-center justify-center shrink-0 bg-[#0284c7] hover:bg-[#026aa3] transition-colors text-white border-transparent shadow-sm">
 <BookOpen className="w-6 h-6" />
 </div>
 </div>
 <div className="mt-4 flex items-center text-xs text-sky-500 font-semibold gap-1">
 <TrendingUp className="w-4 h-4 shrink-0" />
 <span>Sınıfları Görüntüle & Yönet →</span>
 </div>
 </Link>

 {/* Ön Kayıt Adaylar Card */}
 <Link 
 to="/on-kayit" 
 className="neo-card p-6 rounded-full hover:-emerald-500 hover:scale-[1.01] transition block group"
 >
 <div className="flex justify-between items-center">
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider group-hover:text-emerald-500 transition">ÖN KAYIT ADAY LİSTESİ</p>
 <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{loading ? '...' : onKayitCount}</h3>
 </div>
 <div className="w-12 h-12 rounded-full -transparent flex items-center justify-center shrink-0 bg-[#2eb82e] hover:bg-[#269926] transition-colors text-white border-transparent shadow-sm">
 <UserPlus className="w-6 h-6" />
 </div>
 </div>
 <div className="mt-4 flex items-center text-xs text-emerald-500 font-semibold gap-1">
 <TrendingUp className="w-4 h-4 shrink-0" />
 <span>Ön Kayıtları Görüntüle →</span>
 </div>
 </Link>
 </div>

 <div className="mt-8">
 <HaftalikDersCizelgesi 
 dersProgrami={dersProgrami}
 expandedGun={expandedGun}
 setExpandedGun={setExpandedGun}
 readonly={true}
 />
 </div>

 {/* Recent Activity Table */}
 <div className="neo-card rounded-2xl p-6">
 <div className="flex justify-between items-center mb-5">
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <span>Son Kaydolan Öğrenciler</span>
 </h2>
 <Link to="/kayit" className="text-sm font-semibold text-[#2eb82e] hover:underline">
 Tümünü Gör →
 </Link>
 </div>

  <div className="hidden md:block overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
 <th className="py-3 px-4 whitespace-nowrap">ÖĞRENCİ ADI SOYADI</th>
 <th className="py-3 px-4 whitespace-nowrap">TELEFON</th>
 <th className="py-3 px-4 min-w-[220px]">ANNE / BABA VELİ</th>
 {isAdmin && <th className="py-3 px-4 text-right whitespace-nowrap">BAKİYE</th>}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60 text-sm">
 {loading ? (
 <tr>
 <td colSpan={isAdmin ? 4 : 3} className="text-center py-6 text-slate-400">Yükleniyor...</td>
 </tr>
 ) : recentOgrenciler.length === 0 ? (
 <tr>
 <td colSpan={isAdmin ? 4 : 3} className="text-center py-6 text-slate-400">Henüz öğrenci kaydı bulunamadı.</td>
 </tr>
 ) : (
 recentOgrenciler.map((o) => (
 <tr key={o.id} className="hover: dark:hover: transition">
 <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{o.isim} {o.soyisim}</td>
 <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{o.telefon || '-'}</td>
 <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 space-y-0.5 min-w-[220px]">
 <div>
 <strong className="text-slate-700 dark:text-slate-300">Anne:</strong> {o.anne_isim || '-'}
 {o.anne_meslek && <span className="text-sky-600 font-medium"> ({o.anne_meslek})</span>}
 {o.anne_telefon && <span> ({o.anne_telefon})</span>}
 </div>
 <div>
 <strong className="text-slate-700 dark:text-slate-300">Baba:</strong> {o.baba_isim || '-'}
 {o.baba_meslek && <span className="text-sky-600 font-medium"> ({o.baba_meslek})</span>}
 {o.baba_telefon && <span> ({o.baba_telefon})</span>}
 </div>
 </td>
 {isAdmin && <td className="py-3.5 px-4 font-bold text-[#2eb82e] text-right whitespace-nowrap">₺{formatTL(o.bakiye)}</td>}
 </tr>
 ))
 )}
 </tbody>
 </table>
  </div>

  {/* Mobil Kart Görünümü */}
  <div className="md:hidden space-y-4 mt-4">
  {loading ? (
    <div className="text-center py-6 text-slate-400 text-sm">Yükleniyor...</div>
  ) : recentOgrenciler.length === 0 ? (
    <div className="text-center py-6 text-slate-400 text-sm">Henüz öğrenci kaydı bulunamadı.</div>
  ) : (
    recentOgrenciler.map((o) => (
      <div key={o.id} className="neo-card p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 shadow-sm bg-white dark:bg-[#15181e]">
         <div className="flex justify-between items-center border-b pb-2 border-slate-100 dark:border-slate-800/60">
           <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{o.isim} {o.soyisim}</span>
         </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold w-12 shrink-0">Telefon:</span> 
            <span>{o.telefon || '-'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold w-12 shrink-0">Anne:</span> 
            <div className="flex flex-col">
              <span>{o.anne_isim || '-'} {o.anne_meslek && <span className="text-sky-600">({o.anne_meslek})</span>}</span>
              {o.anne_telefon && <span className="text-slate-500">{o.anne_telefon}</span>}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold w-12 shrink-0">Baba:</span> 
            <div className="flex flex-col">
              <span>{o.baba_isim || '-'} {o.baba_meslek && <span className="text-sky-600">({o.baba_meslek})</span>}</span>
              {o.baba_telefon && <span className="text-slate-500">{o.baba_telefon}</span>}
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Bakiye:</span>
            <span className="font-bold text-[#2eb82e] text-sm">₺{formatTL(o.bakiye)}</span>
          </div>
        )}
      </div>
    ))
  )}
  </div>
 </div>

 </div>
 );
};

export default Dashboard;
