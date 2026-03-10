import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Landing } from './pages/Landing';
import { Feed } from './pages/Feed';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';

const queryClient = new QueryClient();

function LegacyUserRedirect() {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={`/profile/${username}`} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:username" element={<Profile />} />

          {/* Legacy redirects */}
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Navigate to="/feed" replace />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/user/:username" element={<LegacyUserRedirect />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
