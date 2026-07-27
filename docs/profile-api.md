# 小愈 — 用户与个人设置 后端接口设计

> 当前前端使用 Mock / Store 内联数据，以下为后续对接真实后端时的接口契约。

---

## 数据模型

### User（用户账号）

```json
{
  "id": 1,
  "phone": "13800138000",
  "nickname": "小柚子",
  "avatar": "🦊",
  "createdAt": "2026-07-01T10:00:00Z"
}
```

### UserProfile（用户资料 + AI 设置）

```json
{
  "userId": 1,

  "aiName": "小愈",
  "voice": "温柔女声",
  "characterTags": ["聆听者", "知心朋友", "鼓励者"],
  "characterBio": "一个总是耐心倾听、温柔鼓励我的知心朋友",
  "morningGreeting": "08:00",
  "eveningGreeting": "22:00",

  "companionDays": 14,
  "chatRounds": 86,
  "diaryCount": 14,
  "collectionCount": 12
}
```

### UserSettings（应用设置）

```json
{
  "userId": 1,
  "themeKey": "morning",
  "darkMode": false,
  "anonymousMode": false
}
```

---

## 接口列表

### 1. 注册

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

---

### 2. 登录

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

### 3. 获取个人主页

```
GET /api/profile
```

返回用户资料 + 数据面板 + AI 伙伴信息。

**Response**

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

### 4. 编辑个人资料

```
PUT /api/profile
```

**Request Body**

```json
{
  "nickname": "小柚子",
  "avatar": "🦊"
}
```

**Response**

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

### 5. 获取 AI 设置

```
GET /api/profile/ai-settings
```

**Response**

```json
{
  "code": 200,
  "data": { UserProfile }
}
```

---

### 6. 更新 AI 设置

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

**Response**

```json
{
  "code": 200,
  "data": { UserProfile },
  "message": "保存成功"
}
```

---

### 7. 获取应用设置

```
GET /api/profile/settings
```

**Response**

```json
{
  "code": 200,
  "data": {
    "userSettings": { UserSettings },
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

---

### 8. 更新应用设置

```
PUT /api/profile/settings
```

**Request Body**

```json
{
  "themeKey": "forest",
  "darkMode": false,
  "anonymousMode": true
}
```

**Response**

```json
{
  "code": 200,
  "data": { UserSettings },
  "message": "保存成功"
}
```

---

### 9. 获取数据面板

```
GET /api/profile/stats
```

返回用户首页数据面板的统计数据。

**Response**

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

### 10. 退出登录

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
| 403 | 无权限 |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

---

## 对接方式

当前前端在 `src/stores/user.ts` 中维护用户状态，`updateProfile()` 方法直接修改内存数据。
切换为真实接口时，需在 `src/api/` 下新增 `profile.ts`：

```typescript
import service from './index'

export async function fetchProfile(): Promise<{ user: User; profile: UserProfile }> {
  const res = await service.get('/profile')
  return res.data
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await service.put('/profile', data)
  return res.data
}

export async function updateAiSettings(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await service.put('/profile/ai-settings', data)
  return res.data
}

export async function updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
  const res = await service.put('/profile/settings', data)
  return res.data
}
```

然后在 `stores/user.ts` 中将内联赋值替换为 API 调用即可，无需修改视图层。
