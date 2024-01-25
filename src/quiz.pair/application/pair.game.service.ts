import { chekAnswer } from '../../helpers/chekAnswer';
import { queryPaginationPairsType, queryPaginationTopUsersType } from '../../helpers/query-filter';
import { QusetionsService } from '../../quiz.questions/application/questions.service';
import { PairGameRepo } from '../dv-psql/pair.game.Repo';
import { gamePairViewModel, gamePairDBModel, questionPairViewModel, answerViewModel, gamePlayerProgressViewModel, gameAllPairsViewModel, myStatisticViewModel, topGamePlayerViewModel } from '../model/games.model';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { log } from 'node:console';
import { v4 as uuidv4 } from 'uuid';
import { Pair } from '../dv-psql/entity/pairs';
import { UsersService } from '../../users/users.service';
import { PairGameQueryRepo } from '../dv-psql/pair.game.query.repo';


@Injectable()

export class PairGameService {

    constructor(protected pairGameRepo: PairGameRepo,
        protected pairGameQueryRepo: PairGameQueryRepo,
        protected userService: UsersService,
        protected qusetionsService: QusetionsService
    ) { }
    // async getPairMyCurrent(userIdOne: string): Promise<gamePairViewModel | null> {

    //     const pair = await this.pairGameQueryRepo.getPairMyCurrent(userIdOne)
    //     if (!pair) {
    //         return null
    //     }
    //     const result = await this.getPairMuCurrentViewModel(userIdOne, pair.id)
    //     return result
    // }

    // async getAllPairsByUser(queryFilter: queryPaginationPairsType, userId: string): Promise<gameAllPairsViewModel | null> {
    //     const pairs = await this.pairGameQueryRepo.getAllPairsByUser(userId, queryFilter)
    //     if (!pairs) {
    //         return null
    //     }
    //     const pagesCount = Math.ceil(pairs.length / queryFilter.pageSize)

    //     let result: any = await Promise.all(pairs.map(async (p) => {
    //         return await this.getPairMuCurrentViewModel(userId, p.id)
    //     }))
    //     if (!result) {
    //         result = []
    //     }


    //     return {
    //         pagesCount: pagesCount,
    //         page: queryFilter.pageNumber,
    //         pageSize: queryFilter.pageSize,
    //         totalCount: pairs.length,
    //         items: result
    //     }

    // }
    // async getTopUsers(queryFilter: queryPaginationTopUsersType): Promise<topGamePlayerViewModel> {
    //     const result = await this.pairGameQueryRepo.getTopUsers(queryFilter)
    //     const totalCount = await this.pairGameQueryRepo.getAllStatisticByUsers()
    //     const pagesCount = Math.ceil(totalCount!.length / queryFilter.pageSize)


    //     return {
    //         pagesCount: pagesCount,
    //         page: queryFilter.pageNumber,
    //         pageSize: queryFilter.pageSize,
    //         totalCount: totalCount!.length,
    //         items: result
    //     }


    // }

    // async getStatisticByUser(userId: string): Promise<myStatisticViewModel> {
    //     const result = await this.pairGameQueryRepo.getStatisticByUser(userId)
    //     if (!result) {
    //         return {
    //             sumScore: 0,
    //             avgScores: 0,
    //             gamesCount: 0,
    //             winsCount: 0,
    //             lossesCount: 0,
    //             drawsCount: 0
    //         }
    //     }
    //     function roundUp(num, precision) {
    //         precision = Math.pow(10, precision)
    //         return Math.ceil(num * precision) / precision
    //     }
    //     const gamesCount = (+result.winsCount) + (+result.lossesCount) + (+result.drawcount)
    //     const avgScores = roundUp(+result.sumScore / gamesCount, 2)
    //     return {
    //         sumScore: +result.sumScore,
    //         avgScores: avgScores,
    //         gamesCount: gamesCount,
    //         winsCount: +result.winsCount,
    //         lossesCount: +result.lossesCount,
    //         drawsCount: +result.drawcount
    //     }

    // }



    async getPairMuCurrentViewModel(userIdOne: string, pairId: string): Promise<gamePairViewModel | null> {

        const pair = await this.pairGameQueryRepo.getPairByIdAndUserId(userIdOne, pairId)
        if (!pair) {
            return null
        }

        if (pair.secondPlayerId === null) {

            const resultOnePlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, userIdOne)
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
            const resultPlayerOne = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, pair.firstPlayerId)
            const userOne = await this.userService.findByUserId(pair.firstPlayerId)
            const answersOne = await this.pairGameQueryRepo.getAnswersByPlayerId(pair.firstPlayerId, pair.id)
            const firstPlayerProgress = {
                answers: answersOne!,
                player: {
                    id: userOne.userId,
                    login: userOne.login
                },
                score: resultPlayerOne!.score,
            }

