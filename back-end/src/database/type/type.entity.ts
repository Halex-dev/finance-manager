import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Cost } from '../cost/cost.entity';

@Entity()
export class Type {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  date: string;

  /*@OneToMany(() => Cost, cost => cost.type)
  costs: Cost[];*/
}