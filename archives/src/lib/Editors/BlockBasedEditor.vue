<script setup>
import { ref } from 'vue';

const blocks = ref([
  { id: '1', type: 'paragraph', content: 'Start typing here...' },
]);

const activeBlock = ref('1');
const showMenu = ref(null);
const menuPosition = ref({ x: 0, y: 0 });

const blockTypes = [
  { type: 'paragraph', label: 'Paragraph', icon: '¶' },
  { type: 'heading1', label: 'Heading 1', icon: 'H1' },
  { type: 'heading2', label: 'Heading 2', icon: 'H2' },
  { type: 'heading3', label: 'Heading 3', icon: 'H3' },
  { type: 'bulletList', label: 'Bullet List', icon: '•' },
  { type: 'numberList', label: 'Number List', icon: '1.' },
  { type: 'quote', label: 'Quote', icon: '"' },
  { type: 'code', label: 'Code', icon: '</>' },
  { type: 'divider', label: 'Divider', icon: '—' },
  { type: 'checkbox', label: 'Checklist', icon: '☑' },
];

const getDefaultContent = (type) => {
  switch (type) {
    case 'heading1':
      return 'Heading 1';
    case 'heading2':
      return 'Heading 2';
    case 'heading3':
      return 'Heading 3';
    case 'bulletList':
    case 'numberList':
    case 'checkbox':
      return [{ text: 'List item', checked: false }];
    case 'quote':
      return 'Quote text';
    case 'code':
      return '// Code here';
    case 'divider':
      return '';
    default:
      return 'New block';
  }
};

const addBlock = (type, afterId) => {
  const newBlock = {
    id: Date.now().toString(),
    type,
    content: getDefaultContent(type),
  };
  const idx = blocks.value.findIndex((b) => b.id === afterId);
  blocks.value.splice(idx + 1, 0, newBlock);
  showMenu.value = null;
  activeBlock.value = newBlock.id;
};

const updateBlock = (id, content) => {
  const block = blocks.value.find((b) => b.id === id);
  if (block) block.content = content;
};

const deleteBlock = (id) => {
  if (blocks.value.length === 1) return;
  blocks.value = blocks.value.filter((b) => b.id !== id);
};

const moveBlock = (id, direction) => {
  const idx = blocks.value.findIndex((b) => b.id === id);
  if (
    (direction === -1 && idx === 0) ||
    (direction === 1 && idx === blocks.value.length - 1)
  )
    return;
  const block = blocks.value.splice(idx, 1)[0];
  blocks.value.splice(idx + direction, 0, block);
};

const openMenu = (blockId, event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  menuPosition.value = { x: rect.left, y: rect.bottom + 4 };
  showMenu.value = blockId;
};

const adjustTextareaHeight = (event) => {
  event.target.style.height = 'auto';
  event.target.style.height = event.target.scrollHeight + 'px';
};

const updateListItem = (blockId, index, value) => {
  const block = blocks.value.find((b) => b.id === blockId);
  if (block && Array.isArray(block.content)) {
    block.content[index].text = value;
  }
};

const toggleCheckbox = (blockId, index) => {
  const block = blocks.value.find((b) => b.id === blockId);
  if (block && Array.isArray(block.content)) {
    block.content[index].checked = !block.content[index].checked;
  }
};

const addListItem = (blockId) => {
  const block = blocks.value.find((b) => b.id === blockId);
  if (block && Array.isArray(block.content)) {
    block.content.push({ text: '', checked: false });
  }
};

const removeListItem = (blockId, index) => {
  const block = blocks.value.find((b) => b.id === blockId);
  if (block && Array.isArray(block.content) && block.content.length > 1) {
    block.content.splice(index, 1);
  }
};
</script>

