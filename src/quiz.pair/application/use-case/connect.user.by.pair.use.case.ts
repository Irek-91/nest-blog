import { gamePairViewModel } from './../../model/games.model';
import { PairGameRepo } from './../../dv-psql/pair.game.repo';
import { PairGameQueryRepo } from './../../dv-psql/pair.game.query.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PairGameService } from '../pair.game.service';
import { HttpException, HttpStatus } from '@nestjs/common';

export class ConnectUserByPairCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectUserByPairCommand)
export class ConnectUserByPairUseCase
  implements ICommandHandler<ConnectUserByPairCommand>
{
  constructor(
    private pairGameQueryRepo: PairGameQueryRepo,
    private pairGameRepo: PairGameRepo,
    private pairGameService: PairGameService,
  ) {}

  async execute(
    command: ConnectUserByPairCommand,
  ): Promise<gamePairViewModel | null> {
    const userId = command.userId;

    const pair = await this.pairGameQueryRepo.getPairMyCurrent(userId);
    if (
      pair !== null &&
      pair.finishGameDate === null &&
      (pair.firstPlayerId === userId || pair.secondPlayerId === userId)
    ) {
      throw new HttpException(
        'If current user is already participating in active pair',
        HttpStatus.FORBIDDEN,
      );
    }

    const secondPlayerPair =
      await this.pairGameQueryRepo.getPairWhereSecondPlayerNull();
    if (!secondPlayerPair) {
      const newPairId = await this.pairGameRepo.createNewPair(userId);
      const result = await this.pairGameService.getPairMuCurrentViewModel(
        userId,
        newPairId!,
      );
      return result;
    } else {
      const addPlayerInPairId = await this.pairGameRepo.addPlayerInPair(
        userId,
        secondPlayerPair.id,
      );
      const result = await this.pairGameService.getPairMuCurrentViewModel(
        userId,
        addPlayerInPairId!,
      );
      return result;
    }
  }
}
