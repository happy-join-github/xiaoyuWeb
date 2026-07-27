# 治愈卡片模块 — 后端接口设计

> 当前前端使用 Mock 数据，以下为后续对接真实后端时的接口契约。

---

## 数据模型

### Card（卡片）

```json
{
  "id": 1,
  "source": "system",           // "system" | "user"
  "type": "quote",              // "quote" | "audio" | "landscape" | "user-note"
  "content": "允许自己慢一点...", // 卡片正文（系统卡片必填）
  "category": "暖心话",
  "date": "暖心话 · No.142",
  "styleClass": "c-1",

  "author": "小柚子",            // 用户/社区卡片：作者昵称
  "createdAt": "2026-07-20",    // 用户/社区卡片：创建日期
  "bgTemplate": "warm",         // 用户/社区卡片：背景模板 warm|calm|dream
  "customText": "今天...",       // 用户/社区卡片：自定义文字
  "customImage": "",            // 用户/社区卡片：配图 URL
  "isPublic": false,            // 用户/社区卡片：是否公开（社区卡片均为 true）

  "likes": 42,
  "liked": false                // 当前登录用户是否已收藏
}
```

> 社区卡片与用户卡片共用同一数据模型（source 均为 `"user"`），区别在于社区卡片来源于其他用户且 `isPublic = true`。

### CardsTab（前端 Tab 类型）

```typescript
type CardsTab = 'recommend' | 'my-cards' | 'warm' | 'audio' | 'scene' | 'community'
```

| Tab | 含义 | 数据来源 |
|-----|------|---------|
| recommend | 今日推荐 | GET /api/cards/system（含每日推荐） |
| my-cards | 我的创作 | GET /api/cards/user |
| warm | 暖心话 | GET /api/cards/system?type=quote |
| audio | 声音 | GET /api/cards/system?type=audio |
| scene | 风景 | GET /api/cards/system?type=landscape |
| community | 广场 | GET /api/cards/community |

### Topic（主题合集）

```json
{
  "id": 1,
  "label": "睡前的轻声",
  "sub": "10 句话",
  "coverUrl": "",
  "cardIds": [1, 4, 5]
}
```

---

## 接口列表

### 1. 获取系统卡片列表

```
GET /api/cards/system
```

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数，默认 20 |
| type | string | 否 | 筛选类型：quote / audio / landscape |
| category | string | 否 | 筛选分类 |
| keyword | string | 否 | 搜索关键字，匹配卡片正文(content) |

**Response**

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

---

### 2. 获取每日推荐卡片

```
GET /api/cards/system/daily
```

返回当日推荐的系统卡片。服务端基于日期做伪随机，确保每天内容一致但每天不同。

**Response**

```json
{
  "code": 200,
  "data": CardItem
}
```

---

### 3. 获取单张系统卡片

```
GET /api/cards/system/:id
```

**Response**

```json
{
  "code": 200,
  "data": CardItem
}
```

---

### 4. 获取用户自己的卡片列表

```
GET /api/cards/user
```

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数，默认 20 |
| isPublic | bool | 否 | 筛选公开/私密 |
| keyword | string | 否 | 搜索关键字，匹配自定义文字(customText) |

**Response**

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

**注意**：此接口仅返回当前登录用户的卡片，无需传 userId，由 token 鉴权确定。

---

### 5. 创建用户卡片

```
POST /api/cards/user
```

**Request Body**

```json
{
  "bgTemplate": "warm",        // 必填：warm | calm | dream
  "customText": "今天...",     // 必填：卡片文字，最长 200 字
  "customImage": "",           // 可选：配图 URL
  "isPublic": false            // 必填：是否公开
}
```

**Response**

```json
{
  "code": 200,
  "data": CardItem        // 包含服务端生成的 id 和 createdAt
}
```

---

### 6. 更新用户卡片

```
PUT /api/cards/user/:id
```

**Request Body**

```json
{
  "bgTemplate": "calm",
  "customText": "修改后的文字...",
  "customImage": "",
  "isPublic": true
}
```

**Response**

```json
{
  "code": 200,
  "data": CardItem
}
```

---

### 7. 删除用户卡片

```
DELETE /api/cards/user/:id
```

**Response**

```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 8. 切换卡片可见性

```
PATCH /api/cards/user/:id/visibility
```

**Request Body**

```json
{
  "isPublic": true
}
```

**Response**

```json
{
  "code": 200,
  "data": CardItem
}
```

---

### 9. 获取已收藏卡片 ID 列表

```
GET /api/cards/collections
```

返回当前用户所有收藏的卡片 ID。

**Response**

```json
{
  "code": 200,
  "data": {
    "collectedIds": [1, 2, 5, 101]
  }
}
```

---

### 10. 收藏卡片

```
POST /api/cards/:id/collect
```

**Response**

```json
{
  "code": 200,
  "message": "收藏成功"
}
```

---

### 11. 取消收藏

```
DELETE /api/cards/:id/collect
```

**Response**

```json
{
  "code": 200,
  "message": "已取消收藏"
}
```

---

### 12. 获取主题合集列表

```
GET /api/cards/topics
```

**Response**

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

---

### 13. 获取主题合集下的卡片

```
GET /api/cards/topics/:topicId/cards
```

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 默认 1 |
| pageSize | int | 否 | 默认 20 |

**Response**

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

---

### 14. 获取社区广场卡片

```
GET /api/cards/community
```

返回其他用户设为公开的卡片列表。

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数，默认 20 |
| keyword | string | 否 | 搜索关键字，匹配自定义文字或作者名 |
| sortBy | string | 否 | 排序：latest（最新）/ popular（最受欢迎），默认 latest |

**Response**

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

---

### 15. 全局搜索卡片

```
GET /api/cards/search
```

在所有卡片（系统卡片 + 用户卡片 + 社区卡片）中搜索。

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键字 |
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数，默认 20 |
| source | string | 否 | 筛选来源：system / user |
| type | string | 否 | 筛选类型：quote / audio / landscape / user-note |

**Response**

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

## 通用响应格式

```json
{
  "code": 200,         // 200 成功，非 200 为业务错误
  "data": { ... },     // 业务数据
  "message": "success" // 错误时的提示文案
}
```

| code | 含义 |
|------|------|
| 200 | 成功 |
| 400 | 参数校验失败 |
| 401 | 未登录 / token 过期 |
| 403 | 无权限（如删除他人的卡片） |
| 404 | 卡片不存在 |
| 500 | 服务器内部错误 |

---

## 对接方式

当前 `src/api/cards.ts` 中所有函数均为 `async`，返回 `Promise`，与 Axios 调用模式一致。切换为真实接口时，只需将每个函数体内的 mock 调用替换为：

```typescript
import service from './index'

export async function fetchSystemCards(): Promise<CardItem[]> {
  const res = await service.get('/cards/system', { params: { page, pageSize } })
  return res.data.list
}
```

无需修改任何 View 或 Store 层的调用代码。
