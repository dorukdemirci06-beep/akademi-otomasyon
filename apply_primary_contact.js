const fs = require('fs');

// Helper to update lucide-react imports to include MessageCircle
function addMessageCircle(content) {
    if (!content.includes('MessageCircle') && content.includes('lucide-react')) {
        return content.replace(/import\s+\{([^}]+)\}\s+from\s+'lucide-react';/, (match, p1) => {
            return `import { ${p1.trim()}, MessageCircle } from 'lucide-react';`;
        });
    }
    return content;
}

// 1. Update Kayit.jsx
let kayit = fs.readFileSync('frontend/src/pages/Kayit.jsx', 'utf8');
kayit = addMessageCircle(kayit);

// Add birincil_veli to formData
kayit = kayit.replace(
    /sinif_adi: '',\s*bakiye: 0\.0,/g,
    "sinif_adi: '',\n    bakiye: 0.0,\n    birincil_veli: 'Kendisi',"
);

// Add birincil_veli to editModal
kayit = kayit.replace(
    /sinif_adi: ogrenci\.sinif_adi \|\| '',/g,
    "sinif_adi: ogrenci.sinif_adi || '',\n      birincil_veli: ogrenci.birincil_veli || 'Kendisi',"
);

// Add radio buttons in Add Form and Edit Form (we can insert it after baba_meslek block)
const radioGroup = `
      {/* İletişim Kurulacak Kişi / Birincil Veli */}
      <div className="md:col-span-2 mt-4 p-4 neo-card rounded-2xl bg-white/50 dark:bg-slate-800/50">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#2eb82e]" />
          İletişim Kurulacak Kişi (Birincil Veli)
        </h3>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="birincil_veli" value="Kendisi" checked={formData.birincil_veli === 'Kendisi'} onChange={handleInputChange} className="w-4 h-4 text-[#2eb82e] focus:ring-[#2eb82e]" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Öğrencinin Kendisi</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="birincil_veli" value="Anne" checked={formData.birincil_veli === 'Anne'} onChange={handleInputChange} className="w-4 h-4 text-[#2eb82e] focus:ring-[#2eb82e]" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Anne</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="birincil_veli" value="Baba" checked={formData.birincil_veli === 'Baba'} onChange={handleInputChange} className="w-4 h-4 text-[#2eb82e] focus:ring-[#2eb82e]" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Baba</span>
          </label>
        </div>
      </div>
`;
const editRadioGroup = radioGroup.replace(/formData/g, 'editFormData').replace(/handleInputChange/g, 'handleEditInputChange');

