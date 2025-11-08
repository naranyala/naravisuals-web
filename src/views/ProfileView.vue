<template>
  <div class="app">
    <header class="card profile">
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" class="avatar">
      <h1>John Doe</h1>
      <p class="title">Frontend Developer & UI Designer</p>
      <p class="contact">sarah.j@example.com | +1 (555) 987-6543 | Los Angeles, CA</p>
    </header>

    <main class="content">
      <section class="card section">
        <h2>About Me</h2>
        <p>Frontend developer with 6 years of experience building responsive web applications. Specialized in Vue.js, React, and modern CSS frameworks.</p>
      </section>

      <section class="card section">
        <h2>Experience</h2>
        <div v-for="job in cv.exp" :key="job.title" class="card job">
          <div class="job-header">
            <div>
              <h3>{{ job.title }}</h3>
              <p>{{ job.company }} • {{ job.loc }}</p>
            </div>
            <span class="date">{{ job.date }}</span>
          </div>
          <ul>
            <li v-for="point in job.points" :key="point">{{ point }}</li>
          </ul>
          <div class="tags">
            <span v-for="tech in job.tech" :key="tech">{{ tech }}</span>
          </div>
        </div>
      </section>

      <section class="card section">
        <h2>Education</h2>
        <div class="card edu">
          <h3>B.S. in Computer Science</h3>
          <p>UCLA • 2015 - 2019</p>
        </div>
      </section>

      <section class="card section">
        <h2>Skills</h2>
        <div class="tags">
          <span v-for="skill in cv.skills" :key="skill">{{ skill }}</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
// Compact CV data
const cv = {
  exp: [
    {
      title: 'Senior Frontend Developer',
      company: 'InnovateTech',
      loc: 'Los Angeles, CA',
      date: '2021 - Present',
      points: [
        'Led Vue 3 migration, improved performance by 35%',
        'Built design system with 50+ components',
        'Mentored 3 junior developers'
      ],
      tech: ['Vue 3', 'TypeScript', 'Tailwind']
    },
    {
      title: 'Frontend Developer',
      company: 'Digital Solutions Inc',
      loc: 'Remote',
      date: '2019 - 2021',
      points: [
        'Developed web apps for 20+ clients',
        'Implemented CI/CD, cut deploy time by 60%'
      ],
      tech: ['React', 'Next.js', 'GraphQL']
    }
  ],
  skills: ['Vue.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Git', 'Figma', 'Jest']
}
</script>

<style>
:root{--bg:#0f172a;--card:#1e293b;--primary:#60a5fa;--text:#f1f5f9;--light:#94a3b8;--border:#334155;--shadow:0 4px 6px -1px rgba(0,0,0,.3);--shadow-lg:0 20px 25px -5px rgba(0,0,0,.3)}
*{box-sizing:border-box;margin:0;padding:0}
body{font:400 1em/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text)}
.app{max-width:900px;margin:0 auto;padding:15px}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow)}
.profile{padding:25px;margin-bottom:20px;text-align:center;box-shadow:var(--shadow-lg)}
.avatar{width:100px;height:100px;border-radius:50%;object-fit:cover;border:2px solid var(--border);margin:0 auto 15px}
h1{font-size:1.5em;margin-bottom:5px}
.title{color:var(--primary);font-weight:600;margin-bottom:10px}
.contact{font-size:.85em;color:var(--light)}
.content{display:flex;flex-direction:column;gap:15px}
.section{padding:20px}
h2{font-size:1.2em;color:var(--primary);margin-bottom:12px}
.job{padding:18px;margin-bottom:15px}
.job-header{display:flex;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px}
.job-header h3{font-size:1em}
.job-header p{color:var(--light);font-size:.85em}
.date{background:var(--bg);color:var(--primary);padding:4px 10px;border-radius:20px;font-size:.8em;font-weight:600}
ul{margin:8px 0 12px 20px}
li{margin-bottom:6px;font-size:.9em;color:var(--light)}
.edu h3{font-size:1em}
.edu p{color:var(--light);font-size:.85em}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.tags span{background:#1e40af;color:#dbeafe;padding:4px 10px;border-radius:20px;font-size:.8em;font-weight:500}
@media(min-width:768px){.app{padding:20px}}
</style>
