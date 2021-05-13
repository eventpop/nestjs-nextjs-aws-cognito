import { Request, Response } from 'express'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'

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
  signUpUser: mockUserSession,
})

const mockReq = {
  cookies: {
    refresh_token: 'RefreshToken',
  },
} as unknown as Request

const mockRes = {
  cookie: jest.fn(),
} as unknown as Response

describe('AuthResolver', () => {
  let resolver: AuthResolver
  let service: jest.Mocked<AuthService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useFactory: mockAuthService },
      ],
    }).compile()

    resolver = module.get<AuthResolver>(AuthResolver)
    service = module.get<AuthService>(AuthService) as jest.Mocked<AuthService>
  })

  afterEach(() => {
    service.loginUser.mockClear()
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('#signUp', () => {
    it('calls signUpUser on service', async () => {
      resolver.signUp({
        email: 'foo@example.com',
        username: 'foo',
        password: 'bar',
      })

      expect(service.signUpUser).toHaveBeenCalledTimes(1)
    })

    describe('when it rejects', () => {
      it('throws an error', async () => {
        service.signUpUser.mockRejectedValueOnce(
          new Error('Authentication Failed'),
        )

        await expect(
          resolver.signUp({
            email: 'foo@example.com',
            username: 'foo',
            password: 'bar',
          }),
        ).rejects.toThrow(new Error('Authentication Failed'))
      })
    })
  })

  describe('#login', () => {
    it('calls loginUser on service', async () => {
      resolver.login({ username: 'foo', password: 'bar' }, mockRes)

      expect(service.loginUser).toHaveBeenCalledTimes(1)
    })

    describe('when it rejects', () => {
      it('throws an error', async () => {
        service.loginUser.mockRejectedValueOnce(
          new Error('Authentication Failed'),
        )

        await expect(
          resolver.login({ username: 'foo', password: 'bar' }, mockRes),
        ).rejects.toThrow(new Error('Authentication Failed'))
      })
    })
  })

  describe('#refresh', () => {
    it('calls refreshToken on service with refresh_token in httponly cookie', async () => {
      await resolver.refresh(mockReq, mockRes)

      expect(service.refreshToken).toHaveBeenCalledTimes(1)
    })
  })
})
