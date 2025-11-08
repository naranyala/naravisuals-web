<template>
  <div class="container">
    <header class="header">
      <img src="https://avatars.githubusercontent.com/u/25216912?s=400&u=5c0780a3a80705b8765c043bcac8d184cda16915&v=4" class="avatar">
      <h1>Sarah Johnson</h1>
      <h2>Frontend Developer & UI Designer</h2>
      <div class="contact">
        sarah.j@example.com | +1 (555) 987-6543 | Los Angeles, CA | linkedin.com/in/sarahj
      </div>
    </header>

    <nav class="tabs">
      <button v-for="tab in tabs" :key="tab" @click="current = tab" :class="{ active: current === tab }">
        {{ tab }}
      </button>
    </nav>

    <main class="content">
      <!-- CV Tab -->
      <div v-if="current === 'CV / Resume'">
        <section>
          <h3>About Me</h3>
          <p>I'm a frontend developer with 6 years of experience creating responsive web applications. I specialize in Vue.js, React, and modern CSS frameworks.</p>
        </section>

        <section>
          <h3>Experience</h3>
          <div v-for="job in cv.exp" :key="job.c" class="job">
            <div class="job-header">
              <div>
                <h4>{{ job.t }}</h4>
                <p>{{ job.c }} • {{ job.l }}</p>
              </div>
              <span>{{ job.d }}</span>
            </div>
            <ul>
              <li v-for="p in job.p" :key="p">{{ p }}</li>
            </ul>
            <div class="tags">
              <span v-for="s in job.s" :key="s">{{ s }}</span>
            </div>
          </div>
        </section>

        <section>
          <h3>Education</h3>
          <div class="edu">
            <h4>B.S. in Computer Science</h4>
            <p>UCLA • 2015 - 2019</p>
          </div>
        </section>

        <section>
          <h3>Skills</h3>
          <div class="tags">
            <span v-for="s in cv.skills" :key="s">{{ s }}</span>
          </div>
        </section>
      </div>

      <!-- Portfolio Tab -->
      <div v-if="current === 'Gallery'">
        <div class="grid">
          <div v-for="pr in portfolio" :key="pr.t" class="card">
            <img :src="pr.i" class="card-img">
            <div class="card-body">
              <h3>{{ pr.t }}</h3>
              <p>{{ pr.d }}</p>
              <div>
                <a v-if="pr.demo" :href="pr.demo" target="_blank">Demo</a>
                <a v-if="pr.code" :href="pr.code" target="_blank">Code</a>
              </div>
              <div class="tags">
                <span v-for="s in pr.s" :key="s">{{ s }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Portfolio Tab -->
      <div v-if="current === 'Resources'">
        <div class="grid">
          <h2>MY RESOURCES</h2>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const current = ref('CV / Resume')
const tabs = ['CV / Resume', 'Gallery', 'Resources']

const cv = {
  exp: [
    {
      t: 'Senior Frontend Developer',
      c: 'InnovateTech',
      l: 'Los Angeles, CA',
      d: '2021 - Present',
      p: ['Led migration from React to Vue 3, improving performance by 35%', 'Built design system with 50+ reusable components', 'Mentored 3 junior developers'],
      s: ['Vue 3', 'TypeScript', 'Tailwind']
    },
    {
      t: 'Frontend Developer',
      c: 'Digital Solutions Inc',
      l: 'Remote',
      d: '2019 - 2021',
      p: ['Developed responsive web apps for 20+ clients', 'Implemented CI/CD pipelines reducing deployment time by 60%'],
      s: ['React', 'Next.js', 'GraphQL']
    }
  ],
  skills: ['Vue.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Git', 'Figma']
}

const portfolio = [
  {
    t: 'TaskFlow Dashboard',
    d: 'Project management dashboard with real-time collaboration and team analytics.',
    i: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop',
    s: ['Vue 3', 'Firebase', 'Tailwind'],
    demo: 'https://taskflow-demo.netlify.app',
    code: 'https://github.com/sarahj/taskflow'
  },
  {
    t: 'E-Commerce Store',
    d: 'Full-stack online store with Stripe payments and inventory management.',
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

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
.header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; }
.avatar { border-radius: 50%; width: 120px; height: 120px; object-fit: cover; margin-bottom: 15px; }
h1 { margin: 0; font-size: 2em; }
h2 { margin: 5px 0; color: #666; font-size: 1.2em; font-weight: normal; }
.contact { margin-top: 15px; font-size: 0.9em; color: #555; }
.tabs { display: flex; gap: 10px; margin-bottom: 30px; }
.tabs button { flex: 1; padding: 12px; border: none; background: #f0f0f0; border-radius: 6px; cursor: pointer; font-size: 1em; transition: all 0.3s; }
.tabs button.active { background: #0ea5e9; color: white; }
.content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
section { margin-bottom: 30px; }
h3 { color: #0ea5e9; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; }
.job { margin-bottom: 25px; padding-left: 15px; border-left: 3px solid #0ea5e9; }
.job-header { display: flex; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; }
.job-header h4 { margin: 0; font-size: 1.1em; }
.job-header p { margin: 5px 0; color: #666; font-weight: 500; }
.job-header span { color: #888; font-size: 0.9em; }
.job ul { margin: 10px 0; padding-left: 20px; color: #555; }
.job li { margin-bottom: 5px; }
.edu { margin-bottom: 15px; }
.edu h4 { margin: 0; }
.edu p { margin: 5px 0; color: #666; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.tags span { background: #e0f2fe; color: #0ea5e9; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; }
.card { background: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
.card-img { width: 100%; height: 180px; object-fit: cover; }
.card-body { padding: 20px; }
.card-body h3 { margin: 0 0 10px 0; border: none; padding: 0; }
.card-body p { margin: 0 0 15px 0; color: #555; font-size: 0.95em; }
.card-body a { background: #0ea5e9; color: white; padding: 5px 12px; border-radius: 4px; font-size: 0.85em; text-decoration: none; margin-right: 8px; display: inline-block; }
@media (max-width: 768px) { .container { padding: 10px; } .content { padding: 20px; } }
</style>
