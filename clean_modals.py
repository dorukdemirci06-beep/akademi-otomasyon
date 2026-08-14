with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

marker = "{/* ================= MODAL: Sınıf Öğrencileri Detay Listesi ================= */}"
parts = text.split(marker)

# parts[0] is everything before the first modal
# parts[1] is the first modal code
# parts[2] is the second modal code

if len(parts) >= 3:
    # Let's rebuild the file without the first occurrence
    # Wait, parts[1] ends with "{/* Toast Notification */}" or something.
    # It's safer to just replace ALL "max-w-2xl" in the modal with "max-w-5xl" 
    # AND remove one of the duplicates.
    pass

import re
# Just replace ALL max-w-2xl with max-w-5xl globally in the file to fix the issue,
# AND let's remove the duplicated modal block.
text = text.replace("max-w-2xl", "max-w-5xl")

# Find where the duplicate starts
first_idx = text.find(marker)
second_idx = text.find(marker, first_idx + 1)

if second_idx != -1:
    # There is a duplicate
    # We want to remove the first one
    # The first one goes from first_idx up to the start of {/* Toast Notification */}
    end_first = text.find("{/* Toast Notification */}", first_idx)
    if end_first != -1 and end_first < second_idx:
        text = text[:first_idx] + text[end_first:]

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Duplicates removed and width set to max-w-5xl")
