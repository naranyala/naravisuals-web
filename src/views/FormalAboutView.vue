<template>
  <div class="profile-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading profile...</p>
    </div>

    <!-- Profile Content -->
    <div v-else class="profile-content">
      <!-- Header -->
      <div class="header">
        <div class="name-title">
          <h1>{{ profile.name }}</h1>
          <h2>{{ profile.title }}</h2>
          <p class="company">{{ profile.company }}</p>
        </div>
        <div class="contact-info">
          <p>{{ profile.email }}</p>
          <p>{{ profile.location }}</p>
          <div class="social-links">
            <span v-if="profile.socialLinks.linkedin">LinkedIn</span>
            <span v-if="profile.socialLinks.github">GitHub</span>
            <span v-if="profile.socialLinks.twitter">Twitter</span>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="section">
        <p class="bio">{{ profile.bio }}</p>
      </div>

      <!-- Skills -->
      <div class="section">
        <h3>Skills</h3>
        <div class="skills">
          <span v-for="(skill, index) in profile.skills" :key="index" class="skill">
            {{ skill }}
          </span>
        </div>
      </div>

      <!-- Experience -->
      <div class="section">
        <h3>Experience</h3>
        <div v-for="exp in profile.experience" :key="exp.id" class="experience">
          <div class="exp-header">
            <strong>{{ exp.title }}</strong>
            <span class="period">{{ exp.period }}</span>
          </div>
          <div class="exp-company">{{ exp.company }}</div>
          <div class="exp-desc">{{ exp.description }}</div>
        </div>
      </div>

      <!-- Education -->
      <div class="section">
        <h3>Education</h3>
        <div v-for="edu in profile.education" :key="edu.id" class="education">
          <div class="edu-header">
            <strong>{{ edu.degree }}</strong>
            <span class="year">{{ edu.year }}</span>
          </div>
          <div class="edu-institution">{{ edu.institution }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Reactive data
const profile = ref({})
const loading = ref(true)

// Profile data
const profileData = {
  name: "Sarah Chen",
  title: "Senior Frontend Developer",
  company: "Digital Solutions Inc.",
  email: "sarah.chen@example.com",
  location: "New York, NY",
  bio: "Passionate frontend developer with 6+ years of experience creating responsive web applications. Specialized in Vue.js and modern JavaScript ecosystems.",
  socialLinks: {
    linkedin: "https://linkedin.com/in/sarahchen",
    github: "https://github.com/sarahchen",
    twitter: "https://twitter.com/sarahchen"
  },
  skills: ["Vue.js", "JavaScript", "TypeScript", "CSS3", "HTML5", "Responsive Design", "UI/UX", "Git"],
  experience: [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "Digital Solutions Inc.",
      period: "2021 - Present",
      description: "Lead frontend development for client projects using Vue.js and Nuxt.js."
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "WebTech Startup",
      period: "2019 - 2021",
      description: "Developed and maintained multiple web applications with Vue.js."
    }
  ],
  education: [
    {
      id: 1,
      degree: "B.S. Computer Science",
      institution: "University of Technology",
      year: "2017"
    }
  ]
}

// Simulate data loading
onMounted(() => {
  setTimeout(() => {
    profile.value = profileData
    loading.value = false
  }, 400)
})
</script>

<style scoped>
/* Base Styles */
.profile-view {
  max-width: 210mm; /* A4 width */
  min-height: 100vh;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
  background: #fff;
}

/* Loading */
.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #000;
}

.name-title h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #000;
}

.name-title h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
}

.company {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.contact-info {
  text-align: right;
  font-size: 12px;
}

.contact-info p {
  margin: 0 0 4px 0;
  color: #333;
}

.social-links {
  margin-top: 8px;
}

.social-links span {
  display: inline-block;
  margin-left: 8px;
  font-size: 11px;
  color: #666;
}

.social-links span:first-child {
  margin-left: 0;
}

/* Sections */
.section {
  margin-bottom: 20px;
  page-break-inside: avoid;
}

.section h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 12px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid #ddd;
  color: #000;
}

/* Bio */
.bio {
  margin: 0;
  color: #333;
  line-height: 1.5;
}

/* Skills */
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill {
  padding: 2px 8px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 2px;
  font-size: 12px;
  color: #333;
}

/* Experience & Education */
.experience,
.education {
  margin-bottom: 16px;
  page-break-inside: avoid;
}

.experience:last-child,
.education:last-child {
  margin-bottom: 0;
}

.exp-header,
.edu-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.exp-header strong,
.edu-header strong {
  font-weight: 600;
  color: #000;
}

.period,
.year {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  margin-left: 12px;
}

.exp-company,
.edu-institution {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.exp-desc {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  margin: 0;
}

/* Print Styles */
@media print {
  .profile-view {
    padding: 15mm;
    margin: 0;
    max-width: none;
    box-shadow: none;
    background: #fff;
  }

  .header {
    border-bottom-color: #000;
  }

  .section h3 {
    border-bottom-color: #000;
  }

  .skill {
    background: #fff;
    border-color: #000;
  }

  /* Avoid breaking inside important sections */
  .section {
    page-break-inside: avoid;
  }

  /* Ensure good contrast for printing */
  * {
    color: #000 !important;
    background: #fff !important;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .profile-view {
    padding: 16px;
    max-width: none;
  }

  .header {
    flex-direction: column;
    gap: 12px;
  }

  .contact-info {
    text-align: left;
  }

  .exp-header,
  .edu-header {
    flex-direction: column;
    gap: 2px;
  }

  .period,
  .year {
    margin-left: 0;
  }
}

/* Desktop Optimization */
@media (min-width: 1200px) {
  .profile-view {
    padding: 40px;
  }
}
</style>
