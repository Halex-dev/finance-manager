enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export type Category = {
  id: number
  name: string
  category_type: CategoryType
  color: string
}
