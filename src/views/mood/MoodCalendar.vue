<template>
  <router-view v-if="isChildRoute" />
  <template v-else>
  <div class="screen-bg"></div>
  <StatusBar />

  <NavBar title="我的心情" left="back">
    <template #right>
      <router-link to="/mood/report" class="icon-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </router-link>
    </template>
  </NavBar>

  <div class="scroll-area no-scrollbar">
    <div class="month-stat fade-in">
      <div class="text">
        <h2>7 月 · 你的夏天</h2>
        <p>好心情居多，像冰淇淋一样甜 🍦</p>
      </div>
      <div class="data">
        <div class="num">14</div>
        <div class="label">打卡天数</div>
      </div>
    </div>

    <div class="calendar fade-up">
      <div class="cal-header">
        <button class="nav-btn" @click="prevMonth">
          <SvgIcon name="back" :size="14" />
        </button>
        <h3>2026 年 7 月</h3>
        <button class="nav-btn" @click="nextMonth">
          <SvgIcon name="right" :size="14" />
        </button>
      </div>
      <div class="weekdays">
        <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
      </div>
      <div class="days">
        <div
          v-for="(day, index) in days"
          :key="index"
          class="day"
          :class="{
            mute: day.mute,
            today: day.today,
            selected: day.selected
          }"
          @click="selectedDay = day"
        >
          {{ day.label }}
          <div v-if="day.dot" class="dot" :class="'d-' + day.dot"></div>
        </div>
      </div>
      <div class="legend">
        <span>心情：</span>
        <span class="row gap-4"><span class="dot d-1"></span>低落</span>
        <span class="row gap-4"><span class="dot d-3"></span>一般</span>
        <span class="row gap-4"><span class="dot d-5"></span>很好</span>
      </div>
    </div>

    <div class="day-detail fade-up">
      <div class="head">
        <div class="date-info">
          <div class="d1">7 月 19 日 · 周日</div>
          <div class="d2">今天</div>
        </div>
        <div class="day-emoji">😊</div>
      </div>
      <div class="body">
        <div class="quote">今天的天空很蓝，楼下咖啡店换了新豆子，意外好喝 ☕</div>
        <router-link class="link" to="/mood/detail">查看完整日记 →</router-link>
      </div>
    </div>

    <div class="entries">
      <div class="entry-grid fade-up">
        <router-link class="entry peach" to="/mood/report">
          <div class="ic-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/><path d="M7 12l4-4 4 6 5-8"/>
            </svg>
          </div>
          <div>
            <div class="t1">情绪周报</div>
            <div class="t2">这一周的你</div>
          </div>
        </router-link>
        <router-link class="entry blue" to="/cards">
          <div class="ic-box">
            <SvgIcon name="cards" :size="20" />
          </div>
          <div>
            <div class="t1">我的收藏</div>
            <div class="t2">12 张治愈卡片</div>
          </div>
        </router-link>
        <router-link class="entry sage" to="/profile/ai-settings">
          <div class="ic-box">
            <SvgIcon name="settings" :size="20" />
          </div>
          <div>
            <div class="t1">{{ userStore.aiName }}设置</div>
            <div class="t2">昵称 / 头像 / 称呼</div>
          </div>
        </router-link>
        <router-link class="entry cream" to="/profile/settings">
          <div class="ic-box">
            <SvgIcon name="bell" :size="20" />
          </div>
          <div>
            <div class="t1">通知设置</div>
            <div class="t2">晚安提醒等</div>
          </div>
        </router-link>
      </div>
    </div>
  </div>

  <TabBar activeKey="me" />
  </template>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import StatusBar from '../../components/StatusBar.vue'
import NavBar from '../../components/NavBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import TabBar from '../../components/TabBar.vue'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const userStore = useUserStore()
const isChildRoute = computed(() => route.path !== '/mood')
const selectedDay = ref<any>(null)

const days = [
  { label: '28', mute: true, dot: '4' },
  { label: '29', mute: true, dot: '3' },
  { label: '30', mute: true, dot: '2' },
  { label: '1', dot: '5' },
  { label: '2', dot: '4' },
  { label: '3', dot: '5' },
  { label: '4', dot: '3' },
  { label: '5', dot: '2' },
  { label: '6', dot: '4' },
  { label: '7', dot: '5' },
  { label: '8', dot: '4' },
  { label: '9', dot: '3' },
  { label: '10', dot: '5' },
  { label: '11', dot: '5' },
  { label: '12', dot: '4' },
  { label: '13', dot: '2' },
  { label: '14', dot: '3' },
  { label: '15', dot: '4' },
  { label: '16', dot: '5' },
  { label: '17', dot: '5' },
  { label: '18', dot: '4' },
  { label: '19', today: true, selected: true },
  { label: '20' },
  { label: '21' },
  { label: '22' },
  { label: '23' },
  { label: '24' },
  { label: '25' },
  { label: '26' },
  { label: '27' },
  { label: '28' },
  { label: '29' },
  { label: '30' },
  { label: '31' },
]

