# 小愈 — 完整后端接口规范（业务合并版）

> 版本：v1.0
> 覆盖模块：认证 / 聊天 / 树洞 / 心情 / 卡片 / 用户
> 接口总数：47 个
>
> 说明：本文档基于前端源码实际调用逻辑与各模块 API 设计文档合并而成，
> 已补充 Profile.vue 中已接入但原 API 文档缺失的端点，并统一了所有模块的响应格式。

---

## 目录

- [通用规范](#通用规范)
- [A. 认证模块](#a-认证模块)
- [B. 聊天模块](#b-聊天模块聊聊--树洞)
- [C. 树洞模块](#c-树洞模块专有接口)
- [D. 心情记录模块](#d-心情记录模块)
- [E. 治愈卡片模块](#e-治愈卡片模块)
- [F. 用户与个人设置模块](#f-用户与个人设置模块)
- [附录一：接口速查表](#附录一接口速查表)
- [附录二：数据模型定义](#附录二数据模型定义)
- [附录三：前后端对接检查清单](#附录三前后端对接检查清单)

---

## 通用规范

### 基准 URL

```
/api
```

通过 Vite proxy 代理到后端。生产环境可通过 VITE_API_BASE 环境变量覆写。

### 通用响应格式

所有接口统一返回：

```json
{
  "code": 200,
  "data": { ... },
  "message": "success"
}
```

| code | 含义 | 说明 |
|------|------|------|
| 200 | 成功 | data 包含业务数据 |
| 400 | 参数校验失败 | message 描述具体错误 |
| 401 | 未登录 / token 过期 | 前端拦截器自动跳转登录页 |
| 403 | 无权限 | 如删除他人资源 |
| 404 | 资源不存在 | 如卡片/会话不存在 |
| 500 | 服务器内部错误 | 前端显示"服务器繁忙" |

### 认证方式

```
Authorization: Bearer {accessToken}
```

公开接口白名单（无需 token）：
- `POST /api/auth/login`
- `POST /api/auth/register`

### 分页规范

所有列表接口统一分页参数：

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| page | int | 否 | 1 | 页码，从 1 开始 |
| pageSize | int | 否 | 20 | 每页条数 |

分页响应结构：

```json
{
  "code": 200,
  "data": {
    "list": [ ... ],
    "total": 45,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## A. 认证模块

### A1. 注册

```
POST /api/auth/register
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号，唯一标识 |
| password | string | 是 | 密码，明文，服务端 bcrypt 加密存储 |
| nickname | string | 是 | 用户昵称 |

```json
{
  "phone": "13800138000",
  "password": "abc123456",
  "nickname": "小柚子"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "user": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "小柚子",
      "avatar": "🦊"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "注册成功"
}
```

**业务规则**：
- `phone` 唯一，重复返回 400
- 密码用 bcrypt 哈希，**不要用 passlib**（已停止维护），直接用 `bcrypt.hashpw`

---

### A2. 登录

```
POST /api/auth/login
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码明文 |

```json
{
  "phone": "13800138000",
  "password": "abc123456"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "user": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "小柚子",
      "avatar": "🦊"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "登录成功"
}
```

**业务规则**：
- token 使用 python-jose 生成 JWT，`sub` 字段必须为字符串（整数会抛 JWTClaimsError）
- 前端将 `userInfo`（含 `access_token`）存入 sessionStorage

---

### A3. 退出登录

```
POST /api/auth/logout
```

**Headers**: `Authorization: Bearer {accessToken}`

**Response** `200`

```json
{
  "code": 200,
  "message": "退出成功"
}
```

**业务规则**：
- 服务端应将 token 加入黑名单或标记过期
- 前端调用 `userStore.logout()` 清空 sessionStorage + localStorage + 跳转登录

---

## B. 聊天模块（聊聊 + 树洞）

> 树洞会话也使用本模块接口，通过请求体中的 `type: "treehole"` 区分。
> 树洞独有的业务接口见下一节。

### B1. 获取会话列表

```
GET /api/chat/sessions
```

**Query Parameters**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 20 | 每页条数 |
| type | string | 否 | — | 筛选类型：chat / treehole |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 1,
        "title": "工作的烦恼",
        "preview": "今天真的好累，所有事都堆在一起…",
        "type": "chat",
        "messageCount": 12,
        "lastMessageAt": "2026-07-27T09:33:00Z",
        "createdAt": "2026-07-27T09:20:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 20
  }
}
```

**业务规则**：
- 仅返回当前登录用户的会话（从 token 获取 userId）
- 按 `last_message_at DESC` 排序
- 软删除的会话不返回（`deleted_at IS NULL`）

---

### B2. 创建会话

```
POST /api/chat/sessions
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | `chat`（日常聊天）或 `treehole`（树洞倾诉） |
| firstMessage | string | 否 | 可选，首条用户消息。提供时服务端返回 AI 首轮回复 |

```json
{
  "type": "chat"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "session": {
      "id": 5,
      "userId": 1,
      "title": "新对话",
      "preview": "",
      "type": "chat",
      "messageCount": 0,
      "lastMessageAt": "2026-07-27T10:00:00Z",
      "createdAt": "2026-07-27T10:00:00Z"
    },
    "firstReply": "早安呀 ☀️<br>睡得好吗？今天想聊点什么都可以哦~"
  }
}
```

**业务规则**：
- `type="treehole"` 时，默认标题格式 "树洞 · MM/dd"，AI 回复采用深度共情风格
- `type="chat"` 时，默认标题 "新对话"，AI 回复采用日常陪伴风格
- `firstReply` 仅当 `firstMessage` 参数提供时返回

---

### B3. 获取单条会话

```
GET /api/chat/sessions/:sessionId
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "session": { ... ChatSession }
  }
}
```

---

### B4. 删除会话

```
DELETE /api/chat/sessions/:sessionId
```

**Response** `200`

```json
{
  "code": 200,
  "message": "删除成功"
}
```

**业务规则**：
- 软删除：更新 `deleted_at` 字段，不物理删除
- 消息保留（通过 session_id 可追溯）
- 只能删除自己的会话（403 越权）

---

### B5. 获取消息列表

```
GET /api/chat/sessions/:sessionId/messages
```

**Query Parameters**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 50 | 每页条数 |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "sessionId": 1,
        "role": "ai",
        "content": "早安呀 ☀️<br>睡得好吗？今天想聊点什么都可以哦~",
        "time": "09:32",
        "createdAt": "2026-07-27T09:32:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 50,
    "sessionTitle": "工作的烦恼"
  }
}
```

**业务规则**：
- 消息按 `created_at ASC` 排序（时间正序）
- `time` 字段为格式化显示时间，由前端计算（chatStorage.ts 的 formatTime 函数）

---

### B6. 发送消息（AI 对话核心接口）

```
POST /api/chat/sessions/:sessionId/messages
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 用户消息正文，最长 500 字 |

```json
{
  "content": "今天真的好累，所有事都堆在一起"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "userMessage": {
      "id": 13,
      "sessionId": 1,
      "role": "user",
      "content": "今天真的好累，所有事都堆在一起",
      "time": "09:34",
      "createdAt": "2026-07-27T09:34:00Z"
    },
    "aiMessage": {
      "id": 14,
      "sessionId": 1,
      "role": "ai",
      "content": "听起来真的很沉重。<br>累了就先这样待一会儿，慢慢说，我在听 💛",
      "time": "09:34",
      "createdAt": "2026-07-27T09:34:00Z"
    },
    "sessionTitle": "工作的烦恼"
  }
}
```

**核心业务规则**：
- **AI 风格切换**：根据 `session.type` 决定回复风格
  - `chat`：日常陪伴风格，语气温暖轻松，使用 AI 伙伴名字
  - `treehole`：深度共情风格，匿名不称呼用户，更侧重倾听和接纳
- **会话自动更新**：服务端自动更新 `title`（首条内容摘要）、`preview`（最后消息摘要）、`messageCount`、`lastMessageAt`
- **标题生成**：首条用户消息时自动生成标题
- **鉴权**：只能向自己的会话发消息

---

### B7. 获取聊天历史（按周分组）

```
GET /api/chat/history
```

专供 ChatHistory 页面使用。

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "groups": [
      {
        "weekLabel": "7 月 20 日 - 7 月 26 日",
        "sessions": [ ChatSession, ... ]
      },
      {
        "weekLabel": "7 月 13 日 - 7 月 19 日",
        "sessions": [ ChatSession, ... ]
      }
    ],
    "total": 5
  }
}
```

**业务规则**：
- 服务端按 `last_message_at` 时间跨度做周分组
- ChatHistory 前端还支持搜索过滤（本地按 title / preview 匹配）

---

## C. 树洞模块（专有接口）

> 聊天会话和消息复用 B 模块接口，创建时传入 `type: "treehole"`。
> 本部分仅定义树洞独有的 3 个接口。

### C1. 记录情绪标签

```
POST /api/treehole/emotion
```

在树洞对话进行 3 轮后，用户选择情绪标签时调用。

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | int | 是 | 树洞会话 ID |
| emotion | string | 是 | 情绪枚举值：`happy` / `calm` / `sad` / `anxious` / `irritable` / `tearful` |

```json
{
  "sessionId": 4,
  "emotion": "anxious"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "tag": {
      "id": 1,
      "userId": 1,
      "sessionId": 4,
      "emotion": "anxious",
      "recordDate": "2026-07-27",
      "source": "treehole_prompt",
      "createdAt": "2026-07-27T09:40:00Z"
    },
    "isNew": true
  }
}
```

**业务规则**：
- 每人每天每种情绪仅记录一条（幂等）
- `isNew` 表示该情绪是否首次记录（已有时为 false）
- 前端当前用 sessionStorage 桥接到 MoodCheckin，后端实现后可直接查此接口

---

### C2. 获取今日情绪标签

```
GET /api/treehole/emotion/today
```

返回用户今天在树洞中选择过的所有情绪标签。

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "tags": [
      {
        "id": 1,
        "userId": 1,
        "sessionId": 4,
        "emotion": "anxious",
        "recordDate": "2026-07-27",
        "source": "treehole_prompt",
        "createdAt": "2026-07-27T09:40:00Z"
      }
    ],
    "date": "2026-07-27"
  }
}
```

---

### C3. 保存对话草稿到日记

```
POST /api/treehole/save-to-diary
```

将树洞对话摘要保存为心情记录。

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | int | 是 | 树洞会话 ID |
| emotion | string | 否 | 情绪标签（如已在本次会话中选择过，可传） |
| note | string | 否 | 日记摘要，从对话中提取，最长 50 字 |

```json
{
  "sessionId": 4,
  "emotion": "anxious",
  "note": "今天真的好累 | 第三次返工了"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "moodRecord": {
      "id": 15,
      "mood": "anxious",
      "note": "今天真的好累 | 第三次返工了",
      "recordDate": "2026-07-27",
      "score": 2,
      "keywords": ["累", "工作"],
      "createdAt": "2026-07-27T09:45:00Z"
    }
  },
  "message": "已保存到日记"
}
```

**业务规则**：
- 服务端写入 `mood_records` 表（等价于调用了 D3 接口）
- 如果当日该用户已有心情记录，执行覆盖更新

---

## D. 心情记录模块

### D1. 获取情绪配置列表

```
GET /api/mood/config
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "configs": [
      { "mood": "happy", "label": "开心", "emoji": "😊", "score": 5, "color": "#7BC97B" },
      { "mood": "calm", "label": "平静", "emoji": "😌", "score": 4, "color": "#97D4A0" },
      { "mood": "sad", "label": "低落", "emoji": "😔", "score": 2, "color": "#B8A0D0" },
      { "mood": "anxious", "label": "焦虑", "emoji": "😣", "score": 2, "color": "#FFB085" },
      { "mood": "irritable", "label": "烦躁", "emoji": "😡", "score": 1, "color": "#E88A6B" },
      { "mood": "tearful", "label": "想哭", "emoji": "🥺", "score": 1, "color": "#F4A988" }
    ]
  }
}
```

---

### D2. 获取月度心情记录

```
GET /api/mood/records
```

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| year | int | 是 | 年份，如 2026 |
| month | int | 是 | 月份 1-12 |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "id": 1,
        "mood": "happy",
        "score": 5,
        "note": "今天天气很好 😊",
        "recordDate": "2026-07-20",
        "keywords": ["天气", "开心"],
        "createdAt": "2026-07-20T18:30:00Z"
      }
    ],
    "stats": {
      "monthCount": 14,
      "avgScore": 4.1,
      "summary": {
        "text": "好心情居多，像夏天的风一样温柔",
        "emoji": "✨"
      },
      "streakDays": 3
    }
  }
}
```

**业务规则**：
- 使用 `user_id + record_date BETWEEN` 查询
- `stats.streakDays` 计算到当天（即使当月未结束）

---

### D3. 获取单日心情记录

```
GET /api/mood/records/daily
```

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 是 | 日期，格式 YYYY-MM-DD |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "mood": "happy",
    "score": 5,
    "note": "今天天气很好 😊",
    "recordDate": "2026-07-20",
    "keywords": ["天气", "开心"],
    "createdAt": "2026-07-20T18:30:00Z"
  }
}
```

未记录时返回 `data: null`（非 404，保持 200）。

---

### D4. 记录/更新今日心情

```
POST /api/mood/checkin
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| mood | string | 是 | 情绪枚举值：happy / calm / sad / anxious / irritable / tearful |
| note | string | 否 | 今日小话，最长 50 字 |

