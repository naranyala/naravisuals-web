
<script setup>

import {ref, reactive} from "vue"

import ScrollToTop from "./ScrollToTop.vue"
import SlidingUpDrawer from "./views/reusables/SligindUpDrawer.vue"

const links = [
  { label: 'past-of-me', href: '#' },
  { label: 'present-of-me', href: '#' },
  { label: 'future-of-me', href: '#' },
];

// State variable to control the drawer's visibility
const isDrawerOpen = reactive({
  pastOfMe: false,
  currentOfMe: false, 
  futureOfMe: false
})

// Function to open it (e.g., when a button is clicked)
const openDrawer = (key) => {
  if (key === "past-of-me") isDrawerOpen.pastOfMe = true
  if (key === "current-of-me") isDrawerOpen.currentOfMe = true
  if (key === "future-of-me") isDrawerOpen.futureOfMe = true
}

const contentPastOfMe = reactive({
  title: "past-of-me",
  articles: [
    "lorem ipsum dolor",
    "lorem ipsum",
    "lorem ipsum"
  ]
})

const contentCurrentOfMe = reactive({
  title: "current-of-me",
  articles: [
    "lorem ipsum dolor",
    "lorem ipsum",
    "lorem ipsum"
  ]
})

const contentFutureOfMe = reactive({
  title: "future-of-me",
  articles: [
    "lorem ipsum dolor",
    "lorem ipsum",
    "lorem ipsum"
  ]
})


</script>


<template>
  <footer class="footer">
    <div class="footer-links">
      <!-- <a v-for="item in links" :key="item.label" :href="item.href" class="link-item"> -->
      <!--   {{ item.label }} -->
      <!-- </a> -->

      <a class="link-item" @click="openDrawer('past-of-me')">{{contentPastOfMe.title}}</a> 
      <a class="link-item" @click="openDrawer('current-of-me')">{{contentCurrentOfMe.title}}</a> 
      <a class="link-item" @click="openDrawer('future-of-me')">{{contentFutureOfMe.title}}</a> 
    </div>

    <p class="footer-copyright">© 2025 gema_naranyala</p>
    <ScrollToTop/>


    <SlidingUpDrawer v-model="isDrawerOpen.pastOfMe" :persistent="false">
        <template #header>
          <h3 class="drawer-header">{{contentPastOfMe.title}}</h3>
        </template>
      <p v-for="section in contentPastOfMe.articles">{{section}}</p>
    </SlidingUpDrawer>


    <SlidingUpDrawer v-model="isDrawerOpen.currentOfMe" :persistent="false">
        <template #header>
          <h3 class="drawer-header">{{contentCurrentOfMe.title}}</h3>
        </template>
      <p v-for="section in contentCurrentOfMe.articles">{{section}}</p>
    </SlidingUpDrawer>


    <SlidingUpDrawer v-model="isDrawerOpen.futureOfMe" :persistent="false">
        <template #header>
          <h3 class="drawer-header">{{contentFutureOfMe.title}}</h3>
        </template>
      <p v-for="section in contentFutureOfMe.articles">{{section}}</p>
    </SlidingUpDrawer>

  </footer>
</template>

<style>
/* These are the real animation classes Vue uses */
.drawer-enter-active, .drawer-leave-active {
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.25s;
}
.drawer-enter-from, .drawer-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.footer {
  text-align: center;
  padding-top: 1.2rem;
  padding-bottom: 120px;
  background-color: #121212;
  color: #b0b0b0;
  font-size: 1.05rem;
  border-top: 1px solid #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.footer-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.8rem;
  margin-bottom: 1.4rem;
}

.link-item {
  color: #b0b0b0;
  text-decoration: none;
  transition: color 0.2s ease;
  white-space: nowrap;

  &:hover { text-decoration: underline; cursor: pointer; }
}

/* .link-item:hover, */
/* .link-item:focus { */
/*   color: #4da6ff; */
/*   outline: none; */
/* } */

.footer-copyright {
  margin: 0;
  color: #888;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
  margin-bottom: 20px;
}

/* Responsive touch optimization */
@media (max-width: 480px) {
  .footer {
    padding: 1rem 0.75rem;
  }

  .footer-links {
    gap: 0.8rem;
  }
}

.drawer-header { text-align: center; font-weight: bold; padding-bottom: 5px; }
</style>
