# 小愈 — 合并版 SQL 与 API 审查报告

> 审查日期：2026-07-27
> 审查范围：schema-merged.sql（748 行）、api-merged.md（717 行）
> 审查方法：逐表/逐接口对照原始文档和前端源码交叉验证

---

## 一、SQL 审查（schema-merged.sql）

### 1.1 总体评价

合并后的 SQL 在结构上完整，18 张表覆盖了全部业务模块，依赖顺序正确，索引策略合理。原始文档中 treehole 种子数据的 `'tired'` bug 已被正确修复为 `'sad'`。以下按严重程度列出发现的问题。

### 1.2 严重问题

#### S1 — `topics.card_count` 冗余计数字段无触发器维护

`topics` 表（第 439 行）定义了 `card_count` 字段作为"包含卡片数（冗余）"，但没有任何 INSERT/UPDATE/DELETE 触发器来维护它。当通过 `topic_cards` 表增删关联时，`topics.card_count` 不会自动更新，必然出现数据不一致。

**影响**：主题列表接口 E12 返回的 `cardCount` 与实际不符。

**修复建议**：在 `topic_cards` 表上增加 AFTER INSERT / AFTER DELETE 触发器自动维护 `topics.card_count`，或在合并 SQL 中明确标注此字段由应用层维护（而不只是标"冗余"）。

#### S2 — `treehole_diary_drafts.emotion` 类型与同模块其他表不一致

`treehole_emotion_tags.emotion`（第 551 行）使用 ENUM 约束，但 `treehole_diary_drafts.emotion`（第 583 行）使用 `VARCHAR(20)` 自由文本。两张表存储的是同一业务概念（情绪标签），类型应当一致。

**修复建议**：将 `treehole_diary_drafts.emotion` 也改为 ENUM 类型，或至少在 COMMENT 中说明为何此处不约束。

### 1.3 中等问题

#### M1 — TINYINT(1) 列默认值使用了字符串

`cards.is_public`（第 365 行）和 `cards.likes_count`（第 369 行）的 DEFAULT 值写成了字符串 `'0'`。虽然 MySQL 会隐式转换，但这是不良实践。

```sql
-- 当前（不良）
`is_public` TINYINT(1) NOT NULL DEFAULT '0'
`likes_count` INT UNSIGNED NOT NULL DEFAULT '0'

-- 应修正为
`is_public` TINYINT(1) NOT NULL DEFAULT 0
`likes_count` INT UNSIGNED NOT NULL DEFAULT 0
```

#### M2 — `mood_records.score` 默认值为 0 语义不清

第 264 行 `score TINYINT UNSIGNED NOT NULL DEFAULT 0`。实际上每条心情记录必然对应一个有效分值（1-5），业务代码也总是从 `mood_config` 取值。DEFAULT 0 在逻辑上没有意义。

**修复建议**：改为 `score TINYINT UNSIGNED NOT NULL`（无默认值），或在 COMMENT 中注明仅在插入异常时才为 0。

#### M3 — `user_daily_activity` 和 `daily_recommendations` 两张表无对应 API

这两张表在 SQL 中定义完整，但合并版 API 文档中没有任何接口对其进行读写。

- `user_daily_activity`：用于计算连续陪伴天数。当前 F7（stats）返回的是 user_profiles 中的冗余快照，如果后端改用此表实时计算，则应有对应查询逻辑。至少应在 SQL 注释中说明"由后端定时任务或事件驱动写入"。
- `daily_recommendations`：用于固定每日推荐。当前 E2 接口仅描述"基于日期伪随机"，未说明是否使用此表。

**修复建议**：在表注释中补充"写入方"说明（定时任务 / 应用层 / 事件触发）。

### 1.4 轻微问题

#### L1 — `chat_messages` 表缺少 `updated_at`

消息表是 append-only 的，没有 `updated_at` 是合理的。但若将来支持消息编辑，则需要补充。建议在 COMMENT 中注明"消息不可编辑，无需 updated_at"。

#### L2 — 索引 `idx_role` 的注释与实际用途不完全匹配

第 211 行 `INDEX idx_role (session_id, role) COMMENT '按角色统计消息数'`。这个索引的实际查询场景更可能是"查某个会话中所有 AI 消息"，而非仅统计。COMMENT 可以更完善。

#### L3 — 种子数据中部分日期的 `created_at` 未显式给出

聊天消息（第 675 行）和树洞情绪标签（第 722 行）的 INSERT 未提供 `created_at`，依赖 DEFAULT CURRENT_TIMESTAMP。这本身没问题，但若用于测试时间相关的功能（如 ChatHistory 按周分组），插入时间会全部相同，建议补充以增强种子数据的测试价值。

