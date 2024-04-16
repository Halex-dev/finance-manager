<template>
  <VaCard class="money-rule-card">
    <VaCardContent>
      <section>
        <header class="flex items-center justify-between">
          <p class="text-lg font-semibold mb-2">{{ title }}</p>
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
            <p class="text-sm">{{ bar.label }}</p>
            <div class="flex items-center">
              <div class="w-3/4 bg-gray-300 h-3 rounded-md mr-2">
                <div class="h-full rounded-md" :style="{ width: bar.percent + '%' }" :class="[bar.color]"></div>
              </div>
              <p class="text-sm font-semibold">{{ bar.labelRight }}</p>
            </div>
          </div>
          <p class="text-xs text-secondary mt-2">
            <span :class="changeClass">
              <template v-if="up">↑</template>
              <template v-else>↓</template>
              {{ changeText }}
            </span>
          </p>
        </div>
      </section>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VaCard, VaCardContent } from 'vuestic-ui'

const props = defineProps<{
  title: string
  changeText: string
  up: boolean
  iconBackground: string
  iconColor: string
  bars: { label: string; labelRight: string; percent: number; color?: string }[]
}>()

const changeClass = computed(() => ({
  'text-success': props.up,
  'text-red-600': !props.up,
}))
</script>

<style scoped>
.money-rule-card {
  border: none;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
}

.money-rule-card .va-card-content {
  padding: 20px;
}
</style>
