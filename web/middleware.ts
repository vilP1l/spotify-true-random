import { NextRequest, NextResponse } from 'next/server';

import Player from 'spotify-player/player';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value;
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value;
  const tokensExpiry = request.cookies.get('spotify_tokens_expiry')?.value;

  if (!accessToken || !refreshToken || !tokensExpiry) return NextResponse.rewrite(new URL('/login', request.url));

  const client = new Player({
    clientID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    auth: {
      accessToken,
      refreshToken,
      tokenExpiry: new Date(Number.parseInt(tokensExpiry)),
    }
  }, (tokens) => {
    const res = NextResponse.next();

    res.cookies.set('spotify_access_token', tokens.accessToken);
    res.cookies.set('spotify_refresh_token', tokens.refreshToken);
    res.cookies.set('spotify_tokens_expiry', `${tokens.tokenExpiry.valueOf()}`);

    return res;
  });

  try {
    const didRefresh = await client.refreshTokens();
    if (!didRefresh) {
      // do another api call to check auth since auth refresh api call is not done
      // TODO: distinguish 502 from 403
      await client.getPlaybackState();

      return NextResponse.next();
    }
  } catch (error) {
    console.error(`failed to refresh tokens:`, error);
    return NextResponse.rewrite(new URL('/login', request.url)); 
  }
};

export const config = {
  matcher: '/',
};