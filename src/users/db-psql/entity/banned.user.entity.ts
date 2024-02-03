import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import { User } from "./user.entity"

@Entity()
export class BannedUser {

    @PrimaryColumn()
    @OneToOne(() => User, (user) => user._id)
    @JoinColumn({
        name: 'userId'
    })
    public userId : User
    
    @Column({default: null,
    nullable: true})
    banDate: string
    
    @Column({default: null,
        nullable: true})
    banReason: string 
}
