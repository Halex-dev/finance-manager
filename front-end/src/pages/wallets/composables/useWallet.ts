import { Ref, ref, unref, watch } from 'vue'
import {
  getWallets,
  addWallet,
  updateWallet,
  deleteWallet,
  type Filters,
  Pagination,
  Sorting,
} from '../../../data/api/wallets'
import { Wallet } from '../types'
import { watchIgnorable } from '@vueuse/core'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'id', sortingOrder: 'asc' })
const makeFiltersRef = () => ref<Partial<Filters>>({ search: '' })

export const useWallet = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const wallets = ref<Wallet[]>([])

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    const { data, pagination: newPagination } = await getWallets({
      ...unref(filters),
      ...unref(sorting),
      ...unref(pagination),
    })
    wallets.value = data

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

    wallets,

    fetch,

    async add(wallet: Wallet) {
      isLoading.value = true
      const response = await addWallet(wallet)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },

    async update(wallet: Wallet) {
      isLoading.value = true
      const response = await updateWallet(wallet)

      if (response) {
        isLoading.value = false
        return response
      }
      await fetch()
      isLoading.value = false
    },

    async remove(wallet: Wallet) {
      isLoading.value = true
      const response = await deleteWallet(wallet)

      if (response) {
        isLoading.value = false
        return response
      }

      await fetch()
      isLoading.value = false
    },
  }
}
