import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserResolver } from './user.resolver';

@Module({
  controllers: [UserController],
  providers: [UserResolver],
})
export class UserModule {}
