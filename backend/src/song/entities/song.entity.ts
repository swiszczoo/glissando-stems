import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Band } from 'src/user/entities/band.entity';
import { Stem } from './stem.entity';

@Entity()
export class Song {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Index()
  @Column('varchar', { nullable: false, length: 255 })
  public slug: string;

  @Index()
  @ManyToOne(() => Band, (band) => band.id)
  public owner: Band;

  @Column('varchar', { nullable: false, length: 255 })
  public title: string;

  @Column('float', { nullable: false })
  public bpm: number;

  @Column('int', { nullable: true })
  public samples: number;

  @OneToMany(() => Stem, (stem) => stem.song)
  public stems: Stem[];
}
