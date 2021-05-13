import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

const nodeEnv = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env'],
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