```json
{
  "mood": "happy",
  "note": "今天天气很好 😊"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "id": 15,
    "mood": "happy",
    "score": 5,
    "note": "今天天气很好 😊",
    "recordDate": "2026-07-27",
    "keywords": ["天气", "开心"],
    "createdAt": "2026-07-27T18:30:00Z"
  },
  "message": "记录成功"
}
```

**业务规则**：
- 以服务器当前日期（`CURDATE()`）为准，前端传的 date 无效
- 当日已有记录 → 覆盖更新（`INSERT ... ON DUPLICATE KEY UPDATE`）
- `score` 根据 `mood_config` 自动填充
- `keywords` 可选，由服务端从 `note` 提取或 AI 生成

---

### D5. 获取周报

```
GET /api/mood/report
```

**Query Parameters**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| year | int | 否 | 当前年 | 年份 |
| week | int | 否 | 当前周 | 周数 1-53 |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "report": {
      "yearWeek": "2026-W29",
      "weekRange": "7.13 - 7.19",
      "recordCount": 7,
      "dominantMood": "calm",
      "avgScore": 3.6,
      "summaryText": "像被温柔地托着，慢慢稳下来",
      "keywords": ["工作压力", "好天气", "放松", "焦虑"]
    },
    "dailyMoods": [
      { "label": "一", "mood": "calm" },
      { "label": "二", "mood": "sad" },
      { "label": "三", "mood": "anxious" },
      { "label": "四", "mood": "calm" },
      { "label": "五", "mood": "happy" },
      { "label": "六", "mood": "sad" },
      { "label": "日", "mood": "calm" }
    ]
  }
}
```

**业务规则**：
- 优先返回 `weekly_reports` 快照；快照不存在时服务端实时聚合
- `dailyMoods` 为当周七天（周一至周日），无记录日期返回 `null`

---

### D6. 获取连续打卡天数

```
GET /api/mood/streak
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "streakDays": 3,
    "totalDays": 14
  }
}
```

| 字段 | 说明 |
|------|------|
| streakDays | 从今天起连续打卡天数（含今天） |
| totalDays | 历史总记录天数 |

**业务规则**：从今天倒序扫描 `mood_records`，遇到断点停止。

---

## E. 治愈卡片模块

### 数据模型速览

```typescript
// CardsTab — 前端 Tab 类型
type CardsTab = 'recommend' | 'my-cards' | 'warm' | 'audio' | 'scene' | 'community'

