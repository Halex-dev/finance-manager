import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Category } from '../category/category.entity';
import { Wallet } from '../wallet/wallet.entity';
import { Amortization } from '../amortization/amortization.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (category) => category.transactions, {
    nullable: true, //For the ammortization
  })
  category: Category;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;

  @ManyToOne(() => Amortization, (amortization) => amortization.transactions, {
    nullable: true, //For the ammortization
  })
  amortization: Amortization;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  date: Date;
}
