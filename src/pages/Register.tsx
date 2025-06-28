import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card, CardBody, Badge } from '@components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GoogleIcon,
  MicrosoftIcon,
  EmailIcon,
  LockIcon,
  PersonIcon,
  BusinessIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  CheckIcon,
} from '@components/icons';

interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
  acceptTerms: boolean;
}

const steps = ['Account Info', 'Organization', 'Complete'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [registrationType, setRegistrationType] = useState<'personal' | 'organization'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<RegisterFormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    acceptTerms: false,
  });

  const handleNext = () => {
    setError('');
    
    if (activeStep === 0) {
      // Validate first step
      if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }
      
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    
    if (activeStep === 1 && !formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, create user session
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userDisplayName', formData.displayName);
      localStorage.setItem('isAuthenticated', 'true');
      
      if (registrationType === 'organization' && formData.organizationName) {
        localStorage.setItem('organizationName', formData.organizationName);
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: 'google' | 'microsoft') => {
    // For demo, simulate social registration
    const userId = `${provider}_user_${Date.now()}`;
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', `demo@${provider}.com`);
    localStorage.setItem('userDisplayName', `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`);
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/dashboard');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index <= activeStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index < activeStep ? <CheckIcon className="w-5 h-5" /> : index + 1}
            </div>
            <span className={`ml-2 text-sm ${
              index <= activeStep ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-3 transition-colors ${
              index < activeStep ? 'bg-primary-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PersonIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="pl-10"
                  placeholder="John Doe"
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EmailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                At least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How will you use upVoice?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This helps us personalize your experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setRegistrationType('personal')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  registrationType === 'personal'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <PersonIcon className="w-10 h-10 text-primary-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Personal Use</h4>
                <p className="text-sm text-gray-600">
                  For individual projects and small teams
                </p>
              </button>

              <button
                onClick={() => setRegistrationType('organization')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  registrationType === 'organization'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BusinessIcon className="w-10 h-10 text-primary-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Organization</h4>
                <p className="text-sm text-gray-600">
                  For companies and larger teams
                </p>
              </button>
            </div>

            {registrationType === 'organization' && (
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BusinessIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="organizationName"
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="pl-10"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
            )}

            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>
        );

      case 2:
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-block"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              You're all set!
            </h3>
            <p className="text-gray-600 mb-6">
              Welcome to upVoice, {formData.displayName}
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
            >
              Get Started
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardBody className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-600">Join upVoice to start transforming discussions</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              {renderStepIndicator()}

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
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={activeStep === 0}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  </div>

                  {activeStep === 0 && (
                    <>
                      <div className="relative mt-8">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                      </div>

                      <div className="space-y-3 mt-6">
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => handleSocialRegister('google')}
                          className="flex items-center justify-center gap-3"
                        >
                          <GoogleIcon className="w-5 h-5" />
                          Continue with Google
                        </Button>

                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => handleSocialRegister('microsoft')}
                          className="flex items-center justify-center gap-3"
                        >
                          <MicrosoftIcon className="w-5 h-5" />
                          Continue with Microsoft
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeStep < 2 && (
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;