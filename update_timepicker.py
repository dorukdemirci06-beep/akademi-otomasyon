import re

with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update the background of the modals
# Since we might have already updated them or failed, let's just do a robust regex
# Look for <div className="neo-card max-w-md..."
text = re.sub(
    r'className="neo-card max-w-md w-full p-6 rounded-2xl space-y-4"',
    'className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-2xl max-w-md w-full p-6 rounded-2xl space-y-4 relative"',
    text
)
text = re.sub(
    r'className="neo-card max-w-lg w-full p-6 rounded-2xl space-y-5"',
    'className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-2xl max-w-lg w-full p-6 rounded-2xl space-y-5 relative"',
    text
)
text = re.sub(
    r'className="neo-card max-w-5xl w-full max-h-\[85vh\] overflow-y-auto p-6 rounded-2xl space-y-4 relative"',
    'className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-2xl space-y-4 relative"',
    text
)

# 2. Add TimePicker import
if "import TimePicker" not in text:
    text = text.replace("import ConfirmModal from '../components/ConfirmModal';", "import ConfirmModal from '../components/ConfirmModal';\nimport TimePicker from '../components/TimePicker';")

# 3. Replace time inputs using robust regex
# This will find <input ... type="time" ... /> blocks and replace them.
# We need to capture the value and onChange logic.
# Example: value={scheduleData.baslangic_saati} onChange={(e) => setScheduleData({ ...scheduleData, baslangic_saati: e.target.value })}

# Pattern for baslangic_saati (scheduleData)
pattern1 = re.compile(r'<input[^>]*type="time"[^>]*value=\{scheduleData\.baslangic_saati\}[^>]*onChange=\{\(e\) => setScheduleData\(\{ \.\.\.scheduleData, baslangic_saati: e\.target\.value \}\)\}[^>]*/>', re.DOTALL)
text = pattern1.sub(r'''<TimePicker 
                          value={scheduleData.baslangic_saati}
                          onChange={(val) => setScheduleData({ ...scheduleData, baslangic_saati: val })}
                        />''', text)

# Pattern for bitis_saati (scheduleData)
pattern2 = re.compile(r'<input[^>]*type="time"[^>]*value=\{scheduleData\.bitis_saati\}[^>]*onChange=\{\(e\) => setScheduleData\(\{ \.\.\.scheduleData, bitis_saati: e\.target\.value \}\)\}[^>]*/>', re.DOTALL)
text = pattern2.sub(r'''<TimePicker 
                          value={scheduleData.bitis_saati}
                          onChange={(val) => setScheduleData({ ...scheduleData, bitis_saati: val })}
                        />''', text)

# Pattern for baslangic_saati (newScheduleForm)
pattern3 = re.compile(r'<input[^>]*type="time"[^>]*value=\{newScheduleForm\.baslangic_saati\}[^>]*onChange=\{\(e\) => setNewScheduleForm\(\{ \.\.\.newScheduleForm, baslangic_saati: e\.target\.value \}\)\}[^>]*/>', re.DOTALL)
text = pattern3.sub(r'''<TimePicker 
                      value={newScheduleForm.baslangic_saati}
                      onChange={(val) => setNewScheduleForm({ ...newScheduleForm, baslangic_saati: val })}
                    />''', text)

# Pattern for bitis_saati (newScheduleForm)
pattern4 = re.compile(r'<input[^>]*type="time"[^>]*value=\{newScheduleForm\.bitis_saati\}[^>]*onChange=\{\(e\) => setNewScheduleForm\(\{ \.\.\.newScheduleForm, bitis_saati: e\.target\.value \}\)\}[^>]*/>', re.DOTALL)
text = pattern4.sub(r'''<TimePicker 
                      value={newScheduleForm.bitis_saati}
                      onChange={(val) => setNewScheduleForm({ ...newScheduleForm, bitis_saati: val })}
                    />''', text)

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Robust regex applied.")
