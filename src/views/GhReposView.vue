<script setup>
// Flat data source with external URLs
const flatProjects = [
  {
    title: "Project Alpha",
    type: "Web Development",
    rating: 4.2,
    url: "https://example.com/project-alpha"
  },
  {
    title: "Project Beta",
    type: "Mobile App",
    rating: 4.9,
    url: "https://example.com/project-beta"
  },
  {
    title: "Project Gamma",
    type: "Web Development",
    rating: 3.5,
    url: "https://example.com/project-gamma"
  },
  {
    title: "Project Delta",
    type: "UI/UX Design",
    rating: 4.6,
    url: "https://example.com/project-delta"
  },
  {
    title: "Project Epsilon",
    type: "Machine Learning",
    rating: 4.1,
    url: "https://example.com/project-epsilon"
  },
  {
    title: "Project Zeta",
    type: "Data Science",
    rating: 4.8,
    url: "https://example.com/project-zeta"
  },
];

// Grouping logic
const groupsMap = {
  5: { title: "Top Rated", items: [] },
  4: { title: "Highly Recommended", items: [] },
  3: { title: "Good Effort", items: [] }
};

// Populate groups
flatProjects.forEach(item => {
  if (item.rating >= 4.5) {
    groupsMap[5].items.push(item);
  } else if (item.rating >= 3.5) {
    groupsMap[4].items.push(item);
  } else {
    groupsMap[3].items.push(item);
  }
});

const sortedGroups = [groupsMap[5], groupsMap[4], groupsMap[3]].filter(g => g.items.length > 0);

// Open external link in new tab
const openLink = (url) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
</script>

<template>
  <div class="projects-container">
    <h1 class="section-title">Our Projects</h1>
    <div class="projects-grid">
      <div v-for="(group, groupIndex) in sortedGroups" :key="groupIndex" class="project-group">
        <h2 class="group-title">{{ group.title }}</h2>
        <div class="group-cards">
          <div 
            v-for="(item, itemIndex) in group.items" 
            :key="itemIndex" 
            class="project-card"
            @click="openLink(item.url)"
            role="link"
            tabindex="0"
            @keydown.enter="openLink(item.url)"
          >
            <h3 class="project-name">{{ item.title }}</h3>
            <p class="project-type">{{ item.type }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  background-color: #121212;
  color: #fff;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}

.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.project-group {
  padding: 1rem;
}

.group-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.group-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.project-card {
  background-color: #1e1e1e;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.7);
}

.project-card:focus {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

.project-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.project-type {
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 0;
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
  .projects-container {
    padding: 1rem;
  }
  .section-title {
    font-size: 1.5rem;
  }
  .group-cards {
    grid-template-columns: 1fr;
  }
}
</style>
