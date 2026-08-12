import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Wallet, ArrowUpRight, TrendingUp, Plus, Trash2, X, Eye, UserPlus, Calendar, Clock } from 'lucide-react';
import { getOgrenciler, getSiniflar, getSiniflarBasic, createSinif, deleteSinif, getSinifOgrencileri, getOnKayitlar, createDersProgrami, deleteDersProgrami } from '../services/api';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import SearchableSelect from '../components/SearchableSelect';
import TimePicker from '../components/TimePicker';
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
 
 // 1. Temel bilgileri anında yükle
 const basicRes = await getSiniflarBasic();
 setSiniflarList(basicRes.data || []);
 setSinifCount((basicRes.data || []).length);
 setSiniflarLoading(false);

 // 2. Arka planda genişletilmiş verileri yükle
 getSiniflar().then(fullRes => {
 setSiniflarList(fullRes.data || []);
 }).catch(err => console.error("Genişletilmiş sınıflar yüklenemedi", err));
 
 } catch (err) {
 console.error('Sınıflar yüklenemedi:', err);
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
 <div className="neo-card p-6 rounded-2xl flex justify-between items-center transition-colors">
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
 className="px-4 py-2 bg-[#2eb82e] hover:bg-[#269926] text-white font-bold text-sm rounded-xl transition flex items-center gap-2 -emerald-900/30 cursor-pointer"
 >
 <Plus className="w-5 h-5" />
 <span>Yeni Sınıf Ekle</span>
 </button>
 </div>
 <div className="neo-card rounded-2xl p-6">
{/* Modal Table */}
 <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/50">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
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
 <tr key={s.id} className="hover: dark:hover: transition">
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
 className="px-2.5 py-1.5 hover: dark:hover: text-slate-800 dark:text-slate-100 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 border cursor-pointer"
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
 
      {/* ================= MODAL: Yeni Sınıf Ekle Sub-Modal ================= */}
      {showEkleModal && (
        <div className="fixed inset-0 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="neo-card max-w-md w-full p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#2eb82e]" />
                <span>Yeni Sınıf / Branş Oluştur</span>
              </h3>
              <button onClick={() => setShowEkleModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleCreateSinif} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sınıf / Branş Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Piyano 101, Dans A Grubu"
                  value={yeniSinifAdi}
                  onChange={(e) => setYeniSinifAdi(e.target.value)}
                  className="neo-input w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sınıfa Atanacak Öğretmen
                </label>
                <SearchableSelect
  value={scheduleData.ogretmen_adi}
  onChange={(val) => setScheduleData({ ...scheduleData, ogretmen_adi: val })}
  options={getRegisteredTeachers().map(t => ({ value: `${t.isim} ${t.soyisim || ""}`.trim(), label: `${t.isim} ${t.soyisim || ""}`.trim() }))}
  placeholder="-- Öğretmen Seçin (Opsiyonel) --"
  searchPlaceholder="Öğretmen ara..."
/>
              </div>

              {/* İsteğe bağlı Ders Programı Atama Checkbox */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div 
                    onClick={() => setAddSchedule(!addSchedule)}
                    className="flex items-center justify-between p-3 neo-input rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Ders Programına Gün & Saat Atansın mı?</span>
                    <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${addSchedule ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${addSchedule ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </div>
                  </div>
              </div>

              {addSchedule && (
                <div className="space-y-3 p-3 neo-input rounded-xl border border-sky-500/30 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gün Seçiniz</label>
                    <select
                      value={scheduleData.gun}
                      onChange={(e) => setScheduleData({ ...scheduleData, gun: e.target.value })}
                      className="neo-input w-full px-3 py-2 rounded-lg font-bold"
                    >
                      {GUNLER.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Başlangıç Saati</label>
                      <TimePicker 
                          value={scheduleData.baslangic_saati}
                          onChange={(val) => setScheduleData({ ...scheduleData, baslangic_saati: val })}
                        />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bitiş Saati</label>
                      <TimePicker 
                          value={scheduleData.bitis_saati}
                          onChange={(val) => setScheduleData({ ...scheduleData, bitis_saati: val })}
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kart Rengi</label>
                    <select
                      value={scheduleData.renk}
                      onChange={(e) => setScheduleData({ ...scheduleData, renk: e.target.value })}
                      className="neo-input w-full px-3 py-1.5 rounded-lg font-bold"
                    >
                      {RENK_OPTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEkleModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2eb82e] hover:bg-[#269926] text-white text-xs font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {/* ================= MODAL: Sınıf Ders Saati Ata & Yönet ================= */}
      {selectedSinifSchedule && (
        <div className="fixed inset-0 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="neo-card max-w-lg w-full p-6 rounded-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                <span>"{selectedSinifSchedule.sinif_adi}" İçin Ders Saati Ata</span>
              </h3>
              <button onClick={() => setSelectedSinifSchedule(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            {/* Mevcut Ders Saatleri */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Mevcut Atanmış Saatler</h4>
              {!selectedSinifSchedule.ders_programi || selectedSinifSchedule.ders_programi.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">Bu sınıfa henüz bir ders günü/saati atanmadı.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedSinifSchedule.ders_programi.map(dp => (
                    <div key={dp.id} className="flex justify-between items-center p-2.5 neo-input rounded-xl text-xs">
                      <div>
                        <strong className="text-sky-600 dark:text-sky-300 font-extrabold">{dp.gun}</strong>
                        <span className="text-slate-700 dark:text-slate-300 ml-2">{dp.baslangic_saati} - {dp.bitis_saati}</span>
                        {dp.ogretmen_adi && <span className="text-slate-500 dark:text-slate-400 ml-2">({dp.ogretmen_adi})</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteScheduleSlot(dp.id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 p-1 rounded transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Yeni Ders Saati Ekleme Formu */}
            <form onSubmit={handleAddScheduleSlot} className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">+ Yeni Ders Saati Ekle</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gün</label>
                  <select
                    value={newScheduleForm.gun}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, gun: e.target.value })}
                    className="neo-input w-full px-3 py-2 rounded-xl text-xs font-bold"
                  >
                    {GUNLER.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kart Rengi</label>
                  <select
                    value={newScheduleForm.renk}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, renk: e.target.value })}
                    className="neo-input w-full px-3 py-2 rounded-xl text-xs font-bold"
                  >
                    {RENK_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Başlangıç Saati</label>
                  <TimePicker 
                      value={newScheduleForm.baslangic_saati}
                      onChange={(val) => setNewScheduleForm({ ...newScheduleForm, baslangic_saati: val })}
                    />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bitiş Saati</label>
                  <TimePicker 
                      value={newScheduleForm.bitis_saati}
                      onChange={(val) => setNewScheduleForm({ ...newScheduleForm, bitis_saati: val })}
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Eğitmen / Öğretmen (Opsiyonel)</label>
                <SearchableSelect
  value={newScheduleForm.ogretmen_adi}
  onChange={(val) => setNewScheduleForm({ ...newScheduleForm, ogretmen_adi: val })}
  options={getRegisteredTeachers().map(t => ({ value: `${t.isim} ${t.soyisim || ""}`.trim(), label: `${t.isim} ${t.soyisim || ""}`.trim() }))}
  placeholder="-- Öğretmen Seçin (Opsiyonel) --"
  searchPlaceholder="Öğretmen ara..."
/>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedSinifSchedule(null)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Saat Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {/* ================= MODAL: Sınıf Öğrencileri Detay Listesi ================= */}
      {selectedSinifDetay && (
        <div className="fixed inset-0 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="neo-card max-w-5xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-2xl space-y-4 relative">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-500" />
                <span>"{selectedSinifDetay.sinif_adi}" Sınıfındaki Öğrenciler</span>
              </h3>
              <button onClick={() => setSelectedSinifDetay(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3 px-4">ÖĞRENCİ ID / TC</th>
                    <th className="py-3 px-4">ADI SOYADI</th>
                    <th className="py-3 px-4">İLETİŞİM</th>
                    <th className="py-3 px-4">VELİ BİLGİSİ</th>
                    <th className="py-3 px-4">DERS HAKKI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60 text-sm">
                  {detayLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">Öğrenciler yükleniyor...</td>
                    </tr>
                  ) : sinifOgrencileriList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">Bu sınıfa henüz kayıtlı öğrenci yok.</td>
                    </tr>
                  ) : (
                    sinifOgrencileriList.map((o) => (
                      <tr key={o.ogrenci_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-500">
                          #{o.ogrenci_id}
                          {o.tc && <div className="text-[11px] text-slate-400 font-mono">TC: {o.tc}</div>}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">{o.isim} {o.soyisim}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          <div>{o.telefon || '-'}</div>
                          <div className="text-slate-400">{o.eposta || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                          <div><strong className="text-slate-700 dark:text-slate-300">Anne:</strong> {o.anne_isim || '-'} ({o.anne_telefon || '-'})</div>
                          <div><strong className="text-slate-700 dark:text-slate-300">Baba:</strong> {o.baba_isim || '-'} ({o.baba_telefon || '-'})</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-emerald-50 dark:bg-emerald-950/80 text-[#2eb82e] border border-emerald-200 dark:border-emerald-800/80 text-xs px-2.5 py-1 rounded-lg font-bold">
                            {o.kalan_ders_hakki} Kalan Hak
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-slate-200 dark:border-slate-700 pt-3">
              <button
                onClick={() => setSelectedSinifDetay(null)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 flex items-center gap-3 text-sm font-semibold animate-scale-in ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-700/60 shadow-rose-950/40'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60 shadow-emerald-950/40'
          }`}
        >
          <BookOpen className="w-5 h-5 text-[#2eb82e]" />
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

 </div>
 );
}

export default Siniflar;
