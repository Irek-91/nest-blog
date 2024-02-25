import { UsersBannedByBlogger } from '../../../users/db-psql/entity/users.banned.by.blogger.entity';
import { BannedUser } from '../../../users/db-psql/entity/banned.user.entity';
import { Post } from '../../../posts/db-psql/entity/post.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../../users/db-psql/entity/user.entity';
import { Blog } from './blog.entity';

// export enum SizeImage {
//     ADMIN = "admin",
//     EDITOR = "editor",
//     GHOST = "ghost",
// }

@Entity()
export class WallpaperImageForBlog {
    @PrimaryGeneratedColumn()
    id: string
      
    @Column()
    url: string
    
    @Column()
    createdAt: string

    @Column()
    fileId: string

    @Column()
    fileSize: number


    @ManyToOne(() => Blog, (blog) => blog._id, { nullable: true , 
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'blog'
    })
    public blog: Blog

}

