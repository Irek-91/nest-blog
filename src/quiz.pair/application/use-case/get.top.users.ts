import { topGamePlayerViewModel } from './../../model/games.model';
import { PairGameQueryRepo } from './../../dv-psql/pair.game.query.repo';
import { queryPaginationTopUsersType } from './../../../helpers/query-filter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class GetTopUsersCommand {
    constructor(public queryFilter: queryPaginationTopUsersType) {
    }
}

@CommandHandler(GetTopUsersCommand)
export class GetTopUsersUseCase implements ICommandHandler<GetTopUsersCommand> {
    constructor(private pairGameQueryRepo: PairGameQueryRepo) {
    }
    async execute(command: GetTopUsersCommand): Promise<topGamePlayerViewModel> {
        const result = await this.pairGameQueryRepo.getTopUsers(command.queryFilter)
        const totalCount = await this.pairGameQueryRepo.getAllStatisticByUsers()
        const pagesCount = Math.ceil(totalCount!.length / command.queryFilter.pageSize)


        return {
            pagesCount: pagesCount,
            page: command.queryFilter.pageNumber,
            pageSize: command.queryFilter.pageSize,
            totalCount: totalCount!.length,
            items: result
        }


    }
}