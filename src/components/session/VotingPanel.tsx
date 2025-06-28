import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, LinearProgress, Chip, IconButton, Tooltip } from '@mui/material';
import { ThumbsUp, ThumbsDown, Clock, CheckCircle2, XCircle, BarChart3 } from '@/components/icons';
import { VotingSlider } from '@/components/ui/Slider';
import { motion, AnimatePresence } from 'framer-motion';

export interface VotingOption {
  id: string;
  text: string;
  description?: string;
  votes: number;
  percentage?: number;
}

export interface VotingPanelProps {
  question: string;
  description?: string;
  options?: VotingOption[];
  type: 'binary' | 'multiple' | 'scale' | 'consensus';
  timeRemaining?: number;
  totalVotes?: number;
  hasVoted?: boolean;
  userVote?: string | number;
  isActive?: boolean;
  showResults?: boolean;
  onVote: (vote: string | number) => void;
  onEndVoting?: () => void;
}

export const VotingPanel: React.FC<VotingPanelProps> = ({
  question,
  description,
  options = [],
  type,
  timeRemaining,
  totalVotes = 0,
  hasVoted = false,
  userVote,
  isActive = true,
  showResults = false,
  onVote,
  onEndVoting,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | number | null>(userVote ?? null);
  const [consensusValue, setConsensusValue] = useState<number>(0.5);

  useEffect(() => {
    if (userVote !== undefined) {
      setSelectedOption(userVote);
      if (type === 'consensus' && typeof userVote === 'number') {
        setConsensusValue(userVote);
      }
    }
  }, [userVote, type]);

  const handleVote = () => {
    if (selectedOption !== null && isActive && !hasVoted) {
      onVote(selectedOption);
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderBinaryVoting = () => (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
      <Button
        variant={selectedOption === 'yes' ? 'contained' : 'outlined'}
        color="success"
        size="large"
        startIcon={<ThumbsUp />}
        onClick={() => setSelectedOption('yes')}
        disabled={!isActive || hasVoted}
        sx={{ flex: 1, maxWidth: 200 }}
      >
        Yes
        {showResults && options[0] && (
          <Chip
            label={`${options[0].votes} (${options[0].percentage}%)`}
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </Button>
      <Button
        variant={selectedOption === 'no' ? 'contained' : 'outlined'}
        color="error"
        size="large"
        startIcon={<ThumbsDown />}
        onClick={() => setSelectedOption('no')}
        disabled={!isActive || hasVoted}
        sx={{ flex: 1, maxWidth: 200 }}
      >
        No
        {showResults && options[1] && (
          <Chip
            label={`${options[1].votes} (${options[1].percentage}%)`}
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </Button>
    </Box>
  );

  const renderMultipleChoice = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {options.map((option) => (
        <motion.div
          key={option.id}
          whileHover={{ scale: isActive && !hasVoted ? 1.02 : 1 }}
          whileTap={{ scale: isActive && !hasVoted ? 0.98 : 1 }}
        >
          <Box
            onClick={() => !hasVoted && isActive && setSelectedOption(option.id)}
            sx={{
              p: 2,
              border: 2,
              borderColor: selectedOption === option.id ? 'primary.main' : 'divider',
              borderRadius: 2,
              cursor: isActive && !hasVoted ? 'pointer' : 'default',
              bgcolor: selectedOption === option.id ? 'primary.50' : 'background.paper',
              transition: 'all 0.2s ease',
              opacity: !isActive || hasVoted ? 0.7 : 1,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {option.text}
                </Typography>
                {option.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {option.description}
                  </Typography>
                )}
              </Box>
              {userVote === option.id && (
                <CheckCircle2 size={20} color="primary" />
              )}
            </Box>
            
            {showResults && (
              <>
                <LinearProgress
                  variant="determinate"
                  value={option.percentage || 0}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 12,
                    fontWeight: 600,
                  }}
                >
                  {option.votes} votes ({option.percentage}%)
                </Typography>
              </>
            )}
          </Box>
        </motion.div>
      ))}
    </Box>
  );

  const renderConsensusScale = () => (
    <Box sx={{ px: 3, py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="body2" color="error.main" fontWeight={500}>
          Strongly Disagree
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Neutral
        </Typography>
        <Typography variant="body2" color="success.main" fontWeight={500}>
          Strongly Agree
        </Typography>
      </Box>
      
      <VotingSlider
        value={consensusValue}
        onChange={(value) => {
          setConsensusValue(value);
          setSelectedOption(value);
        }}
        disabled={!isActive || hasVoted}
        showValue
        showTicks
        tickCount={5}
      />
      
      {showResults && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Average Consensus
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={consensusValue * 100}
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="h6" fontWeight={600}>
              {((consensusValue * 2 - 1) * 100).toFixed(0)}%
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderScaleVoting = () => (
    <Box sx={{ px: 3, py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <IconButton
            key={value}
            onClick={() => setSelectedOption(value)}
            disabled={!isActive || hasVoted}
            sx={{
              width: 48,
              height: 48,
              border: 2,
              borderColor: selectedOption === value ? 'primary.main' : 'divider',
              bgcolor: selectedOption === value ? 'primary.main' : 'background.paper',
              color: selectedOption === value ? 'white' : 'text.primary',
              '&:hover': {
                bgcolor: selectedOption === value ? 'primary.dark' : 'grey.100',
              },
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {value}
            </Typography>
          </IconButton>
        ))}
      </Box>
      
      {showResults && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Average Rating
          </Typography>
          <Typography variant="h4" fontWeight={600} color="primary.main">
            {(totalVotes > 0 ? (options.reduce((sum, opt) => sum + opt.votes * Number(opt.id), 0) / totalVotes) : 0).toFixed(1)}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderVotingContent = () => {
    switch (type) {
      case 'binary':
        return renderBinaryVoting();
      case 'multiple':
        return renderMultipleChoice();
      case 'consensus':
        return renderConsensusScale();
      case 'scale':
        return renderScaleVoting();
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 3,
        border: 1,
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {question}
          </Typography>
          {timeRemaining !== undefined && isActive && (
            <Chip
              icon={<Clock size={16} />}
              label={formatTime(timeRemaining)}
              size="small"
              color={timeRemaining < 30 ? 'error' : 'default'}
            />
          )}
        </Box>
        
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <Chip
            icon={<BarChart3 size={16} />}
            label={`${totalVotes} votes`}
            size="small"
            variant="outlined"
          />
          {!isActive && (
            <Chip
              label="Voting Ended"
              size="small"
              color="default"
            />
          )}
        </Box>
      </Box>

      {/* Voting content */}
      <AnimatePresence mode="wait">
        {renderVotingContent()}
      </AnimatePresence>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        {isActive && !hasVoted && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleVote}
            disabled={selectedOption === null}
          >
            Submit Vote
          </Button>
        )}
        
        {hasVoted && isActive && (
          <Box sx={{ flex: 1, textAlign: 'center', py: 1 }}>
            <Chip
              icon={<CheckCircle2 size={16} />}
              label="Vote Submitted"
              color="success"
            />
          </Box>
        )}
        
        {onEndVoting && isActive && (
          <Tooltip title="End voting session">
            <IconButton
              onClick={onEndVoting}
              color="error"
              sx={{ ml: 'auto' }}
            >
              <XCircle size={20} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default VotingPanel;