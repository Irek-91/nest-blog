import { User } from './../../../users/db-psql/entity/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Device {
    @PrimaryGeneratedColumn("uuid")
    deviceId: string

    @Column()
    issuedAt : string

    @Column()
    expirationDate: string

    @Column()
    IP: string

    @Column()
    deviceName: string

    @PrimaryColumn()
    userId : string

}