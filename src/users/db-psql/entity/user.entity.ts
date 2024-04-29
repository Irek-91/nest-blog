import { Device } from './../../../securityDevices/db-psql/entity/devices.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { BannedUser } from './banned.user.entity';

@Entity()
export class User {
  @PrimaryColumn()
  _id: string;

  @Column({
    collation: 'C',
  })
  login: string;
  @Column()
  email: string;
  @Column()
  createdAt: string;
  @Column()
  salt: string;
  @Column()
  hash: string;

  @Column({
    nullable: true,
  })
  status: boolean;

  @OneToMany((type) => Device, (device) => device.userId)
  @JoinColumn({
    name: 'deviceId',
  })
  public deviceId: Device[];

  @OneToOne(() => BannedUser)
  @JoinColumn()
  public userId: BannedUser;
}
