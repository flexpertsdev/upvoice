import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Badge, Avatar } from '@components/ui';
import { 
  MenuIcon, 
  CloseIcon, 
  UsersIcon, 
  SettingsIcon,
  HelpCircleIcon,
  BellIcon,
  LogOutIcon
} from '@components/icons';
import { useAuthStore, useSessionStore, useUIStore } from '@/stores';

interface NavigationBarProps {
  variant?: 'default' | 'session' | 'minimal';
  showSessionInfo?: boolean;
  className?: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  variant = 'default',
  showSessionInfo = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const { currentSession, participantCount, isSessionActive } = useSessionStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isSessionPage = location.pathname.includes('/session/');

  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </button>

            {/* Logo */}
            <div 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-xl font-semibold text-primary-600">upVoice</span>
            </div>

            {/* Session Info */}
            {showSessionInfo && currentSession && isSessionPage && (
              <div className="hidden md:flex items-center gap-4 pl-4 border-l border-gray-200">
                <div>
                  <h1 className="text-base font-semibold text-gray-900">
                    {currentSession.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>{participantCount} active</span>
                    </div>
                    {currentSession.currentTopic && (
                      <>
                        <span>•</span>
                        <span>{currentSession.currentTopic.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Session Actions (Desktop) */}
            {isSessionPage && isSessionActive && (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<UsersIcon className="w-4 h-4" />}
                  onClick={() => {/* Toggle participant list */}}
                >
                  Participants
                </Button>
              </div>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
                <Badge 
                  variant="error" 
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </button>
            )}

            {/* Help */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <HelpCircleIcon className="w-5 h-5" />
            </button>

            {/* Settings (Desktop) */}
            <button className="hidden md:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <SettingsIcon className="w-5 h-5" />
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <Avatar
                  src={user?.photoURL}
                  name={user?.displayName || user?.email || 'User'}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => navigate('/profile')}
                />
                <button
                  onClick={handleSignOut}
                  className="hidden md:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOutIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="hidden sm:flex"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Session Info */}
      {showSessionInfo && currentSession && isSessionPage && (
        <div className="md:hidden px-4 py-2 border-t border-gray-200">
          <div className="text-sm">
            <div className="font-medium text-gray-900">{currentSession.title}</div>
            <div className="flex items-center gap-3 text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>{participantCount} active</span>
              </div>
              {currentSession.currentTopic && (
                <span>• {currentSession.currentTopic.title}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavigationBar;