import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  vehicle: string;

  @Column('decimal')
  rating: number;

  @Column('text')
  review_comment: string;

  @Column('decimal')
  price_per_km: number;

  @Column('integer')
  minimum_km: number;
}
