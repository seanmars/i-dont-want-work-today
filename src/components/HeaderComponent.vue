<template>
  <header class="px-5 pt-8 pb-6 md:px-10 md:pt-12 md:pb-8">
    <h1 class="text-[1.75rem] leading-tight font-semibold tracking-tight text-ink">
      {{ currentRoute?.title ?? route.name }}
    </h1>
    <p v-if="currentRoute?.description" class="mt-1.5 text-mute">
      {{ currentRoute.description }}
    </p>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { constantRoutes } from '@/router'

const route = useRoute()

const currentRoute = computed(() => constantRoutes.find((r) => r.path === route.path))
</script>
