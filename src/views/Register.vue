<template>
  <div class="register">
    <div class="deco deco-1"></div>
    <div class="deco deco-2"></div>

    <StatusBar />

    <div class="top-bar">
      <el-button link circle class="back-btn" aria-label="返回" @click="router.back()">
        <el-icon :size="22">
          <ArrowLeft />
        </el-icon>
      </el-button>
      <span class="top-title">创建账号</span>
      <span class="top-placeholder"></span>
    </div>

    <div class="scroll">
      <div class="hero fade-in">
        <div class="hero-avatar">🌸</div>
        <h1>你好，新朋友</h1>
        <p>先给你和你的伙伴各起一个名字吧 🌷</p>
      </div>

      <el-form ref="formRef" class="form fade-up" :model="ruleForm" :rules="rules" label-position="top">
        <el-form-item label="选择头像">
          <div class="avatar-picker">
            <div v-for="(src, i) in defaultAvatars" :key="i" class="avatar-option"
              :class="{ active: ruleForm.avatar === src }" @click="onPickDefault(src)">
              <img :src="src" :alt="`默认头像${i + 1}`" />
            </div>
            <label class="avatar-option avatar-upload"
              :class="{ active: ruleForm.avatar && !defaultAvatars.includes(ruleForm.avatar) }">
              <input type="file" accept="image/*" hidden @change="onAvatarUpload" />
              <img v-if="ruleForm.avatar && !defaultAvatars.includes(ruleForm.avatar)" :src="ruleForm.avatar"
                alt="上传头像" />
              <span v-else class="upload-plus" aria-hidden="true">+</span>
            </label>
          </div>
        </el-form-item>

        <el-form-item label="你的昵称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="想被怎么称呼呢" :maxlength="12" autocomplete="nickname" clearable>
            <template #prefix>
              <span class="input-ic">😊</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="ruleForm.phone" type="tel" placeholder="11 位手机号" :maxlength="11" autocomplete="tel"
            clearable>
            <template #prefix>
              <span class="input-ic">📱</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="aiName">
          <template #label>
            <span>给伙伴起个名字</span>
            <span class="optional">（默认小愈，可修改）</span>
          </template>
          <el-input v-model="ruleForm.aiName" placeholder="给你的伙伴起个名字" :maxlength="8" clearable>
            <template #prefix>
              <span class="input-ic">🌸</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="设置密码" prop="password">
          <el-input v-model="ruleForm.password" type="password" placeholder="至少 6 位" :maxlength="20"
            autocomplete="new-password" show-password>
            <template #prefix>
              <span class="input-ic">🔒</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="确认密码">
          <el-input v-model="confirmPassword" type="password" placeholder="再输入一次" :maxlength="20"
            autocomplete="new-password" show-password>
            <template #prefix>
              <span class="input-ic">🔐</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="agreed" class="agree-item">
          <el-checkbox v-model="agreed">
            <span class="agree-text">
              我已阅读并同意 <a @click.prevent>《用户协议》</a> 与 <a @click.prevent>《隐私政策》</a>
            </span>
          </el-checkbox>
        </el-form-item>

        <el-button type="primary" :loading="submitting" :disabled="!agreed" class="submit-btn"
          :class="{ 'submit-btn--disabled': !agreed }" @click="onSubmit">
          {{ submitting ? '创建中…' : '创建账号，开始聊天' }}
        </el-button>
      </el-form>

      <div class="footer-link">
        已经有账号了？<router-link to="/login">直接登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import service from '../api/index.ts'
import { useRouter } from 'vue-router'
import StatusBar from '../components/StatusBar.vue'
// 默认头像资源
import defaultAvatar1 from '../assets/img19.webp'
import defaultAvatar2 from '../assets/img669.webp'
import { useUserStore } from '../stores/user.ts'

const router = useRouter()
const userStore = useUserStore()

// AI 伙伴的默认名字
const DEFAULT_AI_NAME = '小愈'

interface RuleForm {
  name: string
  aiName: string
  password: string
  phone: string
  avatar: string
}

const ruleForm = reactive<RuleForm>({
  name: '',
  aiName: DEFAULT_AI_NAME,
  password: '',
  phone: '',
  avatar: defaultAvatar1,
})
const agreed = ref(false)
const confirmPassword = ref('')

// 头像：两张默认 + 一张用户上传
const defaultAvatars = [defaultAvatar1, defaultAvatar2]

