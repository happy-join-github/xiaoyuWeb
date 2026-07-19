import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ThemeConfig {
  key: string
  name: string
  desc: string
  icon: string
  color: string
}

export const themes: ThemeConfig[] = [
  { key: 'morning', name: '晨光', desc: '金色晨曦 · 温暖治愈', icon: '🌅', color: '#FF9800' },
  { key: 'forest', name: '森语', desc: '薄荷森林 · 自然疗愈', icon: '🌿', color: '#5CA050' },
  { key: 'flower', name: '花信', desc: '樱花和风 · 温柔浪漫', icon: '🌸', color: '#E06080' },
  { key: 'moon', name: '月汐', desc: '深蓝月色 · 平静安宁', icon: '🌙', color: '#5880B8' },
  { key: 'tea', name: '暖茶', desc: '焦糖暖意 · 温润醇厚', icon: '🍵', color: '#B89060' },
]

export const useThemeStore = defineStore('theme', () => {
  const saved = (() => {
    try { return localStorage.getItem('theme') || 'morning' } catch { return 'morning' }
  })()
  const currentKey = ref(saved)

  function applyTheme(key: string) {
    currentKey.value = key
    document.documentElement.setAttribute('data-theme', key)
    try { localStorage.setItem('theme', key) } catch { /* noop */ }
  }

  function initTheme() {
    applyTheme(currentKey.value)
  }

  return { currentKey, applyTheme, initTheme }
})
