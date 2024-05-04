<template>
  <VaCard class="money-rule-card">
    <VaCardContent>
      <section>
        <header class="flex items-center justify-between">
          <p class="text-lg font-bold mb-2">{{ title }}</p>
          <div
            class="p-1 rounded"
            :style="{
              backgroundColor: iconBackground,
              color: iconColor,
            }"
          >
            <slot name="icon"></slot>
          </div>
        </header>
        <div>
          <div v-for="(bar, index) in bars" :key="index" class="mb-2">
            <p class="text-sm font-semibold">{{ bar.label }}</p>
            <div class="flex items-center">
              <div class="w-full bg-gray-300 h-3 rounded-md mr-2">
                <div class="h-full rounded-md" :style="{ width: bar.percent + '%' }" :class="[bar.color]"></div>
              </div>
            </div>
            <p class="text-xs text-gray-600">{{ bar.labelRight }}</p>
          </div>
        </div>
      </section>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { VaCard, VaCardContent } from 'vuestic-ui'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  title: string
  iconBackground: string
  iconColor: string
  bars: { label: string; labelRight: string; percent: number; color?: string }[]
}>()
</script>

<style scoped>
.money-rule-card .bar-label-right {
  font-size: 10px; /* Imposta la dimensione del testo a 10px */
  margin-top: 4px; /* Aggiungi spazio superiore per separare il testo dalla barra */
}
</style>
