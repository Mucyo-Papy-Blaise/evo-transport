import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorUtil {
  static throwForbidden(message: string): never {
    throw new HttpException({ message }, HttpStatus.FORBIDDEN);
  }

  static throwNotFound(message: string): never {
    throw new HttpException({ message }, HttpStatus.NOT_FOUND);
  }

  static throwUnauthorized(message: string): never {
    throw new HttpException({ message }, HttpStatus.UNAUTHORIZED);
  }

  static throwBadRequest(message: string): never {
    throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
  }
}
