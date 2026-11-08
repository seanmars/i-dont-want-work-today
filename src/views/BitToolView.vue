<template>
  <div class="max-w-md">
    <!-- 輸入區域 -->
    <div class="grid grid-cols-[6.5rem_1fr] items-center gap-x-4 gap-y-3">
      <label for="input1" class="text-sm font-medium">ID</label>
      <input
        id="input1"
        type="number"
        v-model="inputId"
        min="0"
        aria-label="ID"
        class="field font-mono"
      />

      <label for="input2" class="text-sm font-medium">Byte Index</label>
      <input
        id="input2"
        type="number"
        v-model="inputByteIndex"
        min="0"
        aria-label="Byte Index"
        class="field font-mono"
      />

      <label for="input3" class="text-sm font-medium">Bit Position</label>
      <input id="input3" type="number" class="field font-mono" ref="inputBitPositionRef" />
    </div>

    <!-- 位元顯示區域: DIP switch, 點一下切換 bit position -->
    <section class="mt-10" aria-label="位元狀態">
      <div class="rounded-[10px] bg-mat p-3 pb-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
        <div class="grid grid-cols-8 gap-2">
          <button
            v-for="n in 8"
            :key="n"
            type="button"
            class="dip"
            :class="{ 'is-on': bits[n - 1] === 1 }"
            :aria-pressed="bits[n - 1] === 1"
            :aria-label="`Bit ${8 - n}`"
            @click="handleBitPositionUpdate(8 - n)"
          >
            <span class="dip-lever"></span>
          </button>
        </div>
        <div class="mt-1.5 grid grid-cols-8 gap-2 text-center font-mono text-xs text-mat-text">
          <span v-for="n in 8" :key="n">{{ 8 - n }}</span>
        </div>
      </div>

      <dl class="mt-4 grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-1 text-sm">
        <dt class="text-mute">Binary</dt>
        <dd class="font-mono">0b{{ bits.join('') }}</dd>
        <dt class="text-mute">Hex</dt>
        <dd class="font-mono">0x{{ maskHex }}</dd>
        <dt class="text-mute">Decimal</dt>
        <dd class="font-mono">{{ maskValue }}</dd>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const inputId = ref('0')
const inputByteIndex = ref('0')
const inputBitPosition = ref('0')
const inputBitPositionRef = ref<HTMLInputElement | null>(null)

interface BitInfo {
  index: number
  position: number
}

interface NumberDivResult {
  quotient: number
  remainder: number
}

const numberDiv = (num: number, divisor: number): NumberDivResult => {
  if (num === 0 || divisor === 0) {
    return { quotient: 0, remainder: 0 }
  }

  const quotient = ~~(num / divisor)
  const remainder = num % divisor
  return { quotient, remainder }
}

const calculateBitInfo = (id: number): BitInfo | null => {
  if (!id || !Number.isInteger(id) || isNaN(id)) {
    return null
  }

  const result = numberDiv(id, 8)

  return {
    index: result.quotient,
    position: result.remainder,
  }
}

const calculateId = (index: number, position: number) => {
  // console.log('calculateId', index, position);
  return index * 8 + position
}

// 驗證所有輸入值
const validateInputIsNumber = (value: string, min: number) => {
  const num = parseInt(value)
  return num >= min ? String(num) : String(min)
}

const onIdChanged = (value: string) => {
  // console.log('id changed', value);
  const val = validateInputIsNumber(value, 0)
  inputId.value = val
  const num = parseInt(val)

  const result = calculateBitInfo(num)
  if (result) {
    inputByteIndex.value = String(result.index)
    inputBitPosition.value = String(result.position)
  } else {
    inputByteIndex.value = '0'
    inputBitPosition.value = '0'
  }

  updateInputBitPositionRef(inputBitPosition.value)
}

const onByteIndexChanged = (value: string) => {
  // console.log('byte index changed', value);
  const index = value
  const position = inputBitPosition.value

  if (!index || !Number.isInteger(+index) || !position || !Number.isInteger(+position)) {
    // updateBitVision(bitVision);
    return
  }

  const vIdx = parseInt(index)
  let vPos = parseInt(position)
  vPos %= 8

  inputBitPosition.value = vPos.toString()

  const id = calculateId(vIdx, vPos)
  inputId.value = id.toString()
}

watch(inputId, (value) => {
  onIdChanged(value)
})

watch(inputByteIndex, (value) => {
  inputByteIndex.value = validateInputIsNumber(value, 0)
  onByteIndexChanged(inputByteIndex.value)
})

const bits = ref(Array(8).fill(0))

// 目前 bit 對應的 mask, 例如 bit 3 => 0b00001000 / 0x08
const maskValue = computed(() => parseInt(bits.value.join(''), 2))
const maskHex = computed(() => maskValue.value.toString(16).toUpperCase().padStart(2, '0'))

const handleBitPositionUpdate = (value: number) => {
  value = isNaN(value) ? 0 : value
  value %= 8

  inputBitPosition.value = value.toString()
  updateInputBitPositionRef(inputBitPosition.value)

  const indexVal = parseInt(inputByteIndex.value) || 0
  const idVal = calculateId(indexVal, value)
  inputId.value = idVal.toString()
}

// update bits
const updateBits = () => {
  // const idVal = parseInt(inputId.value) || 0;
  // const indexVal = parseInt(inputByteIndex.value) || 0;
  const positionVal = parseInt(inputBitPosition.value) || 0

  // 複製當前的位元陣列
  const newBits = Array(8).fill(0)

  for (let i = 0; i < 8; i++) {
    newBits[7 - i] = i == positionVal ? 1 : 0
  }

  bits.value = newBits
}

// 監聽輸入變化
watch([inputId, inputByteIndex, inputBitPosition], updateBits)

const updateInputBitPositionRef = (value: string) => {
  if (inputBitPositionRef.value == null) {
    return
  }

  inputBitPositionRef.value.value = value
}

onMounted(() => {
  inputBitPositionRef.value?.addEventListener('keyup', (event) => {
    event.preventDefault()

    const key = event.key
    const keyValue = parseInt(key)
    if (isNaN(keyValue)) {
      updateInputBitPositionRef(inputBitPosition.value)
      return
    }

    handleBitPositionUpdate(keyValue)
  })

  updateInputBitPositionRef(inputBitPosition.value)

  updateBits()
})
</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* DIP switch: 槽 + 撥桿. 撥桿在下方為 0, 推到上方為 1. */
.dip {
  position: relative;
  height: 4.5rem;
  border-radius: 4px;
  background: var(--color-mat-deep);
  box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.4);
  cursor: pointer;
}

.dip:focus-visible {
  outline: 2px solid var(--color-mark);
  outline-offset: 2px;
}

.dip-lever {
  position: absolute;
  right: 4px;
  bottom: 4px;
  left: 4px;
  height: calc(50% - 4px);
  border-radius: 3px;
  background: #dfe7e1;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    0 2px 2px rgb(0 0 0 / 0.35);
  transition:
    transform 160ms cubic-bezier(0.3, 0.7, 0.4, 1),
    background-color 160ms;
}

.dip:hover:not(.is-on) .dip-lever {
  background: #f2f6f3;
}

.dip.is-on .dip-lever {
  transform: translateY(-100%);
  background: var(--color-mark);
}
</style>
