import { PaginationUsersSa } from './../helpers/query-filter-users-SA';
import { UpdateStatusUserCommand } from './application/use-case/update.status.user.use.case';
import { CreateUserCommand } from './application/use-case/create.user.use.case';
import { EmailOrLoginGuard } from './../auth/guards/auth.guard';
import { BasicAuthGuard } from './../auth/guards/basic-auth.guard';
import { Body, Delete, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./application/users.service";
import { CreatUserInputModel, UpdateStatusInputModel } from "./models/users-model";
import { Controller} from "@nestjs/common/decorators/core";
import { HttpCode, Put} from "@nestjs/common/decorators";
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserIdCommand } from './application/use-case/delete.user.id.use.case';



@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersSAController {
    constructor(protected usersService: UsersService,
        private readonly pagination : PaginationUsersSa,
        private commandBus: CommandBus
    ) { }
    
    @HttpCode(HttpStatus.OK)
    @Get()
    async getUsers(@Query()
    query: {
        banStatus: string;
        sortBy: string;
        sortDirection: string;
        pageNumber: string;
        pageSize: string;
        searchLoginTerm: string;
        searchEmailTerm: string;
    }) {
        const queryFilter = this.pagination.getPaginationFromQueryUser(query);
        return await this.usersService.findUsers(queryFilter)
    }

    //@HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(EmailOrLoginGuard)
    @Post()
    async createUser(@Body() inputModel: CreatUserInputModel) {
        const result = await this.commandBus.execute(new CreateUserCommand(inputModel))
        return result
    }


    @HttpCode(HttpStatus.NO_CONTENT)
    @Put(':id/ban')
    async updateStatusUser(@Param('id') userId: string,
    @Body() inputModel: UpdateStatusInputModel) {
        const result = await this.commandBus.execute(new UpdateStatusUserCommand(userId,inputModel.isBanned, inputModel.banReason))
        //return result
    }  



    
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deleteUser(@Param('id') userId: string): Promise<Number> {
        const userDelete = await this.commandBus.execute(new DeleteUserIdCommand(userId))
        if (!userDelete) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        }

    }
}