kayit = kayit.replace(
    /<\/div>\s*<\/div>\s*\{addLoading/g,
    `${radioGroup}\n    </div>\n  </div>\n  {addLoading`
);
kayit = kayit.replace(
    /<\/div>\s*<\/div>\s*\{editLoading/g,
    `${editRadioGroup}\n    </div>\n  </div>\n  {editLoading`
);

// Update table to show WhatsApp link and primary contact
const newPhoneDisplay = `
{/* Telefon & WhatsApp */}
<td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
  {(() => {
    let phoneToUse = o.telefon;
    let labelToUse = 'Kendisi';
    if (o.birincil_veli === 'Anne' && o.anne_telefon) { phoneToUse = o.anne_telefon; labelToUse = 'Anne'; }
    else if (o.birincil_veli === 'Baba' && o.baba_telefon) { phoneToUse = o.baba_telefon; labelToUse = 'Baba'; }
    else if (o.birincil_veli === 'Kendisi' && !o.telefon && o.anne_telefon) { phoneToUse = o.anne_telefon; labelToUse = 'Anne'; } // Fallback
    
    if (phoneToUse) {
      const cleanPhone = phoneToUse.replace(/\\D/g, '');
      const waNumber = cleanPhone.startsWith('90') ? cleanPhone : (cleanPhone.startsWith('0') ? '9' + cleanPhone : '90' + cleanPhone);
      
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{labelToUse}</span>
            <div className="flex items-center gap-1.5 font-bold">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{phoneToUse}</span>
            </div>
          </div>
          <a href={\`https://wa.me/\${waNumber}\`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg transition-colors cursor-pointer" title="WhatsApp üzerinden mesaj gönder">
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      );
    }
    return <span className="text-slate-400 italic">-</span>;
  })()}
</td>
`;

kayit = kayit.replace(
    /\{\/\* Telefon \*\/\}\s*<td className="py-3\.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">\s*\{o\.telefon \? \([\s\S]*?\) \:\s*\(\s*<span className="text-slate-400 italic">\-<\/span>\s*\)\}\s*<\/td>/,
    newPhoneDisplay
);

// Update Expanded details WhatsApp part if needed (optional, table is the main one).
// Save Kayit.jsx
fs.writeFileSync('frontend/src/pages/Kayit.jsx', kayit);

console.log("Patched Kayit.jsx");

// 2. Update Yoklama.jsx Table
let yoklama = fs.readFileSync('frontend/src/pages/Yoklama.jsx', 'utf8');
yoklama = addMessageCircle(yoklama);

const yoklamaPhoneDisplay = newPhoneDisplay.replace(/\{o\./g, '{ogrenci.').replace(/\bo\./g, 'ogrenci.');

yoklama = yoklama.replace(
    /\{\/\* TELEFON \*\/\}\s*<td className="py-3 px-4 text-xs text-slate-500 font-mono">\s*\{ogrenci\.telefon \? \([\s\S]*?\) \:\s*\(\s*<span className="text-slate-400 italic">\-<\/span>\s*\)\}\s*<\/td>/,
    yoklamaPhoneDisplay.replace('{/* Telefon & WhatsApp */}', '{/* TELEFON */}')
);

fs.writeFileSync('frontend/src/pages/Yoklama.jsx', yoklama);
console.log("Patched Yoklama.jsx");

// 3. Update Finans.jsx Table
let finans = fs.readFileSync('frontend/src/pages/Finans.jsx', 'utf8');
finans = addMessageCircle(finans);

const finansPhoneDisplay = newPhoneDisplay;

finans = finans.replace(
    /\{\/\* -Yrenci Info \*\/\}\s*<td className="py-3 px-4">[\s\S]*?<div className="flex items-center gap-1 mt-0\.5">[\s\S]*?<Phone className="w-3\.5 h-3\.5 text-slate-400" \/>[\s\S]*?<span className="text-xs text-slate-500 font-mono">\{o\.telefon \|\| 'BelirtilmemiY'\}<\/span>[\s\S]*?<\/div>\s*<\/td>/,
    (match) => {
        // Replace the phone part inside the Info td with WhatsApp link
        return match.replace(
            /<div className="flex items-center gap-1 mt-0\.5">[\s\S]*?<Phone className="w-3\.5 h-3\.5 text-slate-400" \/>[\s\S]*?<span className="text-xs text-slate-500 font-mono">\{o\.telefon \|\| 'BelirtilmemiY'\}<\/span>[\s\S]*?<\/div>/,
            `{(() => {
    let phoneToUse = o.telefon;
    let labelToUse = 'Kendi Numarası';
    if (o.birincil_veli === 'Anne' && o.anne_telefon) { phoneToUse = o.anne_telefon; labelToUse = 'Anne'; }
    else if (o.birincil_veli === 'Baba' && o.baba_telefon) { phoneToUse = o.baba_telefon; labelToUse = 'Baba'; }
    
    if (phoneToUse) {
      const cleanPhone = phoneToUse.replace(/\\D/g, '');
      const waNumber = cleanPhone.startsWith('90') ? cleanPhone : (cleanPhone.startsWith('0') ? '9' + cleanPhone : '90' + cleanPhone);
      return (
        <div className="flex items-center gap-1.5 mt-0.5 group">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-mono">{phoneToUse} <span className="text-[9px] text-slate-400 uppercase">({labelToUse})</span></span>
          <a href={\`https://wa.me/\${waNumber}\`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 p-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-md transition-all cursor-pointer" title="WhatsApp Mesajı Gönder">
            <MessageCircle className="w-3 h-3" />
          </a>
        </div>
      );
    }
    return <span className="text-xs text-slate-400 italic mt-0.5 block">Telefon Belirtilmemiş</span>;
  })()}`
        );
    }
);

fs.writeFileSync('frontend/src/pages/Finans.jsx', finans);
console.log("Patched Finans.jsx");
