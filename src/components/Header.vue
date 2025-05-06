<template>
  <header class="col-span-2 bg-gray-800 text-white p-4">
    <h1 class="text-xl font-bold">{{ currentRouteName }}</h1>
  </header>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import {useRoute} from 'vue-router'

const route = useRoute()

const routes = [
  {name: '首頁', path: '/'},
  {name: '請假', path: '/leave'},
]

const currentRouteName = computed(() => {
  const currentRoute = routes.find(r => r.path === route.path)
  return currentRoute?.name || route.name
})
</script>
