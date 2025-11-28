<script setup>
import { ref, onMounted, reactive} from "vue"
import TheoryList from './TheoryList.vue'

function sumTheories(sourceObj){
  const finalObj = [];
  Object.keys(sourceObj).forEach((fileKey) => {
    const temp = sourceObj[fileKey].default;
    temp.forEach((item) => finalObj.push(item));
  });
  return finalObj;
}

function getBlenderTopics(){
  const rawBlenderTopics = import.meta.glob('../data/blender-3d/**/*.json', { 
    eager: true, query: '?json' 
  });
  return sumTheories(rawBlenderTopics)
}

function getMath2D(){
  const rawMath2D = import.meta.glob('../data/math-2d/**/*.json', { 
    eager: true, query: '?json' 
  });
  return sumTheories(rawMath2D)
}

function getMath3D(){
  const rawMath3D = import.meta.glob('../data/math-3d/**/*.json', { 
    eager: true, query: '?json' 
  }); 
  return sumTheories(rawMath3D)
}

function getPhysic2D(){
  const rawPhysics2D = import.meta.glob('../data/physics-2d/**/*.json', { 
    eager: true, query: '?json' 
  });
  return sumTheories(rawPhysics2D)
}

function getPhysic3D(){
  const rawPhysics3D = import.meta.glob('../data/physics-3d/**/*.json', { 
    eager: true, query: '?json' 
  });
  return sumTheories(rawPhysics3D)
}

const allBlenderTopics = reactive({ prefix: "blender", theories: getBlenderTopics() })
const allMath2D = reactive({ prefix: "math", theories: getMath2D() })
const allMath3D = reactive({ prefix: "math", theories: getMath3D() })
const allPhysics2D = reactive({ prefix: "physics", theories: getPhysic2D() })
const allPhysics3D = reactive({ prefix: "physics", theories: getPhysic3D() })


const shuffleTrigger = reactive({
  blender3d: 0,
  math2d: 0,
  math3d: 0,
  physics2d: 0,
  physics3d: 0,
})
const triggerShuffle = (key) => {
  if (key === 'blender3d') shuffleTrigger.blender3d += 1;
  if (key === 'math2d') shuffleTrigger.math2d += 1;
  if (key === 'math3d') shuffleTrigger.math3d += 1;
  if (key === 'physics2d') shuffleTrigger.physics2d += 1;
  if (key === 'physics3d') shuffleTrigger.physics3d += 1;
}
const onShuffleDone = () => console.log('Cards shuffled!');

</script>

<template>
  <div class="app">
  
    <!-- <pre>{{JSON.stringify(rawBlenderTopics, null, 2)}}</pre> -->


    <div class="group-context">
      <h2 class="group-title">Blender 3D</h2>
      <button @click="triggerShuffle('blender3d')" class="shuffle-btn">
        shuffle (5/{{ allBlenderTopics.theories.length }})
      </button>
    </div>
    <TheoryList
      :cards="allBlenderTopics"
      :shuffle-trigger="shuffleTrigger.blender3d"
      @shuffle-complete="onShuffleDone"
    />

    <div class="group-context">
      <h2 class="group-title">Math 2D</h2>
      <button @click="triggerShuffle('math2d')" class="shuffle-btn">
        shuffle (5/{{ allMath2D.theories.length }})
      </button>
    </div>
    <TheoryList
      :cards="allMath2D"
      :shuffle-trigger="shuffleTrigger.math2d"
      @shuffle-complete="onShuffleDone"
    />


    <div class="group-context">
      <h2 class="group-title">Math 3D</h2>
      <button @click="triggerShuffle('math3d')" class="shuffle-btn">
        shuffle (5/{{ allMath3D.theories.length }})
      </button>
    </div>
    <TheoryList
      :cards="allMath3D"
      :shuffle-trigger="shuffleTrigger.math3d"
      @shuffle-complete="onShuffleDone"
    />


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
