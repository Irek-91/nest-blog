import { gamePairViewModel } from './../../model/games.model';
import { PairGameService } from '../pair.game.service';
import { PairGameQueryRepo } from '../../dv-psql/pair.game.query.repo';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class GetPairMyCurrentCommand {
    constructor(public userId: string) {
    }
}

@CommandHandler(GetPairMyCurrentCommand)
export class GetPairMyCurrentUseCase implements ICommandHandler<GetPairMyCurrentCommand> {
    constructor(private pairGameQueryRepo: PairGameQueryRepo,
        private pairGameService: PairGameService) {

    }
    async execute(command: GetPairMyCurrentCommand): Promise<gamePairViewModel | null> {

        const pair = await this.pairGameQueryRepo.getPairMyCurrent(command.userId)
        if (!pair) {
            return null
        }
        const result = await this.pairGameService.getPairMuCurrentViewModel(command.userId, pair.id)
        return result
    }
}