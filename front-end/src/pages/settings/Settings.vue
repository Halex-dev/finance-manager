<template>
  <div class="flex flex-col space-y-6 md:space-y-4">
    <h1 class="page-title">{{ t('menu.settings') }}</h1>
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('settings.theme') }}</h3>
      <ThemeSwitcher />
    </div>
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('settings.preferences') }}</h3>
      <LanguageSwitcher />
    </div>
    <Notifications />
  </div>
</template>
<script lang="ts" setup>
import LanguageSwitcher from './components/general/LanguageSwitcher.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import Notifications from './components/Notifications.vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
