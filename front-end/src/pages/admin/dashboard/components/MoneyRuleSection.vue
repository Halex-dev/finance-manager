<template>
  <template v-if="loading">
    <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3">
      <MoneyRuleCard
        title="50/30/20 Rule"
        icon="fa-money-bill"
        :change-text="'Save 20%'"
        :up="true"
        icon-background="#4CAF50"
        icon-color="#ffffff"
        :bars="[]"
      />

      <MoneyRuleCard
        title="4 Bucket Rule"
        icon="fa-hand-holding-usd"
        :change-text="'Invest 40%'"
        :up="true"
        icon-background="#FDB813"
        icon-color="#ffffff"
        :bars="[]"
      />

      <MoneyRuleCard
        title="70/30 Rule"
        icon="fa-hand-holding-usd"
        :change-text="'Invest 40%'"
        :up="true"
        icon-background="#18b5be"
        icon-color="#ffffff"
        :bars="[]"
      />
    </div>
  </template>
  <template v-else>
    <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3">
      <MoneyRuleCard
        title="50/30/20 Rule"
        icon="fa-money-bill"
        :change-text="'Save 20%'"
        :up="true"
        icon-background="#4CAF50"
        icon-color="#ffffff"
        :bars="bar50Rule"
      />

      <MoneyRuleCard
        title="4 Bucket Rule"
        icon="fa-hand-holding-usd"
        :change-text="'Invest 40%'"
        :up="true"
        icon-background="#FDB813"
        icon-color="#ffffff"
        :bars="bar4Bucket"
      />

      <MoneyRuleCard
        title="70/30 Rule"
        icon="fa-hand-holding-usd"
        :change-text="'Invest 40%'"
        :up="true"
        icon-background="#18b5be"
        icon-color="#ffffff"
        :bars="bar70Rule"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import MoneyRuleCard from '../cards/MoneyRuleCard.vue'

import { useTransactionsStore } from '../../../../stores/api/transactions'
import { Transaction } from '../../../transactions/types'
import { CategoryType } from '../../../categories/types'

//TODO transform all in Asyinc
//import { formatMoney } from '../../../data/charts/revenueChartData'

const transactionsStore = useTransactionsStore()
const loading = computed(() => transactionsStore.loading)
const transactions = computed(() => transactionsStore.transactions)

let bar50Rule: {
  label: string
  labelRight: string
  percent: number
  color?: string
}[] = []

let bar4Bucket: {
  label: string
  labelRight: string
  percent: number
  color?: string
}[] = []

let bar70Rule: {
  label: string
  labelRight: string
  percent: number
  color?: string
}[] = []

watch([transactions], ([transactions]) => {
  const { income, expenses_necessary, expenses_optional, long_term, short_term } = calculateCategoriesType(transactions)

  bar50Rule = adaptBars50Rule(income, expenses_necessary, expenses_optional, long_term, short_term)
  bar4Bucket = adaptBars4Bucket(income, expenses_necessary, expenses_optional, long_term, short_term)
  bar70Rule = adaptBars70Rule(income, expenses_necessary, expenses_optional)
})

function getColorByPercentage(percent: number) {
  if (percent < 50) {
    return 'bg-info'
  } else if (percent < 85) {
    return 'bg-warning'
  } else {
    return 'bg-danger'
  }
}

function getColorByPercentageOpposite(percent: number) {
  if (percent < 50) {
    return 'bg-danger'
  } else if (percent < 85) {
    return 'bg-warning'
  } else {
    return 'bg-info'
  }
}

