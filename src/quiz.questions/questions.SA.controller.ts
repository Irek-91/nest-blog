import { UpdateQuestionInPublishCommand } from './application/use-cases/update.question.in.publish';
import { UpdateQuestionIdComand } from './application/use-cases/update.question.id.use.case';
import { queryPaginationQuestionsType } from './../helpers/query-filter';
import { CreateQuestionUseCase, CreateQuestionComand } from './application/use-cases/create.question.use.case';
import { FindQuestionsUseCase, FindQuestionsComand } from './application/use-cases/find.questions.use.case';
import { QusetionsService } from './application/questions.service';
import { QuestionInputModel, paginatorQuestions, questionViewModel, PublishInputModel } from './model/questionModel';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { Pagination } from '../helpers/query-filter';
import { Body, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { Controller } from "@nestjs/common/decorators/core";
import { CommandBus } from '@nestjs/cqrs';
import { DeleteQuestionIdCommand } from './application/use-cases/delete.question.id.use.case';



@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class QusetionsSAController {
    constructor(private commandBus: CommandBus,
        private readonly pagination: Pagination,
    ) { }

    @HttpCode(HttpStatus.OK)
    @Get()
    async getQuestions(@Query()
    query: {
        bodySearchTerm: string;
        publishedStatus: string
        sortBy: string;
        sortDirection: string;
        pageNumber: string;
        pageSize: string;
    }): Promise<paginatorQuestions> {
        const queryFilter: queryPaginationQuestionsType = this.pagination.getPaginationFromQueryQuestions(query);
        return await this.commandBus.execute(new FindQuestionsComand(queryFilter))
    }


    @Post()
    async createQuestion(@Body() inputModel: QuestionInputModel): Promise<questionViewModel> {
        const result: questionViewModel = await this.commandBus.execute(new CreateQuestionComand(inputModel))
        return result
    }


    @Put(':id')
    async updateQuestionId(@Body() inputModel: QuestionInputModel,
        @Param('id') questionId: string) {
        const result: boolean = await this.commandBus.execute(new UpdateQuestionIdComand(inputModel, questionId))
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
        const result: boolean = await this.commandBus.execute(new UpdateQuestionInPublishCommand(inputModel, questionId))
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
        const questionDelete = await this.commandBus.execute(new DeleteQuestionIdCommand(questionId))
        if (!questionDelete) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        }

    }


}

