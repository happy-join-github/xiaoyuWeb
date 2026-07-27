// Mock 数据层 — 纯前端模拟，后续可切换真实接口
export interface Message {
  id: number
  role: 'ai' | 'user'
  content: string
  time: string
}

export interface MoodRecord {
  date: string
  mood: 'great' | 'good' | 'okay' | 'bad' | 'awful'
  note: string
}

/** 卡片来源 */
export type CardSource = 'system' | 'user'
/** 卡片类型 */
export type CardType = 'quote' | 'audio' | 'landscape' | 'user-note'

export interface CardItem {
  id: number
  source: CardSource
  type: CardType
  // ---------- 平台内容字段 ----------
  content: string
  category: string
  date: string
  styleClass: string
  // ---------- 用户手账字段 ----------
  author?: string
  createdAt?: string
  bgTemplate?: string
  customText?: string
  customImage?: string
  isPublic?: boolean
  // ---------- 公共 ----------
  likes: number
  liked: boolean
}

/** 主题合集定义 */
export interface TopicItem {
  id: number
  label: string
  sub: string
  class: string
  cardIds: number[]
}

export interface ChatHistoryItem {
  id: number
  title: string
  preview: string
  date: string
  count: number
}

export const mockChatMessages: Message[] = [
  { id: 1, role: 'ai', content: '早安呀 ☀️<br>睡得好吗？今天想聊点什么都可以哦~', time: '今天 9:32' },
  { id: 2, role: 'user', content: '嗯…其实有点累', time: '今天 9:33' },
  { id: 3, role: 'ai', content: '嗯嗯，我在 💛<br>是身体上的累，还是心里那种？慢慢说，不着急。', time: '今天 9:33' },
]

export const mockTreeholeMessages: Message[] = [
  { id: 1, role: 'ai', content: '我在这里 🌙<br>想说什么都可以，慢慢来。', time: '今天 9:20' },
  { id: 2, role: 'user', content: '今天真的好累，所有事都堆在一起，不想和任何人说话。', time: '今天 9:22' },
  { id: 3, role: 'ai', content: '嗯…听起来真的很沉重。<br>累了就先这样待一会儿，不说话也没关系。', time: '今天 9:22' },
  { id: 4, role: 'user', content: '可能是因为领导又改了需求，我已经第三次返工了。', time: '今天 9:24' },
  { id: 5, role: 'ai', content: '三次…那确实很让人泄气。<br>你已经做得够多了，只是别人没看见 💛', time: '今天 9:24' },
]

export const mockMoodRecords: MoodRecord[] = [
  { date: '2026-07-13', mood: 'good', note: '今天心情不错，和朋友聊了天' },
  { date: '2026-07-14', mood: 'okay', note: '工作有点累' },
  { date: '2026-07-15', mood: 'bad', note: '项目延期了，很焦虑' },
  { date: '2026-07-16', mood: 'good', note: '问题解决了，松了口气' },
  { date: '2026-07-17', mood: 'great', note: '周末去公园散步了' },
  { date: '2026-07-18', mood: 'okay', note: '有点无聊' },
  { date: '2026-07-19', mood: 'good', note: '新的一周开始了' },
]

