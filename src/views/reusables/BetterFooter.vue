
<script setup>
import { ref } from 'vue';

const props = defineProps(["navSections"])
const emit = defineEmits(["change-route"])

// Menu items: array of objects with header and links
const menuItems = ref([
  {
    header: 'Products',
    links: [
      { label: 'Product 1', url: '#' },
      { label: 'Product 2', url: '#' },
      { label: 'Product 3', url: '#' },
    ],
  },
  {
    header: 'Resources',
    links: [
      { label: 'Blog', url: '#' },
      { label: 'Docs', url: '#' },
      { label: 'Tutorials', url: '#' },
    ],
  },
  {
    header: 'Company',
    links: [
      { label: 'About', url: '#' },
      { label: 'Careers', url: '#' },
      { label: 'Contact', url: '#' },
    ],
  },
]);

const handleChangeRoute = (ev, id) => {
  emit("change-route", ev, id)
}

</script>

<template>
  <footer class="footer">
    <div class="footer-content">


      <div
        v-for="(section, index) in props?.navSections"
        :key="index"
        class="footer-section"
      >
        <h3>{{ section.title }}</h3>
        <ul>
          <li v-for="(item, linkIndex) in section.items" :key="linkIndex">

                <button @click="(ev) => handleChangeRoute(ev, item.id)" 
                  :class="{ 'menu-active' : item.isActive }">
                  {{ item.label }}
                </button>

          </li>
        </ul>
      </div>

      <!--
      <div
        v-for="(section, index) in menuItems"
        :key="index"
        class="footer-section"
      >
        <h3>{{ section.header }}</h3>
        <ul>
          <li v-for="(link, linkIndex) in section.links" :key="linkIndex">
            <a :href="link.url">{{ link.label }}</a>
          </li>
        </ul>
      </div>
  -->

    </div>
    <!-- 
    <div class="footer-bottom">
      <pre>{{JSON.stringify(props?.navSections, null, 2) || []}}</pre>
    </div>
    -->
  </footer>
</template>


<style scoped>
.footer {
  background: #1a1a1a;
  color: #fff;
  padding: 40px 20px 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section h3 {
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin-bottom: 8px;
}

.footer-section a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #fff;
}

.footer-bottom {
  text-align: left;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #333;
  font-size: 0.9rem;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>
