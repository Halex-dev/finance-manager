import { TLineChartData } from '../types'

//TODO lingua
export const lineChartData: TLineChartData = {
  labels: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  datasets: [
    {
      label: 'Monthly Earnings',
      backgroundColor: 'rgba(75,192,192,0.4)',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Random values
    },
  ],
}
