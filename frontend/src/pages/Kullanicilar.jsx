import React, { useState, useEffect } from 'react';
import { 
 Shield, UserPlus, Trash2, UserCheck, RefreshCw, UserCog, Sparkles,
 Star, Award, Edit3, GraduationCap, ThumbsUp, Calendar, Plus, X, BookOpen,
 Briefcase, User, Phone, Mail, Search, CheckCircle, Clock, Filter, Layers, Users
} from 'lucide-react';
import { getKullanicilar, createKullanici, deleteKullanici, getSiniflar } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import SearchableSelect from '../components/SearchableSelect';

const INITIAL_TEACHERS = [
 {
 id: 1,
 isim: 'Ahmet Yılmaz',
 brans: 'Piyano & Solfej',
 telefon: '0532 111 2233',
 eposta: 'ahmet.yilmaz@akademisaas.com',
 baslamaTarihi: '2024-09-01',
 durum: 'Aktif',
 notlar: 'Piyano zümre başkanı, ileri seviye grup dersleri veriyor.'
 },
 {
 id: 2,
 isim: 'Elif Kaya',
 brans: 'Keman & Müzik Teorisi',
 telefon: '0533 222 3344',
 eposta: 'elif.kaya@akademisaas.com',
 baslamaTarihi: '2025-01-15',
 durum: 'Aktif',
 notlar: 'Orkestra ve teori dersleri sorumlusu.'
 },
 {
 id: 3,
 isim: 'Caner Öztürk',
 brans: 'Dans & Koreografi',
 telefon: '0534 333 4455',
 eposta: 'caner.ozturk@akademisaas.com',
 baslamaTarihi: '2025-03-10',
 durum: 'Aktif',
 notlar: 'Modern dans eğitmeni ve sahne performans koçu.'
 }
];

const INITIAL_STAFF = [
 {
 id: 101,
 isim: 'Selin Tekin',
 unvan: 'Danışma & Ön Büro Sorumlusu',
 telefon: '0535 444 5566',
 eposta: 'selin.tekin@akademisaas.com',
 baslamaTarihi: '2024-10-01',
 durum: 'Aktif',
 notlar: 'Veli karşılamaları ve ön kayıt takip sorumlusu.'
 },
 {
 id: 102,
 isim: 'Murat Erdem',
 unvan: 'İdari İşler & Operasyon',
 telefon: '0536 555 6677',
 eposta: 'murat.erdem@akademisaas.com',
 baslamaTarihi: '2024-11-15',
 durum: 'Aktif',
 notlar: 'Bina idaresi, materyal tedariği ve sınıf organizasyonları.'
 }
];

const INITIAL_EVALUATIONS = [
 {
 id: 1,
 tur: 'ogretmen',
 isim: 'Ahmet Yılmaz',
 unvan: 'Piyano & Solfej',
 puan: 5,
 notlar: 'Öğrencilerle iletişimi mükemmel, veli memnuniyeti çok yüksek. Ders saatlerine tam uyum sağlıyor.',
 kategoriler: ['Mükemmel İletişim', 'Dakiklik', 'Yüksek Motivasyon'],
 tarih: '2026-08-04'
 },
 {
 id: 2,
 tur: 'ogretmen',
 isim: 'Elif Kaya',
 unvan: 'Keman & Müzik Teorisi',
 puan: 4.8,
 notlar: 'Yoklama kayıtlarını düzenli tutuyor, müfredat takibinde son derece başarılı.',
 kategoriler: ['Düzenli Yoklama', 'Müfredat Takibi'],
 tarih: '2026-08-03'
 },
 {
 id: 3,
 tur: 'ogretmen',
 isim: 'Caner Öztürk',
 unvan: 'Dans & Koreografi',
 puan: 4.5,
 notlar: 'Grup derslerinde öğrenci enerjisini yüksek tutuyor, etkinliklerde özverili.',
 kategoriler: ['Grup Dinamiği', 'Etkinlik Yönetimi'],
 tarih: '2026-08-01'
 },
 {
 id: 101,
 tur: 'personel',
 isim: 'Selin Tekin',
 unvan: 'Danışma & Ön Büro Sorumlusu',
 puan: 5,
 notlar: 'Ön kayıtlara gelen velileri son derece güler yüzlü karşılıyor, kayıt takibini ve geri dönüşleri eksiksiz yürütüyor.',
 kategoriler: ['Güler Yüz', 'Hızlı Kayıt Takibi', 'Veli İletişimi'],
 tarih: '2026-08-04'
 },
 {
 id: 102,
 tur: 'personel',
 isim: 'Murat Erdem',
 unvan: 'İdari İşler & Operasyon',
 puan: 4.7,
 notlar: 'Sınıf düzeni, havalandırma ve ders materyallerinin tedariğinde çok pratik ve yardımsever.',
 kategoriler: ['Operasyonel Başarı', 'Zaman Yönetimi'],
 tarih: '2026-08-02'
 }
];

