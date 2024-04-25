import { Ref, ref, unref, watch } from 'vue'
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/api/transactions'
import { Transaction } from '../types'
import { watchIgnorable } from '@vueuse/core'
import { startOfYear, endOfYear } from 'date-fns';

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'date', sortingOrder: 'desc' })
const makeFiltersRef = () =>
  ref<Partial<Filters>>({
    category_type: 'all',
    search: '',
    dateStart: startOfYear(new Date()),
    dateEnd: endOfYear(new Date()),
  })

export const useTransaction = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const transactions = ref<Transaction[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await getTransactions({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    transactions.value = data

    ignoreUpdates(() => {
      pagination.value = newPagination
    })

    isLoading.value = false
  }

  const { ignoreUpdates } = watchIgnorable([pagination, sorting], fetch, { deep: true })

  watch(
    filters,
    () => {
      // Reset pagination to first page when filters changed
      pagination.value.page = 1
      fetch()
    },
    { deep: true },
  )

  fetch()

  return {
    isLoading,

    filters,
    sorting,
    pagination,

    transactions,

    fetch,

    async add(Transaction: Transaction) {
      isLoading.value = true
      const response = await addTransaction(Transaction)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },

    async update(Transaction: Transaction) {
      isLoading.value = true
      const response = await updateTransaction(Transaction)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },

    async remove(Transaction: Transaction) {
      isLoading.value = true
      const response = await deleteTransaction(Transaction)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },
  }
}
