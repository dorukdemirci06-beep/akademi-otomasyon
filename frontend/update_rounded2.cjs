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
  
  // Replace rounded-* with rounded-full ANYWHERE that looks like a className for button, span, a, Link, or div
  // But doing it safely: replace all rounded-(xl|lg|md|2xl|3xl) with rounded-full if it's inside className="...", className='...', or className={`...`}
  
  let newContent = content.replace(/className=[\"'\`]?([^\"'\`\}]+)[\"'\`\}]?/gi, (match, classNames) => {
    // Only apply if it's a pill-like element or has padding that suggests a button/badge
    // Actually, user wants all buttons and texts to be pill-shaped.
    // Let's just blindly replace them if they are inside a className string.
    // WAIT, if I do this on neo-card it will break. neo-card uses rounded-3xl or 2xl.
    
    if (classNames.includes('neo-card')) return match; // skip cards
    if (classNames.includes('rounded-full')) return match; // already done
    
    let updated = classNames.replace(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g, 'rounded-full');
    return match.replace(classNames, updated);
  });
  
  // Also fix buttonClassName in CustomDatePicker
  newContent = newContent.replace(/buttonClassName=[\"'\`]([^\"'\`\}]+)[\"'\`\}]?/gi, (match, classNames) => {
    let updated = classNames.replace(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g, 'rounded-full');
    return match.replace(classNames, updated);
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    totalReplaced++;
    console.log('Updated', file);
  }
});
console.log('Total files updated:', totalReplaced);
