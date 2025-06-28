import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../common/buttons/Button';
import { useSession } from '../../../hooks/useSession';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Clock,
  MessageSquarePlus,
  AlertTriangle
} from '@untitled-ui/icons-react';
import type { Session, Topic } from '../../../types';

interface SessionControlsProps {
  session: Session;
  currentTopic?: Topic;
  remainingTime: number;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  session,
  currentTopic,
  remainingTime
}) => {
  const { updateSession, togglePause, endSession } = useSession({
    sessionId: session.id
  });
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('00:00');

  useEffect(() => {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    setTimeDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [remainingTime]);

  const handlePauseToggle = useCallback(async () => {
    setIsUpdating(true);
    try {
      await togglePause();
    } finally {
      setIsUpdating(false);
    }
  }, [togglePause]);

  const handleNextTopic = useCallback(async () => {
    if (session.currentTopicIndex < session.topics.length - 1) {
      setIsUpdating(true);
      try {
        await updateSession({
          currentTopicIndex: session.currentTopicIndex + 1
        });
      } finally {
        setIsUpdating(false);
      }
    }
  }, [session, updateSession]);

  const handleEndSession = useCallback(async () => {
    setIsUpdating(true);
    try {
      await endSession();
    } finally {
      setIsUpdating(false);
      setShowEndConfirm(false);
    }
  }, [endSession]);

  const handleExtendTime = useCallback(async () => {
    if (currentTopic) {
      setIsUpdating(true);
      try {
        const updatedTopics = [...session.topics];
        updatedTopics[session.currentTopicIndex] = {
          ...currentTopic,
          duration: currentTopic.duration + 5 // Add 5 minutes
        };
        await updateSession({ topics: updatedTopics });
      } finally {
        setIsUpdating(false);
      }
    }
  }, [currentTopic, session, updateSession]);

  const isPaused = session.status === 'paused';
  const isActive = session.status === 'active';
  const hasMoreTopics = session.currentTopicIndex < session.topics.length - 1;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Session Controls</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Topic Info */}
        {currentTopic && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Topic {session.currentTopicIndex + 1} of {session.topics.length}
              </span>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className={remainingTime < 60000 ? 'text-red-600 font-medium' : ''}>
                  {timeDisplay}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-900 font-medium">{currentTopic.title}</p>
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex space-x-3">
          <Button
            variant={isPaused ? 'primary' : 'secondary'}
            onClick={handlePauseToggle}
            disabled={!isActive && !isPaused || isUpdating}
            icon={isPaused ? Play : Pause}
            fullWidth
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleNextTopic}
            disabled={!isActive || !hasMoreTopics || isUpdating}
            icon={SkipForward}
            fullWidth
          >
            Next Topic
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExtendTime}
            disabled={!isActive || isUpdating}
            icon={Clock}
          >
            +5 min
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={MessageSquarePlus}
            disabled={!isActive}
          >
            Send Prober
          </Button>
        </div>

        {/* End Session */}
        <div className="pt-2 border-t border-gray-200">
          {!showEndConfirm ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEndConfirm(true)}
              disabled={session.status === 'completed' || isUpdating}
              icon={Square}
              className="text-red-600 hover:text-red-700"
              fullWidth
            >
              End Session
            </Button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">
                    Are you sure? This action cannot be undone.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowEndConfirm(false)}
                    disabled={isUpdating}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleEndSession}
                    disabled={isUpdating}
                    className="bg-red-600 hover:bg-red-700"
                    fullWidth
                  >
                    End Session
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${
              session.status === 'active' ? 'bg-green-500' :
              session.status === 'paused' ? 'bg-amber-500' :
              'bg-gray-400'
            }`} />
            <span className="text-xs font-medium text-gray-600 capitalize">
              {session.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};