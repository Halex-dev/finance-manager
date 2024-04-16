import axios from 'axios'
import { defineStore } from 'pinia'

interface Wallet {
  id: number
  name: string
  currency: number
  date: Date
  avatar: string
}

export const useWalletsStore = defineStore('Wallets', {
  state: () => ({
    wallets: [] as Wallet[],
    loading: false,
  }),
  getters: {
    Allwallets: (state) => state.wallets,
  },
  actions: {
    async fetch() {
      try {
        this.loading = true

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/wallets/`)
        this.wallets = response.data

        this.loading = false
      } catch (error) {
        console.error('Error fetching wallets:', error)
      }
    },
    async addWallet(Wallet: any) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/wallets/`, Wallet)
        this.wallets.push(response.data)
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
    async updateWallet(updateWallet: Wallet) {
      try {
        await axios.patch(`${import.meta.env.VITE_API_URL}/wallets/${updateWallet.id}`, updateWallet)

        const index = this.wallets.findIndex((wallet) => wallet.id === updateWallet.id)
        if (index !== -1) {
          this.wallets.splice(index, 1, updateWallet)
        }
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
    async deleteWallet(id: number) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/wallets/${id}`)

        this.wallets = this.wallets.filter((wallet) => wallet.id !== id)
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
  },
})
