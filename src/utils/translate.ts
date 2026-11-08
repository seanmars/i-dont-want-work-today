// 兩個免費且允許瀏覽器跨網域呼叫 (CORS) 的翻譯來源. Google 失敗時改用 MyMemory.
const GOOGLE_URL = 'https://translate.googleapis.com/translate_a/single'
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'
const TIMEOUT_MS = 8000

const POS_LABELS: Record<string, string> = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  preposition: 'prep.',
  pronoun: 'pron.',
  conjunction: 'conj.',
  interjection: 'interj.',
  abbreviation: 'abbr.',
}

const MAX_TERMS_PER_POS = 4

type GoogleSentence = [string, ...unknown[]]
type GoogleDictEntry = [string, string[], ...unknown[]]
type GoogleResponse = [GoogleSentence[] | null, GoogleDictEntry[] | null, ...unknown[]]

interface MyMemoryResponse {
  responseStatus: number
  responseData: { translatedText: string }
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return (await response.json()) as T
}

/** 有字典資料時, 輸出 "n. 蘋果, 蘋; v. ..." 的格式; 否則輸出整句翻譯. */
const translateByGoogle = async (text: string): Promise<string> => {
  // hl=en: 詞性固定用英文回傳. 沒有指定時會跟著瀏覽器語言, 變成 "名詞".
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: 'zh-TW', hl: 'en', q: text })
  const data = await fetchJson<GoogleResponse>(`${GOOGLE_URL}?${params}&dt=t&dt=bd`)

  const dictionary = data[1] ?? []
  if (dictionary.length > 0) {
    return dictionary
      .map(([pos, terms]) => {
        const label = POS_LABELS[pos] ?? pos
        return `${label} ${terms.slice(0, MAX_TERMS_PER_POS).join(', ')}`
      })
      .join('; ')
  }

  const sentences = data[0] ?? []
  return sentences.map((sentence) => sentence[0]).join('')
}

const translateByMyMemory = async (text: string): Promise<string> => {
  const params = new URLSearchParams({ q: text, langpair: 'en|zh-TW' })
  const data = await fetchJson<MyMemoryResponse>(`${MYMEMORY_URL}?${params}`)
  if (data.responseStatus !== 200) {
    throw new Error(`MyMemory status ${data.responseStatus}`)
  }
  return data.responseData.translatedText
}

/** 把英文翻成台灣正體中文. 所有來源都失敗時回傳空字串. */
export const translateToZhTW = async (text: string): Promise<string> => {
  const providers = [translateByGoogle, translateByMyMemory]
  for (const provider of providers) {
    try {
      const result = (await provider(text)).trim()
      if (result) {
        return result
      }
    } catch (err) {
      console.warn(`Translate failed (${provider.name}):`, err)
    }
  }
  return ''
}
