# 小愈 — 完整项目文档

> 项目代号：小愈
> 定位：情绪关怀与自我陪伴移动应用（H5 风格）
> 技术栈：Vue 3 + TypeScript + Pinia + Vue Router + Element Plus + Vite
> 当前阶段：前端核心逻辑已完成，Mock 数据对接中，待后端实现

---

## 一、产品总览

### 1.1 核心价值

"小愈"是一个 AI 陪伴式心理健康助手，为用户提供**日常聊愈**、**匿名倾诉**、**心情追踪**和**治愈内容**四位一体的情绪关怀服务。

### 1.2 目标用户

- 有轻度情绪困扰、需要日常心理陪伴的年轻人
- 不愿/不便与真人倾诉，需要匿名表达空间的用户
- 希望通过记录情绪了解自己心理状态的用户
- 需要碎片化治愈内容（卡片、白噪音）的用户

### 1.3 底部 Tab 导航

| Tab | 路由 | 核心功能 | 视觉风格 |
|-----|------|---------|---------|
| 聊聊 | /chat | AI 日常陪伴对话 | 暖色系（奶油色/暖橙） |
| 树洞 | /treehole | 匿名深度倾诉 | 暗色系（深棕/深夜） |
| 卡片 | /cards | 治愈卡片浏览/创作 | 混合（依内容变化） |
| 我的 | /profile | 个人主页/设置 | 暖色系渐变 |

---

## 二、模块详述

### 2.1 聊聊模块（ChatRoom）

**定位**：AI 伙伴日常陪伴，连续记忆，有身份感

**路由结构**：
```
/chat          → ChatRoom.vue（聊天主界面）
/chat/history  → ChatHistory.vue（历史记录列表）
```

**当前实现**：
- 会话管理：`src/utils/chatStorage.ts` 基于 localStorage，通过 `type:'chat'/'treehole'` 区分模块
- AI 回复：`src/views/treehole/aiReply.ts` 关键词匹配引擎（10 类情绪：tired/anxious/sad/lonely/angry/happy/lost/insomnia/guilty/worthless），支持 3 级回复策略：单字匹配 → 情绪匹配 → 深度/通用回复
- 消息持久化：ChatRoom 每次发消息都调用 `chatStorage.appendMessage()` 写入 localStorage
- 情绪快捷行：折叠在输入区顶部，点击自动填入并发送（还好/低落/焦虑/想哭/开心）
- FAB 急救按钮：浮动在消息区右下角，跳转 `/rescue`
- 子路由：ChatHistory 作为路由子项渲染

**AI 回复策略层级**：
1. 短回复匹配（嗯/好/累/唉 → 对应简短预设回复）
2. 情绪关键词分类（10 分类）
3. 深度对话（用户 ≥2 轮 + 消息 >20 字 → deepReplies 池）
4. 较长消息（>15 字 → 引导回复 "然后呢？慢慢说"）
5. 通用回复（generalReplies 池随机）

**需要后端支持的接口**：
- `GET /api/chat/sessions` — 会话列表
- `POST /api/chat/sessions` — 创建会话
- `DELETE /api/chat/sessions/:id` — 删除会话（软删除）
- `GET /api/chat/sessions/:id/messages` — 消息列表
- `POST /api/chat/sessions/:id/messages` — 发送消息（含 AI 回复生成）
- `GET /api/chat/history` — 按周分组的历史

### 2.2 树洞模块（Treehole）

**定位**：匿名一次性深度倾诉，说完就走不留痕迹

**路由**：
```
/treehole → Treehole.vue
```

**当前实现**：
- 消息管理：**纯内存状态**（与聊天模块不同，Treehole.vue 不使用 chatStorage 持久化）
- AI 回复：与聊聊模块**共用** `src/views/treehole/aiReply.ts`
- 进入引导：根据时间段显示不同问候（深夜/傍晚/白天）
- 3 轮对话后弹出情绪标签选择（开心/平静/低落/焦虑/烦躁/想哭）
- 情绪标签通过 `sessionStorage` 的 `treehole_emotion` 键桥接至 MoodCheckin
- 治愈音景：UI 切换（雨声/篝火/海浪/森林），纯前端状态，无真实音频
- 离场收束浮层：保存到日记 / 直接离开 / 再待一会儿
- 保存到日记时将对话摘要写入 `sessionStorage` 的 `treehole_diary_draft`，跳转 `/mood/checkin?from=treehole`
- 输入框 placeholder 8 秒轮换（5 个提示文案）
- 装饰层：星星闪烁动画、月亮发光、pointer-events:none 避免遮挡

