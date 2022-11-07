import styled from "styled-components";
import { useContext } from "react"
import Image from "next/image";
import { setCookie } from "cookies-next";

import { SpotifyContext } from "../../providers/SpotifyProvider"
import { PillButton } from "../Buttons";
import { FaSpotify } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import Header from "../Header";

export default function Player() {
  const spotify = useContext(SpotifyContext);

  const handleLogout = () => {
    setCookie('spotify_access_token', '');
    setCookie('spotify_refresh_token', '');
    setCookie('spotify_tokens_expiry', '');
    window.location.reload();
  };

  return (
    <Container>
      <Header />
      <Content>
        {
          spotify.playbackState?.shuffle_state && (
            <span className={`shuffle-${spotify.client?.enabled ? 'enable' : 'disable'}-state`}>TRUE RANDOM {spotify.client?.enabled ? 'ENABLED' : 'DISABLED'}</span>
          )
        }
        {
          spotify.playbackState?.item && spotify.playbackState.item.type === 'track' && (
            <>
              <div className="playback-state">
                <FaSpotify size={20} />
                <h3>{spotify.playbackState.is_playing ? 'Now Playing' : 'Playback Paused'}</h3>
              </div>
              <NowPlaying>
                <div className="image-container">
                  <Image fill src={spotify.playbackState.item.album.images[0].url} alt={spotify.playbackState.item.name} />
                </div>
                <div className="text-container">
                  <h3>{spotify.playbackState.item.name}</h3>
                  <h4>By <span className="artist-name">{spotify.playbackState.item.artists[0].name}</span></h4>
                </div>
              </NowPlaying>
              {
                !!spotify.client?.queue?.queue.length && spotify.client?.queue?.queue[0].type === 'track' && (
                  <Queue>
                    <h5>Up Next: <span className="track-info">{spotify.client?.queue?.queue[0].name} by {spotify.client?.queue?.queue[0].artists[0].name}</span></h5>
                  </Queue>
                )
              }
            </>
          )
        }
        {
          !spotify.playbackState?.item && (
            <h2>Nothing Playing</h2>
          )
        }
        <Buttons>
          <PillButton danger onClick={handleLogout}>
            <span>Log Out</span>
          </PillButton>
          <PillButton danger={spotify.client?.enabled} onClick={() => spotify.client?.toggleEnableState()}>
            {spotify.client?.enabled ? 'Disable' : 'Enable'}
          </PillButton>
        </Buttons>
      </Content>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px;
  max-width: calc(100vw - 2em);
  padding: 1em;
  margin: 1em;
  background: #191919;
  border-radius: 5px;

  h1, h2, h3, h4, h5 {
    margin: 0;
  }

  .shuffle-enable-state, .shuffle-disable-state {
    margin-right: auto;
    font-size: 12px;
    color: #1DB954;
    transition: color 0.2s;
    margin-bottom: 10px;
    border-bottom: 2px solid;
  }

  .shuffle-disable-state {
    color: #ff2626c4;
  }

  .playback-state {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  gap: 10px;

  .image-container {
    position: relative;
    height: 50px;
    aspect-ratio: 1;

    img {
      border-radius: 5px;
    }
  }

  .text-container {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .artist-name {
      border-bottom: 2px solid grey;
    }

    h4 {
      opacity: 0.8;
      font-weight: 500;
    }
  }
`;

const Queue = styled.div`
  margin-top: 10px;

  .track-info {
    font-weight: 500;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 10px;
`;