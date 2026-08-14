const fs = require('fs');

const oldDashboard = fs.readFileSync('old_dashboard.jsx', 'utf8');

// Extract the 3 modals
const extractBlock = (startMarker, endMarker) => {
    const startIndex = oldDashboard.indexOf(startMarker);
    if (startIndex === -1) return '';
    const endIndex = oldDashboard.indexOf(endMarker, startIndex);
    if (endIndex === -1) return '';
    return oldDashboard.substring(startIndex, endIndex);
};

const showEkleModal = extractBlock('{/* ================= MODAL: Yeni Sınıf Ekle Sub-Modal', '{/* ================= MODAL: Sınıf Ders Saati Ata & Yönet');
const selectedSinifSchedule = extractBlock('{/* ================= MODAL: Sınıf Ders Saati Ata & Yönet', '{/* ================= MODAL: Sınıf Öğrencileri Detay Listesi');
const selectedSinifDetay = extractBlock('{/* ================= MODAL: Sınıf Öğrencileri Detay Listesi', '{/* Toast Notification');

const modalsText = `
      ${showEkleModal}
      ${selectedSinifSchedule}
      ${selectedSinifDetay}
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={\`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 flex items-center gap-3 text-sm font-semibold animate-scale-in \${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-700/60 shadow-rose-950/40'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60 shadow-emerald-950/40'
          }\`}
        >
          <BookOpen className="w-5 h-5 text-[#2eb82e]" />
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
`;

let siniflarCode = fs.readFileSync('frontend/src/pages/Siniflar.jsx', 'utf8');

siniflarCode = siniflarCode.replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*\);\s*}\s*export default Siniflar;/m,
    `</div>
 </div>
 ${modalsText}
 </div>
 );
}

export default Siniflar;`
);

fs.writeFileSync('frontend/src/pages/Siniflar.jsx', siniflarCode, 'utf8');
console.log("Successfully injected missing modals using regex replacement!");

