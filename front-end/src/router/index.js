//import { h, resolveComponent } from 'vue'
//import { createRouter, createWebHashHistory } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout'


//TODO Inserire tutti i titoli delle pagine 

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/login',
    children: [
      {
        path: '/login',
        name: 'login',
        component: () =>
          import('@/views/MyLogin.vue'),
      },
    ],
  },
  {
    path: '/user',
    name: 'User',
    component: DefaultLayout,
    redirect: '/user/dashboard',
    children: [
      {
        path: '/user/dashboard',
        name: 'Dashboard',
        component: () =>
          import('@/views/user/DashboardUser.vue'),
        meta: {
          title: 'Dashboard'
        }
      },
      {
        path: '/user/income',
        name: 'Income',
        component: () =>
          import('@/views/user/IncomeUser.vue'),
      },
      {
        path: '/user/cost',
        name: 'Cost',
        component: () =>
          import('@/views/user/CostUser.vue'),
      },
      {
        path: '/user/wallet',
        name: 'Wallet',
        component: () =>
          import('@/views/user/WalletUser.vue'),
      },
    ],
  },
  {
    path: '/user/setting',
    name: 'Setting',
    component: DefaultLayout,
    redirect: '/user/category',
    children: [
      {
        path: '/user/setting/category',
        name: 'Category',
        component: () =>
          import('@/views/user/setting/CategoryUser.vue'),
      },
      {
        path: '/user/setting/type',
        name: 'Type',
        component: () =>
          import('@/views/user/setting/TypeUser.vue'),
      },
      
    ],
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('@/views/pages/MyPage404')
  }
  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

export default router