<template>
  <div class="container p-4">
    <!--    <h1 class="text-2xl font-bold mb-6">請假申請</h1>-->

    <div class="max-w-2xl space-y-6">
      <!-- 姓名 -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <!-- 時間 -->
      <div>
        <div class="flex items-center gap-4 mb-1">
          <label class="text-sm font-medium text-gray-700">請假日期</label>
          <div class="flex items-center gap-4" id="durationType" @change="handleDurationTypeChange">
            <label class="inline-flex items-center">
              <input type="radio" v-model="form.durationType" value="am" class="text-blue-600" />
              <span class="ml-2 text-sm text-gray-700">上午</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="form.durationType" value="pm" class="text-blue-600" />
              <span class="ml-2 text-sm text-gray-700">下午</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="form.durationType" value="full" class="text-blue-600" />
              <span class="ml-2 text-sm text-gray-700">整天</span>
            </label>
          </div>
        </div>
        <VueDatePicker
          v-model="form.startTime"
          :format="dtFormat"
          :locale="zhTW"
          :enable-time-picker="false"
          auto-apply
          class="w-full"
          required
        />
        <span class="text-sm text-gray-500">至</span>
        <VueDatePicker
          v-model="form.endTime"
          :format="dtFormat"
          :locale="zhTW"
          :enable-time-picker="false"
          auto-apply
          class="w-full"
          required
        />
      </div>

      <!-- 假別 -->
      <div>
        <label for="leaveType" class="block text-sm font-medium text-gray-700 mb-1">假別</label>
        <select
          id="leaveType"
          v-model="form.leaveType"
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">請選擇假別</option>
          <option v-for="type in leaveTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <!-- 事由 -->
      <div>
        <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">事由</label>
        <textarea
          id="reason"
          v-model="form.reason"
          rows="4"
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        ></textarea>
      </div>

      <!-- 代理人 -->
      <div>
        <label for="agent" class="block text-sm font-medium text-gray-700 mb-1">代理人</label>
        <input
          type="text"
          id="agent"
          v-model="form.agent"
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <!-- 按鈕組 -->
      <div class="flex gap-4">
        <div class="flex-1"></div>

        <button
          id="resetBtn"
          type="button"
          @click="resetForm"
          class="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-2 transform transition active:scale-80"
        >
          重置表單
        </button>

        <button
          id="submitBtn"
          type="button"
          @click="handleSubmit"
          class="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 transform transition active:scale-80"
        >
          提交申請
        </button>

        <button
          id="copyBtn"
          type="button"
          @click="copyToClipboard"
          class="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-2 transform transition active:scale-80"
        >
          複製到剪貼簿
        </button>
        <div class="flex-1"></div>
      </div>
    </div>

    <!-- 輸出區域 -->
    <div class="max-w-2xl mt-6">
      <textarea
        id="outputText"
        v-model="outputText"
        rows="4"
        class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      ></textarea>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useRoute } from 'vue-router'
import { zhTW } from 'date-fns/locale'

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
  durationType: 'am' | 'pm' | 'full'
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

const leaveTypes = ['特休', '病假', '事假', '公假']
const dtFormat = 'yyyy-MM-dd HH:mm'

const copyToClipboard = () => {
  if (!outputText.value) {
    return
  }

  navigator.clipboard
    .writeText(outputText.value)
    .then(() => {
      // Copying the text was successful
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

const handleDurationTypeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const val = target.value as 'am' | 'pm' | 'full'

  if (!form.value.startTime) {
    form.value.startTime = new Date()
  }

  if (!form.value.endTime) {
    form.value.endTime = new Date()
  }

  switch (val) {
    case 'am':
      form.value.startTime = new Date(form.value.startTime!)
      form.value.startTime!.setHours(9, 30, 0, 0)
      form.value.endTime = new Date(form.value.endTime!)
      form.value.endTime!.setHours(12, 0, 0, 0)
      break
    case 'pm':
      form.value.startTime = new Date(form.value.startTime!)
      form.value.startTime!.setHours(12, 0, 0, 0)
      form.value.endTime = new Date(form.value.endTime!)
      form.value.endTime!.setHours(18, 0, 0, 0)
      break
    case 'full':
      form.value.startTime = new Date(form.value.startTime!)
      form.value.startTime!.setHours(9, 30, 0, 0)
      form.value.endTime = new Date(form.value.endTime!)
      form.value.endTime!.setHours(18, 0, 0, 0)
      break
    default:
      break
  }
}

onMounted(() => {
  resetForm()

  // Get URL query parameters
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

<style scoped>
:deep(.dp__input) {
  @reference p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500;
}

#outputText {
  height: 200px;
}
</style>
