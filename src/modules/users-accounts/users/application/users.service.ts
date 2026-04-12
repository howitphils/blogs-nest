import { Injectable } from '@nestjs/common';
import { UserDocument } from '../domain/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from '../repository/users.repository';
import { NotUniqueUserException } from '../domain/errors/not-unique-user.error';
import { PasswordService } from '../../../core/services/password.service';
import { TokenService } from '../../../core/services/token.service';
import { DateService } from '../../../core/services/date.service';
import { EmailService } from '../../../core/services/email-service/email.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private dateService: DateService,
    private emailService: EmailService,
  ) {}

  async addUser(dto: CreateUserDto): Promise<string> {
    await this.checkUnique(dto.login, dto.email);

    const user = await this.userFactory(dto, true);

    await this.usersRepository.save(user);

    return user.id;
  }

  async registerUser(dto: CreateUserDto): Promise<void> {
    await this.checkUnique(dto.login, dto.email);

    const user = await this.userFactory(dto, false);

    await this.usersRepository.save(user);

    this.emailService
      .sendRegistrationEmail(dto.email, user.emailConfirmation.confirmationCode)
      .catch((err) => {
        console.log('registration', err);
      });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.getUserByIdOrFail(id);

    user.delete();

    await this.usersRepository.save(user);
  }

  private async checkUnique(login: string, email: string): Promise<void> {
    const existingUser = await this.usersRepository.getExistingUser(
      login,
      email,
    );

    if (existingUser) {
      const field =
        existingUser.accountData.email === email ? 'email' : 'login';

      throw new NotUniqueUserException(field);
    }
  }

  private async userFactory(
    dto: CreateUserDto,
    isConfirmed: boolean,
  ): Promise<UserDocument> {
    const { email, login, password } = dto;
    const confirmationCode = this.tokenService.createRandomCode();
    const expDate = this.dateService.addHours(2);
    const passwordHash = await this.passwordService.generateHash(password);

    return this.usersRepository.createUser({
      confirmationCode,
      email,
      expDate,
      isConfirmed,
      login,
      passwordHash,
    });
  }
}
