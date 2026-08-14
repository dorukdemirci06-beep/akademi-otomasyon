const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Use [\s\S]*? but ensure it doesn't cross another < tag
    // to prevent crossing elements
    const regex = /<(select|input|textarea)([^<]*?)className=(["'])(.*?)\3/gs;
    
    content = content.replace(regex, (match, tag, before, quote, classNames) => {
        let classes = classNames.split(/\s+/).filter(Boolean);
        let newClasses = [];
        
        let needsNeoInput = true;
        if (classes.includes('neo-input')) {
            needsNeoInput = false;
        }

        classes.forEach(c => {
            if (c.startsWith('bg-white') || c.startsWith('bg-slate-') || c.startsWith('dark:bg-slate-') || 
                c.startsWith('border-slate-') || c.startsWith('dark:border-slate-') ||
                c.startsWith('text-slate-700') || c.startsWith('dark:text-slate-200') || c.startsWith('dark:text-slate-300') ||
                c.startsWith('shadow') || c === 'border' || c === 'border-2' || c.startsWith('bg-[#0f172a]') || c.startsWith('bg-[#1e293b]')) {
                return; // filter out
            }
            newClasses.push(c);
        });

        if (needsNeoInput) {
            newClasses.push('neo-input');
        }

        const newClassString = newClasses.join(' ');
        if (newClassString !== classNames) {
            changed = true;
        }
        
        return `<${tag}${before}className=${quote}${newClassString}${quote}`;
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

const files = [
    'frontend/src/pages/Dashboard.jsx',
    'frontend/src/pages/Finans.jsx',
    'frontend/src/pages/Kayit.jsx',
    'frontend/src/pages/Kullanicilar.jsx',
    'frontend/src/pages/OnKayit.jsx',
    'frontend/src/pages/Siniflar.jsx',
    'frontend/src/pages/Yoklama.jsx',
    'frontend/src/components/ConfirmModal.jsx',
    'frontend/src/components/CustomDatePicker.jsx',
    'frontend/src/components/HaftalikDersCizelgesi.jsx',
    'frontend/src/components/Navbar.jsx'
];

files.forEach(processFile);
