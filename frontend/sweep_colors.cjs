const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const colorMap = {
  emerald: 'bg-[#2eb82e]',
  green: 'bg-[#2eb82e]',
  rose: 'bg-rose-600',
  red: 'bg-rose-600',
  sky: 'bg-[#0284c7]',
  blue: 'bg-[#0284c7]',
  indigo: 'bg-indigo-500',
  purple: 'bg-indigo-500',
  amber: 'bg-amber-500',
  yellow: 'bg-amber-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  fuchsia: 'bg-fuchsia-500',
  pink: 'bg-pink-500'
};

const paleRegex = /\b(?:dark:)?bg-(emerald|green|rose|red|sky|blue|indigo|purple|amber|yellow|teal|cyan|fuchsia|pink)-(?:50|100|900|950)(?:\/[0-9]+)?\b/;

let totalReplaced = 0;

walk('src', (file) => {
  if (!file.endsWith('.jsx')) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  let newContent = content.replace(/className=(?:\{`|["'])(.*?)(?:`\}|["'])/g, (match, classStr) => {
    // Check if this class string contains a pale background
    const matchPale = classStr.match(paleRegex);
    if (!matchPale) return match;

    const colorFamily = matchPale[1];
    const solidBgClass = colorMap[colorFamily];

    // We don't want to mess up cards/panels that use slate or base colors, only the badges/buttons.
    // We already filter by the colorful ones (emerald, rose, etc.).

    // 1. Remove all background classes for this color family
    let newClassStr = classStr.replace(new RegExp(`\\b(?:dark:|hover:|focus:)?bg-${colorFamily}-(?:50|100|200|800|900|950)(?:\\/[0-9]+)?\\b`, 'g'), '');
    
    // 2. Remove all text classes for this color family (to avoid unreadable text)
    newClassStr = newClassStr.replace(new RegExp(`\\b(?:dark:|hover:|focus:)?text-${colorFamily}-(?:[0-9]{2,3})(?:\\/[0-9]+)?\\b`, 'g'), '');
    // Remove specific hex colors used in the project
    newClassStr = newClassStr.replace(/\b(?:dark:|hover:)?text-\[\#2eb82e\]\b/g, '');
    newClassStr = newClassStr.replace(/\b(?:dark:|hover:)?text-\[\#0284c7\]\b/g, '');

    // 3. Remove border classes for this color family
    newClassStr = newClassStr.replace(new RegExp(`\\b(?:dark:|hover:|focus:)?border-${colorFamily}-(?:[0-9]{2,3})(?:\\/[0-9]+)?\\b`, 'g'), '');

    // Remove any raw 'border' class if we are replacing it, to prevent border artifacts
    newClassStr = newClassStr.replace(/\bborder\b/g, '');

    // 4. Inject the new solid styles
    // Clean up multiple spaces
    newClassStr = newClassStr.replace(/\s+/g, ' ').trim();
    
    // Add the new solid styles
    newClassStr = `${newClassStr} ${solidBgClass} text-white border-transparent shadow-sm`.trim();

    return match.replace(classStr, newClassStr);
  });

  if (newContent !== original) {
    fs.writeFileSync(file, newContent, 'utf8');
    totalReplaced++;
    console.log('Swept pale colors from:', file);
  }
});
console.log('Total files completely stripped of pale elements:', totalReplaced);
