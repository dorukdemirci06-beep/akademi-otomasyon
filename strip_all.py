import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Find ALL instances of bg-slate-***, dark:bg-slate-***, border-slate-***, dark:border-slate-***, bg-white, bg-gray-*** 
    # regardless of where they are (even outside of className="")
    
    # We shouldn't remove ALL bg-slate unconditionally, because some might be valid tailwind classes we need, but in Neomorphism we want the neo-bg color everywhere.
    
    # 1. Replace dark:bg-slate-800, dark:bg-slate-900, dark:bg-slate-950, bg-slate-800, bg-slate-900 with empty string
    content = re.sub(r'\bdark:bg-slate-\d+(?:/\d+)?\b', '', content)
    content = re.sub(r'\bbg-slate-\d+(?:/\d+)?\b', '', content)
    content = re.sub(r'\bbg-white\b', '', content)
    content = re.sub(r'\bbg-gray-\d+(?:/\d+)?\b', '', content)
    
    # 2. Replace dark:border-slate-800, etc.
    content = re.sub(r'\bdark:border-slate-\d+(?:/\d+)?\b', '', content)
    content = re.sub(r'\bborder-slate-\d+(?:/\d+)?\b', '', content)

    # 3. Fix missing neo-card in Yoklama and Kayit
    # If there is a flex or grid container that has rounded-2xl or rounded-xl but no neo-card, inject neo-card.
    # Actually, the user's screenshot showed flat accordions. Let's look for "rounded-" and inject neo-card if it's a main container.
    # A safer way is to just let the transparent background take effect, and if they need shadows, they will be flat but the correct color.
    
    # Let's also remove `shadow-md`, `shadow-lg`, `shadow-sm` which create muddy black shadows.
    content = re.sub(r'\bshadow-(?:md|lg|xl|sm|2xl|xs)\b', '', content)

    # Cleanup multiple spaces inside className
    content = re.sub(r'className=(["\'`])\s+', r'className=\1', content)
    content = re.sub(r'\s+([\"\'`])', r'\1', content)
    content = re.sub(r'\s{2,}', ' ', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Stripped:", filepath)

for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
