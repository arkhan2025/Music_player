// FILE: src/components/SongCard.jsx
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import PlayPause from "./PlayPause";
import { playPause, setActiveSong } from "../redux/features/playerSlice";
import formatSongData from "../redux/features/formatSongData";
import { addSongsToPlaylist, createPlaylistWithSong } from "../redux/features/playlistslice";

const SongCard = ({ song, isPlaying, activeSong, i, data, genre }) => {
  const dispatch = useDispatch();
  const { list: playlists } = useSelector((s) => s.playlists);
  const [menuOpen, setMenuOpen] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [popupMessage, setPopupMessage] = useState(""); 
  const [nameError, setNameError] = useState(""); 
  const menuRef = useRef();

  const handlePauseClick = (e) => {
    e.stopPropagation();
    dispatch(playPause(false));
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (activeSong?.id === song.id && isPlaying) {
      dispatch(playPause(false));
    } else {
      const formattedSong = formatSongData(song);
      dispatch(setActiveSong({ song: { ...formattedSong, genre }, data, i }));
      dispatch(playPause(true));
    }
  };

  // ✅ Directly add to existing playlist (one click)
  const handleAddToPlaylist = (playlist) => {
    dispatch(
      addSongsToPlaylist({
        playlistId: playlist.id,
        songs: [song],
      })
    );

    setPopupMessage(`Song added to "${playlist.name}" playlist`);
    setTimeout(() => setPopupMessage(""), 2000);

    setMenuOpen(false);
    setCreatingNew(false);
    setNewPlaylistName("");
    setNameError("");
  };

  // ✅ Create new playlist with song and name validation
  const handleCreatePlaylistWithSong = () => {
    const trimmedName = newPlaylistName.trim();
    if (!trimmedName) return;

    // Check for duplicate name (case-insensitive)
    const exists = playlists.some(
      (pl) => pl.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      setNameError("Playlist name already exists. Choose a different name.");
      return;
    }

    dispatch(
      createPlaylistWithSong({
        name: trimmedName,
        songs: [song],
      })
    );

    setPopupMessage(`Song added to "${trimmedName}" playlist`);
    setTimeout(() => setPopupMessage(""), 2000);

    setNewPlaylistName("");
    setCreatingNew(false);
    setMenuOpen(false);
    setNameError("");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setCreatingNew(false);
        setNameError("");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      className="relative w-[250px] h-[14rem] bg-white/5 backdrop-blur-md rounded-lg flex flex-col items-center p-4 overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl group"
    >
      {/* Track image */}
      <div
        className="relative w-full h-40 rounded-lg overflow-hidden cursor-pointer"
        onClick={handlePlayClick}
      >
        <img
          alt={song.title}
          src={song.album?.cover_medium || song.artist?.picture_medium}
          className="w-full h-full object-cover rounded-lg"
        />
        {/* Overlay for play/pause */}
        <div
          className={`absolute inset-0 flex justify-center items-center bg-black/40 transition-opacity duration-300 rounded-lg ${
            activeSong?.id === song.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <PlayPause
            isPlaying={isPlaying}
            activeSong={activeSong}
            song={song}
            handlePause={handlePauseClick}
            handlePlay={handlePlayClick}
          />
        </div>
      </div>

      {/* Track info */}
      <div className="mt-4 flex flex-col items-start w-full">
        <Link
          to={`/songs/${song.id}`}
          state={{ genre, artistName: song.artist?.name || "Unknown Artist" }}
          onClick={(e) => e.stopPropagation()}
          className="text-white font-semibold hover:underline cursor-pointer text-left block w-full truncate"
        >
          {song.title}
        </Link>

        <p className="text-gray-400 text-left w-full truncate">{song.artist?.name || "Unknown Artist"}</p>
        <p className="text-gray-400 text-left w-full truncate">{genre || "Unknown Genre"}</p>
      </div>

      {/* ⋮ Options Menu */}
      <div className="absolute bottom-2 right-2" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
            setCreatingNew(false);
          }}
          className="text-gray-300 hover:text-white p-1 transition-colors duration-200 text-lg font-bold"
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="absolute bottom-8 right-0 bg-[#1e1c30] border border-gray-700 rounded-lg shadow-lg w-52 z-50 text-sm text-white">
            <div className="max-h-48 overflow-y-auto">
              {playlists.length === 0 && !creatingNew ? (
                <p className="px-3 py-2 text-gray-400 text-xs">No playlists yet</p>
              ) : (
                playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(pl);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-white/20 truncate"
                  >
                    ➕ Add to {pl.name}
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-gray-700">
              {creatingNew ? (
                <div className="px-3 py-2 flex flex-col gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name"
                    className="w-full bg-[#2a273c] text-white px-2 py-1 rounded outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {nameError && (
                    <p className="text-red-500 text-xs">{nameError}</p>
                  )}
                  <button
                    onClick={handleCreatePlaylistWithSong}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                  >
                    Create & Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingNew(true);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-white/20"
                >
                  🆕 Create new playlist
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Popup message */}
      {popupMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded z-50 animate-fade-in-out">
          {popupMessage}
        </div>
      )}
    </div>
  );
};

export default SongCard;
