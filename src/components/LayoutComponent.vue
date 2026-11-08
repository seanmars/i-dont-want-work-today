<template>
  <div class="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
    <Sidebar />
    <div class="flex min-w-0 flex-col">
      <Header />
      <main class="flex-1 px-5 pb-16 md:px-10">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Header from './HeaderComponent.vue'
import Sidebar from './SidebarComponent.vue'
</script>
