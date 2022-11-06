import styled from "styled-components";
import { useContext } from "react"
import Image from "next/image";

import { SpotifyContext } from "../../providers/SpotifyProvider"

export default function Player() {
  const client = useContext(SpotifyContext);

  return (
    <Container>
      <Content>
        {
          client.playbackState?.shuffle_state && (
            <span className="shuffle-enable-state">TRUE SHUFFLE ENABLED</span>
          )
        }
        <h3>Now Playing</h3>
        {
          client.playbackState?.item && client.playbackState.item.type === 'track' && (
            <>
              <NowPlaying>
                <div className="image-container">
                  <Image fill src={client.playbackState.item.album.images[0].url} alt={client.playbackState.item.name} />
                </div>
                <div className="text-container">
                  <h2>{client.playbackState.item.name}</h2>
                  <h4>By <span className="artist-name">{client.playbackState.item.artists[0].name}</span></h4>
                </div>
              </NowPlaying>
              {/* <Queue>
                <h5>Up Next: <span className="track-info">{client.playbackState.item.name} by {client.playbackState.item.artists[0].name}</span></h5>
              </Queue> */}
            </>
          )
        }
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
  padding: 1em;
  margin: 2em;
  background: #191919;
  border-radius: 5px;

  h1, h2, h3, h4, h5 {
    margin: 0;
  }

  .shuffle-enable-state {
    margin-left: auto;
    margin-right: auto;
    font-size: 12px;
    position: relative;
    color: #1DB954;

    ::before, ::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 2px;
      background: #1DB954;
      top: 50%;
    }

    ::before {
      right: calc(100% + 2px);
    }

    ::after {
      left: calc(100% + 2px);
    }
  }
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  /* margin-bottom: 10px; */
  gap: 10px;

  .image-container {
    position: relative;
    height: 50px;
    aspect-ratio: 1;
  }

  .text-container {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .artist-name {
      border-bottom: 2px solid grey;
    }

    h4 {
      opacity: 0.7;
    }
  }
`;

const Queue = styled.div`
  .track-info {
    font-weight: 500;
  }
`;