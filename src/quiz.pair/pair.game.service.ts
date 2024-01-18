import { queryPaginationPairsType, queryPaginationTopUsersType } from './../helpers/query-filter';
import { QusetionsService } from './../quiz.questions/questions.service';
import { PairGameRepo } from './dv-psql/pair.game.Repo';
import { gamePairViewModel, gamePairDBModel, questionPairViewModel, answerViewModel, gamePlayerProgressViewModel, gameAllPairsViewModel, myStatisticViewModel, topGamePlayerViewModel } from './model/games.model';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { log } from 'node:console';
import { v4 as uuidv4 } from 'uuid';
import { Pair } from './dv-psql/entity/pairs';
import { UsersService } from '../users/users.service';


@Injectable()

export class PairGameService {

    constructor(protected pairGameRepo: PairGameRepo,
        protected userService: UsersService,
        protected qusetionsService: QusetionsService
    ) { }
    async getPairMuCurrent(userIdOne: string): Promise<gamePairViewModel | null> {

        const pair = await this.pairGameRepo.getPairMyCurrent(userIdOne)
        if (!pair) {
            return null
        }
        const result = await this.getPairMuCurrentViewModel(userIdOne, pair.id)
        return result
    }

    async getAllPairsByUser(queryFilter: queryPaginationPairsType, userId: string): Promise<gameAllPairsViewModel | null> {
        const pairs = await this.pairGameRepo.getAllPairsByUser(userId, queryFilter)
        if (!pairs) {
            return null
        }
        const pagesCount = Math.ceil(pairs.length / queryFilter.pageSize)

        let result: any = await Promise.all(pairs.map(async (p) => {
            return await this.getPairMuCurrentViewModel(userId, p.id)
        }))
        if (!result) {
            result = []
        }


        return {
            pagesCount: pagesCount,
            page: queryFilter.pageNumber,
            pageSize: queryFilter.pageSize,
            totalCount: pairs.length,
            items: result
        }

    }
    async getTopUsers(queryFilter: queryPaginationTopUsersType): Promise<topGamePlayerViewModel> {
        const result = await this.pairGameRepo.getTopUsers(queryFilter)
        const pagesCount = Math.ceil(result.length / queryFilter.pageSize)

        
        return {
            pagesCount: pagesCount,
            page: queryFilter.pageNumber,
            pageSize: queryFilter.pageSize,
            totalCount: result.length,
            items: result
        }


    }

    async getStatisticByUser(userId: string): Promise<myStatisticViewModel> {
        const result = await this.pairGameRepo.getStatisticByUser(userId)
        if (!result) {
            return {
                sumScore: 0,
                avgScores: 0,
                gamesCount: 0,
                winsCount: 0,
                lossesCount: 0,
                drawsCount: 0
            }
        }
        function roundUp(num, precision) {
            precision = Math.pow(10, precision)
            return Math.ceil(num * precision) / precision
          }
        const gamesCount = result.winsCount + result.lossesCount + result.drawcount
        const avgScores = roundUp(result.score / gamesCount, 2)
        return {
            sumScore: result.score,
            avgScores: avgScores,
            gamesCount: gamesCount,
            winsCount: result.winsCount,
            lossesCount: result.lossesCount,
            drawsCount: result.drawcount
        }

    }



    async getPairMuCurrentViewModel(userIdOne: string, pairId: string): Promise<gamePairViewModel | null> {

        const pair = await this.pairGameRepo.getPairByIdAndUserId(userIdOne, pairId)
        if (!pair) {
            return null
        }

        if (pair.secondPlayerId === null) {

            const resultOnePlayer = await this.pairGameRepo.getResultPairsByPlayerId(pair.id, userIdOne)
            const userOne = await this.userService.findByUserId(userIdOne)
            const answersOne = []
            const firstPlayerProgress = {
                answers: answersOne,
                player: {
                    id: userOne.userId,
                    login: userOne.login
                },
                score: resultOnePlayer!.score,
            }
            const status = 'PendingSecondPlayer'
            const secondPlayerProgress = null
            const questions = null

            const result: gamePairViewModel = {
                id: pair.id,
                firstPlayerProgress: firstPlayerProgress,
                secondPlayerProgress: secondPlayerProgress,
                questions: questions,
                status: pair.status,
                pairCreatedDate: pair.pairCreatedDate,
                startGameDate: pair.startGameDate,
                finishGameDate: pair.finishGameDate
            }
            return result

        } else {
            const resultPlayerOne = await this.pairGameRepo.getResultPairsByPlayerId(pair.id, pair.firstPlayerId)
            const userOne = await this.userService.findByUserId(pair.firstPlayerId)
            const answersOne = await this.pairGameRepo.getAnswersByPlayerId(pair.firstPlayerId, pair.id)
            const firstPlayerProgress = {
                answers: answersOne!,
                player: {
                    id: userOne.userId,
                    login: userOne.login
                },
                score: resultPlayerOne!.score,
            }

            const resultPlayerTwo = await this.pairGameRepo.getResultPairsByPlayerId(pair.id, pair.secondPlayerId)
            const userTwo = await this.userService.findByUserId(pair.secondPlayerId)
            const answersTwo = await this.pairGameRepo.getAnswersByPlayerId(pair.secondPlayerId, pair.id)
            const secondPlayerProgress = {
                answers: answersTwo!,
                player: {
                    id: userTwo.userId,
                    login: userTwo.login
                },
                score: resultPlayerTwo!.score,
            }
            const questions = await this.pairGameRepo.getQuestionsByPair(pair.id)

            let status = 'Active'
            if (pair.finishGameDate !== null) {
                status = 'Finished'
            }


            const result: gamePairViewModel = {
                id: pair.id,
                firstPlayerProgress: firstPlayerProgress,
                secondPlayerProgress: secondPlayerProgress,
                questions: questions,
                status: pair.status,
                pairCreatedDate: pair.pairCreatedDate,
                startGameDate: pair.startGameDate,
                finishGameDate: pair.finishGameDate
            }
            return result

        }

    }


