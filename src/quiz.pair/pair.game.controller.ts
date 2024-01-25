import { SendAnswerCommand } from './application/use-case/send.answer.use.case';
import { CreateNewStatisticByPalyerCommand } from './application/use-case/create.new.statistic.by.palyer.use.case';
import { GetPairByIdCommand } from './application/use-case/get.pair.by.id';
import { GetAllPairsByUserCommand } from './application/use-case/get.all.pairs.by.user.use.case';
import { GetTopUsersCommand } from './application/use-case/get.top.users';
import { GetPairMyCurrentCommand } from './application/use-case/get.pair.my.current.use.case';
import { Pagination, queryPaginationPairsType, queryPaginationTopUsersType } from './../helpers/query-filter';
import { CustomPipe } from '../adapters/pipe';
import { PairGameService } from './application/pair.game.service';
import { gamePairViewModel, AnswerInputModel, gameAllPairsViewModel, myStatisticViewModel, topGamePlayerViewModel } from './model/games.model';
import { UserAuthGuard, CheckingActivePair } from './../auth/guards/auth.guard';
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Query, Request, UseGuards } from "@nestjs/common";
import { CommandBus } from '@nestjs/cqrs';
import { GetStatisticByUserCommand } from './application/use-case/get.statistic.by.user.use.case';
import { ConnectUserByPairCommand } from './application/use-case/connect.user.by.pair.use.case';

@Controller('pair-game-quiz')
export class PairGameController {
    constructor(protected pairGameService: PairGameService,
        private commandBus: CommandBus,
        private readonly pagination: Pagination
    ) {
    }
    @UseGuards(CheckingActivePair)
    @Get('/pairs/my-current')
    async getPairMyCurrent(@Request() req: any
    ) {
        let userId = req.userId

        const pairMyCurrent: gamePairViewModel | null = await this.commandBus.execute(new GetPairMyCurrentCommand(userId))

        if (!pairMyCurrent) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return pairMyCurrent
    }


    @UseGuards(UserAuthGuard)
    @Get('/users/my-statistic')
    async getStatisticByUser(@Request() req: any
    ) {
        let userId = req.userId

        const myStatistic: myStatisticViewModel = await this.commandBus.execute(new GetStatisticByUserCommand(userId))
        return myStatistic
    }

    @Get('/users/top')
    async getUsersTop(@Query()
    query: {
        sort: string[];
        pageNumber: string;
        pageSize: string;
    }
    ) {
        const queryFilter: queryPaginationTopUsersType = this.pagination.getPaginationFromQueryTopUsers(query);

        const getUsersTop: topGamePlayerViewModel = await this.commandBus.execute(new GetTopUsersCommand(queryFilter))

        return getUsersTop
    }


    @UseGuards(UserAuthGuard)
    @Get('/pairs/my')
    async getAllMyPairs(@Query()
    query: {
        sortBy: string;
        sortDirection: string;
        pageNumber: string;
        pageSize: string;
    },
        @Request() req: any
    ) {
        let userId = req.userId
        const queryFilter: queryPaginationPairsType = this.pagination.getPaginationFromQueryPairs(query);

        const pairsAllbyUser: gameAllPairsViewModel | null = await this.commandBus.execute(new GetAllPairsByUserCommand(queryFilter, userId))

        if (!pairsAllbyUser) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return pairsAllbyUser
    }



    @UseGuards(UserAuthGuard)
    @Get('/pairs/:id')
    async getPairById(
        @Param('id',
            new CustomPipe()
        ) pairId: string,
        @Request() req: any
    ) {
        let userId = req.userId

        const pairMyCurrent: gamePairViewModel | null = await this.commandBus.execute(new GetPairByIdCommand(pairId, userId))

        if (!pairMyCurrent) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return pairMyCurrent
    }

    @UseGuards(UserAuthGuard)
    @Post('/pairs/connection')
    @HttpCode(200)
    async connectUserByPair(
        @Request() req: any,
    ) {

        const userId = req.userId
        const createdNew = await this.commandBus.execute(new CreateNewStatisticByPalyerCommand(userId))
        const pair = await this.commandBus.execute(new ConnectUserByPairCommand(userId))
        if (!pair) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return pair
    }


    @UseGuards(UserAuthGuard)
    @Post('/pairs/my-current/answers')
    @HttpCode(200)
    async sendAnswer(@Body() inputDate: AnswerInputModel,
        @Request() req: any,
    ) {

        const userId = req.userId
        const result = await this.commandBus.execute(new SendAnswerCommand(inputDate, userId))

        
        if (result === 403) {
            throw new HttpException(`If current user is not inside active pair or u
            ser is in active pair but has already answered to all questions`, HttpStatus.FORBIDDEN)
        }
        if (!result) {
            throw new HttpException(`Not found`, HttpStatus.NOT_FOUND)
        }

        return result
    }

}