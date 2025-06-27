import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { PersonIcon, ArrowForwardIcon, GroupIcon } from '@components/icons';
import { useSession } from '@hooks/useSession';
import { useAuthStore } from '@stores/auth.store';
import { LoadingScreen } from '@components/common/LoadingScreen';

export const JoinSession: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, anonymousUser, signInAnonymously } = useAuthStore();
  const { session, joinSession, isJoining, error, loadSession } = useSession();

  const [displayName, setDisplayName] = useState('');
  const [sessionCode, setSessionCode] = useState(code || '');
  const [isLoadingSession, setIsLoadingSession] = useState(!!code);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Load session details if code provided
  useEffect(() => {
    if (code) {
      loadSessionByCode();
    }
  }, [code]);

  const loadSessionByCode = async () => {
    try {
      setIsLoadingSession(true);
      setSessionError(null);
      const loaded = await loadSession(code!);
      if (!loaded) {
        setSessionError('Session not found or has ended');
      }
    } catch (err) {
      setSessionError('Failed to load session details');
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleJoin = async () => {
    if (!sessionCode.trim()) return;

    // Ensure user is authenticated (anonymous or regular)
    if (!user && !anonymousUser) {
      await signInAnonymously();
    }

    // Use display name or fallback
    const name = displayName.trim() || 
      user?.displayName || 
      `Guest ${Math.floor(Math.random() * 1000)}`;

    const success = await joinSession(sessionCode.trim(), name);
    
    if (success) {
      navigate(`/session/${session?.id || sessionCode}`);
    }
  };

  if (isLoadingSession) {
    return <LoadingScreen message="Loading session details..." />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            >
              <GroupIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Join Session
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your details to join the conversation
            </Typography>
          </Box>

          {/* Session Info (if loaded) */}
          {session && (
            <Box
              sx={{
                mb: 4,
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {session.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  size="small"
                  label={`${session.participantCount || 0} participants`}
                  icon={<GroupIcon />}
                />
                <Chip
                  size="small"
                  label={session.status}
                  color={session.status === 'active' ? 'success' : 'default'}
                />
              </Box>
              {session.description && (
                <Typography variant="body2" color="text.secondary">
                  {session.description}
                </Typography>
              )}
            </Box>
          )}

          {/* Error Alert */}
          {(error || sessionError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || sessionError}
            </Alert>
          )}

          {/* Join Form */}
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleJoin(); }}>
            {/* Session Code (if not from URL) */}
            {!code && (
              <TextField
                fullWidth
                label="Session Code"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                sx={{ mb: 3 }}
                inputProps={{
                  style: { textTransform: 'uppercase' },
                  maxLength: 6,
                }}
              />
            )}

            {/* Display Name */}
            <TextField
              fullWidth
              label="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={user ? user.displayName || 'Enter your name' : 'Enter your name'}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              helperText={!displayName && 'Leave empty to join anonymously'}
            />

            {/* Join Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleJoin}
              disabled={isJoining || !sessionCode.trim()}
              endIcon={isJoining ? null : <ArrowForwardIcon />}
              sx={{ py: 1.5, mb: 3 }}
            >
              {isJoining ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Joining...
                </>
              ) : (
                'Join Session'
              )}
            </Button>

            <Divider sx={{ my: 3 }}>OR</Divider>

            {/* Alternative Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/create')}
              >
                Create Session
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </Box>
          </Box>

          {/* Privacy Note */}
          <Box sx={{ mt: 4, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              = Your privacy is protected. You can join anonymously or with just a display name. 
              No personal information is required.
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};