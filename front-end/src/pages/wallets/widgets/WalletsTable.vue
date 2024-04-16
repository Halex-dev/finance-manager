<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Wallet } from '../types'
import WalletAvatar from './WalletAvatar.vue'
import { PropType, computed, toRef } from 'vue'
import { Pagination, Sorting } from '../../../data/api/wallets'
import { useVModel } from '@vueuse/core'

import { format } from 'date-fns'

//TODO modificare dipende alla lingua
const formatDate = (value: string) => {
  const date = Date.parse(value)
  if (!isNaN(date)) {
    return format(new Date(date), 'dd/MM/yyyy')
  } else {
    return 'Invalid Date'
  }
}

const columns = defineVaDataTableColumns([
  { label: 'id', key: 'id', sortable: true },
  { label: 'Name', key: 'name', sortable: true },
  { label: 'Currency', key: 'currency', sortable: true },
  { label: 'Date', key: 'date', sortable: true },
  { label: ' ', key: 'actions', align: 'right' },
])

const props = defineProps({
  wallets: {
    type: Array as PropType<Wallet[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-wallet', wallet: Wallet): void
  (event: 'delete-wallet', wallet: Wallet): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>()

const wallets = toRef(props, 'wallets')
const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()

const onWalletDelete = async (wallet: Wallet) => {
  const agreed = await confirm({
    title: 'Delete wallet',
    message: `Are you sure you want to delete ${wallet.name}?`,
    okText: 'Delete',
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-wallet', wallet)
  }
}
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="wallets"
    :loading="$props.loading"
  >
    <template #cell(name)="{ rowData }">
      <div class="flex items-center gap-2 max-w-[230px] ellipsis">
        <WalletAvatar :wallet="rowData as Wallet" size="small" />
        {{ rowData.name }}
      </div>
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
          aria-label="Edit wallet"
          @click="$emit('edit-wallet', rowData as Wallet)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Delete wallet"
          @click="onWalletDelete(rowData as Wallet)"
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
