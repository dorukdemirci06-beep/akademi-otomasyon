with open('whatsapp_main.py', 'r', encoding='utf-16') as f:
    lines = f.readlines()

in_ayarlar = False
out_lines = []
for line in lines:
    if '@app.get("/akademiler/ayarlar"' in line:
        in_ayarlar = True
    
    if in_ayarlar:
        out_lines.append(line)
        if 'return akademi' in line and '@app.put' not in line and len(out_lines) > 20:
            break

with open('extracted_ayarlar.py', 'w', encoding='utf-8') as f:
    f.writelines(out_lines)
