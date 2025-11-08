<template>
  <div class="app">
    <header class="profile-card">
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" class="avatar">
      <h1>Sarah Johnson</h1>
      <p class="title">Frontend Developer & UI Designer</p>
      <div class="contact">
        sarah.j@example.com | +1 (555) 987-6543 | Los Angeles, CA
      </div>
    </header>

    <main class="content">
      <!-- CV Tab -->
      <section v-if="tab === 'CV'" class="section-card">
        <h2>About Me</h2>
        <p>Frontend developer with 6 years of experience building responsive web applications. Specialized in Vue.js, React, and modern CSS frameworks.</p>
      </section>

      <section v-if="tab === 'CV'" class="section-card">
        <h2>Experience</h2>
        <div v-for="job in cv.exp" :key="job.t" class="job-card">
          <div class="job-header">
            <div>
              <h3>{{ job.t }}</h3>
              <p>{{ job.c }} • {{ job.l }}</p>
            </div>
            <span class="date">{{ job.d }}</span>
          </div>
          <ul>
            <li v-for="p in job.p" :key="p">{{ p }}</li>
          </ul>
          <div class="tag-row">
            <span v-for="s in job.s" :key="s">{{ s }}</span>
          </div>
        </div>
      </section>

      <section v-if="tab === 'CV'" class="section-card">
        <h2>Education</h2>
        <div class="edu-card">
          <h3>B.S. in Computer Science</h3>
          <p>UCLA • 2015 - 2019</p>
        </div>
      </section>

      <section v-if="tab === 'CV'" class="section-card">
        <h2>Skills</h2>
        <div class="tag-row">
          <span v-for="s in cv.skills" :key="s">{{ s }}</span>
        </div>
      </section>

      <!-- Portfolio Tab -->
      <section v-if="tab === 'Portfolio'" class="portfolio-grid">
        <div v-for="pr in portfolio" :key="pr.t" class="project-card">
          <img :src="pr.i" class="project-img">
          <div class="project-body">
            <h3>{{ pr.t }}</h3>
            <p>{{ pr.d }}</p>
            <div class="project-links">
              <a v-if="pr.demo" :href="pr.demo" target="_blank">Demo</a>
              <a v-if="pr.code" :href="pr.code" target="_blank">Code</a>
            </div>
            <div class="tag-row">
              <span v-for="s in pr.s" :key="s">{{ s }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <nav class="bottom-tabs">
      <button v-for="t in ['CV', 'Portfolio']" :key="t" @click="tab = t" :class="{ active: tab === t }">
        {{ t }}
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref('CV')

const cv = {
  exp: [
    {
      t: 'Senior Frontend Developer',
      c: 'InnovateTech',
      l: 'Los Angeles, CA',
      d: '2021 - Present',
      p: ['Led Vue 3 migration, improved performance by 35%', 'Built design system with 50+ components', 'Mentored 3 junior developers'],
      s: ['Vue 3', 'TypeScript', 'Tailwind']
    },
    {
      t: 'Frontend Developer',
      c: 'Digital Solutions Inc',
      l: 'Remote',
      d: '2019 - 2021',
      p: ['Developed web apps for 20+ clients', 'Implemented CI/CD, cut deploy time by 60%'],
      s: ['React', 'Next.js', 'GraphQL']
    }
  ],
  skills: ['Vue.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Git', 'Figma', 'Jest']
}

const portfolio = [
  {
    t: 'TaskFlow Dashboard',
    d: 'Project management tool with real-time collaboration and team analytics.',
    i: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop',
    s: ['Vue 3', 'Firebase', 'Tailwind'],
    demo: 'https://taskflow-demo.netlify.app',
    code: 'https://github.com/sarahj/taskflow'
  },
  {
    t: 'E-Commerce Store',
    d: 'Full-stack store with Stripe payments and inventory management.',
    i: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop',
    s: ['React', 'Node.js', 'MongoDB'],
    demo: 'https://shop-sarahj.netlify.app',
    code: 'https://github.com/sarahj/ecommerce'
  },
  {
    t: 'Weather App',
    d: 'Beautiful weather dashboard with 7-day forecast and maps.',
    i: 'https://images.unsplash.com/photo-1504608524841-42dd6f7dee52?w=400&h=250&fit=crop',
    s: ['Vue', 'OpenWeather API', 'Mapbox'],
    demo: 'https://weather-sarahj.netlify.app',
    code: 'https://github.com/sarahj/weather-app'
  }
]
</script>

<style>
:root {
  --bg: #0f172a;
  --card: #1e293b;
  --primary: #60a5fa;
  --text: #f1f5f9;
  --text-light: #94a3b8;
  --border: #334155;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }

.app { max-width: 100%; padding: 15px; padding-bottom: 80px; }

.profile-card, .section-card, .job-card, .edu-card, .project-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.profile-card { padding: 25px; margin-bottom: 20px; box-shadow: var(--shadow-lg); text-align: center; }
.avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 2px solid var(--border); }
h1 { font-size: 1.5em; margin-bottom: 5px; }
.title { color: var(--primary); font-weight: 600; margin-bottom: 10px; }
.contact { font-size: 0.85em; color: var(--text-light); line-height: 1.4; }

.content { display: flex; flex-direction: column; gap: 15px; }

.section-card, .edu-card { padding: 20px; }
h2 { font-size: 1.2em; color: var(--primary); margin-bottom: 12px; }

.job-card { padding: 18px; margin-bottom: 15px; }
.job-header { display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 10px; }
.job-header h3 { font-size: 1em; }
.job-header p { color: var(--text-light); font-size: 0.85em; }
.date { background: var(--bg); color: var(--primary); padding: 4px 10px; border-radius: 20px; font-size: 0.8em; font-weight: 600; }

ul { margin: 8px 0 12px; padding-left: 20px; }
li { margin-bottom: 6px; font-size: 0.9em; color: var(--text-light); }

.edu-card h3 { font-size: 1em; }
.edu-card p { color: var(--text-light); font-size: 0.85em; }

.tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.tag-row span { background: #1e40af; color: #dbeafe; padding: 4px 10px; border-radius: 20px; font-size: 0.8em; font-weight: 500; }

.portfolio-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
.project-card { overflow: hidden; }
.project-img { width: 100%; height: 160px; object-fit: cover; border-bottom: 1px solid var(--border); }
.project-body { padding: 18px; }
.project-body h3 { font-size: 1em; margin-bottom: 8px; }
.project-body p { font-size: 0.85em; color: var(--text-light); margin-bottom: 12px; }
.project-links { margin-bottom: 12px; }
.project-links a { background: var(--primary); color: #0f172a; padding: 5px 12px; border-radius: 6px; text-decoration: none; font-size: 0.8em; margin-right: 8px; display: inline-block; font-weight: 600; }

.bottom-tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card);
  border-top: 1px solid var(--border);
  display: flex;
  padding: 10px;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.bottom-tabs button {
  flex: 1;
  padding: 12px;
  border: none;
  background: var(--bg);
  border-radius: 8px;
  margin: 0 5px;
  color: var(--text-light);
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.bottom-tabs button.active { background: var(--primary); color: #0f172a; box-shadow: var(--shadow); }

@media (min-width: 600px) {
  .app { max-width: 900px; margin: 20px auto; padding-bottom: 100px; }
  .portfolio-grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
}

@media (min-width: 768px) {
  .bottom-tabs { display: none; }
  .app { padding-bottom: 20px; }
}
</style>
