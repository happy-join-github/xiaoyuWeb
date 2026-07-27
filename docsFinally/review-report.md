# 小愈 — 合并版 SQL 与 API 审查报告

> 审查日期：2026-07-27 · 翻新日期：2026-07-27
> 审查范围：schema-merged.sql（749 行）、api-merged.md（~1860 行）
> 审查方法：逐表/逐接口对照原始文档和前端源码交叉验证
>
> ⚠️ 本报告翻新记录：初版发现的问题大部分已在文档中修复。
> 以下标注「已修复」的问题代表文档已更正，不再需要处理；
> 标注「待修复」的问题代表文档中仍未改正，需继续修改。

---

## 一、SQL 审查（schema-merged.sql）

### 1.1 总体评价

合并后的 SQL 在结构上完整，18 张表覆盖了全部业务模块，依赖顺序正确，索引策略合理。原始文档中 treehole 种子数据的 `'tired'` bug 已被正确修复为 `'sad'`。以下按严重程度列出发现的问题。

### 1.2 已修复的严重问题

#### S1 — `topics.card_count` 冗余计数字段无触发器维护

**状态：已修复 ✅**

初版 `topics` 表定义了 `card_count` 作为"包含卡片数（冗余）"，但缺少触发器维护。文档翻新时选择了更合理的方案：**移除了 `topics.card_count` 字段**（因为单表只有几条到十几条记录，实时 COUNT 成本低），并在 SQL 注释中明确说明。

当前 `topics` 表简洁、无冗余计数，前端 `TopicItem.cardCount` 由服务端实时聚合。这是比加触发器更干净的方案。

#### S2 — `treehole_diary_drafts.emotion` 类型与同模块其他表不一致

**状态：已修复 ✅**

`treehole_emotion_tags.emotion` 使用 ENUM('happy','calm','sad','anxious','irritable','tearful') 约束，但 `treehole_diary_drafts.emotion` 原为 `VARCHAR(20)` 自由文本。两张表存储同一业务概念（情绪标签），类型应当一致。

当前 `treehole_diary_drafts.emotion` 已改为相同的 ENUM 类型（`DEFAULT NULL`，保留选填语义），保持全库情绪字段类型统一。

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
- ✅ `topics.card_count` 已移除（冗余计数器清理原则，改为实时 COUNT）
- ✅ `treehole_diary_drafts.emotion` 已从 VARCHAR(20) 改为 ENUM，与全库情绪字段类型统一

---

## 二、API 审查（api-merged.md）

### 2.1 总体评价

API 文档的模块覆盖和端点定义完整，47 个接口覆盖了全部业务模块，附录中的 TypeScript 模型和集成交接清单很有价值。初版发现的三个严重问题（F1 响应扁平化、收藏集 CRUD 缺失、接口总数错误）已在翻新中全部修复。

### 2.2 已修复的严重问题

#### S1 — F1 接口响应格式与 `updateProfile()` 函数不匹配

**状态：已修复 ✅**

初版 API 文档定义 F1 返回嵌套结构 `{ user: {...}, profile: {...} }`，但 Profile.vue 的 `userStore.updateProfile()` 期望扁平对象，且存在字段命名不统一问题。

文档翻新时已将 F1 响应改为扁平 camelCase 结构：

```json
{
  "data": {
    "name": "小柚子",
    "aiName": "小愈",
    "avatar": "🦊",
    "phone": "13800138000",
    "companionDays": 14,
    "chatRounds": 86,
    "diaryCount": 14,
    "collectionCount": 12,
    ...
  }
}
```

字段名全部统一 camelCase，与 store 函数参数完全匹配。API 文档第 1441 行明确标注：

> **前端对接**：`userStore.updateProfile(res.data)` — 响应字段与函数参数完全一一对应，无需转换。

#### S2 — 收藏集 CRUD API 完全缺失

**状态：已修复 ✅**

初版 API 文档缺少收藏集 CRUD 端点。文档翻新时已补充六个端点（E16-E21）：

