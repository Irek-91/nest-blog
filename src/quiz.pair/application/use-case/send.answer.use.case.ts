import { QusetionsService } from './../../../quiz.questions/application/questions.service';
import { PairGameService } from './../pair.game.service';
import { PairGameRepo } from './../../dv-psql/pair.game.repo';
import { PairGameQueryRepo } from './../../dv-psql/pair.game.query.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerInputModel, answerViewModel } from './../../model/games.model';
import { Cron } from '@nestjs/schedule';
import { log } from 'console';


export class SendAnswerCommand {
    constructor(public inputDate: AnswerInputModel, public userId: string) {

    }
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCase implements ICommandHandler<SendAnswerCommand> {
    constructor(private pairGameQueryRepo: PairGameQueryRepo,
        private pairGameRepo: PairGameRepo,
        private pairGameService: PairGameService,
        private qusetionsService: QusetionsService) {
    }
    async execute(command: SendAnswerCommand): Promise<answerViewModel | null | 403> {
        const answer = command.inputDate.answer
        const playerId = command.userId

        const pair = await this.pairGameQueryRepo.getPairMyCurrent(playerId)

        if (!pair || !pair.startGameDate) {
            return 403//ошибка..
        }  //27-32

        const resultPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, playerId)
        if (resultPlayer!.answersStatus.length >= 5) {
            return 403
        } 
        const numberQusetion = resultPlayer!.answersAddedAt.length
        const questionId = pair.questionsId[numberQusetion]

        const resultAnswer = await this.qusetionsService.checkingCorrectAnswer(questionId, answer) //проверяем ответ, если правильно то true
        let statusAnswer = 'Correct'//enum
        let countByAnswer = 1
        if (resultAnswer === false) {
            statusAnswer = 'Incorrect'
            countByAnswer = 0
        }
        const updateResultAnswer = await this.pairGameRepo.updateResultAnswer(pair.id, questionId, playerId, statusAnswer, countByAnswer)

        const resultUpdateFirstPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, pair.firstPlayerId)
        const resultUpdateSecondPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, pair.secondPlayerId)
//38-51

        if (resultUpdateFirstPlayer!.answersAddedAt.length === 5 || resultUpdateSecondPlayer!.answersAddedAt.length === 5) {
            setTimeout(async () => {
                const resPair = await this.pairGameQueryRepo.getPairById(pair.id)
                const resultFirstPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(resPair!.id, pair!.firstPlayerId)
                const resultSecondPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(resPair!.id, pair!.secondPlayerId)

                while (resultFirstPlayer!.answersStatus.length < 5) {
                    resultFirstPlayer!.answersStatus.push('Incorrect')
                    resultFirstPlayer!.answersAddedAt.push(`${(new Date()).toISOString()}`)
                }

                while (resultSecondPlayer!.answersStatus.length < 5) {
                    resultSecondPlayer!.answersStatus.push('Incorrect')
                    resultSecondPlayer!.answersAddedAt.push(`${(new Date()).toISOString()}`)
                }

                const updateResultFirstPlayer = await this.pairGameRepo.
                    updateResultFinish(resPair!.id, pair!.firstPlayerId, resultFirstPlayer!.answersStatus, resultFirstPlayer!.answersAddedAt)
                const updateResultSecondPlayer = await this.pairGameRepo.
                    updateResultFinish(resPair!.id, pair!.secondPlayerId, resultSecondPlayer!.answersStatus, resultSecondPlayer!.answersAddedAt)
                const updateStatusByPair = await this.pairGameRepo.updateStatusByPair(resPair!.id)

                const resultFinishFirstPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(resPair!.id, pair!.firstPlayerId)
                const resultFinishSecondPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(resPair!.id, pair!.secondPlayerId)


                let scoreOne = 0
                let scoreTwo = 0

                scoreOne = resultFinishFirstPlayer!.answersStatus.reduce(function (accumulator, item) {
                    if (item === 'Correct') {
                        accumulator++
                    }
                    return accumulator
                }, 0)//

                scoreTwo = resultFinishSecondPlayer!.answersStatus.reduce(function (accumulator, item) {
                    if (item === 'Correct') {
                        accumulator++
                    }
                    return accumulator
                }, 0)



                const answersAddedAtOne = resultFinishFirstPlayer!.answersAddedAt[4] //время последнего ответа пользователя 1
                const answersAddedAtTwo = resultFinishSecondPlayer!.answersAddedAt[4] //время последнего ответа пользователя 2

                if (resultFinishFirstPlayer!.answersStatus.includes('Correct')) {
                    if (new Date(answersAddedAtOne) < new Date(answersAddedAtTwo)) {
                        scoreOne++
                    }
                } //бонусный бал

                if (resultFinishSecondPlayer!.answersStatus.includes('Correct')) {
                    if (new Date(answersAddedAtOne) > new Date(answersAddedAtTwo)) {
                        scoreTwo++
                    }
                }//бонусный бал

                let winnerPlayer = {
                    id: pair!.firstPlayerId,
                    score: scoreOne
                }

                let loserPlayer = {
                    id: pair!.secondPlayerId,
                    score: scoreTwo
                }

                if (scoreTwo > scoreOne) {
                    winnerPlayer = {
                        id: pair!.secondPlayerId,
                        score: scoreTwo
                    }
                    loserPlayer = {
                        id: pair!.firstPlayerId,
                        score: scoreOne
                    }
                }

                if (scoreTwo !== scoreOne) {
                    const updateDateFinish = await this.pairGameRepo.updateStatusGame(resPair!.id, winnerPlayer, loserPlayer)
                }
                if (scoreTwo === scoreOne) {
                    const updateDateFinish = await this.pairGameRepo.resultUpdateIsAdraw(resPair!.id, winnerPlayer, loserPlayer)
                }
            }, 10000)
        }

        return updateResultAnswer
    }

}