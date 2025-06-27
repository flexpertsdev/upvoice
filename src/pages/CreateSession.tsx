import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MicIcon,
  GroupIcon,
  SettingsIcon,
  RocketIcon,
  LockIcon,
  UnlockIcon,
  TimerIcon,
  VolumeIcon,
} from '@components/icons';
import { useSession } from '@hooks/useSession';
import { useAuthStore } from '@stores/auth.store';
import { SessionSettings, SessionType } from '@types';
import toast from 'react-hot-toast';

const steps = ['Basic Info', 'Settings', 'Review & Create'];

const sessionTemplates = [
  {
    type: 'presentation' as SessionType,
    title: 'Presentation Q&A',
    description: 'Perfect for talks and presentations with audience Q&A',
    icon: <MicIcon />,
    settings: {
      allowAnonymous: true,
      requireApproval: false,
      maxParticipants: 100,
      votingEnabled: true,
      autoModeration: true,
    },
  },
  {
    type: 'workshop' as SessionType,
    title: 'Interactive Workshop',
    description: 'Collaborative sessions with active participation',
    icon: <GroupIcon />,
    settings: {
      allowAnonymous: false,
      requireApproval: true,
      maxParticipants: 30,
      votingEnabled: true,
      autoModeration: false,
    },
  },
  {
    type: 'meeting' as SessionType,
    title: 'Team Meeting',
    description: 'Private sessions for team discussions',
    icon: <GroupIcon />,
    settings: {
      allowAnonymous: false,
      requireApproval: true,
      maxParticipants: 20,
      votingEnabled: false,
      autoModeration: false,
    },
  },
];

export const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { createSession, isCreating } = useSession();
  const { user, anonymousUser, signInAnonymously } = useAuthStore();

  const [activeStep, setActiveStep] = useState(0);
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    type: 'presentation' as SessionType,
    settings: {
      allowAnonymous: true,
      requireApproval: false,
      maxParticipants: 100,
      votingEnabled: true,
      autoModeration: true,
      messageCooldown: 5,
      sessionDuration: 60,
    } as SessionSettings,
  });

  const handleNext = () => {
    if (activeStep === 0 && !sessionData.title.trim()) {
      toast.error('Please enter a session title');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleTemplateSelect = (template: typeof sessionTemplates[0]) => {
    setSessionData((prev) => ({
      ...prev,
      type: template.type,
      settings: { ...prev.settings, ...template.settings },
    }));
  };

  const handleCreate = async () => {
    // Ensure user is authenticated
    if (!user && !anonymousUser) {
      await signInAnonymously();
    }

    const session = await createSession(sessionData.title, sessionData.settings);
    
    if (session) {
      navigate(`/session/${session.id}`);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose a template or start from scratch
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {sessionTemplates.map((template) => (
                <Grid item xs={12} sm={4} key={template.type}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: sessionData.type === template.type ? 2 : 1,
                      borderColor: sessionData.type === template.type ? 'primary.main' : 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ color: 'primary.main', mr: 1 }}>
                          {template.icon}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {template.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <TextField
              fullWidth
              label="Session Title"
              value={sessionData.title}
              onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
              placeholder="e.g., Q&A with the Team"
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Description (Optional)"
              value={sessionData.description}
              onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
              placeholder="What's this session about?"
              multiline
              rows={3}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Customize your session settings
            </Typography>

            {/* Access Control */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Access Control
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={sessionData.settings.allowAnonymous}
                    onChange={(e) => setSessionData({
                      ...sessionData,
                      settings: { ...sessionData.settings, allowAnonymous: e.target.checked },
                    })}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {sessionData.settings.allowAnonymous ? <UnlockIcon sx={{ mr: 1 }} /> : <LockIcon sx={{ mr: 1 }} />}
                    Allow anonymous participants
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={sessionData.settings.requireApproval}
                    onChange={(e) => setSessionData({
                      ...sessionData,
                      settings: { ...sessionData.settings, requireApproval: e.target.checked },
                    })}
                  />
                }
                label="Require approval to join"
              />
            </Box>

            {/* Interaction Settings */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Interaction Settings
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={sessionData.settings.votingEnabled}
                    onChange={(e) => setSessionData({
                      ...sessionData,
                      settings: { ...sessionData.settings, votingEnabled: e.target.checked },
                    })}
                  />
                }
                label="Enable voting on messages"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={sessionData.settings.autoModeration}
                    onChange={(e) => setSessionData({
                      ...sessionData,
                      settings: { ...sessionData.settings, autoModeration: e.target.checked },
                    })}
                  />
                }
                label="Enable AI auto-moderation"
              />
            </Box>

            {/* Limits */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Limits & Restrictions
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Maximum Participants: {sessionData.settings.maxParticipants}
                </Typography>
                <Slider
                  value={sessionData.settings.maxParticipants}
                  onChange={(_, value) => setSessionData({
                    ...sessionData,
                    settings: { ...sessionData.settings, maxParticipants: value as number },
                  })}
                  min={10}
                  max={500}
                  step={10}
                  marks={[
                    { value: 10, label: '10' },
                    { value: 100, label: '100' },
                    { value: 500, label: '500' },
                  ]}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Message Cooldown: {sessionData.settings.messageCooldown}s
                </Typography>
                <Slider
                  value={sessionData.settings.messageCooldown}
                  onChange={(_, value) => setSessionData({
                    ...sessionData,
                    settings: { ...sessionData.settings, messageCooldown: value as number },
                  })}
                  min={0}
                  max={60}
                  step={5}
                  marks={[
                    { value: 0, label: 'None' },
                    { value: 30, label: '30s' },
                    { value: 60, label: '60s' },
                  ]}
                />
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review your session
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              You can modify these settings anytime during the session
            </Alert>

            <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h5" gutterBottom>
                {sessionData.title}
              </Typography>
              {sessionData.description && (
                <Typography variant="body1" color="text.secondary" paragraph>
                  {sessionData.description}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Session Type
                  </Typography>
                  <Typography variant="body1">
                    {sessionTemplates.find(t => t.type === sessionData.type)?.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Participants
                  </Typography>
                  <Typography variant="body1">
                    {sessionData.settings.maxParticipants}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Features
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {sessionData.settings.allowAnonymous && (
                      <Chip size="small" label="Anonymous allowed" />
                    )}
                    {sessionData.settings.votingEnabled && (
                      <Chip size="small" label="Voting enabled" />
                    )}
                    {sessionData.settings.autoModeration && (
                      <Chip size="small" label="Auto-moderation" />
                    )}
                    {sessionData.settings.requireApproval && (
                      <Chip size="small" label="Approval required" />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Create New Session
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set up your interactive session in just a few steps
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={isCreating}
                startIcon={isCreating ? <CircularProgress size={20} /> : <RocketIcon />}
              >
                {isCreating ? 'Creating...' : 'Create Session'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};