            const resultPlayerTwo = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, pair.secondPlayerId)
            const userTwo = await this.userService.findByUserId(pair.secondPlayerId)
            const answersTwo = await this.pairGameQueryRepo.getAnswersByPlayerId(pair.secondPlayerId, pair.id)
            const secondPlayerProgress = {
                answers: answersTwo!,
                player: {
                    id: userTwo.userId,
                    login: userTwo.login
                },
                score: resultPlayerTwo!.score,
            }
            const questions = await this.pairGameQueryRepo.getQuestionsByPair(pair.id)

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


    // async getPairById(pairId: string, userId: string): Promise<gamePairViewModel | null> {

    //     const pair = await this.pairGameQueryRepo.getPairById(pairId)
    //     if (!pair) {
    //         return null
    //     }
    //     const result = await this.getPairMuCurrentViewModel(userId, pairId)

    //     if (pair.firstPlayerId === userId) {
    //         return result
    //     }
    //     if (pair.secondPlayerId === userId) {
    //         return result
    //     }
    //     else {
    //         throw new HttpException('If current user tries to get pair in which user is not participant', HttpStatus.FORBIDDEN)

    //     }
    // }
    // async createNewStatisticByPalyer(userId: string): Promise<boolean> {
    //     const statistic = await this.pairGameQueryRepo.getStatisticByUser(userId)
    //     if (statistic !== null) {
    //         return true
    //     }
    //     const newStatistic = await this.pairGameRepo.createNewStatistic(userId)
    //     return newStatistic
    // }

    // async connectUserByPair(userId: string): Promise<gamePairViewModel | null> {
    //     const pair = await this.pairGameQueryRepo.getPairMyCurrent(userId)
    //     if (pair !== null && pair.finishGameDate === null && (pair.firstPlayerId === userId || pair.secondPlayerId === userId)) {
    //         throw new HttpException('If current user is already participating in active pair', HttpStatus.FORBIDDEN)
    //     }

    //     const secondPlayerPair = await this.pairGameQueryRepo.getPairWhereSecondPlayerNull()
    //     if (!secondPlayerPair) {
    //         const newPairId = await this.pairGameRepo.createNewPair(userId)
    //         const result = await this.getPairMuCurrentViewModel(userId, newPairId!)
    //         return result
    //     } else {
    //         const addPlayerInPairId = await this.pairGameRepo.addPlayerInPair(userId, secondPlayerPair.id)
    //         const result = await this.getPairMuCurrentViewModel(userId, addPlayerInPairId!)
    //         return result
    //     }
    // }


    // async sendAnswer(answer: string, playerId: string): Promise<answerViewModel | null | 403> {
    //     const pair = await this.pairGameQueryRepo.getPairMyCurrent(playerId)

    //     if (!pair || !pair.startGameDate) {
    //         return 403
    //     }

    //     const resultPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, playerId)
    //     if (resultPlayer!.answersStatus.length >= 5) {
    //         return 403
    //     }
    //     const numberQusetion = resultPlayer!.answersAddedAt.length
    //     const questionId = pair.questionsId[numberQusetion]

    //     const resultAnswer = await this.qusetionsService.checkingCorrectAnswer(questionId, answer)
    //     let statusAnswer = 'Correct'
    //     let countByAnswer = 1
    //     if (resultAnswer === false) {
    //         statusAnswer = 'Incorrect'
    //         countByAnswer = 0
    //     }
    //     const updateResultAnswer = await this.pairGameRepo.updateResultAnswer(pair.id, questionId, playerId, statusAnswer, countByAnswer)

    //     const resultUpdateFirstPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, pair.firstPlayerId)
    //     const resultUpdateSecondPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, pair.secondPlayerId)

    //     if (resultUpdateFirstPlayer!.answersAddedAt.length === 5 || resultUpdateSecondPlayer!.answersAddedAt.length === 5) {
    //         setTimeout(async () => {
    //             const resPair = await this.pairGameQueryRepo.getPairById(pair.id)
    //             const resultFirstPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(resPair!.id, pair!.firstPlayerId)
    //             const resultSecondPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(resPair!.id, pair!.secondPlayerId)
    //             if (resultFirstPlayer!.answersStatus.length !== 5) {
    //                 while (resultFirstPlayer!.answersStatus.length < 5) {
    //                     resultFirstPlayer!.answersStatus.push('Incorrect')
    //                     resultFirstPlayer!.answersAddedAt.push(`${(new Date()).toISOString()}`)
    //                 }

    //             }
    //             if (resultSecondPlayer!.answersStatus.length !== 5) {
    //                 while (resultSecondPlayer!.answersStatus.length < 5) {
    //                     resultSecondPlayer!.answersStatus.push('Incorrect')
    //                     resultSecondPlayer!.answersAddedAt.push(`${(new Date()).toISOString()}`)
    //                 }
    //             }
    //             const updateResultFirstPlayer = await this.pairGameRepo.
    //                 updateResultFinish(resPair!.id, pair!.firstPlayerId, resultFirstPlayer!.answersStatus, resultFirstPlayer!.answersAddedAt)
    //             const updateResultSecondPlayer = await this.pairGameRepo.
    //                 updateResultFinish(resPair!.id, pair!.secondPlayerId, resultSecondPlayer!.answersStatus, resultSecondPlayer!.answersAddedAt)
    //             const updateStatusByPair = await this.pairGameRepo.updateStatusByPair(resPair!.id)

    //             const resultFinishFirstPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(resPair!.id, pair!.firstPlayerId)
    //             const resultFinishSecondPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(resPair!.id, pair!.secondPlayerId)


    //             let scoreOne = 0
    //             let scoreTwo = 0

    //             const answersAddedAtOne = resultFinishFirstPlayer!.answersAddedAt[4] //время последнего ответа пользователя 1
    //             const answersAddedAtTwo = resultFinishSecondPlayer!.answersAddedAt[4] //время последнего ответа пользователя 2

    //             if (resultFinishFirstPlayer!.answersStatus.includes('Correct')) {
    //                 scoreOne++
    //                 if (new Date(answersAddedAtOne) < new Date(answersAddedAtTwo)) {
    //                     scoreOne++
    //                 }
    //             } //бонусный бал

    //             if (resultFinishSecondPlayer!.answersStatus.includes('Correct')) {
    //                 scoreTwo++
    //                 if (new Date(answersAddedAtOne) > new Date(answersAddedAtTwo)) {
    //                     scoreTwo++
    //                 }
    //             }//бонусный бал

    //             let winnerPlayer = {
    //                 id: pair!.firstPlayerId,
    //                 score: scoreOne
    //             }

    //             let loserPlayer = {
    //                 id: pair!.secondPlayerId,
    //                 score: scoreTwo
    //             }

    //             if (scoreTwo > scoreOne) {
    //                 winnerPlayer = {
    //                     id: pair!.secondPlayerId,
    //                     score: scoreTwo
    //                 }
    //                 loserPlayer = {
    //                     id: pair!.firstPlayerId,
    //                     score: scoreOne
    //                 }
    //             }

    //             if (scoreTwo !== scoreOne) {
    //                 const updateDateFinish = await this.pairGameRepo.updateStatusGame(resPair!.id, winnerPlayer, loserPlayer)
    //             }
    //             if (scoreTwo === scoreOne) {
    //                 const updateDateFinish = await this.pairGameRepo.resultUpdateIsAdraw(resPair!.id, winnerPlayer, loserPlayer)
    //             }
    //         }, 10000);
    //     }
    //     if (resultUpdateFirstPlayer!.answersAddedAt.length === 5 && resultUpdateSecondPlayer!.answersAddedAt.length === 5) {
    //         let scoreOne = resultUpdateFirstPlayer!.score
    //         let scoreTwo = resultUpdateSecondPlayer!.score
    //         const updateStatusByPair = await this.pairGameRepo.updateStatusByPair(pair.id)

    //         const answersAddedAtOne = resultUpdateFirstPlayer!.answersAddedAt[4] //время последнего ответа пользователя 1
    //         const answersAddedAtTwo = resultUpdateSecondPlayer!.answersAddedAt[4] //время последнего ответа пользователя 2

    //         if (resultUpdateFirstPlayer!.answersStatus.includes('Correct')) {
    //             if (new Date(answersAddedAtOne) < new Date(answersAddedAtTwo)) {
    //                 scoreOne++
    //             }
    //         } //бонусный бал

    //         if (resultUpdateSecondPlayer!.answersStatus.includes('Correct')) {
    //             if (new Date(answersAddedAtOne) > new Date(answersAddedAtTwo)) {
    //                 scoreTwo++
    //             }
    //         }//бонусный бал

    //         let winnerPlayer = {
    //             id: pair.firstPlayerId,
    //             score: scoreOne
    //         }

    //         let loserPlayer = {
    //             id: pair.secondPlayerId,
    //             score: scoreTwo
    //         }

    //         if (scoreTwo > scoreOne) {
    //             winnerPlayer = {
    //                 id: pair.secondPlayerId,
    //                 score: scoreTwo
    //             }
    //             loserPlayer = {
    //                 id: pair.firstPlayerId,
    //                 score: scoreOne
    //             }
    //         }

    //         if (scoreTwo !== scoreOne) {
    //             const updateDateFinish = await this.pairGameRepo.updateStatusGame(pair.id, winnerPlayer, loserPlayer)
    //         }
    //         if (scoreTwo === scoreOne) {
    //             const updateDateFinish = await this.pairGameRepo.resultUpdateIsAdraw(pair.id, winnerPlayer, loserPlayer)
    //         }
    //     }
    //     // if (resultUpdateFirstPlayer!.answersAddedAt.length === 5 && resultUpdateSecondPlayer!.answersAddedAt.length !== 5) {
    //     //     setTimeout(()=> {
    //     //         chekAnswer(pair.id, pair.firstPlayerId, this.pairGameRepo, this.pairGameQueryRepo)
    //     //     }, 10000);
    //     // }
    //     // if (resultUpdateFirstPlayer!.answersAddedAt.length !== 5 && resultUpdateSecondPlayer!.answersAddedAt.length === 5) {
    //     //     setTimeout(()=> {
    //     //         chekAnswer(pair.id, pair.secondPlayerId, this.pairGameRepo, this.pairGameQueryRepo)
    //     //     }, 10000);
    //     // }

    //     return updateResultAnswer
    // }


}