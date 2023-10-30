import { EmailOrLoginGuard } from './../auth/guards/auth.guard';
import { BasicAuthGuard } from './../auth/guards/basic-auth.guard';
import { Pagination } from './../helpers/query-filter';
import { Body, Delete, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreatUserInputModel } from "./models/users-model";
import { log } from "console";
import { Controller} from "@nestjs/common/decorators/core";
import { AuthGuard } from "@nestjs/passport";


@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
    constructor(protected usersService: UsersService,
        private readonly pagination : Pagination
    ) { }
    @Get()
    async getUsers(@Query()
    query: {
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
    @UseGuards(EmailOrLoginGuard)
    @Post()
    async createUser(@Body() inputModel: CreatUserInputModel) {
        const result = await this.usersService.createUser(inputModel)
        return result
    }
    
    
    @Delete(':id')
    async deleteUser(@Param('id') userId: string): Promise<Number> {
        const userDelete = await this.usersService.deleteUserId(userId)
        if (userDelete === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        }

    }
}