// 数据来源映射
// recommend → GET /api/cards/system（今日推荐）
// my-cards  → GET /api/cards/user
// warm      → GET /api/cards/system?type=quote
// audio     → GET /api/cards/system?type=audio
// scene     → GET /api/cards/system?type=landscape
// community → GET /api/cards/community
```

### E1. 获取系统卡片列表

```
GET /api/cards/system
```

**Query Parameters**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 20 | 每页条数 |
| type | string | 否 | — | 筛选类型：quote / audio / landscape |
| category | string | 否 | — | 筛选分类：暖心话 / 风景 / 声音 |
| keyword | string | 否 | — | 搜索关键字，匹配 content |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "list": [ CardItem, ... ],
    "total": 45,
    "page": 1,
    "pageSize": 20
  }
}
```

### E2. 获取每日推荐卡片

```
GET /api/cards/system/daily
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "source": "system",
    "type": "quote",
    "content": "允许自己慢一点…",
    "category": "暖心话",
    "date": "暖心话 · No.142",
    "styleClass": "c-1",
    "likes": 42,
    "liked": false
  }
}
```

**业务规则**：基于日期伪随机，确保每天内容固定。

### E3. 获取单张系统卡片

```
GET /api/cards/system/:id
```

**Response** `200`

```json
{
  "code": 200,
  "data": CardItem
}
```

