import React, { useState, useEffect } from 'react';
import { 
 UserPlus, 
 Search, 
 Phone, 
 User, 
 BookOpen, 
 Clock, 
 CheckCircle2, 
 PhoneOff, 
 GraduationCap, 
 Trash2, 
 RefreshCw,
 Sparkles,
 Users,
 UserCheck,
 Heart,
 X,
 Edit,
 Eye
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { 
 getOnKayitlar, 
 createOnKayit,
 updateOnKayit,
 updateOnKayitDurum, 
 deleteOnKayit,
 createOgrenci,
 getSiniflar,
 kaydetOgrenciSinif
} from '../services/api';

const DURUM_OPTIONS = [
 { value: 'Aranacak', label: 'Aranacak', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
 { value: 'Arandı', label: 'Arandı', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
 { value: 'Ulaşılamadı', label: 'Ulaşılamadı', color: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
 { value: 'Olumsuz', label: 'Olumsuz', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
 { value: 'Kesin Kayıt', label: 'Kesin Kayıt', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
];

const OnKayit = () => {
 const [kayitlar, setKayitlar] = useState([]);
 const [siniflar, setSiniflar] = useState([]);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedDurumFilter, setSelectedDurumFilter] = useState('Tümü');
 const [sortOption, setSortOption] = useState('tarih_desc');
 const [toastMessage, setToastMessage] = useState(null);

 // Form State (Yeni Ön Kayıt)
 const [formData, setFormData] = useState({
 ogrenci_adi: '',
 ogrenci_soyadi: '',
 veli_adi: '',
 veli_soyadi: '',
 veli_meslek: '',
 telefon: '',
 ilgilenilen_brans: '',
 notlar: '',
 durum: 'Aranacak',
 });

 const [isCustomBrans, setIsCustomBrans] = useState(false);
 const [customBransText, setCustomBransText] = useState('');

 const handleBransSelectChange = (e) => {
 const val = e.target.value;
 if (val === 'DIGER_MANUEL') {
 setIsCustomBrans(true);
 setFormData((prev) => ({ ...prev, ilgilenilen_brans: customBransText }));
 } else {
 setIsCustomBrans(false);
 setFormData((prev) => ({ ...prev, ilgilenilen_brans: val }));
 }
 };

 const handleCustomBransTextChange = (e) => {
 const text = e.target.value;
 setCustomBransText(text);
 setFormData((prev) => ({ ...prev, ilgilenilen_brans: text }));
 };

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

 // Düzenleme Modalı State
 const [showEditModal, setShowEditModal] = useState(false);
 const [editFormData, setEditFormData] = useState(null);

 const openEditModal = (item) => {
 setEditFormData({ ...item });
 setShowEditModal(true);
 };

 const handleEditInputChange = (e) => {
 const { name, value } = e.target;
 setEditFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleEditSubmit = async (e) => {
 e.preventDefault();
 if (!editFormData.ogrenci_adi.trim() || !editFormData.ogrenci_soyadi.trim()) {
 showToast('Öğrenci adı ve soyadı zorunludur.', 'error');
 return;
 }
 try {
 setSubmitting(true);
 await updateOnKayit(editFormData.id, editFormData);
 showToast('Kayıt başarıyla güncellendi.');
 setShowEditModal(false);
 fetchKayitlar();
 } catch (err) {
 console.error('Kayıt güncellenemedi:', err);
 showToast('Kayıt güncellenirken hata oluştu.', 'error');
 } finally {
 setSubmitting(false);
 }
 };

 // Modal State (Öğrenciye Dönüştürme / Kesin Kayıt Modalı)
 const [showConvertModal, setShowConvertModal] = useState(false);
 const [selectedKayit, setSelectedKayit] = useState(null);
 const [veliTuru, setVeliTuru] = useState('anne'); // 'anne' veya 'baba'
 const [convertFormData, setConvertFormData] = useState({
 isim: '',
 soyisim: '',
 tc: '',
 telefon: '',
 eposta: '',
 adres: '',
 sinif_adi: '',
 bakiye: 0.0,
 anne_isim: '',
 anne_tc: '',
 anne_telefon: '',
 anne_eposta: '',
 anne_meslek: '',
 baba_isim: '',
 baba_tc: '',
 baba_telefon: '',
 baba_eposta: '',
 baba_meslek: '',
 });

 useEffect(() => {
 fetchKayitlar();
 fetchSiniflar();
 }, []);

 const fetchSiniflar = async () => {
 try {
 const res = await getSiniflar();
 setSiniflar(res.data || []);
 } catch (err) {
 console.error('Sınıflar getirilemedi:', err);
 }
 };


 const fetchKayitlar = async () => {
 try {
 setLoading(true);
 const res = await getOnKayitlar();
 setKayitlar(res.data || []);
 } catch (err) {
 console.error('Ön kayıtlar yüklenirken hata oluştu:', err);
 showToast('Kayıtlar çekilirken bir hata oluştu.', 'error');
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

 const handleInputChange = (e) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!formData.ogrenci_adi.trim() || !formData.ogrenci_soyadi.trim()) {
 showToast('Öğrenci adı ve soyadı zorunludur.', 'error');
 return;
 }

 try {
 setSubmitting(true);
 const res = await createOnKayit(formData);
 showToast(`${res.data.ogrenci_adi} ${res.data.ogrenci_soyadi} ön kaydı başarıyla oluşturuldu!`);
 
 setIsCustomBrans(false);
 setCustomBransText('');
 setFormData({
 ogrenci_adi: '',
 ogrenci_soyadi: '',
 veli_adi: '',
 veli_soyadi: '',
 veli_meslek: '',
 telefon: '',
 ilgilenilen_brans: '',
 notlar: '',
 durum: 'Aranacak',
 });
 fetchKayitlar();
 } catch (err) {
 console.error('Ön kayıt oluşturulamadı:', err);
 showToast('Ön kayıt eklenirken bir hata oluştu.', 'error');
 } finally {
 setSubmitting(false);
 }
 };

 const handleDurumChange = async (id, newDurum) => {
 try {
 // Eğer kullanıcı "Kesin Kayıt" seçtiyse otomatik olarak Kesin Öğrenci Kaydı modalını açalım
 if (newDurum === 'Kesin Kayıt') {
 const item = kayitlar.find((k) => k.id === id);
 if (item) {
 openConvertModal(item);
 return;
 }
 }

 // Optimistic Update
 setKayitlar((prev) =>
 prev.map((k) => (k.id === id ? { ...k, durum: newDurum } : k))
 );
 await updateOnKayitDurum(id, newDurum);
 showToast(`Durum "${newDurum}" olarak güncellendi.`);
 } catch (err) {
 console.error('Durum güncellenemedi:', err);
 showToast('Durum güncellenirken bir hata oluştu.', 'error');
 fetchKayitlar();
 }
 };

 const handleDelete = (id, ogrenciIsmi) => {
 openConfirm({
 title: 'Ön Kayıt Silme Onayı',
 message: `"${ogrenciIsmi}" isimli ön kaydı silmek istediğinize emin misiniz?`,
 type: 'danger',
 confirmText: 'Ön Kaydı Sil',
 onConfirm: async () => {
 try {
 await deleteOnKayit(id);
 setKayitlar((prev) => prev.filter((k) => k.id !== id));
 showToast('Kayıt başarıyla silindi.');
 } catch (err) {
 console.error('Kayıt silinemedi:', err);
 showToast('Silme işlemi sırasında hata oluştu.', 'error');
 }
 }
 });
 };

 // ==================== ÖĞRENCİYE DÖNÜŞTÜRME / KESİN KAYIT MODAL MANTIĞI ====================
 const openConvertModal = (item) => {
 setSelectedKayit(item);
 const veliTamIsim = `${item.veli_adi || ''} ${item.veli_soyadi || ''}`.trim();
 const defaultVeliTuru = 'anne'; // Varsayılan olarak anne seçili gelsin
 setVeliTuru(defaultVeliTuru);

 setConvertFormData({
 isim: item.ogrenci_adi || '',
 soyisim: item.ogrenci_soyadi || '',
 tc: '',
 telefon: item.telefon || '',
 eposta: '',
 adres: '',
 sinif_adi: item.ilgilenilen_brans || '',
 bakiye: 0.0,
 // Veli türü Anne ise anneye işleyelim
 anne_isim: veliTamIsim,
 anne_tc: '',
 anne_telefon: item.telefon || '',
 anne_eposta: '',
 anne_meslek: item.veli_meslek || '',
 // Baba boş kalsın
 baba_isim: '',
 baba_tc: '',
 baba_telefon: '',
 baba_eposta: '',
 baba_meslek: '',
 });

 setShowConvertModal(true);
 };

 // Veli Türü Değiştirildiğinde (Anne <-> Baba) Bilgileri Dinamik Aktar
 const handleVeliTuruChange = (yeniTuru) => {
 setVeliTuru(yeniTuru);
 const veliTamIsim = `${selectedKayit?.veli_adi || ''} ${selectedKayit?.veli_soyadi || ''}`.trim();
 const tel = selectedKayit?.telefon || '';
 const meslek = selectedKayit?.veli_meslek || '';

 if (yeniTuru === 'anne') {
 setConvertFormData((prev) => ({
 ...prev,
 anne_isim: prev.anne_isim || veliTamIsim,
 anne_telefon: prev.anne_telefon || tel,
 anne_meslek: prev.anne_meslek || meslek,
 // Babayı sıfırla veya mevcut bırak
 baba_isim: prev.baba_isim === veliTamIsim ? '' : prev.baba_isim,
 baba_telefon: prev.baba_telefon === tel ? '' : prev.baba_telefon,
 baba_meslek: prev.baba_meslek === meslek ? '' : prev.baba_meslek,
 }));
 } else {
 setConvertFormData((prev) => ({
 ...prev,
 baba_isim: prev.baba_isim || veliTamIsim,
 baba_telefon: prev.baba_telefon || tel,
 baba_meslek: prev.baba_meslek || meslek,
 // Anneyi sıfırla veya mevcut bırak
 anne_isim: prev.anne_isim === veliTamIsim ? '' : prev.anne_isim,
 anne_telefon: prev.anne_telefon === tel ? '' : prev.anne_telefon,
 anne_meslek: prev.anne_meslek === meslek ? '' : prev.anne_meslek,
 }));
 }
 };

 const handleConvertInputChange = (e) => {
 const { name, value } = e.target;
 setConvertFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleConvertSubmit = async (e) => {
 e.preventDefault();
 if (!convertFormData.isim.trim() || !convertFormData.soyisim.trim()) {
 showToast('Öğrenci adı ve soyadı zorunludur.', 'error');
 return;
 }

 try {
 setSubmitting(true);
 // 1. Resmi Öğrenci Kaydını Oluştur (FastAPI /ogrenciler/ POST)
 await createOgrenci(convertFormData);

 // 2. Ön Kayıt Durumunu "Kesin Kayıt" olarak güncelle
 if (selectedKayit) {
 await updateOnKayitDurum(selectedKayit.id, 'Kesin Kayıt');
 }

 showToast(`🎉 ${convertFormData.isim} ${convertFormData.soyisim} başarıyla resmi öğrenci olarak kaydedildi!`, 'success');
 setShowConvertModal(false);
 fetchKayitlar();
 } catch (err) {
 console.error('Öğrenci kaydı oluşturulurken hata:', err);
 const detail = err.response?.data?.detail || 'Öğrenci kaydı oluşturulurken bir hata oluştu.';
 showToast(detail, 'error');
 } finally {
 setSubmitting(false);
 }
 };

 // Filtered & Sorted List
 const filteredKayitlar = kayitlar
 .filter((k) => {
 const search = searchQuery.toLowerCase().trim();
 const matchesSearch =
 !search ||
 k.ogrenci_adi?.toLowerCase().includes(search) ||
 k.ogrenci_soyadi?.toLowerCase().includes(search) ||
 k.veli_adi?.toLowerCase().includes(search) ||
 k.veli_soyadi?.toLowerCase().includes(search) ||
 k.telefon?.toLowerCase().includes(search) ||
 k.ilgilenilen_brans?.toLowerCase().includes(search);

 const matchesDurum = selectedDurumFilter === 'Tümü' || k.durum === selectedDurumFilter;

 return matchesSearch && matchesDurum;
 })
 .sort((a, b) => {
 if (sortOption === 'isim_asc') {
 return `${a.ogrenci_adi} ${a.ogrenci_soyadi}`.localeCompare(`${b.ogrenci_adi} ${b.ogrenci_soyadi}`, 'tr');
 }
 if (sortOption === 'isim_desc') {
 return `${b.ogrenci_adi} ${b.ogrenci_soyadi}`.localeCompare(`${a.ogrenci_adi} ${a.ogrenci_soyadi}`, 'tr');
 }
 if (sortOption === 'tarih_desc') {
 return (new Date(b.eklenme_tarihi || b.id)) - (new Date(a.eklenme_tarihi || a.id));
 }
 if (sortOption === 'tarih_asc') {
 return (new Date(a.eklenme_tarihi || a.id)) - (new Date(b.eklenme_tarihi || b.id));
 }
 return 0;
 });

 // Summary Stats
 const totalCount = kayitlar.length;
 const aranacakCount = kayitlar.filter((k) => k.durum === 'Aranacak').length;
 const arandiCount = kayitlar.filter((k) => k.durum === 'Arandı').length;
 const ulasilamadiCount = kayitlar.filter((k) => k.durum === 'Ulaşılamadı').length;
 const kesinKayitCount = kayitlar.filter((k) => k.durum === 'Kesin Kayıt').length;

 return (
 <div className="space-y-8 pb-12">
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

 {/* Header Banner */}
 <div className="neo-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl transition-colors">
 <div>
 <div className="flex items-center gap-3">
 <div className="neo-card w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2eb82e] to-[#0284c7] flex items-center justify-center text-white -emerald-900/20">
 <UserPlus className="w-6 h-6" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Ön Kayıt Takip Modülü</h1>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
 Ofis personeli için potansiyel öğrenci görüşmeleri ve tek tıkla resmi öğrenci kaydı
 </p>
 </div>
 </div>
 </div>
 
 <button
 onClick={fetchKayitlar}
 className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl hover: dark:hover: text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer neo-button"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
 <span>Listeyi Yenile</span>
 </button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
 <div className="neo-card rounded-2xl p-4 flex flex-col justify-between">
 <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Toplam Ön Kayıt</span>
 <div className="flex items-baseline justify-between mt-2">
 <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalCount}</span>
 <Users className="w-5 h-5 text-slate-400 dark:text-slate-500" />
 </div>
 </div>

 <div className="neo-card -amber-200 dark:-amber-500/30 rounded-2xl p-4 flex flex-col justify-between bg-amber-50/50 dark:bg-amber-500/5">
 <span className="text-xs text-amber-600 dark:text-amber-400/90 font-medium">Aranacak</span>
 <div className="flex items-baseline justify-between mt-2">
 <span className="text-2xl font-black text-amber-600 dark:text-amber-300">{aranacakCount}</span>
 <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
 </div>
 </div>

 <div className="neo-card -sky-200 dark:-sky-500/30 rounded-2xl p-4 flex flex-col justify-between bg-sky-50/50 dark:bg-sky-500/5">
 <span className="text-xs text-sky-600 dark:text-sky-400/90 font-medium">Arandı</span>
 <div className="flex items-baseline justify-between mt-2">
 <span className="text-2xl font-black text-sky-600 dark:text-sky-300">{arandiCount}</span>
 <Phone className="w-5 h-5 text-sky-500 dark:text-sky-400" />
 </div>
 </div>

 <div className="neo-card -orange-200 dark:-orange-500/30 rounded-2xl p-4 flex flex-col justify-between bg-orange-50/50 dark:bg-orange-500/5">
 <span className="text-xs text-orange-600 dark:text-orange-400/90 font-medium">Ulaşılamadı</span>
 <div className="flex items-baseline justify-between mt-2">
 <span className="text-2xl font-black text-orange-600 dark:text-orange-300">{ulasilamadiCount}</span>
 <PhoneOff className="w-5 h-5 text-orange-500 dark:text-orange-400" />
 </div>
 </div>

 <div className="neo-card col-span-2 sm:col-span-1 -emerald-200 dark:-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between bg-emerald-50/50 dark:bg-emerald-500/5">
 <span className="text-xs text-emerald-600 dark:text-emerald-400/90 font-medium">Kesin Kayıt</span>
 <div className="flex items-baseline justify-between mt-2">
 <span className="text-2xl font-black text-emerald-600 dark:text-emerald-300">{kesinKayitCount}</span>
 <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
 </div>
 </div>
 </div>

 {/* A. ÖN KAYIT FORMU */}
 <div className="neo-card rounded-3xl p-6 sm:p-8 relative overflow-hidden text-slate-800 dark:text-slate-100">
 <div className="flex items-center gap-3 mb-6 pb-4 border-b">
 <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#2eb82e]">
 <UserPlus className="w-4 h-4" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Yeni Ön Kayıt Oluştur</h2>
 <p className="text-xs text-slate-500 dark:text-slate-400">Ofis personeli tarafından manuel aday kaydı girilir.</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {/* Öğrenci Adı */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Öğrenci Adı <span className="text-rose-400">*</span>
 </label>
 <div className="relative">
 <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
 <input
 type="text"
 name="ogrenci_adi"
 value={formData.ogrenci_adi}
 onChange={handleInputChange}
 placeholder="Örn: Ahmet"
 required
 className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition-all neo-input"
 />
 </div>
 </div>

 {/* Öğrenci Soyadı */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Öğrenci Soyadı <span className="text-rose-400">*</span>
 </label>
 <div className="relative">
 <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
 <input
 type="text"
 name="ogrenci_soyadi"
 value={formData.ogrenci_soyadi}
 onChange={handleInputChange}
 placeholder="Örn: Yılmaz"
 required
 className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition-all neo-input"
 />
 </div>
 </div>

 {/* Telefon */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">İletişim Telefonu</label>
 <div className="relative">
 <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
 <input
 type="tel"
 name="telefon"
 value={formData.telefon}
 onChange={handleInputChange}
 placeholder="Örn: 0555 123 4567"
 className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition-all neo-input"
 />
 </div>
 </div>

 {/* Veli Adı */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Veli Adı</label>
 <div className="relative">
 <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
 <input
 type="text"
 name="veli_adi"
 value={formData.veli_adi}
 onChange={handleInputChange}
 placeholder="Örn: Mehmet"
 className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition-all neo-input"
 />
 </div>
 </div>

 {/* Veli Soyadı */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Veli Soyadı</label>
 <div className="relative">
 <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
 <input
 type="text"
 name="veli_soyadi"
 value={formData.veli_soyadi}
 onChange={handleInputChange}
 placeholder="Örn: Yılmaz"
 className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition-all neo-input"
 />
 </div>
 </div>

 {/* Veli Mesleği */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Veli Mesleği</label>
 <div className="relative">
 <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
 <input
 type="text"
 name="veli_meslek"
 value={formData.veli_meslek}
 onChange={handleInputChange}
 placeholder="Örn: Öğretmen / Mühendis"
 className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition-all neo-input"
 />
 </div>
 </div>

 {/* İlgilenilen Branş / Sınıf Seçimi */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
 <span>İlgilenilen Branş / Sınıf</span>
 </label>
 <div className="space-y-2">
 <div className="relative">
 <BookOpen className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 z-10" />
 <select
 value={isCustomBrans ? 'DIGER_MANUEL' : formData.ilgilenilen_brans}
 onChange={handleBransSelectChange}
 className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition-all cursor-pointer neo-input"
 >
 <option value="">-- Mevcut Sınıflardan Seçiniz --</option>
 {siniflar.map((s) => (
 <option key={s.id} value={s.sinif_adi} className="text-slate-900 dark:text-slate-100">
 {s.sinif_adi} (Kapasite: {s.kapasite})
 </option>
 ))}
 <option value="DIGER_MANUEL" className="text-amber-300 font-bold">
 ✍️ Diğer / Elle Özel Branş Yaz...
 </option>
 </select>
 </div>

 {isCustomBrans && (
 <div className="relative animate-scale-in">
 <Sparkles className="w-4 h-4 absolute left-3.5 top-3 text-amber-400" />
 <input
 type="text"
 value={customBransText}
 onChange={handleCustomBransTextChange}
 placeholder="İlgilenilen özel branşı giriniz (Örn: Gitar, Resim...)"
 required
 className="w-full border-amber-500/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all neo-input"
 />
 </div>
 )}
 </div>
 </div>
 
 {/* Notlar */}
 <div className="col-span-1 md:col-span-2 lg:col-span-3">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kayıt Notu</label>
 <textarea
 name="notlar"
 value={formData.notlar}
 onChange={handleInputChange}
 placeholder="Örn: Hafta sonu müsait olabiliyorlar..."
 rows="2"
 className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2eb82e] focus:ring-1 focus:ring-[#2eb82e] transition-all resize-none neo-input"
 />
 </div>

 </div>

 <div className="flex justify-end pt-2">
 <button
 type="submit"
 disabled={submitting}
 className="flex items-center gap-2 bg-gradient-to-r to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm -emerald-900/40 hover:-emerald-900/60 transition-all duration-200 disabled:opacity-50 neo-button-primary"
 >
 <UserPlus className="w-4 h-4" />
 <span>{submitting ? 'Kaydediliyor...' : 'Ön Kaydı Sisteme Ekle'}</span>
 </button>
 </div>
 </form>
 </div>

 {/* B. KAYIT TABLOSU & ARAMA/FİLTRE */}
 <div className="neo-card rounded-3xl p-6 sm:p-8 space-y-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
 <div>
 <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <span>Ön Kayıt Aday Listesi</span>
 <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-slate-700 dark:text-slate-300">
 {filteredKayitlar.length} kayıt
 </span>
 </h2>
 <p className="text-xs text-slate-400">Tüm potansiyel öğrenciler ve iletişim durumları</p>
 </div>

 {/* Search & Durum Filter */}
 <div className="flex flex-wrap items-center gap-3">
 {/* Search Input */}
 <div className="relative min-w-[220px]">
 <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="İsim, telefon veya branş ara..."
 className="w-full rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2eb82e] neo-input"
 />
 </div>

 {/* Durum Filter Pills */}
 <select
 value={selectedDurumFilter}
 onChange={(e) => setSelectedDurumFilter(e.target.value)}
 className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#2eb82e] neo-input"
 >
 <option value="Tümü">Tüm Durumlar</option>
 {DURUM_OPTIONS.map((opt) => (
 <option key={opt.value} value={opt.value}>
 {opt.label}
 </option>
 ))}
 </select>

 {/* Sıralama Menüsü */}
 <select
 value={sortOption}
 onChange={(e) => setSortOption(e.target.value)}
 className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#2eb82e] neo-input"
 >
 <option value="tarih_desc">Sırala: Kayıt Tarihi (Yeniden Eskiden)</option>
 <option value="tarih_asc">Sırala: Kayıt Tarihi (Eskiden Yeniye)</option>
 <option value="isim_asc">Sırala: İsme Göre (A - Z)</option>
 <option value="isim_desc">Sırala: İsme Göre (Z - A)</option>
 </select>
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 {loading ? (
 <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-3">
 <RefreshCw className="w-7 h-7 animate-spin text-[#2eb82e]" />
 <span className="text-sm font-medium">Kayıtlar yükleniyor...</span>
 </div>
 ) : filteredKayitlar.length === 0 ? (
                  <div className="py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Ön Kayıt Bulunamadı</h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        Arama kriterlerinizi değiştirebilir veya yeni bir ön kayıt ekleyebilirsiniz.
                      </p>
                    </div>
                  </div>
                ) : (
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b text-[11px] font-bold text-slate-400 tracking-wider">
 <th className="py-3 px-4 rounded-l-xl">ÖĞRENCİ BİLGİSİ</th>
 <th className="py-3 px-4">VELİ BİLGİSİ</th>
 <th className="py-3 px-4">İLETİŞİM</th>
 <th className="py-3 px-4">İLGİLENİLEN BRANŞ</th>
 <th className="py-3 px-4">NOTLAR</th>
 <th className="py-3 px-4">TARİH</th>
 <th className="py-3 px-4 text-center">DURUM (ANLIK GÜNCELLEME)</th>
 <th className="py-3 px-4 text-right rounded-r-xl">İŞLEMLER</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-700/60 text-sm">
 {filteredKayitlar.map((item) => {
 const currentDurumOpt = DURUM_OPTIONS.find((d) => d.value === item.durum) || DURUM_OPTIONS[0];

 return (
 <tr key={item.id} className="hover: dark:hover: transition-colors">
 {/* Öğrenci */}
 <td className="py-3.5 px-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs text-emerald-400">
 {item.ogrenci_adi?.[0]?.toUpperCase()}
 </div>
 <div>
 <div className="font-bold text-slate-900 dark:text-slate-100">
 {item.ogrenci_adi} {item.ogrenci_soyadi}
 </div>
 <div className="text-[11px] text-slate-500">ID: #{item.id}</div>
 </div>
 </div>
 </td>

 {/* Veli */}
 <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
 {item.veli_adi || item.veli_soyadi ? (
 <span>{item.veli_adi} {item.veli_soyadi}</span>
 ) : (
 <span className="text-slate-500 italic text-xs">-</span>
 )}
 </td>

 {/* Telefon */}
 <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono text-xs">
 {item.telefon ? (
 <div className="flex items-center gap-1.5 text-slate-200">
 <Phone className="w-3.5 h-3.5 text-slate-400" />
 <span>{item.telefon}</span>
 </div>
 ) : (
 <span className="text-slate-500 italic text-xs">-</span>
 )}
 </td>

 {/* Branş (Manuel Text) */}
 <td className="py-3.5 px-4">
 {item.ilgilenilen_brans ? (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold text-slate-200">
 <BookOpen className="w-3.5 h-3.5 text-[#0284c7]" />
 {item.ilgilenilen_brans}
 </span>
 ) : (
 <span className="text-slate-500 italic text-xs">Belirtilmedi</span>
 )}
 </td>

 {/* Notlar */}
 <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-[150px] truncate" title={item.notlar}>
 {item.notlar || <span className="text-slate-500 italic">-</span>}
 </td>

 {/* Tarih */}
 <td className="py-3.5 px-4 text-xs text-slate-400">
 {item.eklenme_tarihi
 ? new Date(item.eklenme_tarihi).toLocaleDateString('tr-TR', {
 day: '2-digit',
 month: '2-digit',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })
 : '-'}
 </td>

 {/* Durum Dropdown */}
 <td className="py-3.5 px-4 text-center">
 <select
 value={item.durum || 'Aranacak'}
 onChange={(e) => handleDurumChange(item.id, e.target.value)}
 className={`w-full max-w-[150px] mx-auto px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${currentDurumOpt.color}`}
 >
 {DURUM_OPTIONS.map((opt) => (
 <option
 key={opt.value}
 value={opt.value}
 className="text-slate-900 dark:text-slate-100 py-1 font-semibold"
 >
 {opt.label}
 </option>
 ))}
 </select>
 </td>

 {/* İşlemler (Öğrenci Kaydı Yap & Sil) */}
 <td className="py-3.5 px-4 text-right whitespace-nowrap">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() => openConvertModal(item)}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2eb82e] to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold -emerald-900/30 hover:-emerald-900/50 transition-all duration-200 active:scale-95"
 title="Adayı Resmi Öğrenci Olarak Kaydet"
 >
 <UserCheck className="w-3.5 h-3.5" />
 <span>Öğrenci Kaydı Yap</span>
 </button>

 <button
 onClick={() => openEditModal(item)}
 className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
 title="Görüntüle"
 >
 <Eye className="w-4 h-4" />
 </button>

 <button
 onClick={() => handleDelete(item.id, `${item.ogrenci_adi} ${item.ogrenci_soyadi}`)}
 className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
 title="Ön Kaydı Sil"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 )}
 </div>
 </div>

 {/* ==================== KESİN ÖĞRENCİ KAYDI MODALI (ÖN KAYIT -> RESMİ ÖĞRENCİ) ==================== */}
 {showConvertModal && selectedKayit && (
 <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
 <div className="neo-card rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
 
 {/* Modal Header */}
 <div className="flex justify-between items-start border-b pb-4">
 <div className="flex items-center gap-3">
 <div className="neo-card w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2eb82e] to-emerald-600 flex items-center justify-center text-white -emerald-900/40">
 <UserCheck className="w-6 h-6" />
 </div>
 <div>
 <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <span>Ön Kayıttan Öğrenci Oluştur</span>
 <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-medium">Auto-Fill</span>
 </h3>
 <p className="text-xs text-slate-400 mt-0.5">
 Ön kayıt bilgileri otomatik aktarıldı. Eksik alanları tamamlayıp kesin kaydı bitirebilirsiniz.
 </p>
 </div>
 </div>
 <button
 onClick={() => setShowConvertModal(false)}
 className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover: transition"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleConvertSubmit} className="space-y-5">
 
 {/* 1. Öğrenci Bilgileri */}
 <div className="neo-card p-4 rounded-2xl space-y-4">
 <div className="text-xs font-bold text-[#2eb82e] uppercase tracking-wider flex items-center gap-1.5">
 <User className="w-4 h-4" />
 <span>1. Öğrenci Bilgileri</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Öğrenci Adı *</label>
 <input
 type="text"
 name="isim"
 required
 value={convertFormData.isim}
 onChange={handleConvertInputChange}
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#2eb82e] outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Öğrenci Soyadı *</label>
 <input
 type="text"
 name="soyisim"
 required
 value={convertFormData.soyisim}
 onChange={handleConvertInputChange}
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#2eb82e] outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Öğrenci TC Kimlik No</label>
 <input
 type="text"
 name="tc"
 value={convertFormData.tc}
 onChange={handleConvertInputChange}
 maxLength="11"
 placeholder="11122233344"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-[#2eb82e] outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kayıt Yapılacak Sınıf / Branş Seçin</label>
 <select
 name="sinif_adi"
 value={convertFormData.sinif_adi}
 onChange={handleConvertInputChange}
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#2eb82e] outline-none cursor-pointer"
 >
 <option value="">-- Mevcut Sınıflardan Seçiniz --</option>
 {siniflar.map((s) => (
 <option key={s.id} value={s.sinif_adi} className="text-slate-900 dark:text-slate-100">
 {s.sinif_adi} (Kapasite: {s.kapasite})
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Öğrenci Telefon</label>
 <input
 type="text"
 name="telefon"
 value={convertFormData.telefon}
 onChange={handleConvertInputChange}
 placeholder="05551112233"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-[#2eb82e] outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Öğrenci E-Posta</label>
 <input
 type="email"
 name="eposta"
 value={convertFormData.eposta}
 onChange={handleConvertInputChange}
 placeholder="ogrenci@gmail.com"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-[#2eb82e] outline-none"
 />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Açık Adres</label>
 <textarea
 name="adres"
 rows="2"
 value={convertFormData.adres}
 onChange={handleConvertInputChange}
 placeholder="Ev adresi..."
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-[#2eb82e] outline-none"
 ></textarea>
 </div>
 </div>
 </div>

 {/* 2. Veli Bilgileri & Veli Türü Seçimi (Anne mi Baba mı?) */}
 <div className="neo-card p-4 rounded-2xl space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b">
 <div className="text-xs font-bold text-[#0284c7] uppercase tracking-wider flex items-center gap-1.5">
 <Heart className="w-4 h-4 text-[#0284c7]" />
 <span>2. Veli Bilgileri Entegrasyonu</span>
 </div>

 {/* Veli Türü Seçim Butonları (Annesi mi, Babası mı?) */}
 <div className="flex items-center gap-1 p-1 rounded-xl border">
 <span className="text-[11px] font-semibold text-slate-400 px-2">Kayıtlı Veli:</span>
 <button
 type="button"
 onClick={() => handleVeliTuruChange('anne')}
 className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
 veliTuru === 'anne'
 ? 'bg-[#0284c7] text-white -sky-950/40'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 👩 Annesi
 </button>
 <button
 type="button"
 onClick={() => handleVeliTuruChange('baba')}
 className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
 veliTuru === 'baba'
 ? 'bg-[#0284c7] text-white -sky-950/40'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 👨 Babası
 </button>
 </div>
 </div>

 {/* Anne Bilgileri Girişi */}
 <div className="space-y-2">
 <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
 <span>👩 Anne Bilgileri</span>
 {veliTuru === 'anne' && (
 <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-md font-semibold">
 Ön Kayıt Velisi Anne Olarak İşlendi
 </span>
 )}
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Anne Adı Soyadı</label>
 <input
 type="text"
 name="anne_isim"
 value={convertFormData.anne_isim}
 onChange={handleConvertInputChange}
 placeholder="Ayşe Yılmaz"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 <div>
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Anne Mesleği</label>
 <input
 type="text"
 name="anne_meslek"
 value={convertFormData.anne_meslek}
 onChange={handleConvertInputChange}
 placeholder="Örn: Öğretmen"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 <div>
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Anne Telefon</label>
 <input
 type="text"
 name="anne_telefon"
 value={convertFormData.anne_telefon}
 onChange={handleConvertInputChange}
 placeholder="05552223344"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 <div>
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Anne TC Kimlik No</label>
 <input
 type="text"
 name="anne_tc"
 value={convertFormData.anne_tc}
 onChange={handleConvertInputChange}
 maxLength="11"
 placeholder="11122233355"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Anne E-Posta</label>
 <input
 type="email"
 name="anne_eposta"
 value={convertFormData.anne_eposta}
 onChange={handleConvertInputChange}
 placeholder="anne@gmail.com"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 </div>
 </div>

 {/* Baba Bilgileri Girişi */}
 <div className="space-y-2 pt-2 border-t">
 <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
 <span>👨 Baba Bilgileri</span>
 {veliTuru === 'baba' && (
 <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-md font-semibold">
 Ön Kayıt Velisi Baba Olarak İşlendi
 </span>
 )}
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Baba Adı Soyadı</label>
 <input
 type="text"
 name="baba_isim"
 value={convertFormData.baba_isim}
 onChange={handleConvertInputChange}
 placeholder="Mehmet Yılmaz"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 <div>
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Baba Mesleği</label>
 <input
 type="text"
 name="baba_meslek"
 value={convertFormData.baba_meslek}
 onChange={handleConvertInputChange}
 placeholder="Örn: Mühendis"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 <div>
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Baba Telefon</label>
 <input
 type="text"
 name="baba_telefon"
 value={convertFormData.baba_telefon}
 onChange={handleConvertInputChange}
 placeholder="05553334455"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 <div>
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Baba TC Kimlik No</label>
 <input
 type="text"
 name="baba_tc"
 value={convertFormData.baba_tc}
 onChange={handleConvertInputChange}
 maxLength="11"
 placeholder="11122233366"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-[11px] font-medium text-slate-400 mb-1">Baba E-Posta</label>
 <input
 type="email"
 name="baba_eposta"
 value={convertFormData.baba_eposta}
 onChange={handleConvertInputChange}
 placeholder="baba@gmail.com"
 className="w-full px-3 py-2 neo-input w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
 />
 </div>
 </div>
 </div>

 </div>

 {/* Modal Buttons */}
 <div className="flex items-center justify-end gap-3 border-t pt-4">
 <button
 type="button"
 onClick={() => setShowConvertModal(false)}
 className="px-4 py-2.5 rounded-xl hover: text-slate-200 font-semibold text-xs transition"
 >
 İptal
 </button>
 <button
 type="submit"
 disabled={submitting}
 className="flex items-center gap-2 bg-gradient-to-r to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs -emerald-900/40 hover:-emerald-900/60 transition disabled:opacity-50 neo-button-primary"
 >
 <UserCheck className="w-4 h-4" />
 <span>{submitting ? 'Öğrenci Kaydediliyor...' : 'Kesin Kaydı Tamamla'}</span>
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

 {/* ==================== DÜZENLEME MODALI ==================== */}
 {showEditModal && editFormData && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
 <div className="neo-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
 <div className="sticky top-0 z-10 border-b p-6 flex justify-between items-center">
 <div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ön Kayıt Detayları</h3>
 <p className="text-xs text-slate-500 mt-1">
 Aday bilgilerini görüntüleyip güncelleyebilirsiniz.
 </p>
 </div>
 <button
 onClick={() => setShowEditModal(false)}
 className="w-8 h-8 rounded-full text-slate-500 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 flex items-center justify-center transition-colors"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Öğrenci Adı</label>
 <input type="text" name="ogrenci_adi" value={editFormData.ogrenci_adi} onChange={handleEditInputChange} required className="w-full rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 neo-input" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Öğrenci Soyadı</label>
 <input type="text" name="ogrenci_soyadi" value={editFormData.ogrenci_soyadi} onChange={handleEditInputChange} required className="w-full rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 neo-input" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Veli Adı</label>
 <input type="text" name="veli_adi" value={editFormData.veli_adi || ''} onChange={handleEditInputChange} className="w-full rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 neo-input" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Veli Soyadı</label>
 <input type="text" name="veli_soyadi" value={editFormData.veli_soyadi || ''} onChange={handleEditInputChange} className="w-full rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 neo-input" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">İletişim Telefonu</label>
 <input type="text" name="telefon" value={editFormData.telefon || ''} onChange={handleEditInputChange} className="w-full rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 neo-input" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">İlgilenilen Branş</label>
 <input type="text" name="ilgilenilen_brans" value={editFormData.ilgilenilen_brans || ''} onChange={handleEditInputChange} className="w-full rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 neo-input" />
 </div>
 <div className="md:col-span-2">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kayıt Notu</label>
 <textarea name="notlar" value={editFormData.notlar || ''} onChange={handleEditInputChange} rows="3" className="w-full rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 neo-input" />
 </div>
 </div>

 <div className="flex justify-end pt-4 border-t gap-3">
 <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover: dark:hover: transition-colors">
 İptal
 </button>
 <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-[#259925] disabled:opacity-50 transition-colors neo-button-primary">
 {submitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
};

export default OnKayit;
