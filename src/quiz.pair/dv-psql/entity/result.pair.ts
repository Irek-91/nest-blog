import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Pair } from "./pairs";



@Entity()
export class Pairresult {
   
    @PrimaryColumn()
    id: string

    @Column()
    pairId: string

    @Column()
    playerId: string

    @Column("simple-json", { nullable: true })
    answersAddedAt: string[]

    @Column("simple-json", { nullable: true })
    answersStatus: string[]

    @Column()
    score: number
    

    // @ManyToOne(() => Pair, (pair) => pair.id)
    // @JoinColumn({
    //     name: 'pairId'
    // })
    // public pairId: Pair
}
