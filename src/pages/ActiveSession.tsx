import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
} from '@mui/material';
import {
  MenuIcon,
  GroupIcon,
  SettingsIcon,
  ExitIcon,
  ShareIcon,
  PauseIcon,
  PlayIcon,
  AnalyticsIcon,
} from '@components/icons';
import { MessageList } from '@components/session/MessageList';
import { MessageInput } from '@components/session/MessageInput';
import { ParticipantList } from '@components/session/ParticipantList';
import { SessionHeader } from '@components/session/SessionHeader';
import { SessionStats } from '@components/session/SessionStats';
import { VotingPanel } from '@components/session/VotingPanel';
import { ConnectionStatus } from '@components/common/ConnectionStatus';
import { LoadingScreen } from '@components/common/LoadingScreen';
import { useSession } from '@hooks/useSession';
import { useMessages } from '@hooks/useMessages';
import { useParticipants } from '@hooks/useParticipants';
import { useConnectionStatus } from '@hooks/useConnectionStatus';
import { useAuthStore } from '@stores/auth.store';
import toast from 'react-hot-toast';

export const ActiveSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, anonymousUser } = useAuthStore();
  const userId = user?.uid || anonymousUser?.uid;
  
  const {
    session,
    isLoading: isLoadingSession,
    error: sessionError,
    leaveSession,
    togglePause,
    isOrganizer,
    isModerator,
    copySessionCode,
    copySessionUrl,
  } = useSession({ sessionId, autoLoad: true });

  const {
    messages,
    sendMessage,
    isLoading: isLoadingMessages,
    isSending,
  } = useMessages({ sessionId, autoLoad: true });

  const {
    participants,
    currentParticipant,
    activeCount,
  } = useParticipants({ sessionId, autoLoad: true });

  const { isConnected } = useConnectionStatus();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  // Redirect if not a participant
  useEffect(() => {
    if (!isLoadingSession && !currentParticipant && session) {
      toast.error('You must join the session first');
      navigate(`/join/${session.code}`);
    }
  }, [isLoadingSession, currentParticipant, session, navigate]);

  // Handle leaving session
  const handleLeave = async () => {
    const confirmLeave = window.confirm(
      isOrganizer() 
        ? 'Are you sure you want to end this session? This will end it for all participants.'
        : 'Are you sure you want to leave this session?'
    );
    
    if (confirmLeave) {
      await leaveSession();
      navigate('/');
    }
  };

  // Handle sharing
  const handleShare = () => {
    const shareMenu = [
      { label: 'Copy Session Code', action: copySessionCode },
      { label: 'Copy Session Link', action: copySessionUrl },
    ];

    // For mobile, show native share if available
    if (navigator.share && isMobile) {
      navigator.share({
        title: session?.title,
        text: `Join my upVoice session: ${session?.title}`,
        url: window.location.href,
      }).catch(() => {
        // Fallback to copy
        copySessionUrl();
      });
    } else {
      // Show share options
      copySessionUrl();
    }
  };

  if (isLoadingSession) {
    return <LoadingScreen message="Loading session..." />;
  }

  if (sessionError || !session) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {sessionError || 'Session not found'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" noWrap>
                {session.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  size="small"
                  label={session.code}
                  onClick={copySessionCode}
                  sx={{ cursor: 'pointer' }}
                />
                <Typography variant="caption" color="text.secondary">
                  " {activeCount} active
                </Typography>
                {session.status === 'paused' && (
                  <Chip
                    size="small"
                    label="Paused"
                    color="warning"
                    icon={<PauseIcon />}
                  />
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <ConnectionStatus />
              
              {(isOrganizer() || isModerator()) && (
                <>
                  <IconButton onClick={togglePause}>
                    {session.status === 'paused' ? <PlayIcon /> : <PauseIcon />}
                  </IconButton>
                  <IconButton onClick={() => setShowStats(!showStats)}>
                    <Badge badgeContent={messages.length} color="primary">
                      <AnalyticsIcon />
                    </Badge>
                  </IconButton>
                  {isOrganizer() && (
                    <IconButton onClick={() => navigate(`/session/${sessionId}/settings`)}>
                      <SettingsIcon />
                    </IconButton>
                  )}
                </>
              )}
              
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<ExitIcon />}
                onClick={handleLeave}
                sx={{ ml: 1 }}
              >
                {isOrganizer() ? 'End' : 'Leave'}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Session Area */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Grid container sx={{ height: '100%' }}>
            {/* Messages Section */}
            <Grid item xs={12} md={showStats ? 7 : 9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
                <MessageList
                  messages={messages}
                  onSelectMessage={setSelectedMessage}
                  selectedMessageId={selectedMessage}
                />
              </Box>
              
              {/* Message Input */}
              {session.status !== 'paused' && currentParticipant && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <MessageInput
                    onSend={sendMessage}
                    disabled={isSending || !isConnected}
                    placeholder={
                      session.status === 'paused' 
                        ? 'Session is paused' 
                        : 'Share your thoughts...'
                    }
                  />
                </Box>
              )}
            </Grid>

            {/* Stats Panel (Desktop) */}
            {!isMobile && showStats && (
              <Grid item md={2} sx={{ height: '100%', borderLeft: 1, borderColor: 'divider' }}>
                <SessionStats sessionId={sessionId!} />
              </Grid>
            )}

            {/* Participants Panel (Desktop) */}
            {!isMobile && (
              <Grid item md={3} sx={{ height: '100%', borderLeft: 1, borderColor: 'divider' }}>
                <ParticipantList participants={participants} />
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Voting Panel (if message selected) */}
        {selectedMessage && (
          <Paper
            elevation={3}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              width: 320,
              maxWidth: 'calc(100vw - 32px)',
              zIndex: theme.zIndex.drawer - 1,
            }}
          >
            <VotingPanel
              messageId={selectedMessage}
              onClose={() => setSelectedMessage(null)}
            />
          </Paper>
        )}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen && isMobile}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            maxWidth: '80vw',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Participants ({participants.length})
          </Typography>
          <ParticipantList participants={participants} />
          
          {showStats && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Session Stats
              </Typography>
              <SessionStats sessionId={sessionId!} />
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};