import { Statistic } from './entity/statistic';
import {
  queryPaginationPairsType,
  queryPaginationTopUsersType,
} from '../../helpers/query-filter';
import { Question } from '../../quiz.questions/db-psql/entity/question';
import { QuestionsQueryRepository } from '../../quiz.questions/db-psql/questions.query.repo';
import {
  answerViewModel,
  questionPairViewModel,
  userStatisticViewModel,
} from '../model/games.model';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';
import { Pair } from './entity/pairs';
import { Pairresult } from './entity/result.pair';

@Injectable()
export class PairGameQueryRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  async getPairMyCurrent(userId: string): Promise<Pair | null> {
    try {
      const result = await this.dataSource
        .getRepository(Pair)
        .createQueryBuilder()
        .where({
          firstPlayerId: userId,
          finishGameDate: IsNull(),
        })
        .orWhere({
          secondPlayerId: userId,
          finishGameDate: IsNull(),
        })
        .getOne();

      return result;
    } catch (e) {
      return null;
    }
  }

  async getAllPairsByUser(
    userId: string,
    queryFilter: queryPaginationPairsType,
  ): Promise<Pair[] | null> {
    try {
      if (queryFilter.sortBy === 'status') {
        const result = await this.dataSource
          .getRepository(Pair)
          .createQueryBuilder('p')
          .where({
            firstPlayerId: userId,
          })
          .orWhere({
            secondPlayerId: userId,
          })
          .orderBy(`p.${queryFilter.sortBy}`, queryFilter.sortDirection)
          .addOrderBy('p.pairCreatedDate', 'DESC')
          .skip(queryFilter.skip)
          .take(queryFilter.pageSize)
          .getMany();

        return result;
      }
      const result = await this.dataSource
        .getRepository(Pair)
        .createQueryBuilder('p')
        .where({
          firstPlayerId: userId,
        })
        .orWhere({
          secondPlayerId: userId,
        })
        .orderBy(`p.${queryFilter.sortBy}`, queryFilter.sortDirection)
        .skip(queryFilter.skip)
        .take(queryFilter.pageSize)
        .getMany();

      return result;
    } catch (e) {
      return null;
    }
  }

  async getPairById(pairId: string): Promise<Pair | null> {
    try {
      const result = await this.dataSource
        .getRepository(Pair)
        .createQueryBuilder()
        .where({
          id: pairId,
        })
        .getOne();

      return result;
    } catch (e) {
      return null;
    }
  }

  async getPairByIdAndUserId(
    userIdOne: string,
    pairId: string,
  ): Promise<Pair | null> {
    try {
      const result = await this.dataSource
        .getRepository(Pair)
        .createQueryBuilder()
        .where({
          firstPlayerId: userIdOne,
          id: pairId,
        })
        .orWhere({
          secondPlayerId: userIdOne,
          id: pairId,
        })
        .getOne();

      return result;
    } catch (e) {
      return null;
    }
  }

  async getResultPairsByPlayerId(
    pairId: string,
    userId: string,
  ): Promise<Pairresult | null> {
    try {
      const result = await this.dataSource
        .getRepository(Pairresult)
        .createQueryBuilder()
        .where({
          pairId: pairId,
        })
        .andWhere({
          playerId: userId,
        })
        .getOne();

      return result;
    } catch (e) {
      return null;
    }
  }

  async getAnswersByPlayerId(
    userId: string,
    pairId: string,
  ): Promise<answerViewModel[] | null> {
    try {
      const result: Pairresult | null = await this.dataSource
        .getRepository(Pairresult)
        .createQueryBuilder()
        .where({
          playerId: userId,
        })
        .andWhere({
          pairId: pairId,
        })
        .getOne();

      const pair = await this.getPairByIdAndUserId(userId, pairId);
      const questions = pair!.questionsId;
      const answersAddedAt = result!.answersAddedAt;
      const answerStatus = result!.answersStatus;

      const answer: answerViewModel[] = answerStatus.map(function (e, i) {
        return {
          questionId: questions[i],
          answerStatus: e,
          addedAt: answersAddedAt[i],
        };
      });

      return answer;
    } catch (e) {
      return null;
    }
  }

  async getQuestionsByPair(
    pairId: string,
  ): Promise<questionPairViewModel[] | null> {
    try {
      const questionsPair = await this.dataSource
        .getRepository(Pair)
        .createQueryBuilder()
        .where({
          id: pairId,
        })
        .getOne();
      const questionsId = questionsPair!.questionsId;

      const result: questionPairViewModel[] = await Promise.all(
        questionsId.map(async (q) => {
          const question = await this.dataSource
            .getRepository(Question)
            .createQueryBuilder()
            .where({ id: q })
            .getOne();
          return {
            id: question!.id,
            body: question!.body,
          };
        }),
      );
      return result;
    } catch (e) {
      return null;
    }
  }

  async getPairWhereSecondPlayerNull(): Promise<Pair | null> {
    const result = await this.dataSource
      .getRepository(Pair)
      .createQueryBuilder()
      .where({
        secondPlayerId: IsNull(),
      })
      .andWhere({
        finishGameDate: IsNull(),
      })
      .getOne();
    return result;
  }

  async getStatisticByUser(userId: string): Promise<Statistic | null> {
    const result = await this.dataSource
      .getRepository(Statistic)
      .createQueryBuilder()
      .where({
        userId: userId,
      })
      .getOne();

    return result;
  }
  async getAllStatisticByUsers(): Promise<Statistic[] | null> {
    const result = await this.dataSource
      .getRepository(Statistic)
      .createQueryBuilder()
      .getMany();

    return result;
  }

  async getTopUsers(
    queryFilter: queryPaginationTopUsersType,
  ): Promise<userStatisticViewModel[] | []> {
    try {
      let result = await this.dataSource
        .getRepository(Statistic)
        .createQueryBuilder('s')
        .select('*')
        .addSelect(
          `CAST((s.sumScore / (s.winsCount + s.lossesCount + s.drawcount)) AS decimal(18,2)) AS "avgScores"`,
        )
        .leftJoinAndSelect('s.userId', 'user')
        .orderBy();
      //.addOrderBy()
      //.skip(queryFilter.skip)
      //.take(queryFilter.pageSize)
      //.getRawMany()

      if (!result) {
        return [];
      }

      const result1 = queryFilter.sort.forEach(
        async function callback(element, index) {
          const sort = element.split(' ')[0];
          const order: 'ASC' | 'DESC' | any = element.split(' ')[1];
          result = result.addOrderBy(sort, order);
        },
      );
      const res = await result
        .offset(queryFilter.skip)
        .limit(queryFilter.pageSize)
        .getRawMany();

      const resultOne: userStatisticViewModel[] = await Promise.all(
        res.map(async (b) => {
          const gamesCount = +b.drawcount + +b.lossesCount + +b.winsCount;
          return {
            sumScore: +b.sumScore,
            avgScores: +b.avgScores,
            gamesCount: +gamesCount,
            winsCount: +b.winsCount,
            lossesCount: +b.lossesCount,
            drawsCount: +b.drawcount,
            player: {
              id: b._id,
              login: b.login,
            },
          };
        }),
      );
      return resultOne;
    } catch (e) {
      return [];
    }
  }
}
