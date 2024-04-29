import { Injectable } from '@nestjs/common';
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

@Injectable()
export class CustomNaimingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  public tableName(className: string, customName: string): string {
    return customName ? customName : `${className.toLowerCase()}s`;
  }
}
