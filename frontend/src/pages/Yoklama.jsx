import React, { useState, useEffect, useRef } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, AlertCircle, Users, BookOpen, 
 Calendar, Clock, Plus, Trash2, Save, FileText, X, Sparkles, User,
 History, ChevronDown, ChevronUp, Filter, RefreshCw, CalendarPlus, Maximize2, Minimize2, MessageCircle } from 'lucide-react';
import { 
 getSiniflar, getSiniflarBasic, getSinifOgrencileri, getDersProgrami, 
 createDersProgrami, deleteDersProgrami, getYoklama, saveYoklamaToplu,
 deleteYoklamaOturum
} from '../services/api';
import CustomDatePicker from '../components/CustomDatePicker';
import HaftalikDersCizelgesi from '../components/HaftalikDersCizelgesi';
import ConfirmModal from '../components/ConfirmModal';
import SearchableSelect from '../components/SearchableSelect';
import TimePicker from '../components/TimePicker';

const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const RENK_OPTIONS = [
 { label: 'İndigo', value: 'indigo', bg: 'bg-indigo-100/90 border-indigo-300 text-indigo-950 dark:bg-indigo-950/80 dark:border-indigo-700/80 dark:text-indigo-200 ' },
 { label: 'Zümrüt', value: 'emerald', bg: 'bg-emerald-100/90 border-emerald-300 text-emerald-950 dark:bg-emerald-100 dark:bg-emerald-950/80 dark:border-emerald-700/80 dark:text-emerald-200 ' },
 { label: 'Turuncu', value: 'amber', bg: 'bg-amber-100/90 border-amber-300 text-amber-950 dark:bg-amber-950/80 dark:border-amber-700/80 dark:text-amber-200 ' },
 { label: 'Mor', value: 'purple', bg: 'bg-purple-100/90 border-purple-300 text-purple-950 dark:bg-purple-950/80 dark:border-purple-700/80 dark:text-purple-200 ' },
 { label: 'Mavi', value: 'sky', bg: 'bg-sky-100/90 border-sky-300 text-sky-950 dark:bg-sky-950/80 dark:border-sky-700/80 dark:text-sky-200 ' },
 { label: 'Gül', value: 'rose', bg: 'bg-rose-100/90 border-rose-300 text-rose-950 dark:bg-rose-950/80 dark:border-rose-700/80 dark:text-rose-200 ' },
 { label: 'Yeşil', value: 'green', bg: 'bg-green-100/90 border-green-300 text-green-950 dark:bg-emerald-900/70 dark:border-emerald-600/80 dark:text-emerald-200 ' },
 { label: 'Sarı', value: 'yellow', bg: 'bg-yellow-100/90 border-yellow-300 text-yellow-950 dark:bg-yellow-950/80 dark:border-yellow-600/80 dark:text-yellow-200 ' },
 { label: 'Kırmızı', value: 'red', bg: 'bg-red-100/90 border-red-300 text-red-950 dark:bg-red-950/80 dark:border-red-600/80 dark:text-red-200 ' }
];

