<template>
  <aside class="bg-gray-100 p-4 border-r border-gray-300">
    <nav>
      <ul class="space-y-2">
        <li v-for="route in routes" :key="route.path">
          <router-link
              :to="route.path"
              class="block p-2 rounded hover:bg-gray-200 transition-colors"
              :class="{ 'bg-gray-200': isCurrentRoute(route.path) }"
          >
            {{ route.name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script lang="ts" setup>
import {useRoute} from 'vue-router'

const route = useRoute()

const routes = [
  {name: '首頁', path: '/'},
  {name: '請假', path: '/leave'},
]

const isCurrentRoute = (path: string) => {
  return route.path === path
}
</script>
