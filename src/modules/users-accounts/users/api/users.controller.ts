import { UsersService } from './../application/users.service';
import { UsersQueryRepository } from './../repository/users-query.repository';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ROUTES } from '../../../core/constants/routes.constants';
import { UsersQueryParams } from './dto/input/user-query-params.dto';
import { PaginationViewDto } from '../../../core/dto/pagination.dto';
import { UserViewDto } from './dto/view/user-view.dto';
import { UserInputDto } from './dto/input/create-user-input.dto';
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';
import { MongoIdValidationPipe } from '../../../core/pipes/MongoIdValidation.pipe';

@Injectable()
@UseGuards(BasicAuthGuard)
@Controller(ROUTES.MAIN.users)
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {}

  @Get()
  async getUsers(
    @Query() query: UsersQueryParams,
  ): Promise<PaginationViewDto<UserViewDto>> {
    const users = await this.usersQueryRepository.getUsers(query);

    return users;
  }

  @Post()
  async createUser(@Body() body: UserInputDto): Promise<UserViewDto> {
    const { email, login, password } = body;

    const userId = await this.usersService.addUser({ email, login, password });

    const newUser = this.usersQueryRepository.getUserByIdOrFail(userId);

    return newUser;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', MongoIdValidationPipe) id: string) {
    await this.usersService.deleteUser(id);
  }
}
