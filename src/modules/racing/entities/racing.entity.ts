import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('racing')
export class Racing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column('decimal')
  distance: number;

  @Column()
  duration: string;

  @Column('int')
  driver_id: number;

  @Column()
  driver_name: string;

  @Column('decimal')
  value: number;

  @CreateDateColumn()
  date: Date;
}
