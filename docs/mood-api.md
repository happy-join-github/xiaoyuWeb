# 小愈 — 心情记录模块 后端接口设计

> 当前前端使用 Store 内联数据，以下为后续对接真实后端时的接口契约。

---

## 数据模型

### MoodRecord（心情记录）

```json
{
  "id": 1,
  "userId": 1,
  "recordDate": "2026-07-20",
  "mood": "happy",
  "score": 5,
  "note": "今天天气很好，出门拍了照片 📷",
  "keywords": ["天气", "拍照", "开心"],
  "createdAt": "2026-07-20T18:30:00Z"
}
```

### MoodConfig（情绪配置）

```json
{
  "mood": "happy",
  "label": "开心",
  "emoji": "😊",
  "score": 5,
  "color": "#7BC97B"
}
```

### WeeklyReport（周报）

```json
{
  "yearWeek": "2026-W29",
  "weekRange": "7.13 - 7.19",
  "recordCount": 7,
  "dominantMood": "calm",
  "avgScore": 3.6,
  "summaryText": "像被温柔地托着，慢慢稳下来",
  "keywords": ["工作压力", "好天气", "放松", "焦虑"]
}
```

### 情绪枚举

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

### 1. 获取情绪配置列表

```
GET /api/mood/config
```

返回所有情绪类型的标签、emoji、分数、颜色等展示配置。

**Response**

```json
{
  "code": 200,
  "data": {
    "configs": [ MoodConfig, ... ]
  }
}
```

---

### 2. 获取月度心情记录

```
GET /api/mood/records
```

按年月获取该月所有心情记录。

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| year | int | 是 | 年份，如 2026 |
| month | int | 是 | 月份 1-12 |

**Response**

```json
{
  "code": 200,
  "data": {
    "records": [ MoodRecord, ... ],
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

---

### 3. 获取单日心情记录

```
GET /api/mood/records/daily
```

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 是 | 日期，格式 YYYY-MM-DD |

**Response**

```json
{
  "code": 200,
  "data": MoodRecord
}
```

未记录时返回 `data: null`（非 404）。

---

### 4. 记录/更新今日心情

```
POST /api/mood/checkin
```

每人每天只能有一条记录，重复调用视为更新。

**Request Body**

```json
{
  "mood": "happy",
  "note": "今天天气很好 😊"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| mood | string | 是 | 情绪枚举值：happy / calm / sad / anxious / irritable / tearful |
| note | string | 否 | 今日小话，最长 50 字 |

**Response**

```json
{
  "code": 200,
  "data": MoodRecord,
  "message": "记录成功"
}
```

**业务规则**：
- 服务器以当前日期（`CURDATE()`）为准，前端传的 `date` 无效
- 如果当日已有记录，执行覆盖更新
- 返回包含完整 `MoodRecord`（含服务端生成的 `score`、`keywords` 等）

---

### 5. 获取周报

```
GET /api/mood/report
```

**Query Parameters**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| year | int | 否 | 年份，默认当前年 |
| week | int | 否 | 周数 1-53，默认当前周 |

**Response**

```json
{
  "code": 200,
  "data": {
    "report": WeeklyReport,
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

**说明**：
- 优先返回 `weekly_reports` 快照；若快照不存在，服务端实时聚合
- `dailyMoods` 为当周七天（周一至周日）的每日心情，无记录的日期可用 `null`

---

### 6. 获取连续打卡天数

```
GET /api/mood/streak
```

**Response**

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
| 400 | 参数校验失败（如 mood 值不合法、note 超长） |
| 401 | 未登录 / token 过期 |
| 500 | 服务器内部错误 |

---

## 对接方式

当前前端在 `src/stores/mood.ts` 中维护心情数据，所有记录为内存数组。
切换为真实接口时，需在 `src/api/` 下新增 `mood.ts`：

```typescript
import service from './index'
import type { MoodRecord, MoodType } from '../stores/mood'

export async function fetchMonthRecords(year: number, month: number): Promise<{
  records: MoodRecord[]; stats: any
}> {
  const res = await service.get('/mood/records', { params: { year, month } })
  return res.data
}

export async function fetchDailyRecord(date: string): Promise<MoodRecord | null> {
  const res = await service.get('/mood/records/daily', { params: { date } })
  return res.data
}

export async function checkin(mood: MoodType, note?: string): Promise<MoodRecord> {
  const res = await service.post('/mood/checkin', { mood, note })
  return res.data
}

export async function fetchWeeklyReport(year?: number, week?: number): Promise<{
  report: any; dailyMoods: any[]
}> {
  const res = await service.get('/mood/report', { params: { year, week } })
  return res.data
}
```

然后在 `stores/mood.ts` 中将内联数组替换为 API 调用即可，无需修改视图层。
