import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body()
    signUpRequest: {
      email: string
      username: string
      password: string
    },
  ) {
    try {
      return await this.authService.signUpUser(signUpRequest)
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  @Post('login')
  async login(@Body() loginRequest: { username: string; password: string }) {
    try {
      return await this.authService.authenticateUser(loginRequest)
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  @Post('confirm')
  async confirm(@Body() confirmRequest: { username: string; code: string }) {
    try {
      return await this.authService.confirmUser(confirmRequest)
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }
}
