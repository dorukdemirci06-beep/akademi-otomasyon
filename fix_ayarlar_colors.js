const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Ayarlar.jsx', 'utf8');

// Strip old navy blue/slate backgrounds and borders from the template wrappers
code = code.replace(/bg-slate-50/g, '');
code = code.replace(/dark:bg-slate-800\/30/g, '');
code = code.replace(/border-slate-100/g, 'border-white/10 dark:border-white/5');
code = code.replace(/dark:border-slate-800\/50/g, '');
code = code.replace(/border-slate-200/g, 'border-white/10 dark:border-white/5');
code = code.replace(/dark:border-slate-800/g, '');
code = code.replace(/dark:border-slate-700/g, '');
code = code.replace(/bg-emerald-50\/50/g, '');
code = code.replace(/dark:bg-emerald-900\/10/g, '');

// The toggle background
code = code.replace(/bg-slate-300 dark:bg-slate-600/g, 'bg-black/10 dark:bg-white/10');

// Apply neo-input or neo-card nicely to these wrappers
code = code.replace(/className=\{`space-y-1\.5 p-4 rounded-2xl border transition-colors (.*?)`\}/g, (m, g1) => {
    return 'className={`neo-card space-y-1.5 p-4 transition-colors ' + g1.trim() + '`}';
});

// Fix radio buttons wrappers
code = code.replace(/className=\{`cursor-pointer border-2 rounded-2xl p-3 transition-all flex items-center gap-3 (.*?)`\}/g, (m, g1) => {
    let clean = g1.replace(/border-emerald-500 bg-emerald-50 dark:bg-emerald-900\/20/g, 'neo-button-primary')
                  .replace(/hover:border-emerald-300/g, 'neo-button')
                  .trim();
    return 'className={`neo-card cursor-pointer p-3 transition-all flex items-center gap-3 ' + clean + '`}';
});

// Clean up weird empty classes
code = code.replace(/dark: flex/g, 'flex');
code = code.replace(/className="neo-card md:w-1\/3 rounded-3xl p-6  flex flex-col overflow-y-auto"/g, 'className="neo-card md:w-1/3 p-6 flex flex-col overflow-y-auto"');
code = code.replace(/className="neo-card md:w-2\/3 rounded-3xl p-6  flex flex-col overflow-hidden"/g, 'className="neo-card md:w-2/3 p-6 flex flex-col overflow-hidden"');

// Fix the active state backgrounds for checkboxes
code = code.replace(/bg-emerald-50/g, '');
code = code.replace(/dark:bg-emerald-900\/20/g, '');

fs.writeFileSync('frontend/src/pages/Ayarlar.jsx', code);
console.log('Fixed Ayarlar.jsx lacivert details.');
