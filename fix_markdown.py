"""
fix_markdown.py: Scans all .qmd files in the book/ directory and ensures
a blank line precedes every list item (lines starting with 1., 2., *, -).
This is required for proper Pandoc/Quarto Markdown rendering.
"""
import re
import glob

def fix_blank_lines_before_lists(content):
    lines = content.split('\n')
    result = []
    list_pattern = re.compile(r'^\s*(\d+\.\s|\*\s|-\s)')
    
    for i, line in enumerate(lines):
        if list_pattern.match(line):
            # Check if the previous non-empty line exists and is NOT a blank line,
            # a list item, or a heading
            if i > 0:
                prev_line = lines[i - 1]
                if prev_line.strip() != '' and not list_pattern.match(prev_line) and not prev_line.startswith('#'):
                    result.append('')  # Insert blank line
        result.append(line)
    
    return '\n'.join(result)

files = glob.glob('book/*.qmd')
total_fixed = 0

for filepath in sorted(files):
    with open(filepath, 'r') as f:
        original = f.read()
    
    fixed = fix_blank_lines_before_lists(original)
    
    if fixed != original:
        with open(filepath, 'w') as f:
            f.write(fixed)
        print(f"  Fixed: {filepath}")
        total_fixed += 1
    else:
        print(f"  OK:    {filepath}")

print(f"\nDone. Fixed {total_fixed} file(s).")
