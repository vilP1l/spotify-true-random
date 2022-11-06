import EventEmitter from 'events';

import { AuthTokens } from './auth.js';
import { delay, getSpotifyUriID } from './utils.js';

type PlayerInit = {
  auth: AuthTokens;
  clientID: string;
}

type WrappedAlbumTrack = {
  track: SpotifyApi.TrackObjectSimplified
}

interface WrappedAlbumTracksResponse extends SpotifyApi.PagingObject<WrappedAlbumTrack> {}

type SongsListResponse = SpotifyApi.PlaylistTrackResponse | SpotifyApi.UsersSavedTracksResponse | WrappedAlbumTracksResponse;

type DoRequestOptions = {
  handleRatelimits?: boolean; // default: true
  handlePagination?: boolean;
  fetchOptions?: RequestInit;
  headers?: HeadersInit;
}

const baseURL = 'https://api.spotify.com/v1';

declare interface Player {
  on(event: 'auth-refresh', listener: (tokens: AuthTokens) => void): this;
  on(event: 'track-change', listener: (state: SpotifyApi.CurrentPlaybackResponse) => void): this;
  on(event: 'track-queued', listener: (track: SpotifyApi.TrackObjectSimplified) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
}

class Player extends EventEmitter {
  private auth: AuthTokens;
  private clientID: string;
  private authRefreshHandler?: (tokens: AuthTokens) => void;

  playbackState?: SpotifyApi.CurrentPlaybackResponse;
  private contextSongsList?: SongsListResponse|null;
  private lastSongsListFetch?: Date;
  private listContextID?: string;

  constructor(init: PlayerInit, authRefreshHandler?: (tokens: AuthTokens) => void) {
    super();
    this.auth = init.auth;
    this.clientID = init.clientID;
    this.authRefreshHandler = authRefreshHandler;
  }

  private async doRequest(path: string, options?: DoRequestOptions): Promise<any> {
    try {
      await this.refreshTokens();
      const req = await fetch(`${baseURL}${path}`, {
        headers: {
          Authorization: `Bearer ${this.auth.accessToken}`,
          ...options?.headers
        },
        ...options?.fetchOptions
      });
      if (req.status !== 200) {
        if (req.status === 429 && (!options || options.handleRatelimits === undefined)) {
          await delay(parseInt(req.headers.get("Retry-After") || ""));
          return this.doRequest(path);
        }
        if (req.status === 204) {
          return {};
        }
        const text = await req.text();
        throw new Error(text);
      }

      let json = await req.json();

      if (options?.handlePagination) {
        const paginationObject = json as SpotifyApi.PagingObject<any>;

        if (!paginationObject.next) return paginationObject;

        const nextItems = await this.doRequest(paginationObject.next.replace(baseURL, ''), options) as SpotifyApi.PagingObject<any>;
        paginationObject.items = [...paginationObject.items, ...nextItems.items];
        json = paginationObject;
      }

      return json;
    } catch (error) {
      throw new Error(`failed to do request to ${path}: ${error}`);
    }
  }

  async refreshTokens(): Promise<boolean> {
    if (+new Date() >= +new Date(this.auth.tokenExpiry)) {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientID,
        refresh_token: this.auth.refreshToken,
      });

      try {
        const req = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body.toString(),
        });

        if (req.status !== 200) {
          throw new Error(`status not 200: ${await req.text()}`);
        }

        const json = await req.json();

        this.auth.accessToken = json.access_token;
        this.auth.refreshToken = json.refresh_token;
        const date = new Date();
        date.setHours(date.getHours() + 1);
        this.auth.tokenExpiry = date;

        this.emit('auth-refresh', this.auth);
        if (this.authRefreshHandler) this.authRefreshHandler(this.auth);
        return true;
      } catch (error) {
        throw new Error(`failed to refresh token: ${error}`);
      }
    }

    return false;
  }

  async getPlaybackState() {
    const json = await this.doRequest('/me/player') as SpotifyApi.CurrentPlaybackResponse;
    if (this.playbackState?.item?.id !== json.item?.id) {
      this.playbackState = json;
      this.emit('track-change', json);
      if (this.playbackState.shuffle_state) this.queueRandomSong().catch((e) => this.emit('error', e));
    }
    return json;
  }

  startPlaybackStatePoll() {
    setInterval(() => {
      this.getPlaybackState()
        .catch((e) => this.emit('error', e));
    }, 3000);
  }

  async getContextSongsList(uri: string): Promise<SongsListResponse | null> {
    let data: SongsListResponse | null = null;
    const id = getSpotifyUriID(uri);

    if (uri.includes(':user:')) {
      data = await this.doRequest('/me/tracks?limit=50', { handlePagination: true }) as SpotifyApi.UsersSavedTracksResponse;
    } else if (uri.includes(':playlist:')) {
      data = await this.doRequest(`/playlists/${id}/tracks`, { handlePagination: true }) as SpotifyApi.PlaylistTrackResponse;
    } else if (uri.includes(':album:')) {
      const albumTracks = await this.doRequest(`/albums/${id}/tracks`, { handlePagination: true }) as SpotifyApi.AlbumTracksResponse;
      (albumTracks as unknown as SongsListResponse).items = albumTracks.items.map((a) => ({ track: a }));
      data = albumTracks as unknown as SongsListResponse;
    } else if (false && uri.includes(':artist:')) { // omitted for now
      data = await this.doRequest(`/artists/${id}/top-tracks?market=US`, { handlePagination: true });
    } else data = null;

    return data;
  }

  async getCachedContextSongsList(contextID: string): Promise<SongsListResponse | null> {
    if (!this.lastSongsListFetch || !this.contextSongsList || contextID !== this.listContextID) {
      const list = await this.getContextSongsList(contextID);
      this.contextSongsList = list;
      this.lastSongsListFetch = new Date();
      this.listContextID = contextID;
      return list;
    }

    const nextFetchTime = this.lastSongsListFetch;
    nextFetchTime.setMinutes(nextFetchTime.getMinutes() + 5);

    // doesn't need to be awaited because it's the same list 
    if (new Date() > nextFetchTime) {
      this.getContextSongsList(contextID)
        .then((list) => {
          this.contextSongsList = list;
          this.lastSongsListFetch = new Date();
          this.listContextID = contextID;
        });
    }

    if (!this.contextSongsList) return null;

    return this.contextSongsList;
  }

  async queueSong(uri: string) {
    await this.doRequest(`/me/player/queue?uri=${uri}`, {
      fetchOptions: {
        method: 'POST',
      },
    });
  }

  async getQueue(): Promise<SpotifyApi.UsersQueueResponse> {
    return this.doRequest('/me/player/queue');
  }

  async queueRandomSong() {
    try {
      const contextUri = this.playbackState?.context?.uri;
      if (!contextUri) return;
      const list = await this.getCachedContextSongsList(contextUri);
      if (!list?.items.length) return;
      const track = list.items[Math.floor(Math.random() * list.items.length)].track
      if (!track) return;
      await this.queueSong(track.uri)
      this.emit('track-queued', track);
    } catch (error) {
      throw new Error(`failed to queue random track: ${error}`);
    }
  }
}

export default Player;