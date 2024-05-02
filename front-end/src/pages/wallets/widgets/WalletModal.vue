<script setup lang="ts">
import { PropType, computed, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { Wallet } from '../types'
import WalletAvatar from './WalletAvatar.vue'
import { validators } from '../../../services/utils'
import { imageAPI } from '../../../stores/api/image'

const props = defineProps({
  wallet: {
    type: Object as PropType<Wallet | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewWallet: Partial<Wallet> = {
  avatar: '',
  name: '',
  currency: 0,
  date: new Date(),
}

const newWallet = ref<Partial<Wallet>>({ ...defaultNewWallet })

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newWallet.value).some((key) => {
    if (key === 'avatar') {
      return false
    }

    return newWallet.value[key as keyof Wallet] !== (props.wallet ?? defaultNewWallet)?.[key as keyof Wallet]
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

watch(
  () => props.wallet,
  () => {
    if (!props.wallet) {
      return
    }

    newWallet.value = {
      ...props.wallet,
      avatar: props.wallet.avatar || '',
    }
  },
  { immediate: true },
)

const avatar = ref<File>()

const makeAvatarBlobUrl = (avatar: File) => {
  return URL.createObjectURL(avatar)
}

watch(avatar, (newAvatar) => {
  newWallet.value.avatar = newAvatar ? makeAvatarBlobUrl(newAvatar) : ''
})

const form = useForm('add-wallet-form')

const emit = defineEmits(['close', 'save'])

const onSave = async () => {
  if (form.validate()) {
    try {
      if (!avatar.value) {
        emit('save', newWallet.value) //No imagine selected
        return
      }

      // Upload and get the URL of the uploaded image from the server
      const imageUrl = await imageAPI.uploadImage(avatar.value)
      // Update the avatar value in the wallet with the image URL
      newWallet.value.avatar = imageUrl

      // Emit the 'save' signal along with the data of the new wallet containing the image URL
      emit('save', newWallet.value)
    } catch (error) {
      console.error('Error while uploading the image:', error)
      // Error handling
    }
  }
}
</script>

<template>
  <VaForm
    v-slot="{ isValid }"
    ref="add-wallet-form"
    class="flex-col justify-start items-start gap-4 inline-flex w-full"
  >
    <VaFileUpload
      v-model="avatar"
      type="single"
      hide-file-list
      file-types="image/jpeg, image/png, image/jpg"
      class="self-stretch justify-start items-center gap-4 inline-flex"
    >
      <WalletAvatar :wallet="newWallet" size="large" />
      <VaButton preset="primary" size="small">Add image</VaButton>
      <VaButton
        v-if="avatar"
        preset="primary"
        color="danger"
        size="small"
        icon="delete"
        class="z-10"
        @click.stop="avatar = undefined"
      />
    </VaFileUpload>
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newWallet.name"
          label="Description"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="name"
        />
        <VaInput
          v-model="newWallet.currency"
          label="Money"
          class="w-full sm:w-1/2"
          :rules="[validators.required, validators.number]"
          name="currency"
          type="number"
          step="0.01"
        />
      </div>
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">Cancel</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
