import re

with open('frontend/src/components/SearchableSelect.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make the options text slate-900 in light mode and slate-100 in dark mode
# Old: 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
# New: 'text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800/50'
text = text.replace(
    "'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'",
    "'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'"
)

# Fix empty state text color
text = text.replace(
    'text-slate-500 italic',
    'text-slate-900 dark:text-slate-400 italic'
)

# Ensure the background wrapper is fully solid in light mode, sometimes bg-white/95 + backdrop blur on light background washes out.
text = text.replace(
    'bg-white/95 dark:bg-[#1e293b]/95',
    'bg-white dark:bg-[#1e293b] shadow-lg shadow-slate-200/50 dark:shadow-none'
)

with open('frontend/src/components/SearchableSelect.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated SearchableSelect.jsx colors for light mode readability.")