    async getPairById(pairId: string, userId: string): Promise<gamePairViewModel | null> {

        const pair = await this.pairGameRepo.getPairById(pairId)
        if (!pair) {
            return null
        }
        const result = await this.getPairMuCurrentViewModel(userId, pairId)

        if (pair.firstPlayerId === userId) {
            return result
        }
        if (pair.secondPlayerId === userId) {
            return result
        }
        else {
            throw new HttpException('If current user tries to get pair in which user is not participant', HttpStatus.FORBIDDEN)

        }


    }
    async createNewStatisticByPalyer(userId: string): Promise<boolean> {
        const statistic = await this.pairGameRepo.getStatisticByUser(userId)
        if (statistic) {
            return true
        }
        const newStatistic = await this.pairGameRepo.createNewStatistic(userId)
        return newStatistic
    }

    async connectUserByPair(userId: string): Promise<gamePairViewModel | null> {
        const pair = await this.pairGameRepo.getPairMyCurrent(userId)
        if (pair !== null && pair.finishGameDate === null && (pair.firstPlayerId === userId || pair.secondPlayerId === userId)) {
            throw new HttpException('If current user is already participating in active pair', HttpStatus.FORBIDDEN)
        }


        const secondPlayerPair = await this.pairGameRepo.getPairWhereSecondPlayerNull()
        if (!secondPlayerPair) {
            const newPairId = await this.pairGameRepo.createNewPair(userId)
            const result = await this.getPairMuCurrentViewModel(userId, newPairId)
            return result
        } else {
            const addPlayerInPairId = await this.pairGameRepo.addPlayerInPair(userId, secondPlayerPair.id)
            const result = await this.getPairMuCurrentViewModel(userId, addPlayerInPairId)
            return result
        }
    }


    async sendAnswer(answer: string, playerId: string): Promise<answerViewModel | null | 403> {
        const pair = await this.pairGameRepo.getPairMyCurrent(playerId)

        if (!pair || !pair.startGameDate) {
            return 403
        }


        const resultPlayer = await this.pairGameRepo.getResultPairsByPlayerId(pair.id, playerId)
        if (resultPlayer!.answersStatus.length >= 5) {
            return 403
        }
        const numberQusetion = resultPlayer!.answersAddedAt.length
        const questionId = pair.questionsId[numberQusetion]
        
        const resultAnswer = await this.qusetionsService.checkingCorrectAnswer(questionId, answer)
        const updateResultAnswer = await this.pairGameRepo.updateResultAnswer(pair.id, questionId, playerId, resultAnswer)
        
        const resultUpdateFirstPlayer = await this.pairGameRepo.getResultPairsByPlayerId(pair.id, pair.firstPlayerId)
        const resultUpdateSecondPlayer = await this.pairGameRepo.getResultPairsByPlayerId(pair.id, pair.secondPlayerId)


        if (resultUpdateFirstPlayer!.answersAddedAt.length === 5 && resultUpdateSecondPlayer!.answersAddedAt.length === 5) {
            let scoreOne = resultUpdateFirstPlayer!.score
            let scoreTwo = resultUpdateSecondPlayer!.score

            const answersAddedAtOne = resultUpdateFirstPlayer!.answersAddedAt[4] //время последнего ответа пользователя 1
            const answersAddedAtTwo = resultUpdateSecondPlayer!.answersAddedAt[4] //время последнего ответа пользователя 2
            
            if (resultUpdateFirstPlayer!.answersStatus.includes('Correct')) {
                if (new Date(answersAddedAtOne) < new Date(answersAddedAtTwo)) {
                    scoreOne++
                }
            } //бонусный бал

            if (resultUpdateSecondPlayer!.answersStatus.includes('Correct')) {
                if (new Date(answersAddedAtOne) > new Date(answersAddedAtTwo)) {
                    scoreTwo++
                }
            }
            

            let winnerPlayer = {
                id: pair.firstPlayerId,
                score: scoreOne
            }

            let loserPlayer = {
                id: pair.secondPlayerId,
                score: scoreTwo
            }

            if (scoreTwo > scoreOne) {

                let winnerPlayer = {
                    id: pair.secondPlayerId,
                    score: scoreTwo
                }

                let loserPlayer = {
                    id: pair.firstPlayerId,
                    score: scoreOne
                }
            }

            const updateDateFinish = await this.pairGameRepo.updateStatusGame(pair.id, winnerPlayer, loserPlayer)


        }
        
        return updateResultAnswer
    }

}