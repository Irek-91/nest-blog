import { User } from './../../../users/db-psql/entity/user.entity';
import { AfterLoad, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Pairresult } from "./result.pair";



@Entity()
export class Statistic {

    @PrimaryGeneratedColumn()
    id: string


    @OneToOne(() => User)
    @JoinColumn({
        name: 'userId'
    })
    public userId: User

    @Column()
    score: number

    @Column()
    winsCount: number

    @Column()
    lossesCount: number

    @Column()
    drawcount: number

    @Column({default: 0})
    avgScores: number;


    // @OneToMany((type) => Pairresult, (result) => result.pairId)
    // @JoinColumn({
    //     name: 'resultsId'
    // })
    // public resultsId: Pairresult[]

}


