<template>
  <div class="profile-card">
    <!-- Top Row: Avatar + Info -->
    <div class="profile-top">
      <div class="avatar-container">
        <img
          :src="profile.avatar"
          :alt="profile.name"
          class="avatar"
        />
        <span :class="['status', profile.status]" />
      </div>

      <div class="profile-info">
        <h1 class="name">{{ profile.name }}</h1>
        <p class="title">{{ profile.title }}</p>
      </div>
    </div>

    <!-- Contact Row -->
    <div class="contact-row">
      <a :href="`mailto:${profile.email}`" class="contact-item">
        <span class="contact-icon">✉️</span>
        <span>{{ profile.email }}</span>
      </a>
      <span class="contact-item">
        <span class="contact-icon">📍</span>
        <span>{{ profile.location }}</span>
      </span>
    </div>

    <!-- Links -->
    <div class="links">
      <a
        v-for="link in profile.links"
        :key="link.name"
        :href="link.url"
        target="_blank"
        class="link-btn"
      >
        <span class="link-icon">{{ link.icon }}</span>
        <span>{{ link.name }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const profile = reactive({
  name: 'Alex Johnson',
  title: 'Senior Frontend Developer',
  email: 'alex.johnson@example.com',
  location: 'San Francisco, CA',
  avatar: '/api/placeholder/150/150',
  status: 'online',
  links: [
    { name: 'Website', url: 'https://example.com', icon: '🌐' },
    { name: 'GitHub', url: 'https://github.com', icon: '💻' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: '👔' },
    { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
    { name: 'Portfolio', url: 'https://portfolio.example.com', icon: '🎨' }
  ]
})
</script>

<style scoped>
.profile-card {
  width: 100%;
  background: linear-gradient(to bottom right, #0f172a, #1e293b);
  padding: 1.25rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: #e2e8f0;
}

/* Top Section */
.profile-top {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #475569;
}

.status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid #0f172a;
}

.status.online { background-color: #10b981; }
.status.offline { background-color: #6b7280; }
.status.away { background-color: #f59e0b; }

.profile-info {
  min-width: 0;
  flex: 1;
}

.name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0.125rem 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Contact Row */
.contact-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.5);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
}

a.contact-item:hover {
  color: #e2e8f0;
}

.contact-icon {
  font-size: 0.875rem;
}

/* Links */
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #cbd5e1;
  background: #1e293b;
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
}

.link-btn:hover {
  background: #334155;
}

.link-icon {
  font-size: 0.875rem;
}

/* Mobile */
@media (max-width: 480px) {
  .profile-card {
    padding: 1rem;
  }
  
  .contact-row {
    flex-direction: column;
  }
}
</style>
