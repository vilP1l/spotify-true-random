import Link from 'next/link';
import styled from 'styled-components';
import { FaSpotify } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Login() {
  return (
    <Container>
      <Content>
        <h1>Authorization Required</h1>
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
  width: 30%;

  h1, p {
    margin: 0;
  }

  h1 {
    margin-bottom: 2px;
  }
`;

const SpotifyLoginButton = styled(motion(Link)).attrs({
  whileHover: {
    scale: 1.05,
  }
})`
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  background: #1DB954;
  padding: 1em;
  border-radius: 25px;
  margin-top: 20px;
`;