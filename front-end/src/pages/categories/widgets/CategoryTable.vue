<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Category } from '../types'
import { PropType, computed, toRef } from 'vue'
import { Pagination, Sorting } from '../../../data/api/categories'
import { useVModel } from '@vueuse/core'
import { format } from 'date-fns'
import { useI18n } from 'vue-i18n'
import { getCategoryOptions } from '../types'

const { t } = useI18n()

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
  { label: t('categories.name'), key: 'name', sortable: true },
  { label: t('categories.category_type'), key: 'category_type', sortable: true },
  { label: t('categories.color'), key: 'color', sortable: true },
  { label: t('categories.date'), key: 'date', sortable: true },
  { label: ' ', key: 'actions', align: 'right' },
])

const props = defineProps({
  categories: {
    type: Array as PropType<Category[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-category', category: Category): void
  (event: 'delete-category', category: Category): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>()

const categories = toRef(props, 'categories')
const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()

const onCategoryDelete = async (category: Category) => {
  const agreed = await confirm({
    title: `${t('modal_delete.title')} ${t('categories.category')}`,
    message: `${t('modal_delete.message')} ${category.name}?`,
    okText: `${t('button.delete')}`,
    cancelText: `${t('button.cancel')}`,
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-category', category)
  }
}
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="categories"
    :loading="$props.loading"
  >
    <template #cell(category_type)="{ rowData }">
      {{ getCategoryOptions(rowData.category_type) }}
    </template>
    <template #cell(color)="{ rowData }">
      <div class="flex items-center">
        <div
          class="p-1 rounded mr-3"
          :style="{
            backgroundColor: rowData.color,
            color: '\#ffffff',
          }"
        >
          <slot name="icon"></slot>
        </div>
        <p class="text-sm">{{ rowData.color }}</p>
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
          aria-label="Edit category"
          @click="$emit('edit-category', rowData as Category)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Delete category"
          @click="onCategoryDelete(rowData as Category)"
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
