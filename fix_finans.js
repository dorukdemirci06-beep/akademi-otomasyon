const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Finans.jsx', 'utf8');

content = content.replace(/className=\`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border/g, 'className=\`neo-card py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5');

content = content.replace(/\? 'bg-emerald-100 dark:bg-emerald-950\/80 border-\\[#2eb82e\\] text-\\[#2eb82e\\] '/g, "? 'neo-input ring-1 ring-[#2eb82e] text-[#2eb82e] '");
content = content.replace(/\? 'bg-\\[#0284c7\\] border-\\[#0284c7\\] text-white '/g, "? 'neo-input ring-1 ring-[#0284c7] text-[#0284c7] '");

content = content.replace(/<div className="lg:col-span-2 rounded-xl border p-6 space-y-4">/g, '<div className="lg:col-span-2 neo-card p-6 space-y-4">');

content = content.replace(/<div className="overflow-x-auto border rounded-xl">/g, '<div className="overflow-x-auto neo-card rounded-2xl">');

content = content.replace(/<div className="text-center py-10 rounded-xl border space-y-2">/g, '<div className="text-center py-10 neo-card space-y-2">');

fs.writeFileSync('frontend/src/pages/Finans.jsx', content);