| 编号 | 方法 | 路径 | 说明 |
|------|------|------|------|
| E16 | GET | /api/cards/collections/list | 获取收藏集列表 |
| E17 | POST | /api/cards/collections | 创建收藏集 |
| E18 | PUT | /api/cards/collections/:id | 更新收藏集名称 |
| E19 | DELETE | /api/cards/collections/:id | 删除收藏集 |
| E20 | POST | /api/cards/collections/:collectionId/cards | 添加卡片到收藏集 |
| E21 | DELETE | /api/cards/collections/:collectionId/cards/:cardId | 从收藏集移除卡片 |

前端 cards store 中已有的功能（`createCollection` / `deleteCollection` / `addCardToCollection` / `removeCardFromCollection` / `getCollectionsByCard`）现已全部有对应的 API 端点描述。

#### S3 — 接口总数标注错误

**状态：已修正 ✅**

初版标题写"接口总数：34 个"，但实际应为 41 个（加上补充的 6 个收藏集端点后为 47 个）。当前文档标题已更正为 47 个：

| 模块 | 端点数 |
|------|--------|
| A 认证 | 3 |
| B 聊天 | 7 |
| C 树洞 | 3 |
| D 心情 | 6 |
| E 卡片 | 21（含 E16-E21 收藏集） |
| F 用户 | 7 |
| **合计** | **47** |

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
| users.nickname | (F1) name / (F2) nickname | ⚠️ | F1 已改为扁平结构，直接映射 store 的 `name`；F2 用 `nickname` 系不同场景，无冲突 |
| user_profiles.ai_name | aiName | ✅ | snake↔camel 正常转换 |
| user_profiles.morning_greeting_time | morningGreeting | ⚠️ | SQL 列名含 `_time` 后缀，API 不含，后端序列化时映射即可 |
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

## 四、问题状态总览

| 优先级 | 编号 | 问题 | 状态 |
|--------|------|------|------|
| P0 | API-S1 | F1 响应格式与 store 不匹配 | ✅ 已修复（扁平 camelCase） |
| P0 | API-S3 | 接口总数 34→47 | ✅ 已更正 |
| P1 | API-S2 | 收藏集 CRUD API 缺失 | ✅ 已补充 E16-E21 |
| P1 | SQL-S1 | topics.card_count 无触发器 | ✅ 已移除冗余字段 |
| P2 | SQL-S2 | treehole_diary_drafts.emotion 类型不一致 | ✅ 已改为 ENUM |
| P2 | API-M1 | 通知设置未对接 | 🔄 待前端接入（后端 F5/F6 已就绪） |
| P2 | SQL-M1 | TINYINT 默认值字符串 | 📝 低优先级规范问题 |
| P3 | 其余 L 级问题 | 文档注释完善 | 📝 无功能影响 |

---

## 五、总结

**SQL 方面**：结构完整、索引设计合理。初版发现的 `topics.card_count` 问题（移除冗余字段）和 `treehole_diary_drafts.emotion` 类型不一致（改为 ENUM）均已在翻新中修复。当前设计原则清晰：仅保留有明确性能必要的冗余计数器（`chat_sessions.message_count` 应用层维护、`cards.likes_count` 触发器维护）。

**API 方面**：覆盖全面，47 个接口覆盖 6 个业务模块，F1 响应已扁平化为 camelCase 与 store 直接匹配，收藏集 CRUD 的 6 个端点（E16-E21）已补充。附录中的 TypeScript 数据模型、接口速查表、前后端对接检查清单完整可用。

**未解决问题**：
- 通知开关（`dailyCardPush` / `goodnightReminder` / `weeklyReport` / `checkinReminder`）当前为前端本地状态，Profile.vue 待接入 F5/F6 接口 — 后端 API 和 SQL 表已就绪
- `MoodRecord` 接口在 mock.ts（great/good/okay/bad/awful）与 store（happy/calm/sad/anxious/irritable/tearful）之间的不统一 — 后端实现以 API 文档为准，mock 数据后续统一
