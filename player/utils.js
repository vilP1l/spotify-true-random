export const delay = async (ms) => {
    await new Promise((resolve) => {
        setTimeout(() => resolve(null), ms);
    });
};
export const getSpotifyUriID = (uri) => {
    const segments = uri.split(':');
    if (segments.length < 3)
        return '';
    return segments[2];
};
