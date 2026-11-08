import { onBeforeUnmount, ref } from 'vue'

const CONFIRM_TIMEOUT_MS = 3000

/** 刪除要按兩次: 第一次進入確認狀態, 3 秒內再按一次才回傳 true. */
export const useConfirmDelete = () => {
  const pendingDeleteId = ref<string | null>(null)
  let timer = 0

  const confirmDelete = (id: string): boolean => {
    window.clearTimeout(timer)
    if (pendingDeleteId.value === id) {
      pendingDeleteId.value = null
      return true
    }
    pendingDeleteId.value = id
    timer = window.setTimeout(() => (pendingDeleteId.value = null), CONFIRM_TIMEOUT_MS)
    return false
  }

  onBeforeUnmount(() => window.clearTimeout(timer))

  return { pendingDeleteId, confirmDelete }
}
