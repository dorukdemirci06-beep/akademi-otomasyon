const fs = require('fs');

let file = 'src/pages/Yoklama.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update Telafi Dersi button
content = content.replace(
  /buttonClassName="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700\/90 hover:bg-rose-200 dark:hover:bg-rose-900\/90([^"]*)"/g,
  'buttonClassName="bg-rose-600 hover:bg-rose-700 text-white border-none shadow-md$1"'
);

// Update History Table Geldi button (Selected state)
content = content.replace(
  /'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-\[#2eb82e\] border-emerald-300 dark:border-emerald-700 '/g,
  "'bg-[#2eb82e] text-white border-transparent shadow-sm '"
);

// Update History Table Gelmedi button (Selected state)
content = content.replace(
  /'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-700 '/g,
  "'bg-rose-600 text-white border-transparent shadow-sm '"
);

// Update History Table Mazeretli button (Selected state)
content = content.replace(
  /'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-700 '/g,
  "'bg-[#0284c7] text-white border-transparent shadow-sm '"
);

// Let's also check if there are other pale backgrounds we should update.
// Like the main Telafi Dersi Oluştur button at the top:
// "bg-rose-600 hover:bg-rose-700 text-white..." it's already solid.

fs.writeFileSync(file, content, 'utf8');
console.log('Updated Yoklama.jsx solid buttons');
