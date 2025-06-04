import '../globals.css';

export const metadata = {
  generator: 'REDIBO'
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main style={{ margin: 0, padding: 0 }}>
      {children}
    </main>
  );
}
