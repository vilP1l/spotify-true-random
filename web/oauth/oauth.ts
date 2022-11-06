// TODO: don't hardcode this

import AuthManager from "../../player/auth";

export const AuthClient = new AuthManager({
  clientID: 'c9051a95acad4f0791d3c1b8d75658d5',
  redirectURI: 'http://localhost:3001/api/oauth',
  scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read',
});