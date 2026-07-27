<template>
  <div class="screen-bg"></div>
  <StatusBar />

  <div class="content no-scrollbar">
    <div class="nav">
      <button class="back" @click="router.back()">
        <SvgIcon name="back" :size="20" />
      </button>
      <button class="share-btn" @click="onShare">
        <SvgIcon name="share" :size="18" />
      </button>
    </div>

    <div class="hero fade-in">
      <div class="week">WEEK 29 · 7.13 - 7.19</div>
      <h1>这一周的你 ✨</h1>
      <p>像被温柔地托着，慢慢稳下来</p>
    </div>

    <div class="section-card fade-up">
      <div class="head">
        <h3>情绪曲线</h3>
        <span class="sub">平均 4.1 / 5</span>
      </div>
      <div class="chart">
        <svg viewBox="0 0 320 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F4A988" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#F4A988" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <line x1="0" y1="35" x2="320" y2="35" stroke="#F1E5D7" stroke-dasharray="3 3"/>
          <line x1="0" y1="70" x2="320" y2="70" stroke="#F1E5D7" stroke-dasharray="3 3"/>
          <line x1="0" y1="105" x2="320" y2="105" stroke="#F1E5D7" stroke-dasharray="3 3"/>
          <path d="M 25 60 L 70 45 L 115 70 L 160 25 L 205 35 L 250 50 L 295 20 L 295 140 L 25 140 Z" fill="url(#lineGrad)"/>
          <path d="M 25 60 L 70 45 L 115 70 L 160 25 L 205 35 L 250 50 L 295 20" fill="none" stroke="#E88A6B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="25" cy="60" r="4" fill="#fff" stroke="#E88A6B" stroke-width="2"/>
          <circle cx="70" cy="45" r="4" fill="#fff" stroke="#E88A6B" stroke-width="2"/>
          <circle cx="115" cy="70" r="4" fill="#fff" stroke="#E88A6B" stroke-width="2"/>
          <circle cx="160" cy="25" r="4" fill="#fff" stroke="#E88A6B" stroke-width="2"/>
          <circle cx="205" cy="35" r="4" fill="#fff" stroke="#E88A6B" stroke-width="2"/>
          <circle cx="250" cy="50" r="4" fill="#fff" stroke="#E88A6B" stroke-width="2"/>
          <circle cx="295" cy="20" r="5" fill="#E88A6B"/>
        </svg>
      </div>
      <div class="chart-labels">
        <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span class="active">日</span>
      </div>
    </div>

    <div class="section-card fade-up">
      <div class="head">
        <h3>本周关键词</h3>
        <span class="sub">共 24 个</span>
      </div>
      <div class="kw-cloud">
        <div class="kw hot">#工作压力</div>
        <div class="kw hot">#好天气</div>
        <div class="kw">#咖啡</div>
        <div class="kw">#运动</div>
        <div class="kw">#失眠</div>
        <div class="kw">#追剧</div>
        <div class="kw">#朋友</div>
      </div>
    </div>

    <div class="weekly-letter fade-up">
      <div class="text">{{ userStore.name }}，这一周你辛苦了 💛<br><br>周中有一阵子看起来有点累，但慢慢地，你又把自己找回来了。喜欢看你写下的那些小事——天气、咖啡、窗外的猫，它们是这一周里最温柔的部分。<br><br>下周想不想试试：<b>每天给自己 5 分钟</b>，做一件只为自己、不为别人的小事？</div>
      <div class="sign">— {{ userStore.aiName }} 🌸</div>
    </div>

    <div class="section-card fade-up">
      <div class="head"><h3>这一周的数据</h3></div>
      <div class="stats">
        <div class="stat"><div class="num">7</div><div class="label">打卡天数</div></div>
        <div class="stat"><div class="num">23</div><div class="label">聊天轮次</div></div>
        <div class="stat"><div class="num">12</div><div class="label">收藏卡片</div></div>
      </div>
    </div>

    <div class="suggest fade-up">
      <div class="ic">
        <SvgIcon name="sparkle" :size="18" />
      </div>
      <div class="text"><b>下周小挑战：</b>尝试一次 5 分钟冥想 🌙</div>
    </div>

    <div class="action-row">
      <el-button round @click="onShare">
        <SvgIcon name="share" :size="16" />
        分享周报
      </el-button>
      <el-button round @click="onFavorite">
        <SvgIcon name="heart" :size="16" />
        收藏
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'
import StatusBar from '../../components/StatusBar.vue'
import SvgIcon from '../../components/SvgIcon.vue'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

