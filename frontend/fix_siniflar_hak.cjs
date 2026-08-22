const fs = require('fs');

function fixFile(filePath) {
  let txt = fs.readFileSync(filePath, 'utf8');
  let original = txt;
  
  // Replace the multi-line ternaries in Siniflar.jsx
  txt = txt.replace(/bg-rose-50 dark:bg-rose-950\/80 text-rose-600 border-rose-200 dark:border-rose-800\/80/g, 'bg-rose-600 text-white border-transparent shadow-sm');
  txt = txt.replace(/bg-emerald-50 dark:bg-emerald-950\/80 text-\[#2eb82e\] border-emerald-200 dark:border-emerald-800\/80/g, 'bg-[#2eb82e] text-white border-transparent shadow-sm');

  // Replace rounded-lg -> rounded-full
  txt = txt.replace(/rounded-lg font-bold border/g, 'rounded-full font-bold border-transparent');
  txt = txt.replace(/rounded text-xs font-bold border/g, 'rounded-full text-xs font-bold border-transparent');

  if(txt !== original) {
    fs.writeFileSync(filePath, txt);
    console.log('Fixed', filePath);
  }
}

fixFile('src/pages/Siniflar.jsx');

