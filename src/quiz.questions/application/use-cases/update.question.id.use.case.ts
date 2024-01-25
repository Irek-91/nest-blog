import { QuestionsQueryRepository } from '../../db-psql/questions.query.repo';
import { QuestionsRepository } from '../../db-psql/questions.repo';
import { QuestionInputModel } from '../../model/questionModel';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"



export class UpdateQuestionIdComand {
    constructor(public inputModel: QuestionInputModel, public questionId: string) {
    }
}


@CommandHandler(UpdateQuestionIdComand)
export class UpdateQuestionIdUseCase implements ICommandHandler<UpdateQuestionIdComand> {
    constructor(protected questionsQueryRepository: QuestionsQueryRepository,
    protected questionsRepository: QuestionsRepository) {

    }
    async execute(command: UpdateQuestionIdComand): Promise<boolean> {

        const question = await this.questionsQueryRepository.getQuestiontById(command.questionId)
        if (!question) {
            return false
        }
        const updateResult = await this.questionsRepository.updateQuestionById(command.inputModel, command.questionId)
        return updateResult
    }
}