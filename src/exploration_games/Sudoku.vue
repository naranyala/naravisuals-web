<script setup>
import { ref, computed, onMounted } from 'vue'

// --------------------- State ---------------------
const board = ref(Array(9).fill(null).map(() => Array(9).fill(0)))
const initial = ref(Array(9).fill(null).map(() => Array(9).fill(0))) // for readonly cells
const selected = ref({ row: -1, col: -1 })
const conflicts = ref(new Set()) // stores "row,col" strings of conflicting cells
const difficulty = ref(40) // number of clues (40 = medium)

// --------------------- Generate Puzzle ---------------------
function generateSudoku() {
  // Fill diagonal 3x3 boxes first (guaranteed no conflicts)
  const b = Array(9).fill(null).map(() => Array(9).fill(0))
  fillDiagonalBoxes(b)

  // Solve the rest with backtracking
  solveSudoku(b)

  // Copy solved board
  const solved = b.map(row => [...row])

  // Remove cells to create puzzle
  const cellsToRemove = 81 - difficulty.value
  const positions = Array.from({ length: 81 }, (_, i) => i)
  shuffle(positions)

  for (let i = 0; i < cellsToRemove; i++) {
    const pos = positions[i]
    const row = Math.floor(pos / 9)
    const col = pos % 9
    solved[row][col] = 0
  }

  // Set board
  board.value = solved.map(row => [...row])
  initial.value = solved.map(row => row.map(cell => (cell === 0 ? 0 : cell)))
}

function fillDiagonalBoxes(grid) {
  for (let box = 0; box < 9; box += 3) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    shuffle(nums)
    let idx = 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        grid[box + i][box + j] = nums[idx++]
      }
    }
  }
}

function solveSudoku(grid) {
  const findEmpty = () => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c] === 0) return { r, c }
    return null
  }

  const isValid = (num, row, col) => {
    // row
    for (let x = 0; x < 9; x++) if (grid[row][x] === num) return false
    // col
    for (let x = 0; x < 9; x++) if (grid[x][col] === num) return false
    // box
    const boxR = row - (row % 3)
    const boxC = col - (col % 3)
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (grid[boxR + i][boxC + j] === num) return false
    return true
  }

  const empty = findEmpty()
  if (!empty) return true
  const { r, c } = empty

  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  shuffle(nums)

  for (const num of nums) {
    if (isValid(num, r, c)) {
      grid[r][c] = num
      if (solveSudoku(grid)) return true
      grid[r][c] = 0
    }
  }
  return false
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

// --------------------- Input & Validation ---------------------
function handleCellClick(row, col) {
  if (initial.value[row][col] !== 0) return // readonly
  selected.value = { row, col }
}

function handleInput(row, col, value) {
  const num = value === '' ? 0 : parseInt(value)
  if (isNaN(num) || num < 0 || num > 9) return

  board.value[row][col] = num
  checkConflicts()
}

function checkConflicts() {
  conflicts.value.clear()
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board.value[r][c] === 0) continue
      if (hasConflict(r, c)) {
        conflicts.value.add(`${r},${c}`)
      }
    }
  }
}

function hasConflict(row, col) {
  const num = board.value[row][col]
  if (num === 0) return false

  // Check row & col
  for (let i = 0; i < 9; i++) {
    if (i !== col && board.value[row][i] === num) return true
    if (i !== row && board.value[i][col] === num) return true
  }

  // Check box
  const boxR = row - (row % 3)
  const boxC = col - (col % 3)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = boxR + i
      const c = boxC + j
      if ((r !== row || c !== col) && board.value[r][c] === num) return true
    }
  }
  return false
}

// --------------------- Helpers ---------------------
const isSelected = (r, c) => selected.value.row === r && selected.value.col === c
const isHighlighted = (r, c) => {
  if (selected.value.row === -1) return false
  const val = board.value[selected.value.row][selected.value.col]
  return val !== 0 && board.value[r][c] === val
}
const isSameRowColBox = (r, c) => {
  if (selected.value.row === -1) return false
  const sr = selected.value.row
  const sc = selected.value.col
  return r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3))
}

// --------------------- Solve & New Game ---------------------
function solve() {
  const copy = board.value.map(row => [...row])
  solveSudoku(copy)
  board.value = copy
  conflicts.value.clear()
}

onMounted(() => generateSudoku())
</script>

<template>
  <div class="sudoku-app">
    <h1>Vue Sudoku</h1>

    <div class="controls">
      <button @click="generateSudoku">New Game</button>
      <button @click="solve">Solve</button>
      <label>
        Difficulty (clues):
        <input type="range" v-model.number="difficulty" min="30" max="50" />
        {{ difficulty }}
      </label>
    </div>

    <div class="board">
      <div v-for="(row, r) in board" :key="r" class="row">
        <div v-for="(cell, c) in row" :key="c" class="cell" :class="{
          readonly: initial[r][c] !== 0,
          selected: isSelected(r, c),
          highlight: isHighlighted(r, c),
          same: isSameRowColBox(r, c) && !isSelected(r, c),
          conflict: conflicts.has(`${r},${c}`),
          'box-border-right': (c + 1) % 3 === 0 && c !== 8,
          'box-border-bottom': (r + 1) % 3 === 0 && r !== 8
        }" @click="handleCellClick(r, c)">
          <input v-if="initial[r][c] === 0" type="text" maxlength="1" :value="cell || ''"
            @input="e => handleInput(r, c, e.target.value)" @focus="selected = { row: r, col: c }" />
          <span v-else>{{ cell }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sudoku-app {
  font-family: system-ui, sans-serif;
  max-width: 500px;
  margin: 2rem auto;
  text-align: center;
}

.controls {
  margin-bottom: 1rem;
}

.controls button,
.controls label {
  margin: 0 0.5rem;
}

.board {
  display: inline-block;
  border: 3px solid #333;
  background: #000;
}

.row {
  display: flex;
}

.cell {
  width: 50px;
  height: 50px;
  border: 1px solid #666;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  position: relative;
}

.cell input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1.5rem;
  border: none;
  outline: none;
}

.cell.readonly {
  font-weight: bold;
  color: #333;
}

.cell.selected {
  background: #a8d0e6;
}

.cell.highlight {
  background: #e6f3ff;
}

.cell.same {
  background: #f4f4f4;
}

.cell.conflict {
  color: red;
  background: #ffebee !important;
}

.box-border-right {
  border-right: 3px solid #333;
}

.box-border-bottom {
  border-bottom: 3px solid #333;
}
</style>
