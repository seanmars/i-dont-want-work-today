<template>
  <div>
    <form class="flex flex-wrap gap-2 px-4 py-3" @submit.prevent="handleAddWord">
      <input
        v-model="newWordText"
        type="text"
        placeholder="輸入英文單字, 例如 apple"
        :aria-label="`新增單字到 ${group.name}`"
        autocapitalize="off"
        spellcheck="false"
        class="field min-w-0 flex-1 basis-48 font-mono text-[0.9375rem]"
      />
      <button type="submit" class="btn btn-primary shrink-0">新增</button>
      <button type="button" class="btn btn-secondary shrink-0" @click="handleAddDivider">
        分隔線
      </button>
    </form>
    <p v-if="wordError" role="alert" class="px-4 pb-3 text-sm text-err">{{ wordError }}</p>

    <p v-if="group.items.length === 0" class="px-4 pb-3 text-sm text-mute">
      這個 group 還沒有單字.
    </p>

    <ul v-else class="divide-y divide-line border-t border-line">
      <li
        v-for="(item, index) in group.items"
        :key="item.id"
        :class="[drag.rowClass(index), item.kind === 'divider' ? 'px-4 py-1.5' : 'px-4 py-3']"
        @dragover="drag.onDragOver($event, index)"
        @drop.prevent="drag.onDrop(index)"
      >
        <!-- 分隔線 -->
        <template v-if="item.kind === 'divider'">
          <form
            v-if="editingItemId === item.id"
            class="flex flex-wrap items-center gap-2"
            @submit.prevent="saveDivider"
            @keydown.esc="cancelEdit"
          >
            <input
              :id="`edit-${item.id}`"
              v-model="editingDividerTitle"
              type="text"
              placeholder="分隔線標題 (可以留空)"
              aria-label="分隔線標題"
              class="field min-w-0 flex-1 basis-48"
            />
            <button type="submit" class="btn btn-primary px-3 py-1 text-sm">儲存</button>
            <button type="button" class="btn btn-secondary px-3 py-1 text-sm" @click="cancelEdit">
              取消
            </button>
          </form>

          <div v-else class="flex items-center gap-2">
            <DragHandle
              class="-ml-2"
              :label="item.title || '分隔線'"
              :data-reorder-handle="item.id"
              @dragstart="drag.onDragStart($event, index)"
              @dragend="drag.onDragEnd"
              @move="drag.onKeyMove(index, $event, group.items.length, item.id)"
            />
            <span v-if="item.title" class="text-sm font-semibold text-mute">{{ item.title }}</span>
            <span class="h-0.5 flex-1 rounded-full bg-line-strong" role="separator"></span>
            <button type="button" class="btn-text" @click="startEditDivider(item)">編輯</button>
            <button
              type="button"
              :class="['btn-text', pendingDeleteId === item.id && 'text-err hover:text-err']"
              @click="handleRemoveItem(item.id)"
            >
              {{ pendingDeleteId === item.id ? '確定?' : '刪除' }}
            </button>
          </div>
        </template>

        <!-- 單字 -->
        <template v-else>
          <form
            v-if="editingItemId === item.id"
            class="grid gap-2 sm:grid-cols-[5rem_1fr] sm:items-center"
            @submit.prevent="saveWord"
            @keydown.esc="cancelEdit"
          >
            <label :for="`edit-${item.id}`" class="text-sm text-mute">單字</label>
            <input
              :id="`edit-${item.id}`"
              v-model="editingWord.text"
              type="text"
              autocapitalize="off"
              spellcheck="false"
              class="field font-mono text-[0.9375rem]"
            />
            <label :for="`edit-translation-${item.id}`" class="text-sm text-mute">翻譯</label>
            <input
              :id="`edit-translation-${item.id}`"
              v-model="editingWord.translation"
              type="text"
              class="field"
            />
            <p v-if="editError" role="alert" class="text-sm text-err sm:col-start-2">
              {{ editError }}
            </p>
            <div class="flex gap-2 sm:col-start-2">
              <button type="submit" class="btn btn-primary px-3 py-1 text-sm">儲存</button>
              <button type="button" class="btn btn-secondary px-3 py-1 text-sm" @click="cancelEdit">
                取消
              </button>
            </div>
          </form>

          <div v-else class="flex flex-wrap items-start gap-x-4 gap-y-1">
            <DragHandle
              class="mt-0.5 -mr-2 -ml-2"
              :label="item.text"
              :data-reorder-handle="item.id"
              @dragstart="drag.onDragStart($event, index)"
              @dragend="drag.onDragEnd"
              @move="drag.onKeyMove(index, $event, group.items.length, item.id)"
            />
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="flex items-center gap-1.5">
                <span class="font-mono text-base font-semibold break-all">{{ item.text }}</span>
                <button
                  v-if="isSpeechSupported"
                  type="button"
                  class="rounded-md p-1 text-mute transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-2 focus-visible:outline-mat"
                  :aria-label="`用瀏覽器播放 ${item.text} 的發音`"
                  title="瀏覽器發音"
                  @click="speak(item.text)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="size-4.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M11 5 6 9H2v6h4l5 4V5z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M19 5a10 10 0 0 1 0 14" />
                  </svg>
                </button>
                <button
                  v-if="hasYahooAudio(item.text)"
                  type="button"
                  class="rounded-md px-1.5 py-0.5 text-xs font-medium text-mute transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-2 focus-visible:outline-mat"
                  :aria-label="`用 Yahoo 播放 ${item.text} 的發音`"
                  title="Yahoo 字典真人發音"
                  @click="speakByYahoo(item.text)"
                >
                  Yahoo
                </button>
              </div>
              <span v-if="translatingIds.has(item.id)" class="text-sm text-mute">翻譯中...</span>
              <span v-else-if="item.translation" class="text-sm">{{ item.translation }}</span>
              <span v-else class="text-sm text-mute">沒有翻譯. 可以重新翻譯或手動編輯.</span>
            </div>

            <div class="flex shrink-0 gap-1">
              <button
                type="button"
                class="btn-text"
                :disabled="translatingIds.has(item.id)"
                @click="translateWord(item.id, item.text)"
              >
                重新翻譯
              </button>
              <button type="button" class="btn-text" @click="startEditWord(item)">編輯</button>
              <button
                type="button"
                :class="['btn-text', pendingDeleteId === item.id && 'text-err hover:text-err']"
                @click="handleRemoveItem(item.id)"
              >
                {{ pendingDeleteId === item.id ? '確定?' : '刪除' }}
              </button>
            </div>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useVocabularyStore, type Divider, type Word, type WordGroup } from '@/stores/vocabulary'
