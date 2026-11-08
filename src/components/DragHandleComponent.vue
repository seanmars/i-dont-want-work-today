<template>
  <button
    type="button"
    draggable="true"
    class="cursor-grab touch-none rounded-md p-1 text-line-strong transition-colors hover:bg-paper-deep hover:text-mute focus-visible:text-mute focus-visible:outline-2 focus-visible:outline-mat active:cursor-grabbing"
    :aria-label="`${label}: 拖曳或按上下鍵調整順序`"
    title="拖曳調整順序"
    @keydown.up.prevent="emit('move', -1)"
    @keydown.down.prevent="emit('move', 1)"
  >
    <svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()

const emit = defineEmits<{ move: [delta: number] }>()
</script>
