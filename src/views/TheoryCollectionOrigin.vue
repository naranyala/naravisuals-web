<script setup>
import {ref} from "vue"

import TheoryList from './TheoryList.vue'

const mathVisualizationTopics = {
  prefix: "math",
  theories: [
    { 
      id: 1, 
      title: 'Linear Transformations', 
      category: 'Linear Algebra', 
      difficulty: 'easy' 
    },
    { 
      id: 2, 
      title: 'Vector Fields', 
      category: 'Vector Calculus', 
      difficulty: 'medium' 
    },
    { 
      id: 3, 
      title: 'Conic Sections', 
      category: 'Analytic Geometry', 
      difficulty: 'easy' 
    },
    { 
      id: 4, 
      title: 'Complex Functions (Domain Coloring)', 
      category: 'Complex Analysis', 
      difficulty: 'hard' 
    },
    { 
      id: 5, 
      title: 'Fractals (e.g., Mandelbrot Set)', 
      category: 'Chaos & Dynamical Systems', 
      difficulty: 'medium' 
    },
    { 
      id: 6, 
      title: 'Parametric Curves', 
      category: 'Parametric Equations', 
      difficulty: 'easy' 
    },
    { 
      id: 7, 
      title: 'Gradient Fields', 
      category: 'Vector Calculus', 
      difficulty: 'medium' 
    },
    { 
      id: 8, 
      title: 'Voronoi Diagrams', 
      category: 'Computational Geometry', 
      difficulty: 'hard' 
    },
    { 
      id: 9, 
      title: 'Phase Portraits', 
      category: 'Differential Equations', 
      difficulty: 'hard' 
    },
    { 
      id: 10, 
      title: 'Fourier Series Approximations', 
      category: 'Harmonic Analysis', 
      difficulty: 'medium' 
    }
  ]
};

const mathVisualizationTopics3D = {
  prefix: "math",
  theories: [
    { 
      id: 1, 
      title: 'Implicit Surfaces', 
      category: 'Implicit Geometry', 
      difficulty: 'medium' 
    },
    { 
      id: 2, 
      title: 'Vector Fields in 3D', 
      category: 'Vector Calculus', 
      difficulty: 'medium' 
    },
    { 
      id: 3, 
      title: 'Parametric Surfaces', 
      category: 'Parametric Geometry', 
      difficulty: 'easy' 
    },
    { 
      id: 4, 
      title: 'Level Sets and Contour Surfaces', 
      category: 'Scalar Fields', 
      difficulty: 'hard' 
    },
    { 
      id: 5, 
      title: '3D Fractals', 
      category: 'Chaos & Fractals', 
      difficulty: 'hard' 
    },
    { 
      id: 6, 
      title: 'Gradient and Curl Fields', 
      category: 'Vector Calculus', 
      difficulty: 'medium' 
    },
    { 
      id: 7, 
      title: 'Dynamical Systems & Attractors', 
      category: 'Dynamical Systems', 
      difficulty: 'medium' 
    },
    { 
      id: 8, 
      title: 'Algebraic Geometry: Quadric Surfaces', 
      category: 'Algebraic Geometry', 
      difficulty: 'easy' 
    },
    { 
      id: 9, 
      title: 'Topological Manifolds', 
      category: 'Topology', 
      difficulty: 'hard' 
    },
    { 
      id: 10, 
      title: 'Voronoi Diagrams in 3D', 
      category: 'Computational Geometry', 
      difficulty: 'hard' 
    }
  ]
};

