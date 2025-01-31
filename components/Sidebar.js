'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicrophoneIcon, 
  CalendarIcon, 
  LanguageIcon, 
  DocumentTextIcon,
  HomeIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useSidebar } from '../contexts/SidebarContext';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon, path: '/', description: 'Overview & quick actions' },
  { name: 'Voice Notes', icon: MicrophoneIcon, path: '/voice-notes', description: 'AI-powered dictation & grammar' },
  { name: 'Tasks', icon: CalendarIcon, path: '/tasks', description: 'Smart task management' },
  { name: 'Translator', icon: LanguageIcon, path: '/translator', description: 'Context-aware translation' },
  { name: 'AI Writer', icon: DocumentTextIcon, path: '/ai-writer', description: 'Professional content generation' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-violet-400 text-white shadow-lg hover:bg-violet-700 transition-colors"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
              fixed lg:sticky top-0 left-0 h-screen w-72 
              bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 
              text-white shadow-xl z-50 flex flex-col
              ${isOpen ? '' : 'lg:-ml-72'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/5 pointer-events-none" />
            
            {/* Close button for mobile */}
            <button
              onClick={toggle}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="p-6 relative"
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
                Bureaucrat AI
              </h1>
              <p className="text-violet-100/80 text-sm">Your Intelligent Assistant</p>
            </motion.div>

            <nav className="mt-4 relative flex-1 overflow-y-auto">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.path;
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * (index + 1), duration: 0.3 }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggle();
                      }}
                      className={`
                        group relative flex flex-col px-6 py-4 
                        ${isActive 
                          ? 'bg-gradient-to-r from-white/20 to-white/10 text-white border-r-4 border-white' 
                          : 'text-violet-100 hover:bg-white/5'
                        }
                        transition-all duration-200
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            p-1 rounded-lg transition-all duration-200
                            ${isActive 
                              ? 'bg-white/10 ring-1 ring-white/20' 
                              : 'group-hover:bg-white/5'
                            }
                          `}>
                            <item.icon className={`
                              w-5 h-5 transition-transform duration-200
                              ${isActive ? 'text-white' : 'text-violet-200 group-hover:text-white'}
                            `} />
                          </div>
                          <span className={`
                            font-medium transition-colors duration-200
                            ${isActive ? 'text-white' : 'group-hover:text-white'}
                          `}>
                            {item.name}
                          </span>
                        </div>
                        <ChevronRightIcon className={`
                          w-4 h-4 transition-all duration-200
                          ${isActive 
                            ? 'opacity-100 translate-x-0 text-white' 
                            : 'opacity-0 -translate-x-2 text-violet-200 group-hover:opacity-100 group-hover:translate-x-0'
                          }
                        `} />
                      </div>
                      {item.description && (
                        <span className={`
                          text-sm mt-1 ml-9 transition-colors duration-200
                          ${isActive ? 'text-violet-100' : 'text-violet-200/70 group-hover:text-violet-100'}
                        `}>
                          {item.description}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Toggle Button */}
      <button
        onClick={toggle}
        className="hidden lg:flex fixed bottom-4 left-4 z-50 items-center gap-2 px-3 py-2 rounded-lg bg-black text-white shadow-lg hover:bg-blue-600 transition-colors"
      >
        {isOpen ? (
          <>
            <XMarkIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Close Sidebar</span>
          </>
        ) : (
          <>
            <Bars3Icon className="w-5 h-5" />
            <span className="text-sm font-medium">Open Sidebar</span>
          </>
        )}
      </button>
    </>
  );
}