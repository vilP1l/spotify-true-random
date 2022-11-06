import EventEmitter from 'events';
import { delay, getSpotifyUriID } from './utils.js';
const baseURL = 'https://api.spotify.com/v1';
class Player extends EventEmitter {
    auth;
    clientID;
    authRefreshHandler;
    playbackState;
    queue;
    enabled = true;
    contextSongsList;
    lastSongsListFetch;
    listContextID;
    constructor(init, authRefreshHandler) {
        super();
        this.auth = init.auth;
        this.clientID = init.clientID;
        this.authRefreshHandler = authRefreshHandler;
    }
    async doRequest(path, options) {
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
                const paginationObject = json;
                if (!paginationObject.next)
                    return paginationObject;
                const nextItems = await this.doRequest(paginationObject.next.replace(baseURL, ''), options);
                paginationObject.items = [...paginationObject.items, ...nextItems.items];
                json = paginationObject;
            }
            return json;
        }
        catch (error) {
            throw new Error(`failed to do request to ${path}: ${error}`);
        }
    }
    async refreshTokens() {
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
                if (this.authRefreshHandler)
                    this.authRefreshHandler(this.auth);
                return true;
            }
            catch (error) {
                throw new Error(`failed to refresh token: ${error}`);
            }
        }
        return false;
    }
    handleTrackChange(json) {
        this.playbackState = json;
        this.getQueue();
        this.emit('track-change', json);
    }
    async getPlaybackState() {
        const json = await this.doRequest('/me/player');
        const playPauseChanged = this.playbackState?.is_playing !== json.is_playing;
        const shuffleChanged = this.playbackState?.shuffle_state !== json.shuffle_state;
        if (this.playbackState && (!json || !Object.keys(json).length))
            this.emit('state-change', json);
        if (playPauseChanged || shuffleChanged)
            this.emit('state-change', json);
        /*
          only attempt to queue a random song when there has been a previous one, this prevents
          songs from being queued on reloads, etc, and still works mostly the same because
          shuffle is enabled
        */
        if (this.playbackState?.item?.id !== json.item?.id) {
            if (this.enabled && this.playbackState && json.shuffle_state) {
                this.playbackState = json;
                this.queueRandomSong()
                    .then(() => this.handleTrackChange(json))
                    .catch((e) => this.emit('error', e));
            }
            else
                this.handleTrackChange(json);
        }
        return json;
    }
    async startPlaybackStatePoll() {
        while (true) {
            await this.getPlaybackState()
                .catch((e) => this.emit('error', e));
            await delay(2000);
        }
    }
    async getContextSongsList(uri) {
        let data = null;
        const id = getSpotifyUriID(uri);
        if (uri.includes(':user:')) {
            data = await this.doRequest('/me/tracks?limit=50', { handlePagination: true });
        }
        else if (uri.includes(':playlist:')) {
            data = await this.doRequest(`/playlists/${id}/tracks`, { handlePagination: true });
        }
        else if (uri.includes(':album:')) {
            const albumTracks = await this.doRequest(`/albums/${id}/tracks`, { handlePagination: true });
            albumTracks.items = albumTracks.items.map((a) => ({ track: a }));
            data = albumTracks;
        }
        else if (false && uri.includes(':artist:')) { // omitted for now
            data = await this.doRequest(`/artists/${id}/top-tracks?market=US`, { handlePagination: true });
        }
        else
            data = null;
        return data;
    }
    async getCachedContextSongsList(contextID) {
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
        if (!this.contextSongsList)
            return null;
        return this.contextSongsList;
    }
    async queueSong(uri) {
        await this.doRequest(`/me/player/queue?uri=${uri}`, {
            fetchOptions: {
                method: 'POST',
            },
        });
    }
    async getQueue() {
        const queue = await this.doRequest('/me/player/queue');
        this.queue = queue;
        this.emit('state-change', this.playbackState);
        return queue;
    }
    async queueRandomSong() {
        try {
            const contextUri = this.playbackState?.context?.uri;
            if (!contextUri)
                return;
            const list = await this.getCachedContextSongsList(contextUri);
            if (!list?.items.length)
                return;
            const track = list.items[Math.floor(Math.random() * list.items.length)].track;
            if (!track)
                return;
            await this.queueSong(track.uri);
            this.emit('track-queued', track);
        }
        catch (error) {
            throw new Error(`failed to queue random track: ${error}`);
        }
    }
    toggleEnableState() {
        this.enabled = !this.enabled;
        this.emit('state-change', this.playbackState);
    }
}
export default Player;
