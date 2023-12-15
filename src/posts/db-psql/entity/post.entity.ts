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
    blogName: string

    @Column()
    createdAt: string

    @ManyToOne('Blog', 'blogs', {nullable: true})
    @JoinColumn({name: 'blogId'})
    public blogId: Blog

}