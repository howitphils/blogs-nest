import { Module } from '@nestjs/common';
import { BlogsPlatformModule } from './modules/blogs-platform/blogs-platform.module';
import { UsersAccountsModule } from './modules/users-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/dev',
    ),
    BlogsPlatformModule,
    UsersAccountsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
