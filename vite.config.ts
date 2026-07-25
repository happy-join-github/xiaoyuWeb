import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载当前 mode 对应的 .env / .env.[mode] 文件，
  // 这样在脚本里就能用 env.VITE_XXX 拿到环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    // 开发服务器：把 /api 代理到后端，避免浏览器跨域
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
      allowedHosts:['*']
    },

    // 打包：base 走环境变量，便于部署到子路径
    base: env.VITE_PUBLIC_PATH || './',
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // 产物按类型分目录：js/、css/、assets/
      rollupOptions: {
        output: {
          // 入口 JS 与懒加载 chunk
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          // 静态资源：CSS 走 css/，图片/字体等走 assets/
          // （注：原需求里的 "assert" 视作 "assets" 拼写，按 Vite 默认约定命名）
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? ''
            if (/\.css$/.test(name)) {
              return 'css/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    },
  }
})
