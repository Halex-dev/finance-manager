import axios from 'axios'
import { defineStore } from 'pinia'

export enum NotificationState {
  ERROR_MONEY = 'error_money',
}

export interface Notification {
  id: number
  icon: string
  message: string
  code: NotificationState
  date: Date
  separator?: boolean
  type?: string
  read: boolean
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
  }),
  actions: {
    async fetch() {
      try {
        this.loading = true

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications/`)
        this.notifications = response.data

        this.loading = false
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    },
    async delete(id: number) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/notifications/${id}`)

        this.loading = true
        this.notifications = this.notifications.filter((notification) => notification.id !== id)
        this.loading = false
      } catch (error) {
        console.error('Error deleting notification:', error)
      }
    },
  },
})
