// FILE: src/components/Sidebar.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { RiCloseLine } from 'react-icons/ri';
import { logo } from '../assets';
import { links } from '../assets/constants';
import { HiOutlineMenu } from "react-icons/hi";
import { useDispatch, useSelector } from 'react-redux';
import { openCreateModal } from '../redux/features/playlistslice';

const NavLinks = ({ handleClick }) => (
  <div className="mt-10">
    {links.map((item) => (
      <NavLink
        key={item.name}
        to={item.to}
        className="flex flex-row justify-start items-center my-8 text-sm font-medium text-gray-400 hover:text-cyan-400"
        onClick={() => handleClick && handleClick()}
      >
        <item.icon className="w-6 h-6 mr-2" />
        {item.name}
      </NavLink>
    ))}
  </div>
);

// New small component to render playlist names in sidebar
const PlaylistList = ({ playlists, onSelect }) => {
  return (
    <div className="mt-6 overflow-y-auto max-h-48">
      {playlists.length === 0 && (
        <div className="text-xs text-gray-400">No playlists yet</div>
      )}
      {playlists.map((p) => (
        <button
          key={p.id}
          className="w-full text-left truncate my-1 text-sm text-gray-300 hover:text-cyan-300"
          onClick={() => onSelect(p.id)}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
};

const Sidebar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const playlists = useSelector((state) => state.playlists.list);
  const navigateToPlaylist = (id) => {
    // We use a link approach so parent router handles it
    window.location.href = `/playlist/${id}`;
  };

  return (
    <>
      <div className="md:flex hidden flex-col w-[240px] py-10 px-4 bg-[#191624]">
        <img src={logo} alt="logo" className="w-full h-14 object-contain" />
        <NavLinks />

        {/* partition */}
        <div className="border-t border-white/10 mt-6 pt-4">
          <button
            className="w-full text-left text-sm font-medium text-gray-200 hover:text-cyan-300"
            onClick={() => dispatch(openCreateModal())}
          >
            + Create Playlist
          </button>

          <PlaylistList playlists={playlists} onSelect={navigateToPlaylist} />
        </div>
      </div>

      <div className="absolute md:hidden block top-6 right-3 z-20">
        {mobileMenuOpen ? (
          <RiCloseLine
            className="w-6 h-6 text-white mr-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />
        ) : (
          <HiOutlineMenu
            className="w-6 h-6 text-white mr-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
          />
        )}
      </div>

      <div
        className={`absolute top-0 h-screen w-2/3 bg-gradient-to-t from-white/10 to-[#483d8b] backdrop-blur-lg z-10 p-6 md:hidden transform transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "left-0" : "-left-full"
        }`}
      >
        <img src={logo} alt="logo" className="w-full h-14 object-contain" />
        <NavLinks handleClick={() => setMobileMenuOpen(false)} />

        <div className="border-t border-white/10 mt-6 pt-4">
          <button
            className="w-full text-left text-sm font-medium text-gray-200 hover:text-cyan-300"
            onClick={() => dispatch(openCreateModal())}
          >
            + Create Playlist
          </button>

          <PlaylistList playlists={playlists} onSelect={navigateToPlaylist} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;


