import { QusetionsService } from './../../../quiz.questions/application/questions.service';
import { PairGameService } from './../pair.game.service';
import { PairGameRepo } from './../../dv-psql/pair.game.repo';
import { PairGameQueryRepo } from './../../dv-psql/pair.game.query.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerInputModel, answerViewModel } from './../../model/games.model';


export class SendAnswerCommand {
    constructor(public inputDate: AnswerInputModel, public userId :string) {

    }
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCase implements ICommandHandler<SendAnswerCommand> {
    constructor(private pairGameQueryRepo: PairGameQueryRepo, 
        private pairGameRepo:PairGameRepo,
        private pairGameService: PairGameService,
        private qusetionsService: QusetionsService) {
    }
    async execute(command: SendAnswerCommand): Promise<answerViewModel | null | 403> {
        const answer = command.inputDate.answer
        const playerId = command.userId
        
        const pair = await this.pairGameQueryRepo.getPairMyCurrent(playerId)

        if (!pair || !pair.startGameDate) {
            return 403
        }

        const resultPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, playerId)
        if (resultPlayer!.answersStatus.length >= 5) {
            return 403
        }
        const numberQusetion = resultPlayer!.answersAddedAt.length
        const questionId = pair.questionsId[numberQusetion]

        const resultAnswer = await this.qusetionsService.checkingCorrectAnswer(questionId, answer)
        let statusAnswer = 'Correct'
        let countByAnswer = 1
        if (resultAnswer === false) {
            statusAnswer = 'Incorrect'
            countByAnswer = 0
        }
        const updateResultAnswer = await this.pairGameRepo.updateResultAnswer(pair.id, questionId, playerId, statusAnswer, countByAnswer)

        const resultUpdateFirstPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, pair.firstPlayerId)
        const resultUpdateSecondPlayer = await this.pairGameQueryRepo.getResultPairsByPlayerId(pair.id, pair.secondPlayerId)

        if (resultUpdateFirstPlayer!.answersAddedAt.length === 5 && resultUpdateSecondPlayer!.answersAddedAt.length === 5) {
            let scoreOne = resultUpdateFirstPlayer!.score
            let scoreTwo = resultUpdateSecondPlayer!.score
            const updateStatusByPair = await this.pairGameRepo.updateStatusByPair(pair.id)

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
            }//бонусный бал

            let winnerPlayer = {
                id: pair.firstPlayerId,
                score: scoreOne
            }

            let loserPlayer = {
                id: pair.secondPlayerId,
                score: scoreTwo
            }

            if (scoreTwo > scoreOne) {
                winnerPlayer = {
                    id: pair.secondPlayerId,
                    score: scoreTwo
                }
                loserPlayer = {
                    id: pair.firstPlayerId,
                    score: scoreOne
                }
            }

            if (scoreTwo !== scoreOne) {
                const updateDateFinish = await this.pairGameRepo.updateStatusGame(pair.id, winnerPlayer, loserPlayer)
            }
            if (scoreTwo === scoreOne) {
                const updateDateFinish = await this.pairGameRepo.resultUpdateIsAdraw(pair.id, winnerPlayer, loserPlayer)
            }
        }
        // if (resultUpdateFirstPlayer!.answersAddedAt.length === 5 && resultUpdateSecondPlayer!.answersAddedAt.length !== 5) {
        //     setTimeout(()=> {
        //         chekAnswer(pair.id, pair.firstPlayerId, this.pairGameRepo, this.pairGameQueryRepo)
        //     }, 10000);
        // }
        // if (resultUpdateFirstPlayer!.answersAddedAt.length !== 5 && resultUpdateSecondPlayer!.answersAddedAt.length === 5) {
        //     setTimeout(()=> {
        //         chekAnswer(pair.id, pair.secondPlayerId, this.pairGameRepo, this.pairGameQueryRepo)
        //     }, 10000);
        // }

        return updateResultAnswer
    }

}