import { createContext, PropsWithChildren, useMemo, useState } from 'react';
import { getCookie, setCookie } from 'cookies-next';

import Player from '../../player/player';

type ISpotifyContext = {
  client?: Player;
  playbackState?: SpotifyApi.CurrentPlaybackResponse;
}

export const SpotifyContext = createContext<ISpotifyContext>({});

export default function SpotifyProvider({ children }: PropsWithChildren) {
  const [playbackState, setPlaybackState] = useState<SpotifyApi.CurrentPlaybackResponse>();
  const [queueLoaded, setQueueLoaded] = useState(false);
  const [lastStateUpdate, setLastStateUpdate] = useState(Date.now());

  const client = useMemo(() => {
    const accessToken = getCookie('spotify_access_token') as string || '';
    const refreshToken = getCookie('spotify_refresh_token') as string || '';
    const tokenExpiry = getCookie('spotify_tokens_expiry') as string || '';

    const player = new Player({
      clientID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      auth: {
        accessToken,
        refreshToken,
        tokenExpiry: new Date(Number.parseInt(tokenExpiry)),
      }
    }, (tokens) => {
      setCookie('spotify_access_token', tokens.accessToken);
      setCookie('spotify_refresh_token', tokens.refreshToken);
      setCookie('spotify_tokens_expiry', `${tokens.tokenExpiry.valueOf()}`);
    });

    player.startPlaybackStatePoll();
  
    player.getPlaybackState().then(setPlaybackState);
    player.getQueue().then(() => setQueueLoaded(true));

    player.on('track-change', (s) => {
      console.log('track changed');
      setPlaybackState(s);
    });
    player.on('state-change', (state) => {
      setPlaybackState(state);
      setLastStateUpdate(Date.now());
    });
    player.on('error', console.error);

    return player;
  }, []);

  return (
    <SpotifyContext.Provider value={{ client, playbackState }}>
      {children}
    </SpotifyContext.Provider>
  )
}