const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    fs.statSync(p).isDirectory() ? walk(p, cb) : cb(p);
  });
}

walk('src', (file) => {
  if (!file.endsWith('.jsx')) return;
  let txt = fs.readFileSync(file, 'utf8');
  let original = txt;
  
  // Clean up any existing duplicates or exact hover classes first to avoid infinite duplication
  txt = txt.replace(/hover:bg-\[#269926\]/g, '');
  txt = txt.replace(/hover:bg-rose-700/g, '');
  txt = txt.replace(/hover:bg-\[#026aa3\]/g, '');
  txt = txt.replace(/hover:bg-sky-700/g, '');
  txt = txt.replace(/transition-colors/g, '');
  txt = txt.replace(/transition-all/g, 'transition'); // normalize

  // Fix extra spaces
  txt = txt.replace(/\s+/g, ' ');

  // Add the hover effects directly after the background colors
  txt = txt.replace(/bg-\[#2eb82e\]/g, 'bg-[#2eb82e] hover:bg-[#269926] transition-colors');
  txt = txt.replace(/bg-rose-600/g, 'bg-rose-600 hover:bg-rose-700 transition-colors');
  txt = txt.replace(/bg-\[#0284c7\]/g, 'bg-[#0284c7] hover:bg-[#026aa3] transition-colors');

  if(txt !== original) {
    fs.writeFileSync(file, txt);
    console.log('Fixed hover in', file);
  }
});
