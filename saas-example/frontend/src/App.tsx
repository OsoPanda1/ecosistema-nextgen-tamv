import React from 'react';
import { TaskList } from './components/TaskList';
import { AuthContext, useAuthState } from './hooks/useAuth';
import { TenantContext, useTenantState } from './hooks/useTenant';

const App: React.FC = () => {
  const authState = useAuthState();
  const tenantState = useTenantState();

  // Show loading screen while initializing
  if (authState.loading || tenantState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!authState.user) {
    return (
      <AuthContext.Provider value={authState}>
        <LoginForm />
      </AuthContext.Provider>
    );
  }

  // Main application
  return (
    <AuthContext.Provider value={authState}>
      <TenantContext.Provider value={tenantState}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">
                  Task Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your team's tasks and projects
                </p>
              </div>
              <div className="p-6">
                <TaskList />
              </div>
            </div>
          </main>
        </div>
      </TenantContext.Provider>
    </AuthContext.Provider>
  );
};

const LoginForm: React.FC = () => {
  const { login } = useAuthState();
  const [email, setEmail] = React.useState('john@acme.com');
  const [password, setPassword] = React.useState('password');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Multi-tenant Task Management SaaS
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const { user, logout } = useAuthState();
  const { tenant } = useTenantState();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TaskManager</h1>
            {tenant && (
              <p className="text-sm text-gray-600">{tenant.name} - {tenant.plan} plan</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user?.name}
            </span>
            <button
              onClick={logout}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default App;