function prevMonth() {}
function nextMonth() {}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #FFF8F1 0%, #FFEFDF 100%);
}
.scroll-area {
  position: relative;
  z-index: 1;
}
.month-stat {
  margin: 8px 16px 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #FFE7D1 0%, #FFD4C2 100%);
  border-radius: 20px;
  color: #4A3A2E;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.month-stat .text h2 {
  font-size: 16px;
  font-weight: 600;
}
.month-stat .text p {
  font-size: 12px;
  color: #6B5A4D;
  margin-top: 4px;
}
.month-stat .data {
  text-align: right;
}
.month-stat .data .num {
  font-size: 22px;
  font-weight: 700;
  color: #E88A6B;
}
.month-stat .data .label {
  font-size: 11px;
  color: #6B5A4D;
}
.calendar {
  margin: 16px;
  background: #fff;
  border-radius: 20px;
  padding: 18px 14px;
  box-shadow: var(--shadow-sm);
}
.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 0 4px;
}
.cal-header h3 {
  font-size: 16px;
  font-weight: 600;
}
.cal-header .nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #FFF8F1;
  color: #9C8B7E;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  color: #9C8B7E;
  padding: 6px 0;
}
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 13px;
  color: #4A3A2E;
  position: relative;
  cursor: pointer;
}
.day.mute {
  color: #C4B5A6;
}
.day.today {
  background: #FFE7D1;
  font-weight: 700;
  color: #E88A6B;
}
.day .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 2px;
}
.day .dot.d-5 { background: #7BC97B; }
.day .dot.d-4 { background: #B6DB94; }
.day .dot.d-3 { background: #FFD68A; }
.day .dot.d-2 { background: #FFB085; }
.day .dot.d-1 { background: #E88A6B; }
.day.selected {
  background: #F4A988;
  color: #fff;
}
.day.selected .dot {
  display: none;
}
.legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 0 4px;
  font-size: 11px;
  color: #9C8B7E;
}
.legend .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.day-detail {
  margin: 0 16px 16px;
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  box-shadow: var(--shadow-sm);
}
.day-detail .head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.day-detail .date-info .d1 {
  font-size: 18px;
  font-weight: 600;
  color: #4A3A2E;
}
.day-detail .date-info .d2 {
  font-size: 12px;
  color: #9C8B7E;
  margin-top: 2px;
}
.day-detail .day-emoji {
  font-size: 36px;
}
.day-detail .body {
  margin-top: 16px;
}
.day-detail .body .quote {
  padding: 14px 16px;
  background: #FFF8F1;
  border-radius: 14px;
  font-size: 14px;
  color: #4A3A2E;
  line-height: 1.7;
  position: relative;
}
.day-detail .body .quote::before {
  content: "\201C";
  position: absolute;
  top: -8px;
  left: 12px;
  color: #F4A988;
  font-size: 40px;
  line-height: 1;
}
.day-detail .body .link {
  color: #E88A6B;
  font-size: 12px;
  margin-top: 10px;
  display: block;
}
.entries {
  padding: 0 16px 16px;
}
.entry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.entry {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: inherit;
  text-decoration: none;
}
.entry .ic-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.entry .t1 {
  font-size: 14px;
  font-weight: 600;
  color: #4A3A2E;
}
.entry .t2 {
  font-size: 11px;
  color: #9C8B7E;
}
.entry.peach .ic-box {
  background: linear-gradient(135deg, #FFD4C2 0%, #FFE7D1 100%);
  color: #E88A6B;
}
.entry.blue .ic-box {
  background: linear-gradient(135deg, #CDE3F2 0%, #E5F1F8 100%);
  color: #6BA4C9;
}
.entry.sage .ic-box {
  background: linear-gradient(135deg, #D8E4D2 0%, #E8F0E2 100%);
  color: #7BA970;
}
.entry.cream .ic-box {
  background: linear-gradient(135deg, #FFE7D1 0%, #FFF4E8 100%);
  color: #E88A6B;
}
</style>
