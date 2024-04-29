import { gamePairViewModel } from '../model/games.model';

import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/application/users.service';
import { PairGameQueryRepo } from '../dv-psql/pair.game.query.repo';

@Injectable()
export class PairGameService {
  constructor(
    protected pairGameQueryRepo: PairGameQueryRepo,
    protected userService: UsersService,
  ) {}

  async getPairMuCurrentViewModel(
    userIdOne: string,
    pairId: string,
  ): Promise<gamePairViewModel | null> {
    const pair = await this.pairGameQueryRepo.getPairByIdAndUserId(
      userIdOne,
      pairId,
    );
    if (!pair) {
      return null;
    }

    if (pair.secondPlayerId === null) {
      const resultOnePlayer =
        await this.pairGameQueryRepo.getResultPairsByPlayerId(
          pair.id,
          userIdOne,
        );
      const userOne = await this.userService.findByUserId(userIdOne);
      const answersOne = [];
      const firstPlayerProgress = {
        answers: answersOne,
        player: {
          id: userOne!.userId,
          login: userOne!.login,
        },
        score: resultOnePlayer!.score,
      };
      const status = 'PendingSecondPlayer';
      const secondPlayerProgress = null;
      const questions = null;

      const result: gamePairViewModel = {
        id: pair.id,
        firstPlayerProgress: firstPlayerProgress,
        secondPlayerProgress: secondPlayerProgress,
        questions: questions,
        status: pair.status,
        pairCreatedDate: pair.pairCreatedDate,
        startGameDate: pair.startGameDate,
        finishGameDate: pair.finishGameDate,
      };
      return result;
    } else {
      const resultPlayerOne =
        await this.pairGameQueryRepo.getResultPairsByPlayerId(
          pair.id,
          pair.firstPlayerId,
        );
      const userOne = await this.userService.findByUserId(pair.firstPlayerId);
      const answersOne = await this.pairGameQueryRepo.getAnswersByPlayerId(
        pair.firstPlayerId,
        pair.id,
      );
      const firstPlayerProgress = {
        answers: answersOne!,
        player: {
          id: userOne!.userId,
          login: userOne!.login,
        },
        score: resultPlayerOne!.score,
      };

      const resultPlayerTwo =
        await this.pairGameQueryRepo.getResultPairsByPlayerId(
          pair.id,
          pair.secondPlayerId,
        );
      const userTwo = await this.userService.findByUserId(pair.secondPlayerId);
      const answersTwo = await this.pairGameQueryRepo.getAnswersByPlayerId(
        pair.secondPlayerId,
        pair.id,
      );
      const secondPlayerProgress = {
        answers: answersTwo!,
        player: {
          id: userTwo!.userId,
          login: userTwo!.login,
        },
        score: resultPlayerTwo!.score,
      };
      const questions = await this.pairGameQueryRepo.getQuestionsByPair(
        pair.id,
      );

      let status = 'Active';
      if (pair.finishGameDate !== null) {
        status = 'Finished';
      }

      const result: gamePairViewModel = {
        id: pair.id,
        firstPlayerProgress: firstPlayerProgress,
        secondPlayerProgress: secondPlayerProgress,
        questions: questions,
        status: pair.status,
        pairCreatedDate: pair.pairCreatedDate,
        startGameDate: pair.startGameDate,
        finishGameDate: pair.finishGameDate,
      };
      return result;
    }
  }
}
