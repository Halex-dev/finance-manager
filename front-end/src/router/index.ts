import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

//import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'

//import RouteViewComponent from '../layouts/RouterBypass.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'dashboard' },
  },
  {
    name: 'admin',
    path: '/',
    component: AppLayout,
    redirect: { name: 'dashboard' },
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/admin/dashboard/Dashboard.vue'),
      },
      {
        name: 'transactions',
        path: 'transactions',
        component: () => import('../pages/transactions/TransactionsPage.vue'),
      },
      {
        name: 'amortizations',
        path: 'amortizations',
        component: () => import('../pages/amortizations/AmortizationsPage.vue'),
      },
      {
        name: 'wallets',
        path: 'wallets',
        component: () => import('../pages/wallets/WalletsPage.vue'),
      },
      {
        name: 'categories',
        path: 'categories',
        component: () => import('../pages/categories/CategoriesPage.vue'),
      },
      {
        name: 'settings',
        path: 'settings',
        component: () => import('../pages/settings/Settings.vue'),
      },
    ],
  },
  {
    name: '404',
    path: '/404',
    component: () => import('../pages/404.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // For some reason using documentation example doesn't scroll on page navigation.
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      window.scrollTo(0, 0)
    }
  },
  routes,
})

export default router
