const fs = require('fs');

function fixFile(filePath) {
  let txt = fs.readFileSync(filePath, 'utf8');
  let original = txt;
  
  txt = txt.replace(/bg-emerald-100 dark:bg-emerald-950\/80  dark:text-\[#2eb82e\] border-emerald-300 dark:border-emerald-800\/80/g, 'bg-[#2eb82e] text-white border-transparent shadow-sm');
  txt = txt.replace(/bg-emerald-100 dark:bg-emerald-950\/80 dark:text-\[#2eb82e\] border-emerald-300 dark:border-emerald-800\/80/g, 'bg-[#2eb82e] text-white border-transparent shadow-sm');

  if(txt !== original) {
    fs.writeFileSync(filePath, txt);
    console.log('Fixed', filePath);
  }
}

fixFile('src/pages/Yoklama.jsx');
