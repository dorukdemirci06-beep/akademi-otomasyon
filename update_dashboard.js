const fs = require('fs');

const dashboardPath = 'frontend/src/pages/Dashboard.jsx';
let dashboard = fs.readFileSync(dashboardPath, 'utf8');

// 1. Add Import
dashboard = dashboard.replace(
  "import ConfirmModal from '../components/ConfirmModal';",
  "import ConfirmModal from '../components/ConfirmModal';\nimport HaftalikDersCizelgesi from '../components/HaftalikDersCizelgesi';"
);

// 2. Add State Variables
const stateInsertPoint = dashboard.indexOf('const [loading, setLoading] = useState(true);');
dashboard = dashboard.substring(0, stateInsertPoint) + 
  `const [dersProgrami, setDersProgrami] = useState([]);\n  const [expandedGun, setExpandedGun] = useState(null);\n  ` + 
  dashboard.substring(stateInsertPoint);

// 3. Compute dersProgrami inside loadDashboardData
const setSiniflarListCall = "setSiniflarList(siniflar);";
const computeDersProgramiLogic = `setSiniflarList(siniflar);

      const dersler = [];
      siniflar.forEach(sinif => {
        if (sinif.ders_programi && Array.isArray(sinif.ders_programi)) {
          sinif.ders_programi.forEach(dp => {
            dersler.push({
              ...dp,
              sinif_adi: sinif.sinif_adi,
              renk: sinif.renk || 'indigo',
              ogretmen_adi: sinif.ogretmen_adi || dp.ogretmen_adi || '-'
            });
          });
        }
      });
      setDersProgrami(dersler);`;

dashboard = dashboard.replace(setSiniflarListCall, computeDersProgramiLogic);

// 4. Update JSX to remove the 4th card and add the HaftalikDersCizelgesi component
// Find the grid container start
const gridStart = dashboard.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">');
dashboard = dashboard.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">',
  '<div className="grid grid-cols-1 md:grid-cols-3 gap-5">'
);

// Find the 4th card and remove it
const cardStartText = '{/* Ders Programı Card */}';
const cardStartIndex = dashboard.indexOf(cardStartText);
if (cardStartIndex !== -1) {
  const cardEndText = '      </div>\n\n      {/* Recent Activity Table */}';
  const cardEndIndex = dashboard.indexOf(cardEndText, cardStartIndex);
  
  if (cardEndIndex !== -1) {
    const componentCall = `
      </div>

      <div className="mt-8">
        <HaftalikDersCizelgesi 
          dersProgrami={dersProgrami}
          expandedGun={expandedGun}
          setExpandedGun={setExpandedGun}
          readonly={true}
        />
      </div>

      {/* Recent Activity Table */}`;
    
    dashboard = dashboard.substring(0, cardStartIndex) + componentCall + dashboard.substring(cardEndIndex + cardEndText.length);
  }
}

fs.writeFileSync(dashboardPath, dashboard, 'utf8');
console.log("Dashboard.jsx updated successfully.");
