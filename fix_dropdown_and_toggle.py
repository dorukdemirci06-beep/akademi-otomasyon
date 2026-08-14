import re

with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix undefined in SearchableSelect options
# We injected `${t.isim} ${t.soyisim}`, which results in "undefined" if soyisim is null.
text = text.replace('`${t.isim} ${t.soyisim}`', '`${t.isim} ${t.soyisim || ""}`.trim()')

# 2. Upgrade the addSchedule checkbox to a beautiful toggle switch
old_checkbox = '''<label className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addSchedule}
                      onChange={(e) => setAddSchedule(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <span>Ders Programına Gün & Saat Atansın mı?</span>
                  </label>'''

# Using regex to find the checkbox because of character encoding differences (e.g., GǬn)
pattern_checkbox = re.compile(r'<label className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-300 cursor-pointer">.*?<input[^>]*checked=\{addSchedule\}[^>]*>.*?<span>.*?<\/span>.*?<\/label>', re.DOTALL)

new_toggle = '''<div 
                    onClick={() => setAddSchedule(!addSchedule)}
                    className="flex items-center justify-between p-3 neo-input rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Ders Programına Gün & Saat Atansın mı?</span>
                    <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${addSchedule ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${addSchedule ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </div>
                  </div>'''

text = pattern_checkbox.sub(new_toggle, text)

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 3. Fix undefined in Yoklama.jsx
with open('frontend/src/pages/Yoklama.jsx', 'r', encoding='utf-8') as f:
    yoklama_text = f.read()

yoklama_text = yoklama_text.replace('`${t.isim} ${t.soyisim}`', '`${t.isim} ${t.soyisim || ""}`.trim()')

with open('frontend/src/pages/Yoklama.jsx', 'w', encoding='utf-8') as f:
    f.write(yoklama_text)

print("Fixed undefined names and upgraded toggle switch!")
