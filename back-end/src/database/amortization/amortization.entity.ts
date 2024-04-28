import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';
import { Transaction } from '../transaction/transaction.entity';

@Entity()
export class Amortization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'float' })
  initialAmount: number;

  @Column({ type: 'int' })
  durationMonths: number;

  @Column({ type: 'float' })
  residualValue: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' }) //Date added
  date: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.amortizations)
  wallet: Wallet;

  @OneToMany(() => Transaction, (transaction) => transaction.amortization)
  transactions: Transaction[];
}
