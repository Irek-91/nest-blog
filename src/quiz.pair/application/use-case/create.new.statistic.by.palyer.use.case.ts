import { PairGameRepo } from './../../dv-psql/pair.game.repo';
import { PairGameQueryRepo } from './../../dv-psql/pair.game.query.repo';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";



export class CreateNewStatisticByPalyerCommand {
    constructor(public userId: string) {
    }
}
@CommandHandler(CreateNewStatisticByPalyerCommand)
export class CreateNewStatisticByPalyerUseCase
    implements ICommandHandler<CreateNewStatisticByPalyerCommand> {
    constructor(private pairGameQueryRepo: PairGameQueryRepo, 
        private pairGameRepo:PairGameRepo) {
    }

    async execute(command: CreateNewStatisticByPalyerCommand): Promise<boolean> {
        const userId = command.userId
        const statistic = await this.pairGameQueryRepo.getStatisticByUser(userId)
            if (statistic !== null) {
                return true
            }
            const newStatistic = await this.pairGameRepo.createNewStatistic(userId)
            return newStatistic
        }
}