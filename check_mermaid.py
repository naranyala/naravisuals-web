import os
import re

def check_mermaid_blocks(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all mermaid blocks
    # Matches ```mermaid...```
    blocks = re.findall(r'```mermaid.*?\n([\s\S]*?)\n```', content)
    
    for i, block in enumerate(blocks):
        if '\\n' in block:
            print(f"Found \\n in {file_path} block {i+1}:")
            print(f"Block content snippet: {block[:100]}...")
            print("-" * 20)

docs_dir = './docs'
for root, dirs, files in os.walk(docs_dir):
    for file in files:
        if file.endswith('.md'):
            check_mermaid_blocks(os.path.join(root, file))
