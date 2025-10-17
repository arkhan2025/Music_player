// FILE: src/redux/features/formatSongData.js
const formatSongData = (song) => {
  if (!song) return {};

  return {
    ...song,
    key: song.key || song.id,
    id: song.id || song.key,
    title: song.title || song.name || "Unknown Title",
    subtitle:
      song.artist?.name ||
      song.subtitle ||
      song.artists?.[0]?.name ||
      "Unknown Artist",
    images: song.images || {
      coverart:
        song.album?.cover_medium ||
        song.album?.cover_big ||
        song.artist?.picture_medium ||
        "",
    },
    album: song.album || {},
    artist: song.artist || song.artists?.[0] || {},
    genre: song.__appliedGenre || song.genre || "Unknown",
    duration: song.duration || song.duration_ms / 1000 || 0,
    hub: song.hub || {
      actions: [
        {},
        {
          uri:
            song.preview ||
            song.hub?.actions?.[1]?.uri ||
            song.hub?.actions?.[0]?.uri ||
            "",
        },
      ],
    },
    url:
      song.hub?.actions?.[0]?.uri ||
      song.hub?.actions?.[1]?.uri ||
      song.preview ||
      null,
  };
};

export default formatSongData;
