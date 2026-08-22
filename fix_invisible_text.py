import os
import re

def fix_matching_text_and_bg(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Find all className="..."
    def replacer(match):
        class_str = match.group(1)
        
        # Find all bg-[...] colors
        bgs = re.findall(r'bg-\[#([0-9a-fA-F]+)\]', class_str)
        for bg in bgs:
            # Remove any text-[#...] or dark:text-[#...] that matches the bg color
            class_str = re.sub(rf'\bdark:text-\[#{bg}\]\b', '', class_str)
            class_str = re.sub(rf'\btext-\[#{bg}\]\b', '', class_str)
            
            # Also if there's text-emerald-600 and bg-emerald-600, etc.
            # But we mainly care about the hex colors we injected recently.

        # Clean up double spaces
        class_str = re.sub(r'\s+', ' ', class_str).strip()
        
        return f'className="{class_str}"'

    content = re.sub(r'className="(.*?)"', replacer, content)

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed matching text/bg colors in: {file_path}")

def main():
    src_dir = os.path.join('frontend', 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.tsx', '.ts')):
                fix_matching_text_and_bg(os.path.join(root, file))

if __name__ == '__main__':
    main()
