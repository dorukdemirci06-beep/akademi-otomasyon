const fs = require('fs');

const content = fs.readFileSync('dashboard_head.jsx', 'utf16le');

// Rename component
let newContent = content.replace('const Dashboard = () => {', 'const Siniflar = () => {');
newContent = newContent.replace('export default Dashboard;', 'export default Siniflar;');

// Find modals_start
const ekleModalIndex = newContent.indexOf('{/* ================= MODAL: Yeni Sınıf Ekle Sub-Modal');
if (ekleModalIndex === -1) {
    // try fallback for encoding artifacts
    const ekleModalIndex2 = newContent.indexOf('Yeni S');
    if (ekleModalIndex2 === -1) {
        console.error("Modal not found");
        process.exit(1);
    }
}
const modalsStart = newContent.indexOf('{/* ================= MODAL:', newContent.indexOf('showSiniflarModal(false)') + 50);

// Main return start
const mainReturnStart = newContent.indexOf('return (\n    <div className="space-y-6">');

// Table start
const modalStartIdx = newContent.indexOf('<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex');
const tableStart = newContent.indexOf('{/* Modal Table */}', modalStartIdx);

const headerHtml = `    <>
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
`;

const tableEndIdx = newContent.indexOf('</table>', tableStart) + 8;
const tableContent = newContent.substring(tableStart, newContent.indexOf('</div>', tableEndIdx) + 6);

const exportIdx = newContent.lastIndexOf('export default Siniflar;');
const closingBraceIdx = newContent.lastIndexOf('}', exportIdx);
const mainDivEndIdx = newContent.lastIndexOf('</div>', closingBraceIdx);

// The modals go from `modalsStart` up to `mainDivEndIdx`
const modalsContent = newContent.substring(modalsStart, mainDivEndIdx);

const newReturn = `  return (\n` + headerHtml + tableContent + `\n        </div>\n      </div>\n\n` + modalsContent + `\n    </>\n  );\n}\n\nexport default Siniflar;\n`;

newContent = newContent.substring(0, mainReturnStart) + newReturn;

newContent = newContent.replace('loadDashboardData();', 'fetchSiniflarModal();');

fs.writeFileSync('frontend/src/pages/Siniflar.jsx', newContent, 'utf8');
console.log('Success');
