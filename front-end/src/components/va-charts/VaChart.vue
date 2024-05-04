<template>
  <component :is="chartComponent" :chart-data="data" :data="data" :options="chartOptions" class="va-chart" />
</template>

<script lang="ts" setup generic="T extends 'line' | 'bar' | 'bubble' | 'doughnut' | 'pie'">
import { computed } from 'vue'
import type { ChartOptions, ChartData } from 'chart.js'
import { defaultConfig, chartTypesMap } from './vaChartConfigs'
//import { DeepPartial } from 'chart.js/dist/types/utils'

defineOptions({
  name: 'VaChart',
})

const props = defineProps<{
  data: ChartData<T>
  options?: ChartOptions<T>
  type: T
}>()

const chartComponent = chartTypesMap[props.type]

const chartOptions = computed<ChartOptions<T>>(() => ({
  ...(defaultConfig as any),
  ...(props.options as any), //DeepPartial<any>
}))
</script>

<style lang="scss">
.va-chart {
  min-width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  > * {
    height: 100%;
    width: 100%;
  }

  canvas {
    width: 100%;
    height: auto;
    min-height: 20px;
  }
}
</style>
