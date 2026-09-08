import os

file_path = "frontend/src/pages/GecmisSezonlar.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { getGecmisSezonlar, getSezonDetay } from '../services/api';",
    "import { getGecmisSezonlar, getSezonDetay, arsivleSezonSonu } from '../services/api';"
)
content = content.replace(
    "import { Archive, Calendar, Users, BookOpen, CreditCard, CheckCircle, AlertCircle, RefreshCw, ChevronRight, Eye } from 'lucide-react';",
    "import { Archive, Calendar, Users, BookOpen, CreditCard, CheckCircle, AlertCircle, RefreshCw, ChevronRight, Eye, Plus, Database, AlertTriangle, X } from 'lucide-react';"
)

# 2. Add State for modal
state_code = """
  // Arşiv Oluşturma State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
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
      setIsArchiveModalOpen(false);
      setTimeout(() => { window.location.reload(); }, 2000);
    } catch (err) {
      showToast('Arşivleme sırasında hata oluştu.', 'error');
    } finally {
      setArchiving(false);
    }
  };
"""
content = content.replace("  const [activeTab, setActiveTab] = useState('ogrenciler');", "  const [activeTab, setActiveTab] = useState('ogrenciler');\n" + state_code)

# 3. Add Button to header
header_btn = """        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">Geçmiş Sezonlar Arşivi</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sene sonu devri yapılan geçmiş sezonların salt okunur kayıtları.</p>
          </div>
        </div>
        <button
          onClick={() => setIsArchiveModalOpen(true)}
          className="relative z-10 neo-button-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 bg-rose-500 hover:bg-rose-600 text-white border-transparent"
        >
          <Database className="w-4 h-4" />
          Sene Sonu Devri Yap
        </button>"""
content = content.replace(
    """        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">Geçmiş Sezonlar Arşivi</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sene sonu devri yapılan geçmiş sezonların salt okunur kayıtları.</p>
          </div>
        </div>""", header_btn
)

# 4. Add Modal at the bottom
modal_code = """
      {/* Sene Sonu Devri Modal */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1d24] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-500" />
                Sene Sonu Devri (Sezon Arşivi)
              </h2>
              <button onClick={() => setIsArchiveModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900 p-4 rounded-2xl flex gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-rose-700 dark:text-rose-400 text-sm mb-1">DİKKAT EDİLMESİ GEREKENLER</h3>
                  <ul className="text-xs text-rose-600 dark:text-rose-300 space-y-1 list-disc pl-4">
                    <li>Bu işlem aktif <strong>sınıfları, ders programlarını, yoklamaları ve ödemeleri tamamen siler.</strong></li>
                    <li>Öğrenci bakiyeleri sıfırlanır. Öğrenciler sistemde kalır.</li>
                    <li>Silinen veriler belirteceğiniz sezon adıyla salt okunur bir arşive taşınır.</li>
                    <li><strong>Bu işlem geri alınamaz!</strong></li>
                  </ul>
                </div>
              </div>

              <form onSubmit={handleArchive} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Arşivlenecek Sezon Adı</label>
                  <input
                    type="text"
                    value={archiveSeasonName}
                    onChange={(e) => setArchiveSeasonName(e.target.value)}
                    placeholder="Örn: 2023-2024 Eğitim Dönemi"
                    className="w-full rounded-2xl px-4 py-3 text-sm bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsArchiveModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={archiving || !archiveSeasonName.trim()}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-500/20"
                  >
                    {archiving ? 'Arşivleniyor...' : 'Sezonu Arşivle ve Sıfırla'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
"""

content = content.replace("    </div>\n  );\n}", "    </div>\n" + modal_code + "\n  );\n}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("GecmisSezonlar.jsx updated with modal")
