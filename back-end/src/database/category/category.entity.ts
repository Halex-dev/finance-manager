import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Cost } from '../cost/cost.entity';
import { BadRequestException} from '@nestjs/common';

@Entity()
export class Category {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  type: number;

  @Column()
  date: string;

  @OneToMany(() => Cost, cost => cost.category)
  costs: Cost[];

}