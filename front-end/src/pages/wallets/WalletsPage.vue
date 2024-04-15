<template>
  <h1 class="page-title">Wallets</h1>

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
        <VaButton @click="showAddWalletModal">Add Wallet</VaButton>
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
    <h1 class="va-h5">{{ walletToEdit ? 'Edit wallet' : 'Add wallet' }}</h1>
    <WalletModal
      ref="editFormRef"
      :wallet="walletToEdit"
      :save-button-label="walletToEdit ? 'Save' : 'Add'"
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
        message: `${wallet.name} has been updated`,
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
        message: `${wallet.name} has been added`,
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
      message: `${wallet.name} has been deleted`,
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
      message: 'Form has unsaved changes. Are you sure you want to close it?',
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
