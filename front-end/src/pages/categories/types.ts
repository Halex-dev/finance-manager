export enum CategoryType {
  INCOME = 'income',
  EXPENSE_NECESSARY = 'expense necessary',
  EXPENSE_OPTIONAL = 'expense optional/secondary',
  LONG_TERM = 'long-term investments',
  SHORT_TERM = 'short-term investments',
}

export type Category = {
  id: number
  name: string
  category_type: CategoryType
  date: Date
  color: string
}

export const categoryOptions = [
  { category_name: 'Income', value: CategoryType.INCOME },
  { category_name: 'Expense necessary', value: CategoryType.EXPENSE_NECESSARY },
  { category_name: 'Expense optional/secondary', value: CategoryType.EXPENSE_OPTIONAL },
  { category_name: 'Long-term investments', value: CategoryType.LONG_TERM },
  { category_name: 'Short-term investments', value: CategoryType.SHORT_TERM },
]