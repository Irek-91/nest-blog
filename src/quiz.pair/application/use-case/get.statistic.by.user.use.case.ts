import { myStatisticViewModel } from './../../model/games.model';
import { PairGameQueryRepo } from './../../dv-psql/pair.game.query.repo';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class GetStatisticByUserCommand {
    constructor(public userId: string) {
    }
}
@CommandHandler(GetStatisticByUserCommand)
export class GetStatisticByUserUseCase implements ICommandHandler<GetStatisticByUserCommand> {
    constructor(private pairGameQueryRepo: PairGameQueryRepo) {

    }

    async execute(command: GetStatisticByUserCommand): Promise<myStatisticViewModel> {
        const result = await this.pairGameQueryRepo.getStatisticByUser(command.userId)
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
        const gamesCount = (+result.winsCount) + (+result.lossesCount) + (+result.drawcount)
        const avgScores = roundUp(+result.sumScore / gamesCount, 2)
        return {
            sumScore: +result.sumScore,
            avgScores: avgScores,
            gamesCount: gamesCount,
            winsCount: +result.winsCount,
            lossesCount: +result.lossesCount,
            drawsCount: +result.drawcount
        }

    }
} 