import re

with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# We want to replace the <input ... value={newScheduleForm.ogretmen_adi} ... /> with a <select>
# The pattern will match <input ... value={newScheduleForm.ogretmen_adi} ... />
pattern = re.compile(r'<input[^>]*type="text"[^>]*value=\{newScheduleForm\.ogretmen_adi\}[^>]*onChange=\{\(e\) => setNewScheduleForm\(\{ \.\.\.newScheduleForm, ogretmen_adi: e\.target\.value \}\)\}[^>]*/>', re.DOTALL)

new_select = '''<select
  value={newScheduleForm.ogretmen_adi}
  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, ogretmen_adi: e.target.value })}
  className="neo-input w-full px-3 py-1.5 rounded-xl text-xs"
>
  <option value="">-- Öğretmen Seçin (Opsiyonel) --</option>
  {getRegisteredTeachers().map(t => (
    <option key={t.id} value={`${t.isim} ${t.soyisim}`}>
      {t.isim} {t.soyisim}
    </option>
  ))}
</select>'''

new_text = pattern.sub(new_select, text)

# Also check if the 'getRegisteredTeachers()' is defined or available in the scope of that component.
# Actually, the other select in the file uses getRegisteredTeachers().map(t => ( <option key={t.id} value={t.isim}> ))
# Wait, the other one uses `value={t.isim}`? Let's check how it works.
# If I use value={`${t.isim} ${t.soyisim}`}, it's better for displaying the full name.

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Teacher input replaced with select dropdown.")
