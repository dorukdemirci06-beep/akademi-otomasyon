import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, UserMinus, UserCheck, BookPlus, ArrowUpDown, Users, UserX, X,
 ChevronDown, ChevronUp, BookOpen, User, Phone, Mail, MapPin, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { getOgrenciler, createOgrenci, updateOgrenciDurum, updateOgrenciInfo, kaydetOgrenciSinif, getOgrenciSiniflar, getSiniflar, deleteOgrenciSinif } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import CustomDatePicker from '../components/CustomDatePicker';
import { formatTL } from '../utils/formatters';

const Kayit = () => {
 const navigate = useNavigate();
 const currentUser = (() => {
 try {
 return JSON.parse(localStorage.getItem('user') || '{}');
 } catch {
 return {};
 }
 })();
 const roleLower = (currentUser?.rol || '').toLowerCase();
 const isAdmin = roleLower.includes('yönetici') || roleLower.includes('yonetici') || roleLower.includes('admin') || roleLower.includes('super') || roleLower.includes('süper');

 const [ogrenciler, setOgrenciler] = useState([]);

 // Toast Notification State
 const [toastMessage, setToastMessage] = useState(null);

 const showToast = (message, type = 'success') => {
 setToastMessage({ message, type });
 setTimeout(() => {
 setToastMessage(null);
 }, 4000);
 };
 const [siniflar, setSiniflar] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [activeTab, setActiveTab] = useState('Aktif'); // 'Aktif' veya 'Pasif'
 const [sortOption, setSortOption] = useState('isim_asc');
 const [showModal, setShowModal] = useState(false);
 const [isEditing, setIsEditing] = useState(false);
 const [editId, setEditId] = useState(null);
 const [showEkDersModal, setShowEkDersModal] = useState(false);
 const [selectedOgrenci, setSelectedOgrenci] = useState(null);
 const [expandedRows, setExpandedRows] = useState({});

 const toggleRowExpand = (id) => {
 setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
 };

 const toggleExpandAllRows = () => {
 const allExpanded = filteredOgrenciler.length > 0 && filteredOgrenciler.every(o => expandedRows[o.id]);
 const newMap = {};
 if (!allExpanded) {
 filteredOgrenciler.forEach(o => { newMap[o.id] = true; });
 }
 setExpandedRows(newMap);
 };

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

 // Form State
 const [formData, setFormData] = useState({
 isim: '',
 soyisim: '',
 tc: '',
 dogum_tarihi: '',
 telefon: '',
 eposta: '',
 adres: '',
 sinif_adi: '',
    bakiye: 0.0,
    birincil_veli: 'Kendisi',
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

 const [ekDersData, setEkDersData] = useState({
 sinif_adi: '',
 kalan_ders_hakki: 0,
 });

 useEffect(() => {
 fetchOgrenciler();
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

 const loadRelatedDataInBackground = async (list) => {
 // Arka planda her öğrenci için kayıtlı sınıfları getir
 for (let o of list) {
 try {
 const sinifRes = await getOgrenciSiniflar(o.id);
 setOgrenciler(prev => prev.map(student => 
 student.id === o.id ? { ...student, siniflar: sinifRes.data || [] } : student
 ));
 } catch {
 setOgrenciler(prev => prev.map(student => 
 student.id === o.id ? { ...student, siniflar: [] } : student
 ));
 }
 }
 };

 const fetchOgrenciler = async () => {
 try {
 setLoading(true);
 const res = await getOgrenciler();
 const list = res.data || [];
 
 // 1. Listeyi hemen yükle
 setOgrenciler(list);
 setLoading(false); // Listeyi anında göster
 
 // 2. Genişletilmiş ve ek verileri arka planda yükle
 loadRelatedDataInBackground(list);

 } catch (err) {
 console.error('Öğrenciler getirilemedi:', err);
 setLoading(false);
 }
 };

 const handleInputChange = (e) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 if (isEditing && editId) {
 await updateOgrenciInfo(editId, formData);
 showToast('Öğrenci bilgileri başarıyla güncellendi!');
 setShowModal(false);
 setIsEditing(false);
 setEditId(null);
 setFormData({
 isim: '', soyisim: '', tc: '', dogum_tarihi: '', telefon: '', eposta: '', adres: '',
 sinif_adi: '',
    bakiye: 0.0,
    birincil_veli: 'Kendisi', anne_isim: '', anne_tc: '', anne_telefon: '',
 anne_eposta: '', anne_meslek: '', baba_isim: '', baba_tc: '', baba_telefon: '', baba_eposta: '', baba_meslek: ''
 });
 fetchOgrenciler();
 } else {
 const response = await createOgrenci(formData);
 showToast('Öğrenci ve veli bilgileri başarıyla kaydedildi!');
 setShowModal(false);
 setIsEditing(false);
 setEditId(null);
 setFormData({
 isim: '', soyisim: '', tc: '', dogum_tarihi: '', telefon: '', eposta: '', adres: '',
 sinif_adi: '',
    bakiye: 0.0,
    birincil_veli: 'Kendisi', anne_isim: '', anne_tc: '', anne_telefon: '',
 anne_eposta: '', anne_meslek: '', baba_isim: '', baba_tc: '', baba_telefon: '', baba_eposta: '', baba_meslek: ''
 });
 navigate('/finans', { state: { autoSelectStudentId: response.data.id } });
 }
 } catch (err) {
 const detail = err.response?.data?.detail || 'İşlem başarısız oldu.';
 showToast(`Hata: ${detail}`, 'error');
 }
 };

 const handleEditOgrenci = (ogrenci) => {
 setFormData({
 isim: ogrenci.isim || '', soyisim: ogrenci.soyisim || '', tc: ogrenci.tc || '', dogum_tarihi: ogrenci.dogum_tarihi || '',
 telefon: ogrenci.telefon || '', eposta: ogrenci.eposta || '', adres: ogrenci.adres || '',
 sinif_adi: ogrenci.sinif_adi || '',
      birincil_veli: ogrenci.birincil_veli || 'Kendisi', bakiye: ogrenci.bakiye || 0.0, 
 anne_isim: ogrenci.anne_isim || '', anne_tc: ogrenci.anne_tc || '', anne_telefon: ogrenci.anne_telefon || '',
 anne_eposta: ogrenci.anne_eposta || '', anne_meslek: ogrenci.anne_meslek || '', 
 baba_isim: ogrenci.baba_isim || '', baba_tc: ogrenci.baba_tc || '', baba_telefon: ogrenci.baba_telefon || '', 
 baba_eposta: ogrenci.baba_eposta || '', baba_meslek: ogrenci.baba_meslek || ''
 });
 setEditId(ogrenci.id);
 setIsEditing(true);
 setShowModal(true);
 };

 const handleToggleDurum = (id, name, currentDurum) => {
 const isPasif = currentDurum === 'Pasif';
 const newDurum = isPasif ? 'Aktif' : 'Pasif';
 const msg = isPasif 
 ? `"${name}" isimli öğrenciyi tekrar AKTİF listesine taşımak istediğinize emin misiniz?`
 : `"${name}" isimli öğrenciyi PASİF listesine taşımak istediğinize emin misiniz?`;
 
 openConfirm({
 title: isPasif ? 'Aktife Alma Onayı' : 'Pasife Alma Onayı',
 message: msg,
 type: isPasif ? 'info' : 'warning',
 confirmText: isPasif ? 'Aktife Al' : 'Pasife Al',
 onConfirm: async () => {
 try {
 await updateOgrenciDurum(id, newDurum);
 fetchOgrenciler();
 } catch (err) {
 console.error('Durum güncelleme hatası:', err);
 }
 }
 });
 };

 const handleEkDersSubmit = async (e) => {
 e.preventDefault();
 if (!selectedOgrenci) return;
 try {
 await kaydetOgrenciSinif({
 ogrenci_id: selectedOgrenci.id,
 sinif_adi: ekDersData.sinif_adi,
 kalan_ders_hakki: Number(ekDersData.kalan_ders_hakki),
 });
 setShowEkDersModal(false);
 setEkDersData({ sinif_adi: '', kalan_ders_hakki: 0 });
 fetchOgrenciler();
 } catch (err) {
 console.error('Ek ders hatası:', err);
 }
 };

 const handleRemoveFromSinif = (ogrenci, sinifItem) => {
 openConfirm({
 title: 'Dersten Çıkarma Onayı',
 message: `"${ogrenci.isim} ${ogrenci.soyisim}" isimli öğrenciyi "${sinifItem.sinif_adi}" dersinden çıkarmak istediğinize emin misiniz?`,
 type: 'danger',
 confirmText: 'Dersten Çıkar',
 onConfirm: async () => {
 try {
 await deleteOgrenciSinif(sinifItem.id);
 fetchOgrenciler();
 } catch (err) {
 console.error('Dersten çıkarma hatası:', err);
 }
 }
 });
 };

 // Aktif ve Pasif sayıları
 const aktifSayisi = ogrenciler.filter(o => (o.durum || 'Aktif') !== 'Pasif').length;
 const pasifSayisi = ogrenciler.filter(o => o.durum === 'Pasif').length;

 // Filtreleme ve Sıralama
 const filteredOgrenciler = ogrenciler
 .filter((o) => {
 const isOgrenciPasif = o.durum === 'Pasif';
 if (activeTab === 'Aktif' && isOgrenciPasif) return false;
 if (activeTab === 'Pasif' && !isOgrenciPasif) return false;

 const term = searchTerm.toLowerCase();
 const name = `${o.isim} ${o.soyisim}`.toLowerCase();
 const phone = (o.telefon || '').toLowerCase();
 const tc = (o.tc || '').toLowerCase();
 const anne = (o.anne_isim || '').toLowerCase();
 const anneMeslek = (o.anne_meslek || '').toLowerCase();
 const baba = (o.baba_isim || '').toLowerCase();
 const babaMeslek = (o.baba_meslek || '').toLowerCase();
 return name.includes(term) || phone.includes(term) || tc.includes(term) || anne.includes(term) || anneMeslek.includes(term) || baba.includes(term) || babaMeslek.includes(term);
 })
 .sort((a, b) => {
 if (sortOption === 'isim_asc') {
 return `${a.isim} ${a.soyisim}`.localeCompare(`${b.isim} ${b.soyisim}`, 'tr');
 }
 if (sortOption === 'isim_desc') {
 return `${b.isim} ${b.soyisim}`.localeCompare(`${a.isim} ${a.soyisim}`, 'tr');
 }
 if (sortOption === 'tarih_desc') {
 return (new Date(b.kayit_tarihi || b.id)) - (new Date(a.kayit_tarihi || a.id));
 }
 if (sortOption === 'tarih_asc') {
 return (new Date(a.kayit_tarihi || a.id)) - (new Date(b.kayit_tarihi || b.id));
 }
 return 0;
 });

 return (
 <div className="space-y-6">
 {/* Header Bar */}
 <div className="neo-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl -slate-200 transition-colors">
 <div>
 <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Kayıt Modülü & Öğrenci Yönetimi</h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Yeni öğrenci kaydı oluşturun veya aktif / pasif öğrencileri yönetin.</p>
 </div>
 <button
 onClick={() => {
 setIsEditing(false);
 setEditId(null);
 setFormData({
 isim: '', soyisim: '', tc: '', dogum_tarihi: '', telefon: '', eposta: '', adres: '',
 sinif_adi: '',
    bakiye: 0.0,
    birincil_veli: 'Kendisi', anne_isim: '', anne_tc: '', anne_telefon: '',
 anne_eposta: '', anne_meslek: '', baba_isim: '', baba_tc: '', baba_telefon: '', baba_eposta: '', baba_meslek: ''
 });
 setShowModal(true);
 }}
 className="px-4 py-2.5 bg-[#2eb82e] hover:bg-[#269926] text-white font-bold text-sm rounded-xl transition -emerald-900/20 flex items-center gap-2 cursor-pointer"
 >
 <UserPlus className="w-4 h-4" />
 <span>Yeni Öğrenci Ekle</span>
 </button>
 </div>

 {/* Main Student List Table */}
 <div className="neo-card rounded-2xl -slate-200 p-6 space-y-4">
 
 {/* Tab Selection: Aktif vs Pasif */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3">
 <div className="flex items-center gap-2">
 <button
 onClick={() => setActiveTab('Aktif')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
 activeTab === 'Aktif'
 ? 'bg-emerald-50 dark:bg-emerald-950/90 border-[#2eb82e] text-[#2eb82e] '
 : ' text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 <Users className="w-4 h-4" />
 <span>Aktif Öğrenciler ({aktifSayisi})</span>
 </button>
 <button
 onClick={() => setActiveTab('Pasif')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
 activeTab === 'Pasif'
 ? 'bg-sky-50 dark:bg-sky-950/90 border-sky-500 text-sky-600 dark:text-sky-400 '
 : ' text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 <UserX className="w-4 h-4" />
 <span>Pasif Öğrenci Listesi ({pasifSayisi})</span>
 </button>
 </div>

 {/* Sıralama Menüsü */}
 <div className="flex items-center gap-2 w-full sm:w-auto">
 <ArrowUpDown className="w-4 h-4 text-slate-400" />
 <select
 value={sortOption}
 onChange={(e) => setSortOption(e.target.value)}
 className="rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2eb82e] w-full sm:w-auto neo-input"
 >
 <option value="isim_asc">Sırala: İsme Göre (A - Z)</option>
 <option value="isim_desc">Sırala: İsme Göre (Z - A)</option>
 <option value="tarih_desc">Sırala: Kayıt Tarihi (Yeniden Eskiden)</option>
 <option value="tarih_asc">Sırala: Kayıt Tarihi (Eskiden Yeniye)</option>
 </select>
 </div>
 </div>

 {/* Search Input & Expand All Control */}
 <div className="flex justify-between items-center gap-4 flex-wrap">
 <div className="relative flex-1 min-w-[260px]">
 <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder={`${activeTab} öğrencilerde İsim, TC, Veli veya Telefon ile ara...`}
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2eb82e] transition neo-input"
 />
 </div>

 <div className="flex items-center gap-3">
 <button
 type="button"
 onClick={toggleExpandAllRows}
 className="px-3 py-1.5 hover: dark:hover: text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer neo-button"
 >
 {filteredOgrenciler.length > 0 && filteredOgrenciler.every(o => expandedRows[o.id]) ? 'Tümünü Daralt' : 'Tümünü Genişlet'}
 </button>

 <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden sm:block">
 {activeTab} Listesinde <span className="text-[#2eb82e] font-bold">{filteredOgrenciler.length}</span> Öğrenci Var
 </div>
 </div>
 </div>

 {/* COMPACT & EXPANDABLE ACCORDION TABLE */}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[900px]">
 <thead>
 <tr className="border-b text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
 <th className="py-3 px-4 w-16">#ID</th>
 <th className="py-3 px-4">ÖĞRENCİ ADI SOYADI</th>
 <th className="py-3 px-4">İLETİŞİM TELEFONU</th>
 <th className="py-3 px-4">KAYITLI DERSLER</th>
 {isAdmin && <th className="py-3 px-4">BAKİYE</th>}
 <th className="py-3 px-4 text-right">İŞLEMLER & DETAY</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60 text-sm">
 {loading ? (
 <tr>
 <td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-slate-400">Öğrenciler Yükleniyor...</td>
 </tr>
 ) : filteredOgrenciler.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="py-16">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                              <Users className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {activeTab === 'Pasif' ? 'Pasif Öğrenci Yok' : 'Öğrenci Bulunamadı'}
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm">
                              {activeTab === 'Pasif' 
                                ? 'Sistemde kayıtlı pasif öğrenci bulunmuyor.' 
                                : 'Arama kriterlerinize uyan bir aktif öğrenci bulunamadı. Yeni bir kayıt eklemeyi deneyebilirsiniz.'}
                            </p>
                          </div>
                        </td>
                      </tr>
 ) : (
 filteredOgrenciler.map((o) => {
 const isExpanded = !!expandedRows[o.id];

 return (
 <React.Fragment key={o.id}>
 {/* COMPACT SINGLE LINE ROW */}
 <tr 
 onClick={() => toggleRowExpand(o.id)}
 className={`group hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer select-none ${
 isExpanded ? ' border-l-4 border-l-[#2eb82e]' : ''
 }`}
 >
 {/* ID */}
 <td className="py-3.5 px-4 whitespace-nowrap">
 <span className="font-bold text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-xs border">
 #{o.id}
 </span>
 </td>

 {/* İsim & Durum */}
 <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
 <div className="flex items-center gap-2">
 <span>{o.isim} {o.soyisim}</span>
 {o.durum === 'Pasif' ? (
 <span className="text-[10px] bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/80 px-1.5 py-0.5 rounded font-semibold">
 Pasif
 </span>
 ) : (
 <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 px-1.5 py-0.5 rounded font-semibold">
 Aktif
 </span>
 )}
 </div>
 </td>

 
{/* Telefon & WhatsApp */}
<td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
  {(() => {
    let phoneToUse = o.telefon;
    let labelToUse = 'Kendisi';
    if (o.birincil_veli === 'Anne' && o.anne_telefon) { phoneToUse = o.anne_telefon; labelToUse = 'Anne'; }
    else if (o.birincil_veli === 'Baba' && o.baba_telefon) { phoneToUse = o.baba_telefon; labelToUse = 'Baba'; }
    else if (o.birincil_veli === 'Kendisi' && !o.telefon && o.anne_telefon) { phoneToUse = o.anne_telefon; labelToUse = 'Anne'; } // Fallback
    
    if (phoneToUse) {
      const cleanPhone = phoneToUse.replace(/\D/g, '');
      const waNumber = cleanPhone.startsWith('90') ? cleanPhone : (cleanPhone.startsWith('0') ? '9' + cleanPhone : '90' + cleanPhone);
      
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{labelToUse}</span>
            <div className="flex items-center gap-1.5 font-bold">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{phoneToUse}</span>
            </div>
          </div>
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg transition-colors cursor-pointer" title="WhatsApp üzerinden mesaj gönder">
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      );
    }
    return <span className="text-slate-400 italic">-</span>;
  })()}
</td>


 {/* Ders Özet Pill'i */}
 <td className="py-3.5 px-4 whitespace-nowrap">
 {o.siniflar && o.siniflar.length > 0 ? (
 <div className="flex items-center gap-1.5">
 {o.siniflar.slice(0, 2).map((s) => (
 <span key={s.id} className="text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1">
 <span>{s.sinif_adi}</span>
 <span className={`px-1.5 py-0.2 rounded text-[10px] font-black border ${s.kalan_ders_hakki <= 0 ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200 dark:border-rose-800/80' : 'bg-emerald-50 dark:bg-emerald-950 text-[#2eb82e] border-emerald-200 dark:border-emerald-700/60'}`}>
 {s.kalan_ders_hakki} Hak
 </span>
 </span>
 ))}
 {o.siniflar.length > 2 && (
 <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md">
 +{o.siniflar.length - 2} Ders
 </span>
 )}
 </div>
 ) : (
 <span className="text-xs text-slate-400 italic">Ders kaydı yok</span>
 )}
 </td>

 {/* Bakiye */}
 {isAdmin && (
 <td className="py-3.5 px-4 font-bold text-[#2eb82e] whitespace-nowrap">
 ₺{formatTL(o.bakiye)}
 </td>
 )}

 {/* İşlemler & Aç/Kapa İkonu */}
 <td className="py-3.5 px-4 text-right whitespace-nowrap">
 <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
 <button
 type="button"
 onClick={() => handleEkDersEkle(o)}
 className="px-2 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1 border border-indigo-200 dark:border-indigo-800/80 cursor-pointer"
 title="Ek Ders / Sınıf Ekle"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
 <span className="hidden xl:inline">Ders Ekle</span>
 </button>

 <button
 type="button"
 onClick={() => handleEditOgrenci(o)}
 className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/80 cursor-pointer"
 title="Öğrenciyi Düzenle"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
 <span className="hidden xl:inline">Düzenle</span>
 </button>

 {o.durum === 'Aktif' ? (
 <button
 type="button"
 onClick={() => handleToggleDurum(o.id, `${o.isim} ${o.soyisim}`, o.durum)}
 className="px-2 py-1.5 bg-sky-50 dark:bg-sky-950/80 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1 border border-sky-200 dark:border-sky-800/80 cursor-pointer"
 title="Öğrenciyi Pasife Al"
 >
 <UserMinus className="w-3.5 h-3.5" />
 <span className="hidden xl:inline">Pasife Al</span>
 </button>
 ) : (
 <button
 type="button"
 onClick={() => handleToggleDurum(o.id, `${o.isim} ${o.soyisim}`, o.durum)}
 className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/80 cursor-pointer"
 title="Öğrenciyi Aktifleştir"
 >
 <UserCheck className="w-3.5 h-3.5" />
 <span className="hidden xl:inline">Aktifleştir</span>
 </button>
 )}

 <div className="pl-0.5 text-slate-400 shrink-0">
 {isExpanded ? <ChevronUp className="w-4 h-4 text-[#2eb82e]" /> : <ChevronDown className="w-4 h-4" />}
 </div>
 </div>
 </td>
 </tr>

 {/* EXPANDABLE INLINE ACCORDION DETAILS PANEL */}
 <tr className={` transition-all duration-500 ${isExpanded ? 'border-b ' : '!border-transparent !border-t-0'}`}>
 <td colSpan={isAdmin ? 6 : 5} className="p-0 border-none">
 <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
 <div className="overflow-hidden">
 <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
 
 {/* 1. ÖĞRENCİ KİŞİSEL & İLETİŞİM BİLGİLERİ */}
 <div className="space-y-2">
 <div className="font-bold text-[#2eb82e] flex items-center gap-1.5 pb-1.5 border-b">
 <User className="w-4 h-4 text-[#2eb82e]" />
 <span className="uppercase tracking-wider">1. Öğrenci Genel Bilgileri</span>
 </div>
 <div className="space-y-1 text-slate-700 dark:text-slate-300">
 <div><strong className="text-slate-800 dark:text-slate-200">TC Kimlik:</strong> {o.tc || '-'}</div>
 <div><strong className="text-slate-800 dark:text-slate-200">Doğum Tarihi:</strong> {o.dogum_tarihi ? new Date(o.dogum_tarihi).toLocaleDateString('tr-TR') : '-'}</div>
 <div><strong className="text-slate-800 dark:text-slate-200">E-Posta:</strong> {o.eposta || '-'}</div>
 <div><strong className="text-slate-800 dark:text-slate-200">Telefon:</strong> {o.telefon || '-'}</div>
 <div><strong className="text-slate-800 dark:text-slate-200">Adres:</strong> {o.adres || '-'}</div>
 </div>
 </div>

 {/* 2. ANNE / BABA VELİ BİLGİLERİ */}
 <div className="space-y-2">
 <div className="font-bold text-[#0284c7] flex items-center gap-1.5 pb-1.5 border-b">
 <Heart className="w-4 h-4 text-[#0284c7]" />
 <span className="uppercase tracking-wider">2. Anne & Baba Veli Bilgileri</span>
 </div>
 <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
 <div className="p-2 rounded-lg border">
 <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">Anne: {o.anne_isim || '-'}</strong>
 <div className="text-[11px] text-slate-500 dark:text-slate-400">
 {o.anne_meslek && <span>Meslek: {o.anne_meslek} • </span>}
 {o.anne_telefon && <span>Tel: {o.anne_telefon}</span>}
 </div>
 </div>
 <div className="p-2 rounded-lg border">
 <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">Baba: {o.baba_isim || '-'}</strong>
 <div className="text-[11px] text-slate-500 dark:text-slate-400">
 {o.baba_meslek && <span>Meslek: {o.baba_meslek} • </span>}
 {o.baba_telefon && <span>Tel: {o.baba_telefon}</span>}
 </div>
 </div>
 </div>
 </div>

 {/* 3. KAYITLI DERSLER & KALAN DERS HAKLARI */}
 <div className="space-y-2">
 <div className="font-bold text-[#2eb82e] dark:text-emerald-400 flex items-center gap-1.5 pb-1.5 border-b">
 <BookOpen className="w-4 h-4 text-[#2eb82e] dark:text-emerald-400" />
 <span className="uppercase tracking-wider">3. Kayıtlı Dersler & Kalan Haklar</span>
 </div>
 
 {o.siniflar && o.siniflar.length > 0 ? (
 <div className="space-y-1.5">
 {o.siniflar.map((s) => (
 <div key={s.id} className="flex justify-between items-center p-2 rounded-lg border">
 <span className="font-bold text-slate-800 dark:text-slate-200">{s.sinif_adi}</span>
 <div className="flex items-center gap-2">
 <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${s.kalan_ders_hakki <= 0 ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200 dark:border-rose-800/80' : 'bg-emerald-50 dark:bg-emerald-950 text-[#2eb82e] border-emerald-200 dark:border-emerald-800/80'}`}>
 {s.kalan_ders_hakki} Ders Hakkı
 </span>
 <button
 type="button"
 onClick={() => handleRemoveFromSinif(o, s)}
 className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-950 p-1 rounded transition cursor-pointer"
 title={`Öğrenciyi "${s.sinif_adi}" dersinden çıkar`}
 >
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-slate-400 dark:text-slate-500 italic text-xs py-2">Henüz tanımlanmış ders kaydı bulunmuyor.</p>
 )}
 </div>

 </div>
 </div>
 </div>
 </td>
 </tr>
 </React.Fragment>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modal: Yeni Öğrenci Ekle */}
 {showModal && (
 <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
 <div className="neo-card rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col -slate-200 overflow-hidden text-slate-800 dark:text-slate-100">
 {/* STICKY FIXED HEADER */}
 <div className="flex justify-between items-center border-b px-6 py-4 shrink-0">
 <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
 <UserPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
 {isEditing ? "Öğrenciyi Düzenle" : "Yeni Öğrenci Ekle"}
 </h2>
 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl cursor-pointer">&times;</button>
 </div>

 {/* SCROLLABLE FORM BODY */}
 <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
 {/* 1. Öğrenci Bilgileri */}
 <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-4 border-b border-emerald-200 dark:border-emerald-800/50 pb-2">
 {isEditing ? "Öğrenci Bilgilerini Güncelle" : "Öğrenci Temel Bilgileri"}
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Adı *</label>
 <input type="text" name="isim" required value={formData.isim} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="Ahmet" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Soyadı *</label>
 <input type="text" name="soyisim" required value={formData.soyisim} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="Yılmaz" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Öğrenci TC Kimlik No</label>
 <input type="text" name="tc" value={formData.tc} onChange={handleInputChange} maxLength="11" className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="11122233344" />
 </div>
 <div>
 <CustomDatePicker
 label="Doğum Tarihi"
 value={formData.dogum_tarihi}
 onChange={(val) => setFormData(prev => ({ ...prev, dogum_tarihi: val }))}
 placeholder="Tarih Seçin"
 align="right"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
 <input type="text" name="telefon" value={formData.telefon} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="05551112233" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-Posta</label>
 <input type="text" name="eposta" value={formData.eposta} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="ahmet@gmail.com" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Branş / Sınıf Seçin</label>
 <select
 name="sinif_adi"
 value={formData.sinif_adi}
 onChange={handleInputChange}
 className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:border-[#2eb82e] outline-none cursor-pointer"
 >
 <option value="">-- Mevcut Sınıflardan Seçiniz --</option>
 {siniflar.map((s) => (
 <option key={s.id} value={s.sinif_adi}>
 {s.sinif_adi} (Kapasite: {s.kapasite})
 </option>
 ))}
 </select>
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Açık Adres</label>
 <textarea name="adres" rows="2" value={formData.adres} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none neo-input" placeholder="Öğrenci açık adresi..."></textarea>
 </div>
 </div>

 {/* 2. Anne Bilgileri */}
 <div className="text-xs font-bold text-[#0284c7] uppercase tracking-wider border-b border-sky-200 dark:border-sky-900/50 pb-1 pt-2">
 2. Anne Veli Bilgileri
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Anne Adı Soyadı</label>
 <input type="text" name="anne_isim" value={formData.anne_isim} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="Ayşe Yılmaz" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Anne Mesleği</label>
 <input type="text" name="anne_meslek" value={formData.anne_meslek} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="Örn: Öğretmen" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Anne TC Kimlik No</label>
 <input type="text" name="anne_tc" value={formData.anne_tc} onChange={handleInputChange} maxLength="11" className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="11122233355" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Anne Telefon</label>
 <input type="text" name="anne_telefon" value={formData.anne_telefon} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="05552223344" />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Anne E-Posta</label>
 <input type="text" name="anne_eposta" value={formData.anne_eposta} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="anne@gmail.com" />
 </div>
 </div>

 {/* 3. Baba Bilgileri */}
 <div className="text-xs font-bold text-[#0284c7] uppercase tracking-wider border-b border-sky-200 dark:border-sky-900/50 pb-1 pt-2">
 3. Baba Veli Bilgileri
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Baba Adı Soyadı</label>
 <input type="text" name="baba_isim" value={formData.baba_isim} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="Mehmet Yılmaz" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Baba Mesleği</label>
 <input type="text" name="baba_meslek" value={formData.baba_meslek} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="Örn: Mühendis" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Baba TC Kimlik No</label>
 <input type="text" name="baba_tc" value={formData.baba_tc} onChange={handleInputChange} maxLength="11" className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="11122233366" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Baba Telefon</label>
 <input type="text" name="baba_telefon" value={formData.baba_telefon} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="05553334455" />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Baba E-Posta</label>
 <input type="text" name="baba_eposta" value={formData.baba_eposta} onChange={handleInputChange} className="neo-input w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#2eb82e] outline-none" placeholder="baba@gmail.com" />
 </div>
 </div>

 {/* İletişim Kurulacak Kişi / Birincil Veli */}
 <div className="md:col-span-2 mt-4 p-4 neo-card rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
 <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
 <MessageCircle className="w-3.5 h-3.5 text-[#2eb82e]" />
 İletişim Kurulacak Kişi (Birincil Veli)
 </h3>
 <div className="flex bg-slate-100/80 dark:bg-slate-900/40 p-1 rounded-xl w-fit gap-0.5">
 {['Kendisi', 'Anne', 'Baba'].map(option => (
 <button
 key={option}
 type="button"
 onClick={() => handleInputChange({ target: { name: 'birincil_veli', value: option } })}
 className={`px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200 cursor-pointer ${
 formData.birincil_veli === option 
 ? 'bg-white dark:bg-slate-800 text-[#2eb82e] shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50' 
 : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/30'
 }`}
 >
 {option}
 </button>
 ))}
 </div>
 </div>

 <div className="flex justify-end gap-3 border-t pt-4">
 <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 hover: dark:hover: text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl cursor-pointer">İptal</button>
 <button type="submit" className="px-5 py-2 hover:bg-[#269926] text-white font-bold text-sm rounded-xl -emerald-900/30 cursor-pointer neo-button-primary">Kaydet</button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Modal: Ders Hakkı Tanımla */}
 {showEkDersModal && selectedOgrenci && (
 <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
 <div className="neo-card rounded-2xl max-w-md w-full p-6 -slate-200 space-y-4 text-slate-800 dark:text-slate-100">
 <div className="flex justify-between items-center border-b pb-3">
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
 <span>Ders Hakkı Tanımla: {selectedOgrenci.isim} {selectedOgrenci.soyisim}</span>
 </h3>
 <button onClick={() => setShowEkDersModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold cursor-pointer">&times;</button>
 </div>

 <form onSubmit={handleEkDersSubmit} className="space-y-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Eklenecek Sınıf / Branş Seçin *</label>
 <select
 required
 value={ekDersData.sinif_adi}
 onChange={(e) => setEkDersData({ ...ekDersData, sinif_adi: e.target.value })}
 className="w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:border-[#2eb82e] outline-none cursor-pointer neo-input"
 >
 <option value="">-- Sınıf Seçiniz --</option>
 {siniflar.map((s) => (
 <option key={s.id} value={s.sinif_adi}>
 {s.sinif_adi}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ders Hakkı Sayısı</label>
 <input type="number" value={ekDersData.kalan_ders_hakki} onChange={(e) => setEkDersData({ ...ekDersData, kalan_ders_hakki: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:border-[#2eb82e] outline-none neo-input" />
 </div>
 <div className="flex justify-end gap-2 border-t pt-3">
 <button type="button" onClick={() => setShowEkDersModal(false)} className="px-3 py-1.5 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg cursor-pointer">İptal</button>
 <button type="submit" className="px-4 py-1.5 hover:bg-[#269926] text-white text-xs font-bold rounded-lg cursor-pointer neo-button-primary">Ders Hakkını Kaydet</button>
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

export default Kayit;
