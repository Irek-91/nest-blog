import { Question } from '../../quiz.questions/db-psql/entity/question';
import { QuestionsRepository } from '../../quiz.questions/db-psql/questions.repo.PSQL';
import { answerViewModel, questionPairViewModel } from '../model/games.model';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Pair } from './entity/pairs';
import { Pairresult } from './entity/result.pair';
import { log } from 'console';

@Injectable()

export class PairGameRepo {
    constructor(@InjectDataSource() private model: DataSource,
        private questionsRepo: QuestionsRepository

    ) { }

    async getPairMyCurrent(userId: string): Promise<Pair | null> {
        try {
            const result = await this.model.getRepository(Pair)
                .createQueryBuilder()
                .where({
                    firstPlayerId: userId, finishGameDate: IsNull()
                })
                .orWhere({
                    secondPlayerId: userId, finishGameDate: IsNull()
                })
                .getOne()

            return result

        } catch (e) {
            return null
        }
    }

    async getPairById(pairId: string): Promise<Pair | null> {
        try {
            const result = await this.model.getRepository(Pair)
                .createQueryBuilder()
                .where({
                    id: pairId
                })
                .getOne()

            return result

        } catch (e) {
            return null
        }
    }

    async getPairByIdAndUserId(userIdOne: string, pairId: string): Promise<Pair | null> {
        try {
            const result = await this.model.getRepository(Pair)
                .createQueryBuilder()
                .where({
                    firstPlayerId: userIdOne, id: pairId
                })
                .orWhere({
                    secondPlayerId: userIdOne, id: pairId
                })
                .getOne()

            return result

        } catch (e) {
            return null
        }
    }

    async getResultPairsByPlayerId(pairId: string, userId: string): Promise<Pairresult | null> {
        try {
            const result = await this.model.getRepository(Pairresult)
                .createQueryBuilder()
                .where({
                    pairId: pairId
                })
                .andWhere({
                    playerId: userId
                })
                .getOne()

            return result

        } catch (e) {
            return null
        }
    }

    async getAnswersByPlayerId(userId: string, pairId: string): Promise<answerViewModel[] | null> {
        try {

            const result: Pairresult | null = await this.model.getRepository(Pairresult)
                .createQueryBuilder()
                .where({
                    playerId: userId
                })
                .andWhere({
                    pairId: pairId
                })
                .getOne()

            const pair = await this.getPairByIdAndUserId(userId, pairId)
            const questions = pair!.questionsId
            const answersAddedAt = result!.answersAddedAt
            const answerStatus = result!.answersStatus
            

            let answer: answerViewModel[] = answerStatus.map(function (e, i) {

                return { questionId: questions[i], answerStatus: e, addedAt: answersAddedAt[i] };
            });

            return answer

        } catch (e) {
            return null
        }
    }

    async getQuestionsByPair(pairId: string): Promise<questionPairViewModel[] | null> {
        try {
            const questionsPair = await this.model.getRepository(Pair)
                .createQueryBuilder()
                .where({
                    id: pairId
                })
                .getOne()
            const questionsId = questionsPair!.questionsId

            const result: questionPairViewModel[] = await Promise.all(questionsId.map(async (q) => {
                const question = await this.model.getRepository(Question)
                    .createQueryBuilder()
                    .where({ id: q })
                    .getOne()
                return {
                    id: question!.id,
                    body: question!.body
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
            .createQueryBuilder()
            .where({
                secondPlayerId: IsNull()
            })
            .andWhere({
                finishGameDate: IsNull()
            })
            .getOne()
        return result
    }

    async addPlayerInPair(playerId: string, pairId: string): Promise<string> {
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

        const createPesultPlayer = await this.model.createQueryBuilder()
            .insert()
            .into(Pairresult)
            .values({
                id: uuidv4(),
                pairId: pairId,
                playerId: playerId,
                answersAddedAt: [],
                answersStatus: [],
                score: 0
            })
            .execute()

        return pairId
    }


    async createNewPair(playerId: string): Promise<string> {

        const pairId = uuidv4()
        const resultId = uuidv4()

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

        const createPesultPlayer = await this.model.createQueryBuilder()
            .insert()
            .into(Pairresult)
            .values({
                id: uuidv4(),
                pairId: pairId,
                playerId: playerId,
                answersAddedAt: [],
                answersStatus: [],
                score: 0
            })
            .execute()
        
        return pairId
    }


    async updateResultAnswer(pairId: string, questionId: string, playerId: string, resultAnswer: boolean): Promise<answerViewModel | null> {
        try {
            let status = 'Correct'
            let count = 1
            if (resultAnswer === false) {
                status = 'Incorrect'
                count = 0
            }
            const newDate = new Date().toISOString()

            const resultPlayer = await this.getResultPairsByPlayerId(pairId, playerId)
            const answersAddedAt = resultPlayer!.answersAddedAt.push(newDate)
            const answersStatus = resultPlayer!.answersStatus.push(status)
            const score = resultPlayer!.score + count
            let finishGameDate: string | null = null

            const updateResult = await this.model.createQueryBuilder()
                .update(Pairresult)
                .set({
                    answersAddedAt: resultPlayer!.answersAddedAt,
                    answersStatus: resultPlayer!.answersStatus,
                    score: score
                })
                .where({
                    pairId: pairId
                })
                .andWhere({
                    playerId: playerId
                })
                .execute()

            return {
                questionId: questionId,
                answerStatus: status,
                addedAt: newDate
            }
        } catch (e) {
            return null
        }

    }

    async updateStatusGame(pairId: string, bonusPlayerId: string, score: number): Promise<boolean | null> {
        try {
            const updateStatus = await this.model.createQueryBuilder()
                .update(Pair)
                .set({
                    finishGameDate: new Date().toISOString()
                })
                .where({
                    id: pairId
                })
                .execute()
            const updateBonusScore = await this.model.createQueryBuilder()
                .update(Pairresult)
                .set({
                    score: score
                })
                .where({
                    playerId: bonusPlayerId
                })
                .execute()

            return true
        } catch (e) {
            return null
        }
    }

    async deleteAll() {
        const resultTwo = await this.model.createQueryBuilder()
            .delete()
            .from(Pairresult)
            .execute()
        const result = await this.model.createQueryBuilder()
            .delete()
            .from(Pair)
            .execute()

        return true
    }

}
