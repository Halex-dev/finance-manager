//TODO fare statistiche
<template>
  <template v-if="loading">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
      <VaSkeleton variant="squared" height="12rem" />
      <VaSkeleton variant="squared" height="12rem" />
    </div>
  </template>
  <template v-else>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
      <VaCard>
        <VaCardTitle class="pb-0!">
          <h1 class="card-title text-secondary font-bold uppercase text-lg">{{ selectedOptionExp }} expense</h1>
        </VaCardTitle>
        <VaCardContent class="flex flex-row gap-4 items-center">
          <div class="w-1/2">
            <div class="text-4xl font-bold mb-2">{{ loading ? formatMoney(0) : formatMoney(totExpCard) }}</div>
            <p class="text-xs text-success whitespace-nowrap">
              <VaIcon name="arrow_outward" />
              {{ loading ? '0%' : '+2.5%' }}
              <span class="text-secondary"> last year</span>
            </p>
            <div class="my-4 flex flex-col space-y-2">
              <VaButtonToggle
                v-model="selectedOptionExp"
                color="background-element"
                border-color="background-element"
                :options="[
                  { label: 'Month', value: 'month' },
                  { label: 'Year', value: 'year' },
                ]"
              />
            </div>
          </div>
          <div class="w-1/2 flex items-center justify-center h-full">
            <VaChart
              v-if="!loading && chartDataExp"
              :data="chartDataExp"
              class="chart chart--donut h-36 w-36"
              type="doughnut"
              :options="optionsExp"
            />
          </div>
        </VaCardContent>
      </VaCard>
      <VaCard>
        <VaCardTitle class="pb-0!">
          <h1 class="card-title text-secondary font-bold uppercase text-lg">{{ selectedOptionInc }} Income</h1>
        </VaCardTitle>
        <VaCardContent class="flex flex-row gap-4 items-center">
          <div class="w-1/2">
            <div class="text-4xl font-bold mb-2">{{ loading ? formatMoney(0) : formatMoney(totIncomeCard) }}</div>
            <p class="text-xs text-success whitespace-nowrap">
              <VaIcon name="arrow_outward" />
              {{ loading ? '0%' : '+2.5%' }}
              <span class="text-secondary"> last year</span>
            </p>
            <div class="my-4 flex flex-col space-y-2">
              <VaButtonToggle
                v-model="selectedOptionInc"
                color="background-element"
                border-color="background-element"
                :options="[
                  { label: 'Month', value: 'month' },
                  { label: 'Year', value: 'year' },
                ]"
              />
            </div>
          </div>
          <div class="w-1/2 flex items-center justify-center h-full">
            <VaChart
              v-if="!loading && chartDataInc"
              :data="chartDataInc"
              class="chart chart--donut h-36 w-36"
              type="doughnut"
              :options="optionsInc"
            />
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue'
import { formatMoney } from '../../../data/charts/revenueChartData'
import { VaCard } from 'vuestic-ui'
import VaChart from '../../../components/va-charts/VaChart.vue'

import { useTransactionsStore } from '../../../stores/api/transactions'
import { Transaction } from '../../transactions/types'
import { useCategoriesStore } from '../../../stores/api/categories'
import { CategoryType } from '../../categories/types'

import { doughnutConfig } from '../../../components/va-charts/vaChartConfigs'
import { ChartOptions } from 'chart.js'
import { useChartData } from '../../../data/charts/composables/useChartData'
import { externalTooltipHandler } from '../../../components/va-charts/external-tooltip'
import { TDoughnutChartData } from '../../../data/types'

const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const categories = computed(() => categoriesStore.categories)
const transactions = computed(() => transactionsStore.transactions)
const transactionsMonth = computed(() => transactionsStore.transactionsMonth)
const loading = computed(() => transactionsStore.loading)

const exampleChartData: TDoughnutChartData = {
  labels: [],
  datasets: [
    {
      label: '',
      backgroundColor: [],
      data: [],
    },
  ],
}

const chartDataExp = ref<TDoughnutChartData>(useChartData(exampleChartData).value)
const circumferenceExp = ref<number>(calculateCircumference(chartDataExp))

const optionsExp: ChartOptions<'doughnut'> = {
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
  circumference: circumferenceExp.value, // Inizializza a un valore qualsiasi, verrà sovrascritto nella watch function
}

const chartDataInc = ref<TDoughnutChartData>(useChartData(exampleChartData).value)
const circumferenceInc = ref<number>(calculateCircumference(chartDataInc))

const optionsInc: ChartOptions<'doughnut'> = {
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
  circumference: circumferenceInc.value, // Inizializza a un valore qualsiasi, verrà sovrascritto nella watch function
}

const totIncomeCard = ref<number>(0)
const totExpCard = ref<number>(0)

const transactionsIncome = ref<Transaction[]>(transactionsStore.transactions)
const transactionsExp = ref<Transaction[]>(transactionsIncome.value)

const selectedOptionExp = ref<string>('month')
const selectedOptionInc = ref<string>('month')

