import Sidebar from './Sidebar';
import Header from './Header';

interface AppShellProps {
  children: React.ReactNode;
  headerAction?: {
    label: string;
    href: string;
  };
}

export default function AppShell({ children, headerAction }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Sidebar />
      <Header
        actionLabel={headerAction?.label}
        actionHref={headerAction?.href}
      />
      <main className="ml-[220px] pt-14 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}