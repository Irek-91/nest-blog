import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Pairresult } from "./result.pair";



@Entity()
export class Pair {

@PrimaryColumn()
id: string

@Column()
firstPlayerId: string

@Column({nullable: true})
secondPlayerId: string


@Column("simple-json")
questionsId: string[]

@Column()
pairCreatedDate: string

@Column({nullable: true})
startGameDate: string

@Column({nullable: true})
finishGameDate: string

@Column({nullable: true})
status: string


// @OneToMany((type) => Pairresult, (result) => result.pairId)
// @JoinColumn({
//     name: 'resultsId'
// })
// public resultsId: Pairresult[]

}


