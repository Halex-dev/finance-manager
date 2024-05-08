import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Category } from '../category/category.entity';
import { Wallet } from '../wallet/wallet.entity';
import { Amortization } from '../amortization/amortization.entity';

export enum StateType {
  PAID = 'paid',
  FAILED = 'failed',
  UNPAID = 'unpaid',
  NOT_RECEIVED = 'not_received',
  RECEIVED = 'received',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  state: StateType;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => Category, (category) => category.transactions)
  category: Category;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;

  @ManyToOne(() => Amortization, (amortization) => amortization.transactions)
  amortization: Amortization;
}
