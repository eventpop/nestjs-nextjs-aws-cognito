import Head from 'next/head'
import Link from 'next/link'
import React from 'react'

export const Home = (): JSX.Element => (
  <div className="container">
    <Head>
      <title>Create Next App</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1>GraphQL</h1>
      <p><Link href="/graphql/login"><a>Login</a></Link></p>
      <p><Link href="/graphql"><a>Protected Page</a></Link></p>
      <p><Link href="#"><a>Sign up (TODO)</a></Link></p>

      <h1>REST</h1>
      <p>WIP</p>
    </main>
  </div>
)

export default Home
