with open('old_dashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = "{/* ================= MODAL: Sınıf Öğrencileri Detay Listesi ================= */}"
end_marker = "{/* Toast Notification */}"

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    modal_code = text[start_idx:end_idx]
    
    # Change max-w-2xl to max-w-5xl for wider width
    modal_code = modal_code.replace("max-w-2xl", "max-w-5xl")
    
    with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
        siniflar_code = f.read()
    
    # Insert it before {/* Toast Notification */}
    siniflar_code = siniflar_code.replace("{/* Toast Notification */}", modal_code + "\n      {/* Toast Notification */}")
    
    with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
        f.write(siniflar_code)
    print("Modal successfully injected and widened.")
else:
    print("Could not find markers.", start_idx, end_idx)
