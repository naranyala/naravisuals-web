<script setup lang="ts">
import AppShell from "./components/AppShell.jsx"
import staticArticles from "./articles.json"
import AboutMe from "./components/AboutMe.jsx"

import Projects from "./modal-content/Projects.jsx"
import ModalFullscreen from "./components/ModalFullscreen.jsx"
import ImageGallery from "./components/ImageGallery.jsx"
import ImageEncoding from "./components/ImageEncoding.jsx"
import ArticleDraft from "./components/ArticleDraft.jsx"

import {ref, onMounted, reactive} from "vue"
import { marked } from 'marked';
import matter from 'gray-matter';
import { z } from 'zod';

const ReferenceSchema = z.object({
  authors: z.string(),
  title: z.string(),
  journal: z.string(),
  year: z.string().regex(/^\d{4}$/),
});

const ArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  date: z.string().regex(/^\w+ \d{1,2}, \d{4}$/), // e.g., "December 15, 2025"
  content: z.string(), // HTML after parsing
  references: z.array(ReferenceSchema).optional().default([]),
});

function parseMarkdownArticle(rawMarkdown, sourcePath ) {
  const { data: frontmatter, content: markdownBody } = matter(rawMarkdown);

  const htmlContent = marked.parse(markdownBody, {
    gfm: true,
    breaks: true,
  });

  const rawArticle = {
    ...frontmatter,
    content: htmlContent,
  };

  // return rawArticle;

  try {
    return ArticleSchema.parse(rawArticle);
  } catch (err) {
    // throw error;
    console.error(err)
  }
}

const markdownModules = import.meta.glob('./articles/**/*.md', { query: '?raw', eager: true });

async function loadArticles() {
  const articles = [];

  for (const [path, rawMarkdown] of Object.entries(markdownModules)) {
    try {
      const article = parseMarkdownArticle(rawMarkdown.default, path);
      articles.push(article);
    } catch (err) {
      console.error(err)
    }
  }

  // console.log(articles)
  return articles.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}


const articles = ref([] || staticArticles);

onMounted(async () => {
  articles.value = await loadArticles();

  console.log("articles: ", articles.value)
});

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

  <div class="layout-footer">
    <button @click="toggleAbout" class="footer-btn">about-me</button>
    <button @click="toggleProject" class="footer-btn">projects</button>
    <button @click="toggleGallery" class="footer-btn">gallery</button>
    <button @click="toggleEncoding" class="footer-btn">encoding</button>
    <button @click="toggleDraft" class="footer-btn">draft</button>
  </div>

  <AppShell :articles="articles"/>


</template>

<style scoped>
.layout-footer { text-align: left; margin: 20px auto; padding: 40px;}
.footer-btn { padding: 8px; margin: 8px; }
</style>
