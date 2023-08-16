import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Cost } from '../cost/cost.entity';
import { Income } from '../income/income.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  money: number;

  @Column()
  date: string;

  @OneToMany(() => Cost, cost => cost.wallet)
  costs: Cost[];

  @OneToMany(() => Income, income => income.wallet)
  income: Income[];
}