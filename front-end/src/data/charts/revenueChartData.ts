import { Transaction } from '../../pages/transactions/types'
import { CategoryType } from '../../pages/categories/types'

export const earningsColor = '#49A8FF'
export const expensesColor = '#154EC1'

export const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export type Revenues = {
  month: string
  earning: number
  expenses: number
}

export const generateRevenuesNull = (months: string[]): Revenues[] => {
  return months.map((month: string) => {
    return {
      month,
      earning: 0, //dati esempio
      expenses: 0,
    }
  })
}

export const generateRevenues = (months: string[], data: Transaction[]): Revenues[] => {
  return months.map((month: string) => {
    // Filtrare le transazioni del mese corrente
    const transactionsInMonth = data.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const transactionMonth = transactionDate.getMonth()
      return transactionMonth === months.indexOf(month) // Controlla se il mese della transazione corrisponde al mese corrente
    })

    // Calcolare il totale dei ricavi per il mese corrente
    const totalIncome = transactionsInMonth
      .filter((transaction) => transaction.category && transaction.category.category_type === CategoryType.INCOME) // Filtra solo le transazioni di entrata
      .reduce((total: number, income: Transaction) => total + income.amount, 0)

    // Calcolare il totale delle spese per il mese corrente
    const totalExpenses = transactionsInMonth
      .filter(
        (transaction) =>
          !transaction.category || (transaction.category && transaction.category.category_type !== CategoryType.INCOME),
      ) // Filtra solo le transazioni di uscita
      .reduce((total: number, expense: Transaction) => total + expense.amount, 0)

    // Calcolare il guadagno per il mese corrente
    //const earning = totalIncome - totalExpenses

    return {
      month,
      earning: totalIncome,
      expenses: totalExpenses,
    }
  })
}

export const getRevenuePerMonth = (month: string, revenues: Revenues[]): Revenues => {
  const revenue = revenues.find((revenue) => revenue.month === month)
  return revenue || { month, earning: 0, expenses: 0 }
}

//TODO cambiare in base ai setting o lingua
export const formatMoney = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
