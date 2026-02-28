
<template>
  <section class="job-board">
    <h1>Job Opportunities</h1>

    <!-- Filters -->
    <div class="filters">
      <div class="filter">
        <label>
          <input type="checkbox" v-model="filters.city.enabled" />
          City
        </label>
        <select v-model="filters.city.value" :disabled="!filters.city.enabled">
          <option v-for="city in cities" :key="city" :value="city">
            {{ city }}
          </option>
        </select>
      </div>

      <div class="filter">
        <label>
          <input type="checkbox" v-model="filters.role.enabled" />
          Job Role
        </label>
        <select v-model="filters.role.value" :disabled="!filters.role.enabled">
          <option v-for="role in roles" :key="role" :value="role">
            {{ role }}
          </option>
        </select>
      </div>

      <div class="filter">
        <label>
          <input type="checkbox" v-model="filters.company.enabled" />
          Company
        </label>
        <select v-model="filters.company.value" :disabled="!filters.company.enabled">
          <option v-for="company in companies" :key="company" :value="company">
            {{ company }}
          </option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <table>
      <thead>
        <tr>
          <th @click="toggleSort('title')">
            Title
            <span class="sort-indicator">{{ sortIcon('title') }}</span>
          </th>
          <th @click="toggleSort('company')">
            Company
            <span class="sort-indicator">{{ sortIcon('company') }}</span>
          </th>
          <th @click="toggleSort('city')">
            City
            <span class="sort-indicator">{{ sortIcon('city') }}</span>
          </th>
          <th @click="toggleSort('role')">
            Role
            <span class="sort-indicator">{{ sortIcon('role') }}</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="job in processedJobs" :key="job.id">
          <td>{{ job.title }}</td>
          <td>{{ job.company }}</td>
          <td>{{ job.city }}</td>
          <td>{{ job.role }}</td>
        </tr>

        <tr v-if="processedJobs.length === 0">
          <td colspan="4" class="empty">
            No jobs match the selected filters
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

/* ------------------ Data ------------------ */

const jobs = ref([
  {
    id: 1,
    title: 'Frontend Engineer',
    company: 'Acme Corp',
    city: 'Berlin',
    role: 'Frontend',
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'Globex',
    city: 'Paris',
    role: 'Backend',
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    company: 'Acme Corp',
    city: 'Berlin',
    role: 'DevOps',
  },
  {
    id: 4,
    title: 'Fullstack Developer',
    company: 'Initech',
    city: 'London',
    role: 'Fullstack',
  },
  {
    id: 5,
    title: 'Platform Engineer',
    company: 'Globex',
    city: 'London',
    role: 'Backend',
  },
]);

/* ------------------ Filters ------------------ */

const filters = ref({
  city: { enabled: false, value: 'Berlin' },
  role: { enabled: false, value: 'Frontend' },
  company: { enabled: false, value: 'Acme Corp' },
});

const cities = computed(() => [...new Set(jobs.value.map((j) => j.city))]);
const roles = computed(() => [...new Set(jobs.value.map((j) => j.role))]);
const companies = computed(() => [
  ...new Set(jobs.value.map((j) => j.company)),
]);

/* ------------------ Sorting ------------------ */

const sortState = ref({
  key: null, // column name
  direction: null, // 'asc' | 'desc'
});

function toggleSort(key) {
  if (sortState.value.key !== key) {
    sortState.value = { key, direction: 'asc' };
    return;
  }

  if (sortState.value.direction === 'asc') {
    sortState.value.direction = 'desc';
    return;
  }

  sortState.value = { key: null, direction: null };
}

function sortIcon(key) {
  if (sortState.value.key !== key) return '⇅';
  return sortState.value.direction === 'asc' ? '↑' : '↓';
}

/* ------------------ Processing Pipeline ------------------ */

const filteredJobs = computed(() => {
  return jobs.value.filter((job) => {
    if (filters.value.city.enabled && job.city !== filters.value.city.value)
      return false;
    if (filters.value.role.enabled && job.role !== filters.value.role.value)
      return false;
    if (
      filters.value.company.enabled &&
      job.company !== filters.value.company.value
    )
      return false;
    return true;
  });
});

const processedJobs = computed(() => {
  const result = [...filteredJobs.value];

  if (!sortState.value.key) return result;

  const { key, direction } = sortState.value;

  return result.sort((a, b) => {
    const cmp = String(a[key]).localeCompare(String(b[key]));
    return direction === 'asc' ? cmp : -cmp;
  });
});
</script>

<style scoped>
.job-board {
  background-color: #0f172a;
  color: #e5e7eb;
  padding: 1.5rem;
  font-family: system-ui, sans-serif;
  max-width: 1000px;
}

h1 {
  margin-bottom: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  font-size: 0.85rem;
  opacity: 0.85;
}

select {
  background-color: #020617;
  color: #e5e7eb;
  border: 1px solid #334155;
  padding: 0.35rem;
}

select:disabled {
  opacity: 0.4;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #020617;
  padding: 0.6rem;
  text-align: left;
  border-bottom: 1px solid #334155;
  cursor: pointer;
  user-select: none;
}

th:hover {
  background-color: #020617cc;
}

.sort-indicator {
  margin-left: 0.4rem;
  opacity: 0.6;
  font-size: 0.8rem;
}

td {
  padding: 0.6rem;
  border-bottom: 1px solid #1e293b;
}

tbody tr:hover {
  background-color: #020617;
}

.empty {
  text-align: center;
  opacity: 0.6;
}
</style>
