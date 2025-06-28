import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Badge, Loading, Slider } from '@components/ui';
import { 
  ThumbsUpIcon, 
  ThumbsDownIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XIcon, 
  BarChartIcon 
} from '@components/icons';
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
    <div className="flex gap-4 justify-center">
      <Button
        variant={selectedOption === 'yes' ? 'primary' : 'outline'}
        size="lg"
        onClick={() => setSelectedOption('yes')}
        disabled={!isActive || hasVoted}
        className="flex-1 max-w-[200px] flex items-center gap-2"
      >
        <ThumbsUpIcon className="w-5 h-5" />
        Yes
        {showResults && options[0] && (
          <Badge variant="secondary" className="ml-2">
            {options[0].votes} ({options[0].percentage}%)
          </Badge>
        )}
      </Button>
      <Button
        variant={selectedOption === 'no' ? 'primary' : 'outline'}
        size="lg"
        onClick={() => setSelectedOption('no')}
        disabled={!isActive || hasVoted}
        className="flex-1 max-w-[200px] flex items-center gap-2 hover:border-red-600 hover:text-red-600"
      >
        <ThumbsDownIcon className="w-5 h-5" />
        No
        {showResults && options[1] && (
          <Badge variant="secondary" className="ml-2">
            {options[1].votes} ({options[1].percentage}%)
          </Badge>
        )}
      </Button>
    </div>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-2">
      {options.map((option) => (
        <motion.div
          key={option.id}
          whileHover={{ scale: isActive && !hasVoted ? 1.02 : 1 }}
          whileTap={{ scale: isActive && !hasVoted ? 0.98 : 1 }}
        >
          <div
            onClick={() => !hasVoted && isActive && setSelectedOption(option.id)}
            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedOption === option.id 
                ? 'border-primary-600 bg-primary-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${
              !isActive || hasVoted ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {option.text}
                </p>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                )}
              </div>
              {userVote === option.id && (
                <CheckCircleIcon className="w-5 h-5 text-primary-600" />
              )}
            </div>
            
            {showResults && (
              <>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 transition-all duration-300"
                  style={{ width: `${option.percentage || 0}%` }}
                />
                <span className="absolute bottom-2 right-3 text-xs font-semibold text-gray-700">
                  {option.votes} votes ({option.percentage}%)
                </span>
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderConsensusScale = () => (
    <div className="px-6 py-4">
      <div className="flex justify-between mb-6">
        <span className="text-sm font-medium text-red-600">
          Strongly Disagree
        </span>
        <span className="text-sm text-gray-500">
          Neutral
        </span>
        <span className="text-sm font-medium text-green-600">
          Strongly Agree
        </span>
      </div>
      
      <Slider
        value={consensusValue * 100}
        onChange={(value) => {
          const normalizedValue = value / 100;
          setConsensusValue(normalizedValue);
          setSelectedOption(normalizedValue);
        }}
        disabled={!isActive || hasVoted}
        min={0}
        max={100}
        step={1}
      />
      
      {showResults && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Average Consensus
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${consensusValue * 100}%` }}
              />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              {((consensusValue * 2 - 1) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderScaleVoting = () => (
    <div className="px-6 py-4">
      <div className="flex justify-center gap-3 mb-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => setSelectedOption(value)}
            disabled={!isActive || hasVoted}
            className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all duration-200 ${
              selectedOption === value
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
            } ${
              !isActive || hasVoted ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      
      {showResults && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-1">
            Average Rating
          </p>
          <p className="text-3xl font-bold text-primary-600">
            {(totalVotes > 0 ? (options.reduce((sum, opt) => sum + opt.votes * Number(opt.id), 0) / totalVotes) : 0).toFixed(1)}
          </p>
        </div>
      )}
    </div>
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
    <Card>
      <CardBody>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {question}
            </h3>
            {timeRemaining !== undefined && isActive && (
              <Badge 
                variant={timeRemaining < 30 ? 'error' : 'secondary'}
                className="flex items-center gap-1"
              >
                <ClockIcon className="w-3 h-3" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 mb-3">
              {description}
            </p>
          )}
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <BarChartIcon className="w-3 h-3" />
              {totalVotes} votes
            </Badge>
            {!isActive && (
              <Badge variant="secondary">
                Voting Ended
              </Badge>
            )}
          </div>
        </div>

      {/* Voting content */}
      <AnimatePresence mode="wait">
        {renderVotingContent()}
      </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          {isActive && !hasVoted && (
            <Button
              variant="primary"
              fullWidth
              onClick={handleVote}
              disabled={selectedOption === null}
            >
              Submit Vote
            </Button>
          )}
          
          {hasVoted && isActive && (
            <div className="flex-1 text-center">
              <Badge variant="success" className="inline-flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4" />
                Vote Submitted
              </Badge>
            </div>
          )}
          
          {onEndVoting && isActive && (
            <button
              onClick={onEndVoting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
              title="End voting session"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default VotingPanel;