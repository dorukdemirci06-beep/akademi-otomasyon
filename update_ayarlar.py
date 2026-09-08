import re

file_path = "frontend/src/pages/Ayarlar.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update lucide-react imports
content = content.replace(
    "from 'lucide-react';",
    ", Archive, Database, AlertTriangle } from 'lucide-react';"
)
content = content.replace(
    "import { Save, Smartphone, Key, MessageCircle, AlertCircle, Type, Send, Users, BookOpen, UserCheck, RefreshCw ",
    "import { Save, Smartphone, Key, MessageCircle, AlertCircle, Type, Send, Users, BookOpen, UserCheck, RefreshCw"
)

# 2. Update api imports
content = content.replace(
    "from '../services/api';",
    ", arsivleSezonSonu } from '../services/api';"
)

# 3. Add state variables for archive
state_inject = """  // Arşiv State
  const [archiveSeasonName, setArchiveSeasonName] = useState('');
  const [archiving, setArchiving] = useState(false);
  
  const handleArchive = async (e) => {
    e.preventDefault();
    if (!archiveSeasonName.trim()) {
      showToast('Lütfen sezon adını girin.', 'error');
      return;
    }
    const confirmMsg = "DİKKAT: Bu işlem mevcut sınıfları, yoklamaları, ders programlarını ve ödemeleri silecek ve yeni sezona sıfırdan başlanacaktır. Tüm mevcut veriler geçmiş sezonlar arşivi olarak dondurulacaktır. Emin misiniz?";
    if (!window.confirm(confirmMsg)) return;
    
    setArchiving(true);
    try {
      const res = await arsivleSezonSonu({ sezon_adi: archiveSeasonName });
      showToast(res.data.message);
      setArchiveSeasonName('');
      setTimeout(() => { window.location.reload(); }, 2000);
    } catch (err) {
      showToast('Arşivleme sırasında hata oluştu.', 'error');
    } finally {
      setArchiving(false);
    }
  };

"""
content = content.replace("  // Veriler", state_inject + "  // Veriler")

# 4. Add Tab Button
tab_button = """        <button
          onClick={() => setActiveTab('toplu')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === 'toplu'
              ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm scale-100'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Toplu Mesaj Gönder</span>
        </button>
        <button
          onClick={() => setActiveTab('arsiv')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === 'arsiv'
              ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm scale-100'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Sene Sonu Devri</span>
        </button>"""
content = content.replace(
    """        <button
          onClick={() => setActiveTab('toplu')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
            activeTab === 'toplu'
              ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm scale-100'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 scale-95'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Toplu Mesaj Gönder</span>
        </button>""", tab_button
)

# 5. Add Archive Section Render
archive_section = """
      ) : activeTab === 'arsiv' ? (
        <div className="flex flex-col gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto">
          <div className="neo-card rounded-3xl p-6 sm:p-8 flex flex-col h-fit relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 dark:border-white/5 relative z-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Sene Sonu Devri (Sezon Arşivi)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mevcut verileri dondurur ve sistemi yeni sezona hazırlar.</p>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900 p-5 rounded-2xl flex gap-4 mb-6 relative z-10">
              <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0" />
              <div>
                <h3 className="font-bold text-rose-700 dark:text-rose-400 text-sm mb-1">DİKKAT EDİLMESİ GEREKENLER</h3>
                <ul className="text-xs text-rose-600 dark:text-rose-300 space-y-1 list-disc pl-4">
                  <li>Bu işlem aktif <strong>sınıfları, ders programlarını, yoklamaları ve ödemeleri tamamen siler.</strong></li>
                  <li>Öğrenci bakiyeleri sıfırlanır.</li>
                  <li>Öğrenciler sistemde kalmaya devam eder ancak hiçbir sınıfa kayıtlı olmazlar.</li>
                  <li>Silinen veriler belirteceğiniz sezon adıyla salt okunur bir arşive taşınır.</li>
                  <li><strong>Bu işlem geri alınamaz!</strong></li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleArchive} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Arşivlenecek Sezon Adı</label>
                <input
                  type="text"
                  value={archiveSeasonName}
                  onChange={(e) => setArchiveSeasonName(e.target.value)}
                  placeholder="Örn: 2023-2024 Eğitim Dönemi"
                  className="w-full rounded-2xl px-5 py-3 text-sm bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 focus:border-rose-500 dark:focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition shadow-inner"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={archiving || !archiveSeasonName.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-sm rounded-full transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed neo-button shadow-lg shadow-rose-500/20"
                >
                  {archiving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Arşivleniyor...
                    </>
                  ) : (
                    <>
                      <Archive className="w-5 h-5" />
                      Sezonu Arşivle ve Sıfırla
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : ("""

content = content.replace(
    """      ) : (""", archive_section
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Ayarlar.jsx updated successfully")
