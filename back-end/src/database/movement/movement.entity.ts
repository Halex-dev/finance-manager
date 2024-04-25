import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Wallet } from '../wallet/wallet.entity';

@Entity()
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.movements)
  wallet: Wallet;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text' })
  description: string;
}
