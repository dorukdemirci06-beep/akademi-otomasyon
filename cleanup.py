import re

with open('frontend/src/pages/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the div with Link for Aktif Sinif card
content = content.replace(
    '<div \n          onClick={openSiniflarModal}',
    '<Link to="/siniflar"'
).replace(
    '<div\n          onClick={openSiniflarModal}',
    '<Link to="/siniflar"'
).replace(
    '          <div className="mt-4 flex items-center text-xs text-sky-500 font-semibold gap-1">\n            <TrendingUp className="w-4 h-4 shrink-0" />\n            <span>Sınıfları Görüntüle & Yönet  </span>\n          </div>\n        </div>',
    '          <div className="mt-4 flex items-center text-xs text-sky-500 font-semibold gap-1">\n            <TrendingUp className="w-4 h-4 shrink-0" />\n            <span>Sınıfları Görüntüle & Yönet  </span>\n          </div>\n        </Link>'
)
# Note: I'll just use a safer regex replacement for the card:
content = re.sub(
    r'<div\s+onClick=\{openSiniflarModal\}([\s\S]*?)</div>\s*</div>',
    r'<Link to="/siniflar"\1</div>\n        </Link>',
    content
)

# Remove modals. They are all consecutive at the end of the file.
modals_start_marker = '{/* ================= MODAL: Mevcut Sınıflar & Kontenjan Yönetimi ================= */}'
# Find the start of the Sınıflar modals
modals_start_idx = content.find(modals_start_marker)

if modals_start_idx != -1:
    # They go all the way to the end of the file, just before the closing </div>
    # Actually, they might be inside the main return. Let's just chop them off and add the closing tags.
    # The return block ends with:
    #     </div>
    #   );
    # };
    export_idx = content.rfind('export default Dashboard;')
    closing_brace_idx = content.rfind('}', 0, export_idx)
    div_idx = content.rfind('</div>', 0, closing_brace_idx)
    
    # Actually, we can just replace everything from modals_start_marker to the last </div> with nothing.
    content = content[:modals_start_idx] + '    </div>\n  );\n};\n\nexport default Dashboard;\n'

with open('frontend/src/pages/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Success')
