<template>
  <template v-if="loading">
    <VaSkeleton variant="squared" height="10rem" />
  </template>
  <template v-else>
    <VaCard>
      <VaCardTitle class="pb-0!">
        <h1 class="card-title text-secondary font-bold uppercase">{{ t('dashboard.yearly.title') }}</h1>
      </VaCardTitle>
      <VaCardContent class="flex flex-row gap-1">
        <section class="w-1/2">
          <div class="text-xl font-bold mb-2">{{ formatMoney(currentDifference) }}</div>
          <div v-if="percentIncrease === Infinity">
            <p class="text-xs text-success">
              <VaIcon name="arrow_upward" />
              {{ formatMoney(currentDifference) }}
              <span class="text-secondary"> {{ t('dashboard.label.last_year') }}</span>
            </p>
          </div>
          <div v-else-if="percentIncrease === -Infinity">
            <p class="text-xs text-danger">
              <VaIcon name="arrow_downward" />
              {{ formatMoney(currentDifference) }}
              <span class="text-secondary"> {{ t('dashboard.label.last_year') }}</span>
            </p>
          </div>
          <div v-else-if="percentIncrease < 0">
            <p class="text-xs text-danger">
              <VaIcon name="arrow_downward" />
              {{ percentIncrease }}%
              <span class="text-secondary"> {{ t('dashboard.label.last_year') }}</span>
            </p>
          </div>
          <div v-else-if="percentIncrease > 0">
            <p class="text-xs text-success">
              <VaIcon name="arrow_upward" />
              {{ percentIncrease }}%
              <span class="text-secondary"> {{ t('dashboard.label.last_year') }}</span>
            </p>
          </div>
          <div class="my-4 gap-2 flex flex-col">
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-2" :style="{ backgroundColor: earningsBackground }"></span>
              <span class="text-secondary">{{ t('dashboard.yearly.earning') }}</span>
            </div>
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-2" :style="{ backgroundColor: profitBackground }"></span>
              <span class="text-secondary">{{ t('dashboard.yearly.profit') }}</span>
            </div>
          </div>
        </section>
        <div class="w-1/2 flex items-center h-full flex-1 lg:pl-16 pl-2 -mr-1">
          <VaChart
            v-if="chartData"
            :data="chartData"
            class="chart chart--donut h-[90px] w-[90px]"
            type="doughnut"
            :options="options"
          />
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
import { doughnutChartData, profitBackground, earningsBackground } from '../../../data/charts/doughnutChartData'
import { doughnutConfig } from '../../../components/va-charts/vaChartConfigs'
import { ChartOptions } from 'chart.js'
import { externalTooltipHandler } from '../../../components/va-charts/external-tooltip'
import { TDoughnutChartData } from '../../../data/types'

import { useTransactionsStore } from '../../../stores/api/transactions'
import { formatMoney } from '../../../data/charts/revenueChartData'
import { CategoryType } from '../../categories/types'
import { Transaction } from '../../transactions/types'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const transactionsStore = useTransactionsStore()
const loading = computed(() => transactionsStore.loading)
const transactions = computed(() => transactionsStore.transactions)

const currentDifference = ref<number>(0)
const percentIncrease = ref<number>(0)

const chartData = ref<TDoughnutChartData>(useChartData(doughnutChartData).value)
const circumference = ref<number>(360)
const options: ChartOptions<'doughnut'> = {
  ...doughnutConfig,
  plugins: {
    ...doughnutConfig.plugins,
    tooltip: {
      // Chart to small to show tooltips
      enabled: false,
      position: 'nearest',
      external: externalTooltipHandler,
    },
  },
  circumference: circumference.value,
}

// Function to calculate circumference of the chart
async function calculateCircumference(data: any) {
  if (data.datasets) return 360 * (data.datasets[0].data.reduce((acc: number, d: number) => acc + d, 0) / 800)
  else return 360
}

async function calculatePercentageChange(lastMonth: number, thisMonth: number) {
  const currentMonthCost = thisMonth || 0
  const previousMonthCost = lastMonth || 0

  // Calculate the percentage change
  const percentageChange = ((currentMonthCost - previousMonthCost) / previousMonthCost) * 100
  const roundedPercentage = parseFloat(percentageChange.toFixed(2))

  return roundedPercentage
}

async function getRevenueAndExpense(data: Transaction[]): Promise<{ totalRevenue: number; totalExpense: number }> {
  let totalRevenue = 0
  let totalExpense = 0
  for (const transaction of data) {
    // Aggiungi l'importo di ogni transazione alla variabile totale
    if (transaction.category.category_type === CategoryType.INCOME) totalRevenue += transaction.amount
    else totalExpense += transaction.amount
  }

  return { totalRevenue, totalExpense }
}

watch([transactions], async ([transactions]) => {
  const { totalRevenue, totalExpense } = await getRevenueAndExpense(transactions)
  currentDifference.value = totalRevenue - totalExpense

  const lastYear = new Date().getFullYear() - 1
  const TransLastYear = await transactionsStore.fetchByYear(lastYear)

  const { totalRevenue: lastRevenue, totalExpense: lastExpense } = await getRevenueAndExpense(TransLastYear)
  const lastDifference = lastRevenue - lastExpense

  const test = {
    labels: ['Profit', 'Expenses'],
    datasets: [
      {
        label: '',
        backgroundColor: [profitBackground, earningsBackground],
        data: [totalRevenue, totalExpense],
      },
    ],
  }

  chartData.value = useChartData(test).value
  circumference.value = await calculateCircumference(chartData.value)
  options.circumference = circumference.value
  percentIncrease.value = await calculatePercentageChange(lastDifference, currentDifference.value)
})

onMounted(async () => {
  if (transactions.value.length === 0) {
    await transactionsStore.fetch()
    //console.log('YEARLY BREAKUP fetch')
  }
  const { totalRevenue, totalExpense } = await getRevenueAndExpense(transactions.value)
  currentDifference.value = totalRevenue - totalExpense

  const lastYear = new Date().getFullYear() - 1
  const TransLastYear = await transactionsStore.fetchByYear(lastYear)

  const { totalRevenue: lastRevenue, totalExpense: lastExpense } = await getRevenueAndExpense(TransLastYear)
  const lastDifference = lastRevenue - lastExpense

  const test = {
    labels: ['Profit', 'Expenses'],
    datasets: [
      {
        label: '',
        backgroundColor: [profitBackground, earningsBackground],
        data: [totalRevenue, totalExpense],
      },
    ],
  }

  chartData.value = useChartData(test).value
  circumference.value = await calculateCircumference(chartData.value)
  options.circumference = circumference.value
  percentIncrease.value = await calculatePercentageChange(lastDifference, currentDifference.value)
})
</script>