**树洞 ↔ 心情签到数据流**：
```
Treehole 用户选择情绪 → sessionStorage.treehole_emotion[日期]=情绪值
Treehole 用户保存日记 → sessionStorage.treehole_diary_draft = {date,summary,feeling,emotion,messages}
                      → router.push('/mood/checkin?from=treehole')
MoodCheckin onMounted → 优先读取 treehole_diary_draft 填充情绪+笔记
                      → 其次读取 treehole_emotion 填充情绪
                      → 再次读取今日已有记录（编辑模式）
```

**需要后端支持的独有接口**：
- `POST /api/treehole/emotion` — 记录情绪标签
- `GET /api/treehole/emotion/today` — 今日情绪标签
- `POST /api/treehole/save-to-diary` — 保存对话草稿到日记

### 2.3 心情记录模块（Mood）

**定位**：每日情绪打卡，周报回顾，连续记录

**路由结构**：
```
/mood           → MoodCalendar.vue（日历视图）
/mood/checkin   → MoodCheckin.vue（签到表单）
/mood/detail    → MoodDetail.vue（单日详情）
/mood/report    → WeeklyReport.vue（周报视图）
```

**当前实现**：
- 状态管理：`src/stores/mood.ts` 内存数组管理，14 条示例数据
- 6 种情绪类型：`happy(开心/😊/5分)` `calm(平静/😌/4分)` `sad(低落/😔/2分)` `anxious(焦虑/😣/2分)` `irritable(烦躁/😡/1分)` `tearful(想哭/🥺/1分)`
- 签到逻辑：只允许记录当天，已有时覆盖更新
- 连续打卡天数：从今天向前扫描最多 365 天
- 月度统计：记录数、平均分、情绪摘要文案（分 3 档）
- MoodCheckin 支持从 Treehole 接收草稿数据

**Mock 数据不一致性**（需注意）：
- `src/api/mock.ts` 的 `MoodRecord` 接口使用 `'great'|'good'|'okay'|'bad'|'awful'`
- `src/stores/mood.ts` 使用 `'happy'|'calm'|'sad'|'anxious'|'irritable'|'tearful'`
- API 文档与 store 保持一致，mock 数据需跟随统一

**需要后端支持的接口**：
- `GET /api/mood/config` — 情绪配置列表
- `GET /api/mood/records` — 月度记录（含统计）
- `GET /api/mood/records/daily` — 单日记录
- `POST /api/mood/checkin` — 记录/更新今日心情
- `GET /api/mood/report` — 周报
- `GET /api/mood/streak` — 连续打卡天数

### 2.4 治愈卡片模块（Cards）

**定位**：混合模式 — 平台内容流 + 用户手账创作

**路由结构**：
```
/cards              → Cards.vue（列表容器，含6 Tab）
/cards/create       → CardCreate.vue（制作页）
/cards/topic/:topicId → TopicDetail.vue（主题合集详情）
/cards/:id          → CardDetail.vue（详情页）
```

**实现状态**：全部 4 个 Phase 已完成

**Tab 分类**：
| Tab | 含义 | 数据来源 | 筛选条件 |
|-----|------|---------|---------|
| recommend | 今日推荐 | 系统卡片 | 按日期伪随机选 1 张 |
| warm | 暖心话 | 系统卡片 | type='quote' |
| audio | 声音 | 系统卡片 | type='audio' |
| scene | 风景 | 系统卡片 | type='landscape' |
| my-cards | 我的创作 | 用户卡片 | source='user' + user_id |
| community | 广场 | 社区卡片 | source='user' + is_public=1 |

**核心功能清单**：
- 22 张系统卡片（暖心话14 + 风景4 + 声音4）+ 3 张用户卡片 + 8 张社区卡片
- 无限滚动（IntersectionObserver + 分页）
- 收藏/取消收藏，同步到 userStore.collectionCount
- 收藏集管理（创建/删除命名收藏集，卡片加入/移出）
- 图片导出（html2canvas 2x 高清输出）
- Web Share API 分享（含图片 Blob）
- 音频播放（Web Audio API 模拟白噪音，含波形可视化）
- 卡片编辑（?edit=id 编辑模式预填表单）
- 社区广场浏览（最新/最热排序）
- 卡片搜索（按内容/作者关键字筛选当前 Tab）
- 4 个主题合集
- 每日推送（localStorage 记录访问，Element Plus 消息提示）

