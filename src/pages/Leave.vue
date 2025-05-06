<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">請假申請</h1>
    <form @submit.prevent="handleSubmit" class="max-w-2xl space-y-6">
      <!-- 姓名 -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
        <input
            type="text"
            id="name"
            v-model="form.name"
            class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
        >
      </div>

      <!-- 時間 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">請假日期</label>
        <VueDatePicker
            v-model="form.startTime"
            :format="dtFormat"
            locale="zh-TW"
            :enable-time-picker="false"
            auto-apply
            class="w-full"
            required
        />
        <span class="text-sm text-gray-500">至</span>
        <VueDatePicker
            v-model="form.endTime"
            :format="dtFormat"
            locale="zh-TW"
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
        >
      </div>

      <!-- 按鈕組 -->
      <div class="flex gap-4">
        <button
            type="submit"
            class="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          提交申請
        </button>
        <button
            type="button"
            @click="resetForm"
            class="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          重置表單
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

interface LeaveForm {
  name: string;
  startTime: Date | null;
  endTime: Date | null;
  leaveType: string;
  reason: string;
  agent: string;
}

const form = ref<LeaveForm>({
  name: '',
  startTime: null,
  endTime: null,
  leaveType: '',
  reason: '',
  agent: ''
});

const leaveTypes = ['特休', '病假', '事假', '公假'];
const dtFormat = 'yyyy-MM-dd HH:mm';

const handleSubmit = () => {
  console.log('提交表單:', form.value);
  // TODO: 實作表單提交邏輯
};

const resetForm = () => {
  let startTime = new Date();
  startTime.setHours(9, 30, 0, 0);
  let endTime = new Date();
  endTime.setHours(18, 0, 0, 0);

  form.value = {
    name: '',
    startTime: startTime,
    endTime: endTime,
    leaveType: leaveTypes[0],
    reason: '',
    agent: ''
  };
};

onMounted(() => {
  resetForm();
});
</script>

<style scoped>
:deep(.dp__input) {
  @reference p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500;
}
</style>
