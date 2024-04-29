import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';

// export enum SizeImage {
//     ADMIN = "admin",
//     EDITOR = "editor",
//     GHOST = "ghost",
// }

@Entity()
export class WallpaperImageForBlog {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  url: string;

  @Column()
  createdAt: string;

  @Column()
  fileId: string;

  @Column()
  fileSize: number;

  @ManyToOne(() => Blog, (blog) => blog._id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blog',
  })
  public blog: Blog;
}
