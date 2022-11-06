import { serialize } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';

import { AuthClient } from '../../oauth/oauth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'no code, or no state provided' });
  }

  try {
    const tokens = await AuthClient.exchangeCode(code as string, state as string);

    const cookies = [
      serialize('spotify_access_token', tokens.accessToken, { path: '/' }),
      serialize('spotify_refresh_token', tokens.refreshToken, { path: '/' }),
      serialize('spotify_tokens_expiry', `${tokens.tokenExpiry.valueOf()}`, { path: '/' })
    ];

    res.setHeader('Set-Cookie', cookies)

    return res.redirect('/');
  } catch (error) {
    console.error('failed to exchange code:', error);

    return res.status(500).json({ error: 'failed to exchange code' });
  }
}