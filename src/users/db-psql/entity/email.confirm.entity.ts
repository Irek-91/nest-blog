import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class EmailConfirmation {    
  
    @Column({nullable:true})
    confirmationCode: string
    @Column({nullable:true})
    expiritionDate: string
    @Column()
    isConfirmed: boolean
    @Column()
    recoveryCode: string
 
    
    @PrimaryColumn()
    @ManyToOne(() => User, (user) => user._id)
    @JoinColumn({
        name: 'userId'
    })
    public userId : User
 }