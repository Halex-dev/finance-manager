import { Amortization } from '../amortizations/types'
import { Category } from '../categories/types'
import { Wallet } from '../wallets/types'

export enum StateType {
  PAID = 'paid',
  FAILED = 'failed',
  UNPAID = 'unpaid',
  NOT_RECEIVED = 'not_received',
  RECEIVED = 'received',
}

//TODO cambiare i colori
export const colorMap: Record<StateType, string> = {
  [StateType.PAID]: '#B3D943',
  [StateType.FAILED]: '#FF5733',
  [StateType.UNPAID]: '#FF5735',
  [StateType.NOT_RECEIVED]: '#FF5736',
  [StateType.RECEIVED]: '#B3D940',
};

export type Transaction = {
  id: number
  amount: number
  description: string
  state: StateType
  date: Date
  wallet: Wallet
  category: Category
  amortization: Amortization
}
