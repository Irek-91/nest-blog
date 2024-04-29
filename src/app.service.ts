import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello world. The application has started and is working. To view the documentation, add to the url /swagger';
  }
}
