import React from 'react'
import { useAuth } from '@src/utils/auth'
import withApollo from '@src/utils/with-apollo'
import { withAuth } from '@src/utils/with-auth'

export const Index = (): JSX.Element => {
  const { authState, isLoading, signOut } = useAuth()

  if (isLoading) {
    return <div>Loading</div>
  }

  return (
    <>
      <p>Authenticated</p>
      <p>Auth State: {JSON.stringify(authState)}</p>
      <button onClick={signOut} disabled={isLoading}>Sign Out</button>
    </>
  )
}

export default withAuth(withApollo(Index))
