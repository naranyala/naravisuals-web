<template>
  <div class="container">
    <h1>Design Patterns</h1>
    
    <div class="section">
      <h2>Creational Patterns</h2>
      <ul>
        <li v-for="item in creationalPatterns" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="section">
      <h2>Structural Patterns</h2>
      <ul>
        <li v-for="item in structuralPatterns" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="section">
      <h2>Behavioral Patterns</h2>
      <ul>
        <li v-for="item in behavioralPatterns" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="section">
      <h2>Concurrency Patterns</h2>
      <ul>
        <li v-for="item in concurrencyPatterns" :key="item">{{ item }}</li>
      </ul>
    </div>

  </div>
</template>

<script setup>
const creationalPatterns = [
  'Singleton',
  'Factory Method',
  'Abstract Factory',
  'Builder',
  'Prototype',
  'Object Pool',
  'Dependency Injection',
  'Lazy Initialization',
  'Multiton'
];

const structuralPatterns = [
  'Adapter',
  'Bridge',
  'Composite',
  'Decorator',
  'Facade',
  'Flyweight',
  'Proxy',
  'Module',
  'Private Class Data',
  'Extension Object'
];

const behavioralPatterns = [
  'Chain of Responsibility',
  'Command',
  'Iterator',
  'Mediator',
  'Memento',
  'Observer',
  'State',
  'Strategy',
  'Template Method',
  'Visitor',
  'Interpreter',
  'Null Object',
  'Specification'
];

const concurrencyPatterns = [
  'Active Object',
  'Balking',
  'Double-Checked Locking',
  'Guarded Suspension',
  'Monitor Object',
  'Reactor',
  'Read-Write Lock',
  'Scheduler',
  'Thread Pool',
  'Thread-Specific Storage',
  'Producer-Consumer',
  'Async/Await'
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
