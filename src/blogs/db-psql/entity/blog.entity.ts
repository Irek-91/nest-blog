import { WallpaperImageForBlog } from './wallpaper.image.blog.entity';
import { UsersBannedByBlogger } from './../../../users/db-psql/entity/users.banned.by.blogger.entity';
import { Post } from './../../../posts/db-psql/entity/post.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { User } from './../../../users/db-psql/entity/user.entity';
import { MainImageForBlog } from './main.image.blog.entity';

@Entity()
export class Blog {
  @PrimaryColumn()
  _id: string;

  @Column({
    collation: 'C',
  })
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  createdAt: string;

  @Column()
  isMembership: boolean;

  @Column({
    default: false,
  })
  banStatus: boolean;

  @Column({
    default: null,
    nullable: true,
  })
  banDate: string;

  @Column()
  subscribersCount: number;

  @ManyToOne(() => User, (p) => p._id, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'blogger',
  })
  public blogger: User;

  @OneToMany((type) => Post, (post) => post._id, { nullable: true })
  @JoinColumn({
    name: 'postId',
  })
  public postId: Post[];

  @OneToMany((type) => MainImageForBlog, (image) => image.blog, {
    nullable: true,
  })
  @JoinColumn({
    name: 'mainImage',
  })
  public mainImage: MainImageForBlog[];

  @OneToMany((type) => WallpaperImageForBlog, (wallpaper) => wallpaper.blog, {
    nullable: true,
  })
  @JoinColumn({
    name: 'wallpaperImage',
  })
  public wallpaperImage: WallpaperImageForBlog[];

  @OneToMany((type) => UsersBannedByBlogger, (b) => b.userId._id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'bannedUser',
  })
  public bannedUser: UsersBannedByBlogger[];
}
