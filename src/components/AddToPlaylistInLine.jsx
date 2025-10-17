// FILE: src/components/AddToPlaylistInline.jsx
// A small helper component you can drop into Discover or a SongCard
import React from 'react';
import { useDispatch } from 'react-redux';
import { openCreateModal } from '../redux/slices/playlistsSlice';

const AddToPlaylistInline = ({ onOpenWithSongs }) => {
  const dispatch = useDispatch();
  return (
    <button
      className="px-2 py-1 border rounded text-sm"
      onClick={() => {
        // if you want to open modal with songs, call the parent supplied handler
        if (onOpenWithSongs) return onOpenWithSongs();
        // fallback: open create modal (so user can create first)
        dispatch(openCreateModal());
      }}
    >
      + Playlist
    </button>
  );
};

export default AddToPlaylistInline;
