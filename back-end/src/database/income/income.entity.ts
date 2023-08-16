import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';

@Entity()
export class Income {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  income: number;

  @Column()
  description: string;

  @Column()
  date: string;

  @ManyToOne(() => Wallet, wallet => wallet.costs)
  wallet: Wallet;
}