### 1.5 已正确修复的问题（确认）

- ✅ treehole 种子数据 `'tired'` → `'sad'`（第 723 行）
- ✅ `user_settings` 表新增了通知开关四个字段（第 109-112 行）
- ✅ `mood_config` 表新增 `created_at` 字段
- ✅ 补充了完整的种子数据（用户、心情、卡片、主题、会话、消息）

---

## 二、API 审查（api-merged.md）

### 2.1 总体评价

API 文档的模块覆盖和端点定义基本完整，附录中的 TypeScript 模型和集成交接清单很有价值。但存在一处致命的数据对接问题、一个硬数字错误，以及收藏集 API 的完整缺失。

### 2.2 严重问题

#### S1 — F1 接口响应格式与 `updateProfile()` 函数完全不匹配（致命）

**这是后端按此文档实现后将导致 Profile 页面全部数据无法正确渲染的致命问题。**

**API 文档定义的响应格式**（F1，第 1262-1288 行）：
```json
{
  "data": {
    "user": { "nickname": "小柚子", "avatar": "🦊", ... },
    "profile": { "aiName": "小愈", "voice": "温柔女声", ... }
  }
}
```

**Profile.vue 实际调用**（第 197-206 行）：
```typescript
const res = await service.get("/profile")
userStore.updateProfile(res.data)  // res.data = { user: {...}, profile: {...} }
```

**`updateProfile()` 函数签名**（user.ts 第 28-49 行）：
```typescript
function updateProfile(data: {
  name?: string;           // 期望 data.name（非 data.user.nickname）
  aiName?: string;         // 期望 data.aiName（非 data.profile.aiName）
  companion_days?: number; // snake_case（非 data.profile.companionDays）
  chat_rounds?: number;    // snake_case（非 data.profile.chatRounds）
  diary_count?: number;    // snake_case
  collection_count?: number;
  // ...
})
```

三重不匹配：
1. **结构层级不匹配**：API 返回嵌套 `{ user, profile }`，store 期望扁平对象
2. **字段名不匹配**：`nickname`（API）vs `name`（store）；`chatRounds`（API）vs `chat_rounds`（store 参数）vs `chatCount`（store 属性）
3. **命名风格混乱**：`updateProfile` 的参数列表中同时混用 camelCase（`aiName`, `morningGreeting`）和 snake_case（`companion_days`, `chat_rounds`, `diary_count`, `collection_count`）

**修复建议**：
- **选项 A（推荐）**：API 返回扁平结构，使用 snake_case 字段名，与 `updateProfile` 参数一致
- **选项 B**：在 Profile.vue 中做一层解包转换 `updateProfile({ ...res.data.user, ...res.data.profile })`，但字段名映射仍需处理
- **选项 C**：统一全部字段为 camelCase，同时修改 store 的 `updateProfile` 函数

需同步修正 API 文档第 1300-1316 行的"字段映射"表，使其与实际函数签名一致。

#### S2 — 收藏集（user_collections）的 CRUD API 完全缺失

SQL 中定义了 `user_collections` 和 `collection_cards` 两张表（第 475-508 行），前端 cards store 实现了完整的收藏集管理（`createCollection` / `deleteCollection` / `addCardToCollection` / `removeCardFromCollection` / `getCollectionsByCard`，cards.ts 第 227-261 行），但合并版 API 文档中完全没有对应端点。当前 `E9-E11` 三个接口只覆盖了 `user_favorites`（简单收藏/取消）。

**缺失的端点**：
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/cards/collections/list | 获取用户的所有收藏集 |
| POST | /api/cards/collections | 创建收藏集 |
| PUT | /api/cards/collections/:id | 重命名收藏集 |
| DELETE | /api/cards/collections/:id | 删除收藏集 |
| POST | /api/cards/collections/:id/cards | 添加卡片到收藏集 |
| DELETE | /api/cards/collections/:id/cards/:cardId | 从收藏集移除卡片 |
| GET | /api/cards/collections/:id/cards | 获取收藏集内的卡片列表 |

#### S3 — 接口总数标注错误

标题第 5 行写"接口总数：34 个"，但实际定义的端点为 **41 个**：

| 模块 | 端点数 |
|------|--------|
| A 认证 | 3 |
| B 聊天 | 7 |
| C 树洞 | 3 |
| D 心情 | 6 |
| E 卡片 | 15 |
| F 用户 | 7 |
| **合计** | **41** |

### 2.3 中等问题

#### M1 — 通知开关设置无法持久化

Profile.vue 的通知开关（dailyCardPush / goodnightReminder / weeklyReport / checkinReminder）使用 Vue `reactive()` 本地状态（第 185-190 行），未从服务器加载初始值，也未将变更保存到服务器。