### E4. 获取用户卡片列表

```
GET /api/cards/user
```

**Query Parameters**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 20 | 每页条数 |
| isPublic | bool | 否 | — | 筛选公开/私密 |
| keyword | string | 否 | — | 搜索关键字，匹配 customText |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "list": [ CardItem, ... ],
    "total": 12,
    "page": 1,
    "pageSize": 20
  }
}
```

> 从 token 获取用户 ID，无需传 userId。

### E5. 创建用户卡片

```
POST /api/cards/user
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| bgTemplate | string | 是 | `warm` / `calm` / `dream` |
| customText | string | 是 | 卡片文字，最长 200 字 |
| customImage | string | 否 | 配图 URL |
| isPublic | bool | 是 | 是否公开 |

```json
{
  "bgTemplate": "warm",
  "customText": "今天第一次自己做了顿饭，<br>虽然很简单，<br>但感觉生活有了温度。",
  "customImage": "",
  "isPublic": false
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "id": 104,
    "source": "user",
    "type": "user-note",
    "content": "",
    "category": "我的创作",
    "date": "",
    "styleClass": "user-1",
    "author": "小柚子",
    "createdAt": "2026-07-27",
    "bgTemplate": "warm",
    "customText": "今天第一次自己做了顿饭…",
    "customImage": "",
    "isPublic": false,
    "likes": 0,
    "liked": false
  }
}
```

