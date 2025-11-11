
<script setup>

import IconVue from "./icons/IconVue.vue"
import IconInkscape from "./icons/IconInkscape.vue"
import IconBlender from "./icons/IconBlender.vue"
import IconLinux from "./icons/IconLinux.vue"

const cv = {
  exp: [
    {
      title: 'Senior Frontend Developer',
      company: 'InnovateTech',
      loc: 'Los Angeles, CA',
      date: '2021 - Present',
      points: [
        'Led Vue 3 migration for 50k+ MAU app → improved Lighthouse score 35%',
        'Built reusable component library (50+ components) used by 5 teams',
        'Mentored 3 junior developers → 100% retention rate'
      ],
      tech: ['Vue 3', 'TypeScript', 'Pinia', 'Tailwind', 'Vitest']
    },
    {
      title: 'Frontend Developer',
      company: 'Digital Solutions Inc',
      loc: 'Remote',
      date: '2019 - 2021',
      points: [
        'Developed 20+ client projects using React + Next.js',
        'Implemented CI/CD pipeline → reduced deployment time 60%',
        'Integrated GraphQL APIs with Apollo Client'
      ],
      tech: ['React', 'Next.js', 'GraphQL', 'Apollo', 'Jest']
    }
  ],
  skills: ['vue.js', 'inkscape', 'blender']
}

const actionSearchGoogle = (keyword) => {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
  window.open(searchUrl, '_blank');
}

</script>

<template>
  <div class="resume">
    <header class="header">
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face" alt="John Doe" class="photo">
      <div class="header-text">
        <h1>John Doe</h1>
        <p class="job-title">Frontend Developer & UI Designer</p>
        <p class="contact-info">sarah.j@example.com │ +1 (555) 987-6543 │ Los Angeles, CA</p>
      </div>
    </header>

    <main class="main">
      <section class="section">
        <h2>About Me</h2>
        <p class="paragraph">
          Frontend developer with 6 years of experience building responsive web applications. 
          Specialized in Vue.js, React, and modern CSS frameworks. Passionate about clean code and pixel-perfect UI.
        </p>
      </section>

      <section class="section">
        <h2>Experience</h2>
        <article v-for="(job, i) in cv.exp" :key="job.title" class="job" :class="{ 'page-break': i === 1 }">
          <div class="job-head">
            <div>
              <h3 class="job-role">{{ job.title }}</h3>
              <p class="job-place">{{ job.company }} <span class="gray">│ {{ job.loc }}</span></p>
            </div>
            <span class="job-period">{{ job.date }}</span>
          </div>
          <ul class="job-desc">
            <li v-for="point in job.points" :key="point">{{ point }}</li>
          </ul>
          <div class="job-stack screen-only">
            <span v-for="tech in job.tech" :key="tech" class="tag">{{ tech }}</span>
          </div>
        </article>
      </section>

      <section class="section">
        <h2>Education</h2>
        <div class="edu">
          <h3>B.S. in Computer Science</h3>
          <p>UCLA │ 2015 - 2019</p>
        </div>
      </section>

      <section class="section">
        <h2>Skills</h2>
        <div class="skills-grid">
          <div class="skill-item" @click="actionSearchGoogle('Vue.js')">
            <IconVue :size="60"/><br/>{{"Vue.js"}}
          </div>
          <div class="skill-item" @click="actionSearchGoogle('Inkscape Editor')">
            <IconInkscape :size="60"/><br/>{{"Inkscape"}}
          </div>
          <div class="skill-item" @click="actionSearchGoogle('Blender 3D')">
            <IconBlender :size="60"/><br/>{{"Blender"}}
          </div>
          <div class="skill-item" @click="actionSearchGoogle('Linux')">
            <IconLinux :size="60"/><br/>{{"Linux"}}
          </div>

          <!-- <span v-for="skill in cv.skills" :key="skill" class="skill-item" -->
          <!--   :class=""> -->
          <!--   <div v-if="skill == 'vue.js'"><IconVue :size="60"/><br/>{{skill}}</div> -->
          <!--   <div v-if="skill == 'inkscape'"><IconInkscape :size="60"/><br/>{{skill}}</div> -->
          <!--   <div v-else class="hidden"></div> -->
          <!-- </span> -->
        </div>
      </section>
    </main>
  </div>
</template>


<style scoped>


.hidden { display: none; }

