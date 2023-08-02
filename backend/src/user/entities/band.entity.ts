import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Band {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Column('varchar', { nullable: false, length: 255 })
  public name: string;

  @OneToMany(() => User, (user) => user.band)
  public members: User[];
}
