<script setup lang="ts">
import { PropType, computed, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { Amortization } from '../types'
import { validators } from '../../../services/utils'

import { useWallet } from '../../wallets/composables/useWallet'
import { useCategory } from '../../categories/composables/useCategory'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  amortization: {
    type: Object as PropType<Amortization | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewAmortization: Partial<Amortization> = {
  startDate: new Date(),
  initialAmount: 0,
  durationMonths: 2,
  residualValue: 0,
  description: '',
  date: new Date(),
}
const { wallets } = useWallet({ pagination: ref({ page: 1, perPage: 9999, total: 10 }) })
const { categories } = useCategory({
  pagination: ref({ page: 1, perPage: 9999, total: 10 }),
  filters: ref({ category_type: 'expense' }),
})

const newAmortization = ref<Partial<Amortization>>({ ...defaultNewAmortization })

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newAmortization.value).some((key) => {
    return (
      newAmortization.value[key as keyof Amortization] !==
      (props.amortization ?? defaultNewAmortization)?.[key as keyof Amortization]
    )
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

watch(
  () => props.amortization,
  () => {
    if (!props.amortization) {
      return
    }

    newAmortization.value = {
      ...props.amortization,
    }
  },
  { immediate: true },
)

const form = useForm('add-Amortization-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newAmortization.value)
  }
}
</script>

<template>
  <VaForm
    v-slot="{ isValid }"
    ref="add-Amortization-form"
    class="flex-col justify-start items-start gap-4 inline-flex w-full"
  >
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newAmortization.description"
          :label="t('amortizations.description')"
          class="w-full sm:w-1/2"
          name="description"
        />
        <VaDateInput
          v-model="newAmortization.startDate"
          :label="t('amortizations.startDate')"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="Date"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newAmortization.initialAmount"
          :label="t('amortizations.initialAmount')"
          class="w-full sm:w-1/2"
          :rules="[validators.required, validators.number]"
          name="initialAmount"
          type="number"
          step="0.01"
        />
        <VaInput
          v-model="newAmortization.durationMonths"
          :label="t('amortizations.durationMonths')"
          class="w-full sm:w-1/2"
          :rules="[validators.required, validators.number, validators.integer, validators.amortization]"
          name="durationMonths"
          type="number"
          step="1"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaSelect
          v-model="newAmortization.wallet"
          :label="t('wallets.wallet')"
          class="w-full sm:w-1/2"
          :options="wallets"
          :rules="[validators.required]"
          name="wallet"
          text-by="name"
        />
        <VaSelect
          v-model="newAmortization.category"
          :label="t('categories.category')"
          class="w-full sm:w-1/2"
          :options="categories"
          :rules="[validators.required]"
          name="category"
          text-by="name"
        />
      </div>
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">{{ t('button.cancel') }}</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
