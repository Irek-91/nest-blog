import { Body, Controller, Get, Post, Delete, Param, Query, HttpException, HttpStatus } from "@nestjs/common";
import { UserService } from "./users.service";
import { getPaginationFromQueryUser } from 'src/helpers/query-filter';
import { CreatUserInputModel } from "./models/users-model";
import { log } from "console";

@Controller('users')
export class UsersController {
    constructor(protected usersService: UserService,
    ) { }
    @Get()
    async getUsers(@Query()
    query: {
        searchNameTerm?: string;
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
        searchLoginTerm?: string;
        searchEmailTerm?: string;
    }) {
        const queryFilter = getPaginationFromQueryUser(query);
        return await this.usersService.findUsers(queryFilter)
    }
    @Post()
    async createUser(@Body() inputModel: CreatUserInputModel) {
        return await this.usersService.createUser(inputModel)
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

