import { UseGuards } from '@nestjs/common'
import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql'
import { User } from '@src/auth/jwt.strategy'
import { GqlAuthGuard } from '@src/guards/gql-auth.guard'
import { CurrentUser } from './current-user.decorator'

@ObjectType()
class UserInfo {
  @Field()
  id: string

  @Field()
  email: string

  @Field()
  username: string
}

@Resolver()
export class UserResolver {
  @Query(() => UserInfo)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User) {
    return user
  }
}
