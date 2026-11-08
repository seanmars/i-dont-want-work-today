<template>
  <div class="grid max-w-6xl gap-8 lg:grid-cols-[1fr_18rem] lg:items-start">
    <!-- Group 清單: 大螢幕在右邊, 小螢幕在上面 -->
    <section aria-labelledby="group-heading" class="flex flex-col gap-3 lg:order-2">
      <h2 id="group-heading" class="font-semibold">Group</h2>

      <form class="flex gap-2" @submit.prevent="handleAddGroup">
        <input
          v-model="newGroupName"
          type="text"
          placeholder="新的 group 名稱"
          aria-label="新的 group 名稱"
          class="field min-w-0 flex-1"
        />
        <button type="submit" class="btn btn-primary shrink-0">新增</button>
      </form>
      <p v-if="groupError" role="alert" class="text-sm text-err">{{ groupError }}</p>

      <p v-if="store.groups.length === 0" class="text-sm text-mute">還沒有 group. 先新增一個.</p>

      <ul v-else class="panel divide-y divide-line">
        <li
          v-for="(group, index) in store.groups"
          :key="group.id"
          class="px-2 py-1.5"
          :class="groupDrag.rowClass(index)"
          @dragover="groupDrag.onDragOver($event, index)"
          @drop.prevent="groupDrag.onDrop(index)"
        >
          <!-- 編輯 group 名稱 -->
          <form
            v-if="editingGroupId === group.id"
            class="flex flex-col gap-2 p-1"
            @submit.prevent="saveGroupName"
            @keydown.esc="cancelEditGroup"
          >
            <input
              :id="`group-name-${group.id}`"
              v-model="editingGroupName"
              type="text"
              aria-label="Group 名稱"
              class="field"
            />
            <div class="flex gap-2">
              <button type="submit" class="btn btn-primary px-3 py-1 text-sm">儲存</button>
              <button
                type="button"
                class="btn btn-secondary px-3 py-1 text-sm"
                @click="cancelEditGroup"
              >
                取消
              </button>
            </div>
          </form>

          <!-- 顯示 group -->
          <div v-else class="flex items-center gap-1">
            <DragHandle
              :label="group.name"
              :data-reorder-handle="group.id"
              @dragstart="groupDrag.onDragStart($event, index)"
              @dragend="groupDrag.onDragEnd"
              @move="groupDrag.onKeyMove(index, $event, store.groups.length, group.id)"
            />
            <label
              class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-paper-deep"
            >
              <input
                type="checkbox"
                class="size-4 shrink-0 cursor-pointer accent-mat"
                :checked="group.selected"
                @change="store.toggleSelected(group.id)"
              />
              <span class="truncate">{{ group.name }}</span>
              <span class="shrink-0 text-sm text-mute">({{ countWords(group) }})</span>
            </label>
            <button type="button" class="btn-text" @click="startEditGroup(group)">改名</button>
            <button
              type="button"
              :class="['btn-text', pendingDeleteId === group.id && 'text-err hover:text-err']"
              @click="handleRemoveGroup(group.id)"
            >
              {{ pendingDeleteId === group.id ? '確定?' : '刪除' }}
            </button>
          </div>
        </li>
      </ul>
    </section>

    <!-- 單字: 只顯示有勾選的 group -->
    <section aria-label="單字" class="flex flex-col gap-3 lg:order-1">
      <p v-if="!isSpeechSupported" class="text-sm text-mute">
        這個瀏覽器不支援語音合成, 只能使用 Yahoo 發音.
      </p>

      <p v-if="selectedGroups.length === 0" class="text-sm text-mute">
        勾選 group 後, 這裡會顯示它的單字.
      </p>

      <article
        v-for="group in selectedGroups"
        :key="group.id"
        class="panel overflow-hidden"
        :aria-labelledby="`group-title-${group.id}`"
      >
        <h2 :id="`group-title-${group.id}`" class="px-2 py-1.5">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-mat"
            :aria-expanded="group.expanded"
            :aria-controls="`group-body-${group.id}`"
            @click="store.toggleGroup(group.id)"
          >
            <svg
              viewBox="0 0 24 24"
              class="size-4 shrink-0 text-mute transition-transform"
              :class="{ 'rotate-90': group.expanded }"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
            <span class="truncate font-semibold">{{ group.name }}</span>
            <span class="shrink-0 text-sm font-normal text-mute">({{ countWords(group) }})</span>
          </button>
        </h2>

        <VocabularyWordList
          v-if="group.expanded"
          :id="`group-body-${group.id}`"
          :group="group"
          class="border-t border-line"
        />
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { countWords, useVocabularyStore, type WordGroup } from '@/stores/vocabulary'
import { isSpeechSupported } from '@/utils/speech'
import { useDragReorder } from '@/composables/useDragReorder'
import { useConfirmDelete } from '@/composables/useConfirmDelete'
import DragHandle from '@/components/DragHandleComponent.vue'
import VocabularyWordList from '@/components/VocabularyWordListComponent.vue'

const store = useVocabularyStore()
const groupDrag = useDragReorder((from, to) => store.moveGroup(from, to))
const { pendingDeleteId, confirmDelete } = useConfirmDelete()

// 左邊的順序跟著右邊的 group 清單.
const selectedGroups = computed(() => store.groups.filter((group) => group.selected))

const newGroupName = ref('')
const groupError = ref('')
const editingGroupId = ref<string | null>(null)
const editingGroupName = ref('')

const validateGroupName = (name: string, exceptId?: string): string => {
  if (!name) {
    return 'Group 名稱不可為空'
  }
  if (store.hasGroupName(name, exceptId)) {
    return `已經有名為 "${name}" 的 group`
  }
  return ''
}

const handleAddGroup = () => {
  const name = newGroupName.value.trim()
  groupError.value = validateGroupName(name)
  if (groupError.value) {
    return
  }

  store.addGroup(name)
  newGroupName.value = ''
}

const startEditGroup = async (group: WordGroup) => {
  groupError.value = ''
  editingGroupId.value = group.id
  editingGroupName.value = group.name
  await nextTick()
  document.getElementById(`group-name-${group.id}`)?.focus()
}

const cancelEditGroup = () => {
  editingGroupId.value = null
  groupError.value = ''
}

const saveGroupName = () => {
  if (!editingGroupId.value) {
    return
  }
  const name = editingGroupName.value.trim()
  groupError.value = validateGroupName(name, editingGroupId.value)
  if (groupError.value) {
    return
  }

  store.renameGroup(editingGroupId.value, name)
  editingGroupId.value = null
}

const handleRemoveGroup = (groupId: string) => {
  if (confirmDelete(groupId)) {
    store.removeGroup(groupId)
  }
}
</script>
