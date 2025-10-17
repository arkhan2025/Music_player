import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  ui: {
    createOpen: false,
    addUiOpen: false,
    addForPlaylistId: null,
    addDiscoverSongs: [],
  },
};

// Persist/load helpers
const persist = (state) => {
  try {
    localStorage.setItem('playlists_v1', JSON.stringify(state.list));
  } catch {}
};

const load = () => {
  try {
    const raw = localStorage.getItem('playlists_v1');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState: { ...initialState, list: load() },
  reducers: {
    // ✅ Accept discoverSongs payload for modal
    openCreateModal(state, action) {
      state.ui.createOpen = true;
      state.ui.addDiscoverSongs = action?.payload?.discoverSongs || [];
    },
    closeCreateModal(state) {
      state.ui.createOpen = false;
      state.ui.addDiscoverSongs = [];
    },
    createPlaylist: {
      reducer(state, action) {
        state.list.push(action.payload);
        persist(state);
      },
      prepare({ name }) {
        return { payload: { id: nanoid(), name, songs: [] } };
      },
    },
    addSongsToPlaylist(state, action) {
      const { playlistId, songs } = action.payload;
      const playlist = state.list.find((p) => p.id === playlistId);
      if (!playlist) return;

      playlist.songs = playlist.songs || [];
      const existingKeys = new Set(
        playlist.songs.map((s) => s.key?.toString() || s.id?.toString())
      );
      songs.forEach((s) => {
        const k = s.key?.toString() || s.id?.toString();
        if (!existingKeys.has(k)) {
          playlist.songs.push({ ...s });
          existingKeys.add(k);
        }
      });
      persist(state);
    },
    removeSongsFromPlaylist(state, action) {
      const { playlistId, songKeys } = action.payload;
      const pl = state.list.find((p) => p.id === playlistId);
      if (!pl) return;
      pl.songs = pl.songs.filter(
        (s) => !songKeys.includes(s.key?.toString() || s.id?.toString())
      );
      persist(state);
    },
    openAddSongsUI(state, action) {
      state.ui.addUiOpen = true;
      state.ui.addForPlaylistId = action.payload.playlistId;
      state.ui.addDiscoverSongs = action.payload.discoverSongs || [];
    },
    closeAddSongsUI(state) {
      state.ui.addUiOpen = false;
      state.ui.addForPlaylistId = null;
      state.ui.addDiscoverSongs = [];
    },
    removePlaylist(state, action) {
      const { playlistId } = action.payload;
      state.list = state.list.filter((p) => p.id !== playlistId);
      persist(state);
    },
  },
});

// ✅ New thunk to create playlist + add song immediately
export const createPlaylistWithSong = ({ name, songs }) => (dispatch, getState) => {
  const action = dispatch(playlistsSlice.actions.createPlaylist({ name }));
  const newPlaylistId = action.payload.id;

  dispatch(
    playlistsSlice.actions.addSongsToPlaylist({
      playlistId: newPlaylistId,
      songs,
    })
  );
};

export const {
  openCreateModal,
  closeCreateModal,
  createPlaylist,
  addSongsToPlaylist,
  removeSongsFromPlaylist,
  openAddSongsUI,
  closeAddSongsUI,
  removePlaylist,
} = playlistsSlice.actions;

export default playlistsSlice.reducer;
