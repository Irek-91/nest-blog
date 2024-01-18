import { myStatisticViewModel } from './../../../dist/quiz.pair/model/games.model.d';
import { Statistic } from './entity/statistis';
import { queryPaginationPairsType, queryPaginationTopUsersType } from './../../helpers/query-filter';
import { Question } from '../../quiz.questions/db-psql/entity/question';
import { QuestionsRepository } from '../../quiz.questions/db-psql/questions.repo.PSQL';
import { answerViewModel, questionPairViewModel, userStatisticViewModel } from '../model/games.model';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Pair } from './entity/pairs';
import { Pairresult } from './entity/result.pair';
import { log } from 'console';

@Injectable()

export class PairGameRepo {
    constructor(@InjectDataSource() private dataSource: DataSource,
        private questionsRepo: QuestionsRepository

    ) { }

    async getPairMyCurrent(userId: string): Promise<Pair | null> {
        try {
            const result = await this.dataSource.getRepository(Pair)
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

    async getAllPairsByUser(userId: string, queryFilter: queryPaginationPairsType): Promise<Pair[] | null> {
        try {
            if (queryFilter.sortBy === 'status') {
                const result = await this.dataSource.getRepository(Pair)
                    .createQueryBuilder('p')
                    .where({
                        firstPlayerId: userId
                    })
                    .orWhere({
                        secondPlayerId: userId
                    })
                    .orderBy(`p.${queryFilter.sortBy}`, queryFilter.sortDirection)
                    .addOrderBy("p.pairCreatedDate", "DESC")
                    .skip(queryFilter.skip)
                    .take(queryFilter.pageSize)
                    .getMany()

                return result
            }
            const result = await this.dataSource.getRepository(Pair)
                .createQueryBuilder('p')
                .where({
                    firstPlayerId: userId
                })
                .orWhere({
                    secondPlayerId: userId
                })
                .orderBy(`p.${queryFilter.sortBy}`, queryFilter.sortDirection)
                .skip(queryFilter.skip)
                .take(queryFilter.pageSize)
                .getMany()

            return result

        } catch (e) {
            return null
        }

    }

    async getPairById(pairId: string): Promise<Pair | null> {
        try {
            const result = await this.dataSource.getRepository(Pair)
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
            const result = await this.dataSource.getRepository(Pair)
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
            const result = await this.dataSource.getRepository(Pairresult)
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

            const result: Pairresult | null = await this.dataSource.getRepository(Pairresult)
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
            const questionsPair = await this.dataSource.getRepository(Pair)
                .createQueryBuilder()
                .where({
                    id: pairId
                })
                .getOne()
            const questionsId = questionsPair!.questionsId

            const result: questionPairViewModel[] = await Promise.all(questionsId.map(async (q) => {
                const question = await this.dataSource.getRepository(Question)
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
        const result = await this.dataSource.getRepository(Pair)
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
        const addPlayerPair = await this.dataSource.createQueryBuilder()
            .update(Pair)
            .set({
                secondPlayerId: playerId,
                startGameDate: new Date().toISOString(),
                status: 'Active'
            })
            .where({
                id: pairId
            })
            .execute()

        const createPesultPlayer = await this.dataSource.createQueryBuilder()
            .insert()
            .into(Pairresult)
            .values({
                id: uuidv4(),
                pairId: pairId,
                playerId: { _id: playerId },
                answersAddedAt: [],
                answersStatus: [],
                score: 0
            })
            .execute()

        return pairId
    }
    async getStatisticByUser(userId: string): Promise<Statistic | null> {
        const result = await this.dataSource.getRepository(Statistic)
            .createQueryBuilder()
            .where({
                userId: userId
            })
            .getOne()
        return result
    }

    async getTopUsers(queryFilter: queryPaginationTopUsersType): Promise<userStatisticViewModel[] | []> {
        const resultMany = await this.dataSource.getRepository(Statistic)
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.userId', 'player')
            .orderBy('s.score', "DESC" )
            .getMany()
        if (!resultMany) {
            return []
        }
        const result: userStatisticViewModel[] = await Promise.all(resultMany.map(async (b) => {
            const gamesCount = b.drawcount + b.lossesCount + b.winsCount
            return {
                sumScore: b.score,
                avgScores: b.avgScores,
                gamesCount: gamesCount,
                winsCount: b.winsCount,
                lossesCount: b.lossesCount,
                drawsCount: b.drawcount,
                player: {
                    id: b.userId._id,
                    login: b.userId.login
                }
            }
        }))
        return result

    }


    async createNewStatistic(userId: string): Promise<boolean> {
        const createPesultPlayer = await this.dataSource.createQueryBuilder()
            .insert()
            .into(Statistic)
            .values({
                userId: { _id: userId },
                score: 0,
                winsCount: 0,
                lossesCount: 0,
                drawcount: 0
            })
            .execute()
        return true
    }

    async createNewPair(playerId: string): Promise<string> {

        const pairId = uuidv4()
        const resultId = uuidv4()

        const pairCreatedDate = new Date().toISOString()
        const questions = await this.questionsRepo.getFiveRandomQuestions()
        const createNewPair = await this.dataSource.createQueryBuilder()
            .insert()
            .into(Pair)
            .values({
                id: pairId,
                firstPlayerId: playerId,
                questionsId: questions,
                pairCreatedDate: pairCreatedDate,
                status: 'PendingSecondPlayer'
            })
            .execute()

        const createPesultPlayer = await this.dataSource.createQueryBuilder()
            .insert()
            .into(Pairresult)
            .values({
                id: uuidv4(),
                pairId: pairId,
                playerId: { _id: playerId },
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

            const updateResult = await this.dataSource.createQueryBuilder()
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

    async updateStatusGame(pairId: string,
        winnerPlayer: any, loserPlayer: any): Promise<boolean | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        // await queryRunner.startTransaction()

        try {
            const updateStatus = await this.dataSource.createQueryBuilder()
                .update(Pair)
                .set({
                    finishGameDate: new Date().toISOString(),
                    status: "Finished"
                })
                .where({
                    id: pairId
                })
                .execute()

            const updatePairResultLoserPlayer = await this.dataSource.createQueryBuilder()
                .update(Pairresult)
                .set({
                    score: loserPlayer.score
                })
                .where({
                    pairId: pairId
                })
                .andWhere({
                    playerId: loserPlayer.id
                })
                .execute()

            const updatePairResultWinnerPlayer = await this.dataSource.createQueryBuilder()
                .update(Pairresult)
                .set({
                    score: winnerPlayer.score
                })
                .where({
                    pairId: pairId
                })
                .andWhere({
                    playerId: winnerPlayer.id
                })
                .execute()

            if (winnerPlayer.score === loserPlayer.score) {
                const addAndUpdateStatisticWinner = await this.dataSource.createQueryBuilder()
                    .update(Statistic)
                    .set({
                        score: () => `score + ${winnerPlayer.score}`,
                        drawcount: () => "drawcount + 1",
                    })
                    .where({ userId: winnerPlayer.id })
                    .execute()

                const addAndUpdateStatisticLoser = await this.dataSource.createQueryBuilder()
                    .update(Statistic)
                    .set({
                        score: () => `score + ${loserPlayer.score}`,
                        drawcount: () => "drawcount + 1",
                    })
                    .where({ userId: loserPlayer.id })
                    .execute()
                return true
            }

            const addAndUpdateStatisticWinner = await this.dataSource.createQueryBuilder()
                .update(Statistic)
                .set({
                    score: () => `score + ${winnerPlayer.score}`,
                    winsCount: () => `winsCount + 1`,
                })
                .where({ userId: winnerPlayer.id })
                .execute()

            const addAndUpdateStatisticLoser = await this.dataSource.createQueryBuilder()
                .update(Statistic)
                .set({
                    score: () => `score + ${loserPlayer.score}`,
                    lossesCount: () => `lossesCount + 1`,
                })
                .where({ userId: loserPlayer.id })
                .execute()
            //await queryRunner.commitTransaction()
            return true
        } catch (e) {
            // await queryRunner.rollbackTransaction()
            return null
        } finally {
            // await queryRunner.release()
        }
    }

    async deleteAll() {
        const resultTwo = await this.dataSource.createQueryBuilder()
            .delete()
            .from(Pairresult)
            .execute()
        const resultThree = await this.dataSource.createQueryBuilder()
            .delete()
            .from(Statistic)
            .execute()

        const result = await this.dataSource.createQueryBuilder()
            .delete()
            .from(Pair)
            .execute()

        return true
    }

}
