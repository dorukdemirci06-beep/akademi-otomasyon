const fs = require('fs');

let content = fs.readFileSync('dashboard_head.jsx', 'utf8');

// Rename component
content = content.replace('const Dashboard = () => {', 'const Siniflar = () => {');
content = content.replace('export default Dashboard;', 'export default Siniflar;');
content = content.replace('loadDashboardData();', 'fetchSiniflarModal();');
content = content.replace('import { getOgrenciler, getSiniflar, createSinif, deleteSinif, getSinifOgrencileri, getOnKayitlar, createDersProgrami, deleteDersProgrami } from \'../services/api\';', 'import { getSiniflar, createSinif, deleteSinif, getSinifOgrencileri, createDersProgrami, deleteDersProgrami } from \'../services/api\';');

// Find modalsStart using regex to be safe from encoding
const modalMatch = content.match(/\{\/\*\s*={10,}\s*MODAL:\s*Yeni/);
if (!modalMatch) {
    console.error('Modal start not found');
    process.exit(1);
}
const modalsStart = modalMatch.index;

// Main return start using regex to handle \r\n
const match = content.match(/return\s*\(\s*<div className="space-y-6">/);
if (!match) {
    console.error('Return not found');
    process.exit(1);
}
const mainReturnStart = match.index;

// Table start
const modalStartIdx = content.indexOf('<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex');
const tableStart = content.indexOf('{/* Modal Table */}', modalStartIdx);

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

const tableEndIdx = content.indexOf('</table>', tableStart) + 8;
const tableContent = content.substring(tableStart, content.indexOf('</div>', tableEndIdx) + 6);

const exportIdx = content.lastIndexOf('export default Siniflar;');
const closingBraceIdx = content.lastIndexOf('}', exportIdx);
const mainDivEndIdx = content.lastIndexOf('</div>', closingBraceIdx);

const modalsContent = content.substring(modalsStart, mainDivEndIdx);

const newReturn = `  return (\n` + headerHtml + tableContent + `\n        </div>\n      </div>\n\n` + modalsContent + `\n    </>\n  );\n}\n\nexport default Siniflar;\n`;

let finalContent = content.substring(0, mainReturnStart) + newReturn;

fs.writeFileSync('frontend/src/pages/Siniflar.jsx', finalContent, 'utf8');
console.log('Success');
