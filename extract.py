import sys

with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const Dashboard = () => {', 'const Siniflar = () => {')
content = content.replace('export default Dashboard;', 'export default Siniflar;')

# Locate showSiniflarModal
modal_start_idx = content.find('<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex')
if modal_start_idx == -1:
    print('Modal start not found')
    sys.exit(1)

main_return_start = content.find('return (\n    <div className="space-y-6">')

table_start = content.find('{/* Modal Table */}', modal_start_idx)

header_html = """    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-md flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-500" />
            Mevcut Sınıflar & Branşlar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sınıflarınızı, öğretmen atamalarını ve ders programlarını yönetin.
          </p>
        </div>
        <button
          onClick={() => setShowEkleModal(true)}
          className="px-4 py-2 bg-[#2eb82e] hover:bg-[#269926] text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-900/30 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Sınıf Ekle</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
"""

table_content = content[table_start:content.find('</div>', content.find('</table>', table_start)) + 6]
modals_start = content.find('{/* ================= MODAL: Sınıf Ekleme ================= */}')

export_idx = content.rfind('export default Siniflar;')
closing_brace_idx = content.rfind('}', 0, export_idx)

new_return = '''  return (
''' + header_html + table_content + '''
      </div>
''' + content[modals_start:closing_brace_idx]

content = content[:main_return_start] + new_return + '''
}

export default Siniflar;
'''

content = content.replace('loadDashboardData();', 'fetchSiniflarModal();')

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Success')
