import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // ========== 公共 / 认证 ==========
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
    path: '/forget-password',
    name: 'ForgetPassword',
    component: () => import('../views/ForgetPassword.vue'),
  },
  // ---- 树洞 ----
  {
    path: "/treehole",
    component: () => import('../views/treehole/Treehole.vue'),
    children: [
      {
        path: 'history',
        name: 'TreeholeHistory',
        component: () => import('../views/treehole/TreeholeHistory.vue'),
      },
    ],
  },
  // ---- 情绪急救 ----
  {
    path: '/rescue',
    name: 'Rescue',
    component: () => import('../views/rescue/Rescue.vue'),
  },
  {
    path: '/chat',
    name: 'ChatRoom',
    component: () => import('../views/chat/ChatRoom.vue'),
    children: [
      {
        path: 'history',
        name: 'ChatHistory',
        component: () => import('../views/chat/ChatHistory.vue'),
      },
    ],
  },

  // ---- 治愈卡片 ----
  {
    path: '/cards',
    name: 'Cards',
    component: () => import('../views/cards/Cards.vue'),
    children: [
      {
        path: 'create',
        name: 'CardCreate',
        component: () => import('../views/cards/CardCreate.vue'),
      },
      {
        path: 'topic/:topicId',
        name: 'TopicDetail',
        component: () => import('../views/cards/TopicDetail.vue'),
      },
      {
        path: ':id',
        name: 'CardDetail',
        component: () => import('../views/cards/CardDetail.vue'),
      },
    ],
  },

  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/profile/Profile.vue'),
    children: [
      {
        path: 'edit',
        name: 'EditProfile',
        component: () => import('../views/profile/EditProfile.vue'),
      },
      {
        path: 'ai-settings',
        name: 'AiSettings',
        component: () => import('../views/profile/AiSettings.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/profile/Settings.vue'),
      },
    ],
  },
  // ---- 心情 ----
  {
    path: '/mood',
    component: () => import('../views/mood/MoodCalendar.vue'),
    children: [
      {
        path: 'checkin',
        name: 'MoodCheckin',
        component: () => import('../views/mood/MoodCheckin.vue'),
      },
      {
        path: 'detail',
        name: 'MoodDetail',
        component: () => import('../views/mood/MoodDetail.vue'),
      },
      {
        path: 'report',
        name: 'WeeklyReport',
        component: () => import('../views/mood/WeeklyReport.vue'),
      },
    ],
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
const whiteList = ['/welcome', '/register', '/login', '/forget-password']

router.beforeEach((to) => {
  if (whiteList.includes(to.path)) return true
  const userInfo = sessionStorage.getItem('userInfo')
  if (!userInfo) return '/login'
  return true
})

export default router
