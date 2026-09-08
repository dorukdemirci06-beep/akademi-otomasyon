import os

file_path = "frontend/src/pages/GecmisSezonlar.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { getGecmisSezonlar, getSezonDetay, arsivleSezonSonu } from '../services/api';",
    "import { getGecmisSezonlar, getSezonDetay, arsivleSezonSonu, geriAlSezon } from '../services/api';"
)

# 2. Add restoring state and handleRestore function
restore_logic = """
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async (id) => {
    const confirmMsg = "DİKKAT: Bu işlem şu anki AKTİF sezon verilerinizi (Sınıflar, Ödemeler, Yoklamalar vb.) TAMAMEN SİLECEK ve yerlerine bu arşivdeki verileri geri yükleyecektir. İşlemden sonra bu arşiv kaydı da silinecektir. Emin misiniz?";
    if (!window.confirm(confirmMsg)) return;

    setRestoring(true);
    try {
      const res = await geriAlSezon(id);
      showToast(res.data.message);
      setSelectedSezonId(null);
      setTimeout(() => { window.location.reload(); }, 2000);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Geri yükleme sırasında hata oluştu', 'error');
    } finally {
      setRestoring(false);
    }
  };
"""
content = content.replace("  const [detayLoading, setDetayLoading] = useState(false);", "  const [detayLoading, setDetayLoading] = useState(false);\n" + restore_logic)

# 3. Add restore button to detail view header
restore_btn = """          <div className="flex gap-2">
            <button
              onClick={() => handleRestore(sezonDetay.id)}
              disabled={restoring}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:opacity-50"
            >
              {restoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {restoring ? 'Geri Yükleniyor...' : 'Bu Arşivi Geri Yükle'}
            </button>
            <button
              onClick={() => setSelectedSezonId(null)}
              className="neo-button px-4 py-2 rounded-xl text-sm font-bold text-slate-600"
            >
              Sezon Listesine Dön
            </button>
          </div>"""
content = content.replace(
    """          <button
            onClick={() => setSelectedSezonId(null)}
            className="neo-button px-4 py-2 rounded-xl text-sm font-bold text-slate-600"
          >
            Sezon Listesine Dön
          </button>""", restore_btn
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("GecmisSezonlar.jsx updated with restore functionality.")
