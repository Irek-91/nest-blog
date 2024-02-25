import { UsersBannedByBlogger } from '../../../users/db-psql/entity/users.banned.by.blogger.entity';
import { BannedUser } from '../../../users/db-psql/entity/banned.user.entity';
import { Post } from './post.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../../users/db-psql/entity/user.entity';

// export enum SizeImage {
//     ADMIN = "admin",
//     EDITOR = "editor",
//     GHOST = "ghost",
// }

@Entity()
export class ImageForPost {
    @PrimaryGeneratedColumn()
    id: string
      
    @Column()
    urlForOriginal: string

    @Column()
    urlForMiddle: string

    @Column()
    urlForSmall: string
    
    @Column()
    createdAt: string

    @Column()
    fileId: string
    
    @Column()
    fileSizeForOriginal: number

    @Column()
    fileSizeForMiddle: number

    @Column()
    fileSizeForSmall: number

    @ManyToOne(() => Post, (post) => post, { nullable: true , 
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'post'
    })
    public post: Post

}

