import React, { useState } from 'react';
import { TaskList } from './components/TaskList';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { useAuth } from './hooks/useAuth';
import { useTenant } from './hooks/useTenant';

function App() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { tenant } = useTenant();
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showSignup) {
      return (
        <SignupForm
          onSuccess={() => window.location.reload()}
          onSwitchToLogin={() => setShowSignup(false)}
        />
      );
    }
    
    return (
      <LoginForm
        onSuccess={() => window.location.reload()}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {tenant?.name} | {user?.email}
              </div>
              <button
                onClick={logout}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <TaskList />
      </main>
    </div>
  );
}

export default App;
