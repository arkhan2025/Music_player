// FILE: src/App.jsx
import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { Sidebar, MusicPlayer, TopPlay } from './components';
import { TopArtists, Discover, SongDetails, TopCharts } from './pages';
import PlaylistModal from "./components/PlaylistModal.jsx";
import { useGetDiscoverSongsQuery } from "./redux/services/shazamCore";
import PlaylistPage from './pages/PlaylistPage';

// ✅ Footer component
const Footer = () => (
  <footer className="w-full text-center py-4 text-gray-400 bg-black">
    &copy; {new Date().getFullYear()} Md Ashfaqur Rahman Khan. All rights reserved.
  </footer>
);

const App = () => {
  const { activeSong } = useSelector((state) => state.player);

  const { data: discoverData } = useGetDiscoverSongsQuery({ searchTerm: "", genre: "pop" });
  const discoverSongs = discoverData?.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black to-[#121286] text-white">
      <div className="relative flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <div className="px-6 h-[calc(100vh-72px)] overflow-y-scroll hide-scrollbar flex xl:flex-row flex-col-reverse">
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

      {/* ✅ Always mounted modal (listens for openCreateModal in Redux) */}
      <PlaylistModal discoverSongs={discoverSongs} />

      {activeSong?.title && (
        <div className="absolute bottom-12 left-0 right-0 h-28 flex animate-slideup bg-gradient-to-br from-white/10 to-[#2a2a80] backdrop-blur-lg rounded-t-3xl z-10">
        <MusicPlayer />
      </div>
      )}

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
};

export default App;
