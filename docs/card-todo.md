# 治愈卡片模块 — 重构 TODO

## 产品定位

混合模式：**平台内容流（~45%）+ 用户手账（~55%）**，偏重用户自我创作。

- 平台内容：App 制作治愈卡片（暖心话、风景、白噪音），每日推荐给用户
- 用户手账：用户选择模板并写下自己的话，创建私人或公开的治愈卡片

---

## Phase 1 — 数据化 ✅（已完成）

| # | 任务 | 状态 | 文件 |
|---|------|------|------|
| 1.1 | CardItem 接口扩展 source/user 字段 | ✅ | `src/api/mock.ts` |
| 1.2 | 补充用户卡片 mock 数据 | ✅ | `src/api/mock.ts` |
| 1.3 | 新增 `src/api/cards.ts`（系统卡片列表、用户卡片 CRUD） | ✅ | `src/api/cards.ts` |
| 1.4 | 新增 `src/stores/cards.ts`（数据管理、Tab 筛选、收藏持久化、CRUD） | ✅ | `src/stores/cards.ts` |
| 1.5 | 路由改为动态 `/cards/:id`，新增 `/cards/create` | ✅ | `src/router/index.ts` |
| 1.6 | 新建 `CardItem.vue`（统一渲染 4 种卡片变体） | ✅ | `src/views/cards/CardItem.vue` |

## Phase 2 — 制作入口 ✅（已完成）

| # | 任务 | 状态 | 文件 |
|---|------|------|------|
| 2.1 | 标签栏 Tab 实际筛选生效（今日推荐 / 我的创作 / 暖心话 / 声音 / 风景） | ✅ | `src/views/cards/Cards.vue` |
| 2.2 | "我的创作"Tab 含空状态引导（"制作第一张卡片"） | ✅ | `src/views/cards/Cards.vue` |
| 2.3 | FAB 浮动创建按钮（右下角 +） | ✅ | `src/views/cards/Cards.vue` |
| 2.4 | 卡片制作页面（选模板 → 写文字 → 设可见性 → 预览 → 保存） | ✅ | `src/views/cards/CardCreate.vue` |
| 2.5 | 用户卡片详情展示（含编辑/删除/隐私标签） | ✅ | `src/views/cards/CardDetail.vue` |
| 2.6 | 收藏 toggle 同步到 userStore.collectionCount | ✅ | `src/stores/cards.ts` |

## Phase 3 — 体验增强 ✅（已完成）

| # | 任务 | 状态 | 文件 |
|---|------|------|------|
| 3.1 | **保存图片** — html2canvas 将卡片 DOM 渲染为 PNG 并下载 | ✅ | `src/utils/saveCard.ts` + `CardDetail.vue` |
| 3.2 | **分享** — Web Share API（附带图片），剪贴板兜底 | ✅ | `CardDetail.vue` |
| 3.3 | **音频播放** — Web Audio API 生成模拟白噪音，含进度条/波形可视化 | ✅ | `src/views/cards/AudioPlayer.vue` |
| 3.4 | **卡片编辑** — CardCreate 支持 `?edit=id` 编辑模式，预填表单 | ✅ | `src/views/cards/CardCreate.vue` |
| 3.5 | **主题合集详情页** — 点击主题进入该主题下的卡片列表 | ✅ | `src/views/cards/TopicDetail.vue` + `router/index.ts` |
| 3.6 | **分页/无限滚动** — IntersectionObserver 触发，滚动到底加载更多 | ✅ | `src/stores/cards.ts` + `Cards.vue` |
| 3.7 | **收藏集管理** — 创建/删除收藏集，卡片加入/移出收藏集 | ✅ | `src/stores/cards.ts` + `CardDetail.vue` |
| 3.8 | **每日推送** — localStorage 记录每日首次访问，Element Plus 消息提示 | ✅ | `Cards.vue` |
| 3.9 | **社区广场** — 浏览其他用户公开卡片、点赞互动 | ✅ | `src/api/mock.ts` + `src/stores/cards.ts` + `Cards.vue` |

## Phase 4 — 搜索与发现 ✅（已完成）

| # | 任务 | 状态 | 文件 |
|---|------|------|------|
| 4.1 | **卡片搜索** — 搜索栏支持按内容/作者关键字过滤当前 Tab 卡片 | ✅ | `src/stores/cards.ts` + `Cards.vue` |

---

## 当前文件结构

```
src/views/cards/
├── Cards.vue           # 列表容器（路由入口，含无限滚动、每日推送）
├── CardDetail.vue      # 卡片详情（保存图片、分享、收藏集、编辑/删除）
├── CardCreate.vue      # 制作 & 编辑卡片
├── CardItem.vue        # 统一卡片渲染组件（4 种变体）
├── AudioPlayer.vue     # Web Audio API 音频播放器（波形可视化）
├── TopicDetail.vue     # 主题合集详情页

src/api/
├── cards.ts            # 卡片 API 层（支持分页）
├── mock.ts             # 扩展的数据模型（22 张系统卡片 + 3 张用户卡片 + 8 张社区卡片）
├── index.ts            # Axios 实例

src/stores/
├── cards.ts            # 卡片 Pinia Store（分页、收藏集、CRUD）
├── user.ts             # 用户 Store（含 collectionCount）

src/utils/
├── saveCard.ts         # html2canvas 导出卡片为图片工具
```

---

## 路由设计

```typescript
// src/router/index.ts
{
  path: '/cards',
  component: () => import('../views/cards/Cards.vue'),
  children: [
    { path: '',        name: 'Cards',                         },  // 列表页
    { path: 'create',  name: 'CardCreate', component: ...      },  // 制作页
    { path: ':id',     name: 'CardDetail', component: ...      },  // 详情页
  ],
}
```

---

## 状态管理核心 API

```typescript
// src/stores/cards.ts
const cardStore = useCardStore()

// 数据
cardStore.systemCards       // 系统卡片列表
cardStore.userCards         // 用户自己的卡片
cardStore.communityCards    // 社区卡片（其他用户公开）
cardStore.topics            // 主题合集
cardStore.activeTab         // 当前 Tab（recommend / my-cards / warm / audio / scene / community）
cardStore.searchQuery       // 搜索关键字
cardStore.loading / error   // 加载状态

// 计算属性
cardStore.displayCards      // 按 activeTab 筛选后的卡片
cardStore.searchedCards     // 搜索筛选后的卡片
cardStore.todayRecommend    // 今日推荐卡片（日期种子伪随机）
cardStore.userCardCount     // 我的创作数量
cardStore.collectedCount    // 已收藏数量（同步到 userStore）

// 操作
cardStore.fetchAllCards()          // 拉取全部数据
cardStore.setActiveTab(tab)        // 切换 Tab
cardStore.toggleCollect(id)        // 收藏/取消
cardStore.isCollected(id)          // 是否已收藏
cardStore.createUserCard(data)     // 创建用户卡片
cardStore.updateUserCard(id, data) // 更新用户卡片
cardStore.removeUserCard(id)       // 删除用户卡片
```