**业务规则**：
- `author` 从用户资料同步
- `styleClass` 根据用户已有卡片数循环分配（user-1 ~ user-3）
- `type` 固定为 `user-note`

### E6. 更新用户卡片

```
PUT /api/cards/user/:id
```

**Request Body**（可选字段，只传需要更新的）

```json
{
  "bgTemplate": "calm",
  "customText": "修改后的文字…",
  "isPublic": true
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": CardItem
}
```

### E7. 删除用户卡片

```
DELETE /api/cards/user/:id
```

**Response** `200`

```json
{
  "code": 200,
  "message": "删除成功"
}
```

### E8. 切换卡片可见性

```
PATCH /api/cards/user/:id/visibility
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isPublic | bool | 是 | true=公开, false=私密 |

```json
{
  "isPublic": true
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": CardItem
}
```

### E9. 获取已收藏卡片 ID 列表

```
GET /api/cards/collections
```

返回当前用户所有收藏的卡片 ID。

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "collectedIds": [1, 2, 5, 101]
  }
}
```

### E10. 收藏卡片

```
POST /api/cards/:id/collect
```

**Response** `200`

```json
{
  "code": 200,
  "message": "收藏成功"
}
```

### E11. 取消收藏

```
DELETE /api/cards/:id/collect
```

**Response** `200`

```json
{
  "code": 200,
  "message": "已取消收藏"
}
```

### E12. 获取主题合集列表

```
GET /api/cards/topics
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "list": [
      { "id": 1, "label": "睡前的轻声", "sub": "10 句话", "coverUrl": "", "cardCount": 12 },
      { "id": 2, "label": "给焦虑的你", "sub": "致你", "coverUrl": "", "cardCount": 8 }
    ]
  }
}
```

### E13. 获取主题合集下的卡片

```
GET /api/cards/topics/:topicId/cards
```

**Query Parameters**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 20 | 每页条数 |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "list": [ CardItem, ... ],
    "total": 12,
    "topic": { "id": 1, "label": "睡前的轻声", "sub": "10 句话" }
  }
}
```

### E14. 获取社区广场卡片

```
GET /api/cards/community
```

**Query Parameters**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 20 | 每页条数 |
| keyword | string | 否 | — | 搜索关键字，匹配 customText 或 author |
| sortBy | string | 否 | latest | 排序：`latest`（最新）/ `popular`（最热） |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "list": [ CardItem, ... ],
    "total": 45,
    "page": 1,
    "pageSize": 20
  }
}
```

**业务规则**：
- 查询条件：`source='user' AND is_public=1 AND deleted_at IS NULL`
- `sortBy=latest` → `created_at DESC`
- `sortBy=popular` → `likes_count DESC`
- 排除当前登录用户自己的卡片

### E15. 全局搜索卡片

```
GET /api/cards/search
```

**Query Parameters**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| keyword | string | 是 | — | 搜索关键字 |
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 20 | 每页条数 |
| source | string | 否 | — | 筛选来源：system / user |
| type | string | 否 | — | 筛选类型：quote / audio / landscape / user-note |

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "list": [ CardItem, ... ],
    "total": 12,
    "keyword": "温暖",
    "page": 1,
    "pageSize": 20
  }
}
```

---

### E16. 获取收藏集列表

```
GET /api/cards/collections/list
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "name": "每日治愈",
        "cardCount": 5,
        "createdAt": "2026-07-20"
      },
      {
        "id": 2,
        "name": "金句合集",
        "cardCount": 3,
        "createdAt": "2026-07-22"
      }
    ]
  }
}
```

### E17. 创建收藏集

```
POST /api/cards/collections
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 收藏集名称，最长 50 字 |

```json
{
  "name": "每日治愈"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "id": 3,
    "name": "每日治愈",
    "cardCount": 0,
    "createdAt": "2026-07-27"
  },
  "message": "创建成功"
}
```

### E18. 更新收藏集名称

```
PUT /api/cards/collections/:id
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 新名称 |

```json
{
  "name": "我的金句本"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": { "id": 2, "name": "我的金句本", "cardCount": 3, "createdAt": "2026-07-22" },
  "message": "更新成功"
}
```

### E19. 删除收藏集

```
DELETE /api/cards/collections/:id
```

**Response** `200`

```json
{
  "code": 200,
  "message": "删除成功"
}
```

**业务规则**：删除收藏集时自动解除所有关联的 `collection_cards` 关系（物理删除关联表记录）。

### E20. 添加卡片到收藏集

```
POST /api/cards/collections/:collectionId/cards
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cardId | int | 是 | 卡片 ID |

```json
{
  "cardId": 101
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "id": 10,
    "collectionId": 1,
    "cardId": 101,
    "createdAt": "2026-07-27T10:00:00Z"
  },
  "message": "已添加到收藏集"
}
```

