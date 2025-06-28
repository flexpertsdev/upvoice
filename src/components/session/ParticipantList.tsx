import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, Badge, Avatar } from '@components/ui';
import { 
  MoreVertical, 
  MicIcon, 
  MicOffIcon, 
  FlagIcon, 
  UserX, 
  Shield 
} from '@components/icons';
import { Participant } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export interface ParticipantListProps {
  participants: Participant[];
  currentUserId?: string;
  isModerator?: boolean;
  onToggleMute?: (participantId: string) => void;
  onRemoveParticipant?: (participantId: string) => void;
  onPromoteToModerator?: (participantId: string) => void;
  onFlag?: (participantId: string) => void;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  currentUserId,
  isModerator = false,
  onToggleMute,
  onRemoveParticipant,
  onPromoteToModerator,
  onFlag,
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, participantId: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setSelectedParticipant(participantId);
  };

  const handleMenuClose = () => {
    setMenuPosition(null);
    setSelectedParticipant(null);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleMenuClose();
      }
    };

    if (menuPosition) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuPosition]);

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  const getParticipantStatus = (participant: Participant) => {
    if (!participant.isActive) return 'inactive';
    if (participant.isSpeaking) return 'speaking';
    if (participant.isMuted) return 'muted';
    return 'active';
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    // Sort by: moderators first, then speakers, then active, then inactive
    if (a.role === 'moderator' && b.role !== 'moderator') return -1;
    if (a.role !== 'moderator' && b.role === 'moderator') return 1;
    if (a.isSpeaking && !b.isSpeaking) return -1;
    if (!a.isSpeaking && b.isSpeaking) return 1;
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Participants ({participants.length})
      </h3>

      <div className="space-y-2">
        <AnimatePresence>
          {sortedParticipants.map((participant) => {
            const status = getParticipantStatus(participant);
            const isCurrentUser = participant.id === currentUserId;

            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    status === 'speaking' 
                      ? 'bg-primary-50 border-primary-200 hover:bg-primary-100' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Avatar with status indicator */}
                  <div className="relative">
                    <Avatar
                      src={participant.avatarUrl}
                      name={participant.name}
                      size="md"
                    />
                    {status === 'speaking' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Name and role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {participant.name}
                        {isCurrentUser && ' (You)'}
                      </span>
                      {participant.role === 'moderator' && (
                        <Badge variant="primary" className="flex items-center gap-1 h-5">
                          <Shield className="w-3 h-3" />
                          Mod
                        </Badge>
                      )}
                    </div>
                    {!participant.isActive && (
                      <span className="text-xs text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Audio status */}
                  <div 
                    className={participant.isMuted ? 'text-gray-400' : 'text-green-600'}
                    title={participant.isMuted ? 'Muted' : 'Unmuted'}
                  >
                    {participant.isMuted ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
                  </div>

                  {/* Actions menu */}
                  {(isModerator || !isCurrentUser) && (
                    <button
                      onClick={(e) => handleMenuOpen(e, participant.id)}
                      className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Actions menu */}
      {menuPosition && selectedParticipant && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[180px]"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          {isModerator && (
            <>
              <button
                onClick={() => handleAction(() => onToggleMute?.(selectedParticipant))}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <MicOffIcon className="w-4 h-4" />
                Toggle Mute
              </button>
              <button
                onClick={() => handleAction(() => onRemoveParticipant?.(selectedParticipant))}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <UserX className="w-4 h-4" />
                Remove
              </button>
              <button
                onClick={() => handleAction(() => onPromoteToModerator?.(selectedParticipant))}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Make Moderator
              </button>
            </>
          )}
          <button
            onClick={() => handleAction(() => onFlag?.(selectedParticipant))}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <FlagIcon className="w-4 h-4" />
            Flag for Review
          </button>
        </div>
      )}
    </div>
  );
};

export default ParticipantList;