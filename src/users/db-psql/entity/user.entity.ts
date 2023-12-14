import { Device } from './../../../securityDevices/db-psql/entity/devices.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
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

@OneToMany(() => Device, p => p.userId)
devices: Device[]
@OneToMany(() => EmailConfirmation, p => p.userId)
emailConfirmation: EmailConfirmation[]
}
