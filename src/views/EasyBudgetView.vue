<template>
  <div class="budget-root" :class="{ report: mode === 'report' }">
    <header class="topbar">
      <h2>Monthly Budget</h2>
      <button @click="toggleMode">
        {{ mode === 'editor' ? 'View Report' : 'Back to Editor' }}
      </button>
    </header>

    <!-- ====================== EDITOR ====================== -->
    <div v-if="mode === 'editor'" class="editor">

      <!-- Month Start Date -->
      <section class="monthly-input">
        <label>Month Start Date</label>
        <input type="date" v-model="monthStart" />
      </section>

      <!-- Monthly budget -->
      <section class="monthly-input">
        <label>Total Monthly Budget</label>
        <input type="number" v-model.number="monthlyBudget" min="0" />
      </section>

      <!-- Weekly Allocations -->
      <section class="weekly-section">
        <h3>Weekly Allocation</h3>

        <div class="weekly-item" v-for="(w, i) in weeks" :key="i">
          <label>
            Week {{ i + 1 }}
            <small v-if="w.start"> 
              ({{ w.start.toLocaleDateString() }} — {{ w.end.toLocaleDateString() }})
            </small>
          </label>

          <input type="number" v-model.number="w.allocated" min="0" />
        </div>

        <button class="auto-alloc" @click="autoDistribute">
          Auto Distribute Evenly
        </button>
      </section>

      <!-- Transactions -->
      <section class="transactions-section">
        <h3>Weekly Transactions</h3>

        <div class="week-block" v-for="(w, i) in weeks" :key="i">
          <h4>
            Week {{ i + 1 }}
            <small v-if="w.start"> 
              ({{ w.start.toLocaleDateString() }} – {{ w.end.toLocaleDateString() }})
            </small>
          </h4>

          <div class="transaction"
               v-for="(t, ti) in w.transactions"
               :key="ti">
            <input type="text" v-model="t.note" placeholder="Description" />
            <input type="number" v-model.number="t.amount" placeholder="Amount" />
            <button class="remove" @click="removeTransaction(i, ti)">×</button>
          </div>

          <button class="add" @click="addTransaction(i)">Add Transaction</button>
        </div>
      </section>
    </div>

    <!-- ====================== REPORT ====================== -->
    <div v-else class="report-view">

      <h3>Monthly Summary</h3>
      <p class="summary">
        <strong>Total Budget:</strong> {{ monthlyBudget }} <br />
        <strong>Total Spent:</strong> {{ totalSpent }} <br />
        <strong>Remaining:</strong> {{ remainingBudget }}
      </p>

      <div class="report-week" v-for="(w, i) in weeks" :key="i">
        <h4>
          Week {{ i + 1 }}  
          <small v-if="w.start">
            {{ w.start.toLocaleDateString() }} – {{ w.end.toLocaleDateString() }}
          </small>
        </h4>

        <p>Allocated: {{ w.allocated }}</p>
        <p>Spent: {{ weekSpent(i) }}</p>
        <p>Remaining: {{ w.allocated - weekSpent(i) }}</p>

        <ul>
          <li v-for="(t, ti) in w.transactions" :key="ti">
            {{ t.note }} — {{ t.amount }}
          </li>
        </ul>
      </div>

    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'

/* ---------- STATE ---------- */
const mode = ref('editor')               // editor | report
const monthStart = ref("")               // date string
const monthlyBudget = ref(0)

/* Week structure: date range + budget + txs */
const weeks = reactive([
  { allocated: 0, transactions: [], start: null, end: null },
  { allocated: 0, transactions: [], start: null, end: null },
  { allocated: 0, transactions: [], start: null, end: null },
  { allocated: 0, transactions: [], start: null, end: null }
])

/* ---------- MODE SWITCH ---------- */
const toggleMode = () => {
  mode.value = mode.value === 'editor' ? 'report' : 'editor'
}

/* ---------- AUTO WEEK DATE RANGE ---------- */
watch(monthStart, (value) => {
  if (!value) return
  const startDate = new Date(value)

  for (let i = 0; i < 4; i++) {
    const wStart = new Date(startDate)
    wStart.setDate(startDate.getDate() + i * 7)

    const wEnd = new Date(wStart)
    wEnd.setDate(wStart.getDate() + 6)

    weeks[i].start = wStart
    weeks[i].end = wEnd
  }

  clearOldWeeks()
})

/* ---------- AUTO CLEAR OLD WEEKS ---------- */
const clearOldWeeks = () => {
  if (!monthStart.value) return
  const today = new Date()

  weeks.forEach((w) => {
    if (w.end && today > w.end) {
      w.transactions = [] // Clear expired week
    }
  })
}

onMounted(clearOldWeeks)

/* ---------- BUDGET LOGIC ---------- */
const autoDistribute = () => {
  const perWeek = Math.floor(monthlyBudget.value / 4)
  weeks.forEach(w => (w.allocated = perWeek))
}

const addTransaction = (weekIndex) => {
  weeks[weekIndex].transactions.push({
    note: '',
    amount: 0
  })
}

const removeTransaction = (weekIndex, tIndex) => {
  weeks[weekIndex].transactions.splice(tIndex, 1)
}

const weekSpent = (i) =>
  weeks[i].transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

const totalSpent = computed(() =>
  weeks.reduce((sum, w, idx) => sum + weekSpent(idx), 0)
)

const remainingBudget = computed(() =>
  monthlyBudget.value - totalSpent.value
)
</script>

<style scoped>
/* ---------- THEME ---------- */
.budget-root {
  background: #1a1a1a;
  color: #e5e5e5;
  padding: 1rem;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
}
.budget-root.report {
  padding-bottom: 4rem;
}

/* ---------- HEADER ---------- */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.topbar button {
  padding: 0.4rem 0.8rem;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
}

/* ---------- INPUTS ---------- */
label {
  display: block;
  margin-bottom: 0.25rem;
}
input[type="number"],
input[type="text"],
input[type="date"] {
  width: 100%;
  padding: 0.4rem;
  margin-bottom: 0.6rem;
  background: #222;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}

/* ---------- SECTIONS ---------- */
section {
  margin-top: 1.5rem;
  background: #202020;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #333;
}

.weekly-item {
  margin-bottom: 1rem;
}

/* ---------- BUTTONS ---------- */
.auto-alloc,
.add {
  margin-top: 0.5rem;
  padding: 0.4rem;
  width: 100%;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
}

/* ---------- TRANSACTIONS ---------- */
.week-block {
  background: #181818;
  padding: 0.7rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.transaction {
  display: grid;
  grid-template-columns: 1fr 0.6fr auto;
  gap: 0.4rem;
  align-items: center;
}

.transaction .remove {
  width: 32px;
  height: 32px;
  background: #442222;
  border: 1px solid #663333;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
}

/* ---------- REPORT VIEW ---------- */
.report-view h3 {
  margin-bottom: 1rem;
}
.report-week {
  margin-top: 1.4rem;
  background: #202020;
  padding: 1rem;
  border-radius: 6px;
}
.report-week ul {
  padding-left: 1.2rem;
}

h4 small {
  opacity: 0.7;
  font-size: 0.8rem;
  margin-left: 0.25rem;
}

/* ---------- MOBILE ---------- */
@media (max-width: 600px) {
  .transaction {
    grid-template-columns: 1fr 1fr auto;
  }

  .topbar h2 {
    font-size: 1.2rem;
  }
}
</style>

