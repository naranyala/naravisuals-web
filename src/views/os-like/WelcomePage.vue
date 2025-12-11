<script setup>
import { ref } from 'vue'

const accepted = ref(false)
</script>

<template>
  <div class="welcome">
    <div class="card">
      <h1>Welcome to Fedora!</h1>
      <p>This live media can be used to install Fedora or as a temporary system.</p>
      <p>Installation can be started at any time using the install icon in Activities.</p>

      <div class="actions">
        <button class="primary" @click="accepted = true">Install Fedora...</button>
        <button class="secondary" @click="accepted = true">Not Now</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
}

.card {
  background: #111827;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 3rem 3.5rem;
  max-width: 480px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

h1 {
  margin: 0 0 1rem;
  font-size: 2rem;
  letter-spacing: 0.5px;
}

p {
  margin: 0.5rem 0 1.5rem;
  line-height: 1.6;
  color: #cbd5e1;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

button {
  padding: 0.75rem 1.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.primary {
  background: #3b82f6;
  color: #fff;
}

.primary:hover {
  background: #2563eb;
}

.secondary {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #475569;
}

.secondary:hover {
  background: #1e293b;
}
</style>
