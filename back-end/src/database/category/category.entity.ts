import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';
import { Amortization } from '../amortization/amortization.entity';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE_NECESSARY = 'necessary expense',
  EXPENSE_OPTIONAL = 'optional/secondary expense',
  LONG_TERM = 'long-term investments',
  SHORT_TERM = 'short-term investments',
  AMORTIZATION = 'amortization',
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  category_type: CategoryType;

  @Column({ type: 'text' })
  color: string;

  @Column({ type: 'date' })
  date: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @OneToMany(() => Amortization, (amortization) => amortization.category)
  amortizations: Amortization[];
}
