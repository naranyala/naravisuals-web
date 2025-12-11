<template>
  <div class="controls">
    <button @click="toggleDark">{{ isDark ? 'Light' : 'Dark' }}</button>
  </div>

  <section :class="['paper', { dark: isDark }]">
    <div v-for="sec in doc" :key="sec.id" class="section">
      <h2>{{ sec.title }}</h2>
      <div v-for="sub in sec.subs" :key="sub.id" class="subsection">
        <h3>{{ sub.title }}</h3>
        <p v-for="(p, i) in sub.body" :key="i">
          <span v-if="i === 0 && p[0]" class="dropcap">{{ p[0] }}</span>{{ p.slice(1) }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'

const isDark = ref(false)
const toggleDark = () => (isDark.value = !isDark.value)

const doc = reactive([
  {
    id: 1,
    title: '1 Context',
    subs: [
      {
        id: '1.1',
        title: '1.1 Original game',
        body: [
          'Minecraft, developed by Mojang Studios and initially released in 2011, is a sandbox game that has become one of the best-selling video games of all time. The game offers players a procedurally generated, voxel-based 3D world where they can explore, mine resources, craft tools, and build structures. Its core mechanics revolve around breaking and placing blocks, enabling creative expression, survival challenges, and exploration.',
          'The game features two primary modes: Creative Mode, where players have unlimited resources and the freedom to build without constraints, and Survival Mode, where players must gather resources, manage health, and fend off hostile creatures. Additionally, Minecraft\'s open-ended gameplay is complemented by multiplayer features, a thriving modding community, and educational applications.',
          'Minecraft\'s technical foundation includes efficient chunk-based terrain generation, procedural algorithms for creating diverse landscapes, and a modular system for managing game components. This design has inspired many clones and adaptations, making it a prime example of combining simple mechanics with profound depth and scalability.'
        ]
      },
      {
        id: '1.2',
        title: '1.2 Existing copies',
        body: [
          'Numerous Minecraft clones already exist in nearly every programming language, making them excellent resources for learning about game-engine development, especially for voxel-based games. Many content creators have documented their development process in insightful videos, which have proven to be valuable sources of inspiration.',
          'Notable examples include I Remade Minecraft But It\'s Optimized by FinalForEach [3], and How to Make Minecraft in C++ or Any Other Language by Low Level Game Dev [4].'
        ]
      }
    ]
  }
])
</script>

<style scoped>
* {
  text-align: left !importaant;
}

.controls {
  text-align: right;
  max-width: 680px;
  margin: 1rem auto;
  padding: 0 1.5rem;
}

button {
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.paper {
  max-width: 680px;
  margin: 0 auto 3rem;
  padding: 2rem;
  text-align: justify;
  font-family: "Times New Roman", Times, serif;
  font-size: 11pt;
  line-height: 1.6;
  color: #111;
  background: #fff;
}

.dark {
  color: #eee;
  background: #121212;
}

h2 {
  font-size: 12pt;
  font-weight: 700;
  margin: 1.5rem 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

h3 {
  font-size: 11pt;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
}

p { text-align: left; }

.section {
  margin-bottom: 2rem;
  text-align: left;
}

.subsection {
  margin-bottom: 1rem;
}

.dropcap {
  float: left;
  font-size: 3.2em;
  line-height: 0.9;
  margin: 0.08em 0.08em 0 0;
  font-weight: 700;
}
</style>
