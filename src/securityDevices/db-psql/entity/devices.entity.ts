import { User } from './../../../users/db-psql/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Device {
  @PrimaryColumn()
  deviceId: string;

  @Column()
  issuedAt: string;

  @Column()
  expirationDate: string;

  @Column()
  IP: string;

  @Column()
  deviceName: string;

  @ManyToOne((type) => User, (user) => user.deviceId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  public userId: User;
}
