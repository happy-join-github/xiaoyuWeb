<template>
  <div class="login">
    <div class="deco deco-1"></div>
    <div class="deco deco-2"></div>

    <StatusBar />

    <div class="top-bar">
      <el-button link circle class="back-btn" aria-label="返回" @click="router.back()">
        <el-icon :size="22">
          <ArrowLeft />
        </el-icon>
      </el-button>
      <span class="top-title">登录</span>
      <span class="top-placeholder"></span>
    </div>

    <div class="scroll">
      <div class="hero fade-in">
        <div class="hero-avatar">🌸</div>
        <h1>欢迎回来</h1>
        <p>{{ userStore.aiName }}一直在等你 🌷</p>
      </div>

      <el-form ref="formRef" class="form fade-up" :model="ruleForm" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="ruleForm.phone" type="tel" placeholder="请输入手机号" :maxlength="11" autocomplete="tel" clearable>
            <template #prefix>
              <span class="input-ic">📱</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="ruleForm.password" type="password" placeholder="请输入密码" autocomplete="current-password" show-password>
            <template #prefix>
              <span class="input-ic">🔒</span>
            </template>
          </el-input>
        </el-form-item>

        <div class="extra-row">
          <el-checkbox v-model="ruleForm.remember">
            <span class="remember-text">记住我</span>
          </el-checkbox>
          <a class="forgot" @click.prevent>忘记密码？</a>
        </div>

        <el-button type="primary" :loading="submitting" class="submit-btn" @click="onSubmit">
          {{ submitting ? '登录中…' : '登录' }}
        </el-button>
      </el-form>

      <div class="footer-link">
        还没有账号？<router-link to="/register">去注册一个</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import service from '../api/index.ts'
import StatusBar from '../components/StatusBar.vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

interface RuleForm {
  phone: string
  password: string
  remember: boolean
}

const ruleForm = reactive<RuleForm>({
  phone: '',
  password: '',
  remember: true,
})

const rules = reactive<FormRules<RuleForm>>({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'change' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的 11 位手机号', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'change' },
    { min: 6, message: '密码至少需要 6 位', trigger: 'change' },
  ],
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

async function onSubmit() {
  if (submitting.value) return
  if (!formRef.value) return
  if (!await formRef.value.validate()) return
  submitting.value = true
  try {
    const res: any = await service.post('/login', {
      phone: ruleForm.phone,
      password: ruleForm.password,
    })
    if (res?.code === 200) {
      userStore.updateProfile(res.data)

      sessionStorage.setItem('userInfo', JSON.stringify(res.data))
      ElMessage.success('登录成功')
      router.replace('/chat')
    } else {
      ElMessage.error(res?.msg || '登录失败')
    }
  } catch {
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #FFEAD9 0%, #FFCFB6 100%);
  position: relative;
  overflow: hidden;
}

.deco {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}
.deco-1 {
  width: 280px;
  height: 280px;
  background: rgba(255, 200, 170, 0.45);
  top: -80px;
  left: -60px;
}
.deco-2 {
  width: 240px;
  height: 240px;
  background: rgba(255, 180, 150, 0.35);
  bottom: 15%;
  right: -80px;
}

/* 顶部 */
.top-bar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: relative;
  z-index: 1;
}
.back-btn,
.top-placeholder {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #4A3A2E;
}
.back-btn {
  padding: 0;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  color: #4A3A2E;
}
.top-title {
  font-size: 17px;
  font-weight: 600;
  color: #4A3A2E;
}

/* 滚动区 */
.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 28px 40px;
  position: relative;
  z-index: 1;
}
.scroll::-webkit-scrollbar { display: none; }
.scroll { scrollbar-width: none; }

/* 头部 */
.hero {
  text-align: center;
  margin: 12px 0 28px;
}
.hero-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 14px;
  background: linear-gradient(135deg, #FFD4C2 0%, #FFB89A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: 0 12px 28px rgba(244, 169, 136, 0.25);
}
.hero h1 {
  font-size: 24px;
  font-weight: 700;
  color: #4A3A2E;
  margin-bottom: 6px;
}
.hero p {
  font-size: 14px;
  color: #9C8B7E;
}

/* ===== 表单（覆盖 element-plus 默认外观） ===== */
.form :deep(.el-form-item) {
  margin-bottom: 16px;
}
.form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #6B5A4D;
  font-weight: 500;
  padding-left: 4px;
  line-height: 1.4;
  height: auto;
}
.form :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 16px;
  padding: 4px 16px;
  box-shadow: none;
  transition: all 0.2s;
}
.form :deep(.el-input__wrapper:hover) {
  background: #fff;
}
.form :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1.5px #E88A6B inset;
}
.form :deep(.el-input__inner) {
  font-size: 15px;
  color: #4A3A2E;
  height: 44px;
}
.form :deep(.el-input__inner::placeholder) {
  color: #C4B5A6;
}
.form :deep(.el-input__prefix) {
  margin-right: 8px;
  font-size: 18px;
  color: inherit;
}
.input-ic {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

/* 附加选项 */
.extra-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin: -4px 0 8px;
}
.form :deep(.el-checkbox) {
  display: flex;
  align-items: center;
  height: auto;
}
.form :deep(.el-checkbox__label) {
  font-size: 12px;
  color: #9C8B7E;
  padding-left: 4px;
}
.form :deep(.el-checkbox__inner) {
  width: 14px;
  height: 14px;
  background-color: #fff;
  border: 1.5px solid #C4B5A6;
  border-radius: 3px;
  transition: background-color 0.2s, border-color 0.2s;
}
.form :deep(.el-checkbox__inner:hover) {
  border-color: #E88A6B;
}
.form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #E88A6B;
  border-color: #E88A6B;
}
.form :deep(.el-checkbox__input.is-focus .el-checkbox__inner) {
  box-shadow: 0 0 0 2px rgba(232, 138, 107, 0.2);
}
.forgot {
  font-size: 12px;
  color: #E88A6B;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%);
  border: none;
  box-shadow: 0 6px 20px rgba(244, 169, 136, 0.25);
}
.submit-btn:hover {
  background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%);
  opacity: 0.95;
  transform: none;
}
.submit-btn.is-disabled {
  background: #D4C5B8 !important;
  box-shadow: none !important;
  opacity: 0.6;
  cursor: not-allowed;
}

/* 底部 */
.footer-link {
  text-align: center;
  margin-top: 22px;
  font-size: 14px;
  color: #9C8B7E;
}
.footer-link a {
  color: #E88A6B;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  margin-left: 4px;
}
</style>
