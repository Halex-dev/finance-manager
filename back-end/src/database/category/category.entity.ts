import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE_NECESSARY = 'expense necessary',
  EXPENSE_OPTIONAL = 'expense optional/secondary',
  LONG_TERM = 'long-term investments',
  SHORT_TERM = 'short-term investments',
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  category_type: CategoryType;

  @Column()
  color: string;

  @Column()
  date: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];
}