// ====== 系统卡片 ======
export const mockCards: CardItem[] = [
  { id: 1, source: 'system', type: 'quote', content: '允许自己慢一点，<br>那不叫懒，<br>那叫在好好生活。', category: '暖心话', likes: 42, liked: false, date: '暖心话 · No.142', styleClass: 'c-1' },
  { id: 2, source: 'system', type: 'quote', content: '难过的时候，<br>就当世界在给你<br>一个长长的拥抱。', category: '暖心话', likes: 38, liked: true, date: '暖心话 · No.143', styleClass: 'c-2' },
  { id: 3, source: 'system', type: 'landscape', content: '晚霞，是天空最温柔的「今天辛苦了」。', category: '风景', likes: 56, liked: false, date: 'SUNSET', styleClass: 'l-1' },
  { id: 4, source: 'system', type: 'quote', content: '吃饭要慢慢吃，<br>走路要慢慢走，<br>喜欢你也是。', category: '暖心话', likes: 44, liked: false, date: '暖心话 · No.144', styleClass: 'c-3' },
  { id: 5, source: 'system', type: 'quote', content: '今天也是被世界<br>悄悄爱着的一天，<br>只是你还没发现。', category: '暖心话', likes: 51, liked: true, date: '暖心话 · No.145', styleClass: 'c-4' },
  { id: 6, source: 'system', type: 'audio', content: '', category: '声音', likes: 23, liked: false, date: '白噪音 · 窗外的雨', styleClass: '' },
  { id: 7, source: 'system', type: 'quote', content: '你不需要成为谁，<br>你只需要成为你自己。', category: '暖心话', likes: 33, liked: false, date: '暖心话 · No.146', styleClass: 'c-1' },
  { id: 8, source: 'system', type: 'quote', content: '今天不想努力也没关系，<br>休息也是一种进步。', category: '暖心话', likes: 47, liked: false, date: '暖心话 · No.147', styleClass: 'c-2' },
  { id: 9, source: 'system', type: 'landscape', content: '海风吹过的时候，<br>所有心事都变轻了。', category: '风景', likes: 39, liked: false, date: 'OCEAN', styleClass: 'l-1' },
  { id: 10, source: 'system', type: 'quote', content: '你已经做得很好了，<br>剩下的交给时间吧。', category: '暖心话', likes: 62, liked: true, date: '暖心话 · No.148', styleClass: 'c-3' },
  { id: 11, source: 'system', type: 'audio', content: '', category: '声音', likes: 18, liked: false, date: '白噪音 · 篝火晚风', styleClass: '' },
  { id: 12, source: 'system', type: 'quote', content: '心里的褶皱，<br>会被时间慢慢熨平。', category: '暖心话', likes: 29, liked: false, date: '暖心话 · No.149', styleClass: 'c-4' },
  { id: 13, source: 'system', type: 'quote', content: '所有的不开心<br>都会在今天结束。', category: '暖心话', likes: 55, liked: false, date: '暖心话 · No.150', styleClass: 'c-1' },
  { id: 14, source: 'system', type: 'landscape', content: '月亮不睡你不睡，<br>你是人间小美味。', category: '风景', likes: 41, liked: false, date: 'MOON', styleClass: 'l-1' },
  { id: 15, source: 'system', type: 'quote', content: '你比你以为的<br>更值得被爱。', category: '暖心话', likes: 73, liked: true, date: '暖心话 · No.151', styleClass: 'c-2' },
  { id: 16, source: 'system', type: 'audio', content: '', category: '声音', likes: 31, liked: false, date: '白噪音 · 清晨鸟鸣', styleClass: '' },
  { id: 17, source: 'system', type: 'quote', content: '不需要总是坚强，<br>脆弱也是一种勇气。', category: '暖心话', likes: 36, liked: false, date: '暖心话 · No.152', styleClass: 'c-3' },
  { id: 18, source: 'system', type: 'quote', content: '慢慢来，<br>谁不是一边受伤一边长大。', category: '暖心话', likes: 48, liked: false, date: '暖心话 · No.153', styleClass: 'c-4' },
  { id: 19, source: 'system', type: 'landscape', content: '下雨天的窗户，<br>是最好的白噪音。', category: '风景', likes: 27, liked: false, date: 'RAIN', styleClass: 'l-1' },
  { id: 20, source: 'system', type: 'quote', content: '生活原本沉闷，<br>但跑起来就有风。', category: '暖心话', likes: 59, liked: false, date: '暖心话 · No.154', styleClass: 'c-1' },
  { id: 21, source: 'system', type: 'audio', content: '', category: '声音', likes: 15, liked: false, date: '白噪音 · 森林漫步', styleClass: '' },
  { id: 22, source: 'system', type: 'quote', content: '对自己温柔一点，<br>你也是宇宙的孩子。', category: '暖心话', likes: 44, liked: false, date: '暖心话 · No.155', styleClass: 'c-2' },
]

// ====== 用户卡片（手账） ======
export const mockUserCards: CardItem[] = [
  { id: 101, source: 'user', type: 'user-note', content: '', category: '我的创作', likes: 0, liked: false, date: '', styleClass: 'user-1', author: '小柚子', createdAt: '2026-07-20', bgTemplate: 'warm', customText: '今天第一次自己做了顿饭，<br>虽然很简单，<br>但感觉生活有了温度。', isPublic: false },
  { id: 102, source: 'user', type: 'user-note', content: '', category: '我的创作', likes: 0, liked: false, date: '', styleClass: 'user-2', author: '小柚子', createdAt: '2026-07-21', bgTemplate: 'calm', customText: '不想说话的时候<br>就看看云。<br>云从来不问为什么。', isPublic: true },
  { id: 103, source: 'user', type: 'user-note', content: '', category: '我的创作', likes: 2, liked: false, date: '', styleClass: 'user-3', author: '小柚子', createdAt: '2026-07-22', bgTemplate: 'dream', customText: '希望明天<br>是一个柔软的日子。', isPublic: false },
]

