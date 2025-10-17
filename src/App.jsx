import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { Sidebar, MusicPlayer, TopPlay } from './components';
import { TopArtists, Discover, SongDetails, TopCharts } from './pages';
import PlaylistModal from "./components/PlaylistModal.jsx";
import { useGetDiscoverSongsQuery } from "./redux/services/shazamCore";
import PlaylistPage from './pages/PlaylistPage';
import Footer from './components/Footer';

const App = () => {
  const { activeSong } = useSelector((state) => state.player);

  const { data: discoverData } = useGetDiscoverSongsQuery({ searchTerm: "", genre: "pop" });
  const discoverSongs = discoverData?.data || [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 relative">
        <Sidebar />

        <div className="flex-1 flex flex-col bg-gradient-to-br from-black to-[#121286]">
          <div className="px-6 flex-1 overflow-y-scroll hide-scrollbar flex xl:flex-row flex-col-reverse">
            <div className="flex-1 h-fit pb-40">
              <Routes>
                <Route path="/" element={<Discover />} />
                <Route path="/top-artists" element={<TopArtists />} />
                <Route path="/top-charts" element={<TopCharts />} />
                <Route path="/songs/:songId" element={<SongDetails />} />
                <Route path="/playlist/:id" element={<PlaylistPage discoverSongs={discoverSongs} />} />
              </Routes>
            </div>

            <div className="xl:sticky relative top-0 h-fit">
              <TopPlay />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Always mounted modal */}
      <PlaylistModal discoverSongs={discoverSongs} />

      {/* Music Player inside a wrapper so it pushes footer down */}
      {activeSong?.title && (
        <div className="relative z-10">
          <MusicPlayer />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default App;

