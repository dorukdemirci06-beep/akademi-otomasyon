with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the Ders Saati modal
old_class = 'className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 text-slate-800 dark:text-slate-100"'
new_class = 'className="neo-card max-w-lg w-full p-6 rounded-2xl space-y-5"'
text = text.replace(old_class, new_class)

# Fix any stray old inputs inside it that I might have missed
old_input = 'className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"'
new_input = 'className="neo-input w-full px-3 py-2 rounded-xl text-xs font-bold"'
text = text.replace(old_input, new_input)

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed Ders Saati modal classes.")
