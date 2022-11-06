import AuthManager from "../../player/auth";

export const AuthClient = new AuthManager({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  redirectURI: process.env.SPOTIFY_REDIRECT_URI,
  scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read',
});