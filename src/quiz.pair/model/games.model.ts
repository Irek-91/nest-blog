import { IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Strategy } from 'passport-local';

export class AnswerInputModel {
    @IsString()
    answer: string
}

export type playerViewModel = {
    id: string | Types.ObjectId,
    login: string
}

enum answerStatus {
    'Correct',
    'Incorrect',
}
export type answerViewModel = {
    questionId: string,
    answerStatus: string
    addedAt: string
}



export type gamePlayerProgressViewModel = {
    answers: answerViewModel[],
    player: playerViewModel,
    score: number
}
export type questionPairViewModel = {
    id: string,
    body: string
}


enum statusGame {
    'PendingSecondPlayer', 'Active', 'Finished'
}

export type gamePairViewModel = {
    id: string,
    firstPlayerProgress: gamePlayerProgressViewModel,
    secondPlayerProgress: gamePlayerProgressViewModel | null,
    questions: questionPairViewModel[] | null,
    status: string,
    pairCreatedDate: string,
    startGameDate: string | null,
    finishGameDate: string | null
}

export type gameAllPairsViewModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: gamePairViewModel[] | []
}

export type topGamePlayerViewModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: userStatisticViewModel[] | []
}

export type userStatisticViewModel = {
    sumScore: number,
    avgScores: number,
    gamesCount: number,
    winsCount: number,
    lossesCount: number,
    drawsCount: number, 
    player: {
        id: string,
        login: string
    }
  }



export type gamePairDBModel = {
    id: string,
    firstPlayerId: string,
    secondPlayerId: string | null,
    pairCreatedDate: string,
    startGameDate: string | null,
    finishGameDate: string | null
}

export type myStatisticViewModel = {
    sumScore: number,
    avgScores: number,
    gamesCount: number,
    winsCount: number,
    lossesCount: number,
    drawsCount: number
  }