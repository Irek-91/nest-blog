import { Post } from './../../../posts/db-psql/entity/post.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToMany((type) => Post, (post) => post._id, {nullable: true})
    @JoinColumn({
        name: 'postId'
    })
    public postId: Post[]
}