<script setup>
import { ref, reactive } from "vue"

import SlidingUpDrawer from "../reusables_root/SlidindUpDrawer.vue"

import Sudoku from "../exploration_games/Sudoku.vue"
import Snake from "../exploration_games/Snake.vue"
import Breakout from "../exploration_games/Breakout.vue"

const isVisible = reactive({
  sudoku: false,
  snake: false,
  breakout: false
})

const playSudoku = () => isVisible.sudoku = !isVisible.sudoku;
const playSnake = () => isVisible.snake = !isVisible.snake;
const playBreakout = () => isVisible.breakout = !isVisible.breakout;

</script>

<template>

  <div class="game-container">
    <button @click="playSudoku">PLAY SUDOKU</button>
    <button @click="playSnake">PLAY SNAKE</button>
    <button @click="playBreakout">PLAY BREAKOUT</button>
  </div>

  <SlidingUpDrawer v-model="isVisible.sudoku">
    <Sudoku />
  </SlidingUpDrawer>
  <SlidingUpDrawer v-model="isVisible.snake">
    <Snake />
  </SlidingUpDrawer>
  <SlidingUpDrawer v-model="isVisible.breakout">
    <Breakout />
  </SlidingUpDrawer>


</template>

<style scoped>
.game-container button {
  margin: 20px;
}
</style>
