import { User } from '../../../users/db-psql/entity/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Statistic {
  @PrimaryGeneratedColumn()
  id: string;

  @OneToOne(() => User)
  @JoinColumn({
    name: 'userId',
  })
  public userId: User;

  @Column({
    type: 'numeric',
  })
  sumScore: number;

  @Column({
    type: 'numeric',
  })
  winsCount: number;

  @Column({
    type: 'numeric',
  })
  lossesCount: number;

  @Column({
    type: 'numeric',
  })
  drawcount: number;

  @Column({ type: 'numeric', default: 0 })
  avgScores: number;

  @BeforeInsert()
  updateAvgScores() {
    if (this.winsCount + this.lossesCount + this.drawcount > 0) {
      this.avgScores =
        this.sumScore / (this.winsCount + this.lossesCount + this.drawcount);
    } else {
      this.avgScores = 0;
    }
  }
}

// @Column({
//     type: "numeric",
//     nullable: true,
//     default: 'sumScore / (winsCount + lossesCount + drawcount)'
// })
// avgScores: number

// @BeforeInsert()
// calculeteValue(){
//     this.avgScores = (this.sumScore / (this.winsCount + this.lossesCount + this.drawcount))
// }

// @OneToMany((type) => Pairresult, (result) => result.pairId)
// @JoinColumn({
//     name: 'resultsId'
// })
// public resultsId: Pairresult[]
