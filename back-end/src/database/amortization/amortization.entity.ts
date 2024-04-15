import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Amortization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'float' })
  initialAmount: number;

  @Column({ type: 'int' })
  durationMonths: number;

  @Column({ type: 'float' })
  residualValue: number;
}
