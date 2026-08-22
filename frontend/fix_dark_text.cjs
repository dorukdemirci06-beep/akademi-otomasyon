const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

let totalReplaced = 0;

walk('src', (file) => {
  if (!file.endsWith('.jsx')) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  let newContent = content.replace(/className=(?:\{`|["'])(.*?)(?:`\}|["'])/g, (match, classStr) => {
    let newClassStr = classStr;
    
    // If it has bg-[#2eb82e] or bg-emerald-500/600 etc, remove dark:text-[#2eb82e]
    if (newClassStr.includes('bg-[#2eb82e]') || newClassStr.includes('bg-emerald-')) {
      newClassStr = newClassStr.replace(/\bdark:text-\[\#2eb82e\]\b/g, '');
    }
    
    // If it has bg-[#0284c7] or bg-sky-500/600 etc, remove dark:text-[#0284c7]
    if (newClassStr.includes('bg-[#0284c7]') || newClassStr.includes('bg-sky-')) {
      newClassStr = newClassStr.replace(/\bdark:text-\[\#0284c7\]\b/g, '');
    }

    // Since text-white is already there from previous updates, removing the dark: override fixes the invisible text in dark mode.

    return match.replace(classStr, newClassStr);
  });

  if (newContent !== original) {
    fs.writeFileSync(file, newContent, 'utf8');
    totalReplaced++;
    console.log('Fixed invisible text in:', file);
  }
});
console.log('Total files fixed:', totalReplaced);
