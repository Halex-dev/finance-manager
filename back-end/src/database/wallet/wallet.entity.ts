import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';
import { Movement } from '../movement/movement.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; //description to name

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currency: number; //money to currency

  @Column()
  date: Date;

  @Column()
  avatar: string;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

  @OneToMany(() => Movement, (movement) => movement.wallet)
  movements: Movement[];
}
