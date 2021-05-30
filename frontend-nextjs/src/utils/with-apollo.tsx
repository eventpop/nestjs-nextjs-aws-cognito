// Ref: https://www.apollographql.com/blog/building-a-next-js-app-with-apollo-client-slash-graphql

import React from 'react'
import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'
import jwt from 'jsonwebtoken'
import { TokenRefreshLink } from 'apollo-link-token-refresh'
import fetch from 'cross-fetch'

import { useAuth } from './auth'

function initApolloClient(
  initialState = {},
  token,
  userId,
  setAuthToken,
  signOut
) {
  const cache = new InMemoryCache().restore(initialState)

  const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`,
    fetch,
    credentials: 'include',
  })

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }))

  const refreshLink = new TokenRefreshLink({
    accessTokenField: 'access_token',
    isTokenValidOrUndefined: () => {
      // No need to refresh if we don't have a userId
      if (!userId) {
        return true
      }

      // No need to refresh if token exists and is valid
      if (token && jwt.decode(token)['exp'] * 1000 > Date.now()) {
        return true
      }

      return false
    },
    fetchAccessToken: async () => {
      if (!userId) {
        // no need to refresh if userId is not defined
        return null
      }

      // Use fetch to access the refresh token mutation
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            query: `mutation {
                      refresh {
                        email
                        access_token
                      }
                    }`,
          }),
        }
      )
      return response.json()
    },
    handleFetch: (access_token) => {
      setAuthToken(access_token)
    },
    handleResponse: (_operation, _accessTokenField) => (response) => {
      if (!response) return { access_token: null }
      return { access_token: response.data?.refresh?.access_token }
    },
    handleError: (error) => {
      console.error('Cannot refresh access token:', error)
      signOut()
    },
  })

  const errorLink = onError(({ response, graphQLErrors }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.message === 'Unauthorized') {
          // Suppress intended unauthorized error on first page load, before storing access token in memory
          response.errors = null
        }
      }
    }
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined', // set to true for SSR
    // Ref: https://www.loudnoises.us/next-js-two-apollo-clients-two-graphql-data-sources-the-easy-way
    link: errorLink // Required Auth
    .concat(authLink)
    .concat((refreshLink as unknown) as ApolloLink)
    .concat(httpLink) // false or clientName undefined
    ,
    cache,
  })
}

// Use HOC instead of useApollo() hook since we have to maintain authState ourselves
// Usage : Wrap page component eg. `export default withApollo(Dashboard)`
const withApollo = (PageComponent) => {
  const WithApollo = ({
    apolloClient = null,
    apolloState = {},
    withoutApollo = false,
    ...pageProps
  }) => {
    const { authState, setAuthToken, signOut } = useAuth()

    // For testing with <MockedProvider> components
    if (withoutApollo) {
      return <PageComponent {...pageProps} />
    }

    const client =
      apolloClient ||
      initApolloClient(
        apolloState,
        authState?.token,
        authState?.email,
        setAuthToken,
        signOut
      )

    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    )
  }

  return WithApollo
}

export default withApollo
