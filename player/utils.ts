export const delay = async (ms: number) => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(null), ms);
  });
}

export const getSpotifyUriID = (uri: string): string => {
  const segments = uri.split(':');
  if (segments.length < 3) return '';
  return segments[2];
}