// ====== 社区广场卡片（其他用户公开的卡片） ======
export const mockCommunityCards: CardItem[] = [
  { id: 201, source: 'user', type: 'user-note', content: '', category: '社区', likes: 15, liked: false, date: '', styleClass: 'user-1', author: '星星', createdAt: '2026-07-18', bgTemplate: 'calm', customText: '今天的日落特别美，\n分享给你们 🌅', isPublic: true },
  { id: 202, source: 'user', type: 'user-note', content: '', category: '社区', likes: 23, liked: true, date: '', styleClass: 'user-2', author: '微风', createdAt: '2026-07-19', bgTemplate: 'dream', customText: '有时候安静地坐着\n就是最好的休息。', isPublic: true },
  { id: 203, source: 'user', type: 'user-note', content: '', category: '社区', likes: 8, liked: false, date: '', styleClass: 'user-3', author: '晴天', createdAt: '2026-07-20', bgTemplate: 'warm', customText: '今天读完了一本书，\n心里满满的幸福感 📖', isPublic: true },
  { id: 204, source: 'user', type: 'user-note', content: '', category: '社区', likes: 31, liked: false, date: '', styleClass: 'user-1', author: '月亮', createdAt: '2026-07-21', bgTemplate: 'calm', customText: '给所有正在努力的人：\n你们已经很棒了。', isPublic: true },
  { id: 205, source: 'user', type: 'user-note', content: '', category: '社区', likes: 12, liked: false, date: '', styleClass: 'user-2', author: '云朵', createdAt: '2026-07-22', bgTemplate: 'dream', customText: '下雨天窝在沙发里\n听雨声，最治愈了 ☔️', isPublic: true },
  { id: 206, source: 'user', type: 'user-note', content: '', category: '社区', likes: 19, liked: true, date: '', styleClass: 'user-3', author: '阳光', createdAt: '2026-07-23', bgTemplate: 'warm', customText: '生活很甜，\n像夏天的西瓜一样甜 🍉', isPublic: true },
  { id: 207, source: 'user', type: 'user-note', content: '', category: '社区', likes: 7, liked: false, date: '', styleClass: 'user-1', author: '小溪', createdAt: '2026-07-24', bgTemplate: 'calm', customText: '慢慢来，\n不着急。', isPublic: true },
  { id: 208, source: 'user', type: 'user-note', content: '', category: '社区', likes: 45, liked: false, date: '', styleClass: 'user-2', author: '晚风', createdAt: '2026-07-25', bgTemplate: 'dream', customText: '谢谢你今天也很努力。\n辛苦了，早点休息 💤', isPublic: true },
]

// ====== 主题合集 ======
export const mockTopics: TopicItem[] = [
  { id: 1, class: 't-1', sub: '10 句话', label: '睡前的轻声', cardIds: [1, 4] },
  { id: 2, class: 't-2', sub: '致你', label: '给焦虑的你', cardIds: [2, 5] },
  { id: 3, class: 't-3', sub: '一个人', label: '一个人的晚餐', cardIds: [4] },
  { id: 4, class: 't-4', sub: '慢生活', label: '30 天晚安', cardIds: [1, 2, 4, 5] },
]

export const mockChatHistory: ChatHistoryItem[] = [
  { id: 1, title: '工作的烦恼', preview: '今天真的好累，所有事都堆在一起…', date: '7 月 18 日', count: 12 },
  { id: 2, title: '和家人吵架', preview: '不知道该怎么面对，感觉很愧疚…', date: '7 月 16 日', count: 8 },
  { id: 3, title: '即将到来的面试', preview: '准备了好久的面试，还是很紧张…', date: '7 月 14 日', count: 15 },
  { id: 4, title: '一个人的晚餐', preview: '又是自己一个人吃饭，感觉有点孤独…', date: '7 月 12 日', count: 6 },
  { id: 5, title: '昨晚的梦', preview: '做了一个很奇怪的梦，想和你聊聊…', date: '7 月 10 日', count: 10 },
]

export const weeklyReportData = {
  weekRange: '7 月 14 日 - 7 月 19 日',
  dominantMood: 'good',
  moodLabel: '平稳向好',
  totalRecords: 7,
  chatCount: 86,
  topEmotion: '焦虑',
  messageFromAi: '这一周你经历了一些起伏，但都挺过来了。记得给自己一个温柔的肯定 🌷',
  days: [
    { label: '一', mood: 'good' },
    { label: '二', mood: 'okay' },
    { label: '三', mood: 'bad' },
    { label: '四', mood: 'good' },
    { label: '五', mood: 'great' },
    { label: '六', mood: 'okay' },
    { label: '日', mood: 'good' },
  ],
}
