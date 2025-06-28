import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Session } from '../../../types';
import type { ModeratorInsight, SessionMetrics } from '../../../types/moderation.types';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from '@untitled-ui/icons-react';

interface SessionStatsProps {
  session: Session;
  insights: ModeratorInsight[];
}

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

export const SessionStats: React.FC<SessionStatsProps> = ({
  session,
  insights
}) => {
  const metrics = useMemo<SessionMetrics>(() => {
    const activeParticipants = session.participants.filter(p => p.status === 'active').length;
    const messagesPerMinute = insights.find(i => i.type === 'activity' && i.title.includes('Messages'))?.value as number || 0;
    const votesPerMinute = insights.find(i => i.type === 'activity' && i.title.includes('Votes'))?.value as number || 0;
    const averageEngagement = insights.find(i => i.type === 'engagement')?.value as number || 0;
    
    const completedTopics = session.topics.filter((_, index) => index < session.currentTopicIndex).length;
    const topicCompletionRate = session.topics.length > 0 
      ? completedTopics / session.topics.length 
      : 0;

    return {
      totalParticipants: session.participants.length,
      activeParticipants,
      totalMessages: 0, // Would be calculated from messages collection
      messagesPerMinute,
      totalVotes: 0, // Would be calculated from votes collection
      votesPerMinute,
      averageEngagement,
      topicCompletionRate
    };
  }, [session, insights]);

  const stats: StatItem[] = [
    {
      label: 'Active Participants',
      value: `${metrics.activeParticipants}/${metrics.totalParticipants}`,
      change: 5,
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Messages/Min',
      value: metrics.messagesPerMinute.toFixed(1),
      change: -2,
      trend: 'down',
      icon: MessageSquare,
      color: 'green'
    },
    {
      label: 'Engagement Rate',
      value: `${Math.round(metrics.averageEngagement * 100)}%`,
      change: 0,
      trend: 'stable',
      icon: Activity,
      color: 'purple'
    },
    {
      label: 'Topic Progress',
      value: `${Math.round(metrics.topicCompletionRate * 100)}%`,
      icon: TrendingUp,
      color: 'amber'
    }
  ];

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Session Metrics</h2>
      </div>

      <div className="p-4 space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>

              {stat.trend && (
                <div className="flex items-center space-x-2">
                  {getTrendIcon(stat.trend)}
                  {stat.change !== undefined && (
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Engagement Chart Placeholder */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Engagement Timeline
          </p>
          <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-sm text-gray-500">Chart visualization</p>
          </div>
        </div>

        {/* Recent Insights */}
        {insights.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Recent Insights
            </p>
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight) => (
                <div 
                  key={insight.id}
                  className={`text-xs p-2 rounded-lg ${
                    insight.priority === 'high' ? 'bg-red-50 text-red-700' :
                    insight.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-50 text-gray-700'
                  }`}
                >
                  {insight.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};