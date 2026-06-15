import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      {children}
    </div>
  );
}