**需要后端支持的接口**：
- 系统卡片 CRUD / 列表 / 每日推荐 / 搜索
- 用户卡片 CRUD / 可见性切换
- 收藏 / 取消收藏 / 已收藏列表
- 主题合集列表 / 主题下卡片列表
- 社区广场列表
- 全局搜索

### 2.5 个人中心模块（Profile）

**定位**：用户资料、AI 伙伴设置、应用偏好

**路由结构**：
```
/profile             → Profile.vue（主页）
/profile/edit        → EditProfile.vue（编辑资料）
/profile/ai-settings → AiSettings.vue（AI 设置）
/profile/settings    → Settings.vue（应用设置）
```

**当前实现**：
- `src/stores/user.ts` 管理用户状态 Pinia Store
- Profile.vue 已接入 `service.get("/profile")` 调用后端（Mock 环境下静默失败）
- 数据面板：陪伴天数、聊天轮次、日记录、收藏卡片（4 项）
- AI 伙伴卡：显示名称 + 陪伴描述
- 内联通知设置（前端本地状态，无后端对接）：每日卡片推送、晚安提醒、情绪周报推送、打卡提醒
- 功能入口：我的心情、情绪周报、聊天历史、我的收藏
- 退出登录：清空 sessionStorage + localStorage theme，重置 store，跳转登录

**需要后端支持的接口**：
- `GET /api/profile` — 个人主页
- `PUT /api/profile` — 编辑资料
- `GET /api/profile/ai-settings` — AI 设置
- `PUT /api/profile/ai-settings` — 更新 AI 设置
- `GET /api/profile/settings` — 应用设置
- `PUT /api/profile/settings` — 更新应用设置
- `GET /api/profile/stats` — 数据面板
- 认证接口：`POST /api/auth/login` `POST /api/auth/register` `POST /api/auth/logout`

### 2.6 情绪急救模块（Rescue）

**路由**：
```
/rescue → Rescue.vue
```

独立模块，从聊天室 FAB 按钮进入，用于用户情绪崩溃时快速获取帮助。当前为独立路由页面，后续可根据需求扩展（如呼吸引导、紧急联系、热线等）。

---

## 三、架构设计

### 3.1 目录结构

```
src/
├── api/
│   ├── index.ts          # Axios 实例（baseURL/token注入/响应拦截）
│   ├── cards.ts          # 卡片 API（当前返回 Mock）
│   └── mock.ts           # 全模块 Mock 数据定义
├── stores/
│   ├── user.ts           # 用户状态（已接入 Profile 接口）
│   ├── cards.ts          # 卡片状态（Tab/分页/收藏集）
│   ├── mood.ts           # 心情状态（内存数组）
│   └── theme.ts          # 主题状态（localStorage 持久化）
├── utils/
│   ├── chatStorage.ts    # 聊天 localStorage 持久化层
│   ├── saveCard.ts       # html2canvas 图片导出工具
│   └── icons.ts          # SVG 图标管理
├── views/
│   ├── chat/
│   │   ├── ChatRoom.vue      # 聊聊主界面
│   │   └── ChatHistory.vue   # 聊天历史
│   ├── treehole/
│   │   ├── Treehole.vue      # 树洞主界面
│   │   └── aiReply.ts        # AI 回复引擎（ChatRoom 共用）
│   ├── mood/
│   │   ├── MoodCalendar.vue  # 日历视图
│   │   ├── MoodCheckin.vue   # 签到表单
│   │   ├── MoodDetail.vue    # 单日详情
│   │   └── WeeklyReport.vue  # 周报
│   ├── cards/
│   │   ├── Cards.vue         # 卡片列表容器
│   │   ├── CardDetail.vue    # 卡片详情
│   │   ├── CardCreate.vue    # 制作/编辑卡片
│   │   ├── CardItem.vue      # 统一卡片渲染
│   │   ├── AudioPlayer.vue   # 白噪音播放器
│   │   └── TopicDetail.vue   # 主题合集详情
│   ├── profile/
│   │   ├── Profile.vue       # 个人主页
│   │   ├── EditProfile.vue   # 编辑资料
│   │   ├── AiSettings.vue    # AI 设置
│   │   └── Settings.vue      # 应用设置
│   ├── rescue/
│   │   └── Rescue.vue        # 情绪急救
│   ├── Login.vue
│   ├── Register.vue
│   └── Welcome.vue
├── components/
│   ├── NavBar.vue
│   ├── StatusBar.vue
│   ├── SvgIcon.vue
│   └── TabBar.vue
├── router/
│   └── index.ts          # 全量路由定义 + 鉴权守卫
├── styles/
│   ├── core.css
│   └── variables.css
├── App.vue
└── main.ts
```

