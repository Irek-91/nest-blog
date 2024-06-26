import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BannedUser {
  @PrimaryGeneratedColumn()
  id: number;
  // @PrimaryColumn()
  @OneToOne(() => User, (user) => user._id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  public userId: User;

  @Column({
    default: null,
    nullable: true,
  })
  banDate: string;

  @Column({
    default: null,
    nullable: true,
  })
  banReason: string;
}
