import { User } from './../../../users/db-psql/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Pairresult {
  @PrimaryColumn()
  id: string;

  @Column()
  pairId: string;

  @ManyToOne(() => User, (pair) => pair._id)
  @JoinColumn({
    name: 'playerId',
  })
  public playerId: User;

  @Column('simple-json', { nullable: true })
  answersAddedAt: string[];

  @Column('simple-json', { nullable: true })
  answersStatus: string[];

  @Column()
  score: number;

  // @ManyToOne(() => Pair, (pair) => pair.id)
  // @JoinColumn({
  //     name: 'pairId'
  // })
  // public pairId: Pair
}
