import fs from 'fs';
import os from 'os';

type Config = {
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

const configDir = `${os.homedir()}/.truerandom`;
const configPath = `${configDir}/config.json`;

export const getConfig = (): Config|undefined => {
  if (!fs.existsSync(configDir)) {
    const config = {};
    fs.mkdirSync(configDir);
    fs.writeFileSync(configPath, JSON.stringify(config));
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath).toString());
  return config;
}

export const updateConfig = (newConfig: Partial<Config>) => {
  const config = getConfig();
  fs.writeFileSync(configPath, JSON.stringify({ ...config, ...newConfig }, null, 2));
}