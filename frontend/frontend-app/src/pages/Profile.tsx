import { motion } from 'framer-motion';
import { Settings, MapPin, Calendar } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export function Profile() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          {/* Cover Image */}
          <div className="h-48 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 mb-16" />

          {/* Profile Info */}
          <div className="absolute -bottom-12 left-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-black flex items-center justify-center text-5xl">
              👤
            </div>
          </div>

          <button className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-xl hover:bg-black/70 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">John Doe</h1>
          <p className="text-gray-400 mb-4">@johndoe</p>

          <p className="text-lg mb-4">
            Building the future of social media 🚀 | Tech enthusiast | 3D artist
          </p>

          <div className="flex items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined January 2024</span>
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <div>
              <span className="font-bold">1,234</span>
              <span className="text-gray-400 ml-1">Following</span>
            </div>
            <div>
              <span className="font-bold">5,678</span>
              <span className="text-gray-400 ml-1">Followers</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-8">
          <div className="flex gap-8">
            <button className="pb-4 border-b-2 border-blue-500 text-blue-500">Posts</button>
            <button className="pb-4 text-gray-400 hover:text-white transition-colors">Media</button>
            <button className="pb-4 text-gray-400 hover:text-white transition-colors">Likes</button>
          </div>
        </div>

        {/* Posts */}
        <div className="text-center text-gray-400 py-12">No posts yet</div>
      </div>
    </div>
  );
}