function adaptBars4Bucket(
  income: number,
  expenses_necessary: number,
  expenses_optional: number,
  long_term: number,
  short_term: number,
): { label: string; labelRight: string; percent: number; color: string }[] {
  const total = income
  const limit50 = total * 0.5
  const limit30 = total * 0.3
  const limit10 = total * 0.1

  let necessaryPercent = (expenses_necessary / limit50) * 100
  let optionalPercent = (expenses_optional / limit30) * 100
  let shortPercent = (short_term / limit10) * 100
  let longPercent = (long_term / limit10) * 100

  necessaryPercent = Math.min(necessaryPercent, 100)
  optionalPercent = Math.min(optionalPercent, 100)
  shortPercent = Math.min(shortPercent, 100)
  longPercent = Math.min(longPercent, 100)

  return [
    {
      label: 'Necessary',
      labelRight: `${expenses_necessary}/${limit50}`,
      percent: necessaryPercent,
      color: getColorByPercentage(necessaryPercent),
    },
    {
      label: 'Optional',
      labelRight: `${expenses_optional}/${limit30}`,
      percent: optionalPercent,
      color: getColorByPercentage(optionalPercent),
    },
    {
      label: 'Short-term investments',
      labelRight: `${short_term}/${limit10}`,
      percent: shortPercent,
      color: getColorByPercentage(shortPercent),
    },
    {
      label: 'Long-term investments',
      labelRight: `${long_term}/${limit10}`,
      percent: longPercent,
      color: getColorByPercentage(longPercent),
    },
  ]
}

function adaptBars70Rule(
  income: number,
  expenses_necessary: number,
  expenses_optional: number,
): { label: string; labelRight: string; percent: number; color: string }[] {
  const total = income
  const expenses = expenses_necessary + expenses_optional
  const limit70 = total * 0.7
  const limit30 = total * 0.3

  let spentPercent = (expenses / limit70) * 100
  let savePercent = ((income - expenses) / limit30) * 100

  spentPercent = Math.min(spentPercent, 100)
  savePercent = Math.min(savePercent, 100)

  return [
    {
      label: 'Spent',
      labelRight: `${expenses}/${Math.floor(limit70)}`,
      percent: spentPercent,
      color: getColorByPercentage(spentPercent),
    },
    {
      label: 'Save',
      labelRight: `${income - expenses}/${Math.floor(limit30)}`,
      percent: savePercent,
      color: getColorByPercentageOpposite(savePercent),
    },
  ]
}

function adaptBars50Rule(
  income: number,
  expenses_necessary: number,
  expenses_optional: number,
  long_term: number,
  short_term: number,
): { label: string; labelRight: string; percent: number; color: string }[] {
  const total = income
  const limit50 = total * 0.5
  const limit30 = total * 0.3
  const limit20 = total * 0.2

  let necessaryPercent = (expenses_necessary / limit50) * 100
  let optionalPercent = (expenses_optional / limit30) * 100
  let savedPercent = ((long_term + short_term) / limit20) * 100

  necessaryPercent = Math.min(necessaryPercent, 100)
  optionalPercent = Math.min(optionalPercent, 100)
  savedPercent = Math.min(savedPercent, 100)

  return [
    {
      label: 'Necessary',
      labelRight: `${expenses_necessary}/${Math.floor(limit50)}`,
      percent: necessaryPercent,
      color: getColorByPercentage(necessaryPercent),
    },
    {
      label: 'Optional',
      labelRight: `${expenses_optional}/${Math.floor(limit30)}`,
      percent: optionalPercent,
      color: getColorByPercentage(optionalPercent),
    },
    {
      label: 'Investment',
      labelRight: `${long_term + short_term}/${Math.floor(limit20)}`,
      percent: savedPercent,
      color: getColorByPercentage(savedPercent),
    },
  ]
}

function calculateCategoriesType(transactions: Transaction[]): {
  income: number
  expenses_necessary: number
  expenses_optional: number
  long_term: number
  short_term: number
} {
  let income = 0
  let expenses_necessary = 0
  let expenses_optional = 0
  let long_term = 0
  let short_term = 0

  const d = new Date()
  const month = d.getMonth()

  transactions.forEach((transaction) => {
    const dateTransa = new Date(transaction.date)
    const transactionMonth = dateTransa.getMonth()
    if (transactionMonth === month) {
      if (transaction.category.category_type === CategoryType.INCOME) {
        income += transaction.amount
      } else if (transaction.category.category_type === CategoryType.EXPENSE_NECESSARY) {
        expenses_necessary += transaction.amount
      } else if (transaction.category.category_type === CategoryType.EXPENSE_OPTIONAL) {
        expenses_optional += transaction.amount
      } else if (transaction.category.category_type === CategoryType.LONG_TERM) {
        long_term += transaction.amount
      } else if (transaction.category.category_type === CategoryType.SHORT_TERM) {
        short_term += transaction.amount
      }
    }
  })

  return { income, expenses_necessary, expenses_optional, long_term, short_term }
}

transactionsStore.fetch()
</script>
