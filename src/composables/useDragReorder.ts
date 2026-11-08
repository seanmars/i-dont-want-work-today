import { nextTick, ref } from 'vue'

/**
 * 清單拖曳排序. 用滑鼠拖曳把手, 或在把手上按上下鍵移動.
 * 把手要加上 data-reorder-handle="<id>", 鍵盤移動後才能把 focus 放回去.
 */
export const useDragReorder = (move: (from: number, to: number) => void) => {
  const draggingIndex = ref<number | null>(null)
  const overIndex = ref<number | null>(null)

  const onDragStart = (event: DragEvent, index: number) => {
    draggingIndex.value = index
    if (!event.dataTransfer) {
      return
    }
    event.dataTransfer.effectAllowed = 'move'
    // Firefox 要有資料才會開始拖曳.
    event.dataTransfer.setData('text/plain', String(index))
    // 拖曳時顯示整列, 而不是只有把手.
    const row = (event.currentTarget as HTMLElement).closest('li')
    if (row) {
      event.dataTransfer.setDragImage(row, 16, 16)
    }
  }

  const onDragOver = (event: DragEvent, index: number) => {
    if (draggingIndex.value === null) {
      return
    }
    event.preventDefault()
    overIndex.value = index
  }

  const onDragEnd = () => {
    draggingIndex.value = null
    overIndex.value = null
  }

  const onDrop = (index: number) => {
    const from = draggingIndex.value
    onDragEnd()
    if (from !== null && from !== index) {
      move(from, index)
    }
  }

  const onKeyMove = async (index: number, delta: number, length: number, id: string) => {
    const to = index + delta
    if (to < 0 || to >= length) {
      return
    }
    move(index, to)
    await nextTick()
    document.querySelector<HTMLElement>(`[data-reorder-handle="${id}"]`)?.focus()
  }

  /** 放開後項目會出現的位置: 往下拖顯示在目標下方, 往上拖顯示在目標上方. */
  const dropIndicator = (index: number): 'before' | 'after' | null => {
    const from = draggingIndex.value
    if (from === null || overIndex.value !== index || from === index) {
      return null
    }
    return from < index ? 'after' : 'before'
  }

  const isDragging = (index: number) => draggingIndex.value === index

  /** 給清單列使用的 class: 拖曳中變淡, 放置位置顯示一條線. */
  const rowClass = (index: number) => {
    const indicator = dropIndicator(index)
    return {
      'opacity-40': isDragging(index),
      'shadow-[inset_0_2px_0_var(--color-mat)]': indicator === 'before',
      'shadow-[inset_0_-2px_0_var(--color-mat)]': indicator === 'after',
    }
  }

  return { onDragStart, onDragOver, onDragEnd, onDrop, onKeyMove, rowClass }
}
