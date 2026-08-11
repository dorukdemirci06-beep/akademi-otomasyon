const fs = require('fs');
const path = require('path');

function fixClasses(clsStr) {
  let classes = clsStr.split(/\s+/).filter(Boolean);
  let isCard = false;
  let isInput = false;
  let isPrimaryBtn = false;
  let isNormalBtn = false;

  // Detect card
  // Usually has bg-white, dark:bg-slate-800/900/950, and a border or shadow
  if ((classes.includes('bg-white') || classes.includes('bg-slate-50')) && classes.some(c => c.startsWith('dark:bg-slate-')) && !classes.some(c => c.includes('from-')) && !classes.includes('text-slate-700')) {
    if (classes.some(c => c.startsWith('shadow-')) || classes.some(c => c.startsWith('border'))) {
      isCard = true;
    }
  }

  // Detect input
  // Usually has focus:ring-2 or border-slate-300
  if (classes.some(c => c.startsWith('focus:ring')) || classes.includes('border-slate-300')) {
    isInput = true;
    isCard = false;
  }

  // Detect primary button
  if (classes.some(c => c.includes('#2eb82e')) || classes.includes('bg-emerald-600') || classes.includes('bg-amber-500') || classes.includes('bg-sky-600') || classes.includes('bg-blue-600') || classes.includes('bg-red-600')) {
    if (classes.includes('text-white') || classes.some(c => c.startsWith('shadow-'))) {
      isPrimaryBtn = true;
      isCard = false;
    }
  }

  // Detect normal button
  if ((classes.includes('bg-slate-100') || classes.includes('bg-white')) && classes.some(c => c.startsWith('hover:bg-slate-'))) {
    if (classes.includes('border')) {
      isNormalBtn = true;
      isCard = false;
    }
  }

  let newClasses = [];
  
  if (isCard) {
    newClasses.push('neo-card');
    classes = classes.filter(c => !c.match(/^(bg-white|bg-slate-50|dark:bg-slate-\d+(\/\d+)?|border|border-slate-\d+(\/\d+)?|dark:border-slate-\d+(\/\d+)?|shadow-[a-z]+|backdrop-blur-[a-z]+)$/));
  } else if (isInput) {
    newClasses.push('neo-input');
    classes = classes.filter(c => !c.match(/^(bg-white|bg-slate-50|dark:bg-slate-\d+(\/\d+)?|border|border-slate-\d+(\/\d+)?|dark:border-slate-\d+(\/\d+)?|focus:ring.*|focus:border.*)$/));
  } else if (isPrimaryBtn) {
    newClasses.push('neo-button-primary');
    // If it's another color like sky-600, keep it? 
    // neo-button-primary forces our specific green. Let's just strip standard colors if it's supposed to be our primary button.
    classes = classes.filter(c => !c.match(/^(bg-\[\#2eb82e\]|hover:bg-emerald-\d+|from-\[\#2eb82e\]|to-emerald-\d+|bg-gradient-to-[a-z]+|hover:from-emerald-\d+|hover:to-emerald-\d+|bg-amber-\d+|hover:bg-amber-\d+|bg-sky-\d+|hover:bg-sky-\d+|text-white|shadow-[a-z]+|shadow-emerald-\d+\/\d+|border|border-transparent)$/));
  } else if (isNormalBtn) {
    newClasses.push('neo-button');
    classes = classes.filter(c => !c.match(/^(bg-slate-\d+|hover:bg-slate-\d+|dark:bg-slate-\d+(\/\d+)?|dark:hover:bg-slate-\d+|text-slate-\d+|dark:text-slate-\d+|border|border-slate-\d+|dark:border-slate-\d+|shadow-[a-z]+)$/));
  } else {
    // Just clean up stray generic backgrounds so they don't break the global bg
    classes = classes.map(c => {
      if (c === 'bg-slate-50' || c === 'bg-slate-100' || c === 'dark:bg-slate-950' || c === 'dark:bg-slate-900') {
        return '';
      }
      return c;
    });
  }

  newClasses.push(...classes.filter(Boolean));
  return newClasses.join(' ');
}

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  let newCode = code.replace(/className=(["'])(.*?)\1/g, (match, quote, classes) => {
    return `className=${quote}${fixClasses(classes)}${quote}`;
  });

  newCode = newCode.replace(/className=\{`([^`]+)`\}/g, (match, classes) => {
    let parts = classes.split(/(\$\{[^}]+\})/);
    let fixedParts = parts.map(p => {
      if (p.startsWith('${')) return p;
      return fixClasses(p);
    });
    return `className={\`${fixedParts.join(' ')}\`}`;
  });

  if (newCode !== code) {
    fs.writeFileSync(filePath, newCode);
    console.log('Fixed:', filePath);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

processDir('frontend/src/pages');
processDir('frontend/src/components');