### E21. 从收藏集移除卡片

```
DELETE /api/cards/collections/:collectionId/cards/:cardId
```

**Response** `200`

```json
{
  "code": 200,
  "message": "已从收藏集移除"
}
```

---

## F. 用户与个人设置模块

### F1. 获取个人主页

```
GET /api/profile
```

> 前端 Profile.vue 的 `onMounted` 中已直接调用此接口。

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "name": "小柚子",
    "aiName": "小愈",
    "avatar": "🦊",
    "phone": "13800138000",
    "companionDays": 14,
    "chatRounds": 86,
    "diaryCount": 14,
    "collectionCount": 12,
    "voice": "温柔女声",
    "characterTags": ["聆听者", "知心朋友", "鼓励者"],
    "characterBio": "一个总是耐心倾听、温柔鼓励我的知心朋友",
    "morningGreeting": "08:00",
    "eveningGreeting": "22:00"
  }
}
```

**前端对接**：`userStore.updateProfile(res.data)` — 响应字段与函数参数完全一一对应，无需转换。

> `companionDays` / `chatRounds` / `diaryCount` / `collectionCount` 由服务端实时计算（分别基于 user_daily_activity、chat_messages、mood_records、user_favorites 表），非持久化字段。

---

### F2. 编辑个人资料

```
PUT /api/profile
```

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 用户昵称 |
| avatar | string | 否 | 头像 emoji |

```json
{
  "nickname": "小柚子",
  "avatar": "🦊"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "user": { User },
    "profile": { UserProfile }
  }
}
```

---

### F3. 获取 AI 设置

```
GET /api/profile/ai-settings
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "aiName": "小愈",
    "voice": "温柔女声",
    "characterTags": ["聆听者", "知心朋友", "鼓励者"],
    "characterBio": "一个总是耐心倾听、温柔鼓励我的知心朋友",
    "morningGreeting": "08:00",
    "eveningGreeting": "22:00"
  }
}
```

### F4. 更新 AI 设置

```
PUT /api/profile/ai-settings
```

**Request Body**

```json
{
  "aiName": "小愈",
  "voice": "温柔女声",
  "characterTags": ["聆听者", "知心朋友", "鼓励者"],
  "characterBio": "一个总是耐心倾听、温柔鼓励我的知心朋友",
  "morningGreeting": "08:00",
  "eveningGreeting": "22:00"
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": { UserProfile },
  "message": "保存成功"
}
```

### F5. 获取应用设置

```
GET /api/profile/settings
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "userSettings": {
      "themeKey": "morning",
      "darkMode": false,
      "anonymousMode": false,
      "dailyCardPush": true,
      "goodnightReminder": true,
      "weeklyReport": true,
      "checkinReminder": false
    },
    "availableThemes": [
      { "key": "morning", "name": "晨光", "desc": "金色晨曦 · 温暖治愈", "icon": "🌅", "color": "#FF9800" },
      { "key": "forest",  "name": "森语", "desc": "薄荷森林 · 自然疗愈", "icon": "🌿", "color": "#5CA050" },
      { "key": "flower",  "name": "花信", "desc": "樱花和风 · 温柔浪漫", "icon": "🌸", "color": "#E06080" },
      { "key": "moon",    "name": "月汐", "desc": "深蓝月色 · 平静安宁", "icon": "🌙", "color": "#5880B8" },
      { "key": "tea",     "name": "暖茶", "desc": "焦糖暖意 · 温润醇厚", "icon": "🍵", "color": "#B89060" }
    ]
  }
}
```

> 注：`dailyCardPush` / `goodnightReminder` / `weeklyReport` / `checkinReminder` 四个通知设置字段为代码分析补充，原 API 文档未覆盖。对应 `user_settings` 表新增字段。

### F6. 更新应用设置

```
PUT /api/profile/settings
```

**Request Body**

```json
{
  "themeKey": "forest",
  "darkMode": false,
  "anonymousMode": true,
  "dailyCardPush": true,
  "goodnightReminder": false
}
```

**Response** `200`

```json
{
  "code": 200,
  "data": { UserSettings },
  "message": "保存成功"
}
```

### F7. 获取数据面板

```
GET /api/profile/stats
```

**Response** `200`

```json
{
  "code": 200,
  "data": {
    "companionDays": 14,
    "chatRounds": 86,
    "diaryCount": 14,
    "collectionCount": 12
  }
}
```

---

## 附录一：接口速查表

| 编号 | 方法 | 路径 | 模块 | 说明 |
|------|------|------|------|------|
| A1 | POST | /api/auth/register | 认证 | 注册 |
| A2 | POST | /api/auth/login | 认证 | 登录 |
| A3 | POST | /api/auth/logout | 认证 | 退出登录 |
| B1 | GET | /api/chat/sessions | 聊天 | 会话列表 |
| B2 | POST | /api/chat/sessions | 聊天 | 创建会话 |
| B3 | GET | /api/chat/sessions/:id | 聊天 | 单条会话 |
| B4 | DELETE | /api/chat/sessions/:id | 聊天 | 删除会话 |
| B5 | GET | /api/chat/sessions/:id/messages | 聊天 | 消息列表 |
| B6 | POST | /api/chat/sessions/:id/messages | 聊天 | 发送消息（AI） |
| B7 | GET | /api/chat/history | 聊天 | 历史（按周分组） |
| C1 | POST | /api/treehole/emotion | 树洞 | 记录情绪标签 |
| C2 | GET | /api/treehole/emotion/today | 树洞 | 今日情绪标签 |
| C3 | POST | /api/treehole/save-to-diary | 树洞 | 保存到日记 |
| D1 | GET | /api/mood/config | 心情 | 情绪配置列表 |
| D2 | GET | /api/mood/records | 心情 | 月度记录 |
| D3 | GET | /api/mood/records/daily | 心情 | 单日记录 |
| D4 | POST | /api/mood/checkin | 心情 | 记录今日心情 |
| D5 | GET | /api/mood/report | 心情 | 周报 |
| D6 | GET | /api/mood/streak | 心情 | 连续打卡天数 |
| E1 | GET | /api/cards/system | 卡片 | 系统卡片列表 |
| E2 | GET | /api/cards/system/daily | 卡片 | 每日推荐 |
| E3 | GET | /api/cards/system/:id | 卡片 | 单张系统卡片 |
| E4 | GET | /api/cards/user | 卡片 | 用户卡片列表 |
| E5 | POST | /api/cards/user | 卡片 | 创建用户卡片 |
| E6 | PUT | /api/cards/user/:id | 卡片 | 更新用户卡片 |
| E7 | DELETE | /api/cards/user/:id | 卡片 | 删除用户卡片 |
| E8 | PATCH | /api/cards/user/:id/visibility | 卡片 | 切换可见性 |
| E9 | GET | /api/cards/collections | 卡片 | 已收藏 ID 列表 |
| E10 | POST | /api/cards/:id/collect | 卡片 | 收藏 |
| E11 | DELETE | /api/cards/:id/collect | 卡片 | 取消收藏 |
| E12 | GET | /api/cards/topics | 卡片 | 主题合集列表 |
| E13 | GET | /api/cards/topics/:topicId/cards | 卡片 | 主题下卡片 |
| E14 | GET | /api/cards/community | 卡片 | 社区广场 |
| E15 | GET | /api/cards/search | 卡片 | 全局搜索 |
| E16 | GET | /api/cards/collections/list | 卡片 | 收藏集列表 |
| E17 | POST | /api/cards/collections | 卡片 | 创建收藏集 |
| E18 | PUT | /api/cards/collections/:id | 卡片 | 更新收藏集名称 |
| E19 | DELETE | /api/cards/collections/:id | 卡片 | 删除收藏集 |
| E20 | POST | /api/cards/collections/:collectionId/cards | 卡片 | 添加到收藏集 |
| E21 | DELETE | /api/cards/collections/:collectionId/cards/:cardId | 卡片 | 从收藏集移除 |
| F1 | GET | /api/profile | 用户 | 个人主页 |
| F2 | PUT | /api/profile | 用户 | 编辑资料 |
| F3 | GET | /api/profile/ai-settings | 用户 | AI 设置 |
| F4 | PUT | /api/profile/ai-settings | 用户 | 更新 AI 设置 |
| F5 | GET | /api/profile/settings | 用户 | 应用设置 |
| F6 | PUT | /api/profile/settings | 用户 | 更新应用设置 |
| F7 | GET | /api/profile/stats | 用户 | 数据面板 |

---

## 附录二：数据模型定义

```typescript
// ====== 通用 ======
interface ApiResponse<T> {
  code: number        // 200=成功
  data: T
  message: string
}

interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ====== 聊天 ======
interface ChatSession {
  id: number
  userId: number
  title: string | null
  preview: string | null
  type: 'chat' | 'treehole'
  messageCount: number
  lastMessageAt: string | null   // ISO datetime
  createdAt: string              // ISO datetime
}

interface ChatMessage {
  id: number
  sessionId: number
  role: 'ai' | 'user'
  content: string
  time: string                   // HH:mm 格式化
  createdAt: string              // ISO datetime
}

// ====== 心情 ======
type MoodType = 'happy' | 'calm' | 'sad' | 'anxious' | 'irritable' | 'tearful'

interface MoodConfig {
  mood: MoodType
  label: string
  emoji: string
  score: number
  color: string
}

interface MoodRecord {
  id: number
  userId: number
  recordDate: string             // YYYY-MM-DD
  mood: MoodType
  score: number
  note: string | null
  keywords: string[] | null
  createdAt: string
}

interface WeeklyReport {
  yearWeek: string               // "2026-W29"
  weekRange: string | null
  recordCount: number
  dominantMood: string | null
  avgScore: number | null
  summaryText: string | null
  keywords: string[] | null
}

// ====== 卡片 ======
type CardSource = 'system' | 'user'
type CardType = 'quote' | 'audio' | 'landscape' | 'user-note'

