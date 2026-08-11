const fs = require('fs');
const path = require('path');

function stripTailwindClasses(code) {
  // We want to strip `bg-slate-***`, `dark:bg-slate-***`, `border-slate-***`, `dark:border-slate-***`, `bg-white`, `bg-gray-***` globally from all classNames.
  let newCode = code.replace(/className=(["'])(.*?)\1/g, (match, quote, classes) => {
    let clsList = classes.split(/\s+/).filter(Boolean);
    
    // Except if it's already a neo- class, we just make sure there are no conflicting backgrounds
    clsList = clsList.filter(c => {
      if (c.startsWith('bg-slate-') && c !== 'bg-slate-500' && c !== 'bg-slate-400') return false; // Allow some text/icon backgrounds maybe, but generally bad
      if (c.startsWith('dark:bg-slate-')) return false;
      if (c.startsWith('bg-gray-')) return false;
      if (c === 'bg-white') return false;
      if (c.startsWith('border-slate-') && !c.includes('border-slate-500')) return false; // removing soft borders
      if (c.startsWith('dark:border-slate-') && !c.includes('dark:border-slate-500')) return false;
      
      // We also want to remove shadow-md, shadow-lg, shadow-xl if they are alongside neo-card, but my previous script handled neo-card injection.
      // Let's just remove ALL generic shadows unless they are attached to small elements, actually neomorphism uses custom shadows via CSS.
      if (c === 'shadow-md' || c === 'shadow-lg' || c === 'shadow-xl' || c === 'shadow-sm' || c === 'shadow-2xl') return false;
      return true;
    });

    return `className=${quote}${clsList.join(' ')}${quote}`;
  });

  return newCode;
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.jsx')) {
      let code = fs.readFileSync(fullPath, 'utf8');
      let newCode = stripTailwindClasses(code);

      // Special fix for App.jsx
      if (file === 'App.jsx') {
        newCode = newCode.replace(/className="min-h-screen[^"]*"/, 'className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#2eb82e] selection:text-white transition-colors duration-300"');
      }

      // Special fix for Navbar.jsx
      if (file === 'Navbar.jsx') {
        newCode = newCode.replace(/neo-card sticky top-4 z-50 mb-8 mx-4 sm:mx-6 lg:mx-8 !rounded-2xl border-none/g, 'neo-card sticky top-0 z-50 mb-8 !rounded-none !border-x-0 !border-t-0 border-b border-[rgba(255,255,255,0.1)]');
      }

      if (newCode !== code) {
        fs.writeFileSync(fullPath, newCode);
        console.log('Stripped:', fullPath);
      }
    }
  });
}

processDir('frontend/src');
