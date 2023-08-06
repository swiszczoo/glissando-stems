import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Song } from './song.entity';

@Entity()
export class Stem {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @ManyToOne(() => Song, (song) => song.stems, {
    onDelete: 'CASCADE',
  })
  public song: Song;

  @Column('varchar', { nullable: false, length: 16 })
  public status: string;

  @Column('varchar', { nullable: false, length: 255 })
  public name: string;

  @Column('varchar', { nullable: false, length: 16 })
  public instrument: string;

  @Column('varchar', { nullable: true, length: 255 })
  public processingHostname: string;

  @Column('int', { nullable: true })
  public processingPid: number;

  @Column('int', { nullable: true })
  public samples: number;

  @Column('int', { nullable: true })
  public sampleRate: number;

  @Column('bool', { nullable: true })
  public local: boolean;

  @Column('varchar', { nullable: true, length: 512 })
  public location: string;
}
