import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { gql, useApolloClient, useMutation } from '@apollo/client'

import withApollo from '../../src/utils/with-apollo'
import { useAuth } from '../../src/utils/auth'
import { withoutAuth } from '../../src/utils/with-auth'

export const LOGIN_MUTATION = gql`
  mutation login($username: String!, $password: String!) {
    login(loginInput: { username: $username, password: $password }) {
      email
      username
      access_token
      refresh_token
    }
  }
`

export const Login = (): JSX.Element => {
  const { signIn } = useAuth()

  const router = useRouter()
  const client = useApolloClient()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [loginMutation, { loading, error }] = useMutation<{
    login: {
      username: string
      email: string
      access_token: string
      refresh_token: string
    }
  }>(LOGIN_MUTATION)

  const login = async () => {
    try {
      await client.resetStore()
      const { data } = await loginMutation({ variables: { username, password } })
      if (data?.login) {
        const username = data.login.username
        const token = data.login.access_token

        signIn(username, token)

        router.push('/graphql')
      }
    } catch (error) {
      console.error('Something went wrong during sign in:', error)
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <div>Username : <input type="text" value={username} onChange={(e) => setUsername(e.currentTarget.value)} /></div>
      <div>Password : <input type="text" value={password} onChange={(e) => setPassword(e.currentTarget.value)} /></div>

      {error && <p>{error.message}</p>}

      <button onClick={login} disabled={loading}>Submit</button>
    </div>
  )
}

export default withoutAuth(withApollo(Login))
