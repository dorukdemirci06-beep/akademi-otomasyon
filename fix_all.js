const fs = require('fs');

// 1. Read original Dashboard from Git without using PowerShell piping
const { execSync } = require('child_process');
const originalDashboard = execSync('git show HEAD:frontend/src/pages/Dashboard.jsx', { encoding: 'utf8' });

// 2. Generate Siniflar.jsx
let siniflar = originalDashboard.replace('const Dashboard = () => {', 'const Siniflar = () => {');
siniflar = siniflar.replace('export default Dashboard;', 'export default Siniflar;');

const modalsStart = siniflar.indexOf('{/* ================= MODAL: Yeni');
const mainReturnStart = siniflar.indexOf('return (\n    <div className="space-y-6">');
const modalStartIdx = siniflar.indexOf('<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex');
const tableStart = siniflar.indexOf('{/* Modal Table */}', modalStartIdx);

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

const tableEndIdx = siniflar.indexOf('</table>', tableStart) + 8;
const tableContent = siniflar.substring(tableStart, siniflar.indexOf('</div>', tableEndIdx) + 6);

const exportIdx = siniflar.lastIndexOf('export default Siniflar;');
const closingBraceIdx = siniflar.lastIndexOf('}', exportIdx);
const mainDivEndIdx = siniflar.lastIndexOf('</div>', closingBraceIdx);

const modalsContent = siniflar.substring(modalsStart, mainDivEndIdx);
const newReturn = `  return (\n` + headerHtml + tableContent + `\n        </div>\n      </div>\n\n` + modalsContent + `\n    </>\n  );\n}\n\nexport default Siniflar;\n`;

siniflar = siniflar.substring(0, mainReturnStart) + newReturn;
siniflar = siniflar.replace('loadDashboardData();', 'fetchSiniflarModal();');
siniflar = siniflar.replace('import { getOgrenciler, getSiniflar', 'import { getSiniflar');

fs.writeFileSync('frontend/src/pages/Siniflar.jsx', siniflar, 'utf8');

// 3. Fix Dashboard.jsx
let dashboard = originalDashboard;

// Fix the Link wrapper for Aktif Sinif
const cardStart = dashboard.indexOf('{/* Aktif Sinif & Brans Card - CLICKABLE */}');
const cardEnd = dashboard.indexOf('{/* Ön Kayıt Adaylar Card */}');
let cardBlock = dashboard.substring(cardStart, cardEnd);

// Replace onClick div with Link
cardBlock = cardBlock.replace(/<div \s*onClick={openSiniflarModal}/, '<Link to="/siniflar"');
cardBlock = cardBlock.replace('        </div>\n\n', '        </Link>\n\n');

dashboard = dashboard.substring(0, cardStart) + cardBlock + dashboard.substring(cardEnd);

// Remove the modals from Dashboard
const dbModalsStart = dashboard.indexOf('{/* ================= MODAL: Mevcut Sınıflar & Kontenjan Yönetimi ================= */}');
const dbExportIdx = dashboard.lastIndexOf('export default Dashboard;');
const dbClosingBraceIdx = dashboard.lastIndexOf('}', dbExportIdx);
const dbMainDivEndIdx = dashboard.lastIndexOf('</div>', dbClosingBraceIdx);

dashboard = dashboard.substring(0, dbModalsStart) + '    </div>\n  );\n};\n\nexport default Dashboard;\n';

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', dashboard, 'utf8');
console.log('Success completely');
