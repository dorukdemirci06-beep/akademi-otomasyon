import re
content = open('frontend/src/pages/Yoklama.jsx', encoding='utf-8').read()
for m in re.finditer(r'className=([\"\'\`])(.*?)\1', content):
    cls = m.group(2)
    if 'rounded' in cls and 'neo-card' not in cls and 'neo-input' not in cls and 'neo-button' not in cls:
        print(cls)
