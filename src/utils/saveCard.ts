/**
 * 卡片导出为图片工具
 * 使用 html2canvas 将卡片 DOM 渲染为 PNG 并触发下载
 */
import html2canvas from 'html2canvas'

/**
 * 将指定 DOM 元素导出为图片并下载
 * @param el - 卡片容器的 DOM 元素
 * @param filename - 下载文件名（不含后缀）
 */
export async function saveCardAsImage(el: HTMLElement, filename = 'card'): Promise<void> {
  try {
    const canvas = await html2canvas(el, {
      scale: 2,                  // 2x 高清输出
      useCORS: true,             // 允许跨域图片
      backgroundColor: null,      // 保持透明背景
      allowTaint: false,
      logging: false,
    })

    const link = document.createElement('a')
    link.download = `${filename}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (e) {
    console.error('保存图片失败', e)
    throw new Error('保存图片失败，请重试')
  }
}

/**
 * 将卡片 DOM 转为 Blob，用于 Web Share API 分享图片
 */
export async function cardToBlob(el: HTMLElement): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      allowTaint: false,
      logging: false,
    })
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  } catch {
    return null
  }
}
