<template>
  <div class="container">
    <h1>Data Structures</h1>
    

    <div class="section">
      <h2>Linear Structures</h2>
      <ul>
        <li v-for="item in linearStructures" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="section">
      <h2>Tree Structures</h2>
      <ul>
        <li v-for="item in treeStructures" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="section">
      <h2>Graph Structures</h2>
      <ul>
        <li v-for="item in graphStructures" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="section">
      <h2>Hash-based Structures</h2>
      <ul>
        <li v-for="item in hashStructures" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="section">
      <h2>Advanced Structures</h2>
      <ul>
        <li v-for="item in advancedStructures" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>

const linearStructures = [
  'Stack',
  'Queue',
  'Deque',
  'Linked List',
  'Doubly Linked List',
  'Circular Linked List'
];

const treeStructures = [
  'Binary Tree',
  'Binary Search Tree',
  'AVL Tree',
  'Red-Black Tree',
  'B-Tree',
  'B+ Tree',
  'Heap',
  'Min Heap',
  'Max Heap',
  'Trie',
  'Suffix Tree',
  'Segment Tree',
  'Fenwick Tree'
];

const graphStructures = [
  'Graph',
  'Directed Graph',
  'Undirected Graph',
  'Weighted Graph',
  'Adjacency Matrix',
  'Adjacency List',
  'Edge List'
];

const hashStructures = [
  'Hash Table',
  'Hash Map',
  'Hash Set',
  'Dictionary'
];

const advancedStructures = [
  'Matrix',
  'Sparse Matrix',
  'Bloom Filter',
  'Skip List',
  'Disjoint Set (Union-Find)',
  'Priority Queue',
  'Circular Buffer',
  'Bitmap',
  'Cache (LRU/LFU)'
];
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #0f172a;
  min-height: 100vh;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #f1f5f9;
}

.section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  color: #cbd5e1;
  margin-bottom: 0.75rem;
  border-bottom: 2px solid #334155;
  padding-bottom: 0.5rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.5rem 1rem;
  background: #1e293b;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  border-left: 3px solid #3b82f6;
  color: #e2e8f0;
}

li:hover {
  background: #334155;
}
</style>
