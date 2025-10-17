import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const shazamCoreApi = createApi({
  reducerPath: "shazamCoreApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://music-player-zzfk.onrender.com/api" }),
  endpoints: (builder) => ({
    // Discover Songs — supports search + genre
    getDiscoverSongs: builder.query({
      query: ({ searchTerm, genre }) => {
        let query = "discover";
        const params = [];

        if (searchTerm) params.push(`q=${encodeURIComponent(searchTerm)}`);
        if (genre && genre !== "all" && genre !== "Unknown Genre") {
          params.push(`genre=${encodeURIComponent(genre)}`);
        }

        if (params.length > 0) query += `?${params.join("&")}`;
        return query;
      },
    }),

    // Song details
    getSongDetails: builder.query({
      query: (songId) => `/songs/details/${songId}`,
    }),

    // Related songs by artist
    getSongRelated: builder.query({
      query: (songId) => `/songs/related/${songId}`,
    }),

    // Top charts
    getTopCharts: builder.query({
      query: () => `/charts`,
    }),

    // Artist details
    getArtistDetails: builder.query({
      query: (artistId) => `/artists/details/${artistId}`,
    }),

    // Song lyrics using Lyrics.ovh
    getSongLyrics: builder.query({
      query: ({ artist, title }) =>
        `lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`,
    }),

    // Top songs by genre
    getGenreSongs: builder.query({
      query: (genre) => {
        if (!genre || genre === "Unknown Genre" || genre === "all") return "discover";
        return `discover?genre=${encodeURIComponent(genre)}`;
      },
    }),

    // ✅ Top artists (from Deezer)
    getTopArtists: builder.query({
      query: () => `/top-artists`,
    }),

    // ✅ All songs for an artist
    getArtistSongs: builder.query({
      query: (artistId) => `/artist-songs/${artistId}`,
    }),
  }),
});

// Export hooks
export const {
  useGetDiscoverSongsQuery,
  useGetSongDetailsQuery,
  useGetSongRelatedQuery,
  useGetTopChartsQuery,
  useGetArtistDetailsQuery,
  useGetSongLyricsQuery,
  useGetGenreSongsQuery,
  useGetTopArtistsQuery,  
  useGetArtistSongsQuery, 
} = shazamCoreApi;
