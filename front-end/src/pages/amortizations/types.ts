import { Transaction } from '../transactions/types'
import { Wallet } from '../wallets/types'

export type Amortization = {
  id: number
  startDate: Date
  initialAmount: number
  durationMonths: number
  residualValue: number
  description: string
  date: Date
  wallet: Wallet
  transactions: Transaction[]
}
