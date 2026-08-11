const fs = require('fs');

let dashboard = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// 1. Remove modals
const dbModalsStart = dashboard.indexOf('{/* ================= MODAL: Mevcut');
if (dbModalsStart !== -1) {
    const dbExportIdx = dashboard.lastIndexOf('export default Dashboard;');
    const dbClosingBraceIdx = dashboard.lastIndexOf('}', dbExportIdx);
    const dbMainDivEndIdx = dashboard.lastIndexOf('</div>', dbClosingBraceIdx);
    dashboard = dashboard.substring(0, dbModalsStart) + '    </div>\n  );\n};\n\nexport default Dashboard;\n';
}

// 2. Fix layout and add card
const kpiStart = dashboard.indexOf('{/* KPI Stats Cards */}');
if (kpiStart !== -1) {
    dashboard = dashboard.replace('grid-cols-1 md:grid-cols-3', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4');
    
    const cardEndMarker = '{/* Ön Kayıt Adaylar Card */}';
    const cardEnd = dashboard.indexOf(cardEndMarker);
    if (cardEnd !== -1) {
        // First fix the Aktif Sinif link if needed (if it is a div)
        let beforeCardEnd = dashboard.substring(0, cardEnd);
        beforeCardEnd = beforeCardEnd.replace(/<div \s*onClick=\{openSiniflarModal\}/, '<Link to="/siniflar"');
        beforeCardEnd = beforeCardEnd.replace('<span>Sınıfları Görüntüle & Yönet →</span>\n          </div>\n        </div>', '<span>Sınıfları Görüntüle & Yönet →</span>\n          </div>\n        </Link>');

        const newCard = `
        {/* Ders Programı Card */}
        <Link 
          to="/siniflar" 
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-md hover:border-purple-500 hover:scale-[1.01] transition block group"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider group-hover:text-purple-500 transition">DERS PROGRAMI</p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">Haftalık Plan</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/60 text-purple-500 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-purple-500 font-semibold gap-1">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Programı Görüntüle & Yönet →</span>
          </div>
        </Link>
`;
        const endOfGrid = dashboard.indexOf('</div>', dashboard.indexOf('</Link>', dashboard.indexOf(cardEndMarker)) + 7);
        dashboard = beforeCardEnd + dashboard.substring(cardEnd, endOfGrid) + newCard + dashboard.substring(endOfGrid);
    }
}

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', dashboard, 'utf8');
console.log('Dashboard fixed and card added');
