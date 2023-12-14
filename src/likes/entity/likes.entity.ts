import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Like {
    @PrimaryColumn()
    _id: string

    @Column()
    userId:string

    @Column()
    userLogin: string

    @Column()
    postIdOrCommentId: string

    @Column()
    status: string

    @Column()
    createdAt: string

}