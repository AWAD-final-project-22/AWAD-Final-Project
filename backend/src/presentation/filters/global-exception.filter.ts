import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidCredentialsError } from '../../application/errors/invalid-credentials.error';
import { EmailAlreadyExistsError } from '../../application/errors/email-already-exists.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof InvalidCredentialsError) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        status: 'error',
        message: exception.message,
        data: null,
      });
    }

    if (exception instanceof EmailAlreadyExistsError) {
      return response.status(HttpStatus.CONFLICT).json({
        status: 'error',
        message: exception.message,
        data: null,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res: any = exception.getResponse();
      const message = res.message || exception.message;

      return response.status(status).json({
        status: 'error',
        message,
        data: null,
      });
    }

    console.error(exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Internal server error',
      data: null,
    });
  }
}
