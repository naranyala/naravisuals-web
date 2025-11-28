<template>
  <div class="welcome-menu">
    <h1 class="menu-title">Welcome to My App!</h1>

    <div class="card-grid">
      <div 
        v-for="card in cards" 
        :key="card.id" 
        class="card" 
        @click="handleAction(card.action)"
      >
        <div class="card-icon">
          {{ card.icon }}
        </div>
        <h2 class="card-title">{{ card.title }}</h2>
        <p class="card-description">{{ card.description }}</p>
        </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Data and script logic remain the same
const cards = ref([
  // The 'buttonText' property is no longer used but kept for completeness
  { id: 1, title: 'Dashboard', description: 'View an overview of your activity and stats.', icon: '📊', buttonText: 'Go to Dashboard', action: 'dashboard' },
  { id: 2, title: 'Settings', description: 'Configure your preferences and account details.', icon: '⚙️', buttonText: 'Open Settings', action: 'settings' },
  { id: 3, title: 'Documentation', description: 'Access guides and API references for help.', icon: '📚', buttonText: 'Read Docs', action: 'docs' },
  { id: 4, title: 'Support', description: 'Get help from our support team.', icon: '❓', buttonText: 'Contact Support', action: 'support' },
]);

const isDark = ref(true);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
};

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'dark');
});

const handleAction = (action) => {
  // In a real app, this would use Vue Router: router.push(`/${action}`)
  console.log(`Action triggered for: ${action}`);
  alert(`Navigating to ${action}... (Check console for details)`);
};
</script>

<style scoped>
/* --- 1. THEME VARIABLES (Unchanged) --- */
:root,
[data-theme='dark'] {
  --color-background: #1e1e1e;
  --color-card-bg: #2d2d2d;
  --color-text: #f0f0f0;
  --color-text-secondary: #aaaaaa;
  --color-accent: #4a90e2; 
  --color-border: #4f4f4f; 
  --color-button-hover: #3a7acb; /* This variable is now unused */
}

[data-theme='light'] {
  --color-background: #f8f8f8;
  --color-card-bg: #ffffff;
  --color-text: #1e1e1e;
  --color-text-secondary: #555555;
  --color-accent: #1e88e5; 
  --color-border: #d0d0d0; 
  --color-button-hover: #005bb5; /* This variable is now unused */
}

/* --- 2. GLOBAL CONTAINER & TYPOGRAPHY --- */
.welcome-menu {
  padding: 30px 20px; 
  background-color: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
  text-align: center;
}

.menu-title {
  margin-bottom: 40px; 
  font-size: 2.2em;
  color: var(--color-accent);
}

/* --- 3. MOBILE-FRIENDLY, CENTERED CARD GRID LAYOUT --- */
.card-grid {
  display: grid;
  grid-template-columns: 1fr; 
  gap: 15px; 
  max-width: 900px;
  margin: 0 auto; 
  padding: 0 10px;
}

@media (min-width: 600px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 900px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* --- 4. CARD STYLING (Key changes here) --- */
.card {
  background-color: var(--color-card-bg);
  padding: 18px; 
  border-radius: 8px; 
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25); 
  
  /* **NEW:** Makes the entire card clickable */
  cursor: pointer; 
  
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  border-color: var(--color-accent); 
}

.card-icon {
  font-size: 2.5em;
  margin-bottom: 8px;
}

.card-title {
  font-size: 1.3em;
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--color-text);
}

.card-description {
  font-size: 0.95em;
  color: var(--color-text-secondary);
  /* The flex-grow is still useful to give height */
  flex-grow: 1; 
  margin-bottom: 0; /* Removed margin that was spacing the button */
}

/* --- 5. BUTTON STYLING (REMOVED - Not needed anymore) --- */


/* --- 6. THEME TOGGLE BUTTON --- */
.theme-toggle {
  display: block;
  margin: 30px auto 0;
  padding: 10px 20px;
  background-color: transparent;
  color: var(--color-accent);
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s, color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--color-accent);
  color: var(--color-card-bg); 
}
</style>
