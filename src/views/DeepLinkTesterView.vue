<template>
  <div class="flex max-w-xl flex-col gap-8">
    <!-- 輸入區域 -->
    <div class="grid gap-x-4 gap-y-3 sm:grid-cols-[6.5rem_1fr] sm:items-center">
      <label for="schema-input" class="text-sm font-medium">Schema</label>
      <div class="field-group">
        <input
          id="schema-input"
          type="text"
          v-model="schema"
          placeholder="myapp"
          aria-label="Schema"
          class="min-w-0 flex-1 rounded-l-md px-3 py-2 font-mono text-[0.9375rem] focus:outline-none"
          @keyup.enter="testDeepLink"
        />
        <span
          class="flex items-center rounded-r-md border-l border-line bg-paper-deep px-3 font-mono text-sm text-mute select-none"
          >://</span
        >
      </div>

      <label for="url-input" class="text-sm font-medium">URL Path</label>
      <input
        id="url-input"
        type="text"
        v-model="urlPath"
        placeholder="home?id=123&name=abc#section1"
        aria-label="URL Path"
        class="field font-mono text-[0.9375rem]"
        @keyup.enter="testDeepLink"
      />

      <p v-if="schemaError" role="alert" class="text-sm text-err sm:col-start-2">
        {{ schemaError }}
      </p>

      <div class="mt-2 flex gap-3 sm:col-start-2">
        <button id="btnParse" type="button" @click="testDeepLink" class="btn btn-primary">
          解析
        </button>
        <button id="btnTest" type="button" @click="openDeepLink" class="btn btn-secondary">
          開啟
        </button>
      </div>
    </div>

    <!-- 結果區域 -->
    <section v-if="result" aria-live="polite">
      <!-- 有效結果 -->
      <div v-if="result.valid" class="panel">
        <h2 class="flex items-center gap-2 border-b border-line px-5 py-3 font-semibold">
          <span class="size-2 rounded-full bg-ok" aria-hidden="true"></span>
          解析成功
        </h2>

        <dl class="grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-2.5 px-5 py-4 text-sm">
          <dt class="text-mute">完整 URL</dt>
          <dd class="font-mono break-all">{{ result.fullUrl }}</dd>

          <dt class="text-mute">Schema</dt>
          <dd class="font-mono">{{ result.schema }}</dd>

          <dt class="text-mute">Host</dt>
          <dd class="font-mono">{{ result.host }}</dd>

          <dt class="text-mute">Path</dt>
          <dd class="font-mono break-all">{{ result.pathname }}</dd>

          <dt class="text-mute">Fragment</dt>
          <dd class="font-mono" :class="{ 'text-mute': result.fragment === null }">
            {{ result.fragment ?? 'null' }}
          </dd>
        </dl>

        <!-- Query Params -->
        <div class="border-t border-line px-5 py-4">
          <h3 class="mb-2 text-sm text-mute">Query Params</h3>
          <p v-if="Object.keys(result.queryParams).length === 0" class="text-sm text-mute">
            沒有 query 參數.
          </p>
          <table v-else class="w-full border-collapse text-sm">
            <thead>
              <tr class="text-left text-mute">
                <th class="border-b border-line py-1.5 pr-4 font-medium">Key</th>
                <th class="border-b border-line py-1.5 font-medium">Value</th>
              </tr>
            </thead>
            <tbody class="font-mono">
              <tr v-for="(val, key) in result.queryParams" :key="key">
                <td class="border-b border-line/60 py-1.5 pr-4 align-top">{{ key }}</td>
                <td class="border-b border-line/60 py-1.5 break-all">{{ val }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 無效結果 -->
      <div v-else class="panel border-err/30 bg-err-soft px-5 py-4">
        <h2 class="font-semibold text-err">解析失敗</h2>
        <p class="mt-1 text-sm text-err">{{ result.error }}</p>
        <p class="mt-3 text-sm text-mute">
          輸入的 URL: <code class="font-mono break-all text-ink">{{ result.fullUrl }}</code>
        </p>
      </div>
    </section>
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

function openDeepLink() {
  schemaError.value = ''

  if (!schema.value.trim()) {
    schemaError.value = 'Schema 不可為空'
    return
  }
  if (/\s/.test(schema.value) || schema.value.includes('://')) {
    schemaError.value = 'Schema 不可包含空白或 "://"'
    return
  }

  const fullUrl = `${schema.value}://${urlPath.value}`
  window.open(fullUrl, '_blank')
}

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
