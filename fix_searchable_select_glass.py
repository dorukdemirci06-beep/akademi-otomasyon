import re

with open('frontend/src/components/SearchableSelect.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the opaque container background with a premium glassmorphic background
text = text.replace(
    'bg-white dark:bg-[#1e293b] shadow-lg shadow-slate-200/50 dark:shadow-none backdrop-blur-md border border-slate-200 dark:border-slate-700',
    'bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]'
)

# Replace the option hover backgrounds to be semi-transparent in light mode too
text = text.replace(
    'hover:bg-slate-100 dark:hover:bg-slate-800/50',
    'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
)

# And if there's any stray bg-[#1e293b] it was already replaced.

with open('frontend/src/components/SearchableSelect.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated SearchableSelect.jsx to use proper glassmorphism.")
