'use client';

import { signIn, useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    if (session && 'idToken' in session) {
      setIdToken((session as any).idToken);
    }
  }, [session]);

  const handleLogin = () => {
    signIn('keycloak', {
      callbackUrl: '/tasks',
      authorization: { prompt: 'login' }
    });
  };

  const handleLogout = async () => {
    if (!idToken) {
      window.location.href = '/api/auth/signout?callbackUrl=/login';
      return;
    }

    const logoutUrl =
      `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?` +
      new URLSearchParams({
        id_token_hint: idToken,
        post_logout_redirect_uri: `${window.location.origin}/login`
      });

    await signOut({ redirect: false });
    window.location.href = logoutUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">Logowanie</h1>

        {status === 'loading' && <p>Ładowanie sesji...</p>}

        {status === 'unauthenticated' && (
          <>
            <button
              className="w-full py-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={handleLogin}
            >
              Zaloguj się przez Keycloak
            </button>
            <p className="text-center text-sm text-gray-600">
              Nie masz konta? Skontaktuj się z administratorem.
            </p>
          </>
        )}

        {status === 'authenticated' && session.user && (
          <>
            <p className="mb-4 text-center">
              Jesteś zalogowany jako:{' '}
              <strong>{session.user.email}</strong>
            </p>
            <button
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={handleLogout}
            >
              Wyloguj się (Keycloak + lokalnie)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