### 3.2 状态管理结构

```
Pinia Stores:
├── user                   # 用户信息 + AI 设置 + 数据面板
│   ├── name, aiName, avatar, phone
│   ├── companionDays, chatCount, diaryCount, collectionCount
│   ├── voice, characterTags, characterBio
│   ├── morningGreeting, eveningGreeting
│   ├── updateProfile(data)
│   └── logout()
├── cards                  # 卡片全量数据 + 收藏集
│   ├── systemCards, userCards, communityCards, topics
│   ├── activeTab, searchQuery, page, total
│   ├── collectedIds (Set<number>)
│   ├── collections (Collection[])
│   ├── displayCards (computed, 按 Tab 筛选)
│   ├── searchedCards (computed, 按关键字筛选)
│   ├── todayRecommend (computed, 日期伪随机)
│   └── CRUD + 收藏 + 收藏集操作
├── mood                   # 心情记录
│   ├── records (MoodRecord[])
│   ├── currentYear, currentMonth
│   ├── monthCount, monthAvgScore, monthSummary, streakDays
│   └── addRecord / 月份切换 / 日期查询
├── theme                  # 主题管理
│   ├── currentKey (localStorage 持久化)
│   ├── applyTheme(key)
│   └── initTheme()
```

### 3.3 数据流特点

**已接入后端的部分**：
- Profile.vue onMounted → `service.get("/profile")` → `userStore.updateProfile()`

**接 Mock 的部分**：
- cards Store → `api/cards.ts` → `api/mock.ts`（纯内存操作）
- mood Store → 内联 INITIAL_RECORDS 数组
- chatStorage → localStorage 持久化（设计上可直接替换为 API 调用）

**前端桥接机制**（Treehole → MoodCheckin）：
- `sessionStorage.treehole_emotion`：`{ "2026-07-27": "anxious" }`
- `sessionStorage.treehole_diary_draft`：`{ date, summary, feeling, emotion, messages[] }`

### 3.4 认证与路由守卫

```
路由守卫逻辑：
  beforeEach → 检查 path 是否在白名单 ['/welcome','/register','/login']
    → 是：放行
    → 否：检查 sessionStorage.userInfo 是否存在
      → 存在：放行
      → 不存在：重定向 /login

API 请求拦截：
  在 Axios 拦截器中注入 Authorization: Bearer {token}
  PUBLIC_URLS = ['/login', '/register'] 白名单绕过
  响应拦截器处理 401 → 调用 userStore.logout()
```

---

## 四、路由映射全集

```typescript
// 所有路由路径与组件对应关系
const routes = [
  // 公开（无需登录）
  { path: '/',              redirect: '/welcome' }
  { path: '/welcome',       component: Welcome.vue }
  { path: '/register',      component: Register.vue }
  { path: '/login',         component: Login.vue }

  // 树洞
  { path: '/treehole',      component: Treehole.vue }

  // 情绪急救
  { path: '/rescue',        component: Rescue.vue }

  // 聊聊（含子路由）
  { path: '/chat',          component: ChatRoom.vue,
    children: [
      { path: 'history',    component: ChatHistory.vue }
    ]
  }

  // 治愈卡片（含子路由）
  { path: '/cards',         component: Cards.vue,
    children: [
      { path: 'create',     component: CardCreate.vue }
      { path: 'topic/:topicId', component: TopicDetail.vue }
      { path: ':id',        component: CardDetail.vue }
    ]
  }

  // 个人中心（含子路由）
  { path: '/profile',       component: Profile.vue,
    children: [
      { path: 'edit',       component: EditProfile.vue }
      { path: 'ai-settings', component: AiSettings.vue }
      { path: 'settings',   component: Settings.vue }
    ]
  }

  // 心情（含子路由）
  { path: '/mood',          component: MoodCalendar.vue,
    children: [
      { path: 'checkin',    component: MoodCheckin.vue }
      { path: 'detail',     component: MoodDetail.vue }
      { path: 'report',     component: WeeklyReport.vue }
    ]
  }
]
```

