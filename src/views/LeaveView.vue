<template>
  <div class="flex max-w-2xl flex-col gap-8">
    <div class="flex flex-col gap-5">
      <div class="grid gap-5 sm:grid-cols-2">
        <!-- 姓名 -->
        <div>
          <label for="name" class="label">姓名</label>
          <input type="text" id="name" v-model="form.name" class="field" required />
        </div>

        <!-- 代理人 -->
        <div>
          <label for="agent" class="label">代理人</label>
          <input type="text" id="agent" v-model="form.agent" class="field" required />
        </div>
      </div>

      <!-- 時間 -->
      <div>
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span class="label mb-0">請假日期</span>
          <div
            id="durationType"
            role="radiogroup"
            aria-label="請假時段"
            class="inline-flex rounded-md border border-line bg-white p-0.5"
            @change="handleDurationTypeChange"
          >
            <label v-for="opt in durationOptions" :key="opt.value" class="cursor-pointer">
              <input
                type="radio"
                name="durationType"
                v-model="form.durationType"
                :value="opt.value"
                class="peer sr-only"
              />
              <span
                class="block rounded px-3 py-1 text-sm text-mute transition-colors peer-checked:bg-mat peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-mark hover:text-ink peer-checked:hover:text-paper"
              >
                {{ opt.label }}
              </span>
            </label>
          </div>
        </div>
        <div class="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
          <VueDatePicker
            v-model="form.startTime"
            :formats="{ input: dtFormat }"
            :locale="zhTW"
            :time-config="{ enableTimePicker: form.durationType === 'comp' }"
            auto-apply
            required
          />
          <span class="text-sm text-mute">至</span>
          <VueDatePicker
            v-model="form.endTime"
            :formats="{ input: dtFormat }"
            :locale="zhTW"
            :time-config="{ enableTimePicker: form.durationType === 'comp' }"
            auto-apply
            required
          />
        </div>
      </div>

      <!-- 假別 -->
      <div class="sm:max-w-[calc(50%-0.625rem)]">
        <label for="leaveType" class="label">假別</label>
        <select id="leaveType" v-model="form.leaveType" class="field" required>
          <option value="">請選擇假別</option>
          <option v-for="type in leaveTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <!-- 事由 -->
      <div>
        <label for="reason" class="label">事由</label>
        <textarea id="reason" v-model="form.reason" rows="3" class="field" required></textarea>
      </div>

      <!-- 按鈕組 -->
      <div class="flex justify-end gap-3">
        <button id="resetBtn" type="button" @click="resetForm" class="btn btn-secondary">
          重置表單
        </button>
        <button id="submitBtn" type="button" @click="handleSubmit" class="btn btn-primary">
          產生訊息
        </button>
      </div>
    </div>

    <!-- 輸出區域 -->
    <section class="panel">
      <div class="flex items-center justify-between gap-4 border-b border-line py-2 pr-2 pl-4">
        <h2 id="outputLabel" class="text-sm font-medium">請假訊息</h2>
        <button
          id="copyBtn"
          type="button"
          @click="copyToClipboard"
          :disabled="!outputText"
          class="btn btn-secondary px-3 py-1 text-sm"
          aria-live="polite"
        >
          {{ copied ? '已複製' : '複製' }}
        </button>
      </div>
      <textarea
        id="outputText"
        v-model="outputText"
        rows="6"
        aria-labelledby="outputLabel"
        placeholder="產生訊息後, 內容會顯示在這裡."
        class="block w-full resize-y rounded-b-[10px] px-4 py-3 leading-7 placeholder:text-mute/70 focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-mark)]"
      ></textarea>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useRoute } from 'vue-router'
import { zhTW } from 'date-fns/locale'
import { getCookie, setCookie } from '@/utils/cookie'

const outputText = ref('')

