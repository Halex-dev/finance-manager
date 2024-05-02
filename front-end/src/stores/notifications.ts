import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => {
    return {
      notifications: {
        job: {
          name: 'Searching for a job',
          isEnabled: localStorage.getItem('job'),
        },
        hiring: {
          name: 'Hiring someone',
          isEnabled: localStorage.getItem('hiring'),
        }
      },
    }
  },
})
