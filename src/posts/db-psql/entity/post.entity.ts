import { Blog } from './../../../blogs/db-psql/entity/blog.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Post {
    @PrimaryColumn()
    _id: string

    @Column()
    title: string

    @Column()
    shortDescription: string

    @Column()
    content: string

    @Column()
    blogId: string

    @Column()
    blogName: string

    @Column()
    createdAt: string

}