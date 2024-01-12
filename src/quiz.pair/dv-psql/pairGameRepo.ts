import { Question } from './../../quiz.questions/db-psql/entity/question';
import { QuestionsRepository } from './../../quiz.questions/db-psql/questions.repo.PSQL';
import { answerViewModel, questionPairViewModel } from './../model/games.model';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Pair } from './entity/pairs';
import { Pairresult } from './entity/result.pair';

@Injectable()

export class PairGameRepo {
    constructor(@InjectDataSource() private model: DataSource,
        private questionsRepo: QuestionsRepository

    ) { }

    async getPairMyCurrent(userId: string): Promise<Pair | null> {
        try {
            const result = await this.model.getRepository(Pair)
                .createQueryBuilder('p')
                .where({
                    firstPlayerId: userId
                })
                .orWhere({
                    secondPlayerId: userId
                })
                .getOne()

            return result

        } catch (e) {
            return null
        }
    }

    async getResultPairsByPlayerId(userId: string): Promise<Pairresult | null> {
        try {
            const result = await this.model.getRepository(Pairresult)
                .createQueryBuilder('p')
                .where({
                    playerId: userId
                })
                .getOne()

            return result

        } catch (e) {
            return null
        }
    }

    async getAnswersByPlayerId(userId: string): Promise<answerViewModel[] | null> {
        try {
            const result: Pairresult | null = await this.model.getRepository(Pairresult)
                .createQueryBuilder('p')
                .where({
                    playerId: userId
                })
                .getOne()

            const pair = await this.getPairMyCurrent(userId)
            const questions = pair!.questionsId
            const answersAddedAt = result!.answersAddedAt
            const answerStatus = result!.answersStatus

            const answer: answerViewModel[] = questions.map(function (e, i) {
                return { questionId: e, answerStatus: answerStatus[i], addedAt: answersAddedAt[i] };
            });

            return answer

        } catch (e) {
            return null
        }
    }

    async getQuestionsByPair(playerId: string): Promise<questionPairViewModel[] | null> {
        try {
            const questionsPair = await this.model.getRepository(Pair)
                .createQueryBuilder('p')
                .where({
                    secondPlayerId: playerId
                })
                .getOne()
            const questionsId = questionsPair!.questionsId

            const result: questionPairViewModel[] = await Promise.all(questionsId.map(async (q) => {
                const questionsId = await this.model.getRepository(Question)
                    .createQueryBuilder('l')
                    .where({ id: q })
                    .getOne()
                return {
                    id: questionsId!.id,
                    body: questionsId!.body
                }
            }
            ))
            return result
        } catch (e) {
            return null
        }


    }


    async getPairWhereSecondPlayerNull(): Promise<Pair | null> {
        const result = await this.model.getRepository(Pair)
            .createQueryBuilder('p')
            .where({
                secondPlayerId: null
            })
            .getOne()
        return result
    }

    async addPlayerInPair(playerId: string, pairId: string): Promise<boolean> {
        const addPlayerPair = await this.model.createQueryBuilder()
            .update(Pair)
            .set({
                secondPlayerId: playerId,
                startGameDate: new Date().toISOString()
            })
            .where({
                id: pairId
            })
            .execute()
        return true
    }

    async createNewPair(playerId: string): Promise<boolean> {

        const pairId = uuidv4()
        const pairCreatedDate = new Date().toISOString()
        const questions = await this.questionsRepo.getFiveRandomQuestions()
        const createNewPair = await this.model.createQueryBuilder()
            .insert()
            .into(Pair)
            .values({
                id: pairId,
                firstPlayerId: playerId,
                questionsId: questions,
                pairCreatedDate: pairCreatedDate
            })
            .execute()
        return true
    }


    async deleteAll() {
        const result = await this.model.createQueryBuilder()
            .delete()
            .from(Pair)
            .execute()
        const resultTwo = await this.model.createQueryBuilder()
            .delete()
            .from(Pairresult)
            .execute()
        return true
    }

}
