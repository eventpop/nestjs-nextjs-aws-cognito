import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body()
    authenticateRequest: {
      email: string
      username: string
      password: string
    },
  ) {
    try {
      return await this.authService.signUpUser(authenticateRequest)
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  @Post('login')
  async login(
    @Body() authenticateRequest: { username: string; password: string },
  ) {
    try {
      return await this.authService.authenticateUser(authenticateRequest)
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }
}
