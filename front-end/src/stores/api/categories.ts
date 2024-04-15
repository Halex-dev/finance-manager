import axios from 'axios'
import { defineStore } from 'pinia'
import { Category } from '../../pages/categories/types'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    loading: false,
  }),
  actions: {
    async fetch() {
      try {
        this.loading = true

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories/`)
        this.categories = response.data

        this.loading = false
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    },
    async addCategory(Category: any) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/categories/`, Category)
        this.categories.push(response.data)
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
    async updateCategory(updateCategory: any) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/categories/${updateCategory.id}`, updateCategory)

        const index = this.categories.findIndex((category) => category.id === updateCategory.id)
        if (index !== -1) {
          this.categories.splice(index, 1, updateCategory)
        }
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
    async deleteCategory(id: number) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`)

        this.categories = this.categories.filter((category) => category.id !== id)
      } catch (error: any) {
        if (error.response.data.message) return error.response.data.message
        else return 'Server error, contact administrator'
      }
    },
  },
})
