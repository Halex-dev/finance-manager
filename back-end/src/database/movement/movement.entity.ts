import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';

@Entity()
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.movements)
  wallet: Wallet;

  @Column()
  amount: number;

  @Column()
  date: Date;

  @Column()
  description: string;
}
