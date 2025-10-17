import { useDispatch, useSelector } from "react-redux";
import PlayPause from "./PlayPause";
import { playPause, setActiveSong } from "../redux/features/playerSlice";
import { Link } from "react-router-dom";

const RelatedSongs = ({ data = [], isPlaying, activeSong, handlePlayClick }) => {
  const dispatch = useDispatch();

  const handlePause = () => {
    dispatch(playPause(false));
  };

  // Combine the related songs (artist + similar name), remove duplicates by song id
  const combinedSongs = Array.from(
    new Map(data.map((song) => [song.id, song])).values()
  ).slice(0, 20); // Take up to 20 songs (10 artist + 10 similar)

  return (
    <div className="flex flex-col gap-4">
      {combinedSongs.map((song, i) => (
        <div
          key={song.id || i}
          className="w-full flex flex-row items-center hover:bg-[#4c426e] py-2 px-4 rounded-lg cursor-pointer"
        >
          <h3 className="text-white font-bold text-base mr-3">{i + 1}.</h3>
          <div className="flex-1 flex flex-row justify-between items-center">
            <img
              className="w-12 h-12 rounded-lg"
              src={song.album?.cover_medium || song.artist?.picture_medium}
              alt={song.title}
            />
            <div className="flex-1 flex flex-col justify-center mx-3">
              <p className="text-white font-semibold text-sm hover:underline">
                <Link
                  to={`/songs/${song.id}`}
                  state={{ genre: song.__appliedGenre, artistName: song.artist?.name }}
                >
                  {song.title}
                </Link>
              </p>
              <p className="text-gray-400 text-xs hover:underline">
                {song.artist?.name || "Unknown Artist"}
              </p>
            </div>
          </div>
          <PlayPause
            isPlaying={isPlaying}
            activeSong={activeSong}
            song={song}
            handlePause={handlePause}
            handlePlay={() => handlePlayClick(song, i)}
          />
        </div>
      ))}
    </div>
  );
};

export default RelatedSongs;
