import { chekAnswer } from '../../helpers/chekAnswer';
import { queryPaginationPairsType, queryPaginationTopUsersType } from '../../helpers/query-filter';
import { QusetionsService } from '../../quiz.questions/application/questions.service';
import { PairGameRepo } from '../dv-psql/pair.game.repo';
import { gamePairViewModel, gamePairDBModel, questionPairViewModel, answerViewModel, gamePlayerProgressViewModel, gameAllPairsViewModel, myStatisticViewModel, topGamePlayerViewModel } from '../model/games.model';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { log } from 'node:console';
import { v4 as uuidv4 } from 'uuid';
import { Pair } from '../dv-psql/entity/pairs';
import { UsersService } from '../../users/application/users.service';
import { PairGameQueryRepo } from '../dv-psql/pair.game.query.repo';


@Injectable()

export class PairGameService {

    constructor(protected pairGameRepo: PairGameRepo,
        protected pairGameQueryRepo: PairGameQueryRepo,
        protected userService: UsersService,
        protected qusetionsService: QusetionsService
    ) { }

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

}