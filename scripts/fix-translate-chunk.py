#!/usr/bin/env python3
"""Fix translate-chunk.mjs to preserve canonicalSlug"""
import re

with open('scripts/translate-chunk.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the line that handles locale and add canonicalSlug handling after it
old_code = "    else if (/^locale: /.test(line)) out.push('locale: \"' + target + '\"');"
new_code = """    else if (/^locale: /.test(line)) out.push('locale: \"' + target + '\"');
    else if (/^canonicalSlug: /.test(line)) out.push(line); // Keep canonicalSlug unchanged"""

content = content.replace(old_code, new_code)

with open('scripts/translate-chunk.mjs', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated translate-chunk.mjs to preserve canonicalSlug")