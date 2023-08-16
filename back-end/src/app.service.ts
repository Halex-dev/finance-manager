import { Injectable } from '@nestjs/common';

//TODO ricordare di fare il redirect sul front-end
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
