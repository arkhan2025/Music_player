import { useDispatch, useSelector } from "react-redux";
import { useGetTopChartsQuery } from "../redux/services/shazamCore";
import { setActiveSong, playPause } from "../redux/features/playerSlice";
import SongCard from "../components/SongCard";
import Loader from "../components/Loader";
import Error from "../components/Error";

const TopCharts = () => {
  const dispatch = useDispatch();
  const { activeSong, isPlaying } = useSelector((state) => state.player);

  const { data, isFetching, error } = useGetTopChartsQuery();

  if (isFetching) return <Loader title="Loading Top Charts..." />;
  if (error) return <Error />;

  const top50Songs = data?.data?.slice(0, 50) || [];

  const handlePlayClick = (song, i) => {
    dispatch(setActiveSong({ song, data: top50Songs, i }));
    dispatch(playPause(true));
  };

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-white font-bold text-3xl mb-6">Top Charts</h2>
      <div className="flex flex-wrap sm:justify-start justify-center gap-8">
        {top50Songs.length > 0 ? (
          top50Songs.map((song, i) => {
            const genre = song.genre || "Unknown Genre";
            return (
              <SongCard
                key={song.id || i}
                song={song}
                i={i}
                data={top50Songs}
                activeSong={activeSong}
                isPlaying={isPlaying}
                genre={genre}
                onClick={() => handlePlayClick(song, i)}
              />
            );
          })
        ) : (
          <p className="text-gray-400 text-center w-full mt-10">
            No songs found.
          </p>
        )}
      </div>
    </div>
  );
};

export default TopCharts;