function onPickDefault(src: string) {
  ruleForm.avatar = src
}

function onAvatarUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    ruleForm.avatar = reader.result as string
  }
  reader.readAsDataURL(file)
    // 清空 input，便于再次选择同一文件
    ; (e.target as HTMLInputElement).value = ''
}

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请先填写你的昵称', trigger: 'change' },
    { max: 12, message: '昵称最多 12 个字符', trigger: 'change' },
  ],
  phone: [
    { required: true, message: '请填写手机号', trigger: 'change' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的 11 位手机号',
      trigger: 'change',
    },
  ],
  aiName: [
    { required: false, message: '请先填写你的 AI 伙伴名称', trigger: 'change' },
    { max: 8, message: 'AI 伙伴名称最多 8 个字符', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请设置密码', trigger: 'change' },
    { min: 6, message: '密码至少需要 6 位', trigger: 'change' },
  ],
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

async function onSubmit() {
  if (submitting.value) return
  if (!formRef.value) return
  if (!await formRef.value.validate()) return
  // 单独校验两次密码是否一致
  if (confirmPassword.value !== ruleForm.password) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  // 必须勾选协议才能提交
  if (!agreed.value) {
    ElMessage.warning('请先勾选并同意《用户协议》与《隐私政策》')
    return
  }
  submitting.value = true
  try {
    const userinfo: any = await service.post('/register', ruleForm)
    if (userinfo?.code === 200) {
      // 更新用户信息
      userStore.updateProfile(userinfo.data)

      // 保存注册凭证
      sessionStorage.setItem('userInfo', JSON.stringify(userinfo?.data))
      ElMessage.success("恭喜注册成功");
      // 注册成功，直接跳转首页
      router.push('/chat');
    } else {
      // 业务错误（如 code: 500 验证码错误）仅提示，不跳转
      ElMessage.error(userinfo?.msg);
    }
  } catch {
    // 校验失败，element-plus 会自动在对应表单项下展示错误
    return
  }

  submitting.value = false
}
</script>

<style scoped>
.register {
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
  right: -80px;
}

.deco-2 {
  width: 220px;
  height: 220px;
  background: rgba(255, 180, 150, 0.35);
  bottom: 10%;
  left: -60px;
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

.scroll::-webkit-scrollbar {
  display: none;
}

.scroll {
  scrollbar-width: none;
}

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

/* ===== 表单（覆盖 element-plus 默认外观以贴合原暖色风格） ===== */
.form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #6B5A4D;
  font-weight: 500;
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
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

/* 头像选择器 */
.avatar-picker {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar-option {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2.5px solid transparent;
  background: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.2s, transform 0.2s;
  position: relative;
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-option.active {
  border-color: #E88A6B;
  box-shadow: 0 0 0 3px rgba(232, 138, 107, 0.18);
}

.avatar-option:not(.active):hover {
  transform: translateY(-1px);
}

.avatar-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C4B5A6;
  font-size: 26px;
  font-weight: 300;
  line-height: 1;
  background: rgba(255, 255, 255, 0.55);
  border-style: dashed;
}

.avatar-upload.active {
  background: #fff;
}

.upload-plus {
  user-select: none;
}

.optional {
  font-size: 11px;
  font-weight: 400;
  color: #C4B5A6;
}

/* 协议 */
.agree-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  min-height: auto;
}

.form :deep(.el-checkbox) {
  display: flex;
  align-items: center;
  height: auto;
  white-space: normal;
}

.form :deep(.el-checkbox__label) {
  font-size: 12px;
  color: #9C8B7E;
  padding-left: 4px;
  white-space: normal;
  line-height: 1.5;
}

/* 方框：未勾选为暗灰，勾选后变主题橙 */
.form :deep(.el-checkbox__inner) {
  width: 16px;
  height: 16px;
  background-color: #fff;
  border: 1.5px solid #C4B5A6;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.form :deep(.el-checkbox__inner:hover) {
  border-color: #E88A6B;
}

.form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #E88A6B;
  border-color: #E88A6B;
}

.form :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #6B5A4D;
}

.form :deep(.el-checkbox__input.is-focus .el-checkbox__inner) {
  box-shadow: 0 0 0 2px rgba(232, 138, 107, 0.2);
}

.agree-text a {
  color: #E88A6B;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* 提交按钮 */
.submit-btn {
  margin-top: 8px;
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

.submit-btn--disabled,
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