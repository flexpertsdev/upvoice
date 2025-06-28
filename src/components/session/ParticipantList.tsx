import React, { useState } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, Chip, Tooltip } from '@mui/material';
import { MoreVertical, Mic, MicOff, Flag, UserX, Shield } from '@/components/icons';
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, participantId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedParticipant(participantId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedParticipant(null);
  };

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
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Participants ({participants.length})
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: status === 'speaking' ? 'primary.50' : 'background.paper',
                    border: '1px solid',
                    borderColor: status === 'speaking' ? 'primary.200' : 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: status === 'speaking' ? 'primary.100' : 'grey.50',
                    },
                  }}
                >
                  {/* Avatar with status indicator */}
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={participant.avatarUrl}
                      alt={participant.name}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: participant.avatarUrl ? 'transparent' : 'primary.main',
                      }}
                    >
                      {!participant.avatarUrl && participant.name[0].toUpperCase()}
                    </Avatar>
                    {status === 'speaking' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          border: '2px solid white',
                        }}
                      />
                    )}
                  </Box>

                  {/* Name and role */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {participant.name}
                        {isCurrentUser && ' (You)'}
                      </Typography>
                      {participant.role === 'moderator' && (
                        <Chip
                          icon={<Shield size={12} />}
                          label="Mod"
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                    {!participant.isActive && (
                      <Typography variant="caption" color="text.secondary">
                        Inactive
                      </Typography>
                    )}
                  </Box>

                  {/* Audio status */}
                  <Tooltip title={participant.isMuted ? 'Muted' : 'Unmuted'}>
                    <Box
                      sx={{
                        color: participant.isMuted ? 'text.secondary' : 'success.main',
                      }}
                    >
                      {participant.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </Box>
                  </Tooltip>

                  {/* Actions menu */}
                  {(isModerator || !isCurrentUser) && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, participant.id)}
                      sx={{ ml: 1 }}
                    >
                      <MoreVertical size={16} />
                    </IconButton>
                  )}
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Box>

      {/* Actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 180 },
        }}
      >
        {selectedParticipant && (
          <>
            {isModerator && (
              <>
                <MenuItem
                  onClick={() =>
                    handleAction(() => onToggleMute?.(selectedParticipant))
                  }
                >
                  <MicOff size={16} sx={{ mr: 1 }} />
                  Toggle Mute
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleAction(() => onRemoveParticipant?.(selectedParticipant))
                  }
                >
                  <UserX size={16} sx={{ mr: 1 }} />
                  Remove
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleAction(() => onPromoteToModerator?.(selectedParticipant))
                  }
                >
                  <Shield size={16} sx={{ mr: 1 }} />
                  Make Moderator
                </MenuItem>
              </>
            )}
            <MenuItem
              onClick={() => handleAction(() => onFlag?.(selectedParticipant))}
            >
              <Flag size={16} sx={{ mr: 1 }} />
              Flag for Review
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default ParticipantList;