虽然 API 文档的 F5/F6 和 SQL 的 `user_settings` 表已经为此做好了准备，但 Profile.vue 的实际代码未调用这些接口。

**修复建议**：在 API 文档 F5/F6 接口的说明中添加注释："前端当前为本地状态，待对接"。同时 Profile.vue 需要在 onMounted 中加载初始值，在 switch 变更时调用 PUT。

#### M2 — `daily_recommendations` 表与 E2 接口的对应关系未说明

E2（获取每日推荐卡片）描述为"基于日期伪随机，确保每天内容固定"，但未说明是否使用 `daily_recommendations` 表。如果使用，应该在接口说明中写明"数据来源于 daily_recommendations 表"；如果不使用，则 `daily_recommendations` 表成为孤儿表。

#### M3 — `B2` 接口的 `firstReply` 返回逻辑不精确

B2（创建会话）的响应中 `firstReply` 字段始终存在，但文档注释"仅当 firstMessage 参数提供时返回"。实际应明确：未提供 firstMessage 时 `firstReply` 为 `null`，或直接不返回该字段。

### 2.4 轻微问题

#### L1 — D4 接口的"以服务器当前日期为准"规则多余

D4 POST /api/mood/checkin 的请求体只有 `mood` 和 `note`，没有 `date` 字段。第 765 行的"前端传的 date 无效"这条规则在此处无对应参数，属于无的放矢。

#### L2 — ChatMessage 模型的 `time` 字段来源未说明

附录 ChatMessage 接口（第 1566 行）包含 `time: string // HH:mm 格式化`。这个字段不是数据库存储字段，应为前端根据 `createdAt` 计算得出。建议注明"非持久化字段，由服务端在序列化时根据 createdAt 格式化填充"。

#### L3 — `availableThemes` 应标注为静态数据

F5 响应中的 `availableThemes` 数组（第 1426-1432 行）是 5 套预设主题，不会随用户变化。建议标注为"静态参考数据，所有用户返回相同内容"，以便后端直接返回常量而非查表。

---

## 三、交叉一致性检查

### 3.1 SQL 字段 → API 字段映射验证

| SQL 字段 | API 字段 | 是否一致 | 备注 |
|----------|---------|---------|------|
| users.nickname | (F1) user.nickname / (F2) nickname | ⚠️ | API 内部一致但与 store 的 `name` 不一致 |
| user_profiles.chat_rounds | chatRounds | ✅ | snake↔camel 正常转换 |
| user_profiles.morning_greeting_time | morningGreeting | ⚠️ | SQL 列名含 `_time` 后缀，API 不含 |
| cards.date_label | date | ⚠️ | 字段名不同，需后端映射 |
| cards.likes_count | likes | ⚠️ | 字段名不同，需后端映射 |
| mood_records.record_date | recordDate | ✅ | snake↔camel |
| treehole_emotion_tags.record_date | recordDate | ✅ | 一致 |

### 3.2 原始文档覆盖确认

对照 5 份原始 API 文档（card/chat/mood/profile/treehole-api.md），合并版 API 已完整覆盖所有原始端点，并额外补充了：
- ✅ `GET /api/profile`（Profile.vue 直接调用）
- ✅ `GET/PUT /api/profile/settings` 中的通知开关字段
- ✅ `GET /api/profile/stats`（数据面板）

---

## 四、修复优先级

| 优先级 | 编号 | 问题 | 影响 |
|--------|------|------|------|
| **P0** | API-S1 | F1 响应格式与 store 不匹配 | Profile 页面数据无法渲染 |
| **P0** | API-S3 | 接口总数 34→41 | 文档硬错误 |
| **P1** | API-S2 | 收藏集 CRUD API 缺失 | 收藏集功能无法对接后端 |
| **P1** | SQL-S1 | topics.card_count 无触发器 | 数据不一致风险 |
| **P2** | SQL-S2 | treehole_diary_drafts.emotion 类型不一致 | 数据约束缺口 |
| **P2** | API-M1 | 通知设置未对接 | 功能不完整（前端+后端均需改） |
| **P2** | SQL-M1 | TINYINT 默认值字符串 | 代码规范问题 |
| **P3** | 其余 L 级问题 | 文档注释完善 | 无功能影响 |

---

## 五、总结

**SQL 方面**：结构完整、索引设计合理，主要问题是 `topics.card_count` 缺少维护机制，以及一些代码规范细节。

**API 方面**：覆盖全面，但 **F1 接口的响应格式与实际 store 函数签名存在致命不匹配**，这是后端按此文档实现后必定出现的问题，必须优先修复。此外收藏集 CRUD 的完全缺失也是一个显著的功能缺口。
