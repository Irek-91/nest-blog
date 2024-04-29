import { userViewModel } from './../../models/users-model';
import { UsersRepositoryPSQL } from '../../db-psql/users.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatUserInputModel } from '../../models/users-model';
import { UsersService } from '../users.service';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { add } from 'date-fns';

export class CreateUserCommand {
  constructor(public inputModel: CreatUserInputModel) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected usersRepository: UsersRepositoryPSQL,
    protected usersService: UsersService,
  ) {}

  async execute(command: CreateUserCommand): Promise<userViewModel | null> {
    const password = command.inputModel.password;
    const createdAt = new Date().toISOString();
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.usersService._generateHash(
      password,
      passwordSalt,
    );
    const confirmationCode = uuidv4();
    const recoveryCode = uuidv4();
    const isConfirmed = false;
    const expiritionDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    }).toISOString();

    const newUser = {
      _id: uuidv4(),
      accountData: {
        login: command.inputModel.login,
        email: command.inputModel.email,
        salt: passwordSalt,
        hash: passwordHash,
        createdAt,
      },
      emailConfirmation: {
        confirmationCode,
        expiritionDate,
        isConfirmed,
        recoveryCode,
      },
    };
    const user = await this.usersRepository.createUser(newUser);
    return user;
  }
}
