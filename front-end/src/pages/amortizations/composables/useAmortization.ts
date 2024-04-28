import { Ref, ref, unref, watch } from 'vue'
import {
  getAmortizations,
  addAmortization,
  updateAmortization,
  deleteAmortization,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/api/amortizations'
import { Amortization } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'date', sortingOrder: 'desc' })
const makeFiltersRef = () =>
  ref<Partial<Filters>>({
    type: 'all',
    search: '',
  })

export const useAmortization = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const amortizations = ref<Amortization[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await getAmortizations({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    amortizations.value = data

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

    amortizations,

    fetch,

    async add(Amortization: Amortization) {
      isLoading.value = true
      const response = await addAmortization(Amortization)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },

    async update(Amortization: Amortization) {
      isLoading.value = true
      const response = await updateAmortization(Amortization)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },

    async remove(Amortization: Amortization) {
      isLoading.value = true
      const response = await deleteAmortization(Amortization)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },
  }
}
