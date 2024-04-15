import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';

enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // @Column({ type: 'enum', enum: ['income', 'expense'] }) other method
  @Column({ type: 'text' })
  category_type: CategoryType;

  @Column()
  color: string;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];
}
