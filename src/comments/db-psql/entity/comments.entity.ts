import { User } from './../../../users/db-psql/entity/user.entity';
import { Post } from './../../../posts/db-psql/entity/post.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryColumn()
  _id: string;

  @ManyToOne((type) => Post, (post) => post._id)
  @JoinColumn({
    name: 'postId',
  })
  public postId: Post;

  @Column()
  content: string;

  @Column()
  createdAt: string;

  @ManyToOne((type) => User, (user) => user._id)
  @JoinColumn({
    name: 'userId',
  })
  public userId: User;
}
