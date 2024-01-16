import { Pagination, QueryPaginationPairsType } from './../helpers/query-filter';
import { CustomPipe } from './../application/pipe';
import { PairGameService } from './pair.game.service';
import { gamePairViewModel, AnswerInputModel, gameAllPairsViewModel } from './model/games.model';
import { UserAuthGuard, CheckingActivePair } from './../auth/guards/auth.guard';
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Query, Request, UseGuards } from "@nestjs/common";

@Controller('pair-game-quiz/pairs')
export class PairGameController {
    constructor(protected pairGameService: PairGameService,
        private readonly pagination: Pagination
    ) {
    }
    @UseGuards(CheckingActivePair)
    @Get('/my-current')
    async getPairMuCurrent(@Request() req: any
    ) {
        let userId = req.userId

        const pairMyCurrent: gamePairViewModel | null = await this.pairGameService.getPairMuCurrent(userId)

        if (!pairMyCurrent) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return pairMyCurrent
    }

    @UseGuards(UserAuthGuard)
    @Get('/my')
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
        const queryFilter : QueryPaginationPairsType  = this.pagination.getPaginationFromQueryPairs(query);

        const pairsAllbyUser: gameAllPairsViewModel | null = await this.pairGameService.getAllPairsByUser(queryFilter, userId)

        if (!pairsAllbyUser) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return pairsAllbyUser
    }

    @UseGuards(UserAuthGuard)
    @Get(':id')
    async getPairById(
        @Param('id',
        new CustomPipe()
        ) pairId: string,
        @Request() req: any
    ) {
        let userId = req.userId

        const pairMyCurrent: gamePairViewModel | null = await this.pairGameService.getPairById(pairId, userId)

        if (!pairMyCurrent) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return pairMyCurrent
    }

    @UseGuards(UserAuthGuard)
    @Post('/connection')
    @HttpCode(200)
    async connectUserByPair(
        @Request() req: any,
    ) {

        const userId = req.userId
        const pair = await this.pairGameService.connectUserByPair(userId)
        if (!pair) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return pair
    }

    
    @UseGuards(UserAuthGuard)
    @Post('/my-current/answers')
    @HttpCode(200)
    async sendAnswer(@Body() inputDate: AnswerInputModel,
        @Request() req: any,
    ) {

        const userId = req.userId
        const result = await this.pairGameService.sendAnswer(inputDate.answer, userId)
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