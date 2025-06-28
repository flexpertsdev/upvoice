import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationBar } from '@components/common/navigation/NavigationBar';
import { Loading } from '@components/ui';
import { ConnectionStatus } from '@components/common';
import { useUIStore, useAuthStore } from '@/stores';
import { motion, AnimatePresence } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
  variant?: 'default' | 'session' | 'minimal' | 'fullscreen';
  showNavigation?: boolean;
  showConnectionStatus?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  variant = 'default',
  showNavigation = true,
  showConnectionStatus = true,
  loading = false,
  loadingText = 'Loading...',
  className = ''
}) => {
  const location = useLocation();
  const { isMobileMenuOpen, setMobileMenuOpen, setDeviceInfo } = useUIStore();
  const { isInitializing } = useAuthStore();

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      setDeviceInfo(isMobile, isTablet);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [setDeviceInfo]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Determine layout variant based on route
  const isSessionPage = location.pathname.includes('/session/');
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';

  const getLayoutClasses = () => {
    switch (variant) {
      case 'session':
        return 'h-screen overflow-hidden bg-gray-50';
      case 'minimal':
        return 'min-h-screen bg-white';
      case 'fullscreen':
        return 'h-screen overflow-hidden';
      default:
        return 'min-h-screen bg-gray-50';
    }
  };

  // Show loading state during auth initialization
  if (isInitializing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text={loadingText} />
      </div>
    );
  }

  // Minimal layout for auth pages
  if (isAuthPage || variant === 'minimal') {
    return (
      <div className={`${getLayoutClasses()} ${className}`}>
        {children}
      </div>
    );
  }

  // Fullscreen layout (no navigation)
  if (variant === 'fullscreen') {
    return (
      <div className={`${getLayoutClasses()} ${className}`}>
        {showConnectionStatus && <ConnectionStatus />}
        {children}
      </div>
    );
  }

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {/* Navigation */}
      {showNavigation && (
        <NavigationBar
          variant={isSessionPage ? 'session' : 'default'}
          showSessionInfo={isSessionPage}
        />
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xl font-semibold text-primary-600">upVoice</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="sr-only">Close menu</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Mobile menu content */}
                <nav className="space-y-1">
                  <a href="/dashboard" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
                    Dashboard
                  </a>
                  <a href="/create" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
                    Create Session
                  </a>
                  <a href="/profile" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
                    Profile
                  </a>
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={variant === 'session' ? 'h-[calc(100vh-64px)]' : 'flex-1'}>
        {children}
      </main>

      {/* Connection Status */}
      {showConnectionStatus && <ConnectionStatus />}
    </div>
  );
};

export default AppShell;