<template>
  <div class="editor-container">
    <div class="editor-wrapper">
      <div class="blocks-container">
        <div
          v-for="(block, idx) in blocks"
          :key="block.id"
          :class="['block-item', { active: activeBlock === block.id }]"
        >
          <div class="controls-left">
            <button @click="openMenu(block.id, $event)" class="btn-icon" title="Add block">+</button>
            <button @click="moveBlock(block.id, -1)" :disabled="idx === 0" class="btn-icon" title="Move up">↑</button>
            <button @click="moveBlock(block.id, 1)" :disabled="idx === blocks.length - 1" class="btn-icon" title="Move down">↓</button>
          </div>

          <!-- Heading 1 -->
          <input
            v-if="block.type === 'heading1'"
            type="text"
            :value="block.content"
            @input="updateBlock(block.id, $event.target.value)"
            @focus="activeBlock = block.id"
            class="input-h1"
            placeholder="Heading 1"
          />

          <!-- Heading 2 -->
          <input
            v-else-if="block.type === 'heading2'"
            type="text"
            :value="block.content"
            @input="updateBlock(block.id, $event.target.value)"
            @focus="activeBlock = block.id"
            class="input-h2"
            placeholder="Heading 2"
          />

          <!-- Heading 3 -->
          <input
            v-else-if="block.type === 'heading3'"
            type="text"
            :value="block.content"
            @input="updateBlock(block.id, $event.target.value)"
            @focus="activeBlock = block.id"
            class="input-h3"
            placeholder="Heading 3"
          />

          <!-- Bullet List -->
          <div v-else-if="block.type === 'bulletList'" class="list-container">
            <div v-for="(item, i) in block.content" :key="i" class="list-item">
              <span class="bullet">•</span>
              <input
                type="text"
                :value="item.text"
                @input="updateListItem(block.id, i, $event.target.value)"
                @focus="activeBlock = block.id"
                @keydown.enter.prevent="addListItem(block.id)"
                class="input-list"
                placeholder="List item"
              />
              <button v-if="block.content.length > 1" @click="removeListItem(block.id, i)" class="btn-remove">×</button>
            </div>
            <button @click="addListItem(block.id)" class="btn-add-item">+ Add item</button>
          </div>

          <!-- Number List -->
          <div v-else-if="block.type === 'numberList'" class="list-container">
            <div v-for="(item, i) in block.content" :key="i" class="list-item">
              <span class="bullet">{{ i + 1 }}.</span>
              <input
                type="text"
                :value="item.text"
                @input="updateListItem(block.id, i, $event.target.value)"
                @focus="activeBlock = block.id"
                @keydown.enter.prevent="addListItem(block.id)"
                class="input-list"
                placeholder="List item"
              />
              <button v-if="block.content.length > 1" @click="removeListItem(block.id, i)" class="btn-remove">×</button>
            </div>
            <button @click="addListItem(block.id)" class="btn-add-item">+ Add item</button>
          </div>

          <!-- Checklist -->
          <div v-else-if="block.type === 'checkbox'" class="list-container">
            <div v-for="(item, i) in block.content" :key="i" class="list-item">
              <input
                type="checkbox"
                :checked="item.checked"
                @change="toggleCheckbox(block.id, i)"
                class="checkbox"
              />
              <input
                type="text"
                :value="item.text"
                :class="['input-list', { completed: item.checked }]"
                @input="updateListItem(block.id, i, $event.target.value)"
                @focus="activeBlock = block.id"
                @keydown.enter.prevent="addListItem(block.id)"
                placeholder="Todo item"
              />
              <button v-if="block.content.length > 1" @click="removeListItem(block.id, i)" class="btn-remove">×</button>
            </div>
            <button @click="addListItem(block.id)" class="btn-add-item">+ Add item</button>
          </div>

          <!-- Quote -->
          <textarea
            v-else-if="block.type === 'quote'"
            :value="block.content"
            @input="updateBlock(block.id, $event.target.value); adjustTextareaHeight($event)"
            @focus="activeBlock = block.id"
            class="input-quote"
            rows="1"
            placeholder="Quote text..."
          ></textarea>

          <!-- Code -->
          <textarea
            v-else-if="block.type === 'code'"
            :value="block.content"
            @input="updateBlock(block.id, $event.target.value); adjustTextareaHeight($event)"
            @focus="activeBlock = block.id"
            class="input-code"
            rows="3"
            placeholder="// Code here"
          ></textarea>

          <!-- Divider -->
          <div v-else-if="block.type === 'divider'" class="divider"></div>

          <!-- Paragraph -->
          <textarea
            v-else
            :value="block.content"
            @input="updateBlock(block.id, $event.target.value); adjustTextareaHeight($event)"
            @focus="activeBlock = block.id"
            class="input-paragraph"
            rows="1"
            placeholder="Type something..."
          ></textarea>

          <div class="controls-right">
            <button
              @click="deleteBlock(block.id)"
              :disabled="blocks.length === 1"
              class="btn-delete"
              title="Delete block"
            >×</button>
          </div>

          <!-- Block Type Menu -->
          <div
            v-if="showMenu === block.id"
            @mouseleave="showMenu = null"
            :style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }"
            class="block-menu"
          >
            <button
              v-for="blockType in blockTypes"
              :key="blockType.type"
              @click="addBlock(blockType.type, block.id)"
              class="menu-btn"
            >
              <span class="menu-icon">{{ blockType.icon }}</span>
              <span>{{ blockType.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.editor-wrapper {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 2rem;
}

.blocks-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.block-item {
  position: relative;
  padding: 0.5rem 3rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.block-item:hover {
  background: #fafafa;
}

.block-item.active {
  background: #e3f2fd;
}

.controls-left {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.block-item:hover .controls-left {
  opacity: 1;
}

.controls-right {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.block-item:hover .controls-right {
  opacity: 1;
}

.btn-icon {
  width: 24px;
  height: 24px;
  border: none;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #e0e0e0;
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-delete {
  width: 24px;
  height: 24px;
  border: none;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  background: #ffcdd2;
}

.btn-delete:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.input-h1 {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 2.5rem;
  font-weight: bold;
  padding: 0;
  line-height: 1.2;
}

.input-h2 {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 2rem;
  font-weight: bold;
  padding: 0;
  line-height: 1.2;
}

.input-h3 {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0;
  line-height: 1.2;
}

.input-paragraph {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  overflow: hidden;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  padding: 0;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.bullet {
  min-width: 24px;
  font-weight: bold;
  color: #666;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.input-list {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  line-height: 1.5;
}

.input-list.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.btn-remove {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.2s;
}

.list-item:hover .btn-remove {
  opacity: 1;
}

.btn-remove:hover {
  color: #c62828;
}

.btn-add-item {
  align-self: flex-start;
  margin-left: 30px;
  padding: 0.25rem 0.5rem;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-add-item:hover {
  color: #333;
}

.input-quote {
  width: 100%;
  border-left: 4px solid #e0e0e0;
  padding-left: 1rem;
  outline: none;
  background: transparent;
  resize: none;
  overflow: hidden;
  font-family: inherit;
  font-size: 1.1rem;
  font-style: italic;
  line-height: 1.6;
  color: #666;
}

.input-code {
  width: 100%;
  border: none;
  outline: none;
  background: #f5f5f5;
  resize: none;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.75rem;
  border-radius: 4px;
}

.divider {
  width: 100%;
  height: 2px;
  background: #e0e0e0;
  margin: 0.5rem 0;
}

.block-menu {
  position: fixed;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid #e0e0e0;
  padding: 0.5rem;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem;
  max-width: 320px;
}

.menu-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: left;
  white-space: nowrap;
}

.menu-btn:hover {
  background: #f5f5f5;
}

.menu-icon {
  font-weight: bold;
  color: #666;
  min-width: 20px;
}
</style>
