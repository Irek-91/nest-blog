import { QusetionsService } from './questions.service';
import { QuestionInputModel, paginatorQuestions, questionViewModel, PublishInputModel } from './model/questionModel';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { Pagination } from '../helpers/query-filter';
import { Body, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { Controller } from "@nestjs/common/decorators/core";



@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class QusetionsSAController {
    constructor(protected qusetionsService: QusetionsService,
        private readonly pagination: Pagination
    ) { }

    @HttpCode(HttpStatus.OK)
    @Get()
    async getUsers(@Query()
    query: {
        bodySearchTerm: string;
        publishedStatus: string
        sortBy: string;
        sortDirection: string;
        pageNumber: string;
        pageSize: string;
    }): Promise<paginatorQuestions> {
        const queryFilter = this.pagination.getPaginationFromQueryQuestions(query);
        return await this.qusetionsService.findQuestions(queryFilter)
    }


    @Post()
    async createUser(@Body() inputModel: QuestionInputModel): Promise<questionViewModel> {
        const result: questionViewModel = await this.qusetionsService.createQuestion(inputModel)
        return result
    }


    @Put(':id')
    async updateQuestionId(@Body() inputModel: QuestionInputModel,
        @Param('id') questionId: string) {
        const result: boolean = await this.qusetionsService.updateQuestionId(inputModel, questionId)
        if (!result) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        }
    }

    
    @Put(':id/publish')
    async updateQuestionInPublish(@Body() inputModel: PublishInputModel,
        @Param('id') questionId: string) {
        const result: boolean = await this.qusetionsService.updateQuestionInPublish(inputModel, questionId)
        if (!result) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        }
    }







    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deleteUser(@Param('id') questionId: string): Promise<boolean> {
        const questionDelete = await this.qusetionsService.deleteQuestionId(questionId)
        if (!questionDelete) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        }

    }


}

