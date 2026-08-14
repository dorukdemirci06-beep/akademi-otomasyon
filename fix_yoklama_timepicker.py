import re

# 1. Update TimePicker.jsx to remove the dark navy background and match the neo-card theme
with open('frontend/src/components/TimePicker.jsx', 'r', encoding='utf-8') as f:
    tp_text = f.read()

# Change the dropdown container class
old_dropdown_class = "absolute z-[100] left-0 w-64 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl p-4 animate-scale-in"
new_dropdown_class = "neo-card absolute z-[100] left-0 w-64 p-4 animate-scale-in"
tp_text = tp_text.replace(old_dropdown_class, new_dropdown_class)

# The dropUp dynamic class is added later: ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}
# Actually, the string in TimePicker.jsx is:
# className={`absolute z-[100] left-0 w-64 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl p-4 animate-scale-in ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
# Let's replace using regex
tp_text = re.sub(
    r'className=\{\`absolute z-\[100\] left-0 w-64 bg-white/95 dark:bg-\[\#0f172a\]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl p-4 animate-scale-in \$\{dropUp \? \'bottom-full mb-2\' : \'top-full mt-2\'\}\`\}',
    r'className={`neo-card absolute z-[100] left-0 w-64 p-4 animate-scale-in ${dropUp ? "bottom-full mb-2" : "top-full mt-2"}`}',
    tp_text
)

# Also update hover state for the time options
tp_text = tp_text.replace("hover:bg-slate-100 dark:hover:bg-slate-800/50", "hover:bg-sky-50 dark:hover:bg-sky-900/30")

with open('frontend/src/components/TimePicker.jsx', 'w', encoding='utf-8') as f:
    f.write(tp_text)

# 2. Update Yoklama.jsx
with open('frontend/src/pages/Yoklama.jsx', 'r', encoding='utf-8') as f:
    yk_text = f.read()

# Add import
if "import TimePicker" not in yk_text:
    yk_text = yk_text.replace("import ConfirmModal from '../components/ConfirmModal';", "import ConfirmModal from '../components/ConfirmModal';\nimport TimePicker from '../components/TimePicker';")

# Replace inputs
# baslangic_saati
pattern_baslangic = re.compile(r'<input[^>]*type="time"[^>]*value=\{newDersForm\.baslangic_saati\}[^>]*onChange=\{\(e\) => setNewDersForm\(prev => \(\{ \.\.\.prev, baslangic_saati: e\.target\.value \}\)\)\}[^>]*/>', re.DOTALL)
yk_text = pattern_baslangic.sub(r'''<TimePicker 
   value={newDersForm.baslangic_saati}
   onChange={(val) => setNewDersForm(prev => ({ ...prev, baslangic_saati: val }))}
 />''', yk_text)

# bitis_saati
pattern_bitis = re.compile(r'<input[^>]*type="time"[^>]*value=\{newDersForm\.bitis_saati\}[^>]*onChange=\{\(e\) => setNewDersForm\(prev => \(\{ \.\.\.prev, bitis_saati: e\.target\.value \}\)\)\}[^>]*/>', re.DOTALL)
yk_text = pattern_bitis.sub(r'''<TimePicker 
   value={newDersForm.bitis_saati}
   onChange={(val) => setNewDersForm(prev => ({ ...prev, bitis_saati: val }))}
 />''', yk_text)

with open('frontend/src/pages/Yoklama.jsx', 'w', encoding='utf-8') as f:
    f.write(yk_text)

print("TimePicker updated and injected into Yoklama.jsx.")
