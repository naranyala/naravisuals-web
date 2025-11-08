
<script setup>
import { ref } from 'vue';

const currentView = ref('list');
const currentPost = ref(null);

const posts = [
  {
    id: 1,
    title: "The Art of Minimalism in Writing",
    date: "2024-01-15",
    readTime: 3,
    excerpt: "Exploring how less can be more when it comes to conveying powerful ideas through text.",
    content: [
      "Minimalism in writing is not about using fewer words for the sake of brevity. It's about stripping away the unnecessary to reveal the essence of your message.",
      "When we remove clutter from our writing, we create space for the reader's imagination to flourish. Each word must carry weight, each sentence must serve a purpose.",
      "The challenge lies not in what we include, but in what we choose to leave out. This deliberate act of omission is where the true craft of writing emerges."
    ]
  },
  {
    id: 2,
    title: "Digital Detox: A Month Without Notifications",
    date: "2024-01-08",
    readTime: 5,
    excerpt: "Reflections on disconnecting from the constant ping of digital life and rediscovering focus.",
    content: [
      "I began my digital detox on a Tuesday morning. The first step was disabling all non-essential notifications on my devices. No more social media alerts, no more news updates, no more email badges.",
      "The first day was disorienting. I reached for my phone out of habit dozens of times, only to find a blank screen staring back at me. By the third day, something remarkable happened: I stopped reaching.",
      "Without constant interruptions, my attention span began to recover. I could read for an hour without feeling the itch to check my phone. I completed tasks without the temptation to multitask.",
      "The most surprising discovery was the mental clarity that emerged. Without the background hum of digital noise, I found myself thinking more deeply, more creatively, and more patiently."
    ]
  },
  {
    id: 3,
    title: "The Quiet Beauty of Morning Pages",
    date: "2024-01-02",
    readTime: 4,
    excerpt: "How three pages of stream-of-consciousness writing each morning can transform your creative process.",
    content: [
      "The practice is simple: write three pages, longhand, first thing in the morning. No editing, no judgment, no stopping. Just let the words flow onto the page.",
      "Morning pages are not meant to be read, not even by yourself. They are a form of meditation, a way to clear the mental clutter before beginning the day.",
      "What emerges on these pages is often surprising. Worries that seemed overwhelming shrink to a few lines. Ideas that seemed trivial reveal unexpected depths. Patterns of thought become visible.",
      "The real magic happens after weeks of consistent practice. You begin to notice subtle shifts in your thinking. Creative blocks dissolve. Decision-making becomes clearer. The voice of your inner critic grows quieter."
    ]
  }
];

function showPost(post) {
  alert('push url to navigate!')

  currentPost.value = post;
  currentView.value = 'post';
  window.scrollTo(0, 0);
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
</script>

<template>
  <div class="blog-container">
    <header class="blog-header">
      <h1 @click="currentView = 'list'">My Text Blog</h1>
      <p class="tagline">Thoughts and musings</p>
    </header>

    <!-- Article List View -->
    <div v-if="currentView === 'list'" class="article-list">
      <article 
        v-for="post in posts" 
        :key="post.id"
        class="article-card"
        @click="showPost(post)"
      >
        <h2 class="article-title">{{ post.title }}</h2>
        <div class="article-meta">
          <time>{{ formatDate(post.date) }}</time>
          <span class="read-time">{{ post.readTime }} min read</span>
        </div>
        <p class="article-excerpt">{{ post.excerpt }}</p>
        <a @click.stop="showPost(post)" class="read-more">Read more →</a>
      </article>
    </div>

    <!-- Single Post View -->
    <article v-else-if="currentView === 'post'" class="single-post">
      <header class="post-header">
        <h1 class="post-title">{{ currentPost.title }}</h1>
        <div class="post-meta">
          <time>{{ formatDate(currentPost.date) }}</time>
          <span class="read-time">{{ currentPost.readTime }} min read</span>
        </div>
      </header>
      <div class="post-content">
        <p v-for="(paragraph, index) in currentPost.content" :key="index">
          {{ paragraph }}
        </p>
      </div>
      <footer class="post-footer">
        <a @click="currentView = 'list'" class="back-link">← Back to all articles</a>
      </footer>
    </article>
  </div>
</template>


<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Georgia', serif;
  line-height: 1.7;
  color: #f0f0f0;
  background: linear-gradient(135deg, #121212 0%, #0a0a0a 100%);
  background-attachment: fixed;
  min-height: 100vh;
}

.blog-container {
  max-width: 750px;
  margin: 0 auto;
  padding: 2rem;
}

.blog-header {
  text-align: center;
  margin-bottom: 3.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #333;
}

.blog-header h1 {
  font-size: 2.8rem;
  font-weight: 300;
  letter-spacing: -0.5px;
  margin-bottom: 0.5rem;
  color: #ffffff;
  cursor: pointer;
  transition: color 0.3s ease;
}

.blog-header h1:hover {
  color: #b0b0b0;
}

.tagline {
  color: #b0b0b0;
  font-size: 1.1rem;
  font-style: italic;
  font-weight: 300;
}

/* Article List Styles */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.article-card {
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(10px);
  padding: 2.2rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  border: 1px solid rgba(51, 51, 51, 0.5);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 7px 18px rgba(0,0,0,0.3);
  border-color: rgba(70, 70, 70, 0.7);
  background: rgba(40, 40, 40, 0.9);
}

.article-title {
  font-size: 1.6rem;
  font-weight: 500;
  margin-bottom: 0.7rem;
  color: #ffffff;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
  color: #b0b0b0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.article-excerpt {
  color: #d0d0d0;
  margin-bottom: 1.2rem;
  line-height: 1.7;
  font-size: 1.05rem;
}

.read-more {
  color: #64b5f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.read-more:hover {
  color: #90caf9;
  gap: 0.5rem;
}

/* Single Post Styles */
.back-nav {
  margin-bottom: 2.2rem;
}

.back-nav a {
  color: #b0b0b0;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  font-family: 'Inter', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.back-nav a:hover {
  color: #d0d0d0;
  gap: 0.4rem;
}

.post-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid #333;
}

.post-title {
  font-size: 2.3rem;
  font-weight: 500;
  margin-bottom: 0.8rem;
  color: #ffffff;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  gap: 1.2rem;
  color: #b0b0b0;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 3rem;
}

.post-content p {
  margin-bottom: 1.4rem;
  color: #e0e0e0;
}

.post-footer {
  padding-top: 1.5rem;
  border-top: 1px solid #333;
  cursor: pointer;
}

.back-link {
  color: #b0b0b0;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  font-family: 'Inter', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.back-link:hover {
  color: #d0d0d0;
  gap: 0.4rem;
}

.read-time {
  background: rgba(70, 70, 70, 0.4);
  padding: 0.15rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .blog-container {
    padding: 1.2rem;
  }
  
  .blog-header h1 {
    font-size: 2.2rem;
  }
  
  .post-title {
    font-size: 1.8rem;
  }
  
  .article-card {
    padding: 1.5rem;
  }
  
  .article-title {
    font-size: 1.4rem;
  }
}
</style>
