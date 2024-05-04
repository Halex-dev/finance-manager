<template>
  <template v-if="loading">
    <VaSkeleton variant="squared" height="10rem" />
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
          <div v-if="percentIncrease === Infinity">
            <p class="text-xs text-success">
              <VaIcon name="arrow_upward" />
              {{ formatMoney(monthlyEarnings) }}
              <span class="text-secondary"> last month</span>
            </p>
          </div>
          <div v-else-if="percentIncrease === -Infinity">
            <p class="text-xs text-danger">
              <VaIcon name="arrow_downward" />
              {{ formatMoney(monthlyEarnings) }}
              <span class="text-secondary"> last month</span>
            </p>
          </div>
          <div v-else-if="percentIncrease < 0">
            <p class="text-xs text-danger">
              <VaIcon name="arrow_downward" />
              {{ percentIncrease }}%
              <span class="text-secondary"> last month</span>
            </p>
          </div>
          <div v-else-if="percentIncrease > 0">
            <p class="text-xs text-success">
              <VaIcon name="arrow_upward" />
              {{ percentIncrease }}%
              <span class="text-secondary"> last month</span>
            </p>
          </div>
        </section>
        <div class="w-full flex items-center">
          <VaChart :data="chartData" class="h-24" type="line" :options="options" />
        </div>
      </VaCardContent>
    </VaCard>
  </template>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'
import { VaCard } from 'vuestic-ui'
import VaChart from '../../../components/va-charts/VaChart.vue'
import { useChartData } from '../../../data/charts/composables/useChartData'
import { lineChartData } from '../../../data/charts/lineChartData'
import { TLineChartData } from '../../../data/types'
import { ChartOptions } from 'chart.js'

import { useTransactionsStore } from '../../../stores/api/transactions'
import { Transaction } from '../../transactions/types'
import { CategoryType } from '../../categories/types'

import { formatMoney } from '../../../data/charts/revenueChartData'

const transactionsStore = useTransactionsStore()
const loading = computed(() => transactionsStore.loading)
const transactionsMonth = computed(() => transactionsStore.transactionsMonth)
const transactions = computed(() => transactionsStore.transactions)

const monthlyEarnings = ref<number>(0)
const percentIncrease = ref<number>(0)

async function calculatePercentageChange(monthlyData: number[]) {
  // Check if the array has 12 elements
  if (monthlyData.length !== 12) {
    throw new Error('The array must contain 12 elements, one for each month.')
  }

  //TODO fare per dicembre gennaio
  // Get the costs of the current and previous months
  const currentMonth = new Date().getMonth()
  const previousMonth = (currentMonth - 1 + 12) % 12 // Handles the case of January (0) which should consider December (11) as the previous month
  const currentMonthCost = monthlyData[currentMonth] || 0
  const previousMonthCost = monthlyData[previousMonth] || 0

  // Calculate the percentage change
  const percentageChange = ((currentMonthCost - previousMonthCost) / previousMonthCost) * 100
  const roundedPercentage = parseFloat(percentageChange.toFixed(2))

  return roundedPercentage
}

async function generateMonthsEarning(transactions: Transaction[]) {
  const monthsMap = new Map<number, number>()

  for (let month = 0; month < 12; month++) {
    monthsMap.set(month, 0)
  }

  transactions.forEach((transaction) => {
    const transactionCost = transaction.amount
    const transactionDate = new Date(transaction.date)
    const transactionMonth = transactionDate.getMonth()

    if (transaction.category && transaction.category.category_type === CategoryType.INCOME) {
      monthsMap.set(transactionMonth, monthsMap.get(transactionMonth)! + transactionCost)
    }
  })

  // Extract costs from the generated array for expense categories
  const data: number[] = []

  monthsMap.forEach((cost) => {
    data.push(cost)
  })

  return data
}

async function getIncome(transaction: Transaction[]) {
  let income = 0

  transaction.forEach((transaction) => {
    if (transaction.category && transaction.category.category_type === CategoryType.INCOME) {
      income += transaction.amount
    }
  })

  return income
}

watch([transactionsMonth], async ([transactionsMonth]) => {
  monthlyEarnings.value = await getIncome(transactionsMonth)
  chartData.value.datasets[0].data = await generateMonthsEarning(transactions.value)
  percentIncrease.value = await calculatePercentageChange(chartData.value.datasets[0].data)
})

const chartData = ref<TLineChartData>(useChartData(lineChartData).value)
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

onMounted(async () => {
  if (transactions.value.length === 0) await transactionsStore.fetch()

  monthlyEarnings.value = await getIncome(transactionsMonth.value)
  chartData.value.datasets[0].data = await generateMonthsEarning(transactions.value)
  percentIncrease.value = await calculatePercentageChange(chartData.value.datasets[0].data)
})
</script>
