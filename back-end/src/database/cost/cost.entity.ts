import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, BeforeUpdate, JoinColumn } from 'typeorm';
import { Category } from '../category/category.entity';
import { Wallet } from '../wallet/wallet.entity';

@Entity()
export class Cost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  description: string;

  @Column()
  date: string;

  @ManyToOne(() => Category, category => category.costs)
  @JoinColumn({ name: "categoryId" })
  category: Category;

  /*@ManyToOne(() => Type, type => type.costs)
  type: Type;*/

  @ManyToOne(() => Wallet, wallet => wallet.costs)
  @JoinColumn({ name: "walletId" })
  wallet: Wallet;
}