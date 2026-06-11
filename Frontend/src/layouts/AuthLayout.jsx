export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-bright text-on-surface antialiased">
      {children}
    </div>
  );
}
