import { Test, TestingModule } from '@nestjs/testing'
import { AuthConfig } from './auth.config'
import { AuthService } from './auth.service'

const mockSignUp = jest.fn()

jest.mock('amazon-cognito-identity-js', () => {
  return {
    AuthenticationDetails: jest.fn(),
    CognitoUser: jest.fn().mockImplementation((data) => {
      return { authenticateUser: jest.fn() }
    }),
    CognitoUserAttribute: jest.fn(),
    CognitoUserPool: jest.fn().mockImplementation((data) => {
      const { UserPoolId, ClientId } = data

      return {
        userPoolId: UserPoolId,
        clientId: ClientId,
        getCurrentUser: jest.fn().mockReturnValue('cognitouserpool'),
        signUp: mockSignUp,
      }
    }),
  }
})

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthConfig,
          useValue: {
            userPoolId: 'foo',
            clientId: 'foo',
            region: 'foo',
            authority: 'foo',
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('#signUpUser', () => {
    it('creates new AWS Cognito user', async () => {
      expect(mockSignUp).not.toHaveBeenCalled()
      mockSignUp.mockImplementation(
        (username, _password, _attributeList, _null, callback) => {
          const error = null
          const result = { user: { getUsername: () => username } }
          callback(error, result)
        },
      )

      const result = await service.signUpUser({
        email: 'foo@example.com',
        username: 'foo',
        password: 'bar',
      })

      expect(mockSignUp).toHaveBeenCalled()

      expect(result.success).toEqual(true)
    })

    it('returns error if signup fails', async () => {
      mockSignUp.mockImplementation(
        (_name, _password, _attributeList, _null, callback) => {
          const error = new Error('User already exists')
          const result = {}

          callback(error, result)
        },
      )

      const result = await service.signUpUser({
        email: 'foo@example.com',
        username: 'foo',
        password: 'bar',
      })

      expect(result.success).toBeFalsy()
    })
  })
})
