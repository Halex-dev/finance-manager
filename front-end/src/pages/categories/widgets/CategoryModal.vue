<script setup lang="ts">
import { PropType, computed, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { Category } from '../types'
import { validators } from '../../../services/utils'

import { CategoryType, useCategoryOptions } from '../types'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  category: {
    type: Object as PropType<Category | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

function generateRandomHexColor() {
  // Genera tre componenti RGB casuali
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)

  // Converte i componenti RGB in formato HEX
  const hexR = r.toString(16).padStart(2, '0')
  const hexG = g.toString(16).padStart(2, '0')
  const hexB = b.toString(16).padStart(2, '0')

  // Unisce i componenti per creare il colore HEX completo
  const hexColor = `#${hexR}${hexG}${hexB}`

  return hexColor
}

const defaultNewCategory: Partial<Category> = {
  name: '',
  category_type: CategoryType.INCOME,
  color: generateRandomHexColor(),
  date: new Date(),
}

const newCategory = ref<Partial<Category>>({ ...defaultNewCategory })

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newCategory.value).some((key) => {
    return newCategory.value[key as keyof Category] !== (props.category ?? defaultNewCategory)?.[key as keyof Category]
  })
})

const categoryOptions = useCategoryOptions()

defineExpose({
  isFormHasUnsavedChanges,
})

watch(
  () => props.category,
  () => {
    if (!props.category) {
      return
    }

    newCategory.value = {
      ...props.category,
    }
  },
  { immediate: true },
)

const form = useForm('add-category-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newCategory.value)
  }
}
</script>

<template>
  <VaForm
    v-slot="{ isValid }"
    ref="add-category-form"
    class="flex-col justify-start items-start gap-4 inline-flex w-full"
  >
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newCategory.name"
          :label="t('categories.name')"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="name"
        />
        <div class="w-1/2">
          <VaSelect
            v-model="newCategory.category_type"
            :label="t('categories.category_type')"
            class="w-full"
            :options="categoryOptions"
            :rules="[validators.required]"
            name="category_type"
            value-by="value"
            text-by="category_name"
          />
        </div>
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaColorInput
          v-model="newCategory.color"
          :label="t('categories.color')"
          class="w-full sm:w-1/2"
          :rules="[validators.hexColor]"
          name="color"
          placeholder="#RRGGBB"
        />
      </div>
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">{{ t('button.cancel') }}</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
