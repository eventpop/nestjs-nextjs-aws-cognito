import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@src/auth/jwt.strategy'

@Controller('user')
export class UserController {
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req): Promise<User> {
    return req.user
  }
}
