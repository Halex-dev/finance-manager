import { computed } from 'vue'
import { Category } from './../../pages/categories/types'
import { useCategoriesStore } from './../../stores/api/categories'

export const categoriesStore = useCategoriesStore()
export const categories = computed(() => categoriesStore.categories)

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Category | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  search: string
}

export const getCategories = async (filters: Partial<Filters & Pagination & Sorting>) => {
  await categoriesStore.fetch()
  const { search, sortBy, sortingOrder } = filters
  let filteredCategories = categories.value

  if (!filteredCategories) return { data: [], pagination: { page: 1, perPage: 10, total: 0 } }

  if (search) {
    filteredCategories = filteredCategories.filter((categories) =>
      categories.name.toLowerCase().includes(search.toLowerCase()),
    )
  }

  if (sortBy && sortingOrder) {
    filteredCategories = filteredCategories.sort((a, b) => {
      const first = a.id
      const second = b.id
      if (first > second) {
        return sortingOrder === 'asc' ? 1 : -1
      }
      if (first < second) {
        return sortingOrder === 'asc' ? -1 : 1
      }
      return 0
    })
  }

  const { page = 1, perPage = 10 } = filters || {}
  return {
    data: filteredCategories.slice((page - 1) * perPage, page * perPage),
    pagination: {
      page,
      perPage,
      total: filteredCategories.length,
    },
  }
}

export const addCategory = async (category: Category) => {
  const response = await categoriesStore.addCategory(category)

  if (response) return response
}

export const updateCategory = async (category: Category) => {
  const response = await categoriesStore.updateCategory(category)

  if (response) return response
}

export const deleteCategory = async (category: Category) => {
  const response = await categoriesStore.deleteCategory(category.id)

  if (response) return response
}
