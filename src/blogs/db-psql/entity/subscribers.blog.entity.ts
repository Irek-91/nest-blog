import { SubscriptionStatus } from './../../models/blogs-model';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from './../../../users/db-psql/entity/user.entity';
import { Blog } from './blog.entity';
import { IsEnum } from 'class-validator';

@Entity()
export class BlogSubscriber {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    code: string

    @Column()
    createdAt: string

    @Column({
        nullable: true})
    telegramId: number

    @IsEnum(SubscriptionStatus)
    @Column()
    status: string

    @ManyToOne((type) => Blog, (b) => b._id)
    @JoinColumn({
        name: 'blogId'
    })
    public blogId: Blog

    @ManyToOne(() => User, (p) => p._id, {
        nullable: true,
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'subscriber'
    })
    public subscriber: User




}