function onShare() {}
function onFavorite() {}
</script>

<style scoped>
.screen-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, #FFEFDF 0%, #FFD4C2 50%, #CDE3F2 100%);
}
.content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 24px;
}
.content::-webkit-scrollbar {
  display: none;
}
.nav {
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav .back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A3A2E;
  border: none;
  cursor: pointer;
}
.nav .share-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9C8B7E;
  border: none;
  cursor: pointer;
}
.hero {
  margin: 8px 0 16px;
  padding: 24px 20px;
  background: linear-gradient(135deg, #FFE7D1 0%, #FFD4C2 100%);
  border-radius: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: "";
  position: absolute;
  top: -30px;
  right: -30px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, #fff 0%, transparent 70%);
  opacity: 0.3;
}
.hero .week {
  font-size: 12px;
  color: #9C8B7E;
  letter-spacing: 1px;
}
.hero h1 {
  font-size: 24px;
  color: #4A3A2E;
  margin: 6px 0 4px;
}
.hero p {
  font-size: 13px;
  color: #6B5A4D;
}
.section-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: var(--shadow-sm);
}
.section-card .head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-card .head h3 {
  font-size: 15px;
  font-weight: 600;
  color: #4A3A2E;
}
.section-card .head .sub {
  font-size: 11px;
  color: #9C8B7E;
}
.chart {
  height: 140px;
  position: relative;
}
.chart svg {
  width: 100%;
  height: 100%;
}
.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 8px 6px 0;
  font-size: 11px;
  color: #9C8B7E;
}
.chart-labels .active {
  color: #E88A6B;
  font-weight: 600;
}
.kw-cloud {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.kw {
  padding: 6px 14px;
  background: #FFF8F1;
  border-radius: 999px;
  font-size: 13px;
  color: #4A3A2E;
}
.kw.hot {
  background: #FFD4C2;
  color: #E88A6B;
  font-weight: 600;
}
.weekly-letter {
  background: linear-gradient(135deg, #FFF8F1 0%, #FFE7D1 100%);
  border-radius: 18px;
  padding: 18px 20px;
  margin-bottom: 14px;
  position: relative;
}
.weekly-letter::before {
  content: "\201C";
  position: absolute;
  top: -4px;
  left: 18px;
  font-size: 60px;
  color: #F4A988;
  line-height: 1;
}
.weekly-letter .text {
  font-size: 14px;
  line-height: 1.85;
  color: #4A3A2E;
}
.weekly-letter .sign {
  margin-top: 12px;
  text-align: right;
  font-size: 12px;
  color: #9C8B7E;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat {
  text-align: center;
  padding: 14px 8px;
  background: #FFF8F1;
  border-radius: 14px;
}
.stat .num {
  font-size: 20px;
  font-weight: 700;
  color: #E88A6B;
}
.stat .label {
  font-size: 11px;
  color: #9C8B7E;
  margin-top: 2px;
}
.suggest {
  display: flex;
  gap: 10px;
  align-items: center;
  background: #FFF4E8;
  padding: 14px 16px;
  border-radius: 14px;
  margin-bottom: 14px;
}
.suggest .ic {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.suggest .text {
  flex: 1;
  font-size: 13px;
  color: #4A3A2E;
  line-height: 1.5;
}
.suggest .text b {
  color: #E88A6B;
}
.action-row {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.action-row .el-button {
  flex: 1;
}
</style>
