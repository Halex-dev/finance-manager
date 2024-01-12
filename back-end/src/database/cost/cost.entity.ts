import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, BeforeUpdate, JoinColumn, OneToMany } from 'typeorm';
import { Category } from '../category/category.entity';
import { Wallet } from '../wallet/wallet.entity';
import { Amortization } from '../amortization/amortization.entity';

@Entity()
export class Cost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column()
  status: number;

  @ManyToOne(() => Category, category => category.costs)
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @ManyToOne(() => Wallet, wallet => wallet.costs)
  @JoinColumn({ name: "walletId" })
  wallet: Wallet;

  @ManyToOne(() => Amortization, amortization => amortization.childCosts)
  @JoinColumn({ name: "amortizationId" })
  amortization: Amortization;

  //Other variable for manage something
  selectedMonths?: number;
  checkAmortization?: boolean;

}