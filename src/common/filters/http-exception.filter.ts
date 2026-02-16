import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : { message: 'Internal server error' };

        // Format the error message
        let errorResponse: any = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };

        if (typeof message === 'string') {
            errorResponse.message = message;
        } else if (typeof message === 'object') {
            errorResponse = { ...errorResponse, ...message };
        }

        // Special handling for 404 to make it user-friendly
        if (status === HttpStatus.NOT_FOUND) {
            errorResponse.message = `The requested resource ${request.url} was not found.`;
            errorResponse.error = 'Not Found';
        }

        // Log internal errors
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `Internal Server Error on ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        }

        response.status(status).json(errorResponse);
    }
}
