<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Transaction } from '../types'
import { PropType, computed, toRef } from 'vue'
import { Pagination, Sorting } from '../../../data/api/transactions'
import { useVModel } from '@vueuse/core'
import { format } from 'date-fns'
import { formatMoney } from '../../../data/charts/revenueChartData'
import { CategoryType } from '../../categories/types'

//TODO modificare dipende alla lingua
const formatDate = (value: string) => {
  const date = Date.parse(value)
  if (!isNaN(date)) {
    return format(new Date(date), 'dd/MM/yyyy') //format(new Date(date), 'dd/MM/yyyy HH:mm')
  } else {
    return 'Invalid Date'
  }
}

const columns = defineVaDataTableColumns([
  { label: 'id', key: 'id', sortable: true },
  { label: 'Amount', key: 'amount', sortable: true },
  { label: 'Description', key: 'description', sortable: true },
  { label: 'Wallet', key: 'wallet.name', sortable: true },
  { label: 'Category', key: 'category.name', sortable: true },
  { label: 'Date', key: 'date', sortable: true },
  { label: ' ', key: 'actions', align: 'right' },
])

const props = defineProps({
  transactions: {
    type: Array as PropType<Transaction[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-transaction', transaction: Transaction): void
  (event: 'delete-transaction', transaction: Transaction): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>()

const transactions = toRef(props, 'transactions')
const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()

const onTransactionDelete = async (transaction: Transaction) => {
  const agreed = await confirm({
    title: 'Delete transaction',
    message: `Are you sure you want to delete ${transaction.id}?`,
    okText: 'Delete',
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-transaction', transaction)
  }
}
</script>
//TODO segnare le spese in negativo
<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="transactions"
    :loading="$props.loading"
  >
    <template #cell(amount)="{ rowData }">
      {{
        rowData.category.category_type !== CategoryType.INCOME
          ? '- ' + formatMoney(rowData.amount)
          : formatMoney(rowData.amount)
      }}
    </template>
    <template #cell(date)="{ rowData }">
      {{ formatDate(rowData.date.toString()) }}
    </template>
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          aria-label="Edit transaction"
          @click="$emit('edit-transaction', rowData as Transaction)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Delete transaction"
          @click="onTransactionDelete(rowData as Transaction)"
        />
      </div>
    </template>
  </VaDataTable>

  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ $props.pagination.total }} results.</b>
      Results per page
      <VaSelect v-model="$props.pagination.perPage" class="!w-20" :options="[10, 50, 100]" />
    </div>

    <div v-if="totalPages > 1" class="flex">
      <VaButton
        preset="secondary"
        icon="va-arrow-left"
        aria-label="Previous page"
        :disabled="$props.pagination.page === 1"
        @click="$props.pagination.page--"
      />
      <VaButton
        class="mr-2"
        preset="secondary"
        icon="va-arrow-right"
        aria-label="Next page"
        :disabled="$props.pagination.page === totalPages"
        @click="$props.pagination.page++"
      />
      <VaPagination
        v-model="$props.pagination.page"
        buttons-preset="secondary"
        :pages="totalPages"
        :visible-pages="5"
        :boundary-links="false"
        :direction-links="false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>