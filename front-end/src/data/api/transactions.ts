import { computed } from 'vue'
import { Transaction } from './../../pages/transactions/types'
import { useTransactionsStore } from './../../stores/api/transactions'
import { walletsStore } from './wallets'
import { CategoryType } from '../../pages/categories/types'

export const transactionsStore = useTransactionsStore()

export const transactions = computed(() => transactionsStore.transactions)

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Transaction | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  category_type: 'income' | 'expense' | 'all'
  search: string
  dateStart: Date
  dateEnd: Date
}

const getSortItem = (obj: any, sortBy: string) => {
  return obj[sortBy]
}


export const getTransactions = async (filters: Partial<Filters & Pagination & Sorting>) => {
  await transactionsStore.fetch()
  // Destructure filters
  const { category_type, search, dateStart, dateEnd, sortBy, sortingOrder } = filters
  let filteredTransactions = []
  // Get initial list of transactions
  if (dateStart && dateEnd) {
    filteredTransactions = await transactionsStore.fetchByDateRange(dateStart, dateEnd)
  } else if (dateEnd) {
    filteredTransactions = await transactionsStore.fetchByEndDate(dateEnd)
  } else if (dateStart) {
    filteredTransactions = await transactionsStore.fetchByStartDate(dateStart)
  } else {
    filteredTransactions = transactions.value
  }

  // Filter transactions by category type
  filteredTransactions = filteredTransactions.filter(
    (transaction: { category: { category_type: string | undefined } }) => {
      if (category_type === 'all') {
        // Return true if category type is 'all', indicating no filtering required
        return true
      }
      if (category_type === 'expense') {
        return transaction.category.category_type !== CategoryType.INCOME
      } else {
        // Otherwise, filter transactions based on category type
        return transaction.category.category_type === category_type
      }
    },
  )

  // If no filtered transactions, return empty data and pagination details
  if (!filteredTransactions) return { data: [], pagination: { page: 1, perPage: 10, total: 0 } }

  // Filter transactions by search query (if provided)
  if (search) {
    filteredTransactions = filteredTransactions.filter((transactions: { description: string }) =>
      transactions.description.toLowerCase().includes(search.toLowerCase()),
    )
  }

  // Sort transactions (if sortBy and sortingOrder provided)
  if (sortBy && sortingOrder) {
    filteredTransactions = filteredTransactions.sort((a: { date: Date }, b: { date: Date }) => {
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
    // Paginate filtered transactions data
    data: filteredTransactions.slice((page - 1) * perPage, page * perPage),
    // Pagination details
    pagination: {
      page,
      perPage,
      total: filteredTransactions.length,
    },
  }
}

export const addTransaction = async (transaction: Transaction) => {
  const response = await transactionsStore.addTransaction(transaction)

  if (response) return response
  await transactionsStore.fetch()
  await walletsStore.fetch()
}

export const updateTransaction = async (transaction: Transaction) => {
  const response = await transactionsStore.updateTransaction(transaction)

  if (response) return response
  await transactionsStore.fetch()
  await walletsStore.fetch()
}

export const deleteTransaction = async (transaction: Transaction) => {
  const response = await transactionsStore.deleteTransaction(transaction.id)

  if (response) return response
  await transactionsStore.fetch()
  await walletsStore.fetch()
}
