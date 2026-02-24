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
import Header from './Header.vue';
import Sidebar from './Sidebar.vue';
import Footer from './Footer.vue';
</script>
