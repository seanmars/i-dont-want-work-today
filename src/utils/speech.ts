// 兩種發音來源:
// 1. 瀏覽器內建的 Web Speech API. 有 Google 英文語音時優先使用.
// 2. Yahoo 奇摩字典的美式真人錄音 (Oxford). 沒有音檔時改用瀏覽器發音.
const LANG = 'en-US'
const YAHOO_AUDIO_URL = 'https://s.yimg.com/bg/dict/ox/mp3/v1'

let englishVoice: SpeechSynthesisVoice | null = null
let currentAudio: HTMLAudioElement | null = null

const pickEnglishVoice = () => {
  const voices = window.speechSynthesis.getVoices()
  const english = voices.filter((voice) => voice.lang.startsWith('en'))
  englishVoice =
    english.find((voice) => voice.name.includes('Google') && voice.lang === LANG) ??
    english.find((voice) => voice.lang === LANG) ??
    english[0] ??
    null
}

export const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

if (isSpeechSupported) {
  // Chrome 第一次呼叫 getVoices() 會回傳空陣列, 要等 voiceschanged 事件.
  pickEnglishVoice()
  window.speechSynthesis.addEventListener('voiceschanged', pickEnglishVoice)
}

/** 停止所有正在播放的發音, 連續點擊時才不會互相重疊. */
const stopAll = () => {
  if (isSpeechSupported) {
    window.speechSynthesis.cancel()
  }
  currentAudio?.pause()
  currentAudio = null
}

export const speak = (text: string) => {
  stopAll()
  if (!isSpeechSupported || !text) {
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LANG
  utterance.rate = 0.9
  if (englishVoice) {
    utterance.voice = englishVoice
  }
  window.speechSynthesis.speak(utterance)
}

/** Yahoo 只有單一單字的音檔, 片語一定沒有. */
export const hasYahooAudio = (text: string) => /^[A-Za-z']+$/.test(text)

export const speakByYahoo = async (text: string) => {
  stopAll()
  // Yahoo 的檔名一律是小寫, 例如 apple@_us_1.mp3.
  const audio = new Audio(`${YAHOO_AUDIO_URL}/${encodeURIComponent(text.toLowerCase())}@_us_1.mp3`)
  currentAudio = audio

  try {
    await audio.play()
  } catch (err) {
    // 被下一次點擊中斷時不要補播; 只有音檔載入失敗時才改用瀏覽器發音.
    if (currentAudio === audio) {
      console.warn(`Yahoo audio not found for "${text}", fallback to browser speech.`, err)
      speak(text)
    }
  }
}
