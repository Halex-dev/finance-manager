<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
    <VaCard>
      <VaCardTitle class="pb-0!">
        <h1 class="card-title text-secondary font-bold uppercase text-lg">Months expense</h1>
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
            <div class="flex items-center">
              <span class="w-2 h-2 mr-2 rounded-full" :style="{ backgroundColor: earningsBackground }"></span>
              <span class="text-secondary">Earnings</span>
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 mr-2 rounded-full" :style="{ backgroundColor: profitBackground }"></span>
              <span class="text-secondary">Profit</span>
            </div>
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
        <h1 class="card-title text-secondary font-bold uppercase text-lg">Months Income</h1>
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
            <div class="flex items-center">
              <span class="w-2 h-2 mr-2 rounded-full" :style="{ backgroundColor: earningsBackground }"></span>
              <span class="text-secondary">Earnings</span>
            </div>
            <div class="flex items-center">
              <span class="w-2 h-2 mr-2 rounded-full" :style="{ backgroundColor: profitBackground }"></span>
              <span class="text-secondary">Profit</span>
            </div>
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

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { formatMoney } from '../../../../data/charts/revenueChartData'
import { VaCard } from 'vuestic-ui'
import VaChart from '../../../../components/va-charts/VaChart.vue'

import { useTransactionsStore } from '../../../../stores/api/transactions'
import { Transaction } from '../../../transactions/types'
import { useCategoriesStore } from '../../../../stores/api/categories'
import { Category, CategoryType } from '../../../categories/types'

import { profitBackground, earningsBackground } from '../../../../data/charts/doughnutChartData'
import { doughnutConfig } from '../../../../components/va-charts/vaChartConfigs'
import { ChartOptions } from 'chart.js'
import { useChartData } from '../../../../data/charts/composables/useChartData'
import { externalTooltipHandler } from '../../../../components/va-charts/external-tooltip'
import { TDoughnutChartData } from '../../../../data/types'

const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const loading = computed(() => transactionsStore.loading)
const transactions = computed(() => transactionsStore.transactions)
const categories = computed(() => categoriesStore.categories)

const exampleChartData: TDoughnutChartData = {
  labels: ['Profit', 'Expenses'],
  datasets: [
    {
      label: 'Yearly Breakdown',
      backgroundColor: [profitBackground, earningsBackground],
      data: [432, 167],
    },
  ],
}

const chartDataExp = ref<TDoughnutChartData>(useChartData(exampleChartData).value)
const circumferenceExp = ref<number>(calculateCircumference(chartDataExp).value)

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
const circumferenceInc = ref<number>(calculateCircumference(chartDataInc).value)

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

categoriesStore.fetch()
transactionsStore.fetch()

function generateCategoryLabelsAndCosts(transactions: Transaction[]): {
  expenses: { label: string; cost: number }[]
  income: { label: string; cost: number }[]
} {
  const categoryIncomeMap = new Map<string, number>()
  const categoryExpensesMap = new Map<string, number>()

  // Itera attraverso le transazioni per raggrupparle per categoria e sommare i costi
  transactions.forEach((transaction) => {
    const categoryName = transaction.category.name
    const transactionCost = transaction.amount

    if (transaction.category.category_type === CategoryType.INCOME) {
      if (categoryIncomeMap.has(categoryName)) {
        // Se la categoria esiste già, aggiungi il costo corrente
        categoryIncomeMap.set(categoryName, categoryIncomeMap.get(categoryName)! + transactionCost)
      } else {
        // Se la categoria non esiste ancora, crea una nuova voce
        categoryIncomeMap.set(categoryName, transactionCost)
      }
    } else {
      if (categoryExpensesMap.has(categoryName)) {
        // Se la categoria esiste già, aggiungi il costo corrente
        categoryExpensesMap.set(categoryName, categoryExpensesMap.get(categoryName)! + transactionCost)
      } else {
        // Se la categoria non esiste ancora, crea una nuova voce
        categoryExpensesMap.set(categoryName, transactionCost)
      }
    }
  })

  // Costruisci un array di oggetti contenenti etichetta e costo per le categorie di spesa
  const expenses: { label: string; cost: number }[] = []
  categoryExpensesMap.forEach((cost, label) => {
    expenses.push({ label, cost })
  })

  // Costruisci un array di oggetti contenenti etichetta e costo per le categorie di entrata
  const income: { label: string; cost: number }[] = []
  categoryIncomeMap.forEach((cost, label) => {
    income.push({ label, cost })
  })

  return { expenses, income }
}

function generateDoughnutChartData(
  transactions: Transaction[],
  categories: Category[],
): { ExpChartData: TDoughnutChartData; IncChartData: TDoughnutChartData; totIncome: number; totExp: number } {
  // Genera etichette e costi per ogni categoria
  const { expenses, income } = generateCategoryLabelsAndCosts(transactions)

  let totIncome = 0
  let totExp = 0

  // Estrai etichette e costi dall'array generato per le categorie di spesa
  const expensesLabels: string[] = []
  const expensesData: number[] = []
  expenses.forEach((item) => {
    expensesLabels.push(item.label)
    expensesData.push(item.cost)
    totExp += item.cost
  })

  // Estrai etichette e costi dall'array generato per le categorie di entrata
  const incomeLabels: string[] = []
  const incomeData: number[] = []
  income.forEach((item) => {
    incomeLabels.push(item.label)
    incomeData.push(item.cost)
    totIncome += item.cost
  })

  // Trova il colore corrispondente per ogni categoria di spesa
  const expensesBackgrounds: string[] = []
  expenses.forEach((item) => {
    const category = categories.find((cat) => cat.name === item.label)
    if (category) {
      expensesBackgrounds.push(category.color)
    }
  })

  // Trova il colore corrispondente per ogni categoria di entrata
  const incomeBackgrounds: string[] = []
  income.forEach((item) => {
    const category = categories.find((cat) => cat.name === item.label)
    if (category) {
      incomeBackgrounds.push(category.color)
    }
  })

  // Costruisci l'oggetto dati del grafico a torta
  const ExpChartData: TDoughnutChartData = {
    labels: expensesLabels,
    datasets: [
      {
        label: 'Yearly Breakdown',
        backgroundColor: expensesBackgrounds,
        data: expensesData,
      },
    ],
  }

  const IncChartData: TDoughnutChartData = {
    labels: incomeLabels,
    datasets: [
      {
        label: 'Yearly Breakdown',
        backgroundColor: incomeBackgrounds,
        data: incomeData,
      },
    ],
  }

  totExp = Number(totExp.toFixed(2))
  totIncome = Number(totIncome.toFixed(2))

  return { ExpChartData, IncChartData, totIncome, totExp }
}

function calculateCircumference(data: any) {
  return computed(() => {
    if (data.datasets) return 360 * (data.datasets[0].data.reduce((acc: number, d: number) => acc + d, 0) / 800)
    else return 360
  })
}

watch([transactions], ([transactions]) => {
  if (!loading.value && categories.value.length != 0) {
    const { ExpChartData, IncChartData, totIncome, totExp } = generateDoughnutChartData(transactions, categories.value)

    chartDataExp.value = useChartData(ExpChartData).value
    circumferenceExp.value = calculateCircumference(chartDataExp).value
    optionsExp.circumference = circumferenceExp.value

    chartDataInc.value = useChartData(IncChartData).value
    circumferenceInc.value = calculateCircumference(chartDataInc).value
    optionsInc.circumference = circumferenceInc.value

    totIncomeCard.value = totIncome
    totExpCard.value = totExp
  }
})
</script>
