import { AuthConfig } from './auth.config'
import { Inject, Injectable } from '@nestjs/common'
import Cognito, {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'

export type ISignUpUserResponse = ISignUpUserSuccess | ErrorResponse
export type ILoginUserResponse = ILoginUserSuccess | ErrorResponse

interface ISignUpUserSuccess {
  success: true
  message: string
  data: {
    username: string
  }
}

interface ILoginUserSuccess {
  success: true
  message: string
  data: CognitoUserSession
}

interface ErrorResponse {
  success: false
  error_code: 'user_not_confirmed' | 'unhandled'
  message: string
}

@Injectable()
export class AuthService {
  private userPool: Cognito.CognitoUserPool

  constructor(
    @Inject('AuthConfig')
    private readonly authConfig: AuthConfig,
  ) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.authConfig.userPoolId,
      ClientId: this.authConfig.clientId,
    })
  }

  authenticateUser(user: {
    username: string
    password: string
  }): Promise<ILoginUserResponse> {
    const { username, password } = user

    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    })
    const userData = {
      Username: username,
      Pool: this.userPool,
    }

    const newUser = new CognitoUser(userData)

    return new Promise((resolve, reject) => {
      return newUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(<ILoginUserSuccess>{
            success: true,
            message: 'Logged In.',
            data: result,
          })
        },
        onFailure: (err) => {
          if (err.code == 'UserNotConfirmedException') {
            return resolve(<ErrorResponse>{
              success: false,
              error_code: 'user_not_confirmed',
              message: err.message,
            })
          }

          return resolve(<ErrorResponse>{
            success: false,
            error_code: 'unhandled',
            message: err.message,
          })
        },
        newPasswordRequired: (userAttributes) => {
          // Auto-complete new password challenge
          const sessionUserAttributes = userAttributes

          delete sessionUserAttributes.email_verified
          delete sessionUserAttributes.phone_number_verified

          newUser.completeNewPasswordChallenge(
            password,
            sessionUserAttributes,
            {
              onSuccess: (result) => {
                resolve(<ILoginUserSuccess>{
                  success: true,
                  message: 'Logged In.',
                  data: result,
                })
              },
              onFailure: (err) => {
                reject(err)
              },
            },
          )
        },
      })
    })
  }

  async signUpUser(user: {
    email: string
    username: string
    password: string
  }): Promise<ISignUpUserResponse> {
    return new Promise((resolve) => {
      const { email, username, password } = user

      const attributeList = []
      const dataEmail = {
        Name: 'email',
        Value: email,
      }

      const attributeEmail = new CognitoUserAttribute(dataEmail)

      attributeList.push(attributeEmail)

      this.userPool.signUp(
        username,
        password,
        attributeList,
        null,
        (err, result) => {
          if (err) {
            return resolve(<ErrorResponse>{
              success: false,
              message: err.message,
            })
          }

          const cognitoUser = result.user

          return resolve(<ISignUpUserSuccess>{
            success: true,
            message:
              'User signed up successfully, please confirm your user via Email/SMS.',
            data: { username: cognitoUser.getUsername() },
          })
        },
      )
    })
  }

  async refreshToken(refreshToken: string): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      const cognitoRefreshToken = new CognitoRefreshToken({
        RefreshToken: refreshToken,
      })

      const userData = {
        Username: '', // Required but not needed
        Pool: this.userPool,
      }

      const cognitoUser = new CognitoUser(userData)

      cognitoUser.refreshSession(
        cognitoRefreshToken,
        (err, result: CognitoUserSession) => {
          // TODO: Check if email matches
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        },
      )
    })
  }
}
