import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Song } from './song.entity';

export enum StemStatus {
  RESERVED = 'reserved',
  PROCESSING = 'processing',
  FAILED = 'failed',
  READY = 'ready',
  DELETED = 'deleted',
}

@Entity()
export class Stem {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @ManyToOne(() => Song, (song) => song.stems, {
    onDelete: 'CASCADE',
  })
  public song: Song;

  @Column('int', { nullable: true })
  public songId: number;

  @Column({
    type: 'enum',
    enum: StemStatus,
    nullable: false,
    default: StemStatus.RESERVED,
  })
  public status: StemStatus;

  @Column('varchar', { nullable: false, length: 255 })
  public name: string;

  @Column('varchar', { nullable: false, length: 16 })
  public instrument: string;

  @Column('float', { nullable: false, default: 0 })
  public gainDecibels: number;

  @Column('float', { nullable: false, default: 0 })
  public pan: number;

  @Column('int', { nullable: false, default: 0 })
  public offset: number;

  @Column('varchar', { nullable: true, length: 255 })
  public processingHostname?: string;

  @Column('int', { nullable: true })
  public processingPid?: number;

  @Column('int', { nullable: true })
  public samples?: number;

  @Column('int', { nullable: true })
  public sampleRate?: number;

  @Column('bool', { nullable: true })
  public local?: boolean;

  @Column('varchar', { nullable: true, length: 512 })
  public location?: string;

  @Column('varchar', { nullable: true, length: 512 })
  public hqLocation?: string;

  @CreateDateColumn()
  public createdAt: Date;
}
