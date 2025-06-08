// pages/_app.js
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css'; // lub dowolne inne globalne style

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // przekazujemy `session` z getServerSideProps albo z innego miejsca
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
