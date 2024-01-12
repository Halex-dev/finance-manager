import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, BeforeUpdate, JoinColumn, OneToMany } from 'typeorm';
import { Cost } from '../cost/cost.entity';

@Entity()
export class Amortization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  description: string;

  @Column()
  months: number;

  @Column()
  dateStart: Date;

  @Column()
  dateEnd: Date;

  @OneToMany(() => Cost, cost => cost.amortization, { nullable: true }) // Aggiungi la relazione nullable
  childCosts: Cost[];
}