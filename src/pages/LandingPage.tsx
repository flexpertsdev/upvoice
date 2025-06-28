import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, TextField, Paper, Grid, Card, CardContent, IconButton, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { MicIcon, PeopleIcon, AnalyticsIcon, SecurityIcon, SpeedIcon, CloudIcon, PlayIcon, ArrowForwardIcon } from '@components/icons';
import { useAuthStore } from '@stores/auth.store';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { anonymousUser } = useAuthStore();
  const [sessionCode, setSessionCode] = useState('');

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      navigate(`/join/${sessionCode.trim()}`);
    }
  };

  const handleCreateSession = () => {
    navigate('/create');
  };

  const handleQuickStart = async () => {
    // For demo purposes, create anonymous session
    if (!anonymousUser) {
      await useAuthStore.getState().signInAnonymously();
    }
    navigate('/create');
  };

  const features = [
    {
      icon: <MicIcon />,
      title: 'Real-time Voice Sessions',
      description: 'Engage audiences with live voice feedback and interactive discussions',
    },
    {
      icon: <PeopleIcon />,
      title: 'Audience Participation',
      description: 'Let everyone contribute through messages and voting in real-time',
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Instant Analytics',
      description: 'Get AI-powered insights and sentiment analysis as sessions unfold',
    },
    {
      icon: <SecurityIcon />,
      title: 'Anonymous & Secure',
      description: 'Participants can join anonymously while maintaining session integrity',
    },
    {
      icon: <SpeedIcon />,
      title: 'Lightning Fast',
      description: 'Built for speed with real-time updates and minimal latency',
    },
    {
      icon: <CloudIcon />,
      title: 'Cloud Native',
      description: 'Powered by Firebase for reliability and global scalability',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    fontWeight: 700,
                    mb: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Amplify Every Voice
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4, lineHeight: 1.6 }}
                >
                  Transform presentations into interactive conversations. Let your audience participate, vote, and engage in real-time.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayIcon />}
                    onClick={handleQuickStart}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                    }}
                  >
                    Quick Start
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                    }}
                  >
                    Sign In
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Join a Session
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="Enter session code"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleJoinSession}
                      disabled={!sessionCode.trim()}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Join
                    </Button>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      OR
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleCreateSession}
                      sx={{ py: 1.5 }}
                    >
                      Create New Session
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              mb: 2,
            }}
          >
            Built for Modern Engagement
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Everything you need to create interactive sessions that captivate and involve your audience
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        color: 'primary.main',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Ready to Transform Your Sessions?
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 5, maxWidth: 500, mx: 'auto' }}
              >
                Join thousands of presenters who are creating more engaging and interactive experiences
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleQuickStart}
                sx={{
                  py: 2,
                  px: 6,
                  fontSize: '1.2rem',
                  boxShadow: theme.shadows[8],
                }}
              >
                Get Started Free
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;