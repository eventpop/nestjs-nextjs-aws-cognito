import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
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
  async login(
    @Body() loginRequest: { username: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService
        .loginUser(loginRequest)
        .catch((e) => {
          throw new BadRequestException(e.message)
        })

      if (!result.success) {
        throw new BadRequestException(result.message)
      }

      res.cookie('refresh_token', result.data.getRefreshToken().getToken(), {
        httpOnly: true,
      })

      return res.send({
        email: result.data.getIdToken().payload.email,
        username: result.data.getIdToken().payload['cognito:username'],
        access_token: result.data.getIdToken().getJwtToken(),
        refresh_token: result.data.getRefreshToken().getToken(),
      })
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
