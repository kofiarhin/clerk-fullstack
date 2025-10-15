import { useEffect, useState } from 'react';
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useAuth,
} from '@clerk/clerk-react';
import useApi from './hooks/useApi.js';
import './App.scss';

const App = () => {
  const { isSignedIn } = useAuth();
  const api = useApi();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!isSignedIn) {
        setProfile(null);
        setLoading(false);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await api.call('/api/me');

        if (!response.ok) {
          throw new Error('Unable to load profile');
        }

        const data = await response.json();

        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [api, isSignedIn]);

  return (
    <div className="app-shell">
      <SignedOut>
        <section className="auth-gate">
          <h1>DevKofi Control Center</h1>
          <p>Authenticate with Clerk to access your dashboard.</p>
          <SignIn routing="virtual" />
        </section>
      </SignedOut>

      <SignedIn>
        <header className="app-header">
          <div>
            <h1>DevKofi Dashboard</h1>
            <p>Secure access powered by Clerk.</p>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>

        <main className="app-main">
          {loading && <p className="status">Loading account...</p>}
          {error && !loading && <p className="status error">{error}</p>}
          {profile && !loading && !error && (
            <section className="profile-card">
              <h2>Authenticated Session</h2>
              <dl>
                <div>
                  <dt>User ID</dt>
                  <dd>{profile.userId}</dd>
                </div>
                <div>
                  <dt>Session ID</dt>
                  <dd>{profile.sessionId}</dd>
                </div>
              </dl>
            </section>
          )}
        </main>
      </SignedIn>
    </div>
  );
};

export default App;
