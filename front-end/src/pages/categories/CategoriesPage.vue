<template>
  <h1 class="page-title">{{ t('menu.categories') }}</h1>

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
        <VaButton @click="showAddCategoryModal">{{ t('button.add') }} {{ t('categories.category') }}</VaButton>
      </div>

      <CategoryTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :categories="categories"
        :loading="isLoading"
        :pagination="pagination"
        @editCategory="showEditCategoryModal"
        @deleteCategory="onCategoryDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditCategoryModal"
    size="small"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">
      {{
        categoryToEdit
          ? `${t('button.edit')} ${t('categories.category')}`
          : `${t('button.add')} ${t('categories.category')}`
      }}
    </h1>
    <CategoryModal
      ref="editFormRef"
      :category="categoryToEdit"
      :save-button-label="categoryToEdit ? `${t('button.save')}` : `${t('button.add')}`"
      @close="cancel"
      @save="
        (category) => {
          onCategorySaved(category)
          ok()
        }
      "
    />
  </VaModal>
</template>

<script setup lang="ts">
import { Category } from './types'
import { useCategory } from './composables/useCategory'
import { ref } from 'vue'
import CategoryTable from './widgets/CategoryTable.vue'
import CategoryModal from './widgets/CategoryModal.vue'
import { useModal, useToast } from 'vuestic-ui'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const doShowEditCategoryModal = ref(false)

const { categories, isLoading, filters, sorting, pagination, ...categoriesApi } = useCategory()

const categoryToEdit = ref<Category | null>(null)

const showEditCategoryModal = (category: Category) => {
  categoryToEdit.value = category
  doShowEditCategoryModal.value = true
}

const showAddCategoryModal = () => {
  categoryToEdit.value = null
  doShowEditCategoryModal.value = true
}

const { init: notify } = useToast()

const onCategorySaved = async (category: Category) => {
  if (categoryToEdit.value) {
    const response = await categoriesApi.update(category)

    if (response) {
      notify({
        message: response,
        color: 'danger',
      })
    } else {
      notify({
        message: `${category.name} ${t('notify.update')}`,
        color: 'success',
      })
    }
  } else {
    const response = await categoriesApi.add(category)

    if (response) {
      notify({
        message: response,
        color: 'danger',
      })
    } else {
      notify({
        message: `${category.name} ${t('notify.add')}`,
        color: 'success',
      })
    }
  }
}

const onCategoryDelete = async (category: Category) => {
  const response = await categoriesApi.remove(category)

  if (response) {
    notify({
      message: response,
      color: 'danger',
    })
  } else {
    notify({
      message: `${category.name} ${t('notify.delete')}`,
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