interface CardItem {
  id: number
  source: CardSource
  type: CardType
  content: string                // 系统卡片正文
  category: string
  date: string                   // 展示标签
  styleClass: string             // 样式变体
  author?: string                // 用户卡片作者
  createdAt?: string             // 用户卡片创建日期
  bgTemplate?: string            // warm | calm | dream
  customText?: string            // 用户卡片文字
  customImage?: string           // 用户卡片配图
  isPublic?: boolean
  likes: number
  liked: boolean
}

interface TopicItem {
  id: number
  label: string
  sub: string
  coverUrl?: string
  cardCount?: number
}

// ====== 用户 ======
interface User {
  id: number
  phone: string
  nickname: string
  avatar: string
  createdAt: string
}

interface UserProfile {
  name: string                   // 用户昵称
  phone: string                  // 手机号
  avatar: string                 // 头像 emoji
  aiName: string                 // AI 伙伴名
  voice: string                  // 声线
  characterTags: string[]
  characterBio: string | null
  morningGreeting: string        // HH:mm
  eveningGreeting: string        // HH:mm
  companionDays: number          // 实时计算（user_daily_activity）
  chatRounds: number             // 实时计算（chat_messages）
  diaryCount: number             // 实时计算（mood_records）
  collectionCount: number        // 实时计算（user_favorites）
}

interface UserSettings {
  themeKey: string               // morning|forest|flower|moon|tea
  darkMode: boolean
  anonymousMode: boolean
  dailyCardPush: boolean
  goodnightReminder: boolean
  weeklyReport: boolean
  checkinReminder: boolean
}

// ====== 收藏集 ======
interface Collection {
  id: number
  name: string
  cardCount: number
  createdAt: string              // YYYY-MM-DD
}

// ====== 树洞 ======
interface TreeholeEmotionTag {
  id: number
  userId: number
  sessionId: number
  emotion: MoodType
  recordDate: string
  source: 'treehole_prompt' | 'manual'
  createdAt: string
}
```

---

## 附录三：前后端对接检查清单

### 已对接（前端有代码调用）

| 接口 | 前端位置 | 状态 |
|------|---------|------|
| POST /api/auth/login | Login.vue 登录表单 | ✅ Mock 替换后生效 |
| POST /api/auth/register | Register.vue 注册表单 | ✅ Mock 替换后生效 |
| POST /api/auth/logout | userStore.logout() | ✅ Mock 替换后生效 |
| GET /api/profile | Profile.vue onMounted 直接调用 | ✅ **已接入**（Mock 下静默失败） |
| GET/POST /api/chat/sessions | chatStorage.ts | 🔄 localStorage 实现 |
| GET/POST /api/chat/sessions/:id/messages | chatStorage.ts | 🔄 localStorage 实现 |
| 卡片 CRUD 全部接口 | api/cards.ts → mock.ts | 🔄 Mock 数据 |

### 待对接（前端待新增 API 层）

| 接口 | 建议 API 文件名 | 优先级 |
|------|---------------|--------|
| POST /api/treehole/emotion | src/api/treehole.ts | P1 |
| GET /api/treehole/emotion/today | src/api/treehole.ts | P1 |
| POST /api/treehole/save-to-diary | src/api/treehole.ts | P1 |
| 心情全部 6 个接口 | src/api/mood.ts | P0 |
| 用户设置 4 个接口 | src/api/profile.ts | P0 |

### Python 后端注意事项（从现有经验总结）

| 注意点 | 说明 |
|--------|------|
| python-jose JWT sub | `sub` 必须是字符串，整数会抛 JWTClaimsError |
| passlib 弃用 | passlib 已停止维护，与 bcrypt>=5.0 不兼容，直接用 `bcrypt.hashpw` |
| FastAPI 目录结构 | core/(config+security) → db/(session+models) → schemas/ → crud/ → router/ |
| Windows GBK 兼容 | Windows terminal 在 Unicode 字符上崩溃，打印用 ASCII 安全字符串如 `[OK]` |
| Vite proxy | 开发时 `/api` 通过 Vite proxy 转发到后端，目标地址由 `VITE_API_TARGET` 环境变量指定 |
