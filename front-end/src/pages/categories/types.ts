import { useI18n } from 'vue-i18n'

export enum CategoryType {
  INCOME = 'income',
  EXPENSE_NECESSARY = 'necessary_expense',
  EXPENSE_OPTIONAL = 'optional_expense',
  LONG_TERM = 'long_term',
  SHORT_TERM = 'short_term',
}

export type Category = {
  id: number
  name: string
  category_type: CategoryType
  date: Date
  color: string
}

export function useCategoryOptions() {
  const { t } = useI18n()

  const localizedCategoryOptions = [
    { category_name: t('categories.type.income'), value: CategoryType.INCOME },
    { category_name: t('categories.type.necessary_expense'), value: CategoryType.EXPENSE_NECESSARY },
    { category_name: t('categories.type.optional_expense'), value: CategoryType.EXPENSE_OPTIONAL },
    { category_name: t('categories.type.long_term'), value: CategoryType.LONG_TERM },
    { category_name: t('categories.type.short_term'), value: CategoryType.SHORT_TERM },
  ]

  return localizedCategoryOptions
}

export function getCategoryOptions(value: CategoryType) {
  const { t } = useI18n()
  return t(`categories.type.${value}`)
}
