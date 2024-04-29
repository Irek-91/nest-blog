import { gamePairViewModel } from './../../model/games.model';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PairGameService } from '../pair.game.service';
import { PairGameQueryRepo } from './../../dv-psql/pair.game.query.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetPairByIdCommand {
  constructor(
    public pairId: string,
    public userId: string,
  ) {}
}

@CommandHandler(GetPairByIdCommand)
export class GetPairByIdUseCase implements ICommandHandler<GetPairByIdCommand> {
  constructor(
    private pairGameQueryRepo: PairGameQueryRepo,
    private pairGameService: PairGameService,
  ) {}
  async execute(
    command: GetPairByIdCommand,
  ): Promise<gamePairViewModel | null> {
    const userId = command.userId;
    const pairId = command.pairId;
    const pair = await this.pairGameQueryRepo.getPairById(command.pairId);
    if (!pair) {
      return null;
    }
    const result = await this.pairGameService.getPairMuCurrentViewModel(
      userId,
      pairId,
    );

    if (pair.firstPlayerId === userId) {
      return result;
    }
    if (pair.secondPlayerId === userId) {
      return result;
    } else {
      throw new HttpException(
        'If current user tries to get pair in which user is not participant',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
