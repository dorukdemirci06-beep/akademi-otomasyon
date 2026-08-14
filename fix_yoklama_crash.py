import re

with open('frontend/src/pages/Yoklama.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add import for SearchableSelect
if "import SearchableSelect" not in text:
    text = text.replace("import ConfirmModal from '../components/ConfirmModal';", "import ConfirmModal from '../components/ConfirmModal';\nimport SearchableSelect from '../components/SearchableSelect';")

# 2. Add getRegisteredTeachers function inside Yoklama component
# We can just put it right after "const Yoklama = () => {"
if "const getRegisteredTeachers = ()" not in text:
    func = """const getRegisteredTeachers = () => {
    try {
      const saved = localStorage.getItem('system_teachers');
      return saved ? JSON.parse(saved) : [
        { id: 1, isim: 'Ahmet', soyisim: 'Yılmaz', brans: 'Piyano & Solfej' },
        { id: 2, isim: 'Elif', soyisim: 'Kaya', brans: 'Keman & Müzik Teorisi' },
        { id: 3, isim: 'Caner', soyisim: 'Öztürk', brans: 'Dans & Koreografi' }
      ];
    } catch { return []; }
  };
"""
    text = text.replace("const Yoklama = () => {\n", f"const Yoklama = () => {{\n  {func}\n")

with open('frontend/src/pages/Yoklama.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed Yoklama.jsx crash (added SearchableSelect import and getRegisteredTeachers).")
