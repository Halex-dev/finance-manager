import { computed } from 'vue'
import { Transaction } from './../../pages/transactions/types'
import { useTransactionsStore } from './../../stores/api/transactions'
import { walletsStore } from './wallets'

export const transactionsStore = useTransactionsStore()
await transactionsStore.fetch()

export const transactions = computed(() => transactionsStore.transactions)

export type Pagination = {
  page: number
  perPage: number
  total: number
}

enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export type Sorting = {
  sortBy: keyof Transaction | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  category_type: CategoryType | 'all'
  search: string
}

export const getTransactions = async (filters: Partial<Filters & Pagination & Sorting>) => {
  // Simulate delay (optional)
  // await sleep(1000)

  // Destructure filters
  const { category_type, search, sortBy, sortingOrder } = filters

  // Get initial list of transactions
  let filteredTransactions = transactions.value

  // Filter transactions by category type
  filteredTransactions = filteredTransactions.filter((transaction) => {
    if (category_type === 'all') {
      // Return true if category type is 'all', indicating no filtering required
      return true
    } else {
      // Otherwise, filter transactions based on category type
      return transaction.category.category_type === category_type
    }
  })

  // If no filtered transactions, return empty data and pagination details
  if (!filteredTransactions) return { data: [], pagination: { page: 1, perPage: 10, total: 0 } }

  // Filter transactions by search query (if provided)
  if (search) {
    filteredTransactions = filteredTransactions.filter((transactions) =>
      transactions.description.toLowerCase().includes(search.toLowerCase()),
    )
  }

  // Sort transactions (if sortBy and sortingOrder provided)
  if (sortBy && sortingOrder) {
    filteredTransactions = filteredTransactions.sort((a, b) => {
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
