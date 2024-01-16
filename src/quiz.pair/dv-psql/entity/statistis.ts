import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Pairresult } from "./result.pair";



@Entity()
export class Statistic {

@PrimaryGeneratedColumn()
id: string

@Column()
userId: string

@Column()
score: number

@Column()
winsCount: number

@Column()
lossesCount: number


// @OneToMany((type) => Pairresult, (result) => result.pairId)
// @JoinColumn({
//     name: 'resultsId'
// })
// public resultsId: Pairresult[]

}


