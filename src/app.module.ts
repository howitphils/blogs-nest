import { Module } from '@nestjs/common';
import { BlogsPlatformModule } from './modules/blogs-platform/blogs-platform.module';
import { UsersAccountsModule } from './modules/users-accounts/user-accounts.module';

@Module({
  imports: [BlogsPlatformModule, UsersAccountsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