// Function to generate labels for income
function generateLabelIncome(transactions: Transaction[]): { income: { label: string; cost: number }[] } {
  const categoryIncomeMap = new Map<string, number>()

  transactions.forEach((transaction) => {
    const categoryName = transaction.category.name
    const transactionCost = transaction.amount

    if (transaction.category.category_type === CategoryType.INCOME) {
      if (categoryIncomeMap.has(categoryName)) {
        categoryIncomeMap.set(categoryName, categoryIncomeMap.get(categoryName)! + transactionCost)
      } else {
        categoryIncomeMap.set(categoryName, transactionCost)
      }
    }
  })

  const income: { label: string; cost: number }[] = []
  categoryIncomeMap.forEach((cost, label) => {
    income.push({ label, cost })
  })

  return { income }
}

// Function to generate labels for expenses
function generateLabelExpense(transactions: Transaction[]): { expense: { label: string; cost: number }[] } {
  const categoryExpenseMap = new Map<string, number>()

  transactions.forEach((transaction) => {
    const categoryName = transaction.category.name
    const transactionCost = transaction.amount

    if (transaction.category.category_type !== CategoryType.INCOME) {
      if (categoryExpenseMap.has(categoryName)) {
        categoryExpenseMap.set(categoryName, categoryExpenseMap.get(categoryName)! + transactionCost)
      } else {
        categoryExpenseMap.set(categoryName, transactionCost)
      }
    }
  })

  const expense: { label: string; cost: number }[] = []
  categoryExpenseMap.forEach((cost, label) => {
    expense.push({ label, cost })
  })

  return { expense }
}

// Function to generate data for doughnut chart
function generateDoughnutChartData(
  transactions: Transaction[],
  income = true,
): { data: TDoughnutChartData; tot: number } {
  let clearTransactions = []
  let tot = 0

  if (income) {
    const { income } = generateLabelIncome(transactions)
    clearTransactions = income
  } else {
    const { expense } = generateLabelExpense(transactions)
    clearTransactions = expense
  }

  // Extract labels and costs from the generated array for expense categories
  const Labels: string[] = []
  const Data: number[] = []

  clearTransactions.forEach((item) => {
    Labels.push(item.label)
    Data.push(item.cost)
    tot += item.cost
  })

  // Find corresponding color for each expense category
  const colorBackgrounds: string[] = []
  clearTransactions.forEach((item) => {
    const category = categories.value.find((cat) => cat.name === item.label)
    if (category) {
      colorBackgrounds.push(category.color)
    } else {
      colorBackgrounds.push('#ffa500') //Amortization color //TODO rendilo globale
    }
  })

  // Build chart data object
  const data: TDoughnutChartData = {
    labels: Labels,
    datasets: [
      {
        label: '',
        backgroundColor: colorBackgrounds,
        data: Data,
      },
    ],
  }

  tot = Number(tot.toFixed(2))
  return { data, tot }
}

// Function to calculate circumference of the chart
function calculateCircumference(data: any) {
  if (data.datasets) return 360 * (data.datasets[0].data.reduce((acc: number, d: number) => acc + d, 0) / 800)
  else return 360
}

// Function to load data
async function loadData(selectedOption: string, dataRef: any, income = true) {
  if (categories.value.length != 0) {
    // Execute data fetching function and assign data to the reference
    dataRef.value = selectedOption === 'month' ? transactionsMonth.value : transactions.value
    // Generate data for the doughnut chart
    const { data, tot } = generateDoughnutChartData(dataRef.value, income)

    // Update chart data based on whether it's income or expense
    if (income) {
      chartDataInc.value = useChartData(data).value
      circumferenceInc.value = calculateCircumference(chartDataInc)
      optionsInc.circumference = circumferenceInc.value
      totIncomeCard.value = tot
    } else {
      chartDataExp.value = useChartData(data).value
      circumferenceExp.value = calculateCircumference(chartDataInc)
      optionsExp.circumference = circumferenceInc.value
      totExpCard.value = tot
    }
  }
}

watch([transactions, transactionsMonth], async () => {
  await loadData(selectedOptionExp.value === 'month' ? 'month' : 'year', transactionsExp, false)
  await loadData(selectedOptionInc.value === 'month' ? 'month' : 'year', transactionsIncome)
})

watch([selectedOptionInc], async ([selectedOptionInc]) => {
  await loadData(selectedOptionInc === 'month' ? 'month' : 'year', transactionsIncome)
})

watch([selectedOptionExp], async ([selectedOptionExp]) => {
  await loadData(selectedOptionExp === 'month' ? 'month' : 'year', transactionsExp, false)
})

onMounted(async () => {
  if (categories.value.length === 0) await categoriesStore.fetch()

  if (transactionsMonth.value.length === 0) {
    await transactionsStore.fetchByMonth(new Date().getMonth() + 1)
  }
  await loadData('month', transactionsIncome)
  await loadData('month', transactionsExp, false)
})
</script>
