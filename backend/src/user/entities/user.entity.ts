import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Band } from './band.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @ManyToOne(() => Band, (band) => band.members)
  public band: Band;

  @Index()
  @Column('varchar', { nullable: false, length: 255 })
  public login: string;

  @Index()
  @Column('varchar', { nullable: false, length: 255 })
  public email: string;

  @Column('varchar', { nullable: false, length: 255 })
  public password: string;

  @Column('varchar', { nullable: true, length: 64 })
  public firstName: string;

  @Column('varchar', { nullable: false, length: 16 })
  public role: string;
}
