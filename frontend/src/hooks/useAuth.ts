import { useState, useEffect, useCallback } from 'react';

// Try importing AuthClient; if ICP isn't available we'll use demo mode
let AuthClientModule: any = null;
try {
  AuthClientModule = require('@dfinity/auth-client');
} catch (e) {
  // ICP auth not available
}

export function useInternetIdentity() {
  const [client, setClient] = useState<any>(null);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (AuthClientModule) {
      AuthClientModule.AuthClient.create().then(async (c: any) => {
        setClient(c);
        if (await c.isAuthenticated()) {
          setPrincipal(c.getIdentity().getPrincipal().toText());
          setIsAuthenticated(true);
        }
      }).catch(() => {
        // ICP auth unavailable
      });
    }
  }, []);

  const login = useCallback(() => {
    setAuthError(null);
    if (!client) {
      setAuthError(
        'Internet Identity is not available. The ICP backend needs to be deployed first (dfx start && dfx deploy). Please use Demo Mode instead.'
      );
      return;
    }
    try {
      client.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: () => {
          setPrincipal(client.getIdentity().getPrincipal().toText());
          setIsAuthenticated(true);
          setAuthError(null);
        },
        onError: (err: string) => {
          setAuthError(
            'Could not connect to Internet Identity. The ICP backend may not be deployed. Please use Demo Mode instead.'
          );
        },
      });
    } catch (e) {
      setAuthError(
        'Could not connect to Internet Identity. Please use Demo Mode instead.'
      );
    }
  }, [client]);

  const demoLogin = useCallback(() => {
    setAuthError(null);
    const demoPrincipal = 'demo-' + Math.random().toString(36).substring(2, 10);
    setPrincipal(demoPrincipal);
    setIsAuthenticated(true);
    setIsDemo(true);
  }, []);

  const logout = useCallback(() => {
    if (client && !isDemo) {
      client.logout();
    }
    setPrincipal(null);
    setIsAuthenticated(false);
    setIsDemo(false);
    setAuthError(null);
  }, [client, isDemo]);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  return { principal, isAuthenticated, isDemo, authError, login, demoLogin, logout, clearError };
}