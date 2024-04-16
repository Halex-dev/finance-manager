<script setup lang="ts">
import { PropType } from 'vue'
import { Wallet } from '../types'

const avatarColor = (userName: string) => {
  const colors = ['primary', '#FFD43A', '#ADFF00', '#262824', 'danger']
  const index = userName.charCodeAt(0) % colors.length
  return colors[index]
}

defineProps({
  wallet: {
    type: Object as PropType<Partial<Wallet>>,
    required: true,
  },
  size: {
    type: String,
    default: 'medium',
  },
})

const isUrl = (avatar: string) => {
  return avatar.startsWith('http') || avatar.startsWith('blob:')
}
</script>

<template>
  <VaAvatar
    :size="size"
    :src="isUrl(wallet.avatar ?? '') ? wallet.avatar : ''"
    :fallback-text="wallet.avatar"
    :color="avatarColor(wallet.name ?? '')"
  />
</template>
