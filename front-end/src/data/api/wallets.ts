import { computed } from 'vue'
import { Wallet } from './../../pages/wallets/types'
import { useWalletsStore } from './../../stores/api/wallet'

export const walletsStore = useWalletsStore()
await walletsStore.fetch()

export const wallets = computed(() => walletsStore.Allwallets)

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof Wallet | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  search: string
}

export const getWallets = async (filters: Partial<Filters & Pagination & Sorting>) => {
  //await sleep(1000)
  const { search, sortBy, sortingOrder } = filters
  let filteredWallets = wallets.value

  if (!filteredWallets) return { data: [], pagination: { page: 1, perPage: 10, total: 0 } }

  if (search) {
    filteredWallets = filteredWallets.filter((wallets) => wallets.name.toLowerCase().includes(search.toLowerCase()))
  }

  if (sortBy && sortingOrder) {
    filteredWallets = filteredWallets.sort((a, b) => {
      const first = a.date
      const second = b.date
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
    data: filteredWallets.slice((page - 1) * perPage, page * perPage),
    pagination: {
      page,
      perPage,
      total: filteredWallets.length,
    },
  }
}

export const addWallet = async (wallet: Wallet) => {
  const response = await walletsStore.addWallet(wallet)

  if (response) return response
  await walletsStore.fetch()
}

export const updateWallet = async (wallet: Wallet) => {
  const response = await walletsStore.updateWallet(wallet)

  if (response) return response
  await walletsStore.fetch()
}

export const deleteWallet = async (wallet: Wallet) => {
  const response = await walletsStore.deleteWallet(wallet.id)

  if (response) return response
  await walletsStore.fetch()
}
