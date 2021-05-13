import {
  Query,
  Resolver,
  Mutation,
  Args,
  InputType,
  Field,
  ObjectType,
  GqlExecutionContext,
} from '@nestjs/graphql'
import { AuthService } from './auth.service'
// import { AuthsService } from './auth.service'
// import { Auth } from './entities/auth.entity'
// import { CreateAuthInput } from './dto/create-auth.input'
// import { UpdateAuthInput } from './dto/update-auth.input'
import { AuthenticationError } from 'apollo-server-errors'
import {
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common'
import { Response, Request } from 'express'
import { GqlAuthGuard } from '@src/guards/gql-auth.guard'

@InputType()
class LoginInput {
  @Field(() => String, { description: 'Username' })
  username: string

  @Field(() => String, { description: 'Password' })
  password: string
}

@InputType()
class SignUpInput {
  @Field(() => String, { description: 'Email' })
  email: string

  @Field(() => String, { description: 'Username' })
  username: string

  @Field(() => String, { description: 'Password' })
  password: string
}

@ObjectType()
class ILogin {
  @Field()
  email: string

  @Field()
  username: string

  @Field()
  access_token: string

  @Field()
  refresh_token: string
}

@ObjectType()
class ISignUp {
  @Field()
  username: string
}

export const ResGql = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Response =>
    GqlExecutionContext.create(context).getContext().res,
)

export const ReqGql = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Request =>
    GqlExecutionContext.create(context).getContext().req,
)

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => ISignUp)
  async signUp(@Args('signUpInput') signUpInput: SignUpInput) {
    const result = await this.authService.signUpUser(signUpInput).catch((e) => {
      throw new AuthenticationError(e.message)
    })

    if (!result.success) {
      throw new AuthenticationError(result.message)
    }

    return result.data
  }

  @Mutation(() => ILogin)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @ResGql() res: Response,
  ) {
    const result = await this.authService.loginUser(loginInput).catch((e) => {
      throw new AuthenticationError(e.message)
    })

    if (!result.success) {
      throw new AuthenticationError(result.message)
    }

    res.cookie('refresh_token', result.data.getRefreshToken().getToken(), {
      httpOnly: true,
    })

    return {
      email: result.data.getIdToken().payload.email,
      username: result.data.getIdToken().payload['cognito:username'],
      access_token: result.data.getIdToken().getJwtToken(),
      refresh_token: result.data.getRefreshToken().getToken(),
    }
  }

  @Mutation(() => ILogin)
  async refresh(@ReqGql() req: Request, @ResGql() res: Response) {
    const refreshToken = req.cookies['refresh_token']

    const result = await this.authService.refreshToken(refreshToken)

    res.cookie('refresh_token', result.getRefreshToken().getToken(), {
      httpOnly: true,
    })

    return {
      email: result.getIdToken().payload.email,
      username: result.getIdToken().payload['cognito:username'],
      access_token: result.getIdToken().getJwtToken(),
      refresh_token: result.getRefreshToken().getToken(),
    }
  }
}
