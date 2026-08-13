import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0d' }}>
      <Navbar />
      {children}
    </div>
  );
}
