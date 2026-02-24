<template>
  <div class="min-h-screen grid grid-cols-[250px_1fr] grid-rows-[auto_1fr_auto]">
    <Header />
    <Sidebar />
    <main class="p-6">
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import Header from './HeaderComponent.vue'
import Sidebar from './SidebarComponent.vue'
import Footer from './FooterComponent.vue'
</script>
