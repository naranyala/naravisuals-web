// CompactResume.vue (in JSX)
import { defineComponent, computed } from 'vue'
import { css } from 'goober'



export default defineComponent({
  name: 'CompactResume',

  setup() {
    // Resume data (read-only)
    const resumeData = {
      personal: {
        name: 'Alex Chen',
        title: 'Senior Frontend Developer',
        email: 'alex.chen@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        website: 'alexchen.dev',
        summary: 'Frontend developer with 8+ years experience in Vue.js, React, and TypeScript. Passionate about performance optimization and clean code.'
      },
      experiences: [
        {
          title: 'Senior Frontend Engineer',
          company: 'TechCorp Inc.',
          startDate: '2020',
          endDate: 'Present',
          description: 'Led development of customer-facing web apps using Vue.js and TypeScript. Improved performance by 40%.',
          tags: ['Vue.js', 'TypeScript', 'Performance']
        },
        {
          title: 'Frontend Developer',
          company: 'StartupXYZ',
          startDate: '2018',
          endDate: '2020',
          description: 'Built responsive web applications with React and Redux. Implemented pixel-perfect interfaces.',
          tags: ['React', 'Redux', 'Sass']
        }
      ],
      skills: [
        { name: 'Vue.js', level: 95 },
        { name: 'React', level: 90 },
        { name: 'TypeScript', level: 88 },
        { name: 'JavaScript', level: 95 },
        { name: 'HTML/CSS', level: 98 },
        { name: 'Node.js', level: 75 },
        { name: 'Git', level: 92 }
      ],
      education: [
        {
          degree: 'M.S. Computer Science',
          school: 'Stanford University',
          location: 'Stanford, CA',
          years: '2014-2016'
        }
      ],
      languages: [
        { name: 'English', level: 'Native' },
        { name: 'Spanish', level: 'Professional' }
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Scalable platform serving 10k+ daily users',
          tech: ['Vue.js', 'Node.js', 'MongoDB']
        },
        {
          name: 'Design System',
          description: 'Reusable component library for 5+ projects',
          tech: ['React', 'Storybook']
        }
      ]
    }

    // Computed
    const totalExperience = computed(() => {
      const startYear = 2016
      const currentYear = new Date().getFullYear()
      return currentYear - startYear
    })

    const initials = computed(() => {
      return resumeData.personal.name.split(' ').map(n => n[0]).join('')
    })

    return () => (
      <div class={styles.resume}>
        {/* Header */}
        <div class={styles.header}>
          <div class={styles.headerTop}>
            <div class={styles.avatar}>{initials.value}</div>
            <div class={styles.headerInfo}>
              <h1 class={styles.name}>{resumeData.personal.name}</h1>
              <h2 class={styles.title}>{resumeData.personal.title}</h2>
              <div class={styles.contactRow}>
                <div class={styles.contactItem}>📧 {resumeData.personal.email}</div>
                <div class={styles.contactItem}>📱 {resumeData.personal.phone}</div>
                <div class={styles.contactItem}>📍 {resumeData.personal.location}</div>
                <div class={styles.contactItem}>🌐 {resumeData.personal.website}</div>
              </div>
            </div>
          </div>
          <p class={styles.summary}>{resumeData.personal.summary}</p>
        </div>

        {/* Content */}
        <div class={styles.content}>
          {/* Left Column */}
          <div>
            {/* Experience */}
            <div class={styles.section}>
              <h3 class={styles.sectionTitle}>
                <span class={styles.icon}>💼</span>
                Experience ({totalExperience.value}+ years)
              </h3>
              {resumeData.experiences.map((exp, i) => (
                <div key={i} class={styles.experienceItem}>
                  <div class={styles.expHeader}>
                    <h4 class={styles.expTitle}>
                      {exp.title} • <span class={styles.expCompany}>{exp.company}</span>
                    </h4>
                    <span class={styles.expDate}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p class={styles.expDesc}>{exp.description}</p>
                  <div class={styles.tagList}>
                    {exp.tags.map(tag => (
                      <span key={tag} class={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div class={styles.section}>
              <h3 class={styles.sectionTitle}>
                <span class={styles.icon}>🎓</span>
                Education
              </h3>
              {resumeData.education.map((edu, i) => (
                <div key={i} class={styles.educationItem}>
                  <h4 class={styles.eduDegree}>{edu.degree}</h4>
                  <p class={styles.eduSchool}>{edu.school}</p>
                  <p class={styles.eduDate}>{edu.years} • {edu.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Skills */}
            <div class={styles.section}>
              <h3 class={styles.sectionTitle}>
                <span class={styles.icon}>⚡</span>
                Technical Skills
              </h3>
              {resumeData.skills.map((skill, i) => (
                <div key={i} class={styles.skillItem}>
                  <div class={styles.skillRow}>
                    <span class={styles.skillName}>{skill.name}</span>
                    <span style={{ fontSize: '12px', color: '#718096' }}>{skill.level}%</span>
                  </div>
                  <div class={styles.skillBar}>
                    <div
                      class={styles.skillBarFill}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div class={styles.section}>
              <h3 class={styles.sectionTitle}>
                <span class={styles.icon}>🗣️</span>
                Languages
              </h3>
              {resumeData.languages.map((lang, i) => (
                <div key={i} class={styles.languageItem}>
                  <span class={styles.langName}>{lang.name}</span>
                  <span class={styles.langLevel}>{lang.level}</span>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div class={styles.section}>
              <h3 class={styles.sectionTitle}>
                <span class={styles.icon}>🚀</span>
                Notable Projects
              </h3>
              {resumeData.projects.map((project, i) => (
                <div key={i} class={styles.projectItem}>
                  <h4 class={styles.projectName}>{project.name}</h4>
                  <p class={styles.projectDesc}>{project.description}</p>
                  <div class={styles.tagList}>
                    {project.tech.map(tech => (
                      <span key={tech} class={styles.tag}>{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
})


// Component styles
const styles = {
  resume: css`
    max-width: 800px;
    margin: 40px auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
  `,
  header: css`
    background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
    color: white;
    padding: 32px 40px;
  `,
  headerTop: css`
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 16px;
  `,
  avatar: css`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 600;
    color: #1a365d;
    flex-shrink: 0;
  `,
  headerInfo: css`
    flex: 1;
  `,
  name: css`
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 4px 0;
  `,
  title: css`
    font-size: 16px;
    font-weight: 400;
    opacity: 0.9;
    margin: 0 0 12px 0;
  `,
  contactRow: css`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 13px;
    opacity: 0.9;
  `,
  contactItem: css`
    display: flex;
    align-items: center;
    gap: 6px;
  `,
  summary: css`
    font-size: 14px;
    line-height: 1.6;
    margin-top: 16px;
    opacity: 0.95;
  `,
  content: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 32px 40px;
  `,
  section: css`
    margin-bottom: 20px;
  `,
  sectionTitle: css`
    font-size: 16px;
    font-weight: 600;
    color: #1a365d;
    margin: 0 0 12px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  icon: css`
    font-size: 14px;
  `,
  experienceItem: css`
    margin-bottom: 16px;
  `,
  expHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
  `,
  expTitle: css`
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  `,
  expCompany: css`
    color: #2b6cb0;
    font-weight: 500;
  `,
  expDate: css`
    font-size: 12px;
    color: #718096;
    flex-shrink: 0;
  `,
  expDesc: css`
    font-size: 13px;
    line-height: 1.5;
    color: #4a5568;
    margin: 4px 0 0 0;
  `,
  skillItem: css`
    margin-bottom: 8px;
  `,
  skillRow: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  `,
  skillName: css`
    font-size: 13px;
    font-weight: 500;
    color: #2d3748;
  `,
  skillBar: css`
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
  `,
  skillBarFill: css`
    height: 100%;
    background: linear-gradient(90deg, #4299e1, #63b3ed);
    border-radius: 2px;
  `,
  educationItem: css`
    margin-bottom: 12px;
  `,
  eduDegree: css`
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 2px 0;
  `,
  eduSchool: css`
    font-size: 13px;
    color: #2b6cb0;
    margin: 0 0 2px 0;
  `,
  eduDate: css`
    font-size: 12px;
    color: #718096;
  `,
  tagList: css`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  `,
  tag: css`
    background: #edf2f7;
    color: #4a5568;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 500;
  `,
  languageItem: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    &:last-child {
      margin-bottom: 0;
    }
  `,
  langName: css`
    font-size: 13px;
    font-weight: 500;
    color: #2d3748;
  `,
  langLevel: css`
    font-size: 12px;
    color: #718096;
    background: #edf2f7;
    padding: 2px 6px;
    border-radius: 3px;
  `,
  projectItem: css`
    margin-bottom: 12px;
  `,
  projectName: css`
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 2px 0;
  `,
  projectDesc: css`
    font-size: 13px;
    color: #4a5568;
    margin: 0 0 4px 0;
  `
}
