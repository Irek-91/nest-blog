import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class Question {

@PrimaryColumn()
id: string


@Column()
body: string

@Column("simple-json", {nullable: true})
answers: string[]

@Column()
published: boolean

@Column()
createdAt: string

@Column({nullable: true})
updatedAt: string

}
