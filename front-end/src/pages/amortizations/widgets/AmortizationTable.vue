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
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

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
  { label: t('amortizations.description'), key: 'description', sortable: true },
  { label: t('amortizations.startDate'), key: 'startDate', sortable: true },
  { label: t('amortizations.initialAmount'), key: 'initialAmount', sortable: true },
  { label: t('amortizations.durationMonths'), key: 'durationMonths', sortable: true },
  { label: t('amortizations.residualValue'), key: 'residualValue', sortable: true },
  { label: t('amortizations.nextAmount'), key: 'nextAmount', sortable: true },
  { label: t('amortizations.nextDate'), key: 'nextDate', sortable: true },
  { label: t('wallets.wallet'), key: 'wallet', sortable: true },
  { label: t('categories.category'), key: 'category', sortable: true },
  { label: t('amortizations.finishDate'), key: 'finishDate', sortable: true },
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
    title: `${t('modal_delete.title')} ${t('amortizations.amortization')}`,
    message: `${t('modal_delete.message')} ${amortization.description}?`,
    okText: `${t('button.delete')}`,
    cancelText: `${t('button.cancel')}`,
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
    <template #cell(category)="{ rowData }">
      {{ rowData.category.name }}
    </template>
    <template #cell(nextAmount)="{ rowData }">
      {{ formatMoney(rowData.initialAmount / rowData.durationMonths) }}
    </template>
    <template #cell(nextDate)="{ rowData }">
      {{
        rowData.residualValue <= 0
          ? '-'
          : formatDate(addMonths(rowData.startDate, rowData.transactions.length).toString())
      }}
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
    <template #cell(finishDate)="{ rowData }">
      {{ formatDate(addMonths(rowData.startDate, rowData.durationMonths).toString()) }}
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
      <b>{{ $props.pagination.total }} {{ t('table.results') }}</b>
      {{ t('table.result_page') }}
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
