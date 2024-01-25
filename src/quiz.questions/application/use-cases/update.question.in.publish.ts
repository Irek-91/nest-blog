import { QuestionsRepository } from '../../db-psql/questions.repo';
import { QuestionsQueryRepository } from '../../db-psql/questions.query.repo';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { PublishInputModel } from "../../model/questionModel"

export class UpdateQuestionInPublishCommand { 
    constructor(public inputModel: PublishInputModel,
        public questionId: string) {
    
    }
    
}
@CommandHandler(UpdateQuestionInPublishCommand)
export class UpdateQuestionInPublishUseCase implements ICommandHandler<UpdateQuestionInPublishCommand> {
    constructor(protected questionsQueryRepository: QuestionsQueryRepository,
        protected questionsRepository: QuestionsRepository ) {

    }    
async execute(command: UpdateQuestionInPublishCommand): Promise<boolean> {

    const question = await this.questionsQueryRepository.getQuestiontById(command.questionId)
    if (!question) {
      return false
    }
    const updateResult = await this.questionsRepository.updateQuestionInPublish(command.inputModel, command.questionId)
    return updateResult
  }
}