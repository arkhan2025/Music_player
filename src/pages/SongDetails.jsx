import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import RelatedSongs from "../components/RelatedSongs";
import Player from "../components/MusicPlayer/Player";
import PlayPause from "../components/PlayPause";
import { setActiveSong, playPause } from "../redux/features/playerSlice";
import {
  useGetSongDetailsQuery,
  useGetSongRelatedQuery,
  useGetSongLyricsQuery,
  useGetDiscoverSongsQuery,
} from "../redux/services/shazamCore";

const SongDetails = () => {
  const dispatch = useDispatch();
  const { songId } = useParams();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const location = useLocation();

  const [showPlayer, setShowPlayer] = useState(true);
  const [songGenre, setSongGenre] = useState("Unknown Genre");
  const [artistName, setArtistName] = useState("Unknown Artist");
  const [songTitle, setSongTitle] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: songData, isFetching: isFetchingSongDetails } =
    useGetSongDetailsQuery(songId);

  useEffect(() => {
    const passedArtist = location.state?.artistName;
    const passedTitle = location.state?.songTitle;

    setArtistName(passedArtist || songData?.artist?.name || "Unknown Artist");
    setSongTitle(passedTitle || songData?.title || "Unknown Title");
  }, [songData, location.state]);

  const { data: searchData } = useGetDiscoverSongsQuery(
    { searchTerm: `${songTitle} ${artistName}` },
    { skip: !songTitle || !artistName }
  );

  useEffect(() => {
    const matchedSong = searchData?.data?.[0];
    const genreFromSearch =
      matchedSong?.genres?.primary ||
      matchedSong?.genre ||
      matchedSong?.sections?.find((s) => s.type === "GENRE")?.text ||
      "Unknown Genre";

    setSongGenre(genreFromSearch);
  }, [searchData]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = docHeight - (scrollTop + windowHeight);
      setShowPlayer(distanceFromBottom > 40);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentArtwork =
    songData?.album?.cover_medium || songData?.images?.coverart || "";

  const albumTracksCount = songData?.album?.nb_tracks ?? "N/A";

  const { data: lyricsData, isFetching: isFetchingLyrics } =
    useGetSongLyricsQuery(
      { artist: artistName, title: songTitle },
      { skip: !artistName || !songTitle }
    );
  const lyricsText =
    lyricsData?.data?.[0]?.lyrics || lyricsData?.error || "Lyrics not available";

  const { data: artistRelatedData } = useGetSongRelatedQuery(songId);
  const artistSongs = artistRelatedData?.artistTopTracks?.slice(0, 10) || [];

  const similarSongs = searchData?.data
    ?.filter((s) => s.id !== songId)
    ?.slice(0, 10) || [];

  const combinedRelatedSongs = Array.from(
    new Map([...artistSongs, ...similarSongs].map((s) => [s.id, s])).values()
  );

  const handlePlayClick = () => {
    if (activeSong?.id === songData.id && isPlaying) {
      dispatch(playPause(false));
    } else {
      dispatch(setActiveSong({ song: songData, data: combinedRelatedSongs, i: 0 }));
      dispatch(playPause(true));
    }
  };

  if (isFetchingSongDetails)
    return <p className="text-white">Loading song data...</p>;
  if (!songData) return <p className="text-red-500">Song not found</p>;

  const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const isCurrent = activeSong?.id === songData.id;

  return (
    <div className="flex flex-col gap-6 p-4 relative pb-32">
      <h2 className="text-white text-3xl font-bold">{songTitle}</h2>
      <p className="text-gray-300">Artist: {artistName}</p>

      <div className="relative flex items-center gap-4 mt-4">
        {/* Track Image with Hover Overlay */}
        <div className="relative w-32 h-32 group cursor-pointer rounded-lg overflow-hidden">
          <img
            src={currentArtwork}
            alt={artistName}
            className="w-full h-full object-cover rounded-lg"
          />
          {/* Overlay */}
          <div
            className={`absolute inset-0 flex justify-center items-center bg-black/50 transition-opacity duration-300 rounded-lg
            ${isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            onClick={handlePlayClick}
          >
            <PlayPause
              isPlaying={isPlaying}
              activeSong={activeSong}
              song={songData}
              handlePause={() => dispatch(playPause(false))}
              handlePlay={handlePlayClick}
            />
          </div>
        </div>

        {/* Song Info */}
        <div className="text-gray-300">
          {songData?.album && (
            <>
              <p>Album: {songData.album.title}</p>
              <p>
                Track: {songData.track_position || 1} / {albumTracksCount}
              </p>
              <p>Released: {songData.album.release_date}</p>
            </>
          )}
          {songData.explicit_lyrics && (
            <span className="text-red-500 font-bold">Explicit</span>
          )}
          <p>Duration: {formatDuration(songData.duration)}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-gray-300">Lyrics:</p>
        <pre className="text-gray-200 whitespace-pre-wrap mt-2">
          {isFetchingLyrics ? "Loading lyrics..." : lyricsText}
        </pre>
      </div>

      {combinedRelatedSongs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-white text-2xl font-bold mb-4">
            Related Songs
          </h3>
          <RelatedSongs
            data={combinedRelatedSongs}
            isPlaying={isPlaying}
            activeSong={activeSong}
            handlePlayClick={(song, i) => {
              dispatch(setActiveSong({ song, data: combinedRelatedSongs, i }));
              dispatch(playPause(true));
            }}
          />
        </div>
      )}

      {showPlayer && (
        <div className="fixed bottom-0 left-0 w-full z-50 transition-transform duration-300">
          <Player
            activeSong={activeSong}
            isPlaying={isPlaying}
            volume={1}
            seekTime={0}
            repeat={false}
          />
        </div>
      )}
    </div>
  );
};

export default SongDetails;
