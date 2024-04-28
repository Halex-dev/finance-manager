import { computed } from 'vue'
import { Amortization } from './../../pages/amortizations/types'
import { useAmortizationsStore } from './../../stores/api/amortizations'
import { walletsStore } from './wallets'
import { endOfDay } from 'date-fns'

export const amortizationsStore = useAmortizationsStore()

export const amortizations = computed(() => amortizationsStore.amortizations)

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Amortization | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  type: 'active' | 'finished' | 'future' | 'all'
  search: string
}

const getSortItem = (obj: any, sortBy: string) => {
  return obj[sortBy]
}

export const getAmortizations = async (filters: Partial<Filters & Pagination & Sorting>) => {
  await amortizationsStore.fetch()
  // Destructure filters
  const { type, search, sortBy, sortingOrder } = filters
  let filteredAmortizations = amortizations.value
  const today = endOfDay(new Date())

  // Filter transactions by category type
  filteredAmortizations = filteredAmortizations.filter((amortization) => {
    const startDate = new Date(amortization.startDate)
    if (type === 'all') {
      // Return true if category type is 'all', indicating no filtering required
      return true
    } else if (type === 'active') {
      return startDate.getTime() < today.getTime() && amortization.residualValue > 0
    } else if (type === 'finished') {
      return amortization.residualValue === 0
    } else if (type === 'future') {
      return startDate.getTime() > today.getTime() && amortization.residualValue > 0
    }
  })

  // Filter amortizations by search query (if provided)
  if (search) {
    filteredAmortizations = filteredAmortizations.filter((amortizations: { description: string }) =>
      amortizations.description.toLowerCase().includes(search.toLowerCase()),
    )
  }

  // Sort amortizations (if sortBy and sortingOrder provided)
  if (sortBy && sortingOrder) {
    filteredAmortizations = filteredAmortizations.sort((a, b) => {
      const first = getSortItem(a, sortBy)
      const second = getSortItem(b, sortBy)
      if (first > second) {
        return sortingOrder === 'asc' ? 1 : -1
      }
      if (first < second) {
        return sortingOrder === 'asc' ? -1 : 1
      }
      return 0
    })
  }

  // Pagination
  const { page = 1, perPage = 10 } = filters || {}
  return {
    // Paginate filtered amortizations data
    data: filteredAmortizations.slice((page - 1) * perPage, page * perPage),
    // Pagination details
    pagination: {
      page,
      perPage,
      total: filteredAmortizations.length,
    },
  }
}

export const addAmortization = async (amortization: Amortization) => {
  const response = await amortizationsStore.addAmortization(amortization)

  if (response) return response
  await amortizationsStore.fetch()
  await walletsStore.fetch()
}

export const updateAmortization = async (amortization: Amortization) => {
  const response = await amortizationsStore.updateAmortization(amortization)

  if (response) return response
  await amortizationsStore.fetch()
  await walletsStore.fetch()
}

export const deleteAmortization = async (amortization: Amortization) => {
  const response = await amortizationsStore.deleteAmortization(amortization.id)

  if (response) return response
  await amortizationsStore.fetch()
  await walletsStore.fetch()
}
