import { gameAllPairsViewModel } from './../../model/games.model';
import { PairGameQueryRepo } from './../../dv-psql/pair.game.query.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { queryPaginationPairsType } from './../../../helpers/query-filter';
import { PairGameService } from '../pair.game.service';

export class GetAllPairsByUserCommand {
    constructor(public queryFilter: queryPaginationPairsType,
        public userId: string) {
    }
}
@CommandHandler(GetAllPairsByUserCommand)
export class GetAllPairsByUserUseCase implements ICommandHandler<GetAllPairsByUserCommand>{
    constructor (private pairGameQueryRepo: PairGameQueryRepo,
        private pairGameService: PairGameService) {           
    }
    async execute(command: GetAllPairsByUserCommand): Promise<gameAllPairsViewModel | null> {
        const userId = command.userId
        const queryFilter = command.queryFilter
        const pairs = await this.pairGameQueryRepo.getAllPairsByUser(userId, queryFilter)
        if (!pairs) {
            return null
        }
        const pagesCount = Math.ceil(pairs.length / queryFilter.pageSize)

        let result: any = await Promise.all(pairs.map(async (p) => {
            return await this.pairGameService.getPairMuCurrentViewModel(userId, p.id)
        }))
        if (!result) {
            result = []
        }
        return {
            pagesCount: pagesCount,
            page: queryFilter.pageNumber,
            pageSize: queryFilter.pageSize,
            totalCount: pairs.length,
            items: result
        }

    }
}