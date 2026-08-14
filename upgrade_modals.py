import re

with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Clean up duplicate modals
# We have a duplicate of "Sınıf Öğrencileri Detay Listesi".
# Let's just find all occurrences and keep only one.
marker = "{/* ================= MODAL: Sınıf Öğrencileri Detay Listesi ================= */}"
parts = text.split(marker)
if len(parts) >= 3:
    # We have duplicates!
    # The first part is before the modal.
    # The second part is the first modal block.
    # The third part is the second modal block + the rest of the file.
    
    # We will keep parts[0] + marker + parts[-1] 
    # Because parts[1] is the duplicate modal which doesn't have the rest of the file.
    # Actually, parts[1] might just be the modal code. Let's see what it ends with.
    pass

# A safer way to remove duplicate modal:
# We know it starts with marker and ends before another marker or Toast Notification.
def remove_duplicate(content, marker_str):
    idx1 = content.find(marker_str)
    if idx1 == -1: return content
    idx2 = content.find(marker_str, idx1 + 1)
    if idx2 == -1: return content
    
    # Found duplicate!
    # The duplicate block is from idx2 to the end of the modal.
    # We can just remove the first one, from idx1 to idx2.
    return content[:idx1] + content[idx2:]

text = remove_duplicate(text, "{/* ================= MODAL: Sınıf Öğrencileri Detay Listesi ================= */}")

# 2. Upgrade Aesthetics
# Change modal containers:
text = text.replace('className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-slate-800 dark:text-slate-100"', 'className="neo-card max-w-md w-full p-6 rounded-2xl space-y-4"')
text = text.replace('className="bg-white dark:bg-slate-800 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-slate-800 dark:text-slate-100"', 'className="neo-card max-w-5xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-2xl space-y-4 relative"')

# Also update the modal headers
text = text.replace('border-b border-slate-200 dark:border-slate-700 pb-3', 'border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-2')

# Form inputs to neo-input
text = text.replace('className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2eb82e]"', 'className="neo-input w-full px-4 py-2.5 rounded-xl text-sm"')
text = text.replace('className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2eb82e]"', 'className="neo-input w-full px-4 py-2.5 rounded-xl text-sm font-semibold"')

text = text.replace('className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-bold"', 'className="neo-input w-full px-3 py-2 rounded-lg font-bold"')
text = text.replace('className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-bold"', 'className="neo-input w-full px-3 py-1.5 rounded-lg font-bold"')
text = text.replace('className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"', 'className="neo-input w-full px-3 py-1.5 rounded-xl text-xs"')
text = text.replace('className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-bold"', 'className="neo-input w-full px-3 py-1.5 rounded-xl text-xs font-bold"')

# Table backgrounds inside modals
text = text.replace('bg-slate-50 dark:bg-slate-900/50', 'bg-slate-50/50 dark:bg-slate-800/30')
text = text.replace('hover:bg-slate-50 dark:hover:bg-slate-700/40', 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50')

# Table container
text = text.replace('className="overflow-x-auto"', 'className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/50"')

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Aesthetics updated!")
