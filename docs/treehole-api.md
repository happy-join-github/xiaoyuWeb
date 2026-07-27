# 小愈 — 树洞模块 后端接口设计

> 当前前端使用 sessionStorage（情绪标签 + 日记草稿）和 localStorage 存储层（会话索引，`src/utils/chatStorage.ts`）。
> 以下为后续对接真实后端时的接口契约。
>
> 树洞的**会话与消息**复用聊聊模块的共享 API（`POST /api/chat/sessions`、`GET/POST /api/chat/sessions/:id/messages` 等），
> 区别仅在创建会话时传入 `type: "treehole"`。本文档仅列出树洞**独有**的接口。

---

## 数据模型

### TreeholeEmotionTag（树洞情绪标签）

```json
{
  "id": 1,
  "userId": 1,
  "sessionId": 1,
  "emotion": "anxious",
  "recordDate": "2026-07-27",
  "source": "treehole_prompt",
  "createdAt": "2026-07-27T09:40:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 记录ID |
| userId | int | 用户ID |
| sessionId | int | 来源树洞会话ID |
| emotion | enum | 情绪值：`happy` / `calm` / `sad` / `anxious` / `irritable` / `tearful` |
| recordDate | date | 标签所属日期（每人每天每种情绪仅一条） |
| source | enum | `treehole_prompt`（树洞触发提议）/ `manual`（手动记录） |
| createdAt | datetime | 创建时间 |

### 情绪枚举（与心情模块共用）

| 值 | 标签 | Emoji | 分数 | 颜色 |
|-----|------|-------|------|------|
| happy | 开心 | 😊 | 5 | #7BC97B |
| calm | 平静 | 😌 | 4 | #97D4A0 |
| sad | 低落 | 😔 | 2 | #B8A0D0 |
| anxious | 焦虑 | 😣 | 2 | #FFB085 |
| irritable | 烦躁 | 😡 | 1 | #E88A6B |
| tearful | 想哭 | 🥺 | 1 | #F4A988 |

---

## 接口列表

### 1. 创建树洞会话

```
POST /api/chat/sessions
```

复用聊聊模块的同一个接口，传入 `type: "treehole"`。

**Request Body**

```json
{
  "type": "treehole"
}
```

**Response**

```json
{
  "code": 200,
  "data": {
    "session": {
      "id": 4,
      "type": "treehole",
      "title": "树洞 · 07/27",
      "preview": "",
      "messageCount": 0,
      "lastMessageAt": null,
      "createdAt": "2026-07-27T09:20:00Z"
    }
  }
}
```

---

### 2. 发送树洞消息

```
POST /api/chat/sessions/:sessionId/messages
```

与聊聊模块相同的发送消息接口。服务端根据 `session.type === 'treehole'` 切换为树洞风格的 AI 回复。

**Request Body**

```json
{
  "content": "今天真的好累，所有事都堆在一起，不想和任何人说话。"
}
```

**Response**

```json
{
  "code": 200,
  "data": {
    "userMessage": ChatMessage,
    "aiMessage": {
      "id": 6,
      "sessionId": 4,
      "role": "ai",
      "content": "嗯…听起来真的很沉重。<br>累了就先这样待一会儿，不说话也没关系。",
      "time": "09:22",
      "createdAt": "2026-07-27T09:22:00Z"
    },
    "sessionTitle": "树洞 · 07/27"
  }
}
```

---

### 3. 记录情绪标签

```
POST /api/treehole/emotion
```

在树洞对话进行 3 轮后，用户选择情绪标签时调用。

**Request Body**

```json
{
  "sessionId": 4,
  "emotion": "anxious"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | int | 是 | 树洞会话 ID |
| emotion | string | 是 | 情绪枚举值：`happy` / `calm` / `sad` / `anxious` / `irritable` / `tearful` |

**Response**

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

> `isNew` 表示该情绪是否首次记录（每人每天每种情绪仅一条）。

---

### 4. 获取今日情绪标签

```
GET /api/treehole/emotion/today
```

返回用户今天在树洞中选择过的所有情绪标签。

**Response**

```json
{
  "code": 200,
  "data": {
    "tags": [ TreeholeEmotionTag, ... ],
    "date": "2026-07-27"
  }
}
```

---

### 5. 保存对话草稿到日记

```
POST /api/treehole/save-to-diary
```

将树洞对话摘要保存为心情记录（等价于调用了 `POST /api/mood/checkin`）。

**Request Body**

```json
{
  "sessionId": 4,
  "emotion": "anxious",
  "note": "今天真的好累 | 第三次返工了"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | int | 是 | 树洞会话 ID |
| emotion | string | 否 | 情绪标签（如已在本次会话中选择过，可传） |
| note | string | 否 | 日记摘要，从对话中提取，最长 50 字 |

**Response**

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
    },
    "message": "已保存到日记"
  }
}
```

---

## 通用响应格式

```json
{
  "code": 200,
  "data": { ... },
  "message": "success"
}
```

| code | 含义 |
|------|------|
| 200 | 成功 |
| 400 | 参数校验失败 |
| 401 | 未登录 / token 过期 |
| 403 | 无权限 |
| 404 | 会话/记录不存在 |
| 500 | 服务器内部错误 |

---

## 对接方式

当前树洞在以下位置使用内联数据：

### 情绪标签（Treehole.vue）

当前通过 `sessionStorage` 的 `treehole_emotion` 和 `treehole_diary_draft` 与 MoodCheckin 通信。
切换为真实接口后：

```typescript
import { recordEmotion, fetchTodayEmotions, saveToDiary } from '../api/treehole'

// 用户选择情绪标签
async function selectEmotion(value: string) {
  await recordEmotion({ sessionId, emotion: value })
  selectedEmotion.value = value
}

// 保存到日记
async function saveToDiary() {
  const res = await saveToDiary({ sessionId, emotion: selectedEmotion.value })
  router.push({ name: 'MoodCheckin' })
}
```

### AI 回复（aiReply.ts）

`src/views/treehole/aiReply.ts` 提供前端 mock 的 `getAiReply()` 函数，基于用户消息的关键词匹配和对话上下文生成治愈陪伴风格的回复。

当前该引擎已被 **ChatRoom 和 Treehole 共同引用**，两个模块共享同一套回复逻辑：

- Treehole：`import { getAiReply } from './aiReply'`
- ChatRoom：`import { getAiReply } from '../treehole/aiReply'`

替换为真实 AI 接口后，在两个页面的 `sendMessage()` 中调用 `POST /api/chat/sessions/:id/messages` 即可，无需经过 `aiReply.ts`。
