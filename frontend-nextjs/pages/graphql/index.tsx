import React from 'react'
import { useAuth } from '@src/utils/auth'
import withApollo from '@src/utils/with-apollo'
import { withAuth } from '@src/utils/with-auth'

export const ProtectedPage = (): JSX.Element => {
  const { authState, isLoading, signOut } = useAuth()

  if (isLoading) {
    return <div>Loading</div>
  }

  return (
    <>
      <h1>Protected Page</h1>
      <p>Auth State: {JSON.stringify(authState)}</p>
      <button onClick={signOut} disabled={isLoading}>Sign Out</button>
    </>
  )
}

export default withAuth(withApollo(ProtectedPage))
