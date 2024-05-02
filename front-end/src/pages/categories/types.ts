export enum CategoryType {
  INCOME = 'income',
  EXPENSE_NECESSARY = 'necessary expense',
  EXPENSE_OPTIONAL = 'optional/secondary expense',
  LONG_TERM = 'long-term investments',
  SHORT_TERM = 'short-term investments',
  AMORTIZATION = 'amortization',
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
  { category_name: 'Necessary expense', value: CategoryType.EXPENSE_NECESSARY },
  { category_name: 'Optional/secondary expense', value: CategoryType.EXPENSE_OPTIONAL },
  { category_name: 'Long-term investments', value: CategoryType.LONG_TERM },
  { category_name: 'Short-term investments', value: CategoryType.SHORT_TERM },
]
