import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';
import { Movement } from '../movement/movement.entity';
import { Amortization } from '../amortization/amortization.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string; //description to name

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currency: number; //money to currency

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text' })
  avatar: string;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

  @OneToMany(() => Amortization, (amortization) => amortization.wallet)
  amortizations: Amortization[];

  //TODO ancora da implementare
  @OneToMany(() => Movement, (movement) => movement.wallet)
  movements: Movement[];
}
