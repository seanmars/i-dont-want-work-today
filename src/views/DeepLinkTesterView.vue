<template>
  <div class="container p-4 flex flex-col gap-8">
    <!-- 輸入區域 -->
    <div class="max-w-lg flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <label for="schema-input" class="w-24 text-gray-600 font-medium shrink-0">Schema</label>
        <div class="flex-1 flex items-center border rounded focus-within:border-blue-500">
          <input
            id="schema-input"
            type="text"
            v-model="schema"
            placeholder="myapp"
            aria-label="Schema"
            class="flex-1 p-2 rounded-l focus:outline-none"
            @keyup.enter="testDeepLink"
          />
          <span class="px-2 text-gray-400 select-none bg-gray-50 border-l rounded-r py-2 text-sm"
            >://</span
          >
        </div>
      </div>

      <div class="flex items-center gap-4">
        <label for="url-input" class="w-24 text-gray-600 font-medium shrink-0">URL Path</label>
        <input
          id="url-input"
          type="text"
          v-model="urlPath"
          placeholder="home?id=123&name=abc#section1"
          aria-label="URL Path"
          class="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
          @keyup.enter="testDeepLink"
        />
      </div>

      <div v-if="schemaError" class="ml-28 text-sm text-red-500">{{ schemaError }}</div>

      <div class="flex items-center gap-4">
        <div class="w-24"></div>
        <button
          @click="testDeepLink"
          class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          測試
        </button>
      </div>
    </div>

    <!-- 結果區域 -->
    <div v-if="result" class="max-w-lg">
      <!-- 有效結果 -->
      <div v-if="result.valid" class="border rounded p-4 flex flex-col gap-3">
        <h2 class="text-green-600 font-semibold text-lg">解析成功</h2>

        <div class="grid text-sm gap-y-3" style="grid-template-columns: 7rem 1fr">
          <span class="text-gray-500">完整 URL</span>
          <code class="text-gray-800 break-all">{{ result.fullUrl }}</code>

          <span class="text-gray-500">Schema</span>
          <code class="text-gray-800">{{ result.schema }}</code>

          <span class="text-gray-500">Host</span>
          <code class="text-gray-800">{{ result.host }}</code>

          <span class="text-gray-500">Path</span>
          <code class="text-gray-800">{{ result.pathname }}</code>

          <span class="text-gray-500">Fragment</span>
          <code class="text-gray-800">{{ result.fragment ?? 'null' }}</code>
        </div>

        <!-- Query Params -->
        <div class="mt-2">
          <div class="text-gray-500 text-sm mb-1">Query Params</div>
          <div
            v-if="Object.keys(result.queryParams).length === 0"
            class="text-sm text-gray-400 italic"
          >
            （無）
          </div>
          <table v-else class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left p-2 border text-gray-600 font-medium">Key</th>
                <th class="text-left p-2 border text-gray-600 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(val, key) in result.queryParams" :key="key">
                <td class="p-2 border">
                  <code>{{ key }}</code>
                </td>
                <td class="p-2 border">
                  <code>{{ val }}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 無效結果 -->
      <div v-else class="border border-red-200 rounded p-4 flex flex-col gap-2 bg-red-50">
        <h2 class="text-red-600 font-semibold text-lg">解析失敗</h2>
        <div class="text-sm text-red-700">{{ result.error }}</div>
        <div class="text-sm text-gray-500">
          嘗試解析的 URL：<code class="text-gray-700">{{ result.fullUrl }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const schema = ref('myapp')
const urlPath = ref('item/id/42?source=shop&kind=2#detial')
const schemaError = ref('')

interface ValidResult {
  valid: true
  fullUrl: string
  schema: string
  host: string
  pathname: string
  queryParams: Record<string, string>
  fragment: string | null
}

interface InvalidResult {
  valid: false
  fullUrl: string
  error: string
}

const result = ref<ValidResult | InvalidResult | null>(null)

function testDeepLink() {
  schemaError.value = ''

  // Schema 格式驗證
  if (!schema.value.trim()) {
    schemaError.value = 'Schema 不可為空'
    return
  }
  if (/\s/.test(schema.value) || schema.value.includes('://')) {
    schemaError.value = 'Schema 不可包含空白或 "://"'
    return
  }

  const path = urlPath.value;
  const fullUrl = `${schema.value}://${path}`;

  try {
    const parsed = new URL(fullUrl)
    result.value = {
      valid: true,
      fullUrl,
      schema: parsed.protocol.replace(':', ''),
      host: parsed.host,
      pathname: parsed.pathname,
      queryParams: Object.fromEntries(parsed.searchParams),
      fragment: parsed.hash.replace('#', '') || null,
    }
  } catch {
    result.value = { valid: false, fullUrl, error: '無效的 deep link 格式' }
  }
}
</script>
