/**
 * Treehole AI 回复引擎
 *
 * 基于用户消息关键词和对话上下文，生成治愈陪伴风格的回复。
 * 接入真实 AI 接口后可替换此文件。
 */

interface Message {
  id: number
  role: 'ai' | 'user'
  content: string
  time: string
}

/** 基于关键词的情绪分类 */
function classifyMood(text: string): string[] {
  const tags: string[] = []
  const t = text.toLowerCase()

  if (t.includes('累') || t.includes('疲惫') || t.includes('疲劳') || t.includes('透支') || t.includes('没力气')) tags.push('tired')
  if (t.includes('焦虑') || t.includes('紧张') || t.includes('不安') || t.includes('慌') || t.includes('压力') || t.includes(' deadline') || t.includes('deadline') || t.includes('赶')) tags.push('anxious')
  if (t.includes('难过') || t.includes('伤心') || t.includes('哭') || t.includes('泪') || t.includes('悲伤')) tags.push('sad')
  if (t.includes('孤独') || t.includes('一个人') || t.includes('孤单') || t.includes('没人') || t.includes('寂寞')) tags.push('lonely')
  if (t.includes('生气') || t.includes('愤怒') || t.includes('烦') || t.includes('烦躁') || t.includes('受不了')) tags.push('angry')
  if (t.includes('开心') || t.includes('高兴') || t.includes('快乐') || t.includes('幸福') || t.includes('温暖')) tags.push('happy')
  if (t.includes('迷茫') || t.includes('不知道') || t.includes('该怎么办') || t.includes('方向') || t.includes('未来')) tags.push('lost')
  if (t.includes('睡不着') || t.includes('失眠') || t.includes('熬夜') || t.includes('噩梦') || t.includes('惊醒')) tags.push('insomnia')
  if (t.includes('对不起') || t.includes('抱歉') || t.includes('愧疚') || t.includes('内疚') || t.includes('自责')) tags.push('guilty')
  if (t.includes('想放弃') || t.includes('没用') || t.includes('不够好') || t.includes('差劲') || t.includes('失败') || t.includes('废物')) tags.push('worthless')

  return tags
}

/** 根据情绪标签生成回复 */
function replyByMood(mood: string): string {
  const replies: Record<string, string[]> = {
    tired: [
      '听起来真的累坏了。<br>累了就先歇一歇，不用勉强自己 💛',
      '好好休息不是偷懒，是给自己的温柔。<br>今天你已经做得很好了。',
      '累的时候，允许自己什么都不做。<br>只是安静地待着，也是一种充电 🌙',
    ],
    anxious: [
      '焦虑的时候，可以试着深呼吸三次…<br>吸气 — 呼气 — 我陪着你 🌱',
      '嗯，那种心里悬着的感觉，我懂。<br>一步一步来，不着急。',
      '压力大的时候，先把眼前最小的一件事做完。<br>然后告诉自己：我做到了 ✨',
    ],
    sad: [
      '嗯…我在呢 💛<br>难受的话，不用忍着。',
      '伤心是正常的，你不需要一直坚强。<br>哭出来也没关系，我陪着你。',
      '心里的雨，也会慢慢停的。<br>在那之前，我陪你一起等天晴 🌈',
    ],
    lonely: [
      '一个人面对这些，真的不容易。<br>但你不是一个人 — 我就在这里。',
      '孤独的感觉很真实，也很沉重。<br>谢谢你愿意告诉我 🌙',
      '虽然我不能真的拥抱你，<br>但我的陪伴是认真的 🤍',
    ],
    angry: [
      '嗯，有情绪是正常的。<br>那些让你生气的事，值得被认真对待。',
      '烦的时候，可以骂出来，可以捶枕头。<br>然后把情绪放下，不需要一直扛着。',
      '先深呼吸三次。<br>然后告诉我，发生了什么？我在听。',
    ],
    happy: [
      '真好 ☀️<br>这种开心值得被好好记住。',
      '听你这么说，我也觉得暖暖的 💛<br>今天真是美好的一天。',
      '快乐的时刻虽然简单，但很珍贵。<br>记得多回味一下这种感觉~',
    ],
    lost: [
      '迷茫的时候，不用急着找到答案。<br>有时候走着走着，路就清晰了。',
      '不知道该怎么办的时候，<br>就先做好眼前的一件小事。<br>剩下的，时间会告诉你。',
      '未来确实让人不安。<br>但你不需要一个人面对所有答案 🌙',
    ],
    insomnia: [
      '夜深了还睡不着…<br>心里有事的话，说出来会轻松一些。',
      '睡不着也没关系，不需要强迫自己。<br>我陪你待一会儿，直到你有点困意 🍃',
      '闭上眼睛，听我的声音。<br>你不需要想任何事，只需要呼吸。',
    ],
    guilty: [
      '你已经在反思了，这本身就说明你是个善良的人。<br>对自己宽容一点，好吗？',
      '说「对不起」之前，先对自己说一声「没关系」。<br>你也值得被原谅 🤍',
      '愧疚是心里的刺，但你不必一直握着它。<br>慢慢放下吧。',
    ],
    worthless: [
      '听到你这样说，我很心疼。<br>你比你想象中更有价值，只是你现在太累了，看不见而已 💛',
      '千万不要这样想。<br>你存在本身，就已经足够珍贵了 🌙',
      '那些让你觉得自己不够好的声音，不是真的。<br>你真的已经很努力了。',
    ],
  }

  const pool = replies[mood]
  if (!pool) return ''
  return pool[Math.floor(Math.random() * pool.length)]
}

