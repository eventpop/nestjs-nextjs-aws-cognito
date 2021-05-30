import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'

const nodeEnv = process.env.NODE_ENV || 'development'

const GraphQL = GraphQLModule.forRoot({
  autoSchemaFile: 'schema.graphql',
  debug: nodeEnv == 'development',
  playground: nodeEnv == 'development',
  context: ({ req, res }) => ({ req, res }), // Required for cookies
})

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env'],
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    GraphQL,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
