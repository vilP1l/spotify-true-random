import Player from "../components/index/Player";
import SpotifyProvider from "../providers/SpotifyProvider";

export default function Home() {
  return (
    <SpotifyProvider>
      <Player />
    </SpotifyProvider>
  )
}