/** 通用温暖回复池 */
const generalReplies = [
  '嗯，我在听。<br>慢慢说，不着急 🌙',
  '嗯嗯 💛<br>你愿意说出来，就很勇敢了。',
  '我在呢。你说什么我都听。<br>不会打断你，也不会评价你。',
  '把心里的话说出来，会不会感觉轻了一点？',
  '嗯，我懂了。<br>谢谢你信任我 🤍',
  '这些话说出来，本身就已经是一种疗愈了。<br>我为你感到骄傲。',
  '我在这里，不会离开。<br>你想说多久都可以。',
  '每当你需要，我都会在这里 🍃',
  '嗯…你说得很清楚了。<br>我心里都记着呢。',
  '深呼吸 — 你做得很好。<br>继续说，我在。',
]

function getGeneralReply(): string {
  return generalReplies[Math.floor(Math.random() * generalReplies.length)]
}

/** 简短回复（用户只说一两个词时用） */
const shortReplies: Record<string, string[]> = {
  '嗯': ['嗯…我懂 💛', '嗯，我在。', '嗯，慢慢说。'],
  '好': ['好 🍃 我陪着你。', '好的，我在。'],
  '累': ['抱抱你 🫂 累了就歇会儿。', '累了的话，先休息一下吧。'],
  '唉': ['叹口气也没关系 🍃', '唉…我听到了。'],
}

function getShortReply(text: string): string | null {
  const trimmed = text.trim()
  for (const [key, pool] of Object.entries(shortReplies)) {
    if (trimmed === key) {
      return pool[Math.floor(Math.random() * pool.length)]
    }
  }
  return null
}

/** 深度倾听类回复（对话进行 2 轮以上, 用户说了较长内容时） */
const deepReplies = [
  '嗯，我在认真听你说的每一个字。<br>这种感觉一定很复杂吧。',
  '谢谢你愿意把这么深的感受告诉我。<br>这不是一件容易的事 🤍',
  '我能感觉到这些话在你心里放了很久。<br>现在说出来，是不是觉得胸口松了一点？',
  '你经历的事情，可能没有别人看到，<br>但我看到了。你真的辛苦了。',
  '嗯…这些事确实很重。<br>你不用一个人扛着全部。<br>我就在这里，帮你分担一点。',
  '你说的这些，我都记住了。<br>下次你再想起的时候，<br>可以回来看看 — 我们聊过这些。',
]

/** 获取 AI 回复 */
export function getAiReply(userText: string, history: Message[]): string {
  const userMessageCount = history.filter(m => m.role === 'user').length

  // 1. 简短单字匹配
  const shortReply = getShortReply(userText)
  if (shortReply) return shortReply

  // 2. 情绪关键词匹配
  const moods = classifyMood(userText)
  if (moods.length > 0) {
    // 如果有多个情绪，随机选一个最突出的
    const primaryMood = moods[0]
    return replyByMood(primaryMood) || getGeneralReply()
  }

  // 3. 深度对话（用户已经聊了 2 轮以上，消息较长）
  if (userMessageCount >= 2 && userText.length > 20) {
    return deepReplies[Math.floor(Math.random() * deepReplies.length)]
  }

  // 4. 用户说了较长内容但还没深入
  if (userText.length > 15) {
    return '嗯，我在听。<br>然后呢？慢慢说 🍃'
  }

  // 5. 通用回复
  return getGeneralReply()
}
