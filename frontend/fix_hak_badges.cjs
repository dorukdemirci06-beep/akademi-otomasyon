const fs = require('fs');
const path = require('path');
function walk(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    fs.statSync(p).isDirectory() ? walk(p, cb) : cb(p);
  });
}
walk('src', (file) => {
  if(!file.endsWith('.jsx')) return;
  let txt = fs.readFileSync(file, 'utf8');
  let original = txt;
  
  // Fix template literals missed by regex
  txt = txt.split("'text-rose-600 border-rose-200'").join("'bg-rose-600 text-white border-transparent shadow-sm'");
  txt = txt.split("'text-[#2eb82e] border-emerald-200'").join("'bg-[#2eb82e] text-white border-transparent shadow-sm'");
  
  txt = txt.split("'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200 dark:border-rose-800/80'").join("'bg-rose-600 text-white border-transparent shadow-sm'");
  txt = txt.split("'bg-emerald-50 dark:bg-emerald-950 text-[#2eb82e] border-emerald-200 dark:border-emerald-700/60'").join("'bg-[#2eb82e] text-white border-transparent shadow-sm'");
  txt = txt.split("'bg-emerald-50 dark:bg-emerald-950 text-[#2eb82e] border-emerald-200 dark:border-emerald-700/80'").join("'bg-[#2eb82e] text-white border-transparent shadow-sm'");
  
  // Replace the rounded classes near kalan_ders_hakki
  txt = txt.split("px-1.5 py-0.2 rounded text-[10px] font-black border").join("px-2 py-0.5 rounded-full text-[10px] font-black border-transparent");
  txt = txt.split("px-2 py-0.5 rounded text-[11px] font-extrabold border").join("px-2 py-0.5 rounded-full text-[11px] font-extrabold border-transparent");
  txt = txt.split("px-2 py-0.5 rounded text-[10px] font-extrabold border").join("px-2 py-0.5 rounded-full text-[10px] font-extrabold border-transparent");
  
  // Any others that say {o.kalan_ders_hakki} or {s.kalan_ders_hakki}
  txt = txt.split("px-3 py-1 rounded-full font-bold border").join("px-3 py-1 rounded-full font-bold border-transparent");

  if(txt !== original) { fs.writeFileSync(file, txt); console.log('Fixed Hak badges in', file); }
});
