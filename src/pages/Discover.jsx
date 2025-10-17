import { useDispatch, useSelector } from "react-redux";
import { Error, Loader, SongCard } from "../components";
import { genres } from "../assets/constants";
import { useGetDiscoverSongsQuery } from "../redux/services/shazamCore";
import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { setActiveSong, playPause } from "../redux/features/playerSlice";


const Discover = () => {
  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state) => state.player);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const initialLoadRef = useRef(true); // track first render

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch songs by multiple genres
  const genreQueries = genres.map((g) =>
    useGetDiscoverSongsQuery({
      searchTerm: debouncedSearch,
      genre: g.value,
    })
  );

  const isFetching = genreQueries.some((q) => q.isFetching);
  const error = genreQueries.find((q) => q.error)?.error;

  // Combine all tracks with genre tagging
  const allTracks = useMemo(() => {
    let combined = [];
    genreQueries.forEach((q, idx) => {
      const genreName = genres[idx].title;
      const tracks =
        q.data?.data?.map((song) => ({
          ...song,
          __appliedGenre: genreName,
        })) || [];
      combined.push(...tracks);
    });
    return combined;
  }, [genreQueries]);

  // Apply local genre filter
  const filteredTracks =
    selectedGenre === "all"
      ? allTracks
      : allTracks.filter(
          (t) => t.__appliedGenre.toLowerCase() === selectedGenre.toLowerCase()
        );

  // Scroll to top only on initial load
  useEffect(() => {
    if (initialLoadRef.current) {
      window.scrollTo({ top: 0, behavior: "auto" });
      initialLoadRef.current = false;
    }
  }, []);

  // Handle playing a song
  const handlePlayClick = (song, i) => {
    if (activeSong?.id === song.id && isPlaying) {
      // ✅ If same song is playing → pause instead of restarting
      dispatch(playPause(false));
    } else {
      dispatch(setActiveSong({ song, data: filteredTracks, i }));
      dispatch(playPause(true));
    }
  };

  // Handle pause
  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  if (isFetching) return <Loader title="Loading Discover Songs..." />;
  if (error) return <Error />;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 mb-6">
        <h2 className="font-bold text-3xl text-white mb-4 sm:mb-0">Discover</h2>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Search songs or artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <select
            className="bg-gray-800 text-white px-4 py-2 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="all">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.value} value={genre.value}>
                {genre.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Songs */}
      <div className="flex flex-wrap sm:justify-start justify-center gap-8">
        {filteredTracks.length > 0 ? (
          filteredTracks.map((song, i) => {
            const songGenre = song.__appliedGenre || "Unknown Genre";
            const artistName =
              song.artist?.name || song.artists?.[0]?.name || "Unknown Artist";

            const isActive = activeSong?.id === song.id;

            return (
              <SongCard
                key={`${song.id}-${i}`}
                song={song}
                i={i}
                data={filteredTracks}
                activeSong={activeSong}
                isPlaying={isPlaying}
                genre={songGenre}
                handlePlay={() => handlePlayClick(song, i)}
                handlePause={handlePauseClick}
                isActive={isActive} // show overlay
              >
                <Link
                  to={`/songs/${song.id}`}
                  state={{ genre: songGenre, artistName }}
                  className="text-white font-semibold hover:underline"
                  onClick={(e) => e.stopPropagation()} // prevent playing
                >
                  {song.title}
                </Link>
              </SongCard>
            );
          })
        ) : (
          <p className="text-gray-400 text-center w-full mt-10">
            No songs found. Try another search or genre.
          </p>
        )}
      </div>
    </div>
  );
};

export default Discover;
