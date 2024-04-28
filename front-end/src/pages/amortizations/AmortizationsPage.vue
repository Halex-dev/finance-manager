<template>
  <h1 class="page-title">Amortizations</h1>
  <VaCard>
    <VaCardContent>
      <div class="flex flex-wrap md:flex-row items-center mb-4">
        <div class="md:w-auto flex flex-wrap items-center mb-2 md:mb-0">
          <VaButtonToggle
            v-model="filters.type"
            color="background-element"
            border-color="background-element"
            class="mr-2"
            :options="[
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Finished', value: 'finished' },
              { label: 'Future', value: 'future' },
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
          <VaButton @click="showAddAmortizationModal">Add Amortization</VaButton>
        </div>
      </div>
      <AmortizationTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :amortizations="amortizations"
        :loading="isLoading"
        :pagination="pagination"
        @editAmortization="showEditAmortizationModal"
        @deleteAmortization="onAmortizationDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditAmortizationModal"
    size="small"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">{{ AmortizationToEdit ? 'Edit Amortization' : 'Add Amortization' }}</h1>
    <AmortizationModal
      ref="editFormRef"
      :amortization="AmortizationToEdit"
      :save-button-label="AmortizationToEdit ? 'Save' : 'Add'"
      @close="cancel"
      @save="
        (Amortization) => {
          onAmortizationSaved(Amortization)
          ok()
        }
      "
    />
  </VaModal>
</template>

<script setup lang="ts">
import { Amortization } from './types'
import { useAmortization } from './composables/useAmortization'
import { ref } from 'vue'
import AmortizationTable from './widgets/AmortizationTable.vue'
import AmortizationModal from './widgets/AmortizationModal.vue'
import { useModal, useToast } from 'vuestic-ui'

const doShowEditAmortizationModal = ref(false)

const { amortizations, isLoading, filters, sorting, pagination, ...amortizationsApi } = useAmortization()

const AmortizationToEdit = ref<Amortization | null>(null)

const showEditAmortizationModal = (Amortization: Amortization) => {
  AmortizationToEdit.value = Amortization
  doShowEditAmortizationModal.value = true
}

const showAddAmortizationModal = () => {
  AmortizationToEdit.value = null
  doShowEditAmortizationModal.value = true
}

const { init: notify } = useToast()

const onAmortizationSaved = async (Amortization: Amortization) => {
  if (AmortizationToEdit.value) {
    const response = await amortizationsApi.update(Amortization)

    if (response) {
      notify({
        message: response,
        color: 'danger',
      })
    } else {
      notify({
        message: `${Amortization.id} has been updated`,
        color: 'success',
      })
    }
  } else {
    const response = await amortizationsApi.add(Amortization)

    if (response) {
      notify({
        message: response,
        color: 'danger',
      })
    } else {
      notify({
        message: `${Amortization.id} has been updated`,
        color: 'success',
      })
    }
  }
}

const onAmortizationDelete = async (Amortization: Amortization) => {
  const response = await amortizationsApi.remove(Amortization)
  if (response) {
    notify({
      message: response,
      color: 'danger',
    })
  } else {
    notify({
      message: `${Amortization.id} has been updated`,
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
