import { Home, Search, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent cursor-pointer"
          >
            TAMV
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/feed')}
              className="flex items-center gap-2 hover:text-blue-400 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Home</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <Search className="w-5 h-5" />
              <span className="hidden md:inline">Explore</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="hidden md:inline">Notifications</span>
            </button>
            <button
              onClick={() => navigate('/profile/me')}
              className="flex items-center gap-2 hover:text-blue-400 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:inline">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
