import type { AppProps } from 'next/app';
import Head from 'next/head';

import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Spotify True Random</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
