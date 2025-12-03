<script setup>

import { ref, reactive } from "vue"

import ScrollToTop from "./ScrollToTop.vue"
import SlidingUpDrawer from "./SlidindUpDrawer.vue"
import GridMenu from "./GridMenu.vue"
import SocialMediaButtons from "./SocialMediaButtons.vue"
import GeneralCollapsible from "./GeneralCollapsible.vue"

import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = [
  { label: 'Home', action: () => router.push('/') },
  { label: 'Profile', action: () => router.push('/profile') },
  { label: 'Settings', action: () => router.push('/settings') },
  { label: 'Logout', action: () => console.log('Logging out...') },
]


const links = [
  { label: 'past-of-me', href: '#' },
  { label: 'present-of-me', href: '#' },
  { label: 'future-of-me', href: '#' },
];

// State variable to control the drawer's visibility
const isDrawerOpen = reactive({
  pastOfMe: false,
  presentOfMe: false,
  futureOfMe: false
})

// Function to open it (e.g., when a button is clicked)
const openDrawer = (key) => {
  if (key === "past-of-me") isDrawerOpen.pastOfMe = true
  if (key === "present-of-me") isDrawerOpen.presentOfMe = true
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

const contentPresentOfMe = reactive({
  title: "present-of-me",
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


const triggerScroll = ref(false);


const actionPastOfMe = () => {
  isDrawerOpen.pastOfMe = false;
  triggerScroll.value = true;
}

const actionPresentOfMe = () => {
  isDrawerOpen.presentOfMe = false;
  triggerScroll.value = true;
}


const actionFutureOfMe = () => {
  isDrawerOpen.futureOfMe = false;
  triggerScroll.value = true;
}

const aboutMeCollapsible = reactive({
  isOpen: false,
  title: "about me",
  strContent: [
    "hello there",
    "hello again",
    "hello"
  ]
})

const principlesCollapsible = reactive({
  isOpen: true,
  title: "principles",
  strContent: [
    "coding",
    "eat",
    "sleep"
  ]
})


</script>


<template>
  <footer class="footer">


    <ScrollToTop :trigger-scroll="triggerScroll" @scroll-complete="triggerScroll = false" />


    <GeneralCollapsible :is-open="principlesCollapsible.isOpen" :title="principlesCollapsible.title" :strContent="principlesCollapsible.strContent"/>

    <GeneralCollapsible :is-open="aboutMeCollapsible.isOpen" :title="aboutMeCollapsible.title" :strContent="aboutMeCollapsible.strContent"/>



    <SocialMediaButtons />
    <p class="footer-copyright">© 2025 gema_naranyala</p>




    <!--
    <div class="footer-links">
      <a class="link-item" @click="openDrawer('past-of-me')">{{ contentPastOfMe.title }}</a>
      <a class="link-item" @click="openDrawer('present-of-me')">{{ contentPresentOfMe.title }}</a>
      <a class="link-item" @click="openDrawer('future-of-me')">{{ contentFutureOfMe.title }}</a>
    </div>




    <SlidingUpDrawer v-model="isDrawerOpen.pastOfMe" :persistent="false">
      <template #header>
        <h3 class="drawer-header">{{ contentPastOfMe.title }}</h3>
      </template>

<GridMenu :items="menuItems" @drawer-close="actionPastOfMe" />
</SlidingUpDrawer>


<SlidingUpDrawer v-model="isDrawerOpen.presentOfMe" :persistent="false">
  <template #header>
        <h3 class="drawer-header">{{ contentPresentOfMe.title }}</h3>
      </template>

  <GridMenu :items="menuItems" @drawer-close="actionPresentOfMe" />
</SlidingUpDrawer>


<SlidingUpDrawer v-model="isDrawerOpen.futureOfMe" :persistent="false">
  <template #header>
        <h3 class="drawer-header">{{ contentFutureOfMe.title }}</h3>
      </template>

  <GridMenu :items="menuItems" @drawer-close="actionFutureOfMe" />
</SlidingUpDrawer>


-->
  </footer>
</template>

<style>
/* These are the real animation classes Vue uses */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.25s;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.footer {
  text-align: center;
  padding-top: 1.2rem;
  padding-bottom: 120px;
  /* background-color: #121212; */
  /* color: #b0b0b0; */
  font-size: 1.05rem;
  /* border-top: 1px solid #333; */
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

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}

.footer-copyright {
  margin-top: 45px;
  margin-bottom: 120px;
  color: #888;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
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

.drawer-header {
  text-align: center;
  font-weight: bold;
  padding-bottom: 5px;
}
</style>
