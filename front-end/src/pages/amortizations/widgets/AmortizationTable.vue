<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Amortization } from '../types'
import { PropType, computed, toRef } from 'vue'
import { Pagination, Sorting } from '../../../data/api/amortizations'
import { useVModel } from '@vueuse/core'
import { format } from 'date-fns'
import { formatMoney } from '../../../data/charts/revenueChartData'
import { Wallet } from '../../wallets/types'
import WalletAvatar from '../../wallets/widgets/WalletAvatar.vue'
import { addMonths } from 'date-fns'

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
  { label: 'Description', key: 'description', sortable: true },
  { label: 'Start Date', key: 'startDate', sortable: true },
  { label: 'Amount', key: 'initialAmount', sortable: true },
  { label: 'Duration', key: 'durationMonths', sortable: true },
  { label: 'Residual', key: 'residualValue', sortable: true },
  { label: 'Next Amount', key: 'nextAmount', sortable: true },
  { label: 'Next Date', key: 'nextDate', sortable: true },
  { label: 'Wallet', key: 'wallet', sortable: true },
  { label: 'Finish Date', key: 'finishDate', sortable: true },
  { label: ' ', key: 'actions', align: 'right' },
])

const props = defineProps({
  amortizations: {
    type: Array as PropType<Amortization[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-amortization', amortization: Amortization): void
  (event: 'delete-amortization', amortization: Amortization): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>()

const amortizations = toRef(props, 'amortizations')
const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()

const onAmortizationDelete = async (amortization: Amortization) => {
  const agreed = await confirm({
    title: 'Delete amortization',
    message: `Are you sure you want to delete ${amortization.id}?`,
    okText: 'Delete',
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-amortization', amortization)
  }
}
</script>
<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="amortizations"
    :loading="$props.loading"
  >
    <template #cell(wallet)="{ rowData }">
      <div class="flex items-center gap-2 max-w-[230px] ellipsis">
        <WalletAvatar :wallet="rowData.wallet as Wallet" size="small" />
        {{ rowData.wallet.name }}
      </div>
    </template>
    <template #cell(nextAmount)="{ rowData }">
      {{ formatMoney(rowData.initialAmount / rowData.durationMonths) }}
    </template>
    <template #cell(nextDate)="{ rowData }">
      {{ formatDate(addMonths(rowData.startDate, rowData.transactions.length).toString()) }}
    </template>
    <template #cell(initialAmount)="{ rowData }">
      {{ formatMoney(rowData.initialAmount) }}
    </template>
    <template #cell(residualValue)="{ rowData }">
      {{ formatMoney(rowData.residualValue) }}
    </template>
    <template #cell(startDate)="{ rowData }">
      {{ formatDate(rowData.startDate.toString()) }}
    </template>
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          aria-label="Edit amortization"
          @click="$emit('edit-amortization', rowData as Amortization)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Delete amortization"
          @click="onAmortizationDelete(rowData as Amortization)"
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
