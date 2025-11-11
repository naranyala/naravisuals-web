<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tweetUrl: { type: String, required: true }
})

const embedHtml = ref('')
const loading = ref(false)
const error = ref('')
const parsed = ref({
  authorName: '',
  authorHandle: '',
  authorAvatar: '',
  contentHtml: '',
  timeText: '',
  tweetLink: props.tweetUrl,
  createdAt: null
})

// Improved sanitizer (safe enough for oEmbed)
const sanitizeHtml = (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  doc.querySelectorAll('script, iframe, style').forEach(el => el.remove())
  doc.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (/^on/i.test(attr.name) || attr.name.startsWith('on')) el.removeAttribute(attr.name)
    })
  })
  return doc.body.innerHTML
}

// Enhanced extraction with avatar support
const extractFromOEmbed = (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blockquote = doc.querySelector('blockquote')

  let contentHtml = ''
  let timeText = ''
  let authorName = 'User'
  let authorHandle = ''
  let authorAvatar = ''
  let createdAt = null

  if (blockquote) {
    const clone = blockquote.cloneNode(true)
    clone.querySelectorAll('script, iframe').forEach(n => n.remove())

    // Extract time from last <a>
    const links = clone.querySelectorAll('a')
    const lastLink = links[links.length - 1]
    if (lastLink) {
      timeText = lastLink.textContent.trim()
      const href = lastLink.getAttribute('href')
      if (href) {
        const match = href.match(/status\/(\d+)/)
        if (match) createdAt = new Date(parseInt(match[1]) * 1000)
      }
      lastLink.remove()
    }

    contentHtml = sanitizeHtml(clone.innerHTML).trim()

    // Look for author in <a> or <p> with twitter.com intent
    const authorLink = doc.querySelector('a[href*="twitter.com/"], a[href*="x.com/"]')
    if (authorLink) {
      const href = authorLink.getAttribute('href') || ''
      const handleMatch = href.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/i)
      if (handleMatch) {
        authorHandle = '@' + handleMatch[1]
      }
    }

    // Try to get avatar from JSON-LD script (modern oEmbed includes it)
    const jsonScript = doc.querySelector('script[type="application/ld+json"]')
    if (jsonScript) {
      try {
        const data = JSON.parse(jsonScript.textContent)
        if (data.author?.image) authorAvatar = data.author.image
        if (data.author?.name) authorName = data.author.name
      } catch (e) {}
    }
  } else {
    contentHtml = sanitizeHtml(html)
  }

  return { contentHtml, timeText, authorName, authorHandle, authorAvatar, createdAt }
}

