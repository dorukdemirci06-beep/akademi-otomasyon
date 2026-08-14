import re

with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add import
if "import SearchableSelect" not in text:
    text = text.replace("import ConfirmModal from '../components/ConfirmModal';", "import ConfirmModal from '../components/ConfirmModal';\nimport SearchableSelect from '../components/SearchableSelect';")

# Replace first select (scheduleData.ogretmen_adi)
pattern1 = re.compile(r'<select[^>]*value=\{scheduleData\.ogretmen_adi\}[^>]*onChange=\{\(e\) => setScheduleData\(\{ \.\.\.scheduleData, ogretmen_adi: e\.target\.value \}\)\}[^>]*>.*?<\/select>', re.DOTALL)

# The options array needs to be constructed.
# getRegisteredTeachers() returns array of {id, isim, soyisim, vb}
# We pass it as: options={getRegisteredTeachers().map(t => ({ value: `${t.isim} ${t.soyisim}`, label: `${t.isim} ${t.soyisim}` }))}
replacement1 = '''<SearchableSelect
  value={scheduleData.ogretmen_adi}
  onChange={(val) => setScheduleData({ ...scheduleData, ogretmen_adi: val })}
  options={getRegisteredTeachers().map(t => ({ value: `${t.isim} ${t.soyisim}`, label: `${t.isim} ${t.soyisim}` }))}
  placeholder="-- Öğretmen Seçin (Opsiyonel) --"
  searchPlaceholder="Öğretmen ara..."
/>'''
text = pattern1.sub(replacement1, text)


# Replace second select (newScheduleForm.ogretmen_adi)
pattern2 = re.compile(r'<select[^>]*value=\{newScheduleForm\.ogretmen_adi\}[^>]*onChange=\{\(e\) => setNewScheduleForm\(\{ \.\.\.newScheduleForm, ogretmen_adi: e\.target\.value \}\)\}[^>]*>.*?<\/select>', re.DOTALL)
replacement2 = '''<SearchableSelect
  value={newScheduleForm.ogretmen_adi}
  onChange={(val) => setNewScheduleForm({ ...newScheduleForm, ogretmen_adi: val })}
  options={getRegisteredTeachers().map(t => ({ value: `${t.isim} ${t.soyisim}`, label: `${t.isim} ${t.soyisim}` }))}
  placeholder="-- Öğretmen Seçin (Opsiyonel) --"
  searchPlaceholder="Öğretmen ara..."
/>'''
text = pattern2.sub(replacement2, text)

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Injected SearchableSelect into Siniflar.jsx")
