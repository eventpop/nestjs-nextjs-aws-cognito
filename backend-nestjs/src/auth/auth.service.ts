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

export interface ISignUpUserSuccess {
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
  error_code: 'user_not_confirmed' | 'new_password_required' | 'unhandled_error'
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

  loginUser(user: {
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
          let error_code = 'unhandled'

          switch (err.code) {
            case 'NotAuthorizedException':
              error_code = 'incorrect_credentials'
              break
            case 'UserNotConfirmedException':
              error_code = 'user_not_confirmed'
              break
            default:
              console.log(JSON.stringify(err))
              break
          }

          return resolve(<ErrorResponse>{
            success: false,
            error_code,
            message: err.message,
          })
        },
        newPasswordRequired: (_userAttributes) => {
          return resolve(<ErrorResponse>{
            success: false,
            error_code: 'new_password_required',
            message: 'New password required.',
          })

          // Auto-complete new password challenge
          // TODO: Move to other API endpoint
          // const sessionUserAttributes = userAttributes

          // delete sessionUserAttributes.email_verified
          // delete sessionUserAttributes.phone_number_verified

          // newUser.completeNewPasswordChallenge(
          //   password,
          //   sessionUserAttributes,
          //   {
          //     onSuccess: (result) => {
          //       resolve(<ILoginUserSuccess>{
          //         success: true,
          //         message: 'Logged In.',
          //         data: result,
          //       })
          //     },
          //     onFailure: (err) => {
          //       reject(err)
          //     },
          //   },
          // )
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

  async confirmUser({ username, code }) {
    return new Promise((resolve) => {
      const userData = {
        Username: username,
        Pool: this.userPool,
      }

      const cognitoUser = new CognitoUser(userData)

      cognitoUser.confirmRegistration(code, true, (err) => {
        if (err) {
          let error_code = 'unhandled'

          switch (err.code) {
            case 'ExpiredCodeException':
              error_code = 'code_expired'
              break
            case 'CodeMismatchException':
              error_code = 'code_mismatch'
              break
            default:
              console.log(JSON.stringify(err))
              break
          }

          return resolve(<ErrorResponse>{
            success: false,
            error_code,
            message: err.message,
          })
        }

        resolve({ success: true, message: 'User confirmed successfully.' })
      })
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
