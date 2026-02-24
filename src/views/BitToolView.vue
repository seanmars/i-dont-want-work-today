<template>
  <div class="container p-4">
    <!-- 標題 -->
    <!--    <h1 class="text-3xl font-bold mb-8">Bit Tool</h1>-->

    <!-- 輸入區域 -->
    <div class="max-w-md space-y-4">
      <div class="flex items-center gap-4">
        <label for="input1" class="w-24 text-gray-600 font-medium">ID</label>
        <input
          id="input1"
          type="number"
          v-model="inputId"
          min="0"
          aria-label="ID"
          class="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      <div class="flex items-center gap-4">
        <label for="input2" class="w-24 text-gray-600 font-medium">Byte Index</label>
        <input
          id="input2"
          type="number"
          v-model="inputByteIndex"
          min="0"
          aria-label="Byte Index"
          class="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      <div class="flex items-center gap-4">
        <label for="input3" class="w-24 text-gray-600 font-medium">Bit Position</label>
        <input
          id="input3"
          type="number"
          class="flex-1 p-2 border rounded focus:outline-none focus:border-blue-500"
          ref="inputBitPositionRef"
        />
      </div>
    </div>

    <!-- 位元顯示區域 -->
    <div class="max-w-md mt-8 space-y-2">
      <!-- 位元索引顯示 -->
      <div class="grid grid-cols-8 gap-2">
        <div v-for="n in 8" :key="n" class="text-center text-sm text-gray-500">
          {{ 8 - n }}
        </div>
      </div>
      <div class="grid grid-cols-8 gap-2">
        <div
          v-for="n in 8"
          :key="n"
          :class="[
            'aspect-square border rounded flex items-center justify-center text-lg font-medium cursor-pointer transition-colors',
            bits[n - 1] ? 'bg-blue-100 text-blue-600' : 'bg-gray-50',
          ]"
        >
          {{ bits[n - 1] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

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
</style>
