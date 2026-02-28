<template>
  <div class="container">
    <!-- Search Bar -->
    <input
      v-model="search"
      placeholder="🔍 Search chart types..."
      class="search-input"
    />

    <!-- Chart List -->
    <ul class="chart-list">
      <li v-for="chart in filteredCharts" :key="chart.name" class="chart-item">
        <div class="chart-name">{{ chart.name }}</div>
        <div
          class="chart-status"
          :class="chart.isImplemented ? 'implemented' : 'pending'"
        >
          {{ chart.isImplemented ? '✔ Implemented' : '⏳ Pending' }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const search = ref('');

const chartTypes = ref([
  { name: 'Arc', isImplemented: false },
  { name: 'Area', isImplemented: true },
  { name: 'Bar', isImplemented: true },
  { name: 'Barcode', isImplemented: false },
  { name: 'Beeswarm', isImplemented: false },
  { name: 'Boxplot', isImplemented: true },
  { name: 'Bubble', isImplemented: true },
  { name: 'Bubble map', isImplemented: false },
  { name: 'Bubble timeline', isImplemented: false },
  { name: 'Bullet', isImplemented: false },
  { name: 'Bump', isImplemented: false },
  { name: 'Butterfly', isImplemented: false },
  { name: 'Chord', isImplemented: false },
  { name: 'Choropleth', isImplemented: true },
  { name: 'Column', isImplemented: true },
  { name: 'Column and line', isImplemented: false },
  { name: 'Connected scatter', isImplemented: false },
  { name: 'Correlation matrix', isImplemented: false },
  { name: 'Cumulative curve', isImplemented: false },
  { name: 'Diverging bar', isImplemented: false },
  { name: 'Diverging stacked bar', isImplemented: false },
  { name: 'Donut', isImplemented: true },
  { name: 'Dot map', isImplemented: false },
  { name: 'Dumbbell', isImplemented: false },
  { name: 'Fan', isImplemented: false },
  { name: 'Flow map', isImplemented: false },
  { name: 'Funnel', isImplemented: true },
  { name: 'Gantt', isImplemented: true },
  { name: 'Gridplot', isImplemented: false },
  { name: 'Heatmap', isImplemented: true },
  { name: 'Histogram', isImplemented: true },
  { name: 'Line', isImplemented: true },
  { name: 'Lollipop', isImplemented: false },
  { name: 'Marimekko', isImplemented: false },
  { name: 'Network', isImplemented: false },
  { name: 'Ordered bar', isImplemented: false },
  { name: 'Ordered bubble', isImplemented: false },
  { name: 'Ordered column', isImplemented: false },
  { name: 'Paired bar', isImplemented: false },
  { name: 'Paired column', isImplemented: false },
  { name: 'Parallel coordinates', isImplemented: false },
  { name: 'Pictogram', isImplemented: false },
  { name: 'Pie', isImplemented: true },
  { name: 'Radar', isImplemented: true },
  { name: 'Radial', isImplemented: false },
  { name: 'Sankey', isImplemented: true },
  { name: 'Scatter', isImplemented: true },
  { name: 'Scatter matrix', isImplemented: false },
  { name: 'Slope', isImplemented: false },
  { name: 'Sparkline', isImplemented: false },
  { name: 'Stacked bar', isImplemented: true },
  { name: 'Stacked column', isImplemented: true },
  { name: 'Stepped line', isImplemented: false },
  { name: 'Surplus deficit filled line', isImplemented: false },
  { name: 'Treemap', isImplemented: true },
  { name: 'Venn', isImplemented: false },
  { name: 'Violin', isImplemented: true },
  { name: 'Waterfall', isImplemented: true },
]);

const filteredCharts = computed(() => {
  const term = search.value.toLowerCase();
  return chartTypes.value.filter((chart) =>
    chart.name.toLowerCase().includes(term),
  );
});
</script>

<style scoped>
/* Dark theme base */
.container {
  max-width: 600px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
  background-color: #121212;
  color: #e0e0e0;
  padding: 1.5rem;
  border-radius: 10px;
}

/* Search input */
.search-input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #1e1e1e;
  color: #e0e0e0;
}

.search-input::placeholder {
  color: #888;
}

/* Chart list */
.chart-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #333;
  border-radius: 6px;
  background: #1e1e1e;
  transition: background 0.2s;
}

.chart-item:hover {
  background: #2a2a2a;
}

.chart-name {
  font-weight: 600;
}

/* Status badges */
.chart-status {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.implemented {
  background: #1b5e20;
  color: #a5d6a7;
  border: 1px solid #2e7d32;
}

.pending {
  background: #4e342e;
  color: #ffcc80;
  border: 1px solid #f57c00;
}
</style>
