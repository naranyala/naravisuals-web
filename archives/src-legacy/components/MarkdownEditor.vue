<template>
  <div class="markdown-container">
    <div class="markdown-header">
      <h2 class="markdown-title">Markdown Editor</h2>
      <p class="markdown-subtitle">Write and preview markdown documents</p>
    </div>
    
    <div class="markdown-toolbar">
      <div class="toolbar-actions">
        <button @click="newDocument" class="toolbar-btn" title="New Document">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          New
        </button>
        <button @click="saveDocument" class="toolbar-btn" title="Save Document">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save
        </button>
        <button @click="loadDocument" class="toolbar-btn" title="Load Document">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Load
        </button>
        <button @click="exportHtml" class="toolbar-btn" title="Export HTML">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Export HTML
        </button>
      </div>
      <div class="view-toggle">
        <button 
          @click="viewMode = 'editor'" 
          :class="['toggle-btn', { active: viewMode === 'editor' }]"
          title="Editor Only"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Editor
        </button>
        <button 
          @click="viewMode = 'preview'" 
          :class="['toggle-btn', { active: viewMode === 'preview' }]"
          title="Preview Only"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Preview
        </button>
      </div>
    </div>

    <div class="markdown-content">
      <div class="editor-panel" v-if="viewMode === 'editor'">
        <div class="panel-header">
          <span>Editor</span>
          <span class="char-count">{{ content.length }} characters</span>
        </div>
        <textarea 
          v-model="content" 
          placeholder="Start writing markdown here...

# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- Bullet point 1
- Bullet point 2

1. Numbered item
2. Numbered item

[Link text](https://example.com)

Code block

> Blockquote

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |"
          class="editor-textarea"
          spellcheck="false"
        ></textarea>
      </div>

      <div class="preview-panel" v-if="viewMode === 'preview'">
        <div class="panel-header">
          <span>Preview</span>
        </div>
        <div class="preview-content" v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const content = ref('# Welcome to Markdown Editor\n\n## Features\n- **Live preview** - See your changes instantly\n- **Export** - Save as HTML or download\n\n## Quick Start\n\nStart typing in the editor to see the preview update!');

const viewMode = ref<'editor' | 'preview'>('editor');

const renderedContent = computed(() => {
  return parseMarkdown(content.value);
});

const parseMarkdown = (text: string): string => {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/gim, '<br>');

  html = html.replace(/<li>(.*?)<\/li>/gim, (match) => {
    return '<ul>' + match + '</ul>';
  });

  const tableRegex = /\|(.+)\|\n\|[-|]+\|\n((?:\|.+\|\n?)+)/g;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').filter(c => c.trim()).map(h => '<th>' + h.trim() + '</th>').join('');
    const rows = bodyRows.split('\n').filter(r => r.trim()).map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => '<td>' + c.trim() + '</td>').join('');
      return '<tr>' + cells + '</tr>';
    }).join('');
    return '<table><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table>';
  });

  return html;
};

const newDocument = () => {
  if (content.value && !confirm('Create new document? Current content will be lost.')) {
    return;
  }
  content.value = '';
  localStorage.removeItem('markdown-content');
};

const saveDocument = () => {
  localStorage.setItem('markdown-content', content.value);
  alert('Document saved to browser storage.');
};

const loadDocument = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.txt,.markdown';
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      content.value = event.target?.result as string;
      localStorage.setItem('markdown-content', content.value);
      alert('Document loaded from: ' + file.name);
    };
    reader.readAsText(file);
  };
  input.click();
};

