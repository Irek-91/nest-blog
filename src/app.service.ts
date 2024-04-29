import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return "Hey buddy. If you can see that, it's probably working.";
  }
}
