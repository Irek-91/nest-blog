import { Device } from './../../../securityDevices/db-psql/entity/devices.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { EmailConfirmation } from "./email.confirm.entity";



@Entity()
export class User {

@PrimaryColumn()
_id: string

@Column({
    collation: 'C'
})
login: string
@Column()
email: string
@Column()
createdAt: string
@Column()
salt: string
@Column()
hash: string

@OneToMany('Device', 'devices')
@JoinColumn({
    name: 'deviceId'
})
public deviceId: Device

}
