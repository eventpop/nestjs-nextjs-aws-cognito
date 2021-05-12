import { Controller, Get } from '@nestjs/common'
import { AuthConfig } from './auth.config'

@Controller('auth')
export class AuthController {
  constructor(private readonly authConfig: AuthConfig) {}

  @Get('config')
  test() {
    return this.authConfig
  }
}
