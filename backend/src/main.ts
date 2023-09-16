import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

import * as session from 'express-session';
import { TypeormStore } from 'connect-typeorm';

import { AppModule } from './app.module';
import { CommonModule } from './common/common.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const store = new TypeormStore({
    cleanupLimit: 2,
    limitSubquery: false,
    ttl: 2592000,
  });

  app.setGlobalPrefix('api');
  app.use(
    session({
      secret: app.get(ConfigService).get('SESSION_SECRET') || 'abc',
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: false,
        sameSite: true,
      },
    }),
  );
  app.get(CommonModule).connectOrmSession(store);
  app.useGlobalPipes(new ValidationPipe());
  if (process.env.NODE_ENV === 'development') {
    app.useStaticAssets(join(__dirname, '..', 'public_dev'));
  }

  await app.listen(app.get(ConfigService).get('APP_PORT') || 3000);
}
bootstrap();
