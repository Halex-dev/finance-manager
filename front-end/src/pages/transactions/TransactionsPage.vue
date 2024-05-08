<template>
  <!--- //TODO SISTEMARE IL FLEX, non mi piace molto -->
  <h1 class="page-title">{{ t('menu.transactions') }}</h1>
  <VaCard>
    <VaCardContent>
      <div class="flex flex-wrap md:flex-row items-center mb-4">
        <div class="md:w-auto flex flex-wrap items-center mb-2 md:mb-0">
          <VaButtonToggle
            v-model="filters.category_type"
            color="background-element"
            border-color="background-element"
            class="mr-2"
            :options="[
              { label: t('transactions.label.all'), value: 'all' },
              { label: t('transactions.label.expense'), value: 'expense' },
              { label: t('transactions.label.income'), value: 'income' },
            ]"
          />
        </div>
        <div class="w-auto flex flex-wrap items-center mb-2 md:mb-0">
          <VaInput v-model="filters.search" placeholder="Search" class="mr-2">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <div class="md:w-auto flex flex-wrap items-center mb-2 md:mb-0">
          <VaDateInput v-model="filters.dateStart" name="Date start" class="mr-2" />
        </div>
        <div class="md:w-auto flex flex-wrap items-center mb-2 md:mb-0">
          <VaDateInput v-model="filters.dateEnd" name="Date end" class="mr-2" />
        </div>
        <div class="md:w-auto flex flex-wrap items-center mb-2 md:mb-0">
          <VaButton @click="showAddTransactionModal"
            >{{ t('button.add') }} {{ t('transactions.transaction') }}</VaButton
          >
        </div>
      </div>
      <TransactionTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :transactions="transactions"
        :loading="isLoading"
        :pagination="pagination"
        @editTransaction="showEditTransactionModal"
        @deleteTransaction="onTransactionDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditTransactionModal"
    size="small"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">
      {{
        TransactionToEdit
          ? `${t('button.edit')} ${t('transactions.transaction')}`
          : `${t('button.add')} ${t('transactions.transaction')}`
      }}
    </h1>
    <TransactionModal
      ref="editFormRef"
      :transaction="TransactionToEdit"
      :save-button-label="TransactionToEdit ? `${t('button.save')}` : `${t('button.add')}`"
      @close="cancel"
      @save="
        (Transaction) => {
          onTransactionSaved(Transaction)
          ok()
        }
      "
    />
  </VaModal>
</template>

<script setup lang="ts">
import { Transaction } from './types'
import { useTransaction } from './composables/useTransaction'
import { ref } from 'vue'
import TransactionTable from './widgets/TransactionTable.vue'
import TransactionModal from './widgets/TransactionModal.vue'
import { useModal, useToast } from 'vuestic-ui'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const doShowEditTransactionModal = ref(false)

const { transactions, isLoading, filters, sorting, pagination, ...transactionsApi } = useTransaction()

const TransactionToEdit = ref<Transaction | null>(null)

const showEditTransactionModal = (Transaction: Transaction) => {
  TransactionToEdit.value = Transaction
  doShowEditTransactionModal.value = true
}

const showAddTransactionModal = () => {
  TransactionToEdit.value = null
  doShowEditTransactionModal.value = true
}

const { init: notify } = useToast()

const onTransactionSaved = async (Transaction: Transaction) => {
  if (TransactionToEdit.value) {
    const response = await transactionsApi.update(Transaction)

    if (response) {
      notify({
        message: response,
        color: 'danger',
      })
    } else {
      notify({
        message: `${Transaction.id} ${t('notify.update')}`,
        color: 'success',
      })
    }
  } else {
    const response = await transactionsApi.add(Transaction)

    if (response) {
      notify({
        message: response,
        color: 'danger',
      })
    } else {
      notify({
        message: `${Transaction.description} ${t('notify.add')}`,
        color: 'success',
      })
    }
  }
}

const onTransactionDelete = async (Transaction: Transaction) => {
  const response = await transactionsApi.remove(Transaction)
  if (response) {
    notify({
      message: response,
      color: 'danger',
    })
  } else {
    notify({
      message: `${Transaction.id} ${t('notify.delete')}`,
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
