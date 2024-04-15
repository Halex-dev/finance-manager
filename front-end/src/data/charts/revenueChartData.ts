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
      earning: 65, //dati esempio
      expenses: 150,
    }
  })
}

export const generateRevenues = (
  months: string[],
  costs: Record<string, any[]>,
  revenue: Record<string, any[]>,
): Revenues[] => {
  return months.map((month: string) => {
    // Calcolare il totale dei ricavi per il mese corrente
    const totalIncome = revenue[month].reduce((total: number, income: any) => total + income.amount, 0)

    // Calcolare il totale delle spese per il mese corrente
    const totalExpenses = costs[month].reduce((total: number, expense: any) => total + expense.amount, 0)

    // Calcolare il guadagno per il mese corrente
    const earning = totalIncome - totalExpenses

    return {
      month,
      earning,
      expenses: totalExpenses,
    }
  })
}

export const getRevenuePerMonth = (month: string, revenues: Revenues[]): Revenues => {
  const revenue = revenues.find((revenue) => revenue.month === month)
  return revenue || { month, earning: 0, expenses: 0 }
}

export const formatMoney = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
