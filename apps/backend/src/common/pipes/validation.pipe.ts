/**
 * Custom Validation Pipe
 * Extends NestJS ValidationPipe with custom error formatting.
 */
import { ValidationPipe as NestValidationPipe } from '@nestjs/common';

export class CustomValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        // Custom error formatting
        return errors;
      },
    });
  }
}
