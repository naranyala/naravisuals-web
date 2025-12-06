<script setup>
import { ref } from 'vue';

import PageHeader from "./goober-motion/PageHeader.jsx"

import Timeline from "./engine/Timeline.vue"
import OsLikeDemo from "./OsLikeDemo.vue"

import DashboardLayout from "./DashboardLayout.vue"
// import TransitionSample01 from "./canvas-engine/TransitionSample01.vue"
// import TransitionSample02 from "./canvas-engine/TransitionSample02.vue"
import TransitionSample03 from "./canvas-engine/TransitionSample03.vue"
import TransitionSample04 from "./canvas-engine/TransitionSample04.vue"
import TransitionSample05 from "./canvas-engine/TransitionSample05.vue"
// import TransitionSample06 from "./canvas-engine/TransitionSample06.vue"

// import TopologySample01 from "./canvas-engine/TopologySample01.vue"

import GeometrySample01 from "./canvas-engine/GeometrySample01.vue"
import GeometrySample02 from "./canvas-engine/GeometrySample02.vue"

import GeometricAlgebraDemo from "./canvas-engine/GeometricAlgebraDemo.vue"

const isDashboardVisible = ref(false);

const toggleDashboard = () => {
  isDashboardVisible.value = !isDashboardVisible.value;
  document.body.style.overflow = isDashboardVisible.value ? 'hidden' : 'auto';
};

const isOsLikeVisible = ref(false);

const toggleOS = () => {
  isOsLikeVisible.value = !isOsLikeVisible.value;
  document.body.style.overflow = isOsLikeVisible.value ? 'hidden' : 'auto';
};



</script>

<template>
  <PageHeader title="Animation Studio" subtitle="your batteries-included toolkit
  for 2d animation"/>

  <div class="animation-section">

    <div>
      <div v-if="isDashboardVisible" class="fullscreen-overlay" @click.self="toggleFullscreen">
        <div class="fullscreen-content">
          <DashboardLayout @toggle-dashboard="toggleDashboard" />
        </div>
      </div>

      <div class="section-dasboard">
        <button @click="toggleDashboard">
          {{ isFullscreen ? 'close dashboard' : 'open dashboard' }}
        </button>
      </div>
    </div>


    <div>
      <div v-if="isOsLikeVisible" class="fullscreen-overlay" @click.self="toggleOS">
        <div class="fullscreen-content">
          <!-- <h1>my OS</h1> -->
          <OsLikeDemo @toggle-os="toggleOS" />
        </div>
      </div>

      <div class="section-dasboard">
        <button @click="toggleOS">
          {{ isOsLikeVisible ? 'close os' : 'open os' }}
        </button>
      </div>
    </div>



    <!-- <Timeline /> -->

    <!-- <TransitionSample01 /> -->
    <!-- <TransitionSample02 /> -->
    <TransitionSample03 />
    <TransitionSample04 />
    <TransitionSample05 />
    <!-- <TransitionSample06 /> -->
    <!-- <TopologySample01 /> -->

    <GeometrySample01 />
    <GeometrySample02 />

    <hr />

    <GeometricAlgebraDemo />
  </div>
</template>


<style>
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  /* Semi-transparent black */
  z-index: 1000;
  /* Ensure it's on top of everything */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.fullscreen-content {
  background: white;
  padding: 0px;
  border-radius: 8px;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  width: 100%;
}

.section-dasboard {
  padding: 40px 0;
  text-align: center;
}

.animation-section>div {
  border: 1px solid gray;
  border-radius: 20px;
  padding: 40px;
  margin: 40px 0;
}
</style>
