<template>
  <header class="col-span-2 bg-gray-800 text-white p-4">
    <h1 class="text-xl font-bold">{{ currentRouteName }}</h1>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { constantRoutes } from '@/router'

const route = useRoute()

const currentRouteName = computed(() => {
  const currentRoute = constantRoutes.find((r) => r.path === route.path)
  return currentRoute?.title || route.name
})
</script>
