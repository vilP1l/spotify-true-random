# Spotify True Random

A true random spotify shuffle mode

## How it works

Using Spotify Connect, the current playback state is polled, if a track change is detected and shuffle on the spotify client is enabled, a random track from the current playback source (album/liked songs/playlist) will be added to the queue.

## How to use

### CLI

`npx ts-node ./cli/index.ts`

It will host a temporary http server at localhost:9999 prompt you to authenticate with oauth, credentials are stored at ~/.truerandom/config.json

### Web [WIP]

https://spotify-true-random.vercel.app/

## Limitations

- Spotify does not have a queue clear endpoint, when switching playlists/albums/etc. it will play the rest of the queue, but will queue songs from the current playback source correctly
- Randomizing playback from an artist is not supported because the endpoints only return the top 5 tracks
