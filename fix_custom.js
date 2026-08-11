const fs = require('fs');

function replaceFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Inject neo-card into typical card containers (string literals)
  content = content.replace(/className=\"([^\"\}]*?rounded-2xl[^\"\}]*?)\"/g, (match, classes) => {
    if (!classes.includes('neo-card') && !classes.includes('neo-input')) {
      return `className="neo-card ${classes.replace(/border|border-slate-[0-9]+(\/[0-9]*)?|dark:border-slate-[0-9]+(\/[0-9]*)?/g, '')}"`;
    }
    return match;
  });

  // Specifically for Yoklama.jsx accordions
  if (path.includes('Yoklama.jsx')) {
    content = content.replace(/className=\{\`([^}]*?)w-full flex items-center justify-between/g, 'className={`neo-card $1w-full flex items-center justify-between');
    content = content.replace(/className=\{\`([^}]*?)rounded-2xl border p-4/g, 'className={`neo-card $1rounded-2xl p-4');
    content = content.replace(/className=\{\`([^}]*?)px-4 py-3 rounded-xl/g, 'className={`neo-card $1px-4 py-3 rounded-xl');
  }

  // Specifically for Kayit.jsx active rows and components
  if (path.includes('Kayit.jsx')) {
    content = content.replace(/className=\{\`([^}]*?)px-4 py-3 rounded-2xl flex items-center/g, 'className={`neo-card $1px-4 py-3 rounded-2xl flex items-center');
    content = content.replace(/className=\"p-4 md:p-5\"/g, 'className="neo-card p-4 md:p-5"');
    content = content.replace(/className=\{\`([^}]*?)bg-\[\#1e293b\]/g, 'className={`neo-card $1');
    content = content.replace(/className=\{\`([^}]*?)bg-\[\#0f172a\]/g, 'className={`neo-card $1');
  }

  // Finans.jsx inputs and modals
  if (path.includes('Finans.jsx')) {
    content = content.replace(/bg-\[\#1e293b\]/g, 'neo-card');
    content = content.replace(/bg-\[\#0f172a\]/g, 'neo-card');
    // inputs
    content = content.replace(/className=\"w-full px-3.5 py-2.5 rounded-xl bg-slate-900\/50/g, 'className="w-full px-3.5 py-2.5 neo-input rounded-xl bg-transparent');
  }

  // CustomDatePicker
  if (path.includes('CustomDatePicker.jsx')) {
    // Remove the hardcoded hex backgrounds and replace with neo-card
    content = content.replace(/bg-\[\#0f172a\]/g, 'neo-card');
    content = content.replace(/bg-\[\#1e293b\]/g, 'neo-card !border-none !shadow-sm');
    content = content.replace(/className=\"absolute z-50 mt-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl/g, 'className="neo-card absolute z-50 mt-2 p-4 rounded-2xl');
    
    // Day buttons (selected day)
    content = content.replace(/bg-[#2eb82e]/g, 'neo-button-primary');
    content = content.replace(/bg-\[\#2eb82e\]/g, 'neo-button-primary');
  }

  fs.writeFileSync(path, content);
  console.log('Processed', path);
}

replaceFile('frontend/src/pages/Yoklama.jsx');
replaceFile('frontend/src/pages/Kayit.jsx');
replaceFile('frontend/src/pages/Finans.jsx');
replaceFile('frontend/src/components/CustomDatePicker.jsx');
