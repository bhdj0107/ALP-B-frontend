import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ShoppingView from '../views/ShoppingView.vue'
import PetsitterView from '../views/PetsitterView.vue'
import ManagementView from '../views/ManagementView.vue'
import SignupView from '../views/SignupView.vue'
import LoginView from '../views/LoginView.vue'
import MyPageView from '../views/MyPageView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/shopping',
      name: 'shopping',
      component: ShoppingView
    },
    {
      path: '/petsitter',
      name: 'petsitter',
      component: PetsitterView
    },
    {
      path: '/management',
      name: 'management',
      component: ManagementView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: MyPageView,
      meta: { requiresAuth: true }
    }
  ]
})

export default router 