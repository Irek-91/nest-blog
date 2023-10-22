import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { log } from 'console';
import { Request, Response } from 'express';

//ошибла для сервера 500
// @Catch(Error)
// export class ErrorExceptionFilter implements ExceptionFilter {
//     catch(exception: HttpException, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         const response = ctx.getResponse<Response>();
//         const request = ctx.getRequest<Request>();
//         if (process.env.envorinment !== 'production') {
//             response
//             .status(500)
//             .send({error: exception.toString(), stack: exception.stack})
//         } else {
//             response
//             .status(500)
//             .send('some error ocurred')
//         }
//     }
// }

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        if (status === 400) {
            const errorResponse: any = {
                errorsMessages: []
            }
            const responseBody: any = exception.getResponse()

            responseBody.message.forEach((m: any) => {
                errorResponse.errorsMessages.push(m)
            })
            response.status(status).json(errorResponse)
        } else {
            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
        }
    }
}
