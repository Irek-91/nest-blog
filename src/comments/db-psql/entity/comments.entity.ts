import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comment {
    @PrimaryColumn()
    _id: string

    @Column()
    postId:string

    @Column()
    content: string

    @Column()
    createdAt: string

    @Column()
    userId: string

    @Column()
    userLogin:string
}