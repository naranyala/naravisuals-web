<script setup lang="ts">
import AppShell from "./components/AppShell.jsx"
import AboutMe from "./components/AboutMe.jsx"

import CollapsibleSection from "./components/CollapsibleSection.jsx"

import Projects from "./modal-content/Projects.jsx"
import ModalFullscreen from "./components/ModalFullscreen.jsx"
import ImageGallery from "./components/ImageGallery.jsx"
import ImageEncoding from "./components/ImageEncoding.jsx"
import ArticleDraft from "./components/ArticleDraft.jsx"
import ProperEditor from "./components/ProperEditor.jsx"

import {loadArticles} from "./loadArticles.ts"
import staticArticles from "./articles.json"

import {ref, onMounted, reactive} from "vue"
// import { marked } from 'marked';
// import matter from 'gray-matter';
// import { z } from 'zod';


const articles = ref([]);

onMounted(async () => {

  // articles.value = staticArticles;
  articles.value = await loadArticles();

  console.log("articles: ", articles.value)
});


// const isAllOpen = true;
const isAllOpen = false;

const accordionContent = ref([
  {isOpen: isAllOpen, title: "siapa saya",
    content: "saya adalah penggemar linux"},
  {isOpen: isAllOpen, title: "keahlian utama",
    content: "pemrograman web dan sistem"},
  {isOpen: isAllOpen, title: "kegiatan selain pemrograman",
    content: "baca buku dan olahraga"},
  {isOpen: isAllOpen, title: "terkait tempat dan domisili sekarang",
    content: "lahir dan besar di jawa timur, pernah berkuliah di yogyakarta; sekarang ada di madiun"},
])

const menuState = reactive({
  isAboutVisible: false,
  isModalVisible: false,
  isGalleryVisible: false,
  isDraftVisible: false
})

const toggleAbout = () => menuState.isAboutVisible = !menuState.isAboutVisible;
const toggleProject = () => menuState.isProjectVisible = !menuState.isProjectVisible;
const toggleGallery = () => menuState.isGalleryVisible = !menuState.isGalleryVisible;
const toggleEncoding = () => menuState.isEncodingVisible = !menuState.isEcodingVisible;
const toggleDraft = () => menuState.isDraftVisible = !menuState.isDraftVisible;
</script>

<template>


  <ModalFullscreen v-model="menuState.isAboutVisible">
    <AboutMe/>
  </ModalFullscreen>

  <ModalFullscreen v-model="menuState.isProjectVisible">
    <Projects/>
  </ModalFullscreen>

  <ModalFullscreen v-model="menuState.isGalleryVisible">
    <ImageGallery/>
  </ModalFullscreen>

  <ModalFullscreen v-model="menuState.isEncodingVisible">
    <ImageEncoding/>
  </ModalFullscreen>

  <ModalFullscreen v-model="menuState.isDraftVisible">
    <ArticleDraft/>
  </ModalFullscreen>

  <!-- <ProperEditor/> -->

  <div class="layout-footer">
    <button @click="toggleAbout" class="footer-btn">about-me</button>
    <button @click="toggleProject" class="footer-btn">projects</button>
    <button @click="toggleGallery" class="footer-btn">gallery</button>
    <button @click="toggleEncoding" class="footer-btn">encoding</button>
    <button @click="toggleDraft" class="footer-btn">draft</button>
  </div>

  <AppShell :articles="articles"/>


  <div class="layout-grid">
    <CollapsibleSection v-for="section in accordionContent" :title="section.title" :defaultOpen="section.isOpen">
      <p>{{section.content}}</p>
    </CollapsibleSection>
  </div>

</template>

<style scoped>
.layout-footer { text-align: left; margin: 20px auto; padding: 40px;}
.footer-btn { padding: 8px; margin: 8px; }
.layout-grid {
  padding: 40px;
  display: grid;
  grid-template-columns: 1fr; /* Two equal-width columns */
  gap: 1rem; /* Optional: Adds space between columns */
}

@media (min-width: 600px) {
  .layout-grid {
    grid-template-columns: 1fr 1fr; /* Two columns */
  }
}

</style>
