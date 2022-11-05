import crypto from 'crypto';
import fetch from 'cross-fetch';

type AppDetails = {
  clientID: string;
  redirectURI: string;
  scope: string;
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}

export default class AuthManager {
  private appDetails: AppDetails;
  private verifiers: {[key: string]: string} = {};

  constructor(appDetails: AppDetails) {
    this.appDetails = appDetails;
  }

  private getRandomString(length: number = 64): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    return Array(length).fill(null).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private getCodeChallenge(verifier: string): string {
    return crypto.createHash('sha256')
      .update(verifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  getAuthURL(): string {
    const state = this.getRandomString(16);
    const codeVerifier = this.getRandomString();
    const codeChallenge = this.getCodeChallenge(codeVerifier);
    this.verifiers[state] = codeVerifier;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.appDetails.clientID,
      scope: this.appDetails.scope,
      redirect_uri: this.appDetails.redirectURI,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async listenForAuth(port: number): Promise<AuthTokens> {
    const http = await import('http');

    return new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('success');

        const u = new URL(req.url||'', `http://${req.headers.host}`);
        const code = u.searchParams.get('code');
        const state = u.searchParams.get('state');

        if (!code || !state) {
          server.close();
          reject('got no state or no code on http req');
          return;
        }

        server.close();
        const tokenDetails = await this.exchangeCode(code, state);
        resolve(tokenDetails);
      });

      server.listen(port);

      server.once('error', (e) => {
        reject(e);
      });
    });
  }

  async exchangeCode(code: string, state: string): Promise<AuthTokens> {
    const codeChallenge = this.verifiers[state];
    if (!codeChallenge) throw new Error('no code challenge for given state');

    const body = new URLSearchParams({
      code,
      redirect_uri: this.appDetails.redirectURI,
      grant_type: 'authorization_code',
      client_id: this.appDetails.clientID,
      code_verifier: codeChallenge,
    });

    try {
      const req = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: body.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      const json = await req.json(); 
      const date = new Date();
      date.setHours(date.getHours() + 1);
    
      return {
        accessToken: json.access_token,
        refreshToken: json.refresh_token,
        tokenExpiry: date,
      }
    } catch (error) {
      throw new Error(`failed to do http request: ${error}`);
    }
  }
}