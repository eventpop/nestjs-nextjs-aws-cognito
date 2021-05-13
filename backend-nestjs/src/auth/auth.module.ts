import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
// import { AuthService } from './auth.service'
import { AuthConfig } from './auth.config'
import { JwtStrategy } from './jwt.strategy'
// import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthConfig, JwtStrategy, AuthService, AuthResolver],
})
export class AuthModule {}
