import { User } from './../../../users/db-psql/entity/user.entity';
import { Post } from './../../../posts/db-psql/entity/post.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comment {
    @PrimaryColumn()
    _id: string

    @ManyToOne('Post', 'posts')
    @JoinColumn({
        name: 'postId'
    })
    public postId : Post

    @Column()
    content: string

    @Column()
    createdAt: string

    @ManyToOne('User', 'users')
    @JoinColumn({
        name: 'userId'
    })
    public userId: User
}