import { translateToZhTW } from '@/utils/translate'
import { hasYahooAudio, isSpeechSupported, speak, speakByYahoo } from '@/utils/speech'
import { useDragReorder } from '@/composables/useDragReorder'
import { useConfirmDelete } from '@/composables/useConfirmDelete'
import DragHandle from './DragHandleComponent.vue'

const props = defineProps<{ group: WordGroup }>()

// 允許單字或片語: 英文字母開頭, 可包含空白, 連字號與撇號.
const WORD_PATTERN = /^[A-Za-z][A-Za-z\s'-]*$/

const store = useVocabularyStore()
const drag = useDragReorder((from, to) => store.moveItem(props.group.id, from, to))
const { pendingDeleteId, confirmDelete } = useConfirmDelete()

const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ')

const validateWord = (text: string, exceptId?: string): string => {
  if (!text) {
    return '單字不可為空'
  }
  if (!WORD_PATTERN.test(text)) {
    return '只能輸入英文字母, 空白, 連字號與撇號'
  }
  if (store.hasWord(props.group.id, text, exceptId)) {
    return `"${text}" 已經在這個 group 裡`
  }
  return ''
}

/* ---------- 新增 ---------- */

const newWordText = ref('')
const wordError = ref('')
const translatingIds = ref(new Set<string>())

const translateWord = async (wordId: string, text: string) => {
  // 先記下 groupId: 翻譯完成前 component 可能已經因為收合而卸載.
  const groupId = props.group.id
  translatingIds.value.add(wordId)
  try {
    const translation = await translateToZhTW(text)
    store.updateWord(groupId, wordId, { translation })
  } finally {
    translatingIds.value.delete(wordId)
  }
}

const handleAddWord = () => {
  const text = normalizeText(newWordText.value)
  wordError.value = validateWord(text)
  if (wordError.value) {
    return
  }

  const word = store.addWord(props.group.id, text)
  newWordText.value = ''
  if (word) {
    void translateWord(word.id, word.text)
  }
}

const handleAddDivider = () => {
  const divider = store.addDivider(props.group.id)
  if (divider) {
    startEditDivider(divider)
  }
}

/* ---------- 編輯 ---------- */

const editingItemId = ref<string | null>(null)
const editingWord = ref({ text: '', translation: '' })
const editingDividerTitle = ref('')
const editError = ref('')

const focusEditInput = async (itemId: string) => {
  await nextTick()
  document.getElementById(`edit-${itemId}`)?.focus()
}

const startEditWord = (word: Word) => {
  editError.value = ''
  editingItemId.value = word.id
  editingWord.value = { text: word.text, translation: word.translation }
  void focusEditInput(word.id)
}

const startEditDivider = (divider: Divider) => {
  editError.value = ''
  editingItemId.value = divider.id
  editingDividerTitle.value = divider.title
  void focusEditInput(divider.id)
}

const cancelEdit = () => {
  editingItemId.value = null
  editError.value = ''
}

const saveWord = () => {
  if (!editingItemId.value) {
    return
  }
  const text = normalizeText(editingWord.value.text)
  editError.value = validateWord(text, editingItemId.value)
  if (editError.value) {
    return
  }

  store.updateWord(props.group.id, editingItemId.value, {
    text,
    translation: editingWord.value.translation.trim(),
  })
  editingItemId.value = null
}

const saveDivider = () => {
  if (!editingItemId.value) {
    return
  }
  store.updateDivider(props.group.id, editingItemId.value, editingDividerTitle.value.trim())
  editingItemId.value = null
}

/* ---------- 刪除 ---------- */

const handleRemoveItem = (itemId: string) => {
  if (confirmDelete(itemId)) {
    store.removeItem(props.group.id, itemId)
  }
}
</script>
