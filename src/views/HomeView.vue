<template>
  <ul class="max-w-2xl divide-y divide-line border-y border-line">
    <li v-for="tool in tools" :key="tool.path">
      <router-link
        :to="tool.path"
        class="highlight-trigger flex flex-col gap-1 rounded-sm py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mat"
      >
        <span class="text-lg font-semibold text-ink">
          <span class="highlight">{{ tool.title }}</span>
        </span>
        <span class="text-mute">{{ tool.description }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { constantRoutes } from '@/router'

const tools = constantRoutes.filter((r) => r.path !== '/')
</script>
