<template>
  <template v-if="loading">
    <VaCard class="flex flex-col">
      <VaCardTitle class="flex items-start justify-between">
        <h1 class="card-title text-secondary font-bold uppercase">Revenue Report</h1>
      </VaCardTitle>
      <VaCardContent class="flex flex-col-reverse md:flex-row md:items-center justify-between gap-5 h-full">
        <section class="flex flex-col items-start w-full sm:w-1/3 md:w-2/5 lg:w-1/4 gap-2 md:gap-8 pl-4">
          <div>
            <p class="text-xl font-semibold">5</p>
            <p class="whitespace-nowrap mt-2">Total earnings</p>
          </div>
          <div class="flex flex-col sm:flex-col gap-2 md:gap-8 w-full">
            <div>
              <div class="flex items-center">
                <span class="inline-block w-2 h-2 mr-2 -ml-4" :style="{ backgroundColor: earningsColor }"></span>
                <span class="text-secondary">Earnings this month</span>
              </div>
              <div class="mt-2 text-xl font-semibold">0</div>
            </div>
            <div>
              <div class="flex items-center">
                <span class="inline-block w-2 h-2 mr-2 -ml-4" :style="{ backgroundColor: expensesColor }"></span>
                <span class="text-secondary">Expense this month</span>
              </div>
              <div class="mt-2 text-xl font-semibold">0</div>
            </div>
          </div>
        </section>
      </VaCardContent>
    </VaCard>
  </template>
  <template v-else>
    <VaCard class="flex flex-col">
      <VaCardTitle class="flex items-start justify-between">
        <h1 class="card-title text-secondary font-bold uppercase">Revenue Report</h1>
        <div class="flex gap-2">
          <VaSelect v-model="selectedMonth" preset="small" :options="monthsWithCurrentYear" class="w-24" />
          <VaButton class="h-2" size="small" preset="primary" @click="exportAsCSV">Export</VaButton>
        </div>
      </VaCardTitle>
      <VaCardContent class="flex flex-col-reverse md:flex-row md:items-center justify-between gap-5 h-full">
        <section class="flex flex-col items-start w-full sm:w-1/3 md:w-2/5 lg:w-1/4 gap-2 md:gap-8 pl-4">
          <div>
            <p class="text-xl font-semibold">{{ formatMoney(totalEarnings) }}</p>
            <p class="whitespace-nowrap mt-2">Total earnings</p>
          </div>
          <div class="flex flex-col sm:flex-col gap-2 md:gap-8 w-full">
            <div>
              <div class="flex items-center">
                <span class="inline-block w-2 h-2 mr-2 -ml-4" :style="{ backgroundColor: earningsColor }"></span>
                <span class="text-secondary">Earnings this month</span>
              </div>
              <div class="mt-2 text-xl font-semibold">{{ formatMoney(earningsForSelectedMonth.earning) }}</div>
            </div>
            <div>
              <div class="flex items-center">
                <span class="inline-block w-2 h-2 mr-2 -ml-4" :style="{ backgroundColor: expensesColor }"></span>
                <span class="text-secondary">Expense this month</span>
              </div>
              <div class="mt-2 text-xl font-semibold">{{ formatMoney(earningsForSelectedMonth.expenses) }}</div>
            </div>
          </div>
        </section>
        <RevenueReportChart
          class="w-2/3 md:w-3/5 lg:w-3/4 h-full min-h-72 sm:min-h-32 pt-4"
          :revenues="revenuesChart"
          :months="months"
        />
      </VaCardContent>
    </VaCard>
  </template>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { VaCard } from 'vuestic-ui'
import RevenueReportChart from './RevenueReportChart.vue'
import { downloadAsCSV } from '../../../../services/toCSV'
import {
  earningsColor,
  expensesColor,
  months,
  generateRevenues,
  getRevenuePerMonth,
  formatMoney,
  generateRevenuesNull,
} from '../../../../data/charts/revenueChartData'

import { useTransactionsStore } from '../../../../stores/api/transactions'

const transactionsStore = useTransactionsStore()

//TODO togliere e mettere animazione
let revenuesChart = generateRevenuesNull(months)

const loading = computed(() => transactionsStore.loading)
const transactions = computed(() => transactionsStore.transactions)

const currentYear = new Date().getFullYear()
const monthsWithCurrentYear = months.map((month) => `${month} ${currentYear}`)

const selectedMonth = ref(monthsWithCurrentYear[0])

const earningsForSelectedMonth = computed(() => {
  return getRevenuePerMonth(selectedMonth.value.split(' ')[0], revenuesChart)
})

const totalEarnings = computed(() => {
  return earningsForSelectedMonth.value.earning + earningsForSelectedMonth.value.expenses
})

watch([transactions, loading], ([transactions, loading]) => {
  if (!loading) revenuesChart = generateRevenues(months, transactions)
})

const exportAsCSV = () => {
  downloadAsCSV(revenuesChart, 'revenue-report')
}

transactionsStore.fetch()
</script>
