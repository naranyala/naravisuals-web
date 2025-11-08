import { createRouter, createWebHistory } from 'vue-router'
import _RootView from './views/_RootView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: _RootView,
    },
    { path: '/creative', name: 'creative', component: () => import('./views/CreativeView.vue') },
    { path: '/profile', name: 'profile', component: () => import('./views/ProfileView.vue') },
  ],
})

export default router
