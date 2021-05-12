import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

const nodeEnv = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env'],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