const exportHtml = () => {
  const fullHtml = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>Markdown Export</title>\n' +
'  <style>\n' +
'    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #e4e6eb; background: #1a1f2e; }\n' +
'    h1, h2, h3 { color: #5865f2; }\n' +
'    code { background: #252c3e; padding: 0.2rem 0.4rem; border-radius: 4px; }\n' +
'    pre { background: #252c3e; padding: 1rem; border-radius: 8px; overflow-x: auto; }\n' +
'    blockquote { border-left: 4px solid #5865f2; margin: 0; padding-left: 1rem; color: #9ca3af; }\n' +
'    table { border-collapse: collapse; width: 100%; }\n' +
'    th, td { border: 1px solid #3a4252; padding: 0.5rem; text-align: left; }\n' +
'    th { background: #252c3e; }\n' +
'    a { color: #5865f2; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
renderedContent.value +
'\n<\/body>\n<\/html>';

  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'markdown-export-' + new Date().toISOString().split('T')[0] + '.html';
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.markdown-container {
  padding: 1rem;
  width: 100%;
  max-width: none;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.markdown-header {
  margin-bottom: 1rem;
  text-align: center;
}

.markdown-title {
  color: #e4e6eb;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.markdown-subtitle {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}

.markdown-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(37, 44, 62, 0.8);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(88, 101, 242, 0.1);
  border: 1px solid rgba(88, 101, 242, 0.3);
  border-radius: 6px;
  color: #e4e6eb;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(88, 101, 242, 0.2);
  border-color: rgba(88, 101, 242, 0.5);
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.toggle-btn {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  color: #e4e6eb;
  background: rgba(88, 101, 242, 0.1);
}

.toggle-btn.active {
  color: #5865f2;
  background: rgba(88, 101, 242, 0.2);
  border-color: rgba(88, 101, 242, 0.3);
}

.markdown-content {
  flex: 1;
  display: flex;
  gap: 1rem;
  min-height: 0;
}

.editor-panel,
.preview-panel {
  background: rgba(37, 44, 62, 0.8);
  border: 1px solid rgba(58, 66, 82, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(42, 51, 72, 0.6);
  border-bottom: 1px solid rgba(58, 66, 82, 0.2);
  font-size: 0.85rem;
  color: #9ca3af;
}

.char-count {
  font-size: 0.75rem;
  opacity: 0.7;
}

.editor-textarea {
  flex: 1;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #e4e6eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.editor-textarea::placeholder {
  color: #6b7280;
}

.preview-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  color: #e4e6eb;
  font-size: 0.95rem;
  line-height: 1.6;
}

.preview-content :deep(h1) { color: #5865f2; font-size: 1.5rem; margin: 0 0 1rem 0; }
.preview-content :deep(h2) { color: #7c3aed; font-size: 1.25rem; margin: 1.5rem 0 0.75rem 0; }
.preview-content :deep(h3) { color: #a78bfa; font-size: 1.1rem; margin: 1rem 0 0.5rem 0; }
.preview-content :deep(strong) { color: #f0abfc; }
.preview-content :deep(em) { color: #c4b5fd; }
.preview-content :deep(code) { background: rgba(88, 101, 242, 0.2); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.85rem; color: #a5b4fc; }
.preview-content :deep(pre) { background: rgba(42, 51, 72, 0.8); padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
.preview-content :deep(pre code) { background: transparent; padding: 0; }
.preview-content :deep(ul) { margin: 0.5rem 0; padding-left: 1.5rem; }
.preview-content :deep(li) { margin: 0.25rem 0; }
.preview-content :deep(blockquote) { border-left: 4px solid #5865f2; margin: 1rem 0; padding-left: 1rem; color: #9ca3af; }
.preview-content :deep(table) { width: 100%; border-collapse: collapse; margin: 1rem 0; }
.preview-content :deep(th), .preview-content :deep(td) { border: 1px solid rgba(58, 66, 82, 0.5); padding: 0.5rem 0.75rem; text-align: left; }
.preview-content :deep(th) { background: rgba(88, 101, 242, 0.2); color: #a5b4fc; }
.preview-content :deep(a) { color: #818cf8; text-decoration: none; }
.preview-content :deep(a:hover) { text-decoration: underline; }

@media (max-width: 768px) {
  .markdown-content {
    flex-direction: column;
  }
  
  .markdown-toolbar {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .toolbar-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
