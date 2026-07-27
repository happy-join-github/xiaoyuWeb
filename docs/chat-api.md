# 小愈 — 聊聊模块 后端接口设计

> 当前前端使用 localStorage 存储层（`src/utils/chatStorage.ts`）替代 Mock 数据，实现了完整的消息发送、持久化和历史记录。
> 以下接口为后续对接真实后端时的契约，当前前端的 `chatStorage.ts` 已按此契约模式实现，切换时替换该文件即可。

---

## 数据模型

### ChatSession（聊天会话）

```json
{
  "id": "1743072000001",
  "userId": 1,
  "title": "工作的烦恼",
  "preview": "今天真的好累，所有事都堆在一起…",
  "type": "chat",
  "messageCount": 12,
  "lastMessageAt": "2026-07-27T09:33:00Z",
  "createdAt": "2026-07-27T09:20:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string / int | 会话ID（当前 localStorage 使用 string，后端可用 int） |
| userId | int | 用户ID |
| title | string | 会话标题（由 AI 根据第一轮对话自动生成） |
| preview | string | 最后一条消息的摘要 |
| type | enum | `chat`（日常聊天） |
| messageCount | int | 消息总数 |
| lastMessageAt | datetime | 最后一条消息时间 |
| createdAt | datetime | 创建时间 |

### ChatMessage（聊天消息）

```json
{
  "id": 1,
  "sessionId": 1,
  "role": "ai",
  "content": "早安呀 ☀️<br>睡得好吗？今天想聊点什么都可以哦~",
  "time": "09:32",
  "createdAt": "2026-07-27T09:32:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 消息ID |
| sessionId | int | 所属会话ID |
| role | enum | `ai` / `user` |
| content | string | 消息正文，支持 `<br>` 换行 |
| time | string | 格式化时间 `HH:mm` |
| createdAt | datetime | 发送时间 |

---

## 接口列表

### 1. 登录

```
POST /api/auth/login
```

**Request Body**

```json
{
  "phone": "13800138000",
  "password": "abc123456"
}
```

**Response**

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

---

### 2. 注册

```
POST /api/auth/register
```

**Request Body**

```json
{
  "phone": "13800138000",
  "password": "abc123456",
  "nickname": "小柚子"
}
```

**Response**

```json
{
  "code": 200,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "注册成功"
}
```

---

### 3. 退出登录

```
POST /api/auth/logout
```

**Headers**

| Header | 值 |
|--------|-----|
| Authorization | Bearer {accessToken} |

**Response**

```json
{
  "code": 200,
  "message": "退出成功"
}
```

---

### 4. 获取聊天会话列表

```
GET /api/chat/sessions
```

返回当前用户的所有聊天会话（type=chat），按最后消息时间倒序。

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数，默认 20 |

**Response**

```json
{
  "code": 200,
  "data": {
    "list": [ ChatSession, ... ],
    "total": 12,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 5. 创建聊天会话

```
POST /api/chat/sessions
```

**Request Body**

```json
{
  "type": "chat"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 固定为 `chat` |
| firstMessage | string | 否 | 可选，首条用户消息。如果提供，服务端返回 AI 首轮回复 |

**Response**

```json
{
  "code": 200,
  "data": {
    "session": ChatSession,
    "firstReply": "早安呀 ☀️<br>睡得好吗？今天想聊点什么都可以哦~"
  }
}
```

> `firstReply` 仅当 `firstMessage` 参数提供时返回。

---

### 6. 获取单条会话

```
GET /api/chat/sessions/:sessionId
```

**Response**

```json
{
  "code": 200,
  "data": {
    "session": ChatSession
  }
}
```

---

### 7. 删除会话

```
DELETE /api/chat/sessions/:sessionId
```

软删除（标记 `deleted_at`），不物理删除。

**Response**

```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 8. 获取会话消息列表

```
GET /api/chat/sessions/:sessionId/messages
```

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数，默认 50 |

**Response**

```json
{
  "code": 200,
  "data": {
    "list": [ ChatMessage, ... ],
    "total": 12,
    "page": 1,
    "pageSize": 50,
    "sessionTitle": "工作的烦恼"
  }
}
```

---

### 9. 发送消息（AI 对话）

```
POST /api/chat/sessions/:sessionId/messages
```

用户发送一条消息，服务端调用 AI 生成回复并自动存入消息列表。

**Request Body**

```json
{
  "content": "今天真的好累，所有事都堆在一起"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 用户消息正文，最长 500 字 |

**Response**

```json
{
  "code": 200,
  "data": {
    "userMessage": ChatMessage,
    "aiMessage": ChatMessage,
    "sessionTitle": "工作的烦恼"
  }
}
```

**业务规则**：
- 服务端生成 AI 回复后自动更新会话的 `title`（基于首轮对话摘要）、`preview`（最后一条消息摘要）、`messageCount`、`lastMessageAt`
- 如果当前是会话的第一条消息且 `title` 为空，AI 根据内容自动生成标题

---

### 10. 获取聊天历史列表（按周分组）

```
GET /api/chat/history
```

与 `/api/chat/sessions` 返回相同数据，专供 ChatHistory 页面使用，附加每周分组。

**Response**

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
| 403 | 无权限（如删除他人的会话） |
| 404 | 会话/消息不存在 |
| 500 | 服务器内部错误 |

---

## 对接方式

当前前端通过 `src/utils/chatStorage.ts` 实现完整的会话和消息 CRUD，ChatRoom.vue 中直接引用：

```typescript
import {
  getOrCreateLatestSession,
  getMessages,
  appendMessage,
  nextMessageId,
  getTimeString,
} from '../../utils/chatStorage'

// 进入聊天室 → 获取或创建会话
onMounted(() => {
  const s = getOrCreateLatestSession('chat')
  session.value = s
  messages.value = getMessages(s.id)
})

// 发送消息
async function sendMessage() {
  // 添加用户消息
  const userMsg: Message = { ... }
  messages.value.push(userMsg)
  appendMessage(session.value.id, userMsg)

  // 获取 AI 回复
  const reply = getAiReply(text, messages.value)
  const aiMsg: Message = { ... }
  messages.value.push(aiMsg)
  appendMessage(session.value.id, aiMsg)
}
```

**切换为真实后端时**，只需替换 `chatStorage.ts` 中的 localStorage 操作为 API 调用，保持函数签名不变：

```typescript
// chatStorage.ts 切换后（示意）
export async function getOrCreateLatestSession(type: 'chat') {
  const res = await fetch('/api/chat/sessions', { method: 'POST', body: JSON.stringify({ type }) })
  return res.data.session
}

export async function appendMessage(sessionId: string, msg: Message) {
  await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: msg.content }),
  })
}
```