const Yoklama = () => {
  const getRegisteredTeachers = () => {
    try {
      const saved = localStorage.getItem('system_teachers');
      return saved ? JSON.parse(saved) : [
        { id: 1, isim: 'Ahmet', soyisim: 'Yılmaz', brans: 'Piyano & Solfej' },
        { id: 2, isim: 'Elif', soyisim: 'Kaya', brans: 'Keman & Müzik Teorisi' },
        { id: 3, isim: 'Caner', soyisim: 'Öztürk', brans: 'Dans & Koreografi' }
      ];
    } catch { return []; }
  };

 const [siniflar, setSiniflar] = useState([]);
 const [selectedSinifId, setSelectedSinifId] = useState('');
 const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
 const [sinifOgrencileri, setSinifOgrencileri] = useState([]);
 
 // State for student attendance: { [ogrenciId]: 'Geldi' | 'Gelmedi' | 'Mazeret' }
 const [attendanceState, setAttendanceState] = useState({});
 // State for mazeret explanations: { [ogrenciId]: string }
 const [attendanceNotes, setAttendanceNotes] = useState({});

 const [dersProgrami, setDersProgrami] = useState([]);
 const [loadingOgrenciler, setLoadingOgrenciler] = useState(false);
 const [savingAttendance, setSavingAttendance] = useState(false);
 const [successMessage, setSuccessMessage] = useState('');

 // Genişletilmiş Gün State'i
 const [expandedGun, setExpandedGun] = useState(null);

 // Toast Notification State
 const [toastMessage, setToastMessage] = useState(null);

 const showToast = (message, type = 'success') => {
 setToastMessage({ message, type });
 setTimeout(() => {
 setToastMessage(null);
 }, 4000);
 };

 // Yoklama geçmişi state'leri
 const [yoklamaGecmisi, setYoklamaGecmisi] = useState([]);
 const [loadingGecmis, setLoadingGecmis] = useState(false);
 const [gecmisSinifFilter, setGecmisSinifFilter] = useState('');
 const [gecmisSearchTerm, setGecmisSearchTerm] = useState('');
 const [expandedOturumlar, setExpandedOturumlar] = useState({});
 const [expandAll, setExpandAll] = useState(false);
 const historySectionRef = useRef(null);

 // Ders ekleme modalı state
 const [showAddModal, setShowAddModal] = useState(false);
 const [newDersForm, setNewDersForm] = useState({
 sinif_id: '',
 gun: 'Pazartesi',
 baslangic_saati: '10:00',
 bitis_saati: '11:30',
 ders_adi: '',
 ogretmen_adi: '',
 renk: 'amber'
 });

 // Confirm Modal State
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

 // Telafi Dersi Modalı State
 const [showTelafiModal, setShowTelafiModal] = useState(false);
 const [telafiForm, setTelafiForm] = useState({
 sinif_id: '',
 asil_tarih: new Date().toISOString().split('T')[0],
 telafi_tarihi: new Date().toISOString().split('T')[0],
 aciklama: ''
 });

 const handleOpenTelafiModal = () => {
 const curDate = selectedDate || new Date().toISOString().split('T')[0];
 setTelafiForm({
 sinif_id: selectedSinifId || (siniflar[0] ? siniflar[0].id.toString() : ''),
 asil_tarih: curDate,
 telafi_tarihi: curDate,
 aciklama: 'İptal Edilen Ders Telafisi'
 });
 setShowTelafiModal(true);
 };

 const handleCreateTelafiSubmit = async (e) => {
 e.preventDefault();
 if (!telafiForm.sinif_id) {
 showToast('Lütfen bir sınıf seçiniz.', 'error');
 return;
 }

 try {
 setSavingAttendance(true);
 const res = await getSinifOgrencileri(telafiForm.sinif_id);
 const ogrencilerList = res.data?.ogrenciler || (Array.isArray(res.data) ? res.data : []);

 if (!Array.isArray(ogrencilerList) || ogrencilerList.length === 0) {
 showToast('Seçilen sınıfta kayıtlı aktif öğrenci bulunmuyor.', 'error');
 setSavingAttendance(false);
 return;
 }

 const noteSuffix = telafiForm.aciklama.trim() ? `: ${telafiForm.aciklama.trim()}` : '';
 const fullNote = `[TELAFİ DERSİ | Telafi Tarihi: ${telafiForm.telafi_tarihi}]${noteSuffix}`;

 const yoklamalarPayload = ogrencilerList.map(o => ({
 ogrenci_id: o.ogrenci_id || o.id,
 durum: 'Geldi',
 aciklama: fullNote
 }));

 await saveYoklamaToplu({
 sinif_id: parseInt(telafiForm.sinif_id),
 tarih: telafiForm.asil_tarih,
 yoklamalar: yoklamalarPayload
 });

 setShowTelafiModal(false);
 setSuccessMessage('Telafi dersi başarıyla kaydedildi!');

 await loadYoklamaGecmisi();
 const newKey = `${telafiForm.sinif_id}_${telafiForm.asil_tarih}`;
 setExpandedOturumlar(prev => ({ ...prev, [newKey]: true }));

 setTimeout(() => setSuccessMessage(''), 4000);
 } catch (err) {
 const detail = err.response?.data?.detail || err.message;
 showToast(`Telafi dersi oluşturulamadı: ${detail}`, 'error');
 } finally {
 setSavingAttendance(false);
 }
 };

 const handleUpdateHistoryStudentStatus = async (oturum, targetItem, newDurum) => {
 try {
 const updatedYoklamalar = oturum.items.map(item => ({
 ogrenci_id: item.ogrenci_id,
 durum: item.ogrenci_id === targetItem.ogrenci_id ? newDurum : item.durum,
 aciklama: item.ogrenci_id === targetItem.ogrenci_id ? (item.aciklama || null) : item.aciklama
 }));

 await saveYoklamaToplu({
 sinif_id: oturum.sinif_id,
 tarih: oturum.tarihStr,
 yoklamalar: updatedYoklamalar
 });

 setSuccessMessage(`Yoklama durumu "${newDurum}" olarak güncellendi.`);
 await loadYoklamaGecmisi();

 setTimeout(() => setSuccessMessage(''), 3000);
 } catch (err) {
 console.error('Yoklama kaydı güncelleme hatası:', err);
 showToast('Yoklama güncellenemedi.', 'error');
 }
 };

 const handleUpdateTelafiDate = async (oturum, newTelafiDate) => {
 try {
 setSavingAttendance(true);
 const updatedYoklamalar = oturum.items.map(item => {
 let currentNote = item.aciklama || '';
 let newNote = '';

 if (currentNote.includes('Telafi Tarihi:')) {
 newNote = currentNote.replace(/Telafi Tarihi:\s*[0-9]{4}-[0-9]{2}-[0-9]{2}/i, `Telafi Tarihi: ${newTelafiDate}`);
 } else if (currentNote.includes('TELAFİ DERSİ')) {
 newNote = currentNote.replace('[TELAFİ DERSİ]', `[TELAFİ DERSİ | Telafi Tarihi: ${newTelafiDate}]`);
 } else {
 newNote = `[TELAFİ DERSİ | Telafi Tarihi: ${newTelafiDate}] ${currentNote}`.trim();
 }

 return {
 ogrenci_id: item.ogrenci_id,
 durum: item.durum,
 aciklama: newNote
 };
 });

 await saveYoklamaToplu({
 sinif_id: oturum.sinif_id,
 tarih: oturum.tarihStr,
 yoklamalar: updatedYoklamalar
 });

 setSuccessMessage('Telafi tarihi başarıyla güncellendi!');
 await loadYoklamaGecmisi();

 setTimeout(() => setSuccessMessage(''), 3000);
 } catch (err) {
 console.error('Telafi tarihi güncelleme hatası:', err);
 showToast('Telafi tarihi güncellenemedi.', 'error');
 } finally {
 setSavingAttendance(false);
 }
 };

 useEffect(() => {
 fetchInitialData();
 loadYoklamaGecmisi();
 }, []);

 useEffect(() => {
 if (selectedSinifId && selectedDate) {
 loadAttendanceData(selectedSinifId, selectedDate);
 }
 }, [selectedSinifId, selectedDate]);

 useEffect(() => {
 loadYoklamaGecmisi();
 }, [gecmisSinifFilter]);

 const fetchInitialData = async () => {
 try {
 const [sinifRes, progRes] = await Promise.all([
 getSiniflar(),
 getDersProgrami()
 ]);

 const sinifList = sinifRes.data || [];
 setSiniflar(sinifList);
 setDersProgrami(progRes.data || []);

 if (sinifList.length > 0 && !selectedSinifId) {
 setSelectedSinifId(sinifList[0].id.toString());
 }
 } catch (err) {
 console.error('İlk veriler yüklenirken hata:', err);
 }
 };

 const loadAttendanceData = async (sinifId, dateStr) => {
 try {
 setLoadingOgrenciler(true);
 const [ogrencilerRes, yoklamaRes] = await Promise.all([
 getSinifOgrencileri(sinifId),
 getYoklama(sinifId, dateStr)
 ]);

 const ogrencilerList = ogrencilerRes.data?.ogrenciler || (Array.isArray(ogrencilerRes.data) ? ogrencilerRes.data : []);
 setSinifOgrencileri(ogrencilerList);

 const existingYoklamalar = yoklamaRes.data || [];
 const initialState = {};
 const initialNotes = {};

 ogrencilerList.forEach(o => {
 const found = existingYoklamalar.find(y => y.ogrenci_id === o.ogrenci_id);
 if (found) {
 initialState[o.ogrenci_id] = found.durum;
 initialNotes[o.ogrenci_id] = found.aciklama || '';
 } else {
 initialState[o.ogrenci_id] = 'Geldi';
 initialNotes[o.ogrenci_id] = '';
 }
 });

 setAttendanceState(initialState);
 setAttendanceNotes(initialNotes);
 } catch (err) {
 console.error('Yoklama verileri yüklenemedi:', err);
 } finally {
 setLoadingOgrenciler(false);
 }
 };

 const loadYoklamaGecmisi = async () => {
 try {
 setLoadingGecmis(true);
 const res = await getYoklama(gecmisSinifFilter || null, null);
 setYoklamaGecmisi(res.data || []);
 } catch (err) {
 console.error('Yoklama geçmişi yüklenemedi:', err);
 } finally {
 setLoadingGecmis(false);
 }
 };

 const markAttendance = (ogrenciId, status) => {
 setAttendanceState(prev => ({
 ...prev,
 [ogrenciId]: status
 }));
 };

 const handleNoteChange = (ogrenciId, noteText) => {
 setAttendanceNotes(prev => ({
 ...prev,
 [ogrenciId]: noteText
 }));
 };

 const handleSaveAttendance = async () => {
 if (!selectedSinifId || sinifOgrencileri.length === 0) return;

 try {
 setSavingAttendance(true);
 const yoklamalarPayload = sinifOgrencileri.map(o => ({
 ogrenci_id: o.ogrenci_id,
 durum: attendanceState[o.ogrenci_id] || 'Geldi',
 aciklama: attendanceNotes[o.ogrenci_id] || null
 }));

 await saveYoklamaToplu({
 sinif_id: parseInt(selectedSinifId),
 tarih: selectedDate,
 yoklamalar: yoklamalarPayload
 });

 const selectedSinif = siniflar.find(s => s.id.toString() === selectedSinifId.toString());
 const sinifAdi = selectedSinif ? selectedSinif.sinif_adi : 'Sınıf';
 setSuccessMessage(`"${sinifAdi}" için ${selectedDate} tarihli yoklama kaydı başarıyla tamamlandı!`);

 fetchInitialData();
 await loadYoklamaGecmisi();

 setTimeout(() => {
 if (historySectionRef.current) {
 historySectionRef.current.scrollIntoView({ behavior: 'smooth' });
 }
 }, 300);

 setTimeout(() => {
 setSuccessMessage('');
 }, 5000);
 } catch (err) {
 console.error('Yoklama kaydetme hatası:', err);
 showToast('Yoklama kaydedilirken bir hata oluştu.', 'error');
 } finally {
 setSavingAttendance(false);
 }
 };

 const handleAddDersSubmit = async (e) => {
 e.preventDefault();
 if (!newDersForm.sinif_id) {
 showToast('Lütfen bir sınıf seçiniz.', 'error');
 return;
 }

 try {
 await createDersProgrami({
 ...newDersForm,
 sinif_id: parseInt(newDersForm.sinif_id)
 });
 showToast('Haftalık ders programına yeni ders başarıyla eklendi!');
 setNewDersForm({
 sinif_id: '',
 gun: 'Pazartesi',
 baslangic_saati: '10:00',
 bitis_saati: '11:30',
 ders_adi: '',
 ogretmen_adi: '',
 renk: 'amber'
 });
 setShowAddModal(false);
 fetchInitialData();
 } catch (err) {
 console.error('Ders ekleme hatası:', err);
 showToast('Ders programı kaydedilemedi.', 'error');
 }
 };

 const handleDeleteDers = (e, id) => {
 e.stopPropagation();
 openConfirm({
 title: 'Ders Programı Silme Onayı',
 message: 'Bu dersi haftalık programdan silmek istediğinize emin misiniz?',
 type: 'danger',
 confirmText: 'Dersi Sil',
 onConfirm: async () => {
 try {
 await deleteDersProgrami(id);
 fetchInitialData();
 } catch (err) {
 console.error('Ders silinemedi:', err);
 }
 }
 });
 };

 const handleDeleteOturum = (sinifId, tarihStr, sinifAdi) => {
 openConfirm({
 title: 'Yoklama Oturumu Silme Onayı',
 message: `"${sinifAdi}" sınıfının ${tarihStr} tarihli yoklama kaydını tamamen silmek istediğinize emin misiniz?`,
 type: 'danger',
 confirmText: 'Yoklamayı Sil',
 onConfirm: async () => {
 try {
 await deleteYoklamaOturum(sinifId, tarihStr);
 showToast(`"${sinifAdi}" sınıfının ${tarihStr} tarihli yoklama kaydı başarıyla silindi.`);
 loadYoklamaGecmisi();
 } catch (err) {
 console.error('Yoklama silme hatası:', err);
 showToast('Yoklama kaydı silinemedi.', 'error');
 }
 }
 });
 };

 const handleProgramCardClick = (ders) => {
 setSelectedSinifId(ders.sinif_id.toString());
 };

 const getStyleForRenk = (renkVal) => {
 const found = RENK_OPTIONS.find(r => r.value === renkVal);
 return found ? found.bg : RENK_OPTIONS[0].bg;
 };

 const toggleOturumExpand = (key) => {
 setExpandedOturumlar(prev => ({
 ...prev,
 [key]: !prev[key]
 }));
 };

 const toggleExpandAll = () => {
 const nextState = !expandAll;
 setExpandAll(nextState);
 const newExpanded = {};
 filteredOturumlar.forEach(oturum => {
 newExpanded[oturum.key] = nextState;
 });
 setExpandedOturumlar(newExpanded);
 };

 // Group history items by session
 const getGroupedOturumlar = () => {
 const groups = {};
 yoklamaGecmisi.forEach(item => {
 const datePart = item.tarih ? item.tarih.split('T')[0] : 'Bilinmeyen Tarih';
 const key = `${item.sinif_id}_${datePart}`;
 if (!groups[key]) {
 groups[key] = {
 key,
 sinif_id: item.sinif_id,
 sinif_adi: item.sinif_adi || `Sınıf #${item.sinif_id}`,
 tarihStr: datePart,
 items: []
 };
 }
 groups[key].items.push(item);
 });

 return Object.values(groups).map(g => {
 const geldi = g.items.filter(i => i.durum === 'Geldi').length;
 const gelmedi = g.items.filter(i => i.durum === 'Gelmedi').length;
 
 let displayDate = g.tarihStr;
 try {
 const [dY, dM, dD] = g.tarihStr.split('-');
 if (dY && dM && dD) {
 const dt = new Date(parseInt(dY), parseInt(dM) - 1, parseInt(dD));
 displayDate = dt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
 }
 } catch (e) {}

 return {
 ...g,
 displayDate,
 geldiCount: geldi,
 gelmediCount: gelmedi,
 totalCount: g.items.length
 };
 });
 };

 const yoklamaOturumlari = getGroupedOturumlar();

 const filteredOturumlar = yoklamaOturumlari.filter(oturum => {
 if (!gecmisSearchTerm.trim()) return true;
 const q = gecmisSearchTerm.toLowerCase().trim();
 const matchesClass = (oturum.sinif_adi || '').toLowerCase().includes(q);
 const matchesDate = (oturum.displayDate || '').toLowerCase().includes(q) || (oturum.tarihStr || '').includes(q);
 const matchesStudent = oturum.items.some(i => (i.ogrenci_adi || '').toLowerCase().includes(q));
 return matchesClass || matchesDate || matchesStudent;
 });

 return (
 <div className="space-y-8">
 {/* Top Banner */}
 <div className="neo-card flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-3xl transition-colors">
 <div>
 <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
 <ClipboardCheck className="w-7 h-7 text-[#2eb82e]" />
 <span>Haftalık Ders Programı & Yoklama Takibi</span>
 </h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
 Haftalık programdan dersinizi seçip tarihi belirleyerek hızlıca sınıf yoklaması alın.
 </p>
 </div>

 <button
 onClick={() => setShowAddModal(true)}
 className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2eb82e] to-[#0284c7] hover:from-emerald-600 hover:to-sky-600 text-white font-bold text-sm rounded-xl -emerald-950/20 transition transform hover:-translate-y-0.5 cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 <span>Programa Ders Ekle</span>
 </button>
 </div>

 
 <HaftalikDersCizelgesi 
 dersProgrami={dersProgrami}
 expandedGun={expandedGun}
 setExpandedGun={setExpandedGun}
 selectedSinifId={selectedSinifId}
 setSelectedSinifId={setSelectedSinifId}
 handleDeleteDers={handleDeleteDers}
 />
 
 {/* YOKLAMA ALMA ALANI */}
 <div className="neo-card rounded-3xl p-6 space-y-6">
 {/* Filtre ve Tarih Düzenleme BARI */}
 <div className="space-y-4 border-b pb-5">
 <div>
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Users className="w-5 h-5 text-[#2eb82e]" />
 <span>Sınıf Yoklama Listesi</span>
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Yoklama tarihini değiştirebilir, öğrencilerin katılımını ve mazeret detaylarını kaydedebilirsiniz.
 </p>
 </div>

 {/* Tek Hizada 4 Eşit Sütunlu Kontrol Çubuğu */}
 <div className="neo-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-2xl -slate-200 items-end">
 {/* 1. Tarih Seçici */}
 <div>
 <CustomDatePicker
 label="Yoklama Tarihi:"
 value={selectedDate}
 onChange={(newDate) => setSelectedDate(newDate)}
 />
 </div>

 {/* 2. Sınıf Seçimi */}
 <div className="flex flex-col gap-1">
 <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <BookOpen className="w-3.5 h-3.5 text-[#0284c7]" />
 <span>Sınıf Seçimi:</span>
 </label>
 <select
 value={selectedSinifId}
 onChange={(e) => setSelectedSinifId(e.target.value)}
 className="w-full px-3.5 py-2 neo-input w-full rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2eb82e] h-[40px] cursor-pointer"
 >
 <option value="">-- Sınıf Seçin --</option>
 {siniflar.map(s => (
 <option key={s.id} value={s.id}>
 {s.sinif_adi} ({s.ogrenci_sayisi || 0} Öğrenci)
 </option>
 ))}
 </select>
 </div>

 {/* 3. Yoklamayı Kaydet Butonu */}
 <div>
 <button
 type="button"
 onClick={handleSaveAttendance}
 disabled={savingAttendance || !selectedSinifId}
 className="w-full flex items-center justify-center gap-2 px-4 h-[40px] hover:bg-[#269926] text-white font-black text-xs uppercase tracking-wider rounded-xl -emerald-900/30 transition disabled:opacity-50 cursor-pointer whitespace-nowrap neo-button-primary"
 >
 <Save className="w-4 h-4" />
 <span>{savingAttendance ? 'Kaydediliyor...' : 'Yoklamayı Kaydet'}</span>
 </button>
 </div>

 {/* 4. Telafi Dersi Oluştur Butonu */}
 <div>
 <button
 type="button"
 onClick={handleOpenTelafiModal}
 disabled={savingAttendance || !selectedSinifId}
 className="w-full flex items-center justify-center gap-2 px-4 h-[40px] bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl -rose-950/30 transition disabled:opacity-50 cursor-pointer whitespace-nowrap neo-button"
 title="Seçili Sınıf İçin Telafi Dersi Oluştur"
 >
 <CalendarPlus className="w-4 h-4" />
 <span>Telafi Dersi Oluştur</span>
 </button>
 </div>
 </div>
 </div>

 {/* Bildirim Mesajı */}
 {successMessage && (
 <div className="bg-emerald-100 dark:bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/80 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm font-bold animate-fade-in">
 <div className="flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-[#2eb82e]" />
 <span>{successMessage}</span>
 </div>
 <button onClick={() => setSuccessMessage('')} className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {/* ÖĞRENCİ YOKLAMA TABLOSU */}
 <div className="neo-card overflow-x-auto rounded-2xl -slate-200">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
 <th className="py-3.5 px-4">#ID</th>
 <th className="py-3.5 px-4">ÖĞRENCİ ADI SOYADI</th>
 <th className="py-3.5 px-4">KALAN DERS HAKKI</th>
 <th className="py-3.5 px-4">VELİ İLETİŞİM</th>
 <th className="py-3.5 px-4 text-center">KATILIM DURUMU</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60 text-sm">
 {loadingOgrenciler ? (
 <tr>
 <td colSpan="5" className="text-center py-10 text-slate-400 font-medium">
 <div className="flex items-center justify-center gap-2">
 <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
 <span>Yoklama Kayıtları ve Öğrenciler Yükleniyor...</span>
 </div>
 </td>
 </tr>
 ) : !selectedSinifId ? (
 <tr>
 <td colSpan="5" className="text-center py-10 text-slate-400 font-medium">
 Lütfen yoklama almak için yukarıdan bir ders veya sınıf seçiniz.
 </td>
 </tr>
 ) : sinifOgrencileri.length === 0 ? (
 <tr>
 <td colSpan="5" className="text-center py-10 text-slate-400 font-medium">
 Seçilen sınıfa ait kayıtlı aktif öğrenci bulunmamaktadır.
 </td>
 </tr>
 ) : (
 sinifOgrencileri.map((o) => {
 const status = attendanceState[o.ogrenci_id];
 const note = attendanceNotes[o.ogrenci_id] || '';
 const isGelmedi = status === 'Gelmedi';

 return (
 <React.Fragment key={o.ogrenci_id}>
 <tr className="hover: dark:hover: transition">
 <td className="py-4 px-4 font-bold text-slate-400 dark:text-slate-500">#{o.ogrenci_id}</td>
 <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-100">{o.isim} {o.soyisim}</td>
 <td className="py-4 px-4">
 <span className={`text-xs px-3 py-1 rounded-lg font-bold border ${o.kalan_ders_hakki <= 0 ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800/80' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2eb82e] border-emerald-300 dark:border-emerald-800/80'}`}>
 {o.kalan_ders_hakki} Ders
 </span>
 </td>
 <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
 <div><strong className="text-slate-700 dark:text-slate-300">Anne:</strong> {o.anne_isim || '-'} ({o.anne_telefon || '-'})</div>
 <div><strong className="text-slate-700 dark:text-slate-300">Baba:</strong> {o.baba_isim || '-'} ({o.baba_telefon || '-'})</div>
 </td>
 <td className="py-4 px-4">
 <div className="flex justify-center items-center gap-3">
 {/* Geldi Butonu */}
 <button
 onClick={() => markAttendance(o.ogrenci_id, 'Geldi')}
 className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
 status === 'Geldi'
 ? 'bg-[#2eb82e] text-white -emerald-900/30 scale-105'
 : ' text-slate-600 dark:text-slate-400 border hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-[#2eb82e]'
 }`}
 >
 <CheckCircle2 className="w-4 h-4" />
 <span>Geldi</span>
 </button>

 {/* Gelmedi Butonu */}
 <button
 onClick={() => markAttendance(o.ogrenci_id, 'Gelmedi')}
 className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
 status === 'Gelmedi'
 ? 'bg-[#0284c7] text-white -sky-900/30 scale-105'
 : ' text-slate-600 dark:text-slate-400 border hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-[#0284c7]'
 }`}
 >
 <XCircle className="w-4 h-4" />
 <span>Gelmedi</span>
 </button>
 </div>
 </td>
 </tr>

 {/* Mazeret / Gelmeme Nedeni Açıklama Alanı (Gelmedi Seçildiğinde Açılır) */}
 {isGelmedi && (
 <tr className="bg-sky-50/70 dark:bg-sky-950/20 border-b border-sky-200 dark:border-sky-800/40">
 <td colSpan="5" className="py-2.5 px-6">
 <div className="flex items-center gap-3">
 <FileText className="w-4 h-4 text-[#0284c7] shrink-0" />
 <span className="text-xs font-bold text-sky-800 dark:text-sky-300 shrink-0">Mazeret / Gelmeme Nedeni Açıklaması:</span>
 <input
 type="text"
 value={note}
 onChange={(e) => handleNoteChange(o.ogrenci_id, e.target.value)}
 placeholder="Örn: Sağlık Raporlu, İzinli, Şehir Dışında vb. (Opsiyonel)"
 className="w-full px-3 py-1.5 border-sky-300 dark:border-sky-700/60 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] neo-input"
 />
 </div>
 </td>
 </tr>
 )}
 </React.Fragment>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* KAYDEDİLEN YOKLAMA GEÇMİŞİ AKIŞI (ACCORDION HISTORY) */}
 <div ref={historySectionRef} className="neo-card rounded-3xl p-6 space-y-6">
 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4">
 <div>
 <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
 <History className="w-5 h-5 text-[#2eb82e]" />
 <span>Kaydedilen Yoklama Geçmişi</span>
 {yoklamaOturumlari.length > 0 && (
 <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#2eb82e] border border-emerald-300 dark:border-emerald-700/60 text-xs px-2.5 py-0.5 rounded-full font-bold">
 {filteredOturumlar.length} / {yoklamaOturumlari.length} Oturum
 </span>
 )}
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 Geçmiş yoklamalar kompakt akordiyon kartları şeklinde listelenir. İstediğiniz oturuma tıklayarak öğrenci listesini açabilirsiniz.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
 {/* Arama Kutusu */}
 <div className="relative flex-1 sm:w-48">
 <input
 type="text"
 placeholder="Tarih, öğrenci veya sınıf..."
 value={gecmisSearchTerm}
 onChange={(e) => setGecmisSearchTerm(e.target.value)}
 className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 neo-input"
 />
 <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
 </div>

 {/* Sınıf Filtresi */}
 <select
 value={gecmisSinifFilter}
 onChange={(e) => setGecmisSinifFilter(e.target.value)}
 className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer neo-input"
 >
 <option value="">-- Tüm Sınıflar --</option>
 {siniflar.map(s => (
 <option key={s.id} value={s.id}>{s.sinif_adi}</option>
 ))}
 </select>

 {/* Tümünü Aç / Daralt Butonu */}
 <button
 type="button"
 onClick={toggleExpandAll}
 className="px-3 py-1.5 hover: dark:hover: text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer neo-button"
 >
 {expandAll ? 'Tümünü Daralt' : 'Tümünü Genişlet'}
 </button>

 {/* Yenile Butonu */}
 <button
 type="button"
 onClick={loadYoklamaGecmisi}
 className="p-2 hover: dark:hover: text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer neo-button"
 title="Geçmişi Yenile"
 >
 <RefreshCw className={`w-4 h-4 ${loadingGecmis ? 'animate-spin text-indigo-400' : ''}`} />
 </button>
 </div>
 </div>

 {/* CONTAINER WITH COMPACT ACCORDION ITEMS (PADDINGS APPLIED TO PREVENT MARGIN CLIPPING) */}
 <div className="max-h-[650px] overflow-y-auto p-1.5 space-y-3">
 {loadingGecmis ? (
 <div className="text-center py-12 text-slate-400 font-medium">
 <div className="flex items-center justify-center gap-2">
 <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
 <span>Yoklama Geçmişi Yükleniyor...</span>
 </div>
 </div>
 ) : filteredOturumlar.length === 0 ? (
 <div className="neo-card rounded-2xl -slate-200 p-8 text-center text-slate-400">
 <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
 <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Uygun Yoklama Kaydı Bulunamadı</p>
 <p className="text-xs text-slate-500 mt-1">
 Filtrenizi değiştirebilir veya yukarıdaki formdan yeni yoklama kaydedebilirsiniz.
 </p>
 </div>
 ) : (
 filteredOturumlar.map((oturum, idx) => {
 const isExpanded = expandedOturumlar[oturum.key] !== undefined 
 ? expandedOturumlar[oturum.key] 
 : (expandAll || idx === 0);

 const telafiItem = oturum.items.find(i => i.aciklama && i.aciklama.includes('TELAFİ'));
 const isTelafi = !!telafiItem;
 let telafiDateFormatted = '';
 let rawTelafiDate = '';

 if (telafiItem) {
 const match = telafiItem.aciklama.match(/Telafi Tarihi:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
 if (match && match[1]) {
 rawTelafiDate = match[1];
 try {
 const [dY, dM, dD] = match[1].split('-');
 const dt = new Date(parseInt(dY), parseInt(dM) - 1, parseInt(dD));
 telafiDateFormatted = dt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
 } catch {
 telafiDateFormatted = match[1];
 }
 }
 }

 return (
 <div
 key={oturum.key}
 className={`neo-card transition overflow-hidden mb-4 ${
 isTelafi 
 ? '!border-l-4 !border-l-rose-500' 
 : ''
 }`}
 >
 {/* Oturum Kartı Başlığı */}
 <div
 onClick={() => toggleOturumExpand(oturum.key)}
 className="p-3.5 cursor-pointer flex flex-wrap justify-between items-center gap-3 select-none transition"
 >
 <div className="flex items-center gap-3">
 <div className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 px-3 py-1 rounded-xl text-xs font-black tracking-tight flex items-center gap-1.5 shrink-0">
 <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
 <span>{oturum.sinif_adi}</span>
 </div>

 <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5 text-emerald-500" />
 <span>{oturum.displayDate}</span>
 </div>

 {isTelafi && (
 <div onClick={(e) => e.stopPropagation()}>
 <CustomDatePicker
 value={rawTelafiDate || oturum.tarihStr}
 onChange={(newDate) => {
 if (newDate) {
 handleUpdateTelafiDate(oturum, newDate);
 }
 }}
 prefix="TELAFİ DERSİ: "
 icon={CalendarPlus}
 buttonClassName="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/90 hover:bg-rose-200 dark:hover:bg-rose-900/90 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between gap-2 transition cursor-pointer min-w-[220px]"
 align="left"
 />
 </div>
 )}
 </div>

 <div className="flex items-center gap-3">
 {/* Katılım Özeti Pill'leri */}
 <div className="flex items-center gap-2 text-[11px] font-bold">
 <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#2eb82e] border border-emerald-300 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3" />
 <span>{oturum.geldiCount} Geldi</span>
 </span>

 {oturum.gelmediCount > 0 && (
 <span className="bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-[#0284c7] border border-sky-300 dark:border-sky-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
 <XCircle className="w-3 h-3" />
 <span>{oturum.gelmediCount} Gelmedi</span>
 </span>
 )}

 <span className="text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full border">
 {oturum.totalCount} Öğrenci
 </span>
 </div>

 {/* Sil Butonu */}
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 handleDeleteOturum(oturum.sinif_id, oturum.tarihStr, oturum.sinif_adi);
 }}
 className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-red-400 hover:bg-rose-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
 title="Bu Yoklama Oturumunu Sil"
 >
 <Trash2 className="w-4 h-4" />
 </button>

 {/* Genişlet/Daralt İkonu */}
 <div className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1">
 {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
 </div>
 </div>
 </div>

 {/* Oturum Öğrenci Listesi Tablosu (ETKİLEŞİMLİ DÜZENLEME) */}
 <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
 <div className="overflow-hidden">
 <div className="p-4 overflow-x-auto border-t">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="text-slate-500 dark:text-slate-400 font-bold tracking-wider border-b pb-2">
 <th className="pb-2 px-3">#ID</th>
 <th className="pb-2 px-3">ÖĞRENCİ ADI SOYADI</th>
 <th className="pb-2 px-3 text-center">YOKLAMA İŞLE (DURUM)</th>
 <th className="pb-2 px-3">MAZERET / DERS NOTU</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
 {oturum.items.map(item => (
 <tr key={item.id} className="transition">
 <td className="py-2.5 px-3 font-semibold text-slate-400 dark:text-slate-500">#{item.ogrenci_id}</td>
 <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{item.ogrenci_adi || `Öğrenci #${item.ogrenci_id}`}</td>
 
 {/* Etkileşimli Yoklama Durum Butonları */}
 <td className="py-2.5 px-3 text-center">
 <div className="flex items-center justify-center gap-1.5">
 <button
 type="button"
 onClick={() => handleUpdateHistoryStudentStatus(oturum, item, 'Geldi')}
 className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition cursor-pointer flex items-center gap-1 ${
 item.durum === 'Geldi'
 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#2eb82e] border-emerald-300 dark:border-emerald-700 '
 : ' text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
 }`}
 title="Geldi Olarak İşle"
 >
 <CheckCircle2 className="w-3 h-3" />
 <span>Geldi</span>
 </button>

 <button
 type="button"
 onClick={() => handleUpdateHistoryStudentStatus(oturum, item, 'Gelmedi')}
 className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition cursor-pointer flex items-center gap-1 ${
 item.durum === 'Gelmedi'
 ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-700 '
 : ' text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
 }`}
 title="Gelmedi Olarak İşle"
 >
 <XCircle className="w-3 h-3" />
 <span>Gelmedi</span>
 </button>

 <button
 type="button"
 onClick={() => handleUpdateHistoryStudentStatus(oturum, item, 'Mazeretli')}
 className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition cursor-pointer flex items-center gap-1 ${
 item.durum === 'Mazeretli'
 ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-700 '
 : ' text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
 }`}
 title="Mazeretli Olarak İşle"
 >
 <AlertCircle className="w-3 h-3" />
 <span>Mazeretli</span>
 </button>
 </div>
 </td>

 <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
 {item.aciklama ? (
 <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
 item.aciklama.includes('TELAFİ') 
 ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/80' 
 : 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800/80'
 }`}>
 {item.aciklama}
 </span>
 ) : (
 <span className="text-slate-400 italic">-</span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>

 {/* DERS PROGRAMINA YENİ DERS EKLEME MODALI */}
 {showAddModal && (
 <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="neo-card rounded-3xl w-full max-w-md p-6 space-y-5 animate-scale-in text-slate-800 dark:text-slate-100">
 <div className="flex justify-between items-center border-b pb-3">
 <h3 className="text-base font-bold flex items-center gap-2">
 <Calendar className="w-5 h-5 text-indigo-500" />
 <span>Haftalık Ders Programı Ekle</span>
 </h3>
 <button
 onClick={() => setShowAddModal(false)}
 className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleAddDersSubmit} className="space-y-4 text-sm">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sınıf Seçiniz</label>
 <select
 value={newDersForm.sinif_id}
 onChange={(e) => setNewDersForm(prev => ({ ...prev, sinif_id: e.target.value }))}
 required
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
 >
 <option value="">-- Sınıf Seçin --</option>
 {siniflar.map(s => (
 <option key={s.id} value={s.id}>{s.sinif_adi}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gün Seçiniz</label>
 <select
 value={newDersForm.gun}
 onChange={(e) => setNewDersForm(prev => ({ ...prev, gun: e.target.value }))}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
 >
 {GUNLER.map(g => (
 <option key={g} value={g}>{g}</option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Başlangıç Saati</label>
 <TimePicker 
   value={newDersForm.baslangic_saati}
   onChange={(val) => setNewDersForm(prev => ({ ...prev, baslangic_saati: val }))}
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bitiş Saati</label>
 <TimePicker 
   value={newDersForm.bitis_saati}
   onChange={(val) => setNewDersForm(prev => ({ ...prev, bitis_saati: val }))}
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ders Adı / Konu (Opsiyonel)</label>
 <input
 type="text"
 placeholder="Örn: Piyano Temel Eğitimi"
 value={newDersForm.ders_adi}
 onChange={(e) => setNewDersForm(prev => ({ ...prev, ders_adi: e.target.value }))}
 className="w-full px-3.5 py-2 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Eğitmen / Öğretmen Atayın</label>
 <SearchableSelect
  value={newDersForm.ogretmen_adi}
  onChange={(val) => setNewDersForm(prev => ({ ...prev, ogretmen_adi: val }))}
  options={getRegisteredTeachers().map(t => ({ value: `${t.isim} ${t.soyisim || ""}`.trim(), label: `${t.isim} ${t.soyisim || ""}`.trim() }))}
  placeholder="-- Öğretmen Seçin (Opsiyonel) --"
  searchPlaceholder="Öğretmen ara..."
/>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kart Rengi</label>
 <div className="grid grid-cols-3 gap-2">
 {RENK_OPTIONS.map(r => (
 <button
 key={r.value}
 type="button"
 onClick={() => setNewDersForm(prev => ({ ...prev, renk: r.value }))}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${r.bg} ${
 newDersForm.renk === r.value ? 'ring-2 ring-indigo-500 dark:ring-white ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : 'opacity-70'
 }`}
 >
 {r.label}
 </button>
 ))}
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-3 border-t">
 <button
 type="button"
 onClick={() => setShowAddModal(false)}
 className="px-4 py-2 hover: dark:hover: text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
 >
 İptal
 </button>
 <button
 type="submit"
 className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl cursor-pointer neo-button"
 >
 Dersi Kaydet
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* TELAFİ DERSİ OLUŞTURMA MODALI */}
 {showTelafiModal && (
 <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
 <div className="neo-card rounded-3xl max-w-md w-full p-6 space-y-5 animate-scale-in text-slate-800 dark:text-slate-100">
 <div className="flex justify-between items-center border-b pb-3">
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <CalendarPlus className="w-5 h-5 text-rose-500" />
 <span>Telafi Dersi & Yoklaması Oluştur</span>
 </h3>
 <button
 type="button"
 onClick={() => setShowTelafiModal(false)}
 className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleCreateTelafiSubmit} className="space-y-4 text-sm">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Telafi Edilecek Sınıf / Branş *</label>
 <select
 required
 value={telafiForm.sinif_id}
 onChange={(e) => setTelafiForm({ ...telafiForm, sinif_id: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-rose-500"
 >
 <option value="">-- Sınıf Seçin --</option>
 {siniflar.map(s => (
 <option key={s.id} value={s.id}>{s.sinif_adi} ({s.ogrenci_sayisi || 0} Öğrenci)</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">1. Dersin Asıl Tarihi (İptal/Telafiye Kalan Ders) *</label>
 <CustomDatePicker
 value={telafiForm.asil_tarih}
 onChange={(newDate) => setTelafiForm({ ...telafiForm, asil_tarih: newDate })}
 />
 <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Bu tarih yoklama geçmişinde dersin kendi asıl tarihi olarak kaydedilir.</span>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">2. Telafi Dersi Yapılacağı Tarih (Ek Telafi Tarihi) *</label>
 <CustomDatePicker
 value={telafiForm.telafi_tarihi}
 onChange={(newDate) => setTelafiForm({ ...telafiForm, telafi_tarihi: newDate })}
 />
 <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Bu tarih yoklama geçmişinde Telafi Tarihi rozeti olarak görüntülenir.</span>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Telafi Açıklaması / Sebebi (Opsiyonel)</label>
 <input
 type="text"
 placeholder="Örn: 1 Ağustos İptal Dersinin Telafisi"
 value={telafiForm.aciklama}
 onChange={(e) => setTelafiForm({ ...telafiForm, aciklama: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500"
 />
 </div>

 <div className="flex justify-end gap-3 pt-3 border-t">
 <button
 type="button"
 onClick={() => setShowTelafiModal(false)}
 className="px-4 py-2 hover: dark:hover: text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
 >
 İptal
 </button>
 <button
 type="submit"
 disabled={savingAttendance}
 className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl -rose-950/40 transition cursor-pointer disabled:opacity-50 neo-button"
 >
 {savingAttendance ? 'Oluşturuluyor...' : 'Telafi Dersini Oluştur & Kaydet'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Toast Notification */}
 {toastMessage && (
 <div
 className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 flex items-center gap-3 text-sm font-semibold animate-scale-in ${
 toastMessage.type === 'error'
 ? 'bg-rose-950/90 text-rose-200 border-rose-700/60 -rose-950/40'
 : 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60 -emerald-950/40'
 }`}
 >
 <Sparkles className="w-5 h-5 text-[#2eb82e]" />
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
};

export default Yoklama;
