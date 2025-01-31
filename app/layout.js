import './globals.css';
import Sidebar from '../components/Sidebar';
import { SidebarProvider } from '../contexts/SidebarContext';

export const metadata = {
  title: 'Bureaucrat AI Assistant',
  description: 'AI-powered assistant for bureaucratic tasks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50">
        <SidebarProvider>
          <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 w-full">
              <div className="mx-auto h-full">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
