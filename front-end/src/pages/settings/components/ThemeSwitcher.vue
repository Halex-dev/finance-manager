<template>
  <VaButtonToggle v-model="theme" color="background-element" border-color="background-element" :options="options" />
</template>
<script lang="ts" setup>
import { computed, watch, ref } from 'vue'

import { useI18n } from 'vue-i18n'

import { useColors } from 'vuestic-ui'

const { applyPreset, currentPresetName } = useColors()

const theme = computed({
  get() {
    return currentPresetName.value
  },
  set(value) {
    applyPreset(value)
    localStorage.setItem('theme', value)
  },
})

const { locale, t } = useI18n()

watch([locale], async () => {
  options.value = [
    { label: t('buttonSelect.dark'), value: 'dark' },
    { label: t('buttonSelect.light'), value: 'light' },
  ]
})

const options = ref([
  { label: t('buttonSelect.dark'), value: 'dark' },
  { label: t('buttonSelect.light'), value: 'light' },
])
</script>
