import { User } from './../../users/db-psql/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Like {
    @PrimaryColumn()
    _id: string

    @ManyToOne('User', 'users')
    @JoinColumn({
        name: 'userId'
    })
    public userId: User
    
    @Column()
    postIdOrCommentId: string

    @Column()
    status: string

    @Column()
    createdAt: string

}