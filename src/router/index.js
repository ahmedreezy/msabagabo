import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { isSupabaseConfigured } from '../lib/supabase'
import { cmsAuth } from '../services/cms'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/departments',
      name: 'departments',
      component: () => import('../views/DepartmentsView.vue'),
    },
    {
      path: '/departments/:slug',
      name: 'department-detail',
      component: () => import('../views/DepartmentDetailView.vue'),
    },
    {
      path: '/services',
      name: 'services',
      component: () => import('../views/ServicesView.vue'),
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue'),
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('../views/NewsView.vue'),
    },
    {
      path: '/opportunities',
      name: 'opportunities',
      component: () => import('../views/OpportunitiesView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/AdminLoginView.vue'),
      meta: { admin: true, guestOnly: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminDashboardView.vue'),
      meta: { admin: true, requiresAuth: true },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/GovernmentInfoView.vue'),
      meta: { title: 'Privacy statement', eyebrow: 'Legal information', kind: 'privacy' },
    },
    {
      path: '/accessibility',
      name: 'accessibility',
      component: () => import('../views/GovernmentInfoView.vue'),
      meta: { title: 'Accessibility', eyebrow: 'Using this website', kind: 'accessibility' },
    },
    {
      path: '/disclaimer',
      name: 'disclaimer',
      component: () => import('../views/GovernmentInfoView.vue'),
      meta: { title: 'Disclaimer', eyebrow: 'Legal information', kind: 'disclaimer' },
    },
    {
      path: '/site-map',
      name: 'site-map',
      component: () => import('../views/GovernmentInfoView.vue'),
      meta: { title: 'Site map', eyebrow: 'Website navigation', kind: 'sitemap' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 24, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (!to.meta.admin) return true
  if (!isSupabaseConfigured) return to.name === 'admin-login' ? true : { name: 'admin-login' }

  try {
    const session = await cmsAuth.getSession()
    if (to.meta.requiresAuth && !session) return { name: 'admin-login' }
    if (to.meta.guestOnly && session) return { name: 'admin' }
    return true
  } catch {
    return to.meta.requiresAuth ? { name: 'admin-login' } : true
  }
})

export default router