const physicsVisualizationTopics2D = {
  prefix: "physics",
  theories: [
    { 
      id: 1, 
      title: 'Classical Trajectories', 
      category: 'Classical Mechanics', 
      difficulty: 'easy' 
    },
    { 
      id: 2, 
      title: 'Electric Field Lines', 
      category: 'Electrostatics', 
      difficulty: 'easy' 
    },
    { 
      id: 3, 
      title: 'Magnetic Field Lines', 
      category: 'Magnetostatics', 
      difficulty: 'medium' 
    },
    { 
      id: 4, 
      title: 'Wave Interference Patterns', 
      category: 'Wave Physics', 
      difficulty: 'medium' 
    },
    { 
      id: 5, 
      title: 'Phase Space Diagrams', 
      category: 'Classical Mechanics', 
      difficulty: 'easy' 
    },
    { 
      id: 6, 
      title: 'Fluid Streamlines', 
      category: 'Fluid Dynamics', 
      difficulty: 'medium' 
    },
    { 
      id: 7, 
      title: 'Equipotential Contours', 
      category: 'Electrostatics', 
      difficulty: 'easy' 
    },
    { 
      id: 8, 
      title: 'Ray Optics', 
      category: 'Geometrical Optics', 
      difficulty: 'easy' 
    },
    { 
      id: 9, 
      title: 'Diffusion and Heat Maps', 
      category: 'Thermodynamics & Diffusion', 
      difficulty: 'medium' 
    },
    { 
      id: 10, 
      title: 'Polarization & EM Waves', 
      category: 'Electromagnetism', 
      difficulty: 'medium' 
    }
  ]
};

const physicsVisualizationTopics3D = {
  prefix: "physics",
  theories: [
    { 
      id: 1, 
      title: 'Electromagnetic Fields', 
      category: 'Electromagnetism', 
      difficulty: 'medium' 
    },
    { 
      id: 2, 
      title: 'Gravitational Fields', 
      category: 'Gravitation', 
      difficulty: 'medium' 
    },
    { 
      id: 3, 
      title: 'Orbital Mechanics', 
      category: 'Classical Mechanics', 
      difficulty: 'easy' 
    },
    { 
      id: 4, 
      title: 'Fluid Velocity Fields', 
      category: 'Fluid Dynamics', 
      difficulty: 'hard' 
    },
    { 
      id: 5, 
      title: 'Wavefront Propagation', 
      category: 'Wave Physics', 
      difficulty: 'medium' 
    },
    { 
      id: 6, 
      title: 'Magnetic Flux Tubes', 
      category: 'Plasma Physics', 
      difficulty: 'hard' 
    },
    { 
      id: 7, 
      title: 'Quantum Probability Clouds', 
      category: 'Quantum Mechanics', 
      difficulty: 'medium' 
    },
    { 
      id: 8, 
      title: 'Stress and Strain Fields', 
      category: 'Continuum Mechanics', 
      difficulty: 'hard' 
    },
    { 
      id: 9, 
      title: 'Relativistic Light Cones', 
      category: 'Special Relativity', 
      difficulty: 'medium' 
    },
    { 
      id: 10, 
      title: 'Plasma and Particle Simulations', 
      category: 'Plasma Physics', 
      difficulty: 'hard' 
    }
  ]
};

const shuffleKey = ref(false) // reactive trigger

const triggerShuffle = () => {
  shuffleKey.value = true
  // Reset immediately so next click works
  setTimeout(() => {
    shuffleKey.value = false
  }, 0)
}

const onShuffleDone = () => {
  console.log('Cards shuffled!')
}


</script>

<template>
  <div class="app">
    <h2 class="group-title">Math 2D</h2>
    <TheoryList :cards="mathVisualizationTopics" />

    <h2 class="group-title">Math 3D</h2>
    <TheoryList :cards="mathVisualizationTopics3D" />

    <h2 class="group-title">Physics 2D</h2>
    <TheoryList :cards="physicsVisualizationTopics2D" />

    <div style="display: grid; margin: 0 auto; width:100%;">
      <h2 class="group-title">Physics 3D</h2>
      <button @click="triggerShuffle" style="width: 200px; margin: 0 auto;">
        shuffle
      </button>
    </div>
    <!-- <TheoryList :cards="physicsVisualizationTopics3D"  -->
    <!--   @action-shuffle="actionShuffle" /> -->

 <TheoryList 
    :cards="physicsVisualizationTopics3D" 
    :should-shuffle="shuffleKey"
    @action-shuffle="onShuffleDone"
  />

  </div>
</template>

<style>
.app {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 40px 20px;
  /* background: #f8f9fa; */
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
