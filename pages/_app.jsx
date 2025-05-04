import '../styles/globals.css';
import { TokenProvider } from '../context/TokenContext';

export default function App({ Component, pageProps }) {
  return (
    <TokenProvider>
      <Component {...pageProps} />
    </TokenProvider>
  );
}
