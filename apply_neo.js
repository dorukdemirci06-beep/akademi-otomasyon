const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Backgrounds
  code = code.replace(/className=\"min-h-screen bg-slate-100 dark:bg-slate-950/g, 'className=\"min-h-screen');
  code = code.replace(/min-h-screen bg-slate-50 dark:bg-slate-950/g, 'min-h-screen');

  // Cards
  code = code.replace(/bg-white\/90 dark:bg-slate-900\/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xl/g, 'neo-card p-5 sm:p-6');
  code = code.replace(/bg-white dark:bg-slate-900\/90 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800/g, 'neo-card');
  code = code.replace(/bg-white dark:bg-slate-900 rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800/g, 'neo-card max-w-xs w-full p-5');
  code = code.replace(/bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800/g, 'neo-card max-w-4xl w-full p-6');
  code = code.replace(/bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800/g, 'neo-card');
  code = code.replace(/bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl/g, 'neo-card');
  code = code.replace(/bg-white dark:bg-slate-900 shadow-md rounded-2xl border border-slate-200 dark:border-slate-800/g, 'neo-card');

  // Inputs
  code = code.replace(/bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl/g, 'neo-input w-full rounded-xl');
  code = code.replace(/bg-slate-50 dark:bg-slate-950\/60 rounded-2xl border border-slate-200 dark:border-slate-800/g, 'neo-input rounded-2xl');
  code = code.replace(/bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl/g, 'neo-input w-full rounded-xl');
  code = code.replace(/bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl/g, 'neo-input w-full rounded-xl');
  code = code.replace(/bg-slate-50 dark:bg-slate-900\/50 border border-slate-200 dark:border-slate-700 rounded-2xl/g, 'neo-input rounded-2xl');

  // Buttons (Primary)
  code = code.replace(/bg-gradient-to-r from-\[\#2eb82e\] to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500\/20/g, 'neo-button-primary text-xs');
  code = code.replace(/bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md/g, 'neo-button-primary text-xs');
  code = code.replace(/bg-\[\#2eb82e\] hover:bg-emerald-600 text-white/g, 'neo-button-primary');
  code = code.replace(/bg-\[\#2eb82e\] text-white hover:bg-emerald-600/g, 'neo-button-primary');
  
  // Buttons (Normal)
  code = code.replace(/bg-slate-100 hover:bg-slate-200 dark:bg-slate-800\/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300/g, 'neo-button');
  code = code.replace(/bg-sky-50 hover:bg-sky-100 dark:bg-sky-950\/60 dark:hover:bg-sky-900\/80 border border-sky-300 dark:border-sky-700\/80 text-sky-800 dark:text-sky-200/g, 'neo-button');
  code = code.replace(/bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300/g, 'neo-button');
  code = code.replace(/bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/g, 'neo-button');
  code = code.replace(/bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/g, 'neo-button');
  
  // Tables
  code = code.replace(/border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm/g, 'neo-card overflow-hidden');
  code = code.replace(/border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs/g, 'neo-card overflow-hidden');
  code = code.replace(/bg-slate-100\/80 dark:bg-slate-950\/80 border-b border-slate-200 dark:border-slate-800/g, 'border-b border-slate-200/50 dark:border-slate-700/50');
  
  fs.writeFileSync(filePath, code);
  console.log('Updated:', filePath);
}

const directoryPath = 'frontend/src/pages';
const files = fs.readdirSync(directoryPath);

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    processFile(path.join(directoryPath, file));
  }
});

// Also process components
const compPath = 'frontend/src/components';
const comps = fs.readdirSync(compPath);
comps.forEach(file => {
  if (file.endsWith('.jsx') && file !== 'Navbar.jsx') {
    processFile(path.join(compPath, file));
  }
});
