import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { MinLength } from 'class-validator';
import { MaxLength } from 'class-validator';

export class QuestionInputModel {
    @MaxLength(500)
    @MinLength(10)
    @IsString()
    @IsNotEmpty()
    body: string


    @IsArray()
    @IsNotEmpty()
    correctAnswers: string[]
}

export class PublishInputModel {
    @IsBoolean()
    published: boolean
}


export type questionViewModel = {
    id:	string
    body: string
    correctAnswers:	null | string[]
    published: boolean
    createdAt: string
    updatedAt: string | null
}



export type questionDBModel = {
    id: string;
    body: string;
    answers: string[];
    published: boolean;
    createdAt: string;
    updatedAt: string | null;
};


export type paginatorQuestions = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: questionViewModel[]
}