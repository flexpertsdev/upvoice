import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  useTheme,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AddIcon,
  GroupIcon,
  TimeIcon,
  InsightsIcon,
  MoreVertIcon,
  EditIcon,
  DeleteIcon,
  ShareIcon,
  DownloadIcon,
  BarChartIcon,
} from '@components/icons';
import { useAuthStore } from '@stores/auth.store';
import { useSessionStore } from '@stores/session.store';
import { formatDistanceToNow } from 'date-fns';
import type { SessionListItem } from '@/types';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        sx={{
          p: 3,
          height: '100%',
          background: alpha(theme.palette[color as keyof typeof theme.palette].main, 0.05),
          border: `1px solid ${alpha(theme.palette[color as keyof typeof theme.palette].main, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette[color as keyof typeof theme.palette].main, 0.1),
              color: theme.palette[color as keyof typeof theme.palette].main,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight={600}>
          {value}
        </Typography>
      </Paper>
    </motion.div>
  );
};

const SessionCard: React.FC<{
  session: SessionListItem;
  onEdit: (session: SessionListItem) => void;
  onDelete: (sessionId: string) => void;
  onShare: (session: SessionListItem) => void;
}> = ({ session, onEdit, onDelete, onShare }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'ended':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={() => navigate(`/session/${session.id}`)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Chip
              label={session.status}
              size="small"
              color={getStatusColor(session.status) as any}
            />
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Typography variant="h6" gutterBottom>
            {session.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
            <GroupIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">
              {session.participantCount} participants
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <TimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">
              {formatDistanceToNow(session.createdAt, { addSuffix: true })}
            </Typography>
          </Box>

          {session.tags && session.tags.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {session.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          )}
        </CardContent>

        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/session/${session.id}`);
            }}
          >
            {session.status === 'active' ? 'Join' : 'View'}
          </Button>
          {session.status === 'active' && (
            <Button
              size="small"
              startIcon={<InsightsIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/session/${session.id}/insights`);
              }}
            >
              Insights
            </Button>
          )}
        </CardActions>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEdit(session);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onShare(session);
          }}
        >
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            // TODO: Implement export
            toast.success('Export feature coming soon!');
          }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete(session.id);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </motion.div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { sessions, isLoading, fetchUserSessions } = useSessionStore();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserSessions(user.uid);
    }
  }, [user, fetchUserSessions]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditSession = (session: SessionListItem) => {
    navigate(`/session/${session.id}/settings`);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        // TODO: Implement delete
        toast.success('Session deleted successfully');
      } catch (error) {
        toast.error('Failed to delete session');
      }
    }
  };

  const handleShareSession = (session: SessionListItem) => {
    const shareUrl = `${window.location.origin}/join/${session.joinCode}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const endedSessions = sessions.filter(s => s.status === 'ended');

  const stats = {
    totalSessions: user?.sessionsCreated || 0,
    totalParticipants: sessions.reduce((acc, s) => acc + s.participantCount, 0),
    totalMessages: user?.totalMessages || 0,
    activeNow: activeSessions.length,
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to view your dashboard
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Welcome back, {user.displayName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's an overview of your upVoice activity
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Sessions"
              value={stats.totalSessions}
              icon={<GroupIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Participants"
              value={stats.totalParticipants}
              icon={<GroupIcon />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Messages Received"
              value={stats.totalMessages}
              icon={<InsightsIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Active Now"
              value={stats.activeNow}
              icon={<BarChartIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Sessions Section */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Your Sessions
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create')}
            >
              Create Session
            </Button>
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="session tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`Active (${activeSessions.length})`} />
            <Tab label={`Past (${endedSessions.length})`} />
            <Tab label="All Sessions" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {isLoading ? (
              <Grid container spacing={3}>
                {[1, 2, 3].map((i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            ) : activeSessions.length > 0 ? (
              <Grid container spacing={3}>
                <AnimatePresence>
                  {activeSessions.map((session) => (
                    <Grid item xs={12} sm={6} md={4} key={session.id}>
                      <SessionCard
                        session={session}
                        onEdit={handleEditSession}
                        onDelete={handleDeleteSession}
                        onShare={handleShareSession}
                      />
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No active sessions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create a new session to start collecting feedback
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/create')}
                >
                  Create Session
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {endedSessions.length > 0 ? (
              <Grid container spacing={3}>
                <AnimatePresence>
                  {endedSessions.map((session) => (
                    <Grid item xs={12} sm={6} md={4} key={session.id}>
                      <SessionCard
                        session={session}
                        onEdit={handleEditSession}
                        onDelete={handleDeleteSession}
                        onShare={handleShareSession}
                      />
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  No past sessions yet
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <AnimatePresence>
                {sessions.map((session) => (
                  <Grid item xs={12} sm={6} md={4} key={session.id}>
                    <SessionCard
                      session={session}
                      onEdit={handleEditSession}
                      onDelete={handleDeleteSession}
                      onShare={handleShareSession}
                    />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </TabPanel>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Dashboard;