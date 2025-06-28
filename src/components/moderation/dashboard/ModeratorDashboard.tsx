import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SessionControls } from '../controls/SessionControls';
import { SessionStats } from './SessionStats';
import { SynthetronStream } from '../SynthetronStream';
import { ParticipantMonitor } from '../ParticipantMonitor';
import type { Session } from '../../../types';
import type { ModeratorInsight } from '../../../types/moderation.types';
import { AlertCircle, TrendingUp, Users, MessageSquare } from '@untitled-ui/icons-react';

interface ModeratorDashboardProps {
  session: Session;
  insights?: ModeratorInsight[];
  isLoading?: boolean;
}

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({
  session,
  insights = [],
  isLoading = false
}) => {
  const highPriorityInsights = useMemo(() => {
    return insights.filter(insight => insight.priority === 'high');
  }, [insights]);

  const currentTopic = session.topics[session.currentTopicIndex];
  const remainingTime = currentTopic 
    ? Math.max(0, (currentTopic.startTime + currentTopic.duration * 60 * 1000) - Date.now())
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Alert Banner */}
      {highPriorityInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4"
        >
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-amber-900">
                Attention Required
              </h3>
              <div className="mt-1 space-y-1">
                {highPriorityInsights.map((insight) => (
                  <p key={insight.id} className="text-sm text-amber-700">
                    {insight.description}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <SessionControls 
            session={session}
            currentTopic={currentTopic}
            remainingTime={remainingTime}
          />
          <SessionStats 
            session={session}
            insights={insights}
          />
        </div>

        {/* Middle Column - Viral Messages */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Viral Messages
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Messages spreading through the network
              </p>
            </div>
            <SynthetronStream 
              sessionId={session.id}
              maxItems={5}
            />
          </div>
        </div>

        {/* Right Column - Participant Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Participant Activity
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Real-time participant status
              </p>
            </div>
            <ParticipantMonitor 
              sessionId={session.id}
              participants={session.participants}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section - Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Participants',
            value: session.participants.filter(p => p.status === 'active').length,
            total: session.participants.length,
            icon: Users,
            color: 'blue'
          },
          {
            label: 'Messages/Min',
            value: insights.find(i => i.type === 'activity')?.value || '0',
            icon: MessageSquare,
            color: 'green'
          },
          {
            label: 'Avg Engagement',
            value: `${Math.round((insights.find(i => i.type === 'engagement')?.value as number || 0) * 100)}%`,
            icon: TrendingUp,
            color: 'purple'
          },
          {
            label: 'Topic Progress',
            value: `${session.currentTopicIndex + 1}/${session.topics.length}`,
            icon: AlertCircle,
            color: 'amber'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {stat.value}
                    {stat.total && (
                      <span className="text-sm font-normal text-gray-500">
                        /{stat.total}
                      </span>
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};