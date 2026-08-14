const fs = require('fs');

// --- 1. YOKLAMA.JSX ---
let yoklama = fs.readFileSync('frontend/src/pages/Yoklama.jsx', 'utf8');

// Update imports for getSiniflarBasic
yoklama = yoklama.replace(
    /import \{ getOgrenciler, getSiniflar, getSinifOgrencileri, getYoklamaGecmisi, kaydedYoklama, getDersProgrami \} from '\.\.\/services\/api';/,
    "import { getOgrenciler, getSiniflar, getSiniflarBasic, getSinifOgrencileri, getYoklamaGecmisi, kaydedYoklama, getDersProgrami } from '../services/api';"
);

// We might need to handle slightly different import styles, so let's also try a more generic approach if that fails:
if (!yoklama.includes('getSiniflarBasic')) {
    yoklama = yoklama.replace(/getSiniflar,/g, 'getSiniflar, getSiniflarBasic,');
}

const oldYoklamaFetch = ` const fetchInitialData = async () => {
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
 };`;

const newYoklamaFetch = ` const fetchInitialData = async () => {
 try {
 // 1. Temel verileri anında yükle
 const [sinifBasicRes, progRes] = await Promise.all([
 getSiniflarBasic(),
 getDersProgrami()
 ]);

 const sinifList = sinifBasicRes.data || [];
 setSiniflar(sinifList);
 setDersProgrami(progRes.data || []);

 if (sinifList.length > 0 && !selectedSinifId) {
 setSelectedSinifId(sinifList[0].id.toString());
 }
 
 // 2. Arka planda genişletilmiş sınıfları yükle (sayı ve detaylar için)
 getSiniflar().then(fullRes => {
 setSiniflar(fullRes.data || []);
 }).catch(err => console.error("Genişletilmiş sınıflar yüklenemedi", err));
 
 } catch (err) {
 console.error('İlk veriler yüklenirken hata:', err);
 }
 };`;

// Use regex matching everything between `const fetchInitialData = async () => {` and `};`
yoklama = yoklama.replace(/const fetchInitialData \= async \(\) \=\> \{[\s\S]*?\}\;\n/m, newYoklamaFetch + '\n');
fs.writeFileSync('frontend/src/pages/Yoklama.jsx', yoklama);


// --- 2. FINANS.JSX ---
let finans = fs.readFileSync('frontend/src/pages/Finans.jsx', 'utf8');

// Replace fetchOgrencilerVeOdemeler completely
const newFinansFetch = ` const fetchOgrencilerVeOdemeler = async (autoOpenStudentId = null) => {
 try {
 setLoading(true);
 
 // 1. Öğrencileri anında yükle ve listeyi göster
 const ogrenciRes = await getOgrenciler();
 const rawOgrenciler = ogrenciRes.data || [];
 setOgrenciler(rawOgrenciler); 
 setLoading(false);

 // 2. Ödemeleri arka planda yükle ve öğrencileri zenginleştir
 getOdemeler().then(odemeRes => {
 const odemelerList = odemeRes.data || [];
 setOdemeler(odemelerList);

 const now = new Date();
 now.setHours(23, 59, 59, 999);

 const enrichedOgrenciler = rawOgrenciler.map((o) => {
 const studentOdemeler = odemelerList.filter((p) => Number(p.ogrenci_id) === Number(o.id));
 
 // Son ödeme tarihi (Ödendi durumundakilerden en sonuncusu)
 const odenenler = studentOdemeler.filter((p) => p.durum === 'Ödendi');
 odenenler.sort((a, b) => new Date(b.tarih || 0) - new Date(a.tarih || 0));
 const sonOdeme = odenenler.length > 0 ? odenenler[0].tarih : o.son_odeme_tarihi;

 // Vadesi gelmiş / gecikmiş ödeme kontrolü
 const hasOverdue = studentOdemeler.some((p) => {
 if (p.durum === 'Bekliyor' || p.durum === 'Gecikti') {
 if (!p.tarih) return true;
 return new Date(p.tarih) <= now;
 }
 return false;
 });

 // En yakın bekleyen vade tarihi
 const bekleyenler = studentOdemeler.filter((p) => p.durum === 'Bekliyor' || p.durum === 'Gecikti');
 bekleyenler.sort((a, b) => new Date(a.tarih || 0) - new Date(b.tarih || 0));
 const enYakinVade = bekleyenler.length > 0 ? bekleyenler[0].tarih : null;

 return { 
 ...o, 
 son_odeme_tarihi: sonOdeme,
 gecikmis_odeme_var_mi: hasOverdue,
 en_yakin_vade_tarihi: enYakinVade,
 bekleyen_odeme_sayisi: bekleyenler.length
 };
 });

 setOgrenciler(enrichedOgrenciler);

 const targetId = autoOpenStudentId || (selectedOgrenci ? selectedOgrenci.id : null);
 if (targetId) {
 const updatedSelected = enrichedOgrenciler.find(s => Number(s.id) === Number(targetId));
 if (updatedSelected) {
 setSelectedOgrenci(updatedSelected);
 }
 }
 }).catch(err => console.error('Ödemeler arka planda yüklenemedi:', err));
 
 } catch (err) {
 console.error('Öğrenci verileri getirilemedi:', err);
 setLoading(false);
 }
 };`;

finans = finans.replace(/const fetchOgrencilerVeOdemeler \= async \(autoOpenStudentId \= null\) \=\> \{[\s\S]*?\}\;\n\n/m, newFinansFetch + '\n\n');
fs.writeFileSync('frontend/src/pages/Finans.jsx', finans);
console.log('Successfully updated Yoklama.jsx and Finans.jsx');
