const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Fix Toplam Ogrenci Card
content = content.replace(/className="neo-button-primary p-6 rounded-2xl hover:border-\[\#2eb82e\] hover:scale-\[1\.01\] transition block group"/g, 'className="neo-card p-6 !rounded-2xl hover:border-[#2eb82e] hover:scale-[1.01] transition block group border-2 border-transparent"');

// Fix RENK_OPTIONS
const newRenk = `const RENK_OPTIONS = [
  { label: 'İndigo', value: 'indigo', bg: 'neo-card !p-2 !shadow-sm !rounded-lg border-l-4 !border-l-indigo-500 !border-y-0 !border-r-0' },
  { label: 'Zümrüt', value: 'emerald', bg: 'neo-card !p-2 !shadow-sm !rounded-lg border-l-4 !border-l-emerald-500 !border-y-0 !border-r-0' },
  { label: 'Turuncu', value: 'amber', bg: 'neo-card !p-2 !shadow-sm !rounded-lg border-l-4 !border-l-amber-500 !border-y-0 !border-r-0' },
  { label: 'Mor', value: 'purple', bg: 'neo-card !p-2 !shadow-sm !rounded-lg border-l-4 !border-l-purple-500 !border-y-0 !border-r-0' },
  { label: 'Mavi', value: 'sky', bg: 'neo-card !p-2 !shadow-sm !rounded-lg border-l-4 !border-l-sky-500 !border-y-0 !border-r-0' },
  { label: 'Gül', value: 'rose', bg: 'neo-card !p-2 !shadow-sm !rounded-lg border-l-4 !border-l-rose-500 !border-y-0 !border-r-0' },
  { label: 'Yeşil', value: 'green', bg: 'neo-card !p-2 !shadow-sm !rounded-lg border-l-4 !border-l-green-500 !border-y-0 !border-r-0' },
  { label: 'Sarı', value: 'yellow', bg: 'neo-card !p-2 !shadow-sm !rounded-lg border-l-4 !border-l-yellow-500 !border-y-0 !border-r-0' },
  { label: 'Kırmızı', value: 'red', bg: 'neo-card !p-2 !shadow-sm !rounded-lg border-l-4 !border-l-red-500 !border-y-0 !border-r-0' }
];`;

content = content.replace(/const RENK_OPTIONS = \[[\s\S]*?\];/, newRenk);

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content);
console.log('Fixed Dashboard');
