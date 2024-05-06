import axios from 'axios'
import { defineStore } from 'pinia'
import { Transaction } from '../../pages/transactions/types'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [] as Transaction[],
    transactionsMonth: [] as Transaction[],
    loading: false,
  }),
  actions: {
    async fetch() {
      try {
        this.loading = true

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/`)
        this.transactions = response.data

        /*const dateStart = startOfYear(new Date())
        const dateEnd = addDays(new Date(), 1)
        this.transactions = await this.fetchByDateRange(dateStart, dateEnd) //I take only the one until today
        */
        this.fetchByMonth(new Date().getMonth() + 1)

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
    async fetchByDateRange(startDate: Date, endDate: Date) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/date/range`, {
          params: {
            startDate,
            endDate,
          },
        })
        return response.data
      } catch (error) {
        console.error('Error fetching transactions by date range:', error)
      }
    },
    async fetchByStartDate(startDate: Date) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/date/start`, {
          params: {
            startDate,
          },
        })
        this.transactions = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching transactions by start date:', error)
      }
    },
    async fetchByEndDate(endDate: Date) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/date/end`, {
          params: {
            endDate,
          },
        })
        return response.data
      } catch (error) {
        console.error('Error fetching transactions by end date:', error)
      }
    },
    async fetchByYear(year: number) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/year/${year}`)
        return response.data
      } catch (error) {
        console.error('Error fetching transactions with relations by year:', error)
      }
    },
    async fetchByMonth(month: number) {
      try {
        //console.log('Carico TRANSACTIONMonth')
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/month/${month}`)
        this.transactionsMonth = response.data
      } catch (error) {
        console.error('Error fetching transactions with relations by month:', error)
      }
    },
  },
})
