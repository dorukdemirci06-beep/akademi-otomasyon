import re

with open('frontend/src/pages/Siniflar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Revert to neo-card on the modal wrappers
text = text.replace('className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-2xl max-w-md w-full p-6 rounded-2xl space-y-4 relative"', 'className="neo-card max-w-md w-full p-6 rounded-2xl space-y-4"')
text = text.replace('className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-2xl max-w-lg w-full p-6 rounded-2xl space-y-5 relative"', 'className="neo-card max-w-lg w-full p-6 rounded-2xl space-y-5"')
text = text.replace('className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-2xl space-y-4 relative"', 'className="neo-card max-w-5xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-2xl space-y-4 relative"')

# 2. Remove the dark overlay on backdrops (bg-slate-950/85)
# This will make it transparent and just blurred, EXACTLY like Kayit.jsx in the first photo.
text = text.replace('className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[60] flex items-center justify-center p-4"', 'className="fixed inset-0 backdrop-blur-md z-[60] flex items-center justify-center p-4"')
text = text.replace('className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[70] flex items-center justify-center p-4"', 'className="fixed inset-0 backdrop-blur-md z-[70] flex items-center justify-center p-4"')

with open('frontend/src/pages/Siniflar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Theme matched to Kayit.jsx.")
