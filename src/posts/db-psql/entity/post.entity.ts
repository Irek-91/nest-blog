import { ImageForPost } from './image.post.entity';
import { Comment } from './../../../comments/db-psql/entity/comments.entity';
import { Blog } from './../../../blogs/db-psql/entity/blog.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

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
    createdAt: string

    @ManyToOne((type) => Blog, (blogs) => blogs._id, {nullable: true})
    @JoinColumn({name: 'blogId'})
    public blogId: Blog

    @OneToMany((type) => Comment, (comments) => comments.postId._id, {nullable: true})
    @JoinColumn({name: 'commentId'})
    public commentId: Comment[]

    @OneToMany((type) => ImageForPost, (images) => images.post, {nullable: true})
    @JoinColumn({name: 'imageForPost'})
    public imageForPost: ImageForPost[]

}