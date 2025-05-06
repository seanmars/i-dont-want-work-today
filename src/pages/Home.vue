<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

onMounted(() => {
  const router = useRouter();

  router.push({ name: 'leave' });
});
</script>

<style scoped>
</style>