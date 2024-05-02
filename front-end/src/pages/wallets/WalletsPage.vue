<template>
  <h1 class="page-title">{{ t('menu.wallets') }}</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaInput v-model="filters.search" placeholder="Search">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton @click="showAddWalletModal">{{ t('button.add') }} {{ t('wallets.wallet') }}</VaButton>
      </div>

      <WalletsTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :wallets="wallets"
        :loading="isLoading"
        :pagination="pagination"
        @editWallet="showEditWalletModal"
        @deleteWallet="onWalletDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditWalletModal"
    size="small"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">
      {{ walletToEdit ? `${t('button.edit')} ${t('wallets.wallet')}` : `${t('button.add')} ${t('wallets.wallet')}` }}
    </h1>
    <WalletModal
      ref="editFormRef"
      :wallet="walletToEdit"
      :save-button-label="walletToEdit ? `${t('button.save')}` : `${t('button.add')}`"
      @close="cancel"
      @save="
        (wallet) => {
          onWalletSaved(wallet)
          ok()
        }
      "
    />
  </VaModal>
</template>

<script setup lang="ts">
import { Wallet } from './types'
import { useWallet } from './composables/useWallet'
import { ref } from 'vue'
import WalletsTable from './widgets/WalletsTable.vue'
import WalletModal from './widgets/WalletModal.vue'
import { useModal, useToast } from 'vuestic-ui'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const doShowEditWalletModal = ref(false)

const { wallets, isLoading, filters, sorting, pagination, ...walletsApi } = useWallet()

const walletToEdit = ref<Wallet | null>(null)

const showEditWalletModal = (wallet: Wallet) => {
  walletToEdit.value = wallet
  doShowEditWalletModal.value = true
}

const showAddWalletModal = () => {
  walletToEdit.value = null
  doShowEditWalletModal.value = true
}

const { init: notify } = useToast()

const onWalletSaved = async (wallet: Wallet) => {
  if (walletToEdit.value) {
    const response = await walletsApi.update(wallet)
    if (response) {
      notify({
        message: response,
        color: 'danger',
      })
    } else {
      notify({
        message: `${wallet.name} ${t('notify.update')}`,
        color: 'success',
      })
    }
  } else {
    const response = await walletsApi.add(wallet)

    if (response) {
      notify({
        message: response,
        color: 'danger',
      })
    } else {
      notify({
        message: `${wallet.name} ${t('notify.add')}`,
        color: 'success',
      })
    }
  }
}

const onWalletDelete = async (wallet: Wallet) => {
  const response = await walletsApi.remove(wallet)
  if (response) {
    notify({
      message: response,
      color: 'error',
    })
  } else {
    notify({
      message: `${wallet.name} ${t('notify.delete')}`,
      color: 'success',
    })
  }
}

const editFormRef = ref()

const { confirm } = useModal()

const beforeEditFormModalClose = async (hide: () => unknown) => {
  if (editFormRef.value.isFormHasUnsavedChanges) {
    const agreed = await confirm({
      maxWidth: '380px',
      message: `${t('modal.cancel')}`,
      size: 'small',
    })
    if (agreed) {
      hide()
    }
  } else {
    hide()
  }
}
</script>
