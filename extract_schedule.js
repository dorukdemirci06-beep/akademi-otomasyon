const fs = require('fs');

const yoklamaPath = 'frontend/src/pages/Yoklama.jsx';
let yoklama = fs.readFileSync(yoklamaPath, 'utf8');

const haftalikDersStart = yoklama.indexOf('{/* HAFTALIK DERS PROGRAMI SEKSİYONU */}');
const yoklamaAlmaStart = yoklama.indexOf('{/* YOKLAMA ALMA ALANI */}');

if (haftalikDersStart === -1 || yoklamaAlmaStart === -1) {
    console.error("Could not find sections in Yoklama.jsx");
    process.exit(1);
}

const haftalikDersContent = yoklama.substring(haftalikDersStart, yoklamaAlmaStart);

const componentCode = `import React from 'react';
import { Calendar, Minimize2, Maximize2, Trash2, Clock, User } from 'lucide-react';

export const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const getStyleForRenk = (renk) => {
  const styles = {
    indigo: 'bg-indigo-950/40 text-indigo-100 border-indigo-500/30 hover:border-indigo-400',
    emerald: 'bg-emerald-950/40 text-emerald-100 border-emerald-500/30 hover:border-emerald-400',
    amber: 'bg-amber-950/40 text-amber-100 border-amber-500/30 hover:border-amber-400',
    purple: 'bg-purple-950/40 text-purple-100 border-purple-500/30 hover:border-purple-400',
    sky: 'bg-sky-950/40 text-sky-100 border-sky-500/30 hover:border-sky-400',
    rose: 'bg-rose-950/40 text-rose-100 border-rose-500/30 hover:border-rose-400',
    green: 'bg-green-950/40 text-green-100 border-green-500/30 hover:border-green-400',
    yellow: 'bg-yellow-950/40 text-yellow-100 border-yellow-500/30 hover:border-yellow-400',
    red: 'bg-red-950/40 text-red-100 border-red-500/30 hover:border-red-400'
  };
  return styles[renk] || styles.indigo;
};

const HaftalikDersCizelgesi = ({
  dersProgrami,
  expandedGun,
  setExpandedGun,
  selectedSinifId,
  setSelectedSinifId,
  handleDeleteDers,
  readonly = false
}) => {
  return (
    ${haftalikDersContent.trim()}
  );
};

export default HaftalikDersCizelgesi;
`;

// In Yoklama.jsx, replace the component with <HaftalikDersCizelgesi />
// We must also pass the props.
const replacementComponentCall = `
      <HaftalikDersCizelgesi 
        dersProgrami={dersProgrami}
        expandedGun={expandedGun}
        setExpandedGun={setExpandedGun}
        selectedSinifId={selectedSinifId}
        setSelectedSinifId={setSelectedSinifId}
        handleDeleteDers={handleDeleteDers}
      />
      
      `;

yoklama = yoklama.substring(0, haftalikDersStart) + replacementComponentCall + yoklama.substring(yoklamaAlmaStart);
// Add import to Yoklama.jsx
yoklama = yoklama.replace("import CustomDatePicker from '../components/CustomDatePicker';", "import CustomDatePicker from '../components/CustomDatePicker';\nimport HaftalikDersCizelgesi from '../components/HaftalikDersCizelgesi';");

// Remove GUNLER from Yoklama.jsx since it's exported now, or just leave it for safety? 
// It's safer to just import it if needed, or just let it be duplicate for now to prevent breaking anything.

fs.writeFileSync('frontend/src/components/HaftalikDersCizelgesi.jsx', componentCode, 'utf8');
fs.writeFileSync(yoklamaPath, yoklama, 'utf8');

console.log("Component extracted and Yoklama.jsx updated successfully.");
