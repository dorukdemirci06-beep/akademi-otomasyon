import os

file_path = "frontend/src/pages/GecmisSezonlar.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { getGecmisSezonlar, getSezonDetay, arsivleSezonSonu, geriAlSezon } from '../services/api';",
    "import { getGecmisSezonlar, getSezonDetay, arsivleSezonSonu, geriAlSezon } from '../services/api';\nimport { setArchiveData } from '../services/archiveMode';"
)

# 2. Add handleArchiveMode
archive_logic = """
  const handleArchiveMode = async (sezon) => {
    try {
      showToast('Arşiv yükleniyor...');
      const res = await getSezonDetay(sezon.id);
      setArchiveData(sezon.sezon_adi, res.data.parsed_data);
      window.location.href = '/';
    } catch (err) {
      showToast('Arşiv verisi alınamadı.', 'error');
    }
  };
"""
content = content.replace("  const [restoring, setRestoring] = useState(false);", archive_logic + "\n  const [restoring, setRestoring] = useState(false);")

# 3. Update the Card Buttons
old_card_btn = """                  <button
                    onClick={() => {
                      setDetayLoading(true);
                      getSezonDetay(sezon.id).then(res => {
                        setSezonDetay(res.data);
                        setSelectedSezonId(sezon.id);
                        setDetayLoading(false);
                      }).catch(err => {
                        showToast('Detaylar yüklenirken hata', 'error');
                        setDetayLoading(false);
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Detayları Görüntüle
                  </button>"""

new_card_btn = """                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => handleArchiveMode(sezon)}
                      className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> Sistemi Bu Arşiv Modunda İncele
                    </button>
                    <button
                      onClick={() => handleRestore(sezon.id)}
                      disabled={restoring}
                      className="w-full px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {restoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {restoring ? 'Geri Yükleniyor...' : 'Sistemi Bu Arşive Geri Döndür'}
                    </button>
                  </div>"""
content = content.replace(old_card_btn, new_card_btn)

# 4. Remove the detail view logic entirely
# The detail view renders when selectedSezonId is true
# We can just remove it using regex or just leave it unreachable (since setSelectedSezonId is never called now)
# But let's actually remove it to be clean.
import re
# Find the start of the detail view render
# if (selectedSezonId && sezonDetay) { ... }
start_idx = content.find("if (selectedSezonId && sezonDetay) {")
if start_idx != -1:
    end_idx = content.find("  return (", start_idx)
    if end_idx != -1:
        content = content[:start_idx] + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("GecmisSezonlar.jsx updated to use Archive Mode.")
