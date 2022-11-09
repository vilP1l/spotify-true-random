import Link from 'next/link';
import styled from 'styled-components';
import { FaSpotify } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Head from 'next/head';
import ExternalLink from '../components/ExternalLink';

export default function Login() {
  return (
    <>
      <Head>
        <title>Spotify True Random | Login</title>
      </Head>
      <Container>
        <Header />
        <Content>
          <h2>Authorization Required</h2>
          <h3>Login with your Spotify account to continue.</h3>
          <p>TrueRandom needs to be able to control and read the playback state using <ExternalLink href="https://support.spotify.com/us/article/spotify-connect/">Spotify Connect</ExternalLink> to function. Nothing is stored on a server, you can view the source code <ExternalLink href="https://github.com/vilP1l/spotify-true-random/tree/web">here</ExternalLink>.</p>
          <div style={{display: 'flex'}}>
            <SpotifyLoginButton href="/api/authurl">
              <FaSpotify size={20} />
              Login With Spotify
            </SpotifyLoginButton>
          </div>
        </Content>
      </Container>  
    </>
  )
}

const Container = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 600px;
  margin: 1em;
  background: #191919;
  padding: 1em;
  border-radius: 10px;

  h1, h2, h3, p {
    margin: 0;
  }

  h1 {
    margin-bottom: 2px;
  }

  h3 {
    margin-bottom: 10px;
    font-weight: 500;
    opacity: 0.9;
  }

  p {
    opacity: 0.8;
  }
`;

const SpotifyLoginButton = styled(motion(Link)).attrs({
  whileHover: {
    scale: 1.025,
  },
})`
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  background: #1DB954;
  padding: 1em;
  padding-top: 0.75em;
  padding-bottom: 0.75em;
  border-radius: 25px;
  margin-top: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.26);
`;