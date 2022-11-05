import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import Player from "../player/player.js";
import AuthManager from "../player/auth.js";
import { getConfig, updateConfig } from "./config.js";

const args = await yargs(hideBin(process.argv))
  .option('auth', {
    type: 'boolean',
    description: 'Authorize with the spotify oauth api'
  })
  .parse();

const clientID = 'c9051a95acad4f0791d3c1b8d75658d5';

const auth = new AuthManager({
  clientID,
  redirectURI: 'http://localhost:9999/auth',
  scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read',
});

let config = getConfig();
if (args.auth || !config || !config.accessToken) {
  console.log(chalk.yellow('Not Authenticated'));
  console.log(`🔗 ${chalk.gray(auth.getAuthURL())}`);
  const authData = await auth.listenForAuth(9999);
  updateConfig(authData);
  config = getConfig();
  console.log(chalk.green('Authenticated Successfully'));
}

const player = new Player({
  auth: {
    accessToken: config?.accessToken || '',
    refreshToken: config?.refreshToken || '',
    tokenExpiry: config?.tokenExpiry || new Date(),
  },
  clientID,
}, (tokens) => {
  console.log(chalk.green('Refreshed Tokens Successfully'));
  updateConfig(tokens);
});

await player.refreshTokens();

const showCurrentState = async (state: SpotifyApi.CurrentPlaybackResponse) => {
  if (state.item && state.is_playing && state.item.type === 'track') {
    console.log(`${chalk.yellow('Now Playing:')} ${state.item.name} by ${state.item.artists[0].name} from ${state.context?.uri} ${state.shuffle_state ? chalk.blue('[SHUFFLED]') : ''}`);
  }
}

const state = await player.getPlaybackState()
  .catch((e) => {
    console.log(`${chalk.red('Failed to get initial playback state:')} ${e}`);
  });
if (state) showCurrentState(state);

player.on('track-change', (data) => {
  showCurrentState(data);
});

player.on('track-queued', (data) => {
  console.log(`${chalk.yellow('Queued Track:')} ${data.name} by ${data.artists[0].name}`);
});

player.on('error', (err) => {
  console.log(`${chalk.red('Player Error:')} ${err}`);
});
