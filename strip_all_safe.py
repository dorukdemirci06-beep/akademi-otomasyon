import os
import glob
import re

directories = [
    'frontend/src/pages',
    'frontend/src/components'
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    # Remove tailwind background and border colors safely
    content = re.sub(r'\bdark:bg-slate-\d+(?:/\d+)?\b', '', content)
    content = re.sub(r'\bbg-slate-\d+(?:/\d+)?\b', '', content)
    content = re.sub(r'\bdark:border-slate-\d+(?:/\d+)?\b', '', content)
    content = re.sub(r'\bborder-slate-\d+(?:/\d+)?\b', '', content)
    
    # Remove hardcoded shadows
    content = re.sub(r'\bshadow-(?:md|lg|xl|sm|2xl|xs|inner|none)\b', '', content)
    content = re.sub(r'\bshadow\b', '', content)
    content = re.sub(r'\bbg-white\b', '', content)

    # Note: we are NOT stripping \s+ (whitespace), so lines and comments remain intact!
    
    # cleanup double spaces safely (only if they aren't part of newlines)
    content = re.sub(r'  +', ' ', content)
    # clean up empty className properties
    content = re.sub(r'className=(["\'`])\s+', r'className=\1', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

modified_count = 0
for directory in directories:
    for filepath in glob.glob(os.path.join(directory, '**', '*.jsx'), recursive=True):
        if process_file(filepath):
            modified_count += 1
            print(f"Modified: {filepath}")

print(f"\nDone. Modified {modified_count} files.")
