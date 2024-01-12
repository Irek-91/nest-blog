import { PairGameService } from './pair.game.service';
import { gamePairViewModel } from './model/games.model';
import { UserAuthGuard } from './../auth/guards/auth.guard';
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request, UseGuards } from "@nestjs/common";

@Controller('pair-game-quiz/pairs')
export class PairGameController {
    constructor(protected pairGameService: PairGameService
    ) {
    }
    @UseGuards(UserAuthGuard)
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
    @Get(':id')
    async getPairById(
        @Param('id') pairId: string,
        @Request() req: any
    ) {
        let userId = req.userId

        const pairMyCurrent: gamePairViewModel | null = await this.pairGameService.getPairById(pairId ,userId)

        if (!pairMyCurrent) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return pairMyCurrent
    }

    @UseGuards(UserAuthGuard)
    @Post('/connection')
    async connectUserByPair(
        @Request() req: any,
        ) {
            
        const userId = req.userId
        const pair = await this.pairGameService.connectUserByPair(userId)
        return pair
    }




}