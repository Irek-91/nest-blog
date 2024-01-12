import { PairGameRepo } from './dv-psql/pairGameRepo';
import { gamePairViewModel, gamePairDBModel, questionPairViewModel } from './model/games.model';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { log } from 'node:console';
import { v4 as uuidv4 } from 'uuid';
import { Pair } from './dv-psql/entity/pairs';
import { UsersService } from 'src/users/users.service';


@Injectable()

export class PairGameService {

    constructor(protected pairGameRepo: PairGameRepo,
                protected userService: UsersService
    ) { }

    async getPairMuCurrent(userIdOne: string): Promise<gamePairViewModel | null> {

        const pair = await this.pairGameRepo.getPairMyCurrent(userIdOne)
        if (!pair) {
            return null
        }
        let secondPlayerProgress
        let questions :questionPairViewModel[] | null = null

        const resultOnePlayer = await this.pairGameRepo.getResultPairsByPlayerId(pair.firstPlayerId)
        const resultTwoPlayer = await this.pairGameRepo.getResultPairsByPlayerId(pair.secondPlayerId)
        let userOne = await this.userService.findByUserId(userIdOne)
        let userTwoId

        let status = ''
        if (!pair.secondPlayerId) {
            status = 'PendingSecondPlayer'
            secondPlayerProgress = null
            questions = null
        }
        if (!pair.finishGameDate) {
            userTwoId = pair.secondPlayerId
            status = 'Active'
        } else {
            status = 'Finished'
        }
        
        const userTwo = await this.userService.findByUserId(userTwoId)
        const answersOne = await this.pairGameRepo.getAnswersByPlayerId(userIdOne)
        const answersTwo = await this.pairGameRepo.getAnswersByPlayerId(userTwoId)
        questions = await this.pairGameRepo.getQuestionsByPair(userTwoId)
        
        secondPlayerProgress = {
            answers: answersTwo,
            player: {
                id: userTwo.userId,
                login: userTwo.login
            },
            score: resultTwoPlayer!.score,
        }



        const result: gamePairViewModel = {
            id: pair.id,
            firstPlayerProgress: {
                answers: answersOne!,
                player: {
                    id: userOne.userId,
                    login: userOne.login
                },
                score: resultOnePlayer!.score
            },
            secondPlayerProgress: secondPlayerProgress,
            questions: questions,
            status: status,
            pairCreatedDate: pair.pairCreatedDate,
            startGameDate: pair.startGameDate,
            finishGameDate: pair.finishGameDate
        }
        return result
    }


    async getPairById(pairId :string, userId: string): Promise<gamePairViewModel | null> {
        
        const pair = await this.pairGameRepo.getPairMyCurrent(userId)
        if (!pair) {
            return null
        }
        if (pair.firstPlayerId !== userId || pair.firstPlayerId !== userId) {
            throw new HttpException('If current user tries to get pair in which user is not participant', HttpStatus.FORBIDDEN)
        }

        const result = await this.getPairMuCurrent(userId)
        return result

    }

    async connectUserByPair(userId: string): Promise<gamePairViewModel | null> {
        const pair = await this.pairGameRepo.getPairMyCurrent(userId)
        
        if (pair !== null) {
            throw new HttpException('If current user tries to get pair in which user is not participant', HttpStatus.FORBIDDEN)
        }
        const resultSecondPlayer = await this.pairGameRepo.getPairWhereSecondPlayerNull()
        if (!resultSecondPlayer) {
            const newPair = await this.pairGameRepo.createNewPair(userId)
            const result = await this.getPairMuCurrent(userId)
            return result
        } else {
            const resultAddPlayerInPair = await this.pairGameRepo.addPlayerInPair(userId, resultSecondPlayer.id)
            const result = await this.getPairMuCurrent(resultSecondPlayer.firstPlayerId)
            return result
        }
    }

}