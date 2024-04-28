import axios from 'axios'
import { defineStore } from 'pinia'
import { Amortization } from '../../pages/amortizations/types'

export const useAmortizationsStore = defineStore('amortizations', {
  state: () => ({
    amortizations: [] as Amortization[],
    loading: false,
  }),
  actions: {
    async fetch() {
      try {
        this.loading = true

        //console.log('Carico TRANSACTION')
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/amortizations/`)
        this.amortizations = response.data

        this.loading = false
      } catch (error) {
        console.error('Error fetching amortizations:', error)
      }
    },
    async addAmortization(Amortization: any) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/amortizations/`, Amortization)
        this.amortizations.push(response.data)
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
    async updateAmortization(updateAmortization: any) {
      try {
        await axios.patch(`${import.meta.env.VITE_API_URL}/amortizations/${updateAmortization.id}`, updateAmortization)

        const index = this.amortizations.findIndex((amortization) => amortization.id === updateAmortization.id)
        if (index !== -1) {
          this.amortizations.splice(index, 1, updateAmortization)
        }
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
    async deleteAmortization(id: number) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/amortizations/${id}`)

        this.amortizations = this.amortizations.filter((amortization) => amortization.id !== id)
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
    async fetchByDateRange(startDate: Date, endDate: Date) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/amortizations/date/range`, {
          params: {
            startDate,
            endDate,
          },
        })
        return response.data
      } catch (error) {
        console.error('Error fetching amortizations by date range:', error)
      }
    },
    async fetchByStartDate(startDate: Date) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/amortizations/date/start`, {
          params: {
            startDate,
          },
        })
        this.amortizations = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching amortizations by start date:', error)
      }
    },
    async fetchByEndDate(endDate: Date) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/amortizations/date/end`, {
          params: {
            endDate,
          },
        })
        return response.data
      } catch (error) {
        console.error('Error fetching amortizations by end date:', error)
      }
    },
    async fetchByYear(year: number) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/amortizations/year/${year}`)
        return response.data
      } catch (error) {
        console.error('Error fetching amortizations with relations by year:', error)
      }
    },
  },
})
