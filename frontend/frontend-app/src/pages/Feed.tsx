import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export function Feed() {
  const posts = [
    {
      id: 1,
      author: { name: 'Sarah Chen', username: '@sarahchen', avatar: '👩‍💻' },
      content: 'Just launched my new 3D portfolio! Check it out in VR mode 🚀',
      likes: 234,
      comments: 45,
      timestamp: '2h ago',
    },
    {
      id: 2,
      author: { name: 'Alex Rivera', username: '@alexr', avatar: '🎨' },
      content: 'The future of social media is immersive. TAMV is leading the way!',
      likes: 567,
      comments: 89,
      timestamp: '5h ago',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Create Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <textarea
            placeholder="What's on your mind?"
            className="w-full bg-transparent border-none outline-none resize-none text-lg"
            rows={3}
          />
          <div className="flex justify-end mt-4">
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all">
              Post
            </button>
          </div>
        </motion.div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                    {post.author.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{post.author.name}</div>
                    <div className="text-sm text-gray-400">
                      {post.author.username} · {post.timestamp}
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-lg mb-4">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center gap-6 text-gray-400">
                <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
