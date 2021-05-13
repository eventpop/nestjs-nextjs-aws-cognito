import { Test, TestingModule } from '@nestjs/testing'
import {
  CognitoUserSession,
  CognitoRefreshToken,
  CognitoAccessToken,
  CognitoIdToken,
} from 'amazon-cognito-identity-js'

import { AuthController } from './auth.controller'
import { AuthConfig } from './auth.config'
import { AuthService } from './auth.service'

const mockUserSession = jest.fn().mockResolvedValue(<CognitoUserSession>{
  getRefreshToken: jest
    .fn()
    .mockReturnValue(<CognitoRefreshToken>{ getToken: jest.fn() }),
  getAccessToken: jest.fn().mockReturnValue(<
    Pick<CognitoAccessToken, 'getJwtToken'>
  >{
    getJwtToken: jest.fn(),
  }),
  getIdToken: jest.fn().mockReturnValue(<Pick<CognitoIdToken, 'getJwtToken'>>{
    getJwtToken: jest.fn(),
    payload: {
      email: 'foo@example.com',
    },
  }),
  isValid: jest.fn(),
})

const mockAuthService: () => Partial<AuthService> = () => ({
  loginUser: mockUserSession,
  refreshToken: mockUserSession,
})

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthConfig,
        { provide: AuthService, useFactory: mockAuthService },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
