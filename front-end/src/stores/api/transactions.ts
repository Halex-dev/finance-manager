import axios from 'axios'
import { defineStore } from 'pinia'
import { Transaction } from '../../pages/transactions/types'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[],
    loading: false,
  }),
  actions: {
    async fetch() {
      try {
        this.loading = true

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/`)
        this.transactions = response.data

        this.loading = false
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
    },
    async addTransaction(Transaction: any) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/transactions/`, Transaction)
        this.transactions.push(response.data)
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
    async updateTransaction(updateTransaction: any) {
      try {
        await axios.patch(`${import.meta.env.VITE_API_URL}/transactions/${updateTransaction.id}`, updateTransaction)

        const index = this.transactions.findIndex((transaction) => transaction.id === updateTransaction.id)
        if (index !== -1) {
          this.transactions.splice(index, 1, updateTransaction)
        }
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
    async deleteTransaction(id: number) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/transactions/${id}`)

        this.transactions = this.transactions.filter((transaction) => transaction.id !== id)
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
  },
})
