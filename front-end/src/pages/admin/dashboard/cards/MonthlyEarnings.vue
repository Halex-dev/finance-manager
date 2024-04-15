<template>
  <template v-if="loading">
    <VaCard>
      <VaCardTitle>
        <h1 class="card-title text-tag text-secondary font-bold uppercase">Monthly Earnings</h1>
      </VaCardTitle>
      <VaCardContent>
        <div class="p-1 bg-black rounded absolute right-4 top-4">
          <VaIcon name="mso-attach_money" color="#fff" size="large" />
        </div>
        <section>
          <div class="text-xl font-bold mb-2">0</div>
          <p class="text-xs text-success">
            <VaIcon name="arrow_upward" />
            25.36%
            <span class="text-secondary"> last month</span>
          </p>
        </section>
        <div class="w-full flex items-center">
          <VaChart :data="chartData" class="h-24" type="line" :options="options" />
        </div>
      </VaCardContent>
    </VaCard>
  </template>
  <template v-else>
    <VaCard>
      <VaCardTitle>
        <h1 class="card-title text-tag text-secondary font-bold uppercase">Monthly Earnings</h1>
      </VaCardTitle>
      <VaCardContent>
        <div class="p-1 bg-black rounded absolute right-4 top-4">
          <VaIcon name="mso-attach_money" color="#fff" size="large" />
        </div>
        <section>
          <div class="text-xl font-bold mb-2">{{ monthlyEarnings }}</div>
          <p class="text-xs text-success">
            <VaIcon name="arrow_upward" />
            25.36%
            <span class="text-secondary"> last month</span>
          </p>
        </section>
        <div class="w-full flex items-center">
          <VaChart :data="chartData" class="h-24" type="line" :options="options" />
        </div>
      </VaCardContent>
    </VaCard>
  </template>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { VaCard } from 'vuestic-ui'
import VaChart from '../../../../components/va-charts/VaChart.vue'
import { useChartData } from '../../../../data/charts/composables/useChartData'
import { lineChartData } from '../../../../data/charts/lineChartData'
import { ChartOptions } from 'chart.js'

import { useRevenuesStore } from '../../../../stores/api/revenue'
const revenuesStore = useRevenuesStore()

const loading = computed(() => revenuesStore.loading)
const revenues = computed(() => revenuesStore.monthlyRevenue)

let monthlyEarnings = 0

watch([revenues], ([revenues]) => {
  monthlyEarnings = 0
  const d = new Date()
  const month = d.getMonth()
  revenues[month].map((cost) => (monthlyEarnings = +cost.price))
})

const chartData = useChartData(lineChartData)
const options: ChartOptions<'line'> = {
  scales: {
    x: {
      display: false,
      grid: {
        display: false, // Disable X-axis grid lines ("net")
      },
    },
    y: {
      display: false,
      grid: {
        display: false, // Disable Y-axis grid lines ("net")
      },
      ticks: {
        display: false, // Hide Y-axis values
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
}

revenuesStore.fetch(revenuesStore)
</script>
