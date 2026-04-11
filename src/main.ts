import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApp(app);

  await app.listen(process.env.PORT ?? 3000); //TODO .env
}

bootstrap().catch((e) => {
  console.log('App booting failed', e);
});
