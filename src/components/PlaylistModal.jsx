import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  closeCreateModal, 
  createPlaylist, 
  addSongsToPlaylist, 
  closeAddSongsUI 
} from '../redux/features/playlistslice';
import formatSongData from '../redux/features/formatSongData';

const PlaylistModal = ({ discoverSongs = [] }) => {
  const dispatch = useDispatch();
  const { ui, list } = useSelector((s) => s.playlists);
  const open = ui.createOpen || ui.addUiOpen;

  // ✅ Use discoverSongs for new playlist creation
  const playlistSongs = (ui.createOpen ? discoverSongs : ui.addDiscoverSongs) || [];

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState({});
  const [newPlaylistId, setNewPlaylistId] = useState(null);

  // Format songs with cover, title, subtitle, duration
  const songsWithUID = useMemo(
    () =>
      playlistSongs.map((song) => {
        const s = formatSongData(song);
        return {
          ...s,
          __uid: s.key?.toString() || s.id?.toString() || Math.random().toString(),
          title: s.title || 'Unknown Title',
          subtitle: s.subtitle || s.artist || 'Unknown Artist',
          cover: s.images?.coverart || '',
          duration: s.duration || 0,
        };
      }),
    [playlistSongs]
  );

  useEffect(() => {
    if (!open) {
      setStep(1);
      setName('');
      setSelected({});
      setNewPlaylistId(null);
    }
  }, [open]);

  if (!open) return null;

  const toggle = (uid) => setSelected((s) => ({ ...s, [uid]: !s[uid] }));

  const handleCreate = () => {
    if (!name.trim()) return;
    const { payload } = dispatch(createPlaylist({ name: name.trim() }));
    setNewPlaylistId(payload.id);
    setStep(2); // go to song selection
  };

  const handleAdd = () => {
  const ids = Object.keys(selected).filter((k) => selected[k]);
  const songsToAdd = songsWithUID.filter((s) => ids.includes(s.__uid));
  if (songsToAdd.length === 0) return;

  const playlistId = newPlaylistId || ui.addForPlaylistId;
  const existingPlaylist = list.find((p) => p.id === playlistId);
  if (!existingPlaylist) return;

  // ✅ Add the *full song object* — not stripped-down fields
  dispatch(
    addSongsToPlaylist({
      playlistId,
      songs: songsToAdd.map((s) => ({
        ...s, // include all original data
        images: s.images || { coverart: s.cover },
        album: s.album || {},
        artist: s.artist || s.subtitle || {},
        genre: s.__appliedGenre || s.genre || "Unknown",
        hub: s.hub, // contains audio actions for playback
      })),
    })
  );

  dispatch(closeAddSongsUI());
  dispatch(closeCreateModal());
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#121027] w-[90%] md:w-3/4 lg:w-1/2 p-6 rounded-xl shadow-lg">
        {/* Step 1: Create playlist */}
        {step === 1 && ui.createOpen && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Create playlist</h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist name"
              className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 mb-4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                onClick={() => dispatch(closeCreateModal())}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-400 transition-colors"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select songs */}
        {(step === 2 || ui.addUiOpen) && (
          <div className="flex flex-col gap-4">
            <div className="overflow-y-auto max-h-96">
              {songsWithUID.length === 0 && (
                <div className="text-gray-400 text-sm">No songs available to add.</div>
              )}
              <ul className="space-y-3">
                {songsWithUID.map((s) => (
                  <li
                    key={s.__uid}
                    className="flex items-center justify-between bg-white/5 p-3 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selected[s.__uid]}
                        onChange={() => toggle(s.__uid)}
                        className="accent-cyan-500"
                      />
                      {s.cover && (
                        <img
                          src={s.cover}
                          alt={s.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium truncate text-white">{s.title}</div>
                        <div className="text-xs text-gray-400">{s.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">
                      {s.duration
                        ? Math.floor(s.duration / 60) +
                          ':' +
                          String(s.duration % 60).padStart(2, '0')
                        : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-400 transition-colors"
                onClick={handleAdd}
              >
                Add selected
              </button>
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                onClick={() => {
                  dispatch(closeAddSongsUI());
                  dispatch(closeCreateModal());
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistModal;
