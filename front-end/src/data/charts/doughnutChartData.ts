import { TDoughnutChartData } from '../types'

export const profitBackground = '#154EC1'
export const expensesBackground = '#fff'
export const earningsBackground = '#ECF0F1'

export const doughnutChartData: TDoughnutChartData = {
  labels: [],
  datasets: [
    {
      label: '',
      backgroundColor: [profitBackground, earningsBackground],
      data: [],
    },
  ],
}
