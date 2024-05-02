import { Ref, ref, unref, watch } from 'vue'
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/api/categories'
import { Category } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'id', sortingOrder: 'asc' })
const makeFiltersRef = () => ref<Partial<Filters>>({ search: '', category_type: 'all' })

export const useCategory = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const categories = ref<Category[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await getCategories({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    categories.value = data

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

    categories,

    fetch,

    async add(category: Category) {
      isLoading.value = true
      const response = await addCategory(category)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },

    async update(category: Category) {
      isLoading.value = true
      const response = await updateCategory(category)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },

    async remove(category: Category) {
      isLoading.value = true
      const response = await deleteCategory(category)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },
  }
}