const fetchOEmbed = async (url) => {
  if (!url) return
  loading.value = true
  error.value = ''
  parsed.value = {
    authorName: '',
    authorHandle: '',
    authorAvatar: '',
    contentHtml: '',
    timeText: '',
    tweetLink: url,
    createdAt: null
  }

  try {
    const res = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1&dnt=true`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    embedHtml.value = data.html || ''
    const extracted = extractFromOEmbed(data.html || '')

    parsed.value = {
      authorName: extracted.authorName || 'User',
      authorHandle: extracted.authorHandle || '',
      authorAvatar: extracted.authorAvatar || `https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png`,
      contentHtml: extracted.contentHtml || '<p>Tweet content unavailable</p>',
      timeText: extracted.timeText || '',
      tweetLink: url,
      createdAt: extracted.createdAt
    }
  } catch (err) {
    console.error('[X Widget] Fetch failed:', err)
    error.value = 'Failed to load post'
  } finally {
    loading.value = false
  }
}

// Format relative time
const formatTime = (date) => {
  if (!date) return 'just now'
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

watch(() => props.tweetUrl, (newUrl) => {
  if (newUrl) fetchOEmbed(newUrl)
}, { immediate: true })
</script>

<template>
  <div class="x-widget" :data-url="parsed.tweetLink">
    <!-- Loading -->
    <div v-if="loading" class="x-loading">
      <div class="x-skeleton-avatar"></div>
      <div class="x-skeleton-lines">
        <div class="x-skeleton-line short"></div>
        <div class="x-skeleton-line"></div>
        <div class="x-skeleton-line"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="x-error">
      <div class="x-avatar placeholder"></div>
      <div class="x-author-info">
        <strong>Post unavailable</strong>
        <span>This post failed to load.</span>
      </div>
    </div>

    <!-- Tweet -->
    <article v-else class="x-post">
      <header class="x-header">
        <img
          :src="parsed.authorAvatar"
          :alt="`${parsed.authorName}'s avatar`"
          class="x-avatar"
          loading="lazy"
          @error="(e) => e.target.src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'"
        />
        <div class="x-meta">
          <div class="x-author">
            <strong class="x-name">{{ parsed.authorName }}</strong>
            <span v-if="parsed.authorHandle" class="x-handle">{{ parsed.authorHandle }}</span>
          </div>
          <a :href="parsed.tweetLink" target="_blank" rel="noopener" class="x-time">
            {{ parsed.createdAt ? formatTime(parsed.createdAt) : 'View on X' }}
          </a>
        </div>
        <a :href="parsed.tweetLink" target="_blank" rel="noopener" class="x-more">⋯</a>
      </header>

      <div class="x-content" v-html="parsed.contentHtml"></div>

      <footer class="x-actions">
        <button class="x-action">
          <svg viewBox="0 0 24 24"><path d="M12 21c-1.9-1.6-4.6-3.8-6.6-6.2C3.9 12.9 3 11.1 3 9.5 3 6.5 5.5 4 8.5 4c1.6 0 3 .8 4.5 2 1.5-1.2 3-2 4.しましょう5-2 3 0 5.5 2.5 5.5 5.5 0 1.6-.9 3.4-2.4 5.3-2 2.4-4.7 4.6-6.6 6.2z"/></svg>
          <span>Reply</span>
        </button>
        <button class="x-action">
          <svg viewBox="0 0 24 24"><path d="M23 3c-1.3-.8-2.8-1.3-4.4-1.5C16.8.9 14.9 2 14 3.7v.5c-3.5.7-6.5 2.5-8.7 5.2-.9 1.1-1.6 2.4-2 3.8-.4 1.4-.5 2.8-.3 4.2.2 1.4.8 2.7 1.7 3.8.9 1.1 2.1 1.9 3.5 2.3.7.2 1.4.3 2.1.3 1.2 0 2.3-.3 3.3-.9.9-.5 1.7-1.3 2.2-2.3.5-1 .7-2.1.7-3.2v-.9c.9.9 2 1.6 3.2 2 .8.3 1.6.4 2.4.4.8 0 1.6-.1 2.3-.4.7-.3 1.3-.7 1.8-1.2.5-.5.9-1.1 1.2-1.8.3-.7.4-1.5.4-2.3 0-.8-.1-1.6-.4-2.3-.3-.7-.7-1.3-1.2-1.8-.5-.5-1.1-.9-1.8-1.2-.7-.3-1.5-.4-2.3-.4z"/></svg>
          <span>Repost</span>
        </button>
        <button class="x-action">
          <svg viewBox="0 0 24 24"><path d="M19.75 11.12c0-4.56-3.32-8.12-7.75-8.12-4.43 0-7.75 3.56-7.75 8.12 0 3.98 2.72 7.31 6.27 8.04.39.07.53-.17.53-.39 0-.19-.01-.83-.01-1.51-2.56.56-3.1-1.09-3.1-1.09-.42-1.06-1.02-1.34-1.02-1.34-.83-.57.06-.56.06-.56 1.38.1 2.11 1.42 2.11 1.42.82 1.41 2.15 1 2.66.77.08-.6.32-1 .58-1.21-2.04-.23-4.18-1.02-4.18-4.54 0-1 .35-1.82 1.03-2.46-.1-.25-.45-1.16.1-2.42 0 0 .84-.27 2.75 1.03a9.59 9.59 0 0 1 2.5-.34c.85.004 1.71.115 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.26.2 2.17.1 2.42.68.64 1.03 1.46 1.03 2.46 0 3.53-2.15 4.3-4.2 4.53.33.29.63.86.63 1.73 0 1.25-.01 2.26-.01 2.57 0 .22.14.48.54.39 3.54-.73 6.26-4.06 6.26-8.04z"/></svg>
          <span>Like</span>
        </button>
        <button class="x-action">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
          <span>Share</span>
        </button>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.x-widget {
  max-width: 560px;
  margin: 16px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.45;
  color: #e7e9ea;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.x-loading {
  padding: 16px;
  background: #000;
}

.x-skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1d1f20;
  animation: pulse 1.5s ease-in-out infinite;
}

.x-skeleton-lines {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.x-skeleton-line {
  height: 12px;
  background: #1d1f20;
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

.x-skeleton-line.short { width: 60%; }

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}

.x-error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: #71767b;
  font-size: 15px;
}

.x-post {
  background: #000;
  padding: 12px 16px 16px;
}

.x-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
  position: relative;
}

.x-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  background: #333;
}

.x-avatar.placeholder {
  background: #1d1f20;
}

.x-meta {
  flex: 1;
  min-width: 0;
}

.x-author {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
}

.x-name {
  font-weight: 700;
  color: #e7e9ea;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.x-handle {
  color: #71767b;
  font-weight: 400;
}

.x-time {
  color: #71767b;
  text-decoration: none;
  font-size: 15px;
}

.x-time:hover {
  text-decoration: underline;
}

.x-more {
  color: #71767b;
  font-size: 20px;
  padding: 4px;
  border-radius: 50%;
  text-decoration: none;
  margin-left: auto;
}

.x-more:hover {
  background: rgba(255, 255, 255, 0.1);
}

.x-content {
  margin: 8px 0 12px;
  color: #e7e9ea;
  word-break: break-word;
  white-space: pre-wrap;
}

.x-content img {
  max-width: 100%;
  border-radius: 12px;
  margin-top: 12px;
  display: block;
}

.x-content a {
  color: #1d9bf0;
  text-decoration: none;
}

.x-content a:hover {
  text-decoration: underline;
}

.x-actions {
  display: flex;
  justify-content: space-between;
  max-width: 425px;
  margin-top: 12px;
}

.x-action {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #71767b;
  padding: 8px 12px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.x-action svg {
  width: 18.75px;
  height: 18.75px;
  fill: currentColor;
}

.x-action:hover {
  background: rgba(29, 155, 240, 0.1);
  color: #1d9bf0;
}

.x-action:hover svg {
  fill: #1d9bf0;
}

/* Mobile */
@media (max-width: 480px) {
  .x-widget { margin: 12px 0; border-radius: 12px; }
  .x-post { padding: 12px; }
  .x-avatar { width: 40px; height: 40px; }
  .x-action { padding: 8px; }
}
</style>
