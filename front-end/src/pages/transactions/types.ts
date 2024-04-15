import { Category } from '../categories/types'
import { Wallet } from '../wallets/types'

export type Transaction = {
  id: number
  amount: number
  description: string
  date: Date
  wallet: Wallet
  category: Category
}
