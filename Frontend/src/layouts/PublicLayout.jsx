import { Footer } from '@/components/shell/Footer.jsx';

export default function PublicLayout({ children }) {
  return (
    <div className="light-theme min-h-screen bg-background text-foreground antialiased">
      {children}
      <Footer />
    </div>
  );
}