---

## 五、前端配置相关

### 5.1 主题系统

5 套主题色，通过 CSS `data-theme` 属性切换，localStorage 持久化：

| key | name | 色值 | 定位 |
|-----|------|------|------|
| morning | 晨光 | #FF9800 | 默认 / 金色晨曦 |
| forest | 森语 | #5CA050 | 薄荷森林 |
| flower | 花信 | #E06080 | 樱花和风 |
| moon | 月汐 | #5880B8 | 深蓝月色 |
| tea | 暖茶 | #B89060 | 焦糖暖意 |

### 5.2 环境变量

```env
VITE_API_BASE=/api          # API baseURL，Vite 代理
VITE_API_TARGET=http://...  # 代理目标地址（dev/prod 不同）
```

### 5.3 Mock 数据速览

| 数据 | 数量 | 来源 |
|------|------|------|
| 系统卡片 | 22 张 | mock.ts |
| 用户卡片 | 3 张 | mock.ts |
| 社区卡片 | 8 张 | mock.ts |
| 主题合集 | 4 个 | mock.ts |
| 心情记录 | 14 条 | mood store |
| 聊天会话 | 4 个（3 chat + 1 treehole） | chatStorage 初始化 |
| 聊天消息 | 7 条 | chatStorage 初始化 |
| 周报数据 | 1 条示例 | mock.ts |

---

## 六、遗留问题与待办

### 6.1 数据不一致需修复

| 问题 | 位置 | 说明 |
|------|------|------|
| MoodRecord 接口冲突 | mock.ts vs stores/mood.ts | mock.ts 用 great/good/okay/bad/awful，store 用 happy/calm/sad/anxious/irritable/tearful |
| aiReply.ts 10 分类 vs API 6 分类 | aiReply.ts | aiReply 识别 tired/lonely/angry/lost/insomnia/guilty/worthless 等，但 mood API 仅 6 种 |

> ✅ 已修复：Treehole 情绪标签 seed 数据 'tired' 已在 schema-merged.sql 中修正为 'sad'。
> ✅ 已修复：updateProfile 参数已统一 camelCase，F1 API 响应改为扁平结构直接匹配 store。
> ✅ 已修复：收藏集 CRUD 端点已补充（E16-E21）。
> ✅ 已清理：移除了不必要的冗余计数器（user_profiles 数据面板快照字段、topics.card_count 及关联触发器），仅保留有性能必要的 counter。保留的 chat_sessions.message_count 由应用层维护，cards.likes_count 由触发器维护。

### 6.2 未对接后端的功能

| 功能 | 当前状态 | 建议优先级 |
|------|---------|-----------|
| 个人主页数据 | 已写 service.get("/profile") 调用，Mock 下静默失败 | P0 |
| 卡片 CRUD | 全部 Mock | P0 |
| 情绪签到 | Store 内存数组 | P0 |
| AI 回复 | 前端关键词引擎 aiReply.ts | P0（替换为 AI API） |
| 聊天历史 | localStorage chatStorage.ts | P0 |
| 收藏集管理 | Store 内存数组 | P1 |
| 主题切换 | localStorage 独立管理 | P1 |
| 通知设置 | Profile 内联状态 | P1 |
| 树洞情绪标签 | sessionStorage 桥接 | P1 |

### 6.3 推荐对接顺序

1. **认证**（login/register/logout）— 所有功能的前置条件
2. **个人主页**（profile) — 已有前端接入代码，后端实现即可贯通
3. **心情记录**（mood checkin + records） — 数据量小，逻辑清晰
4. **卡片 CRUD**（cards system/user/community）— 前端逻辑最完整
5. **聊天**（chat sessions + messages + AI）— 核心体验，需 AI 接口配合
6. **树洞**（treehole emotion + save-to-diary）— 依赖聊天基础
7. **设置/通知**（settings/notifications）— 收尾工作
