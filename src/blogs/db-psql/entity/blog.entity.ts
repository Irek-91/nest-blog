import { UsersBannedByBlogger } from './../../../users/db-psql/entity/users.banned.by.blogger.entity';
import { BannedUser } from './../../../users/db-psql/entity/banned.user.entity';
import { Post } from './../../../posts/db-psql/entity/post.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from './../../../users/db-psql/entity/user.entity';

@Entity()
export class Blog {
    @PrimaryColumn()
    _id: string

    @Column({
        collation: 'C'
    })
    name: string

    @Column()
    description: string

    @Column()
    websiteUrl: string

    @Column()
    createdAt: string

    @Column()
    isMembership: boolean

    @ManyToOne(() => User, (p) => p._id, { nullable: true , 
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'blogger'
    })
    public blogger: User


    @OneToMany((type) => Post, (post) => post._id, { nullable: true })
    @JoinColumn({
        name: 'postId'
    })
    public postId: Post[]


    @OneToMany((type) => UsersBannedByBlogger, (b) => b.userId._id, { nullable: true , onDelete: 'CASCADE'})
    @JoinColumn({
        name: 'bannedUser'
    })
    public bannedUser: UsersBannedByBlogger[]
}