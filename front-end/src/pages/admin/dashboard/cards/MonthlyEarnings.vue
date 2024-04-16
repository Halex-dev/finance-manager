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
          <div class="text-xl font-bold mb-2">{{ formatMoney(monthlyEarnings) }}</div>
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

import { useTransactionsStore } from '../../../../stores/api/transactions'
import { formatMoney } from '../../../../data/charts/revenueChartData'
import { CategoryType } from '../../../categories/types'

const transactionsStore = useTransactionsStore()
const loading = computed(() => transactionsStore.loading)
const transactions = computed(() => transactionsStore.transactions)

let monthlyEarnings = 0

watch([transactions], ([transactions]) => {
  const d = new Date()
  const month = d.getMonth()
  monthlyEarnings = 0

  transactions.forEach((transaction) => {
    if (transaction.category.category_type === CategoryType.INCOME) {
      const dateTransa = new Date(transaction.date)
      const transactionMonth = dateTransa.getMonth()
      if (transactionMonth === month) {
        monthlyEarnings += transaction.amount
      }
    }
  })

  return monthlyEarnings
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

transactionsStore.fetch()
</script>
