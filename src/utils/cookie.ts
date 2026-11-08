// 瀏覽器單一 cookie 的上限約 4096 bytes, 超過會被直接丟棄.
const MAX_COOKIE_SIZE = 4000

// 限制在網站的 base path, 不和同網域的其他專案共用 cookie.
const COOKIE_PATH = import.meta.env.BASE_URL

export const getCookie = (name: string): string | null => {
  const prefix = `${encodeURIComponent(name)}=`
  const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix))
  if (!entry) {
    return null
  }

  try {
    return decodeURIComponent(entry.slice(prefix.length))
  } catch {
    return null
  }
}

/** 寫入 cookie. 內容太大時不寫入, 並回傳 false. */
export const setCookie = (name: string, value: string, maxAgeDays: number): boolean => {
  const cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `max-age=${maxAgeDays * 24 * 60 * 60}`,
    `path=${COOKIE_PATH}`,
    'SameSite=Lax',
    ...(location.protocol === 'https:' ? ['Secure'] : []),
  ].join('; ')

  if (cookie.length > MAX_COOKIE_SIZE) {
    console.warn(`Cookie "${name}" is too large (${cookie.length} bytes), skip saving.`)
    return false
  }

  document.cookie = cookie
  return true
}
