// Ref: https://github.com/justincy/nextjs-client-auth-architectures/tree/master/static-ts/src/hocs
import React, { ReactElement } from 'react'
import { useRouter } from 'next/router'
import { NextPage } from 'next'

import { useAuth } from './auth'

const DEFAULT_USER_PATH = '/graphql'
const DEFAULT_LOGIN_PATH = '/graphql/login'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function DefaultLoadingFallback(): ReactElement {
  return <p>Loading...</p>
}

/**
 * Support client-side conditional redirecting based on the user's
 * authenticated state.
 *
 * @param WrappedComponent The component that this functionality
 * will be added to.
 * @param LoadingComponent The component that will be rendered while
 * the auth state is loading.
 * @param expectedAuth Whether the user should be authenticated for
 * the component to be rendered.
 * @param location The location to redirect to.
 */
export function withAuthRedirect<CP = Record<string, unknown>, IP = CP>({
  WrappedComponent,
  LoadingComponent = DefaultLoadingFallback,
  expectedAuth,
  location,
}: {
  WrappedComponent: NextPage<CP, IP>
  LoadingComponent?: NextPage
  expectedAuth: boolean
  location: string
}): NextPage<CP, IP> {
  const WithAuthRedirectWrapper: NextPage<CP, IP> = (props) => {
    const router = useRouter()
    const { isLoading, authState } = useAuth()

    if (isLoading) {
      return <LoadingComponent />
    }

    if (isBrowser() && expectedAuth !== !!authState?.email) {
      router.push(location)
      return <></>
    }
    return <WrappedComponent {...props} />
  }

  return WithAuthRedirectWrapper
}

/**
 * Require the user to be unauthenticated in order to render the component.
 * If the user is authenticated, forward to the given URL.
 */
export function withoutAuth<P>(
  WrappedComponent: NextPage<P>,
  location = DEFAULT_USER_PATH
): NextPage<P> {
  return withAuthRedirect({
    WrappedComponent,
    location,
    expectedAuth: false,
  })
}

/**
 * Require the user to be authenticated in order to render the component.
 * If the user isn't authenticated, forward to the given URL.
 */
export function withAuth<P>(
  WrappedComponent: NextPage<P>,
  location = DEFAULT_LOGIN_PATH
): NextPage<P> {
  return withAuthRedirect({
    WrappedComponent,
    location,
    expectedAuth: true,
  })
}
