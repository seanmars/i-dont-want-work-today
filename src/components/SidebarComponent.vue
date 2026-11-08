<template>
  <aside
    class="mat flex flex-col bg-mat text-mat-text md:sticky md:top-0 md:h-screen md:border-r md:border-mat-deep"
  >
    <router-link
      to="/"
      class="block px-5 pt-5 pb-3 text-lg font-semibold tracking-wide text-paper focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-mark md:px-6 md:pt-8 md:pb-6"
    >
      今天不想上班
    </router-link>

    <nav aria-label="工具">
      <ul class="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
        <li v-for="item in constantRoutes" :key="item.path" class="shrink-0">
          <router-link
            :to="item.path"
            class="block rounded-md px-3 py-2 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mark"
            :class="
              isCurrentRoute(item.path)
                ? 'bg-mark font-medium text-ink'
                : 'hover:bg-mat-line hover:text-paper'
            "
            :aria-current="isCurrentRoute(item.path) ? 'page' : undefined"
          >
            {{ item.title }}
          </router-link>
        </li>
      </ul>
    </nav>

    <Footer class="mt-auto hidden md:block" />
  </aside>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { constantRoutes } from '@/router'
import Footer from './FooterComponent.vue'

const route = useRoute()

const isCurrentRoute = (path: string) => {
  return route.path === path
}
</script>

<style scoped>
/* 切割墊格線: 每 24px 一條細線, 每 120px 一條粗線 */
.mat {
  background-image:
    linear-gradient(rgb(255 255 255 / 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.05) 1px, transparent 1px),
    linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px);
  background-size:
    120px 120px,
    120px 120px,
    24px 24px,
    24px 24px;
}
</style>
