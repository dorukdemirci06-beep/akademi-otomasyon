import re
with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Only replace specific classes, do NOT touch newlines
content = re.sub(r'\bdark:bg-slate-\d+(?:/\d+)?\b', '', content)
content = re.sub(r'\bbg-slate-\d+(?:/\d+)?\b', '', content)
content = re.sub(r'\bdark:border-slate-\d+(?:/\d+)?\b', '', content)
content = re.sub(r'\bborder-slate-\d+(?:/\d+)?\b', '', content)
content = re.sub(r'\bshadow-(?:md|lg|xl|sm|2xl|xs)\b', '', content)
content = re.sub(r'\bbg-white\b', '', content)

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Safely stripped Siniflar.jsx")
