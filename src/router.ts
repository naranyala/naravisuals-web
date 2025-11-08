import { createRouter, createWebHistory } from 'vue-router'
import _RootView from './views/_RootView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root-article',
      component: _RootView,
    },
    { path: '/creative', name: 'creative', component: () => import('./views/CreativeView.vue') },
    {
      path: '/creative-3d',
      name: 'creative-3d',
      component: () => import('./views/Creative3DView.vue'),
    },
    { path: '/gh-repos', name: 'gh-repos', component: () => import('./views/GhReposView.vue') },
    { path: '/profile', name: 'profile', component: () => import('./views/ProfileView.vue') },
  ],
})

export default router
