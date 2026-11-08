import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

// 同一個 github.io 網域的其他專案也共用 localStorage, 所以 key 加上專案前綴.
const STORAGE_KEY = 'idwwt:vocabulary:v1'

export interface Word {
  id: string
  kind: 'word'
  text: string
  translation: string
}

export interface Divider {
  id: string
  kind: 'divider'
  title: string
}

/** Group 裡的一列: 單字或分隔線. */
export type GroupItem = Word | Divider

export interface WordGroup {
  id: string
  name: string
  /** 在右邊清單勾選後, 左邊才顯示這個 group 的單字. */
  selected: boolean
  expanded: boolean
  items: GroupItem[]
}

/** 舊版資料: 只有 words, 沒有 kind, selected 與 expanded. */
interface StoredGroup {
  id: string
  name: string
  selected?: boolean
  expanded?: boolean
  items?: GroupItem[]
  words?: Omit<Word, 'kind'>[]
}

const normalizeGroup = (group: StoredGroup): WordGroup => ({
  id: group.id,
  name: group.name,
  selected: group.selected ?? true,
  expanded: group.expanded ?? true,
  items: group.items ?? (group.words ?? []).map((word) => ({ ...word, kind: 'word' })),
})

const loadGroups = (): WordGroup[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredGroup[]).map(normalizeGroup) : []
  } catch {
    return []
  }
}

const moveInArray = <T>(items: T[], from: number, to: number) => {
  const [item] = items.splice(from, 1)
  if (item !== undefined) {
    items.splice(to, 0, item)
  }
}

export const countWords = (group: WordGroup) =>
  group.items.filter((item) => item.kind === 'word').length

export const useVocabularyStore = defineStore('vocabulary', () => {
  const groups = ref<WordGroup[]>(loadGroups())

  watch(groups, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), {
    deep: true,
  })

  const findGroup = (groupId: string) => groups.value.find((group) => group.id === groupId)

  const findItem = (groupId: string, itemId: string) =>
    findGroup(groupId)?.items.find((item) => item.id === itemId)

  /* ---------- Group ---------- */

  const hasGroupName = (name: string, exceptId?: string) =>
    groups.value.some(
      (group) => group.id !== exceptId && group.name.toLowerCase() === name.toLowerCase(),
    )

  const addGroup = (name: string) => {
    groups.value.push({ id: crypto.randomUUID(), name, selected: true, expanded: true, items: [] })
  }

  const renameGroup = (groupId: string, name: string) => {
    const group = findGroup(groupId)
    if (group) {
      group.name = name
    }
  }

  const toggleSelected = (groupId: string) => {
    const group = findGroup(groupId)
    if (group) {
      group.selected = !group.selected
    }
  }

  const toggleGroup = (groupId: string) => {
    const group = findGroup(groupId)
    if (group) {
      group.expanded = !group.expanded
    }
  }

  const removeGroup = (groupId: string) => {
    groups.value = groups.value.filter((group) => group.id !== groupId)
  }

  const moveGroup = (from: number, to: number) => moveInArray(groups.value, from, to)

  /* ---------- Item: 單字與分隔線 ---------- */

  const hasWord = (groupId: string, text: string, exceptId?: string) =>
    findGroup(groupId)?.items.some(
      (item) =>
        item.kind === 'word' &&
        item.id !== exceptId &&
        item.text.toLowerCase() === text.toLowerCase(),
    ) ?? false

  /** 加到最後面, 並回傳 reactive proxy, 之後寫入的值才會觸發畫面更新與儲存. */
  const pushItem = <T extends GroupItem>(groupId: string, item: T): T | undefined => {
    const group = findGroup(groupId)
    if (!group) {
      return undefined
    }
    group.items.push(item)
    return group.items.at(-1) as T
  }

  const addWord = (groupId: string, text: string) =>
    pushItem<Word>(groupId, { id: crypto.randomUUID(), kind: 'word', text, translation: '' })

  const addDivider = (groupId: string, title = '') =>
    pushItem<Divider>(groupId, { id: crypto.randomUUID(), kind: 'divider', title })

  const updateWord = (
    groupId: string,
    wordId: string,
    changes: Partial<Pick<Word, 'text' | 'translation'>>,
  ) => {
    const item = findItem(groupId, wordId)
    if (item?.kind === 'word') {
      Object.assign(item, changes)
    }
  }

  const updateDivider = (groupId: string, dividerId: string, title: string) => {
    const item = findItem(groupId, dividerId)
    if (item?.kind === 'divider') {
      item.title = title
    }
  }

  const removeItem = (groupId: string, itemId: string) => {
    const group = findGroup(groupId)
    if (group) {
      group.items = group.items.filter((item) => item.id !== itemId)
    }
  }

  const moveItem = (groupId: string, from: number, to: number) => {
    const group = findGroup(groupId)
    if (group) {
      moveInArray(group.items, from, to)
    }
  }

  return {
    groups,
    hasGroupName,
    addGroup,
    renameGroup,
    toggleSelected,
    toggleGroup,
    removeGroup,
    moveGroup,
    hasWord,
    addWord,
    addDivider,
    updateWord,
    updateDivider,
    removeItem,
    moveItem,
  }
})
