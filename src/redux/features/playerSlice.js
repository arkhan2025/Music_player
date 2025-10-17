import { createSlice } from "@reduxjs/toolkit";
import formatSongData from "./formatSongData";

const initialState = {
  currentSongs: [],
  currentIndex: 0,
  isActive: false,
  isPlaying: false,
  activeSong: null,
  genreListId: "",
  activeGenre: null, 
  shuffle: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setActiveSong: (state, action) => {
      const { song, data, i } = action.payload;

      // ✅ Format song data as before
      state.activeSong = formatSongData(song);

      // ✅ Capture genre info from the song (track-level)
      state.activeGenre =
        song?.genre ||
        song?.genres?.primary ||
        song?.primaryGenre ||
        song?.genre_name ||
        null;

      // ✅ Preserve current songs logic
      if (data?.tracks?.hits) {
        state.currentSongs = data.tracks.hits.map((hit) => hit.track || hit);
      } else if (data?.tracks) {
        state.currentSongs = data.tracks.map((track) => track.track || track);
      } else {
        state.currentSongs = data;
      }

      state.currentIndex = i;
      state.isActive = true;
    },

    nextSong: (state, action) => {
      if (!state.currentSongs?.length) return;

      let newIndex = action.payload;
      if (newIndex < 0) newIndex = state.currentSongs.length - 1;
      else if (newIndex >= state.currentSongs.length) newIndex = 0;

      state.currentIndex = newIndex;
      state.activeSong = formatSongData(state.currentSongs[newIndex]);

      // ✅ Update genre when moving next
      const newSong = state.currentSongs[newIndex];
      state.activeGenre =
        newSong?.genre ||
        newSong?.genres?.primary ||
        newSong?.primaryGenre ||
        newSong?.genre_name ||
        null;

      state.isActive = true;
    },

    prevSong: (state, action) => {
      if (!state.currentSongs?.length) return;

      let newIndex = action.payload;
      if (newIndex < 0) newIndex = state.currentSongs.length - 1;
      else if (newIndex >= state.currentSongs.length) newIndex = 0;

      state.currentIndex = newIndex;
      state.activeSong = formatSongData(state.currentSongs[newIndex]);

      // ✅ Update genre when moving previous
      const newSong = state.currentSongs[newIndex];
      state.activeGenre =
        newSong?.genre ||
        newSong?.genres?.primary ||
        newSong?.primaryGenre ||
        newSong?.genre_name ||
        null;

      state.isActive = true;
    },

    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },

    selectGenreListId: (state, action) => {
      state.genreListId = action.payload;
    },
    setShuffle: (state, action) => {
      state.shuffle = action.payload;
    },
  },
});

export const {
  setActiveSong,
  nextSong,
  prevSong,
  playPause,
  selectGenreListId,
  setRepeat,    
  setShuffle,
} = playerSlice.actions;

export default playerSlice.reducer;
