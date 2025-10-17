import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// 🔹 Top charts (50 tracks)
app.get("/api/charts", async (req, res) => {
  try {
    const response = await fetch("https://api.deezer.com/chart/0/tracks?limit=50");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top charts" });
  }
});

// 🔹 Discover songs (search + optional genre)
app.get("/api/discover", async (req, res) => {
  try {
    const { q, genre } = req.query;
    const randomTerms = ["love", "summer", "night", "life", "dream", "dance", "heart"];
    let query = q || randomTerms[Math.floor(Math.random() * randomTerms.length)];

    if (genre && genre !== "all") query += ` ${genre}`;

    const response = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=50`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching discover songs" });
  }
});

// 🔹 Song details
app.get("/api/songs/details/:songId", async (req, res) => {
  const { songId } = req.params;
  try {
    const response = await fetch(`https://api.deezer.com/track/${songId}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch song details" });
  }
});

// 🔹 Related songs (same artist + genre)
app.get("/api/songs/related/:songId", async (req, res) => {
  const { songId } = req.params;
  try {
    const trackResp = await fetch(`https://api.deezer.com/track/${songId}`);
    const trackData = await trackResp.json();

    // 7 top songs by artist
    let artistTopTracks = [];
    if (trackData.artist && trackData.artist.id) {
      const artistTopResp = await fetch(
        `https://api.deezer.com/artist/${trackData.artist.id}/top?limit=7`
      );
      const artistTopData = await artistTopResp.json();
      artistTopTracks = artistTopData.data || [];
    }

    // 3 songs from same genre
    let genreTracks = [];
    let genreId = trackData.album?.genres?.data?.[0]?.id || trackData.artist?.genre;
    if (genreId) {
      const genreResp = await fetch(`https://api.deezer.com/genre/${genreId}/artists`);
      const genreData = await genreResp.json();
      if (genreData.data && genreData.data.length > 0) {
        const firstArtistId = genreData.data[0].id;
        const artistSongsResp = await fetch(
          `https://api.deezer.com/artist/${firstArtistId}/top?limit=3`
        );
        const artistSongsData = await artistSongsResp.json();
        genreTracks = artistSongsData.data || [];
      }
    }

    res.json({ artistTopTracks, genreTracks });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch related songs" });
  }
});

// 🔹 Top artists (50 artists)
app.get("/api/top-artists", async (req, res) => {
  try {
    const response = await fetch("https://api.deezer.com/chart/0/artists?limit=50");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top artists" });
  }
});

// 🔹 All songs by artist
app.get("/api/artist-songs/:artistId", async (req, res) => {
  try {
    const { artistId } = req.params;
    const response = await fetch(
      `https://api.deezer.com/artist/${artistId}/top?limit=50`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch artist songs" });
  }
});

// 🔹 Artist details
app.get("/api/artists/details/:artistId", async (req, res) => {
  try {
    const response = await fetch(`https://api.deezer.com/artist/${req.params.artistId}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch artist details" });
  }
});

// 🔹 Lyrics using Lyrics.ovh
app.get("/api/lyrics", async (req, res) => {
  const { artist, title } = req.query;
  if (!artist || !title)
    return res.status(400).json({ error: "Missing artist or title" });

  try {
    const response = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );
    const data = await response.json();
    res.json({ data: data.lyrics ? [{ lyrics: data.lyrics }] : [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lyrics" });
  }
});

// Start server
app.listen(5000, () => console.log("✅ Server running on port 5000"));
