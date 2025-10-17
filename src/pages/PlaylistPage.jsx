// FILE: src/pages/PlaylistPage.jsx
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  removeSongsFromPlaylist,
  openAddSongsUI,
  removePlaylist,
} from '../redux/features/playlistslice';
import { setActiveSong, playPause } from '../redux/features/playerSlice';
import formatSongData from '../redux/features/formatSongData';
import PlayPause from '../components/PlayPause';

const PlaylistPage = ({ discoverSongs = [] }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const playlist = useSelector((s) => s.playlists.list.find((p) => p.id === id));
  const { activeSong, isPlaying } = useSelector((s) => s.player);

  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState({});
  const [shuffle, setShuffle] = useState(false);

  if (!playlist) return <div className="p-6 text-white">Playlist not found</div>;

  const toggle = (key) => setSelected((p) => ({ ...p, [key]: !p[key] }));

  // ✅ Format and optionally shuffle songs
  const songs = useMemo(() => {
    const formatted = playlist.songs.map(formatSongData);
    if (shuffle) {
      const shuffled = [...formatted].sort(() => Math.random() - 0.5);
      return shuffled;
    }
    return formatted;
  }, [playlist.songs, shuffle]);

  const handlePlay = (song, i) => {
    dispatch(setActiveSong({ song, data: songs, i }));
    dispatch(playPause(true));
  };

  const handlePause = () => {
    dispatch(playPause(false));
  };

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    dispatch(setActiveSong({ song: songs[0], data: songs, i: 0 }));
    dispatch(playPause(true));
  };

  const handleRemove = () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    dispatch(removeSongsFromPlaylist({ playlistId: id, songKeys: ids }));
    setSelected({});
    setEditing(false);

    if (playlist.songs.length - ids.length <= 0) {
      const confirmed = window.confirm('All songs removed. Delete the empty playlist?');
      if (confirmed) {
        dispatch(removePlaylist({ playlistId: id }));
        navigate('/');
      }
    }
  };

  const handleDeletePlaylist = () => {
    const confirmed = window.confirm('Are you sure you want to delete this playlist?');
    if (confirmed) {
      dispatch(removePlaylist({ playlistId: id }));
      navigate('/');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-white">{playlist.name}</h2>

      {/* 🧭 Playlist controls */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition"
          onClick={handlePlayAll}
        >
          ▶ Play
        </button>

        <button
          className="px-4 py-2 border border-gray-500 rounded text-white hover:bg-white/10 transition"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Done' : 'Edit'}
        </button>

        <button
          className="px-4 py-2 border rounded text-white hover:bg-white/10 transition"
          onClick={() => dispatch(openAddSongsUI({ playlistId: id, discoverSongs }))}
        >
          ＋ Add
        </button>

        <button
          className={`px-4 py-2 border rounded text-white transition ${
            shuffle ? 'bg-cyan-600 border-cyan-400' : 'hover:bg-white/10'
          }`}
          onClick={() => setShuffle((s) => !s)}
        >
          🔀 Shuffle {shuffle ? '(On)' : ''}
        </button>

        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={handleDeletePlaylist}
        >
          🗑 Delete Playlist
        </button>
      </div>

      {/* 🎵 Song List */}
      {songs.length === 0 && (
        <div className="text-gray-400 text-center mt-10">No songs in this playlist</div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {songs.map((song, i) => {
          const key = song.key?.toString() || song.id?.toString() || i.toString();
          const isCurrent = activeSong?.key === song.key;

          return (
            <div
              key={key}
              className={`w-full flex flex-row items-center justify-between hover:bg-[#4c426e] py-2 p-4 rounded-lg cursor-pointer transition ${
                isCurrent ? 'bg-[#3b3560]' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                {editing && (
                  <input
                    type="checkbox"
                    checked={!!selected[key]}
                    onChange={() => toggle(key)}
                    className="accent-cyan-500"
                  />
                )}
                <img
                  className="w-12 h-12 rounded-lg object-cover"
                  src={
                    song.images?.coverart ||
                    song.album?.cover_medium ||
                    song.album?.cover ||
                    song.artist?.picture_medium ||
                    'https://placehold.co/80x80?text=No+Image'
                  }
                  alt={song.title}
                />
                <div className="flex flex-col">
                  <p className="text-white font-semibold text-sm">{song.title}</p>
                  <p className="text-gray-400 text-xs">{song.subtitle}</p>
                </div>
              </div>

              {/* Play/Pause control */}
              <PlayPause
                isPlaying={isPlaying}
                activeSong={activeSong}
                song={song}
                handlePause={handlePause}
                handlePlay={() => handlePlay(song, i)}
              />
            </div>
          );
        })}
      </div>

      {/* 🗑 Remove selected songs */}
      {editing && songs.length > 0 && (
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            onClick={handleRemove}
          >
            Remove selected
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