/* ============================================================= */
/* DARK THEME – WEB VIEW (PERFECT CONTRAST, INDONESIA 2025)    */
/* ============================================================= */
@media screen {
  :root {
    --bg: #0f172a;
    --surface: #1e293b;
    --primary: #38bdf8;
    --text: #f8fafc;
    --text-soft: #cbd5e1;
    --border: #334155;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    background: var(--bg); 
    color: var(--text); 
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    line-height: 1.6;
  }

  .resume {
    max-width: 820px;
    margin: 40px auto;
    padding: 40px;
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }

  .print-only-screen {
    text-align: right;
    margin-bottom: 24px;
  }
  .btn-print {
    background: var(--primary);
    color: #000;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
  }
  .btn-print:hover { background: #0ea5e9; }

  .header {
    display: flex;
    gap: 24px;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 3px solid var(--primary);
  }
  .photo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid var(--primary);
    flex-shrink: 0;
  }
  .header-text h1 {
    font-size: 2.5rem;
    margin-bottom: 8px;
    font-weight: 800;
    text-align: left;
  }
  .job-title {
    font-size: 1.3rem;
    color: var(--primary);
    font-weight: 600;
  }
  .contact-info {
    font-size: 1rem;
    color: var(--text-soft);
    margin-top: 8px;
  }

  .section h2 {
    font-size: 1.5rem;
    color: var(--primary);
    margin: 32px 0 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--primary);
    font-weight: 700;
  }

  .paragraph {
    font-size: 1.05rem;
    color: var(--text-soft);
    border-radius: 10px;
    border: 1px solid gray;
    padding: 20px;
  }

  .job {
    margin-bottom: 28px;
    /* padding-bottom: 20px; */
    padding: 20px;
    /* border-bottom: 1px dashed var(--border); */
    border-radius: 10px;
    border: 1px solid gray;
  }
  .job-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;
  }
  .job-role {
    font-size: 1.25rem;
    font-weight: 700;
  }
  .job-place {
    font-size: 1rem;
    color: var(--text-soft);
  }
  .gray { color: #94a3b8; }
  .job-period {
    background: var(--primary);
    color: white;
    padding: 6px 14px;
    border-radius: 999px;
    font-weight: bold;
    font-size: 1rem;
    border-radius: 10px;
    border: 1px solid gray;
  }
  .job-desc {
    margin: 12px 0 0 24px;
    color: var(--text-soft);
  }
  .job-desc li {
    margin-bottom: 6px;
    position: relative;
  }
  .job-desc li::marker { color: var(--primary); }

  .job-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  .tag {
    background: #0369a1;
    color: #e0f2fe;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .edu {
    border-radius: 10px;
    border: 1px solid gray;
    padding: 20px;
  }
  .edu h3 { font-size: 1.2rem; font-weight: 700; }
  .edu p { color: var(--text-soft); }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 20px;
    margin-top: 16px;
    font-size: 1rem;
  }
  .skill-item {
    /* background: #334155; */
    border: 1px solid gray;
      border-radius: 20px;
    padding: 8px 12px;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;

    &:hover { background: gray; text: white; }
  }
}

/* ============================================================= */
/* PRINT MODE – RECRUITER & ATS PERFECT (BLACK & WHITE A4)     */
/* ============================================================= */
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm 12mm;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    background: white !important;
    color: #000 !important;
    font-family: Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
    line-height: 1.5 !important;
  }

  .print-only-screen, .screen-only { display: none !important; }

  .resume {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .header {
    display: flex !important;
    gap: 20px !important;
    padding-bottom: 15px !important;
    border-bottom: 3px solid #000 !important;
    margin-bottom: 20px !important;
  }
  .photo {
    width: 100px !important;
    height: 100px !important;
    border: 3px solid #000 !important;
  }
  .header-text h1 {
    font-size: 28pt !important;
    font-weight: bold !important;
  }
  .job-title {
    font-size: 16pt !important;
    color: #000 !important;
  }
  .contact-info {
    font-size: 11pt !important;
  }

  .section h2 {
    font-size: 16pt !important;
    color: #000 !important;
    border-bottom: 2px solid #000 !important;
    padding-bottom: 5px !important;
    margin: 25px 0 12px 0 !important;
    page-break-after: avoid !important;
  }

  .paragraph, .job-desc li, .edu p {
    font-size: 11pt !important;
    color: #000 !important;
  }

  .job {
    break-inside: avoid;
    page-break-inside: avoid;
    margin-bottom: 18px !important;
    border-bottom: 1px solid #333 !important;
  }
  .job-head { margin-bottom: 8px !important; }
  .job-role { font-size: 13pt !important; font-weight: bold !important; }
  .job-place { font-size: 11pt !important; }
  .job-period {
    background: #000 !important;
    color: white !important;
    padding: 4px 10px !important;
    border-radius: 0 !important;
    font-weight: bold !important;
  }
  .job-desc { margin: 8px 0 0 20px !important; }

  .skills-grid {
    column-count: 2;
    column-gap: 25mm;
    orphans: 3;
    widows: 3;
  }
  .skill-item {
    background: none !important;
    padding: 0 !important;
    text-align: left !important;
    break-inside: avoid;
  }

  .page-break { page-break-before: always; }
}
</style>
