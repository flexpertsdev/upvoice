import React from 'react';
import { Box, Typography, Card, Grid, Chip, LinearProgress } from '@mui/material';
import { Users, MessageSquare, Clock, TrendingUp, Mic, MicOff, Flag } from '@/components/icons';
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
  color = 'primary.main',
  progress 
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <Card
      sx={{
        p: 2.5,
        height: '100%',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: color,
          boxShadow: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {value}
          </Typography>
          {subValue && (
            <Typography variant="caption" color="text.secondary">
              {subValue}
            </Typography>
          )}
          {progress !== undefined && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 1, height: 4, borderRadius: 2 }}
            />
          )}
        </Box>
      </Box>
    </Card>
  </motion.div>
);

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
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Session Statistics
      </Typography>

      <Grid container spacing={2}>
        {/* Participants */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Users size={20} />}
            label="Participants"
            value={participantCount}
            subValue={`${activeParticipants} active`}
            color="primary.main"
            progress={participationRate}
          />
        </Grid>

        {/* Messages */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<MessageSquare size={20} />}
            label="Messages"
            value={messageCount}
            subValue={`~${averageMessagesPerParticipant} per person`}
            color="info.main"
          />
        </Grid>

        {/* Duration */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Clock size={20} />}
            label="Duration"
            value={duration}
            color="warning.main"
          />
        </Grid>

        {/* Engagement */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Engagement"
            value={`${participationRate}%`}
            subValue="participation"
            color="success.main"
          />
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* Speaking Stats */}
          {speakingParticipation > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Mic size={20} />
                  <Typography variant="subtitle1" fontWeight={500}>
                    Speaking Activity
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Speaking Time
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {Math.floor(totalSpeakingTime / 60)}:{(totalSpeakingTime % 60).toString().padStart(2, '0')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Speakers
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {speakingParticipation}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          )}

          {/* Top Contributors */}
          {topParticipants.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
                  Top Contributors
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {topParticipants.slice(0, 3).map((participant, index) => (
                    <Box
                      key={participant.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color={index === 0 ? 'primary' : 'default'}
                        />
                        <Typography variant="body2">
                          {participant.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={500}>
                        {participant.messages} messages
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          )}

          {/* Consensus Score */}
          {consensusScore !== undefined && (
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
                  Group Consensus
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={consensusScore * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: consensusScore > 0.7 ? 'success.main' : 
                                  consensusScore > 0.4 ? 'warning.main' : 'error.main',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {Math.round(consensusScore * 100)}%
                  </Typography>
                </Box>
              </Card>
            </Grid>
          )}

          {/* Flagged Content */}
          {flaggedMessages > 0 && (
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  p: 2.5, 
                  border: 1, 
                  borderColor: 'error.main',
                  bgcolor: 'error.50',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Flag size={20} color="error" />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Flagged Messages
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {flaggedMessages} messages require review
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default SessionStats;