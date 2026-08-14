const fs = require('fs');


function transformClasses(classNameStr, tag) {
  let classes = classNameStr.split(/\s+/).filter(Boolean);
  let newClasses = [];
  
  const isInput = ['input', 'select', 'textarea'].includes(tag);
  const isButton = tag === 'button';
  const isCard = tag === 'div' || tag === 'form' || tag === 'table' || tag === 'section' || tag === 'ul';
  
  let hasPrimary = false;
  let hasDanger = false;
  
  classes.forEach(c => {
    // Remove flat colors and shadows
    if (c.startsWith('bg-white') || c.startsWith('bg-slate-') || c.startsWith('dark:bg-slate-') || 
        c.startsWith('border-slate-') || c.startsWith('dark:border-slate-') ||
        c.startsWith('shadow') || c === 'border' || c.startsWith('bg-[#0f172a]') || c.startsWith('bg-[#1e293b]') ||
        c === 'backdrop-blur-xl' || c === 'backdrop-blur-md') {
      return; // filter out
    }
    
    if (isButton && (c.includes('bg-[#2eb82e]') || c.includes('bg-emerald') || c.includes('from-[#2eb82e]'))) {
      hasPrimary = true;
      return;
    }
    if (isButton && (c.includes('bg-red-') || c.includes('bg-rose-') || c.includes('text-red-'))) {
      // Danger button
      newClasses.push(c); // keep colors for now, just add neo-button later
      return;
    }

    newClasses.push(c);
  });
  
  if (isInput && !newClasses.includes('neo-input')) {
    newClasses.push('neo-input');
  } else if (isButton && !newClasses.includes('neo-button') && !newClasses.includes('neo-button-primary')) {
    if (hasPrimary) {
      newClasses.push('neo-button-primary');
      newClasses = newClasses.filter(c => c !== 'text-slate-700' && c !== 'dark:text-slate-300'); // Clean up old text colors
    } else {
      newClasses.push('neo-button');
    }
  }

  return newClasses.join(' ');
}

const files = ['frontend/src/pages/Ayarlar.jsx', 
    'frontend/src/pages/Dashboard.jsx',
    'frontend/src/pages/Finans.jsx',
    'frontend/src/pages/Kayit.jsx',
    'frontend/src/pages/Kullanicilar.jsx',
    'frontend/src/pages/OnKayit.jsx',
    'frontend/src/pages/Siniflar.jsx',
    'frontend/src/pages/Yoklama.jsx',
    'frontend/src/components/ConfirmModal.jsx',
    'frontend/src/components/CustomDatePicker.jsx',
    'frontend/src/components/HaftalikDersCizelgesi.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Convert Inputs
  content = content.replace(/<(input|select|textarea)([^>]*?)className=(["'])(.*?)\3/g, (match, tag, before, quote, classNames) => {
    return `<${tag}${before}className=${quote}${transformClasses(classNames, tag)}${quote}`;
  });

  // 2. Convert Buttons
  content = content.replace(/<button([^>]*?)className=(["'])(.*?)\2/g, (match, before, quote, classNames) => {
    return `<button${before}className=${quote}${transformClasses(classNames, 'button')}${quote}`;
  });

  // 3. Inject neo-card to specific known wrappers
  // Using string replace for generic rounded cards and containers
  content = content.replace(/className=(["'])([^"']*?rounded-[23]xl[^"']*?)\1/g, (match, quote, classes) => {
      if(!classes.includes('neo-card') && !classes.includes('neo-button') && !classes.includes('neo-input') && !classes.includes('bg-[#2eb82e]')) {
          let c = classes.replace(/bg-white(\/\d+)?/g, '')
                         .replace(/dark:bg-slate-\d+(\/\d+)?/g, '')
                         .replace(/bg-slate-\d+(\/\d+)?/g, '')
                         .replace(/border-slate-\d+(\/\d+)?/g, '')
                         .replace(/dark:border-slate-\d+(\/\d+)?/g, '')
                         .replace(/\bshadow-?[a-z0-9]*\b/g, '')
                         .replace(/\bborder\b/g, '')
                         .replace(/backdrop-blur-[a-z]+/g, '');
          return `className=${quote}neo-card ${c.trim()}${quote}`;
      }
      return match;
  });

  // 4. Modal specific targeting
  content = content.replace(/className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl/g, 'className="neo-card w-full max-w-md');

  // 5. Replace any remaining neo-button duplicates
  content = content.replace(/neo-button neo-button/g, 'neo-button');
  content = content.replace(/neo-card neo-card/g, 'neo-card');
  content = content.replace(/neo-input neo-input/g, 'neo-input');
  
  // Clean double spaces in classNames
  content = content.replace(/className=(["'])(.*?)\1/g, (match, q, c) => `className=${q}${c.replace(/\s+/g, ' ').trim()}${q}`);

  fs.writeFileSync(file, content);
  console.log(`Neomorphized ${file}`);
});
