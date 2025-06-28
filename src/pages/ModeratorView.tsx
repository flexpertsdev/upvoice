import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ModeratorDashboard } from '../components/moderation/dashboard/ModeratorDashboard';
import { GhostViewer } from '../components/moderation/GhostViewer';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../hooks/useAuth';
import { useModeratorInsights } from '../hooks/useModeratorInsights';
import { Loading } from '../components/common/feedback/Loading';
import { Toast } from '../components/common/feedback/Toast';
import { Button } from '../components/common/buttons/Button';
import { Eye, Grid3x3, BarChart2, Users } from '@untitled-ui/icons-react';
import type { ModeratorTab } from '../types/moderation.types';

const tabs: { id: ModeratorTab; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Grid3x3 },
  { id: 'ghost', label: 'Ghost View', icon: Eye },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'participants', label: 'Participants', icon: Users }
];

export const ModeratorView: React.FC = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const { session, isLoading, error, isModerator } = useSession({
    sessionId: sessionId || undefined
  });
  const { insights, isLoading: insightsLoading } = useModeratorInsights({
    sessionId: sessionId || undefined
  });

  const [activeTab, setActiveTab] = useState<ModeratorTab>('dashboard');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  if (isLoading) {
    return <Loading fullScreen message="Loading moderator view..." />;
  }

  if (!session) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isModerator) {
    return <Navigate to={`/session/${sessionId}`} replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ModeratorDashboard
            session={session}
            insights={insights}
            isLoading={insightsLoading}
          />
        );
      case 'ghost':
        return (
          <GhostViewer
            sessionId={session.id}
            insights={insights}
          />
        );
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Real-time Analytics
            </h2>
            <p className="text-gray-600">
              Analytics view coming soon...
            </p>
          </div>
        );
      case 'participants':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Participant Management
            </h2>
            <p className="text-gray-600">
              Participant management coming soon...
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Moderator View
                </h1>
                <span className="ml-4 text-sm text-gray-500">
                  {session.title}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {session.participants.length} participants
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(`/session/${sessionId}`, '_blank')}
                >
                  View as Participant
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        -ml-0.5 mr-2 h-5 w-5
                        ${activeTab === tab.id
                          ? 'text-primary-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                        }
                      `}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </motion.div>

      {showError && error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
};