import { createRouter, createWebHistory } from 'vue-router'
import _RootView from './views/_RootView.vue'

import { ref } from 'vue'

export const isPrintAll = ref(false)
// export const isPrintAll = ref(true)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'articles',
      component: _RootView,
      props: { isPrintAll },
    },
    { path: '/creative', name: 'creative', component: () => import('./views/CreativeView.vue') },
    {
      path: '/creative-3d',
      name: 'creative-3d',
      component: () => import('./views/Creative3DView.vue'),
    },
    {
      path: '/coredump-relearn',
      name: 'coredump-relearn',
      component: () => import('./views/CodeDumpRelearnView.vue'),
    },
    { path: '/profile', name: 'profile', component: () => import('./views/ProfileView.vue') },
  ],
})

export default router
