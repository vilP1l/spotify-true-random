import Link from 'next/link';
import styled from 'styled-components';
import { FaSpotify } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Header from '../components/Header';

export default function Login() {
  return (
    <Container>
      <Header />
      <Content>
        <h2>Authorization Required</h2>
        <p>Login with your Spotify account to continue.</p>
        <div style={{display: 'flex'}}>
          <SpotifyLoginButton href="/api/authurl">
            <FaSpotify size={20} />
            Login With Spotify
          </SpotifyLoginButton>
        </div>
      </Content>
    </Container>  
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
  width: 400px;
  margin: 1em;
  background: #191919;
  padding: 1em;
  border-radius: 10px;

  h1, h2, p {
    margin: 0;
  }

  h1 {
    margin-bottom: 2px;
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