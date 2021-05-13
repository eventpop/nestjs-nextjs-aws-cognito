import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('user')
export class UserController {
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req) {
    return {
      user: req.user,
    }
  }
}
