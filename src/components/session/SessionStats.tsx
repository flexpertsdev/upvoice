import React from 'react';
import { Card, CardBody, Badge, Loading } from '@components/ui';
import { 
  UsersIcon, 
  MessageIcon, 
  ClockIcon, 
  TrendingUpIcon, 
  MicIcon, 
  MicOffIcon, 
  FlagIcon 
} from '@components/icons';
import { motion } from 'framer-motion';

export interface SessionStatsProps {
  participantCount: number;
  activeParticipants: number;
  messageCount: number;
  duration: string;
  speakingTime?: { [participantId: string]: number };
  topParticipants?: Array<{ id: string; name: string; messages: number }>;
  flaggedMessages?: number;
  consensusScore?: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  subValue, 
  color = 'primary',
  progress 
}) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-50',
    info: 'text-blue-600 bg-blue-50',
    warning: 'text-amber-600 bg-amber-50',
    success: 'text-green-600 bg-green-50',
    error: 'text-red-600 bg-red-50',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200">
        <CardBody>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
              {icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">
                {label}
              </p>
              <h3 className="text-2xl font-semibold text-gray-900">
                {value}
              </h3>
              {subValue && (
                <p className="text-xs text-gray-500 mt-1">
                  {subValue}
                </p>
              )}
              {progress !== undefined && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export const SessionStats: React.FC<SessionStatsProps> = ({
  participantCount,
  activeParticipants,
  messageCount,
  duration,
  speakingTime = {},
  topParticipants = [],
  flaggedMessages = 0,
  consensusScore,
}) => {
  const participationRate = participantCount > 0 
    ? Math.round((activeParticipants / participantCount) * 100) 
    : 0;

  const averageMessagesPerParticipant = activeParticipants > 0
    ? (messageCount / activeParticipants).toFixed(1)
    : '0';

  const totalSpeakingTime = Object.values(speakingTime).reduce((sum, time) => sum + time, 0);
  const speakingParticipation = Object.keys(speakingTime).length;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Session Statistics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Participants */}
        <StatCard
          icon={<UsersIcon className="w-5 h-5" />}
          label="Participants"
          value={participantCount}
          subValue={`${activeParticipants} active`}
          color="primary"
          progress={participationRate}
        />

        {/* Messages */}
        <StatCard
          icon={<MessageIcon className="w-5 h-5" />}
          label="Messages"
          value={messageCount}
          subValue={`~${averageMessagesPerParticipant} per person`}
          color="info"
        />

        {/* Duration */}
        <StatCard
          icon={<ClockIcon className="w-5 h-5" />}
          label="Duration"
          value={duration}
          color="warning"
        />

        {/* Engagement */}
        <StatCard
          icon={<TrendingUpIcon className="w-5 h-5" />}
          label="Engagement"
          value={`${participationRate}%`}
          subValue="participation"
          color="success"
        />
      </div>

      {/* Additional Stats */}
      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Speaking Stats */}
          {speakingParticipation > 0 && (
            <Card>
              <CardBody>
                <div className="flex items-center gap-2 mb-4">
                  <MicIcon className="w-5 h-5 text-gray-700" />
                  <h3 className="text-base font-medium text-gray-900">
                    Speaking Activity
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Total Speaking Time
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {Math.floor(totalSpeakingTime / 60)}:{(totalSpeakingTime % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Speakers
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {speakingParticipation}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Top Contributors */}
          {topParticipants.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="text-base font-medium text-gray-900 mb-4">
                  Top Contributors
                </h3>
                <div className="space-y-3">
                  {topParticipants.slice(0, 3).map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={index === 0 ? 'primary' : 'secondary'}
                        >
                          #{index + 1}
                        </Badge>
                        <span className="text-sm text-gray-700">
                          {participant.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {participant.messages} messages
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Consensus Score */}
          {consensusScore !== undefined && (
            <Card>
              <CardBody>
                <h3 className="text-base font-medium text-gray-900 mb-4">
                  Group Consensus
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          consensusScore > 0.7 ? 'bg-green-600' : 
                          consensusScore > 0.4 ? 'bg-amber-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${consensusScore * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">
                    {Math.round(consensusScore * 100)}%
                  </span>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Flagged Content */}
          {flaggedMessages > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardBody>
                <div className="flex items-center gap-3">
                  <FlagIcon className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      Flagged Messages
                    </h3>
                    <p className="text-sm text-gray-600">
                      {flaggedMessages} messages require review
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionStats;