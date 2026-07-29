<template>
  <div class="forget-password">
    <div class="deco deco-1"></div>
    <div class="deco deco-2"></div>

    <StatusBar />

    <div class="top-bar">
      <el-button link circle class="back-btn" aria-label="返回" @click="router.back()">
        <el-icon :size="22">
          <ArrowLeft />
        </el-icon>
      </el-button>
      <span class="top-title">找回密码</span>
      <span class="top-placeholder"></span>
    </div>

    <div class="scroll">
      <div class="hero fade-in">
        <div class="hero-avatar">🔑</div>
        <h1>重置密码</h1>
        <p>输入手机号和新密码即可重置</p>
      </div>

      <el-form ref="formRef" class="form fade-up" :model="ruleForm" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="ruleForm.phone" type="tel" placeholder="请输入手机号" :maxlength="11" autocomplete="tel" clearable>
            <template #prefix>
              <span class="input-ic">📱</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="ruleForm.new_password" type="password" placeholder="请输入新密码，至少 6 位" autocomplete="new-password" show-password>
            <template #prefix>
              <span class="input-ic">🔒</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="ruleForm.confirmPassword" type="password" placeholder="请再次输入新密码" autocomplete="new-password" show-password>
            <template #prefix>
              <span class="input-ic">🔒</span>
            </template>
          </el-input>
        </el-form-item>

        <el-button type="primary" :loading="submitting" class="submit-btn" @click="onSubmit">
          {{ submitting ? '重置中…' : '重置密码' }}
        </el-button>
      </el-form>

      <div class="footer-link">
        记起密码了？<router-link to="/login">返回登录</router-link>
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

const router = useRouter()

interface RuleForm {
  phone: string
  new_password: string
  confirmPassword: string
}

const ruleForm = reactive<RuleForm>({
  phone: '',
  new_password: '',
  confirmPassword: '',
})

const rules = reactive<FormRules<RuleForm>>({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'change' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的 11 位手机号', trigger: 'change' },
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'change' },
    { min: 6, message: '密码至少需要 6 位', trigger: 'change' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'change' },
    {
      validator: (_rule: any, value: string, callback: (e?: Error) => void) => {
        if (value !== ruleForm.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
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
    const res: any = await service.post('/auth/reset-password', {
      phone: ruleForm.phone,
      new_password: ruleForm.new_password,
    })
    if (res?.code === 200) {
      ElMessage.success('密码重置成功，请重新登录')
      router.replace('/login')
    } else {
      ElMessage.error(res?.msg || '重置失败')
    }
  } catch (err: any) {
    ElMessage.error(err?.message || '重置失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.forget-password {
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

/* ===== 表单 ===== */
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

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #F4A988 0%, #E88A6B 100%);
  border: none;
  box-shadow: 0 6px 20px rgba(244, 169, 136, 0.25);
  margin-top: 8px;
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
