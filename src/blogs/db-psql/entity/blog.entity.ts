import { Post } from './../../../posts/db-psql/entity/post.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from './../../../users/db-psql/entity/user.entity';

@Entity()
export class Blog {
    @PrimaryColumn()
    _id:string

    
    @Column({
        collation: 'C'
    })
    name:string

    @Column()
    description: string
    
    @Column()
    websiteUrl: string

    @Column()
    createdAt: string

    @Column()
    isMembership: boolean

    @Column({type: 'varchar',nullable: true})
    userId: string | null

    @Column({type: 'varchar', nullable: true})
    userLogin: string | null

    // @OneToOne(() => User, {nullable: true})
    // @JoinColumn({
    //     name: 'userId'
    // })
    // public userId: User


    @OneToMany((type) => Post, (post) => post._id, {nullable: true})
    @JoinColumn({
        name: 'postId'
    })
    public postId: Post[]
}