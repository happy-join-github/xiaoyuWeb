import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('../views/Welcome.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/chat',
    name: 'ChatRoom',
    component: () => import('../views/chat/ChatRoom.vue'),
  },
  {
    path: '/treehole',
    name: 'Treehole',
    component: () => import('../views/treehole/Treehole.vue'),
  },
  {
    path: '/cards',
    name: 'Cards',
    component: () => import('../views/cards/Cards.vue'),
  },
  {
    path: '/cards/detail',
    name: 'CardDetail',
    component: () => import('../views/cards/CardDetail.vue'),
  },
  {
    path: '/mood/checkin',
    name: 'MoodCheckin',
    component: () => import('../views/mood/MoodCheckin.vue'),
  },
  {
    path: '/mood/calendar',
    name: 'MoodCalendar',
    component: () => import('../views/mood/MoodCalendar.vue'),
  },
  {
    path: '/mood/detail',
    name: 'MoodDetail',
    component: () => import('../views/mood/MoodDetail.vue'),
  },
  {
    path: '/mood/report',
    name: 'WeeklyReport',
    component: () => import('../views/mood/WeeklyReport.vue'),
  },
  {
    path: '/chat/history',
    name: 'ChatHistory',
    component: () => import('../views/profile/ChatHistory.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/profile/Profile.vue'),
  },
  {
    path: '/profile/ai-settings',
    name: 'AiSettings',
    component: () => import('../views/profile/AiSettings.vue'),
  },
  {
    path: '/profile/settings',
    name: 'Settings',
    component: () => import('../views/profile/Settings.vue'),
  },
  {
    path: '/rescue',
    name: 'Rescue',
    component: () => import('../views/rescue/Rescue.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 无需登录的白名单
const whiteList = ['/welcome', '/register', '/login']

router.beforeEach((to) => {
  if (whiteList.includes(to.path)) return true
  const userInfo = sessionStorage.getItem('userInfo')
  if (!userInfo) return '/login'
  return true
})

export default router