const Kullanicilar = () => {
 const currentUser = (() => {
 try {
 return JSON.parse(localStorage.getItem('user') || '{}');
 } catch {
 return {};
 }
 })();
 const currentAkademi = currentUser?.akademi_adi || 'Test1';

 const [activeTab, setActiveTab] = useState('kullanicilar'); // 'kullanicilar', 'ogretmenler', 'personel'
 const [ogretmenSubTab, setOgretmenSubTab] = useState('all'); // 'all', 'kadro', 'degerlendirmeler'
 const [personelSubTab, setPersonelSubTab] = useState('all'); // 'all', 'kadro', 'degerlendirmeler'

 const [kullanicilar, setKullanicilar] = useState([]);
 const [siniflar, setSiniflar] = useState([]);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [toastMessage, setToastMessage] = useState(null);

 const isTest1 = (akademi) => (akademi || '').trim().toLowerCase() === 'test1';

 const getInitialTeachers = (akademi) => {
 try {
 const saved = localStorage.getItem(`system_teachers_${akademi}`);
 if (saved) {
 const parsed = JSON.parse(saved);
 if (!isTest1(akademi)) {
 return parsed.filter(t => t.id !== 1 && t.id !== 2 && t.id !== 3);
 }
 return parsed;
 }
 return isTest1(akademi) ? INITIAL_TEACHERS : [];
 } catch {
 return isTest1(akademi) ? INITIAL_TEACHERS : [];
 }
 };

 const getInitialStaff = (akademi) => {
 try {
 const saved = localStorage.getItem(`system_staff_${akademi}`);
 if (saved) {
 const parsed = JSON.parse(saved);
 if (!isTest1(akademi)) {
 return parsed.filter(s => s.id !== 101 && s.id !== 102);
 }
 return parsed;
 }
 return isTest1(akademi) ? INITIAL_STAFF : [];
 } catch {
 return isTest1(akademi) ? INITIAL_STAFF : [];
 }
 };

 const getInitialEvaluations = (akademi) => {
 try {
 const saved = localStorage.getItem(`system_evaluations_${akademi}`);
 if (saved) {
 const parsed = JSON.parse(saved);
 if (!isTest1(akademi)) {
 return parsed.filter(e => e.id !== 1 && e.id !== 2 && e.id !== 3 && e.id !== 101 && e.id !== 102);
 }
 return parsed;
 }
 return isTest1(akademi) ? INITIAL_EVALUATIONS : [];
 } catch {
 return isTest1(akademi) ? INITIAL_EVALUATIONS : [];
 }
 };

 // Öğretmen Kadrosu State (Akademiye Özel)
 const [teachers, setTeachers] = useState(() => getInitialTeachers(currentAkademi));

 // Personel Kadrosu State (Akademiye Özel)
 const [staff, setStaff] = useState(() => getInitialStaff(currentAkademi));

 // Değerlendirmeler State (Hem Öğretmen Hem Personel - Akademiye Özel)
 const [evaluations, setEvaluations] = useState(() => getInitialEvaluations(currentAkademi));

 // Search filter states
 const [teacherSearch, setTeacherSearch] = useState('');
 const [staffSearch, setStaffSearch] = useState('');

 // Modals State
 const [showTeacherModal, setShowTeacherModal] = useState(false);
 const [editingTeacher, setEditingTeacher] = useState(null);
 const [teacherForm, setTeacherForm] = useState({
 isim: '',
 brans: '',
 telefon: '',
 eposta: '',
 baslamaTarihi: new Date().toISOString().split('T')[0],
 durum: 'Aktif',
 notlar: ''
 });

 const [showStaffModal, setShowStaffModal] = useState(false);
 const [editingStaff, setEditingStaff] = useState(null);
 const [staffForm, setStaffForm] = useState({
 isim: '',
 unvan: '',
 telefon: '',
 eposta: '',
 baslamaTarihi: new Date().toISOString().split('T')[0],
 durum: 'Aktif',
 notlar: ''
 });

 const [showEvalModal, setShowEvalModal] = useState(false);
 const [editingEval, setEditingEval] = useState(null);
 const [evalForm, setEvalForm] = useState({
 tur: 'ogretmen', // 'ogretmen' veya 'personel'
 selectedEmployeeId: '',
 isim: '',
 unvan: '',
 puan: 5,
 notlar: '',
 kategoriInput: ''
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

 useEffect(() => {
 fetchKullanicilar();
 fetchSiniflar();
 }, []);

 useEffect(() => {
 setTeachers(getInitialTeachers(currentAkademi));
 setStaff(getInitialStaff(currentAkademi));
 setEvaluations(getInitialEvaluations(currentAkademi));
 }, [currentAkademi]);

 // Sync to LocalStorage per academy
 useEffect(() => {
 try {
 localStorage.setItem(`system_teachers_${currentAkademi}`, JSON.stringify(teachers));
 } catch (e) {
 console.error('Teachers LocalStorage kaydı başarısız:', e);
 }
 }, [teachers, currentAkademi]);

 useEffect(() => {
 try {
 localStorage.setItem(`system_staff_${currentAkademi}`, JSON.stringify(staff));
 } catch (e) {
 console.error('Staff LocalStorage kaydı başarısız:', e);
 }
 }, [staff, currentAkademi]);

 useEffect(() => {
 try {
 localStorage.setItem(`system_evaluations_${currentAkademi}`, JSON.stringify(evaluations));
 } catch (e) {
 console.error('Evaluations LocalStorage kaydı başarısız:', e);
 }
 }, [evaluations, currentAkademi]);

 const fetchSiniflar = async () => {
 try {
 const res = await getSiniflar();
 setSiniflar(res.data || []);
 } catch (e) {
 console.error('Sınıflar yüklenemedi:', e);
 }
 };

 const fetchKullanicilar = async () => {
 try {
 setLoading(true);
 const res = await getKullanicilar();
 setKullanicilar(res.data || []);
 } catch (err) {
 console.error('Kullanıcılar getirilemedi:', err);
 if (err.response && err.response.status === 401) {
 return;
 }
 const detail = err.response?.data?.detail || 'Kullanıcı listesi alınırken hata oluştu.';
 showToast(detail, 'error');
 } finally {
 setLoading(false);
 }
 };

 const showToast = (message, type = 'success') => {
 setToastMessage({ message, type });
 setTimeout(() => {
 setToastMessage(null);
 }, 3500);
 };

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

 // User account form
 const [formData, setFormData] = useState({
 ad_soyad: '',
 kullanici_adi: '',
 sifre: '',
 rol: 'Personel',
 });

 const handleInputChange = (e) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmitUser = async (e) => {
 e.preventDefault();
 if (!formData.kullanici_adi.trim() || !formData.sifre.trim()) {
 showToast('Kullanıcı adı ve şifre zorunludur.', 'error');
 return;
 }

 try {
 setSubmitting(true);
 await createKullanici({
 ad_soyad: formData.ad_soyad.trim(),
 kullanici_adi: formData.kullanici_adi.trim(),
 sifre: formData.sifre.trim(),
 rol: formData.rol,
 });

 showToast(`"${formData.kullanici_adi}" adlı yeni ${formData.rol} hesabı başarıyla eklendi!`);
 setFormData({ ad_soyad: '', kullanici_adi: '', sifre: '', rol: 'Personel' });
 fetchKullanicilar();
 } catch (err) {
 console.error('Kullanıcı oluşturulamadı:', err);
 const detail = err.response?.data?.detail || 'Kullanıcı oluşturulamadı.';
 showToast(detail, 'error');
 } finally {
 setSubmitting(false);
 }
 };

 const handleDeleteUser = (id, kullaniciAdi) => {
 if (kullaniciAdi === 'doruk') {
 showToast('Ana yönetici hesabı (doruk) silinemez!', 'error');
 return;
 }

 openConfirm({
 title: 'Kullanıcı Hesabı Silme Onayı',
 message: `"${kullaniciAdi}" kullanıcı adlı hesabı silmek istediğinize emin misiniz?`,
 type: 'danger',
 confirmText: 'Hesabı Sil',
 onConfirm: async () => {
 try {
 await deleteKullanici(id);
 showToast('Kullanıcı başarıyla silindi.');
 fetchKullanicilar();
 } catch (err) {
 console.error('Kullanıcı silinemedi:', err);
 const detail = err.response?.data?.detail || 'Silme işlemi sırasında hata oluştu.';
 showToast(detail, 'error');
 }
 }
 });
 };

 // --- ÖĞRETMEN BİLGİLERİ YÖNETİMİ ---
 const openAddTeacherModal = () => {
 setEditingTeacher(null);
 setTeacherForm({
 isim: '',
 brans: '',
 telefon: '',
 eposta: '',
 baslamaTarihi: new Date().toISOString().split('T')[0],
 durum: 'Aktif',
 notlar: ''
 });
 setShowTeacherModal(true);
 };

 const openEditTeacherModal = (teacher) => {
 setEditingTeacher(teacher);
 setTeacherForm({
 isim: teacher.isim || '',
 brans: teacher.brans || '',
 telefon: teacher.telefon || '',
 eposta: teacher.eposta || '',
 baslamaTarihi: teacher.baslamaTarihi || new Date().toISOString().split('T')[0],
 durum: teacher.durum || 'Aktif',
 notlar: teacher.notlar || ''
 });
 setShowTeacherModal(true);
 };

 const handleSaveTeacher = (e) => {
 e.preventDefault();
 if (!teacherForm.isim.trim()) {
 showToast('Öğretmen adı ve soyadı zorunludur.', 'error');
 return;
 }

 if (editingTeacher) {
 setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...teacherForm } : t));
 showToast(`"${teacherForm.isim}" öğretmen bilgileri güncellendi.`);
 } else {
 const newTeacher = {
 id: Date.now(),
 ...teacherForm
 };
 setTeachers(prev => [newTeacher, ...prev]);
 showToast(`Yeni öğretmen "${teacherForm.isim}" kadroya başarıyla eklendi!`);
 }
 setShowTeacherModal(false);
 };

 const handleDeleteTeacher = (id, teacherName) => {
 openConfirm({
 title: 'Öğretmen Kaydı Silme Onayı',
 message: `"${teacherName}" isimli öğretmeni ve kadro kaydını silmek istediğinize emin misiniz?`,
 type: 'danger',
 confirmText: 'Öğretmeni Sil',
 onConfirm: async () => {
 setTeachers(prev => prev.filter(t => t.id !== id));
 showToast('Öğretmen kaydı başarıyla silindi.');
 }
 });
 };

 // --- PERSONEL BİLGİLERİ YÖNETİMİ ---
 const openAddStaffModal = () => {
 setEditingStaff(null);
 setStaffForm({
 isim: '',
 unvan: '',
 telefon: '',
 eposta: '',
 baslamaTarihi: new Date().toISOString().split('T')[0],
 durum: 'Aktif',
 notlar: ''
 });
 setShowStaffModal(true);
 };

 const openEditStaffModal = (item) => {
 setEditingStaff(item);
 setStaffForm({
 isim: item.isim || '',
 unvan: item.unvan || '',
 telefon: item.telefon || '',
 eposta: item.eposta || '',
 baslamaTarihi: item.baslamaTarihi || new Date().toISOString().split('T')[0],
 durum: item.durum || 'Aktif',
 notlar: item.notlar || ''
 });
 setShowStaffModal(true);
 };

 const handleSaveStaff = (e) => {
 e.preventDefault();
 if (!staffForm.isim.trim()) {
 showToast('Personel adı ve soyadı zorunludur.', 'error');
 return;
 }

 if (editingStaff) {
 setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...staffForm } : s));
 showToast(`"${staffForm.isim}" personel bilgileri güncellendi.`);
 } else {
 const newStaffItem = {
 id: Date.now(),
 ...staffForm
 };
 setStaff(prev => [newStaffItem, ...prev]);
 showToast(`Yeni personel "${staffForm.isim}" kadroya başarıyla eklendi!`);
 }
 setShowStaffModal(false);
 };

 const handleDeleteStaff = (id, staffName) => {
 openConfirm({
 title: 'Personel Kaydı Silme Onayı',
 message: `"${staffName}" isimli personeli kadrodan silmek istediğinize emin misiniz?`,
 type: 'danger',
 confirmText: 'Personeli Sil',
 onConfirm: async () => {
 setStaff(prev => prev.filter(s => s.id !== id));
 showToast('Personel kaydı başarıyla silindi.');
 }
 });
 };

 // --- DEĞERLENDİRME MODAL ACTIONS ---
 const openAddEvalModal = (defaultTur = 'ogretmen', presetName = '', presetUnvan = '') => {
 setEditingEval(null);
 setEvalForm({
 tur: defaultTur,
 selectedEmployeeId: '',
 isim: presetName || '',
 unvan: presetUnvan || '',
 puan: 5,
 notlar: '',
 kategoriInput: defaultTur === 'ogretmen' ? 'Mükemmel İletişim, Dakiklik' : 'Güler Yüz, Hızlı İletişim'
 });
 setShowEvalModal(true);
 };

 const openEditEvalModal = (item) => {
 setEditingEval(item);
 setEvalForm({
 tur: item.tur || 'ogretmen',
 selectedEmployeeId: '',
 isim: item.isim || item.ogretmen_adi || item.personel_adi || '',
 unvan: item.unvan || item.brans || item.gorev || '',
 puan: item.puan || 5,
 notlar: item.notlar || '',
 kategoriInput: (item.kategoriler || []).join(', ')
 });
 setShowEvalModal(true);
 };

 const handleSelectEmployeeForEval = (empId) => {
 if (!empId) {
 setEvalForm(prev => ({ ...prev, selectedEmployeeId: '', isim: '', unvan: '' }));
 return;
 }

 if (evalForm.tur === 'ogretmen') {
 const selected = teachers.find(t => t.id === parseInt(empId) || t.id === empId);
 if (selected) {
 setEvalForm(prev => ({
 ...prev,
 selectedEmployeeId: empId,
 isim: selected.isim,
 unvan: selected.brans
 }));
 }
 } else {
 const selected = staff.find(s => s.id === parseInt(empId) || s.id === empId);
 if (selected) {
 setEvalForm(prev => ({
 ...prev,
 selectedEmployeeId: empId,
 isim: selected.isim,
 unvan: selected.unvan
 }));
 }
 }
 };

 const handleSaveEval = (e) => {
 e.preventDefault();
 if (!evalForm.isim.trim()) {
 showToast(`${evalForm.tur === 'ogretmen' ? 'Öğretmen' : 'Personel'} adı zorunludur.`, 'error');
 return;
 }

 const tags = evalForm.kategoriInput
 .split(',')
 .map(t => t.trim())
 .filter(t => t.length > 0);

 const todayStr = new Date().toISOString().split('T')[0];

 if (editingEval) {
 setEvaluations(prev => prev.map(item => item.id === editingEval.id ? {
 ...item,
 tur: evalForm.tur,
 isim: evalForm.isim.trim(),
 unvan: evalForm.unvan.trim(),
 puan: parseFloat(evalForm.puan),
 notlar: evalForm.notlar.trim(),
 kategoriler: tags,
 tarih: todayStr
 } : item));
 showToast(`${evalForm.isim} değerlendirmesi güncellendi.`);
 } else {
 const newEval = {
 id: Date.now(),
 tur: evalForm.tur,
 isim: evalForm.isim.trim(),
 unvan: evalForm.unvan.trim(),
 puan: parseFloat(evalForm.puan),
 notlar: evalForm.notlar.trim(),
 kategoriler: tags,
 tarih: todayStr
 };
 setEvaluations(prev => [newEval, ...prev]);
 showToast(`${evalForm.isim} için ${evalForm.tur === 'ogretmen' ? 'öğretmen' : 'personel'} değerlendirmesi eklendi!`);
 }

 setShowEvalModal(false);
 };

 const handleDeleteEval = (id, targetName) => {
 openConfirm({
 title: 'Değerlendirme Silme Onayı',
 message: `"${targetName}" değerlendirmesini silmek istediğinize emin misiniz?`,
 type: 'danger',
 confirmText: 'Değerlendirmeyi Sil',
 onConfirm: async () => {
 setEvaluations(prev => prev.filter(e => e.id !== id));
 showToast('Değerlendirme başarıyla silindi.');
 }
 });
 };

 // Calculations & Filtering
 const filteredTeachers = teachers.filter(t => 
 t.isim.toLowerCase().includes(teacherSearch.toLowerCase()) ||
 (t.brans && t.brans.toLowerCase().includes(teacherSearch.toLowerCase()))
 );

 const filteredStaff = staff.filter(s => 
 s.isim.toLowerCase().includes(staffSearch.toLowerCase()) ||
 (s.unvan && s.unvan.toLowerCase().includes(staffSearch.toLowerCase()))
 );

 const teacherEvals = evaluations.filter(e => e.tur === 'ogretmen' || !e.tur);
 const staffEvals = evaluations.filter(e => e.tur === 'personel');

 const avgTeacherRating = teacherEvals.length > 0
 ? (teacherEvals.reduce((acc, curr) => acc + curr.puan, 0) / teacherEvals.length).toFixed(1)
 : '0.0';

 const avgStaffRating = staffEvals.length > 0
 ? (staffEvals.reduce((acc, curr) => acc + curr.puan, 0) / staffEvals.length).toFixed(1)
 : '0.0';

 return (
 <div className="space-y-6 pb-12">
 {/* Toast Notification */}
 {toastMessage && (
 <div
 className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 flex items-center gap-3 text-sm font-semibold ${
 toastMessage.type === 'error'
 ? 'bg-rose-950/90 text-rose-200 border-rose-700/60'
 : 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60'
 }`}
 >
 <Sparkles className="w-5 h-5 text-[#2eb82e]" />
 <span>{toastMessage.message}</span>
 </div>
 )}

 {/* Main Header Banner */}
 <div className="neo-card p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
 <div className="flex items-center gap-3">
 <div className="neo-card w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2eb82e] to-[#0284c7] flex items-center justify-center text-white -emerald-900/20 shrink-0">
 <Shield className="w-6 h-6" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Yönetici Paneli</h1>
 <span className="bg-[#2eb82e]/10 border border-[#2eb82e]/30 text-[#2eb82e] text-xs font-bold px-2.5 py-0.5 rounded-lg">
 {currentAkademi}
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
 Çalışan kadroları, öğretmen & personel kayıtları ve {currentAkademi} kurum yönetimi
 </p>
 </div>
 </div>

 {/* Main Tab Selection Switcher */}
 <div className="neo-card flex items-center gap-1.5 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
 <button
 type="button"
 onClick={() => setActiveTab('kullanicilar')}
 className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
 activeTab === 'kullanicilar'
 ? 'bg-[#2eb82e] text-white -emerald-900/30'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover: dark:hover:'
 }`}
 >
 <UserCog className="w-4 h-4" />
 <span>Kullanıcı Hesapları</span>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('ogretmenler')}
 className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
 activeTab === 'ogretmenler'
 ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white -sky-950/30'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover: dark:hover:'
 }`}
 >
 <GraduationCap className="w-4 h-4" />
 <span>Öğretmen Yönetimi</span>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('personel')}
 className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
 activeTab === 'personel'
 ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white -indigo-950/30'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover: dark:hover:'
 }`}
 >
 <Briefcase className="w-4 h-4" />
 <span>Personel Yönetimi</span>
 </button>
 </div>
 </div>

 {/* TAB 1: KULLANICI HESAPLARI YÖNETİMİ */}
 {activeTab === 'kullanicilar' && (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-scale-in">
 
 {/* User Creation Form */}
 <div className="neo-card rounded-3xl p-6 space-y-4 text-slate-800 dark:text-slate-100">
 <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b pb-3">
 <UserPlus className="w-5 h-5 text-[#2eb82e]" />
 <span>Yeni Giriş Hesabı Ekle</span>
 </h2>

 <form onSubmit={handleSubmitUser} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ad Soyad (İsteğe Bağlı)</label>
 <input
 type="text"
 name="ad_soyad"
 value={formData.ad_soyad}
 onChange={handleInputChange}
 placeholder="Ahmet Yılmaz"
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2eb82e]"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kullanıcı Adı *</label>
 <input
 type="text"
 name="kullanici_adi"
 required
 value={formData.kullanici_adi}
 onChange={handleInputChange}
 placeholder="ahmet123"
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2eb82e]"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Şifre *</label>
 <input
 type="password"
 name="sifre"
 required
 value={formData.sifre}
 onChange={handleInputChange}
 placeholder="••••••••"
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2eb82e]"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kullanıcı Rolü *</label>
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={() => setFormData({ ...formData, rol: 'Personel' })}
 className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
 formData.rol === 'Personel'
 ? 'bg-emerald-100 dark:bg-emerald-950/80 border-[#2eb82e] text-[#2eb82e]'
 : ' text-slate-600 dark:text-slate-400'
 }`}
 >
 <UserCheck className="w-3.5 h-3.5" />
 <span>Personel</span>
 </button>
 <button
 type="button"
 onClick={() => setFormData({ ...formData, rol: 'Yönetici' })}
 className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
 formData.rol === 'Yönetici'
 ? 'bg-sky-950/80 border-[#0284c7] text-[#0284c7]'
 : ' text-slate-600 dark:text-slate-400'
 }`}
 >
 <Shield className="w-3.5 h-3.5" />
 <span>Yönetici</span>
 </button>
 </div>
 </div>

 <button
 type="submit"
 disabled={submitting}
 className="w-full py-3 hover:bg-[#269926] text-white font-bold text-sm rounded-xl -emerald-900/30 transition mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 neo-button-primary"
 >
 <UserPlus className="w-4 h-4" />
 <span>{submitting ? 'Kaydediliyor...' : 'Hesabı Oluştur'}</span>
 </button>
 </form>
 </div>

 {/* User List Table */}
 <div className="neo-card lg:col-span-2 rounded-3xl p-6 space-y-4">
 <div className="flex justify-between items-center border-b pb-3">
 <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Shield className="w-5 h-5 text-[#0284c7]" />
 <span>Sistemdeki Giriş Hesapları ({kullanicilar.length})</span>
 </h2>

 <button
 type="button"
 onClick={fetchKullanicilar}
 className="p-2 hover: dark:hover: text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer neo-button"
 title="Yenile"
 >
 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
 </button>
 </div>

 <div className="hidden md:block overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
 <th className="py-3 px-4">KULLANICI ADI</th>
 <th className="py-3 px-4">AD SOYAD</th>
 <th className="py-3 px-4">YETKİ ROLÜ</th>
 <th className="py-3 px-4 text-right">İŞLEMLER</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60 text-sm">
 {loading ? (
 <tr>
 <td colSpan="4" className="text-center py-8 text-slate-400">Yükleniyor...</td>
 </tr>
 ) : kullanicilar.length === 0 ? (
 <tr>
 <td colSpan="4" className="text-center py-8 text-slate-400">Kullanıcı bulunamadı.</td>
 </tr>
 ) : (
 kullanicilar.map((u) => (
 <tr key={u.id} className="hover: dark:hover: transition-colors">
 <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <span>@{u.kullanici_adi}</span>
 {u.kullanici_adi === 'doruk' && (
 <span className="text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-md font-semibold">Ana Admin</span>
 )}
 </td>
 <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{u.ad_soyad || '-'}</td>
 <td className="py-3.5 px-4">
 {u.rol === 'Yönetici' ? (
 <span className="bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800/80 text-xs px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1">
 <Shield className="w-3.5 h-3.5" />
 <span>Yönetici</span>
 </span>
 ) : (
 <span className="bg-emerald-100 dark:bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#2eb82e] border border-emerald-300 dark:border-emerald-800/80 text-xs px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1">
 <UserCheck className="w-3.5 h-3.5" />
 <span>Personel</span>
 </span>
 )}
 </td>
 <td className="py-3.5 px-4 text-right">
 {u.kullanici_adi !== 'doruk' ? (
 <button
 type="button"
 onClick={() => handleDeleteUser(u.id, u.kullanici_adi)}
 className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
 title="Kullanıcıyı Sil"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 ) : (
 <span className="text-xs text-slate-400 italic">Korumalı</span>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* TAB 2: ÖĞRETMEN YÖNETİMİ & DEĞERLENDİRME */}
 {activeTab === 'ogretmenler' && (
 <div className="space-y-6 animate-scale-in">
 
 {/* Top Stats & Quick Action Bar */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="neo-card -sky-200 dark:-sky-500/30 rounded-3xl p-5 flex items-center gap-4 bg-sky-500/5">
 <div className="neo-card w-12 h-12 rounded-2xl bg-sky-500/15 -sky-500/30 flex items-center justify-center text-sky-500 shrink-0">
 <GraduationCap className="w-6 h-6" />
 </div>
 <div>
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Kayıtlı Öğretmen Kadrosu</span>
 <span className="text-2xl font-black text-sky-600 dark:text-sky-300">{teachers.length} Eğitmen</span>
 </div>
 </div>

 <div className="neo-card -emerald-200 dark:-emerald-500/30 rounded-3xl p-5 flex items-center gap-4 bg-emerald-500/5">
 <div className="neo-card w-12 h-12 rounded-2xl bg-emerald-500/15 -emerald-500/30 flex items-center justify-center text-[#2eb82e] shrink-0">
 <Star className="w-6 h-6 fill-amber-400" />
 </div>
 <div>
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Ortalama Performans Puanı</span>
 <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{avgTeacherRating} / 5.0</span>
 </div>
 </div>

 <div className="neo-card -indigo-200 dark:-indigo-500/30 rounded-3xl p-5 flex flex-col justify-between gap-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Hızlı İşlemler</span>
 <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
 {teacherEvals.length} Değerlendirme Kayıtlı
 </span>
 </div>

 <div className="grid grid-cols-2 gap-2 w-full">
 <button
 type="button"
 onClick={openAddTeacherModal}
 className="w-full py-2 px-2 hover:bg-[#269926] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer truncate neo-button-primary"
 >
 <UserPlus className="w-3.5 h-3.5 shrink-0" />
 <span className="truncate">Öğretmen Ekle</span>
 </button>
 <button
 type="button"
 onClick={() => openAddEvalModal('ogretmen')}
 className="w-full py-2 px-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer truncate"
 >
 <Plus className="w-3.5 h-3.5 shrink-0" />
 <span className="truncate">Değerlendirme</span>
 </button>
 </div>
 </div>
 </div>

 {/* Sub Navigation Bar */}
 <div className="neo-card p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
 <div className="neo-card flex items-center gap-2 p-1.5 rounded-2xl w-full sm:w-auto">
 <button
 type="button"
 onClick={() => setOgretmenSubTab('all')}
 className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
 ogretmenSubTab === 'all'
 ? 'bg-sky-600 text-white '
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 <Layers className="w-3.5 h-3.5" />
 <span>Tümü</span>
 </button>
 <button
 type="button"
 onClick={() => setOgretmenSubTab('kadro')}
 className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
 ogretmenSubTab === 'kadro'
 ? 'bg-sky-600 text-white '
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 <Users className="w-3.5 h-3.5" />
 <span>Öğretmen Listesi & Kaydı ({teachers.length})</span>
 </button>
 <button
 type="button"
 onClick={() => setOgretmenSubTab('degerlendirmeler')}
 className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
 ogretmenSubTab === 'degerlendirmeler'
 ? 'bg-sky-600 text-white '
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 <Star className="w-3.5 h-3.5" />
 <span>Değerlendirmeler ({teacherEvals.length})</span>
 </button>
 </div>

 {/* Search Box */}
 <div className="relative w-full sm:w-64">
 <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
 <input
 type="text"
 placeholder="Öğretmen ara veya branş..."
 value={teacherSearch}
 onChange={(e) => setTeacherSearch(e.target.value)}
 className="w-full rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 neo-input"
 />
 </div>
 </div>

 {/* SECTION A: ÖĞRETMEN KADROSU LİSTESİ */}
 {(ogretmenSubTab === 'all' || ogretmenSubTab === 'kadro') && (
 <div className="neo-card rounded-3xl p-6 space-y-4">
 <div className="flex justify-between items-center border-b pb-4">
 <div>
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <GraduationCap className="w-5 h-5 text-sky-500" />
 <span>Öğretmen Kadrosu Bilgileri ({filteredTeachers.length})</span>
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sistemde kayıtlı eğitmenlerin iletişim, branş ve özlük bilgileri</p>
 </div>

 <button
 type="button"
 onClick={openAddTeacherModal}
 className="flex items-center gap-2 px-4 py-2 hover:bg-[#269926] text-white font-bold text-xs rounded-xl transition cursor-pointer neo-button-primary"
 >
 <UserPlus className="w-4 h-4" />
 <span>Yeni Öğretmen Ekle</span>
 </button>
 </div>

 {filteredTeachers.length === 0 ? (
 <div className="neo-card rounded-2xl p-10 text-center text-slate-400">
 <GraduationCap className="w-10 h-10 mx-auto text-slate-400 mb-2" />
 <p className="font-bold text-slate-700 dark:text-slate-300">Henüz Kayıtlı Öğretmen Bulunamadı</p>
 <p className="text-xs text-slate-500 mt-1">"Yeni Öğretmen Ekle" butonuna basarak ilk öğretmeninizi ekleyebilirsiniz.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {filteredTeachers.map((teacher) => {
 const empEvals = teacherEvals.filter(e => e.isim.toLowerCase() === teacher.isim.toLowerCase());
 const avgEmpRating = empEvals.length > 0
 ? (empEvals.reduce((acc, c) => acc + c.puan, 0) / empEvals.length).toFixed(1)
 : null;

 return (
 <div
 key={teacher.id}
 className="neo-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:-amber-500/60 transition group"
 >
 <div>
 {/* Card Header */}
 <div className="flex justify-between items-start gap-2 border-b pb-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 font-bold shrink-0 text-base">
 {teacher.isim.charAt(0)}
 </div>
 <div>
 <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
 <span>{teacher.isim}</span>
 </h3>
 <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-md mt-0.5">
 <BookOpen className="w-3 h-3 text-indigo-500" />
 <span>{teacher.brans || 'Genel Eğitmen'}</span>
 </span>
 </div>
 </div>

 <div className="flex items-center gap-1 shrink-0">
 <button
 type="button"
 onClick={() => openEditTeacherModal(teacher)}
 className="p-1.5 text-slate-400 hover:text-amber-500 hover: dark:hover: rounded-lg transition cursor-pointer"
 title="Bilgileri Düzenle"
 >
 <Edit3 className="w-4 h-4" />
 </button>
 <button
 type="button"
 onClick={() => handleDeleteTeacher(teacher.id, teacher.isim)}
 className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
 title="Öğretmeni Sil"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Details */}
 <div className="space-y-2 mt-3 text-xs text-slate-600 dark:text-slate-300">
 {teacher.telefon && (
 <div className="flex items-center gap-2">
 <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
 <span>{teacher.telefon}</span>
 </div>
 )}
 {teacher.eposta && (
 <div className="flex items-center gap-2">
 <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
 <span className="truncate">{teacher.eposta}</span>
 </div>
 )}
 {teacher.baslamaTarihi && (
 <div className="flex items-center gap-2 text-[11px] text-slate-500">
 <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
 <span>İşe Başlama: {teacher.baslamaTarihi}</span>
 </div>
 )}
 {teacher.notlar && (
 <p className="text-[11px] text-slate-500 dark:text-slate-400 italic p-2 rounded-lg border">
 {teacher.notlar}
 </p>
 )}
 </div>

 {/* Verdiği Dersler & Sınıflar */}
 {(() => {
 const teacherLessons = [];
 const seen = new Set();
 const tName = (teacher.isim || '').toLowerCase().trim();

 if (tName && Array.isArray(siniflar)) {
 siniflar.forEach(s => {
 if (s.ders_programi && Array.isArray(s.ders_programi)) {
 s.ders_programi.forEach(dp => {
 if (dp.ogretmen_adi && dp.ogretmen_adi.toLowerCase().trim() === tName) {
 const key = `${s.sinif_adi}_${dp.gun || ''}_${dp.baslangic_saati || ''}`;
 if (!seen.has(key)) {
 seen.add(key);
 teacherLessons.push({
 sinif_adi: s.sinif_adi,
 ders_adi: dp.ders_adi || s.sinif_adi,
 gun: dp.gun,
 saat: dp.baslangic_saati ? `${dp.baslangic_saati} - ${dp.bitis_saati}` : null
 });
 }
 }
 });
 }
 });
 }

 return (
 <div className="pt-3 border-t space-y-1.5">
 <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
 <span className="flex items-center gap-1.5">
 <BookOpen className="w-3.5 h-3.5 text-sky-500" />
 <span>Verdiği Dersler & Sınıflar</span>
 </span>
 {teacherLessons.length > 0 && (
 <span className="text-[10px] font-extrabold bg-sky-500/15 text-sky-600 dark:text-sky-300 px-2 py-0.5 rounded-md border border-sky-500/30">
 {teacherLessons.length} Aktif Sınıf
 </span>
 )}
 </div>

 {teacherLessons.length > 0 ? (
 <div className="flex flex-wrap gap-1.5 pt-0.5">
 {teacherLessons.map((l, idx) => (
 <div
 key={idx}
 className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/30 text-sky-900 dark:text-sky-200 rounded-xl text-xs font-semibold"
 >
 <Clock className="w-3 h-3 text-sky-500 shrink-0" />
 <span className="font-bold">{l.sinif_adi}</span>
 {l.gun && <span className="opacity-80 text-[10px]">({l.gun} {l.saat})</span>}
 </div>
 ))}
 </div>
 ) : (
 <div className="flex items-center gap-2 pt-0.5">
 <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/30 text-sky-800 dark:text-sky-300 rounded-lg text-xs font-bold">
 <BookOpen className="w-3 h-3 text-sky-500" />
 {teacher.brans || 'Genel Eğitmen'}
 </span>
 <span className="text-[11px] text-slate-400 italic">
 (Atama bekleniyor)
 </span>
 </div>
 )}
 </div>
 );
 })()}
 </div>

 {/* Card Footer Actions */}
 <div className="pt-3 border-t flex items-center justify-between gap-2">
 <div className="flex items-center gap-1 text-xs">
 {avgEmpRating ? (
 <span className="font-bold text-amber-500 flex items-center gap-1">
 <Star className="w-3.5 h-3.5 fill-amber-400" />
 {avgEmpRating}
 </span>
 ) : (
 <span className="text-[11px] text-slate-400">Henüz puan yok</span>
 )}
 </div>

 <button
 type="button"
 onClick={() => openAddEvalModal('ogretmen', teacher.isim, teacher.brans)}
 className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
 >
 <Star className="w-3 h-3" />
 <span>Değerlendirme Yap</span>
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}

 {/* SECTION B: ÖĞRETMEN PERFORMANS DEĞERLENDİRMELERİ */}
 {(ogretmenSubTab === 'all' || ogretmenSubTab === 'degerlendirmeler') && (
 <div className="neo-card rounded-3xl p-6 space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
 <div>
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
 <span>Öğretmen Performans Değerlendirmeleri ({teacherEvals.length})</span>
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Eğitmen ders içi performansı, veli memnuniyeti ve notlar</p>
 </div>

 <button
 type="button"
 onClick={() => openAddEvalModal('ogretmen')}
 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 <span>Değerlendirme Ekle</span>
 </button>
 </div>

 {teacherEvals.length === 0 ? (
 <div className="neo-card rounded-2xl p-10 text-center text-slate-400">
 <Star className="w-10 h-10 mx-auto text-slate-400 mb-2" />
 <p className="font-bold text-slate-700 dark:text-slate-300">Henüz Kayıtlı Öğretmen Değerlendirmesi Yok</p>
 <p className="text-xs text-slate-500 mt-1">Öğretmenlerinize ait ders performansı değerlendirmesini yukarıdaki butondan ekleyebilirsiniz.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {teacherEvals.map((item) => {
 const displayName = item.isim || item.ogretmen_adi;
 const displayUnvan = item.unvan || item.brans;

 return (
 <div
 key={item.id}
 className="neo-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:-amber-500/60 transition"
 >
 <div>
 {/* Top Bar: Name & Actions */}
 <div className="flex justify-between items-start gap-2 border-b pb-3">
 <div>
 <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
 <GraduationCap className="w-4 h-4 text-emerald-500" />
 <span>{displayName}</span>
 </h3>
 {displayUnvan && (
 <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 mt-1 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-0.5 rounded-lg">
 <BookOpen className="w-3 h-3 text-indigo-500" />
 <span>{displayUnvan}</span>
 </span>
 )}
 </div>

 <div className="flex items-center gap-1 shrink-0">
 <button
 type="button"
 onClick={() => openEditEvalModal(item)}
 className="p-1.5 text-slate-400 hover:text-amber-500 hover: dark:hover: rounded-lg transition cursor-pointer"
 title="Düzenle"
 >
 <Edit3 className="w-4 h-4" />
 </button>
 <button
 type="button"
 onClick={() => handleDeleteEval(item.id, displayName)}
 className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
 title="Sil"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Stars Rating */}
 <div className="flex items-center justify-between mt-3 p-3 rounded-xl border">
 <div className="flex items-center gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 className={`w-4 h-4 ${
 star <= Math.floor(item.puan)
 ? 'text-amber-400 fill-amber-400'
 : star - 0.5 <= item.puan
 ? 'text-amber-400 fill-amber-400 opacity-70'
 : 'text-slate-700 dark:text-slate-300 dark:text-slate-700'
 }`}
 />
 ))}
 </div>
 <span className="font-black text-amber-600 dark:text-amber-300 text-sm">{item.puan} / 5.0</span>
 </div>

 {/* Feedback Notes */}
 {item.notlar && (
 <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 p-3 rounded-xl border italic leading-relaxed">
 "{item.notlar}"
 </div>
 )}

 {/* Category Badges */}
 {item.kategoriler && item.kategoriler.length > 0 && (
 <div className="flex flex-wrap gap-1.5 mt-3">
 {item.kategoriler.map((cat, idx) => (
 <span
 key={idx}
 className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-[#2eb82e] border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1"
 >
 <ThumbsUp className="w-2.5 h-2.5" />
 <span>{cat}</span>
 </span>
 ))}
 </div>
 )}
 </div>

 <div className="text-[11px] text-slate-500 pt-2 border-t flex items-center justify-between">
 <span className="flex items-center gap-1">
 <Calendar className="w-3 h-3 text-slate-400" />
 <span>Tarih: {item.tarih}</span>
 </span>
 <span className="text-[#2eb82e] font-bold">Öğretmen Kadrosu</span>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {/* TAB 3: PERSONEL YÖNETİMİ & DEĞERLENDİRME */}
 {activeTab === 'personel' && (
 <div className="space-y-6 animate-scale-in">
 
 {/* Top Stats & Quick Action Bar */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="neo-card -sky-200 dark:-sky-500/30 rounded-3xl p-5 flex items-center gap-4 bg-sky-500/5">
 <div className="neo-card w-12 h-12 rounded-2xl bg-sky-500/15 -sky-500/30 flex items-center justify-center text-sky-500 shrink-0">
 <Briefcase className="w-6 h-6" />
 </div>
 <div>
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Kayıtlı İdari Personel</span>
 <span className="text-2xl font-black text-sky-600 dark:text-sky-300">{staff.length} Personel</span>
 </div>
 </div>

 <div className="neo-card -indigo-200 dark:-indigo-500/30 rounded-3xl p-5 flex items-center gap-4 bg-indigo-500/5">
 <div className="neo-card w-12 h-12 rounded-2xl bg-indigo-500/15 -indigo-500/30 flex items-center justify-center text-indigo-500 shrink-0">
 <Star className="w-6 h-6 fill-sky-400" />
 </div>
 <div>
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Ortalama Personel Puanı</span>
 <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{avgStaffRating} / 5.0</span>
 </div>
 </div>

 <div className="neo-card -emerald-200 dark:-emerald-500/30 rounded-3xl p-5 flex flex-col justify-between gap-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Hızlı İşlemler</span>
 <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
 {staffEvals.length} Değerlendirme Kayıtlı
 </span>
 </div>

 <div className="grid grid-cols-2 gap-2 w-full">
 <button
 type="button"
 onClick={openAddStaffModal}
 className="w-full py-2 px-2 hover:bg-[#269926] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer truncate neo-button-primary"
 >
 <UserPlus className="w-3.5 h-3.5 shrink-0" />
 <span className="truncate">Personel Ekle</span>
 </button>
 <button
 type="button"
 onClick={() => openAddEvalModal('personel')}
 className="w-full py-2 px-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer truncate"
 >
 <Plus className="w-3.5 h-3.5 shrink-0" />
 <span className="truncate">Değerlendirme</span>
 </button>
 </div>
 </div>
 </div>

 {/* Sub Navigation Bar */}
 <div className="neo-card p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
 <div className="neo-card flex items-center gap-2 p-1.5 rounded-2xl w-full sm:w-auto">
 <button
 type="button"
 onClick={() => setPersonelSubTab('all')}
 className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
 personelSubTab === 'all'
 ? 'bg-sky-500 text-white '
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 <Layers className="w-3.5 h-3.5" />
 <span>Tümü</span>
 </button>
 <button
 type="button"
 onClick={() => setPersonelSubTab('kadro')}
 className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
 personelSubTab === 'kadro'
 ? 'bg-sky-500 text-white '
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 <Users className="w-3.5 h-3.5" />
 <span>Personel Listesi & Kaydı ({staff.length})</span>
 </button>
 <button
 type="button"
 onClick={() => setPersonelSubTab('degerlendirmeler')}
 className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
 personelSubTab === 'degerlendirmeler'
 ? 'bg-sky-500 text-white '
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 <Star className="w-3.5 h-3.5" />
 <span>Değerlendirmeler ({staffEvals.length})</span>
 </button>
 </div>

 {/* Search Box */}
 <div className="relative w-full sm:w-64">
 <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
 <input
 type="text"
 placeholder="Personel ara veya unvan..."
 value={staffSearch}
 onChange={(e) => setStaffSearch(e.target.value)}
 className="w-full rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 neo-input"
 />
 </div>
 </div>

 {/* SECTION A: PERSONEL KADROSU LİSTESİ */}
 {(personelSubTab === 'all' || personelSubTab === 'kadro') && (
 <div className="neo-card rounded-3xl p-6 space-y-4">
 <div className="flex justify-between items-center border-b pb-4">
 <div>
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Briefcase className="w-5 h-5 text-sky-500" />
 <span>İdari Personel Kadrosu ({filteredStaff.length})</span>
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sistemde kayıtlı ön büro, idari ve operasyonel personel kayıtları</p>
 </div>

 <button
 type="button"
 onClick={openAddStaffModal}
 className="flex items-center gap-2 px-4 py-2 hover:bg-[#269926] text-white font-bold text-xs rounded-xl transition cursor-pointer neo-button-primary"
 >
 <UserPlus className="w-4 h-4" />
 <span>Yeni Personel Ekle</span>
 </button>
 </div>

 {filteredStaff.length === 0 ? (
 <div className="neo-card rounded-2xl p-10 text-center text-slate-400">
 <Briefcase className="w-10 h-10 mx-auto text-slate-400 mb-2" />
 <p className="font-bold text-slate-700 dark:text-slate-300">Henüz Kayıtlı Personel Bulunamadı</p>
 <p className="text-xs text-slate-500 mt-1">"Yeni Personel Ekle" butonuna basarak ilk idari personelinizi ekleyebilirsiniz.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {filteredStaff.map((item) => {
 const empEvals = staffEvals.filter(e => e.isim.toLowerCase() === item.isim.toLowerCase());
 const avgEmpRating = empEvals.length > 0
 ? (empEvals.reduce((acc, c) => acc + c.puan, 0) / empEvals.length).toFixed(1)
 : null;

 return (
 <div
 key={item.id}
 className="neo-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:-sky-500/60 transition group"
 >
 <div>
 {/* Card Header */}
 <div className="flex justify-between items-start gap-2 border-b pb-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 font-bold shrink-0 text-base">
 {item.isim.charAt(0)}
 </div>
 <div>
 <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
 <span>{item.isim}</span>
 </h3>
 <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 rounded-md mt-0.5">
 <Briefcase className="w-3 h-3 text-sky-500" />
 <span>{item.unvan || 'İdari Personel'}</span>
 </span>
 </div>
 </div>

 <div className="flex items-center gap-1 shrink-0">
 <button
 type="button"
 onClick={() => openEditStaffModal(item)}
 className="p-1.5 text-slate-400 hover:text-sky-500 hover: dark:hover: rounded-lg transition cursor-pointer"
 title="Bilgileri Düzenle"
 >
 <Edit3 className="w-4 h-4" />
 </button>
 <button
 type="button"
 onClick={() => handleDeleteStaff(item.id, item.isim)}
 className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
 title="Personeli Sil"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Details */}
 <div className="space-y-2 mt-3 text-xs text-slate-600 dark:text-slate-300">
 {item.telefon && (
 <div className="flex items-center gap-2">
 <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
 <span>{item.telefon}</span>
 </div>
 )}
 {item.eposta && (
 <div className="flex items-center gap-2">
 <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
 <span className="truncate">{item.eposta}</span>
 </div>
 )}
 {item.baslamaTarihi && (
 <div className="flex items-center gap-2 text-[11px] text-slate-500">
 <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
 <span>İşe Başlama: {item.baslamaTarihi}</span>
 </div>
 )}
 {item.notlar && (
 <p className="text-[11px] text-slate-500 dark:text-slate-400 italic p-2 rounded-lg border">
 {item.notlar}
 </p>
 )}
 </div>
 </div>

 {/* Card Footer Actions */}
 <div className="pt-3 border-t flex items-center justify-between gap-2">
 <div className="flex items-center gap-1 text-xs">
 {avgEmpRating ? (
 <span className="font-bold text-sky-500 flex items-center gap-1">
 <Star className="w-3.5 h-3.5 fill-sky-400" />
 {avgEmpRating}
 </span>
 ) : (
 <span className="text-[11px] text-slate-400">Henüz puan yok</span>
 )}
 </div>

 <button
 type="button"
 onClick={() => openAddEvalModal('personel', item.isim, item.unvan)}
 className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-700 dark:text-sky-300 hover:text-white border border-sky-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
 >
 <Star className="w-3 h-3" />
 <span>Değerlendirme Yap</span>
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}

 {/* SECTION B: PERSONEL PERFORMANS DEĞERLENDİRMELERİ */}
 {(personelSubTab === 'all' || personelSubTab === 'degerlendirmeler') && (
 <div className="neo-card rounded-3xl p-6 space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
 <div>
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
 <Briefcase className="w-5 h-5 text-sky-500" />
 <span>Personel Performans Değerlendirmeleri ({staffEvals.length})</span>
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Danışma, muhasebe ve operasyonel personel performans kayıtları</p>
 </div>

 <button
 type="button"
 onClick={() => openAddEvalModal('personel')}
 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-bold text-xs rounded-xl transition cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 <span>Değerlendirme Ekle</span>
 </button>
 </div>

 {staffEvals.length === 0 ? (
 <div className="neo-card rounded-2xl p-10 text-center text-slate-400">
 <Briefcase className="w-10 h-10 mx-auto text-slate-400 mb-2" />
 <p className="font-bold text-slate-700 dark:text-slate-300">Henüz Kayıtlı Personel Değerlendirmesi Yok</p>
 <p className="text-xs text-slate-500 mt-1">İdari personel ve destek kadronuza ait performans değerlendirmelerini yukarıdaki butondan ekleyebilirsiniz.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {staffEvals.map((item) => {
 const displayName = item.isim || item.personel_adi;
 const displayUnvan = item.unvan || item.gorev;

 return (
 <div
 key={item.id}
 className="neo-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:-sky-500/60 transition"
 >
 <div>
 {/* Top Bar: Name & Actions */}
 <div className="flex justify-between items-start gap-2 border-b pb-3">
 <div>
 <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
 <User className="w-4 h-4 text-sky-500" />
 <span>{displayName}</span>
 </h3>
 {displayUnvan && (
 <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-300 mt-1 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/60 px-2.5 py-0.5 rounded-lg">
 <Briefcase className="w-3 h-3 text-sky-500" />
 <span>{displayUnvan}</span>
 </span>
 )}
 </div>

 <div className="flex items-center gap-1 shrink-0">
 <button
 type="button"
 onClick={() => openEditEvalModal(item)}
 className="p-1.5 text-slate-400 hover:text-sky-500 hover: dark:hover: rounded-lg transition cursor-pointer"
 title="Düzenle"
 >
 <Edit3 className="w-4 h-4" />
 </button>
 <button
 type="button"
 onClick={() => handleDeleteEval(item.id, displayName)}
 className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
 title="Sil"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Stars Rating */}
 <div className="flex items-center justify-between mt-3 p-3 rounded-xl border">
 <div className="flex items-center gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 className={`w-4 h-4 ${
 star <= Math.floor(item.puan)
 ? 'text-sky-500 fill-sky-400'
 : star - 0.5 <= item.puan
 ? 'text-sky-500 fill-sky-400 opacity-70'
 : 'text-slate-700 dark:text-slate-300 dark:text-slate-700'
 }`}
 />
 ))}
 </div>
 <span className="font-black text-sky-600 dark:text-sky-300 text-sm">{item.puan} / 5.0</span>
 </div>

 {/* Feedback Notes */}
 {item.notlar && (
 <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 p-3 rounded-xl border italic leading-relaxed">
 "{item.notlar}"
 </div>
 )}

 {/* Category Badges */}
 {item.kategoriler && item.kategoriler.length > 0 && (
 <div className="flex flex-wrap gap-1.5 mt-3">
 {item.kategoriler.map((cat, idx) => (
 <span
 key={idx}
 className="text-[10px] font-bold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 rounded-full flex items-center gap-1"
 >
 <ThumbsUp className="w-2.5 h-2.5" />
 <span>{cat}</span>
 </span>
 ))}
 </div>
 )}
 </div>

 <div className="text-[11px] text-slate-500 pt-2 border-t flex items-center justify-between">
 <span className="flex items-center gap-1">
 <Calendar className="w-3 h-3 text-slate-400" />
 <span>Tarih: {item.tarih}</span>
 </span>
 <span className="text-sky-500 font-bold">İdari Personel</span>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {/* MODAL 1: ÖĞRETMEN EKLE / DÜZENLE */}
 {showTeacherModal && (
 <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
 <div className="neo-card rounded-3xl max-w-md w-full p-6 space-y-5 animate-scale-in text-slate-800 dark:text-slate-100">
 <div className="flex justify-between items-center border-b pb-3">
 <h3 className="text-base font-bold flex items-center gap-2">
 <GraduationCap className="w-5 h-5 text-amber-500" />
 <span>{editingTeacher ? 'Öğretmen Bilgilerini Düzenle' : 'Yeni Öğretmen Kaydı Ekle'}</span>
 </h3>
 <button
 type="button"
 onClick={() => setShowTeacherModal(false)}
 className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSaveTeacher} className="space-y-4 text-sm">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ad Soyad *</label>
 <input
 type="text"
 required
 placeholder="Örn: Ahmet Yılmaz"
 value={teacherForm.isim}
 onChange={(e) => setTeacherForm({ ...teacherForm, isim: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Branş / Uzmanlık *</label>
 <input
 type="text"
 required
 placeholder="Örn: Piyano & Solfej, Keman, Solfej..."
 value={teacherForm.brans}
 onChange={(e) => setTeacherForm({ ...teacherForm, brans: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
 <input
 type="text"
 placeholder="05xx xxx xx xx"
 value={teacherForm.telefon}
 onChange={(e) => setTeacherForm({ ...teacherForm, telefon: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">İşe Başlama Tarihi</label>
 <input
 type="date"
 value={teacherForm.baslamaTarihi}
 onChange={(e) => setTeacherForm({ ...teacherForm, baslamaTarihi: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-posta Adresi</label>
 <input
 type="email"
 placeholder="ornek@akademisaas.com"
 value={teacherForm.eposta}
 onChange={(e) => setTeacherForm({ ...teacherForm, eposta: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Özel Notlar / Açıklama</label>
 <textarea
 rows="2"
 placeholder="Eğitmen uzmanlığı, ders günleri veya ekstra notlar..."
 value={teacherForm.notlar}
 onChange={(e) => setTeacherForm({ ...teacherForm, notlar: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
 ></textarea>
 </div>

 <div className="flex justify-end gap-3 pt-3 border-t">
 <button
 type="button"
 onClick={() => setShowTeacherModal(false)}
 className="px-4 py-2 hover: dark:hover: text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
 >
 İptal
 </button>
 <button
 type="submit"
 className="px-5 py-2 hover:bg-[#269926] text-white text-xs font-black rounded-xl transition cursor-pointer neo-button-primary"
 >
 {editingTeacher ? 'Güncelle' : 'Kaydet'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* MODAL 2: PERSONEL EKLE / DÜZENLE */}
 {showStaffModal && (
 <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
 <div className="neo-card rounded-3xl max-w-md w-full p-6 space-y-5 animate-scale-in text-slate-800 dark:text-slate-100">
 <div className="flex justify-between items-center border-b pb-3">
 <h3 className="text-base font-bold flex items-center gap-2">
 <Briefcase className="w-5 h-5 text-sky-500" />
 <span>{editingStaff ? 'Personel Bilgilerini Düzenle' : 'Yeni İdari Personel Kaydı Ekle'}</span>
 </h3>
 <button
 type="button"
 onClick={() => setShowStaffModal(false)}
 className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSaveStaff} className="space-y-4 text-sm">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ad Soyad *</label>
 <input
 type="text"
 required
 placeholder="Örn: Selin Tekin"
 value={staffForm.isim}
 onChange={(e) => setStaffForm({ ...staffForm, isim: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Görev / Unvan *</label>
 <input
 type="text"
 required
 placeholder="Örn: Danışma & Ön Büro, İdari İşler, Muhasebe..."
 value={staffForm.unvan}
 onChange={(e) => setStaffForm({ ...staffForm, unvan: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
 <input
 type="text"
 placeholder="05xx xxx xx xx"
 value={staffForm.telefon}
 onChange={(e) => setStaffForm({ ...staffForm, telefon: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">İşe Başlama Tarihi</label>
 <input
 type="date"
 value={staffForm.baslamaTarihi}
 onChange={(e) => setStaffForm({ ...staffForm, baslamaTarihi: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-posta Adresi</label>
 <input
 type="email"
 placeholder="ornek@akademisaas.com"
 value={staffForm.eposta}
 onChange={(e) => setStaffForm({ ...staffForm, eposta: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Özel Notlar / Açıklama</label>
 <textarea
 rows="2"
 placeholder="Görev tanımı, vardiya bilgileri..."
 value={staffForm.notlar}
 onChange={(e) => setStaffForm({ ...staffForm, notlar: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
 ></textarea>
 </div>

 <div className="flex justify-end gap-3 pt-3 border-t">
 <button
 type="button"
 onClick={() => setShowStaffModal(false)}
 className="px-4 py-2 hover: dark:hover: text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
 >
 İptal
 </button>
 <button
 type="submit"
 className="px-5 py-2 hover:bg-[#269926] text-white text-xs font-black rounded-xl transition cursor-pointer neo-button-primary"
 >
 {editingStaff ? 'Güncelle' : 'Kaydet'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* MODAL 3: YENİ / DÜZENLE DEĞERLENDİRME */}
 {showEvalModal && (
 <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
 <div className="neo-card rounded-3xl max-w-md w-full p-6 space-y-5 animate-scale-in text-slate-800 dark:text-slate-100">
 <div className="flex justify-between items-center border-b pb-3">
 <h3 className="text-base font-bold flex items-center gap-2">
 <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
 <span>
 {editingEval 
 ? `${evalForm.tur === 'ogretmen' ? 'Öğretmen' : 'Personel'} Değerlendirmesini Düzenle`
 : `Yeni ${evalForm.tur === 'ogretmen' ? 'Öğretmen' : 'Personel'} Değerlendirmesi Ekle`
 }
 </span>
 </h3>
 <button
 type="button"
 onClick={() => setShowEvalModal(false)}
 className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSaveEval} className="space-y-4 text-sm">
 {/* Type Switcher */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Değerlendirme Kategori Tipi *</label>
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={() => {
 setEvalForm({ ...evalForm, tur: 'ogretmen', selectedEmployeeId: '', isim: '', unvan: '' });
 }}
 className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
 evalForm.tur === 'ogretmen'
 ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-500 text-amber-800 dark:text-amber-400'
 : ' text-slate-600 dark:text-slate-400'
 }`}
 >
 <GraduationCap className="w-4 h-4" />
 <span>Öğretmen</span>
 </button>
 <button
 type="button"
 onClick={() => {
 setEvalForm({ ...evalForm, tur: 'personel', selectedEmployeeId: '', isim: '', unvan: '' });
 }}
 className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
 evalForm.tur === 'personel'
 ? 'bg-sky-100 dark:bg-sky-950/80 border-sky-500 text-sky-800 dark:text-sky-300'
 : ' text-slate-600 dark:text-slate-400'
 }`}
 >
 <Briefcase className="w-4 h-4" />
 <span>Personel</span>
 </button>
 </div>
 </div>

 {/* Employee Selector Dropdown */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Çalışan Seçin (İsteğe Bağlı)
 </label>
 <SearchableSelect
 value={evalForm.selectedEmployeeId}
 onChange={(val) => handleSelectEmployeeForEval(val)}
 options={evalForm.tur === 'ogretmen' 
   ? teachers.map(t => ({ value: t.id, label: `${t.isim} (${t.brans})` }))
   : staff.map(s => ({ value: s.id, label: `${s.isim} (${s.unvan})` }))
 }
 placeholder="-- Listeden Çalışan Seçin veya Manuel Girin --"
 searchPlaceholder="Çalışan ara..."
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 {evalForm.tur === 'ogretmen' ? 'Öğretmen Adı Soyadı *' : 'Personel Adı Soyadı *'}
 </label>
 <input
 type="text"
 required
 placeholder={evalForm.tur === 'ogretmen' ? 'Örn: Ahmet Yılmaz' : 'Örn: Selin Tekin'}
 value={evalForm.isim}
 onChange={(e) => setEvalForm({ ...evalForm, isim: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 {evalForm.tur === 'ogretmen' ? 'Uzmanlık Branşı / Ders' : 'Görev / Unvan'}
 </label>
 <input
 type="text"
 placeholder={evalForm.tur === 'ogretmen' ? 'Örn: Piyano, Keman...' : 'Örn: Danışma & Ön Büro...'}
 value={evalForm.unvan}
 onChange={(e) => setEvalForm({ ...evalForm, unvan: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
 />
 </div>

 {/* Star Rating Picker */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Performans Puanı (1 - 5 Yıldız)</label>
 <div className="flex items-center gap-2 p-3 rounded-xl border justify-between">
 <div className="flex items-center gap-1.5">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 type="button"
 onClick={() => setEvalForm({ ...evalForm, puan: star })}
 className="p-1 hover:scale-110 transition cursor-pointer"
 >
 <Star
 className={`w-6 h-6 ${
 star <= evalForm.puan 
 ? evalForm.tur === 'personel' ? 'text-sky-500 fill-sky-400' : 'text-amber-400 fill-amber-400'
 : 'text-slate-700 dark:text-slate-300 dark:text-slate-700'
 }`}
 />
 </button>
 ))}
 </div>
 <span className={`font-black text-base ${evalForm.tur === 'personel' ? 'text-sky-600 dark:text-sky-300' : 'text-amber-600 dark:text-amber-300'}`}>
 {evalForm.puan}.0 / 5.0
 </span>
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Değerlendirme Notu / Geri Bildirim</label>
 <textarea
 rows="3"
 placeholder={evalForm.tur === 'ogretmen' 
 ? 'Ders içi performansı, veli iletişimi ve yoklama düzeni...' 
 : 'Güler yüzlü hizmet, veli karşılama, operasyonel destek...'
 }
 value={evalForm.notlar}
 onChange={(e) => setEvalForm({ ...evalForm, notlar: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
 ></textarea>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Öne Çıkan Etiketler (Virgülle Ayırın)</label>
 <input
 type="text"
 placeholder="Örn: Güler Yüz, Hızlı İletişim, Zaman Yönetimi"
 value={evalForm.kategoriInput}
 onChange={(e) => setEvalForm({ ...evalForm, kategoriInput: e.target.value })}
 className="w-full px-3.5 py-2.5 neo-input w-full rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
 />
 </div>

 <div className="flex justify-end gap-3 pt-3 border-t">
 <button
 type="button"
 onClick={() => setShowEvalModal(false)}
 className="px-4 py-2 hover: dark:hover: text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
 >
 İptal
 </button>
 <button
 type="submit"
 className="px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-black rounded-xl transition cursor-pointer neo-button"
 >
 {editingEval ? 'Güncelle' : 'Kaydet'}
 </button>
 </div>
 </form>
 </div>
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

export default Kullanicilar;
