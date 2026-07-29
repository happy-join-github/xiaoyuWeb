// Axios 实例 — baseURL、token 注入、统一业务 / 网络错误处理
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'
import { useUserStore } from '../stores/user'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api', // 走 Vite 代理；生产可改为实际地址
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 无需鉴权的公开接口白名单（注册、发送验证码等）
const PUBLIC_URLS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
])

// 请求拦截器：从  sessionStorage 读取 token 注入请求头；
// 缺失 token 且非公开接口时跳转登录并中断请求
service.interceptors.request.use((config: any) => {
  const userInfo = sessionStorage.getItem('userInfo')
  
  // 公开接口直接放行
  if (config.url && PUBLIC_URLS.has(config.url)) {
    return config
  }

  const token = userInfo ? JSON.parse(userInfo).access_token : null
  
  // 非公开接口，且有 token，注入请求头
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    return config
  }

  router.push('/login')
  return Promise.reject(new Error('未登录，请先登录'))
})

// 响应拦截器：业务约定 code === 200 成功，code === 401 登录过期
service.interceptors.response.use(
  (response: any) => {
    const { code, data, msg } = response.data;

    if (code === 200) {
      return response.data;
    }

    if (code === 401) {
      // 处理 token 过期逻辑
      ElMessage.error(msg || '登录过期，请重新登录');
      useUserStore().logout();
      return Promise.reject(new Error(msg || '未授权'));
    }

    // 其它业务错误：reject，由调用方按需捕获
    return Promise.reject(new Error(msg || `请求失败 (code: ${code})`));
  },
  (error: any) => {
    // 网络错误或服务器异常
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // HTTP 层 401：未授权，跳转登录
          console.error('未授权，请重新登录');
          // 可在此处跳转登录页
          router.push({ name: 'login' })
          break;
        case 403:
          console.error('拒绝访问')
          break
      }
    } else {
      console.error(error)
    }
    return Promise.reject(error)
  },
)


export default service  
