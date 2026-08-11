import re
content = open('frontend/src/pages/Dashboard.jsx', encoding='utf-8').read()
matches = re.findall(r'className=([\"\'])(.*?)\1', content)
print('Total classNames:', len(matches))
print('Sample classNames:')
for m in matches[:10]:
    print(m[1])
