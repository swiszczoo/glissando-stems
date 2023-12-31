import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { VirtualColumn } from '../../virtual-column';

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
  @ManyToOne(() => Band, (band) => band.id, {
    onDelete: 'CASCADE',
  })
  public owner: Band;

  @Column('int', { nullable: true })
  public ownerId: number;

  @Column('varchar', { nullable: false, length: 255 })
  public title: string;

  @Column('float', { nullable: true })
  public bpm?: number;

  @Column('smallint', { nullable: true, default: 4 })
  public timeSignature?: number;

  @Column('simple-json', { nullable: false })
  public form: { bar: number; name: string }[];

  @Column('simple-json', { nullable: true })
  public varyingTempo: { sample: number; bar: number; timeSigNum: number }[];

  @OneToMany(() => Stem, (stem) => stem.song)
  public stems: Stem[];

  @VirtualColumn('int')
  public stemCount: number;

  @VirtualColumn('int')
  public samples: number;
}
