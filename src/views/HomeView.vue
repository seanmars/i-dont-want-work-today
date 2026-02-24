<template>
  <div class="flex flex-col gap-4 p-4 max-w-md mx-auto">
    <router-link
      to="/leave"
      class="p-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
    >
      請假申請
    </router-link>
    <router-link
      to="/bit-tool"
      class="p-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
    >
      Bit Tool
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  //
})
</script>

<style scoped></style>
