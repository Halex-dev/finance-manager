import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(validationErrors: string[]) {
    super({ message: 'Errore di validazione', errors: validationErrors }, HttpStatus.BAD_REQUEST);
  }
}