import os

file_path = "frontend/src/services/api.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports
content = content.replace(
    "import axios from 'axios';",
    "import axios from 'axios';\nimport { isArchiveMode, getArchiveData } from './archiveMode';"
)

# 2. Add Request Interceptor logic for POST/PUT/DELETE
req_interceptor_old = """API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');"""
req_interceptor_new = """API.interceptors.request.use(
  (config) => {
    // ARŞİV MODU: Veri değiştirici işlemleri tamamen engelle!
    if (isArchiveMode() && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        throw new axios.Cancel("Arşiv modunda değişiklik yapılamaz. Lütfen önce arşiv modundan çıkın.");
    }
    const token = localStorage.getItem('token');"""
content = content.replace(req_interceptor_old, req_interceptor_new)

# 3. Add API.get Mock Override
mock_override = """
// --- ARŞİV MODU İÇİN API.GET OVERRIDE ---
const originalGet = API.get;
API.get = async (url, config) => {
  if (isArchiveMode()) {
    const archive = getArchiveData();
    if (archive) {
      if (url.includes('/ogrenciler/')) {
        const sinifMatch = url.match(/\\/ogrenciler\\/(\\d+)\\/siniflar\\/?/);
        if (sinifMatch) {
            const ogrenciId = parseInt(sinifMatch[1]);
            const sinifIds = archive.ogrenci_siniflar.filter(os => os.ogrenci_id === ogrenciId).map(os => os.sinif_id);
            const siniflar = archive.siniflar.filter(s => sinifIds.includes(s.id));
            return { data: siniflar };
        }
        return { data: archive.ogrenciler };
      }
      
      if (url.includes('/siniflar/')) {
        const ogrMatch = url.match(/\\/siniflar\\/(\\d+)\\/ogrenciler\\/?/);
        if (ogrMatch) {
            const sinifId = parseInt(ogrMatch[1]);
            const ogrenciIds = archive.ogrenci_siniflar.filter(os => os.sinif_id === sinifId).map(os => os.ogrenci_id);
            const ogrenciler = archive.ogrenciler.filter(o => ogrenciIds.includes(o.id));
            return { data: ogrenciler };
        }
        return { data: archive.siniflar };
      }
      
      if (url.includes('/odemeler-list/')) return { data: archive.odemeler };
      
      if (url.includes('/yoklama/')) {
         // filter yoklamalar if sinif_id is provided in params
         let yoks = archive.yoklamalar;
         if (config && config.params) {
            if (config.params.sinif_id) {
               yoks = yoks.filter(y => y.sinif_id == config.params.sinif_id);
            }
            if (config.params.tarih) {
               yoks = yoks.filter(y => y.tarih == config.params.tarih);
            }
         }
         return { data: yoks };
      }
      
      if (url.includes('/ders-programi/')) return { data: archive.ders_programlari || [] };
      if (url.includes('/on-kayitlar/')) return { data: [] };
    }
  }
  return originalGet.call(API, url, config);
};
"""

content = content.replace("// --- AKILLI ÖN BELLEK (CACHE) SİSTEMİ ---", mock_override + "\n// --- AKILLI ÖN BELLEK (CACHE) SİSTEMİ ---")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("api.js updated for Archive Mode.")
