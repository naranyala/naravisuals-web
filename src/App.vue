<script setup lang="ts">
import AppShell from "./components/AppShell.jsx"
import staticArticles from "./articles.json"
import AboutMe from "./components/AboutMe.jsx"

import ModalFullscreen from "./components/ModalFullscreen.jsx"
import Projects from "./modal-content/Projects.jsx"
import ImageGallery from "./components/ImageGallery.jsx"

import {ref, onMounted} from "vue"
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


const isAboutVisible = ref(false)
const toggleAbout = () => isAboutVisible.value = !isAboutVisible.value;

const isModalVisible = ref(false)
const toggleModal = () => isModalVisible.value = !isModalVisible.value;


const isGalleryVisible = ref(false)
const toggleGallery = () => isGalleryVisible.value = !isGalleryVisible.value;

</script>

<template>


  <ModalFullscreen v-model="isAboutVisible">
    <AboutMe/>
  </ModalFullscreen>

  <ModalFullscreen v-model="isModalVisible">
    <Projects/>
  </ModalFullscreen>

  <ModalFullscreen v-model="isGalleryVisible">
    <ImageGallery/>
  </ModalFullscreen>

  <div class="layout-footer">
    <button @click="toggleAbout" class="footer-btn">about-me</button>
    <button @click="toggleModal" class="footer-btn">projects</button>
    <button @click="toggleGallery" class="footer-btn">gallery</button>
  </div>

  <AppShell :articles="articles"/>


</template>

<style scoped>
.layout-footer { text-align: center; margin: 20px auto; padding: 40px;}
.footer-btn { padding: 8px; margin: 8px; }
</style>
