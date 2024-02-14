import { Blog } from '../../../blogs/db-psql/entity/blog.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user.entity"

@Entity()
export class UsersBannedByBlogger {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user._id)
    @JoinColumn({
        name: 'userId'
    })
    public userId: User

    @Column({
        default: null,
        nullable: true
    })
    banDate: string

    @Column({
        default: null,
        nullable: true
    })
    banStatus: boolean

    @Column({
        default: null,
        nullable: true
    })
    banReason: string

    @ManyToOne((type) => Blog, (b) => b._id)
    @JoinColumn({
        name: 'blogId'
    })
    public blogId: Blog
}

