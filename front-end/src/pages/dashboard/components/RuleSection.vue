<template>
  <template v-if="loading">
    <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3">
      <VaSkeleton variant="squared" height="12rem" />
    </div>
  </template>
  <template v-else>
    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-3">
      <VaCard class="money-rule-card">
        <VaCardContent>
          <section>
            <header class="flex items-center justify-between">
              <p class="text-lg font-bold mb-2">{{ title }} {{ t('dashboard.rule.title') }}</p>
              <VaSelect v-model="selectedRule" preset="small" :options="ruleChoosen" class="w-28" />
            </header>
            <div>
              <div v-for="(bar, index) in barChoosen" :key="index" class="mb-2">
                <p class="text-sm font-semibold">{{ bar.label }}</p>
                <div class="flex items-center">
                  <div class="w-full bg-gray-300 h-3 rounded-md mr-2">
                    <div class="h-full rounded-md" :style="{ width: bar.percent + '%' }" :class="[bar.color]"></div>
                  </div>
                </div>
                <p class="text-xs text-gray-600">{{ bar.labelRight }}</p>
              </div>
            </div>
          </section>
        </VaCardContent>
      </VaCard>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'

import { useTransactionsStore } from '../../../stores/api/transactions'
import { Transaction } from '../../transactions/types'
import { CategoryType } from '../../categories/types'

import { formatMoney } from '../../../data/charts/revenueChartData'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const transactionsStore = useTransactionsStore()
const loading = computed(() => transactionsStore.loading)
const transactionsMonth = computed(() => transactionsStore.transactionsMonth)

type RuleType = {
  label: string
  labelRight: string
  percent: number
  color?: string
}[]

const ruleChoosen: string[] = ['50/30/20', '4 Bucket', '70/30']
const selectedRule = ref(ruleChoosen[0])
const title = ref(ruleChoosen[0])

watch([selectedRule], async ([selectedRule]) => {
  title.value = selectedRule

  if (selectedRule === '50/30/20') barChoosen.value = bar50Rule.value
  else if (selectedRule === '4 Bucket') barChoosen.value = bar4Bucket.value
  else if (selectedRule === '70/30') barChoosen.value = bar70Rule.value
})

const barChoosen = ref<RuleType>([])

const bar50Rule = ref<RuleType>([])
const bar4Bucket = ref<RuleType>([])
const bar70Rule = ref<RuleType>([])

onMounted(async () => {
  if (transactionsMonth.value.length === 0) {
    await transactionsStore.fetchByMonth(new Date().getMonth() + 1)
  }

  const { income, expenses_necessary, expenses_optional, long_term, short_term } = await calculateCategoriesType(
    transactionsMonth.value,
  )

  bar50Rule.value = await adaptBars50Rule(income, expenses_necessary, expenses_optional, long_term, short_term)
  barChoosen.value = bar50Rule.value
  bar4Bucket.value = await adaptBars4Bucket(income, expenses_necessary, expenses_optional, long_term, short_term)
  bar70Rule.value = await adaptBars70Rule(income, expenses_necessary, expenses_optional)
})

watch([transactionsMonth], async ([transactionsMonth]) => {
  const { income, expenses_necessary, expenses_optional, long_term, short_term } =
    await calculateCategoriesType(transactionsMonth)

  bar50Rule.value = await adaptBars50Rule(income, expenses_necessary, expenses_optional, long_term, short_term)
  bar4Bucket.value = await adaptBars4Bucket(income, expenses_necessary, expenses_optional, long_term, short_term)
  bar70Rule.value = await adaptBars70Rule(income, expenses_necessary, expenses_optional)
})

async function getColorByPercentage(percent: number) {
  if (Number.isNaN(percent)) return 'bg-info'

  if (percent < 50) {
    return 'bg-info'
  } else if (percent < 85) {
    return 'bg-warning'
  } else {
    return 'bg-danger'
  }
}

async function getColorByPercentageOpposite(percent: number) {
  if (percent < 50) {
    return 'bg-danger'
  } else if (percent < 85) {
    return 'bg-warning'
  } else {
    return 'bg-info'
  }
}

async function adaptBars4Bucket(
  income: number,
  expenses_necessary: number,
  expenses_optional: number,
  long_term: number,
  short_term: number,
): Promise<{ label: string; labelRight: string; percent: number; color: string }[]> {
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
      label: t('dashboard.rule.necessary'),
      labelRight: `${formatMoney(expenses_necessary)}/${formatMoney(limit50)}`,
      percent: necessaryPercent,
      color: await getColorByPercentage(necessaryPercent),
    },
    {
      label: t('dashboard.rule.optional'),
      labelRight: `${formatMoney(expenses_optional)}/${formatMoney(limit30)}`,
      percent: optionalPercent,
      color: await getColorByPercentage(optionalPercent),
    },
    {
      label: t('dashboard.rule.short'),
      labelRight: `${formatMoney(short_term)}/${formatMoney(limit10)}`,
      percent: shortPercent,
      color: await getColorByPercentage(shortPercent),
    },
    {
      label: t('dashboard.rule.long'),
      labelRight: `${formatMoney(long_term)}/${formatMoney(limit10)}`,
      percent: longPercent,
      color: await getColorByPercentage(longPercent),
    },
  ]
}

async function adaptBars70Rule(
  income: number,
  expenses_necessary: number,
  expenses_optional: number,
): Promise<{ label: string; labelRight: string; percent: number; color: string }[]> {
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
      label: t('dashboard.rule.spent'),
      labelRight: `${formatMoney(expenses)}/${formatMoney(limit70)}`,
      percent: spentPercent,
      color: await getColorByPercentage(spentPercent),
    },
    {
      label: t('dashboard.rule.save'),
      labelRight: `${formatMoney(income - expenses)}/${formatMoney(limit30)}`,
      percent: savePercent,
      color: await getColorByPercentageOpposite(savePercent),
    },
  ]
}

async function adaptBars50Rule(
  income: number,
  expenses_necessary: number,
  expenses_optional: number,
  long_term: number,
  short_term: number,
): Promise<{ label: string; labelRight: string; percent: number; color: string }[]> {
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
      label: t('dashboard.rule.necessary'),
      labelRight: `${formatMoney(expenses_necessary)}/${formatMoney(limit50)}`,
      percent: necessaryPercent,
      color: await getColorByPercentage(necessaryPercent),
    },
    {
      label: t('dashboard.rule.optional'),
      labelRight: `${formatMoney(expenses_optional)}/${formatMoney(limit30)}`,
      percent: optionalPercent,
      color: await getColorByPercentage(optionalPercent),
    },
    {
      label: t('dashboard.rule.investment'),
      labelRight: `${formatMoney(long_term + short_term)}/${formatMoney(limit20)}`,
      percent: savedPercent,
      color: await getColorByPercentage(savedPercent),
    },
  ]
}

async function calculateCategoriesType(transactions: Transaction[]): Promise<{
  income: number
  expenses_necessary: number
  expenses_optional: number
  long_term: number
  short_term: number
}> {
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
</script>

<style scoped>
.money-rule-card .bar-label-right {
  font-size: 10px; /* Imposta la dimensione del testo a 10px */
  margin-top: 4px; /* Aggiungi spazio superiore per separare il testo dalla barra */
}
</style>
