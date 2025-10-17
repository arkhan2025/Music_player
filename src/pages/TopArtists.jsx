import { useState } from "react";
import { useGetDiscoverSongsQuery } from "../redux/services/shazamCore";
import SongCard from "../components/SongCard";
import { useSelector, useDispatch } from "react-redux";
import { setActiveSong, playPause } from "../redux/features/playerSlice";
import { motion, AnimatePresence } from "framer-motion";

const TopArtists = () => {
  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state) => state.player);

  // Fetch initial top 50 songs (to get artists)
  const { data, isFetching, error } = useGetDiscoverSongsQuery({
    searchTerm: "",
    limit: 50,
  });

  const [expandedArtist, setExpandedArtist] = useState(null); // artist name expanded
  const [artistSongs, setArtistSongs] = useState([]); // songs for expanded artist
  const [loadingSongs, setLoadingSongs] = useState(false);

  if (isFetching) return <p className="text-white text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">Failed to load artists</p>;

  // Unique artists
  const artists = Array.from(
    new Map(data?.data?.map((song) => [song.artist?.name, song.artist])).values()
  ).slice(0, 50);

  const toggleArtist = async (artistName) => {
  if (expandedArtist === artistName) {
    // Collapse
    setExpandedArtist(null);
    setArtistSongs([]);
  } else {
    setExpandedArtist(artistName);
    setLoadingSongs(true);

    try {
      const res = await fetch(
        `https://shazam-core.p.rapidapi.com/v1/search/multi?query=${encodeURIComponent(
          artistName
        )}&search_type=SONGS`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
            "X-RapidAPI-Host": "shazam-core.p.rapidapi.com",
          },
        }
      );
      const json = await res.json();

      // Extract songs safely
      let songs = [];
      if (json.tracks?.hits) {
        songs = json.tracks.hits
          .map((hit) => hit.track)
          .filter((track) => track.artist?.name?.toLowerCase() === artistName.toLowerCase());
      }

      setArtistSongs(songs);
    } catch (err) {
      console.error("Failed to fetch songs for artist:", err);
      setArtistSongs([]);
    } finally {
      setLoadingSongs(false);
    }
  }
};

  const handlePlayClick = (song, i) => {
    dispatch(setActiveSong({ song, data: artistSongs, i }));
    dispatch(playPause(true));
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <div key={artist.name} className="flex flex-col">
            {/* Artist card */}
            <div
              onClick={() => toggleArtist(artist.name)}
              className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-md rounded-lg cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <img
                src={artist.picture_medium || artist.picture || "https://placehold.co/80x80?text=No+Image"}
                alt={artist.name}
                className="w-20 h-20 rounded-full object-cover mb-2"
              />
              <p className="text-white font-semibold text-center">{artist.name}</p>
              <span className="text-white text-xl mt-1">
                {expandedArtist === artist.name ? "−" : "+"}
              </span>
            </div>

            {/* Expanded songs */}
            <AnimatePresence>
              {expandedArtist === artist.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-y-auto mt-2 max-h-[80vh] space-y-4"
                >
                  {loadingSongs ? (
                    <p className="text-white text-center mt-4">Loading songs...</p>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      {artistSongs.map((song, i) => (
                        <SongCard
                          key={song.id || i}
                          song={song}
                          i={i}
                          data={artistSongs}
                          activeSong={activeSong}
                          isPlaying={isPlaying}
                          genre={""} // do not show genre
                          onClick={() => handlePlayClick(song, i)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopArtists;
