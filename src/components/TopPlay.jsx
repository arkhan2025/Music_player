import { useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";

import PlayPause from "./PlayPause";
import { playPause, setActiveSong } from "../redux/features/playerSlice";
import { useGetTopChartsQuery, useGetDiscoverSongsQuery } from "../redux/services/shazamCore";
import { genres } from "../assets/constants";

const TopPlay = () => {
  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const { data: topData, isFetching, error } = useGetTopChartsQuery();

  const divRef = useRef(null);

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const songs = Array.isArray(topData?.data) ? topData.data : topData;
  const topPlays = songs?.slice(0, 5) || [];

  // 🧠 Fetch small samples for each genre
  const genreQueries = genres.map((g) =>
    useGetDiscoverSongsQuery({
      searchTerm: "",
      genre: g.value,
    })
  );

  const genreSamples = useMemo(() => {
    const result = {};
    genres.forEach((g, idx) => {
      const list = genreQueries[idx]?.data?.data || [];
      result[g.title] = list.slice(0, 20).map((s) => ({
        title: s.title?.toLowerCase(),
        artist: s.artist?.name?.toLowerCase(),
      }));
    });
    return result;
  }, [genreQueries]);

  // 🎯 Assign best matching genre to each top song
  const topSongsWithGenre = topPlays.map((song) => {
    const songTitle = song.title?.toLowerCase() || "";
    const songArtist = song.artist?.name?.toLowerCase() || "";

    let matchedGenre = "Unknown Genre";

    for (const [genreName, sampleList] of Object.entries(genreSamples)) {
      const match = sampleList.find(
        (s) =>
          (songTitle && s.title && songTitle.includes(s.title)) ||
          (songArtist && s.artist && songArtist.includes(s.artist))
      );
      if (match) {
        matchedGenre = genreName;
        break;
      }
    }

    return { ...song, __appliedGenre: matchedGenre };
  });

  const handlePauseClick = () => dispatch(playPause(false));

  const handlePlayClick = (song, i) => {
    dispatch(setActiveSong({ song, data: topSongsWithGenre, i }));
    dispatch(playPause(true));
  };

  if (isFetching) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Failed to load top charts</p>;

  return (
    <div
      ref={divRef}
      className="flex flex-col xl:ml-6 ml-0 xl:mb-0 mb-6 xl:max-w-[400px] max-w-full"
    >
      {/* 🎵 Top Charts */}
      <div className="w-full flex flex-col">
        <div className="flex justify-between items-center mt-10">
          <h2 className="text-white font-bold text-2xl">Top Charts</h2>
          <Link to="/top-charts">
            <p className="text-gray-300 text-base cursor-pointer hover:underline">
              See more
            </p>
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {topSongsWithGenre.map((song, i) => (
            <div
              key={song.id || i}
              className="w-full flex flex-row items-center hover:bg-[#4c426e] py-2 p-4 rounded-lg cursor-pointer"
            >
              <h3 className="text-white font-bold text-base mr-3">{i + 1}.</h3>
              <div className="flex-1 flex flex-row justify-between items-center">
                <img
                  className="w-12 h-12 rounded-lg"
                  src={song.album?.cover_medium}
                  alt={song.title}
                />
                <div className="flex-1 flex flex-col justify-center mx-3">
                  <p className="text-white font-semibold text-sm hover:underline">
                    <Link
                      to={`/songs/${song.id}`}
                      state={{ songTitle: song.title, artistName: song.artist?.name }}
                    >
                      {song.title}
                    </Link>
                  </p>
                  <p className="text-gray-400 text-xs hover:underline">
                    {song.artist?.name || "Unknown Artist"}
                  </p>
                  <p className="text-gray-500 text-xs italic">
                  </p>
                </div>
              </div>
              <PlayPause
                isPlaying={isPlaying}
                activeSong={activeSong}
                song={song}
                handlePause={handlePauseClick}
                handlePlay={() => handlePlayClick(song, i)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 👨‍🎤 Top Artists Carousel */}
      <div className="w-full flex flex-col mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-2xl">Top Artists</h2>
          <Link to="/top-artists">
            <p className="text-gray-300 text-base cursor-pointer hover:underline">
              See more
            </p>
          </Link>
        </div>

        <Swiper
          slidesPerView="auto"
          spaceBetween={15}
          freeMode
          centeredSlides
          centeredSlidesBounds
          className="mt-4"
        >
          {topSongsWithGenre.map((artist) => (
            <SwiperSlide
              key={artist.id}
              style={{ width: "25%", height: "auto" }}
              className="shadow-lg rounded-full animate-slideright"
            >
              <img
                src={
                  artist.album?.cover_medium ||
                  artist.album?.cover ||
                  artist.artist?.picture_medium ||
                  artist.contributors?.[0]?.picture_medium ||
                  "https://placehold.co/80x80?text=No+Image"
                }
                alt={artist.artist?.name || "artist"}
                className="rounded-full w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default TopPlay;
