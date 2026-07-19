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

export interface CardItem {
  id: number
  type: 'quote' | 'audio' | 'landscape'
  content: string
  category: string
  likes: number
  liked: boolean
  date: string
  styleClass: string
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

export const mockCards: CardItem[] = [
  { id: 1, type: 'quote', content: '允许自己慢一点，<br>那不叫懒，<br>那叫在好好生活。', category: '暖心话', likes: 42, liked: false, date: '暖心话 · No.142', styleClass: 'c-1' },
  { id: 2, type: 'quote', content: '难过的时候，<br>就当世界在给你<br>一个长长的拥抱。', category: '暖心话', likes: 38, liked: true, date: '暖心话 · No.143', styleClass: 'c-2' },
  { id: 3, type: 'landscape', content: '晚霞，是天空最温柔的\'今天辛苦了\'。', category: '风景', likes: 56, liked: false, date: 'SUNSET', styleClass: 'l-1' },
  { id: 4, type: 'quote', content: '吃饭要慢慢吃，<br>走路要慢慢走，<br>喜欢你也是。', category: '暖心话', likes: 44, liked: false, date: '暖心话 · No.144', styleClass: 'c-3' },
  { id: 5, type: 'quote', content: '今天也是被世界<br>悄悄爱着的一天，<br>只是你还没发现。', category: '暖心话', likes: 51, liked: true, date: '暖心话 · No.145', styleClass: 'c-4' },
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
