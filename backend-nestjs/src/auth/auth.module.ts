import { Module } from '@nestjs/common'
// import { PassportModule } from '@nestjs/passport'
// import { AuthController } from './auth.controller'
// import { AuthService } from './auth.service'
import { AuthConfig } from './auth.config'
// import { JwtStrategy } from './jwt.strategy'
// import { AuthResolver } from './auth.resolver'
import { AuthController } from './auth.controller';

@Module({
  imports: [], // [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthConfig],
})
export class AuthModule {}
