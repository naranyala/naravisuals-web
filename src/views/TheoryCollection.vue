<script setup>
import { ref, onMounted, reactive} from "vue"
import TheoryList from './TheoryList.vue'

import physics2d01 from "./theories-physics-2d/01.json"
import physics2d02 from "./theories-physics-2d/02.json"
import physics2d03 from "./theories-physics-2d/03.json"

const allPhysics2D = reactive({
  prefix: "physics",
  theories: [
    ...physics2d01[0]?.theories,
    ...physics2d02[0]?.theories,
    ...physics2d03[0]?.theories,
  ]
})

console.log("allPhysics2D", allPhysics2D)

import physics3d01 from "./theories-physics-3d/01.json"
import physics3d02 from "./theories-physics-3d/02.json"
import physics3d03 from "./theories-physics-3d/03.json"

const allPhysics3D = reactive({
  prefix: "physics",
  theories: [
    ...physics3d01[0]?.theories,
    ...physics3d02[0]?.theories,
    ...physics3d03[0]?.theories,
  ]
})


const shuffleTrigger = reactive({
  math2d: 0,
  math3d: 0,
  physics2d: 0,
  physics3d: 0,
})
const triggerShuffle = (key) => {
  if (key === 'math2d') shuffleTrigger.math2d += 1;
  if (key === 'math3d') shuffleTrigger.math3d += 1;
  if (key === 'physics2d') shuffleTrigger.physics2d += 1;
  if (key === 'physics3d') shuffleTrigger.physics3d += 1;
}
const onShuffleDone = () => console.log('Cards shuffled!');

</script>

<template>
  <div class="app">

    <!-- <pre>{{JSON.stringify(allPhysics2D, null, 2)}}</pre> -->
    <!-- <pre>{{JSON.stringify(shuffleTrigger.physics2d, null, 2)}}</pre> -->
    <!-- <pre>{{JSON.stringify(shuffleTrigger.physics3d, null, 2)}}</pre> -->

    <div class="group-context">
      <h2 class="group-title">Physics 2D</h2>
      <button @click="triggerShuffle('physics2d')" class="shuffle-btn">
        shuffle (5/{{ allPhysics2D.theories.length }})
      </button>
    </div>
    <TheoryList
      :cards="allPhysics2D"
      :shuffle-trigger="shuffleTrigger.physics2d"
      @shuffle-complete="onShuffleDone"
    />


    <div class="group-context">
      <h2 class="group-title">Physics 3D</h2>
      <button @click="triggerShuffle('physics3d')" class="shuffle-btn">
        shuffle (5/{{ allPhysics3D.theories.length }})
      </button>
    </div>
    <TheoryList
      :cards="allPhysics3D"
      :shuffle-trigger="shuffleTrigger.physics3d"
      @shuffle-complete="onShuffleDone"
    />

  </div>
</template>

<style>
.shuffle-btn {
  width: 200px; margin: 0 auto;
}

.group-context {
  display: grid; margin: 0 auto; width:100%;
}

.app {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 40px 20px;
  min-height: 100vh;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 8px;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

.group-title { text-align: center; }
</style>
