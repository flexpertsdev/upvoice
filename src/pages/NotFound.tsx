import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  SearchIcon,
  ArrowBackIcon,
} from '@components/icons';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
                fontWeight: 800,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              404
            </Typography>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Oops! Page not found
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              sx={{ maxWidth: 500, mx: 'auto' }}
            >
              The page you're looking for doesn't exist. It might have been moved, 
              deleted, or you may have mistyped the URL.
            </Typography>
          </motion.div>

          {/* Floating Elements Animation */}
          <Box sx={{ position: 'relative', height: 100, width: '100%', my: 4 }}>
            <motion.div
              style={{
                position: 'absolute',
                left: '20%',
                top: '20%',
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <SearchIcon
                sx={{
                  fontSize: 40,
                  color: theme.palette.primary.light,
                  opacity: 0.5,
                }}
              />
            </motion.div>

            <motion.div
              style={{
                position: 'absolute',
                right: '20%',
                top: '40%',
              }}
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            >
              <HomeIcon
                sx={{
                  fontSize: 35,
                  color: theme.palette.secondary.light,
                  opacity: 0.5,
                }}
              />
            </motion.div>

            <motion.div
              style={{
                position: 'absolute',
                left: '50%',
                top: '60%',
                transform: 'translateX(-50%)',
              }}
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  opacity: 0.2,
                }}
              />
            </motion.div>
          </Box>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
              >
                Go Back
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
              >
                Go Home
              </Button>
            </Box>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Box sx={{ mt: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Need help? You can:
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 3, justifyContent: 'center' }}>
                <Button
                  size="small"
                  onClick={() => navigate('/dashboard')}
                  sx={{ textTransform: 'none' }}
                >
                  View Dashboard
                </Button>
                <Button
                  size="small"
                  onClick={() => navigate('/create')}
                  sx={{ textTransform: 'none' }}
                >
                  Create Session
                </Button>
                <Button
                  size="small"
                  onClick={() => navigate('/join')}
                  sx={{ textTransform: 'none' }}
                >
                  Join Session
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </motion.div>
    </Container>
  );
};

export default NotFound;