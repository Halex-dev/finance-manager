<template>
  <VaDropdown :offset="[13, 0]" class="notification-dropdown" stick-to-edges :close-on-content-click="false">
    <template #anchor>
      <VaButton preset="secondary" color="textPrimary">
        <VaBadge v-if="notificationLength >= 1" overlap>
          <template #text> {{ notificationLength }}+ </template>
          <VaIconNotification class="notification-dropdown__icon" />
        </VaBadge>
        <VaBadge v-else overlap>
          <VaIconNotification class="notification-dropdown__icon" />
        </VaBadge>
      </VaButton>
    </template>
    <VaDropdownContent class="h-full sm:max-w-[420px] sm:h-auto">
      <section class="sm:max-h-[320px] p-4 overflow-auto">
        <VaList class="space-y-1 mb-2">
          <template v-for="(item, index) in notificationsWithRelativeTime" :key="item.id">
            <VaListItem class="text-base">
              <VaListItemSection icon class="mx-0 p-0">
                <VaIcon :name="item.icon" color="secondary" />
              </VaListItemSection>
              <VaListItemSection>
                {{ item.message }}
              </VaListItemSection>
              <VaListItemSection icon class="mx-1">
                {{ item.updateTimestamp }}
              </VaListItemSection>
            </VaListItem>
            <VaListSeparator v-if="item.separator && index !== notificationsWithRelativeTime.length - 1" class="mx-3" />
          </template>
        </VaList>

        <VaButton preset="primary" class="w-full" @click="displayAllNotifications = !displayAllNotifications"
          >{{ displayAllNotifications ? t('notifications.less') : t('notifications.all') }}
        </VaButton>
      </section>
    </VaDropdownContent>
  </VaDropdown>
</template>

<script setup lang="ts">
//TODO aggiungere x per eliminare la notifica e impostare il read per dire ho letto
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import VaIconNotification from '../../../icons/VaIconNotification.vue'
import { useNotificationsStore, Notification } from '../../../../stores/api/notifications'

const { t, locale } = useI18n()

const notificationsStore = useNotificationsStore()
const notifications = computed(() => notificationsStore.notifications)
const notificationsSorted = ref<Notification[]>([])

const notificationLength = ref<number>(0)

const baseNumberOfVisibleNotifications = 4
const rtf = new Intl.RelativeTimeFormat(locale.value, { style: 'short' })
const displayAllNotifications = ref(false)

watch([notifications], async ([notifications]) => {
  notificationsSorted.value = notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  updateNotificationLength()
})

const updateNotificationLength = () => {
  const list = notificationsSorted.value
  const filteredList = list.filter((notification) => notification.read === false)
  notificationLength.value = filteredList.length
}

onMounted(async () => {
  if (notifications.value.length === 0) await notificationsStore.fetch()
  notificationsSorted.value = notifications.value.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  updateNotificationLength()
})

const TIME_NAMES = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
  week: 1000 * 60 * 60 * 24 * 7,
  month: 1000 * 60 * 60 * 24 * 30,
  year: 1000 * 60 * 60 * 24 * 365,
}

const getTimeName = (differenceTime: number) => {
  return Object.keys(TIME_NAMES).reduce(
    (acc, key) => (TIME_NAMES[key as keyof typeof TIME_NAMES] < differenceTime ? key : acc),
    'month',
  ) as keyof typeof TIME_NAMES
}

const notificationsWithRelativeTime = computed(() => {
  const list = displayAllNotifications.value
    ? notificationsSorted.value
    : notificationsSorted.value.slice(0, baseNumberOfVisibleNotifications)

  return list.map((item, index) => {
    const timeDifference = Math.round(new Date().getTime() - new Date(item.date).getTime())
    const timeName = getTimeName(timeDifference)

    let separator = false

    const nextItem = list[index + 1]
    if (nextItem) {
      const nextItemDifference = Math.round(new Date().getTime() - new Date(nextItem.date).getTime())
      const nextItemTimeName = getTimeName(nextItemDifference)

      if (timeName !== nextItemTimeName) {
        separator = true
      }
    }

    return {
      ...item,
      message: `${t(`notifications.labels.${item.code}`)} ${item.message}`,
      updateTimestamp: rtf.format(-1 * Math.round(timeDifference / TIME_NAMES[timeName]), timeName),
      separator,
    }
  })
})
</script>

<style lang="scss" scoped>
.notification-dropdown {
  cursor: pointer;

  .notification-dropdown__icon {
    position: relative;
    display: flex;
    align-items: center;
  }

  .va-dropdown__anchor {
    display: inline-block;
  }
}
</style>
