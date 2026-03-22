import { Module } from '@nestjs/common';
import { BlogsPlatformModule } from './modules/blogs-platform/blogs-platform.module';
import { UsersAccountsModule } from './modules/users-accounts/user-accounts.module';
import { BlogsController } from './modules/blogs-platform/blogs/api/blogs.controller';
import { BlogsService } from './modules/blogs-platform/blogs/application/blogs.service';

@Module({
  imports: [BlogsPlatformModule, UsersAccountsModule],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class AppModule {}
