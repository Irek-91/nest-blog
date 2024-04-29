import { Post } from './post.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// export enum SizeImage {
//     ADMIN = "admin",
//     EDITOR = "editor",
//     GHOST = "ghost",
// }

@Entity()
export class ImageForPost {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  urlForOriginal: string;

  @Column()
  urlForMiddle: string;

  @Column()
  urlForSmall: string;

  @Column()
  createdAt: string;

  @Column()
  fileId: string;

  @Column()
  fileSizeForOriginal: number;

  @Column()
  fileSizeForMiddle: number;

  @Column()
  fileSizeForSmall: number;

  @ManyToOne(() => Post, (post) => post, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'post',
  })
  public post: Post;
}
