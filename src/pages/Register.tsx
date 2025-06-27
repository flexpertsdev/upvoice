import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GoogleIcon,
  MicrosoftIcon,
  EmailIcon,
  LockIcon,
  PersonIcon,
  BusinessIcon,
  VisibilityIcon,
  VisibilityOffIcon,
  CheckCircleIcon,
} from '@components/icons';
import { useAuthStore } from '@stores/auth.store';
import { useForm } from '@hooks/useForm';
import toast from 'react-hot-toast';

interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
  acceptTerms: boolean;
}

const initialFormData: RegisterFormData = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  organizationName: '',
  acceptTerms: false,
};

const validationRules = {
  displayName: {
    required: true,
    minLength: 2,
  },
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  confirmPassword: {
    required: true,
    match: 'password',
  },
  acceptTerms: {
    required: true,
  },
};

const steps = ['Account Info', 'Organization', 'Complete'];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { createAccount, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [registrationType, setRegistrationType] = useState<'personal' | 'organization'>('personal');

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
  } = useForm<RegisterFormData>(initialFormData, validationRules);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate first step fields
      const fieldsToValidate = ['displayName', 'email', 'password', 'confirmPassword'];
      let hasErrors = false;
      fieldsToValidate.forEach(field => {
        if (!validateField(field as keyof RegisterFormData)) {
          hasErrors = true;
        }
      });
      if (hasErrors) return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const organizationId = registrationType === 'organization' ? 'new-org' : undefined;
      await createAccount(
        data.email,
        data.password,
        data.displayName,
        organizationId
      );
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // TODO: Implement Google sign-up
      toast.error('Google sign-up coming soon!');
    } catch (error) {
      toast.error('Failed to sign up with Google');
    }
  };

  const handleMicrosoftSignUp = async () => {
    try {
      // TODO: Implement Microsoft sign-up
      toast.error('Microsoft sign-up coming soon!');
    } catch (error) {
      toast.error('Failed to sign up with Microsoft');
    }
  };

  React.useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Full Name"
              name="displayName"
              value={values.displayName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.displayName && !!errors.displayName}
              helperText={touched.displayName && errors.displayName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              autoComplete="name"
              autoFocus
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && !!errors.password}
              helperText={
                touched.password && errors.password
                  ? errors.password
                  : 'At least 8 characters with uppercase, lowercase, number, and special character'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              autoComplete="new-password"
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && !!errors.confirmPassword}
              helperText={touched.confirmPassword && errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoComplete="new-password"
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              How will you use upVoice?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This helps us personalize your experience
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Paper
                sx={{
                  flex: 1,
                  p: 3,
                  cursor: 'pointer',
                  border: 2,
                  borderColor: registrationType === 'personal' ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => setRegistrationType('personal')}
              >
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Personal Use
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For individual projects and small teams
                </Typography>
              </Paper>

              <Paper
                sx={{
                  flex: 1,
                  p: 3,
                  cursor: 'pointer',
                  border: 2,
                  borderColor: registrationType === 'organization' ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => setRegistrationType('organization')}
              >
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Organization
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For companies and larger teams
                </Typography>
              </Paper>
            </Box>

            {registrationType === 'organization' && (
              <TextField
                fullWidth
                label="Organization Name"
                name="organizationName"
                value={values.organizationName}
                onChange={handleChange}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  name="acceptTerms"
                  checked={values.acceptTerms}
                  onChange={handleChange}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    style={{ color: theme.palette.primary.main }}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    style={{ color: theme.palette.primary.main }}
                  >
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <CheckCircleIcon
                sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
              />
            </motion.div>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              You're all set!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Welcome to upVoice, {values.displayName}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Get Started'
              )}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
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
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join upVoice to start transforming discussions
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

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

          {activeStep < 2 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Box>

              {activeStep === 0 && (
                <>
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<GoogleIcon />}
                      onClick={handleGoogleSignUp}
                      disabled={isLoading}
                    >
                      Continue with Google
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<MicrosoftIcon />}
                      onClick={handleMicrosoftSignUp}
                      disabled={isLoading}
                    >
                      Continue with Microsoft
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}

          {activeStep < 2 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Register;