const formatDateTime = (date: Date) => {
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

interface LeaveForm {
  name: string
  startTime: Date | null
  endTime: Date | null
  durationType: 'am' | 'pm' | 'full' | 'comp'
  leaveType: string
  reason: string
  agent: string
}

const form = ref<LeaveForm>({
  name: '',
  startTime: null,
  endTime: null,
  durationType: 'full',
  leaveType: '',
  reason: '',
  agent: '',
})

const leaveTypes = ['特休', '病假', '事假', '公假', '補休']

const durationOptions: { value: LeaveForm['durationType']; label: string }[] = [
  { value: 'am', label: '上午' },
  { value: 'pm', label: '下午' },
  { value: 'full', label: '整天' },
  { value: 'comp', label: '補休' },
]

const copied = ref(false)
let copiedTimer = 0
const dtFormat = 'yyyy-MM-dd HH:mm'

const copyToClipboard = () => {
  if (!outputText.value) {
    return
  }

  navigator.clipboard
    .writeText(outputText.value)
    .then(() => {
      copied.value = true
      window.clearTimeout(copiedTimer)
      copiedTimer = window.setTimeout(() => (copied.value = false), 2000)
    })
    .catch((err) => {
      console.error('Failed to copy: ', err)
    })
}

const handleSubmit = () => {
  if (!form.value.startTime || !form.value.endTime) return

  outputText.value =
    `姓名：${form.value.name}\n` +
    `時間：${formatDateTime(form.value.startTime)} ~ ${formatDateTime(form.value.endTime)}\n` +
    `假別：${form.value.leaveType}\n` +
    `事由：${form.value.reason}\n` +
    `代理人：${form.value.agent}`

  saveToCookie()
}

// 產生訊息時儲存表單, 下次開啟頁面時自動填回. 日期和訊息不儲存: 日期一律從今天開始, 訊息保持空白.
const LEAVE_COOKIE = 'leave-form'
const LEAVE_COOKIE_DAYS = 365

const saveToCookie = () => {
  const data = {
    name: form.value.name,
    durationType: form.value.durationType,
    leaveType: form.value.leaveType,
    reason: form.value.reason,
    agent: form.value.agent,
  }
  setCookie(LEAVE_COOKIE, JSON.stringify(data), LEAVE_COOKIE_DAYS)
}

const toText = (value: unknown, fallback: string) => {
  return typeof value === 'string' ? value : fallback
}

const isDurationType = (value: unknown): value is LeaveForm['durationType'] => {
  return durationOptions.some((opt) => opt.value === value)
}

/** 從 cookie 填回表單. 日期保留今天, 只依時段調整時間. 資料格式錯誤的欄位保留目前的值. */
const restoreFromCookie = () => {
  const raw = getCookie(LEAVE_COOKIE)
  if (!raw) {
    return
  }

  let data: Record<string, unknown>
  try {
    data = JSON.parse(raw)
  } catch {
    return
  }
  if (typeof data !== 'object' || data === null) {
    return
  }

  const current = form.value
  form.value = {
    ...current,
    name: toText(data.name, current.name),
    durationType: isDurationType(data.durationType) ? data.durationType : current.durationType,
    leaveType: toText(data.leaveType, current.leaveType),
    reason: toText(data.reason, current.reason),
    agent: toText(data.agent, current.agent),
  }
  applyDurationHours(form.value.durationType)
}

const resetForm = () => {
  const startTime = new Date()
  startTime.setHours(9, 30, 0, 0)
  const endTime = new Date()
  endTime.setHours(18, 0, 0, 0)

  form.value = {
    name: '',
    startTime: startTime,
    endTime: endTime,
    durationType: 'full',
    leaveType: leaveTypes[0] ?? '',
    reason: '',
    agent: '',
  }

  outputText.value = ''
}

// 依時段設定開始與結束時間, 日期保持不變
const applyDurationHours = (val: LeaveForm['durationType']) => {
  const startTime = new Date(form.value.startTime ?? new Date())
  const endTime = new Date(form.value.endTime ?? new Date())

  switch (val) {
    case 'am':
      startTime.setHours(9, 30, 0, 0)
      endTime.setHours(12, 0, 0, 0)
      break
    case 'pm':
      startTime.setHours(12, 0, 0, 0)
      endTime.setHours(18, 0, 0, 0)
      break
    case 'full':
    case 'comp':
      startTime.setHours(9, 30, 0, 0)
      endTime.setHours(18, 0, 0, 0)
      break
  }

  form.value.startTime = startTime
  form.value.endTime = endTime
}

const handleDurationTypeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const val = target.value as LeaveForm['durationType']

  applyDurationHours(val)
  if (val === 'comp') {
    form.value.leaveType = '補休'
  }
}

onMounted(() => {
  resetForm()
  restoreFromCookie()

  // Get URL query parameters (優先於 cookie)
  const route = useRoute()
  const { name: queryName, agent: queryAgent } = route.query

  // Update form if query parameters exist
  if (queryName) {
    form.value.name = queryName as string
  }
  if (queryAgent) {
    form.value.agent = queryAgent as string
  }

  // focus on the first input field
  const nameInput = document.getElementById('name') as HTMLInputElement
  if (nameInput) {
    nameInput.focus()
  }
})
</script>

