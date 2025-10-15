import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ClerkContext = createContext({
  isSignedIn: false,
  userId: null,
  sessionId: null,
  getToken: async () => null,
  signIn: () => {},
  signOut: () => {},
});

export const ClerkProvider = ({ children }) => {
  const [state, setState] = useState({
    isSignedIn: false,
    userId: null,
    sessionId: null,
  });

  const signIn = useCallback((userId = 'mock-user') => {
    setState({
      isSignedIn: true,
      userId,
      sessionId: `mock-session-${userId}`,
    });
  }, []);

  const signOut = useCallback(() => {
    setState({
      isSignedIn: false,
      userId: null,
      sessionId: null,
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      getToken: async () =>
        state.isSignedIn ? `mock-token-${state.userId}` : null,
      signIn,
      signOut,
    }),
    [signIn, signOut, state]
  );

  return <ClerkContext.Provider value={value}>{children}</ClerkContext.Provider>;
};

export const useAuth = () => useContext(ClerkContext);

export const SignedIn = ({ children }) => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
};

export const SignedOut = ({ children }) => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return null;
  }

  return <>{children}</>;
};

export const SignIn = () => {
  const { signIn } = useAuth();

  return (
    <button type="button" className="mock-sign-in" onClick={() => signIn()}>
      Mock Sign In
    </button>
  );
};

export const UserButton = () => {
  const { signOut, userId } = useAuth();

  if (!userId) {
    return null;
  }

  return (
    <button type="button" className="mock-user-button" onClick={() => signOut()}>
      Sign out {userId}
    </button>
  );
};
