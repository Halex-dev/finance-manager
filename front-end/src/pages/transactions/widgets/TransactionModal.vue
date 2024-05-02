<script setup lang="ts">
import { PropType, computed, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { Transaction } from '../types'
import { validators } from '../../../services/utils'

import { useCategory } from '../../categories/composables/useCategory'
import { useWallet } from '../../wallets/composables/useWallet'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  transaction: {
    type: Object as PropType<Transaction | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const { categories } = useCategory({ pagination: ref({ page: 1, perPage: 9999, total: 10 }) })
const { wallets } = useWallet({ pagination: ref({ page: 1, perPage: 9999, total: 10 }) })

const defaultNewTransaction: Partial<Transaction> = {
  amount: 0,
  description: '',
  date: new Date(),
}

const newTransaction = ref<Partial<Transaction>>({ ...defaultNewTransaction })

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newTransaction.value).some((key) => {
    return (
      newTransaction.value[key as keyof Transaction] !==
      (props.transaction ?? defaultNewTransaction)?.[key as keyof Transaction]
    )
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

watch(
  () => props.transaction,
  () => {
    if (!props.transaction) {
      return
    }

    newTransaction.value = {
      ...props.transaction,
    }
  },
  { immediate: true },
)

const form = useForm('add-Transaction-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newTransaction.value)
  }
}
</script>

<template>
  <VaForm
    v-slot="{ isValid }"
    ref="add-Transaction-form"
    class="flex-col justify-start items-start gap-4 inline-flex w-full"
  >
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput v-model="newTransaction.description" label="Description" class="w-full sm:w-1/2" name="description" />
        <VaInput
          v-model="newTransaction.amount"
          :label="t('transactions.amount')"
          class="w-full sm:w-1/2"
          :rules="[validators.required, validators.number]"
          name="amount"
          type="number"
          step="0.01"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaSelect
          v-model="newTransaction.category"
          :label="t('categories.category')"
          class="w-full sm:w-1/2"
          :options="categories"
          :rules="[validators.required]"
          name="category"
          text-by="name"
        />
        <VaSelect
          v-model="newTransaction.wallet"
          :label="t('wallets.wallet')"
          class="w-full sm:w-1/2"
          :options="wallets"
          :rules="[validators.required]"
          name="wallet"
          text-by="name"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaDateInput
          v-model="newTransaction.date"
          :label="t('transactions.date')"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="Date"
        />
      </div>
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">{{ t('button.cancel') }}</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
