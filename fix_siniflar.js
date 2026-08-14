const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Siniflar.jsx', 'utf8');

// Update imports
content = content.replace(
    /import \{ getOgrenciler, getSiniflar, createSinif, deleteSinif, getSinifOgrencileri, getOnKayitlar, createDersProgrami, deleteDersProgrami \} from '\.\.\/services\/api';/,
    "import { getOgrenciler, getSiniflar, getSiniflarBasic, createSinif, deleteSinif, getSinifOgrencileri, getOnKayitlar, createDersProgrami, deleteDersProgrami } from '../services/api';"
);

// Update fetchSiniflarModal
const oldFetch = ` const fetchSiniflarModal = async () => {
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
 };`;

const newFetch = ` const fetchSiniflarModal = async () => {
 try {
 setSiniflarLoading(true);
 // 1. Hızlı (temel) listeyi hemen yükle
 const basicRes = await getSiniflarBasic();
 setSiniflarList(basicRes.data || []);
 setSinifCount((basicRes.data || []).length);
 setSiniflarLoading(false); // Yüklenme işaretini anında kaldır
 
 // 2. Genişletilmiş verileri (Ders saatleri, öğrenci sayıları) arka planda yükle
 getSiniflar().then(fullRes => {
 setSiniflarList(fullRes.data || []);
 }).catch(err => {
 console.error('Genişletilmiş sınıf verileri yüklenemedi:', err);
 });
 } catch (err) {
 console.error('Sınıflar yüklenemedi:', err);
 setSiniflarLoading(false);
 }
 };`;

// Just to be safe with indentation, replace with regex matching whitespace
content = content.replace(/const fetchSiniflarModal \= async \(\) \=\> \{[\s\S]*?\}\;\n/m, newFetch + '\n');

fs.writeFileSync('frontend/src/pages/Siniflar.jsx', content);
