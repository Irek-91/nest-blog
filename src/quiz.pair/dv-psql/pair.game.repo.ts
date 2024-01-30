import { PairGameQueryRepo } from './pair.game.query.repo';
import { Statistic } from './entity/statistic';
import { queryPaginationPairsType, queryPaginationTopUsersType } from './../../helpers/query-filter';
import { Question } from '../../quiz.questions/db-psql/entity/question';
import { QuestionsQueryRepository } from '../../quiz.questions/db-psql/questions.query.repo';
import { answerViewModel, questionPairViewModel, userStatisticViewModel } from '../model/games.model';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull, OrderByCondition } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Pair } from './entity/pairs';
import { Pairresult } from './entity/result.pair';
import { log } from 'console';

@Injectable()

export class PairGameRepo {
    constructor(@InjectDataSource() private dataSource: DataSource,
        private questionsRepo: QuestionsQueryRepository,
        private pairGameQueryRepo: PairGameQueryRepo
    ) { }

    async addPlayerInPair(playerId: string, pairId: string): Promise<string | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager
        await queryRunner.connect()

        await queryRunner.startTransaction()
        try {
            const addPlayerPair = await manager
                .update(Pair, {
                    id: pairId
                },
                    {
                        secondPlayerId: playerId,
                        startGameDate: new Date().toISOString(),
                        status: 'Active'
                    })


            const createPesultPlayer = await manager
                .insert(Pairresult, {
                    id: uuidv4(),
                    pairId: pairId,
                    playerId: { _id: playerId },
                    answersAddedAt: [],
                    answersStatus: [],
                    score: 0
                })

            await queryRunner.commitTransaction()
            return pairId
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return null
        } finally {
            await queryRunner.release()
        }
    }


    async createNewStatistic(userId: string): Promise<boolean> {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const createPesultPlayer = await manager
                .insert(Statistic, {
                    userId: { _id: userId },
                    sumScore: 0,
                    winsCount: 0,
                    lossesCount: 0,
                    drawcount: 0
                })

            await queryRunner.commitTransaction()
            return true
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return false
        } finally {
            queryRunner.release()
        }
    }

    async createNewPair(playerId: string): Promise<string | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const pairId = uuidv4()
            const resultId = uuidv4()

            const pairCreatedDate = new Date().toISOString()
            const questions = await this.questionsRepo.getFiveRandomQuestions()
            const createNewPair = await manager
                .insert(Pair, {
                    id: pairId,
                    firstPlayerId: playerId,
                    questionsId: questions,
                    pairCreatedDate: pairCreatedDate,
                    status: 'PendingSecondPlayer'
                })


            const createPesultPlayer = await manager
                .insert(Pairresult, {
                    id: uuidv4(),
                    pairId: pairId,
                    playerId: { _id: playerId },
                    answersAddedAt: [],
                    answersStatus: [],
                    score: 0
                })

            await queryRunner.commitTransaction()
            return pairId
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return null
        } finally {
            await queryRunner.release()
        }
    }



    async updateResultAnswer(pairId: string, questionId: string, playerId: string, statusAnswer: string, countByAnswer: number): Promise<answerViewModel | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager

        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            // let status = 'Correct'
            // let count = 1
            // if (resultAnswer === false) {
            //     status = 'Incorrect'
            //     count = 0
            // }
            const newDate = new Date().toISOString()

            const resultPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pairId, playerId)
            const answersAddedAt = resultPlayer!.answersAddedAt.push(newDate)
            const answersStatus = resultPlayer!.answersStatus.push(statusAnswer)
            const score = resultPlayer!.score + countByAnswer
            let finishGameDate: string | null = null

            const updateResult = await manager
                .update(Pairresult, {
                    pairId: pairId, playerId: playerId
                },
                    {
                        answersAddedAt: resultPlayer!.answersAddedAt,
                        answersStatus: resultPlayer!.answersStatus,
                        score: score
                    }
                )

            await queryRunner.commitTransaction()
            return {
                questionId: questionId,
                answerStatus: statusAnswer,
                addedAt: newDate
            }
        } catch (e) {
            queryRunner.rollbackTransaction()
            return null
        } finally {
            queryRunner.release()
        }

    }
    async updateStatusByPair(pairId: string): Promise<boolean | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager

        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const updateStatus = await manager
                .update(Pair, {
                    id: pairId
                }, {
                    finishGameDate: new Date().toISOString(),
                    status: "Finished"
                })
            await queryRunner.commitTransaction()
            return true
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return null
        } finally {
            await queryRunner.release()
        }
    }
    async updateStatusGame(pairId: string,
        winnerPlayer: any, loserPlayer: any): Promise<boolean | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager

        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            // const updateStatus = await manager
            //     .update(Pair, {
            //         id: pairId
            //     }, {
            //         finishGameDate: new Date().toISOString(),
            //         status: "Finished"
            //     })


            // .set({
            //     finishGameDate: new Date().toISOString(),
            //     status: "Finished"
            // })
            // .where({
            //     pairId: pairId
            // })
            // .execute()


            const updatePairResultLoserPlayer = await manager
                .update(Pairresult, {
                    pairId: pairId, playerId: loserPlayer.id
                }, {
                    score: loserPlayer.score
                })
            // .set({
            //     score: loserPlayer.score
            // })
            // .where({
            //     pairId: pairId
            // })
            // .andWhere({
            //     playerId: loserPlayer.id
            // })
            // .execute()

            const updatePairResultWinnerPlayer = await manager
                .update(Pairresult, {
                    pairId: pairId, playerId: winnerPlayer.id
                }, {
                    score: winnerPlayer.score
                })
            // .set({
            //     score: winnerPlayer.score
            // })
            // .where({
            //     pairId: pairId
            // })
            // .andWhere({
            //     playerId: winnerPlayer.id
            // })
            // .execute()

            const addAndUpdateStatisticWinner = await manager
                .update(Statistic, {
                    userId: winnerPlayer.id
                }, {
                    sumScore: () => `sumScore + ${winnerPlayer.score}`,
                    winsCount: () => `winsCount + 1`
                })
            // .set({
            //     sumScore: () => `sumScore + ${winnerPlayer.score}`,
            //     winsCount: () => `winsCount + 1`,
            // })
            // .where({ userId: winnerPlayer.id })
            // .execute()

            const addAndUpdateStatisticLoser = await manager
                .update(Statistic, {
                    userId: loserPlayer.id
                }, {
                    sumScore: () => `sumScore + ${loserPlayer.score}`,
                    lossesCount: () => `lossesCount + 1`
                })
            // .set({
            //     sumScore: () => `sumScore + ${loserPlayer.score}`,
            //     lossesCount: () => `lossesCount + 1`,
            // })
            // .where({ userId: loserPlayer.id })
            // .execute()

            await queryRunner.commitTransaction()
            return true
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return null
        } finally {
            await queryRunner.release()
        }
    }
    async resultUpdateIsAdraw(pairId: string,
        playerOne: any, playerTwo: any): Promise<boolean | null> {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager

        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            // const updateStatus = await manager
            //     .update(Pair, {
            //         id: pairId
            //     }, {
            //         finishGameDate: new Date().toISOString(),
            //         status: "Finished"
            //     })
            // .set({
            //     finishGameDate: new Date().toISOString(),
            //     status: "Finished"
            // })
            // .where({
            //     id: pairId
            // })
            // .execute()

            const updatePairResultPlayerTwo = await manager
                .update(Pairresult, {
                    pairId: pairId, playerId: playerTwo.id
                }, {
                    score: playerTwo.score
                })
            // .set({
            //     score: playerTwo.score
            // })
            // .where({
            //     pairId: pairId
            // })
            // .andWhere({
            //     playerId: playerTwo.id
            // })
            // .execute()

            const updatePairResultPlayerOne = await manager
                .update(Pairresult, {
                    pairId: pairId, playerId: playerOne.id
                }, {
                    score: playerOne.score
                })
            // .set({
            //     score: playerOne.score
            // })
            // .where({
            //     pairId: pairId
            // })
            // .andWhere({
            //     playerId: playerOne.id
            // })
            // .execute()

            const addAndUpdateStatisticPlayerOne = await manager.createQueryBuilder()
                .update(Statistic)
                .set({
                    sumScore: () => `sumScore + ${playerOne.score}`,
                    drawcount: () => "drawcount + 1",
                })
                .where({ userId: playerOne.id })
                .execute()

            const addAndUpdateStatisticPlayerTwo = await manager.createQueryBuilder()
                .update(Statistic)
                .set({
                    sumScore: () => `sumScore + ${playerTwo.score}`,
                    drawcount: () => "drawcount + 1",
                })
                .where({ userId: playerTwo.id })
                .execute()
            await queryRunner.commitTransaction()
            return true
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return null
        } finally {
            await queryRunner.release()
        }
    }
    async updateResultFinish(pairId: string, playerId: string, answersStatus: string[], answersAddedAt: string[]) {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const updatePairResultPlayerTwo = await manager
                .update(Pairresult, {
                    pairId: pairId, playerId: playerId
                }, {
                    answersAddedAt: answersAddedAt,
                    answersStatus: answersStatus
                })
            return updatePairResultPlayerTwo.generatedMaps
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return null
        } finally {
            await queryRunner.release()
        }

    }
    async deleteAll() {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const resultTwo = queryRunner.manager
                .delete(Pairresult, {})

            const resultThree = await queryRunner.manager
                .delete(Statistic, {})

            const result = await queryRunner.manager
                .delete(Pair, {})

            await queryRunner.commitTransaction()
            return true
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return null
        } finally {
            await queryRunner.release()
        }
    }

}
