import re

with open('frontend/src/pages/Yoklama.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the select (newDersForm.ogretmen_adi)
pattern = re.compile(r'<select[^>]*value=\{newDersForm\.ogretmen_adi\}[^>]*onChange=\{\(e\) => setNewDersForm\(prev => \(\{ \.\.\.prev, ogretmen_adi: e\.target\.value \}\)\)\}[^>]*>.*?<\/select>', re.DOTALL)
replacement = '''<SearchableSelect
  value={newDersForm.ogretmen_adi}
  onChange={(val) => setNewDersForm(prev => ({ ...prev, ogretmen_adi: val }))}
  options={getRegisteredTeachers().map(t => ({ value: `${t.isim} ${t.soyisim}`, label: `${t.isim} ${t.soyisim}` }))}
  placeholder="-- Öğretmen Seçin (Opsiyonel) --"
  searchPlaceholder="Öğretmen ara..."
/>'''
text = pattern.sub(replacement, text)

with open('frontend/src/pages/Yoklama.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Injected SearchableSelect into Yoklama.jsx")
