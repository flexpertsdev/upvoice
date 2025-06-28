import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PersonIcon,
  EmailIcon,
  NotificationsIcon,
  SecurityIcon,
  PaletteIcon,
  BusinessIcon,
  CameraIcon,
  EditIcon,
  DeleteIcon,
  LogoutIcon,
} from '@components/icons';
import { useAuthStore } from '@stores/auth.store';
import { useForm } from '@hooks/useForm';
import type { UserPreferences } from '@/types';
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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface ProfileFormData {
  displayName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, updateUser, signOut } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(
    user?.preferences || {
      theme: 'system',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sessionStart: true,
        sessionEnd: true,
        mentions: true,
        reports: false,
      },
      privacy: {
        showEmail: false,
        allowAnalytics: true,
        shareDataWithOrg: true,
      },
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
        keyboardNavigation: true,
      },
    }
  );

  const initialFormData: ProfileFormData = {
    displayName: user?.displayName || '',
    email: user?.email || '',
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
    currentPassword: {
      minLength: 6,
    },
    newPassword: {
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    },
    confirmPassword: {
      match: 'newPassword',
    },
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<ProfileFormData>(initialFormData, validationRules);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement profile update
      updateUser({
        displayName: data.displayName,
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!values.currentPassword || !values.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement password change
      toast.success('Password changed successfully');
      values.currentPassword = '';
      values.newPassword = '';
      values.confirmPassword = '';
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (path: string, value: any) => {
    const keys = path.split('.');
    const newPreferences = { ...preferences };
    let current: any = newPreferences;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setPreferences(newPreferences);
    // TODO: Save preferences to backend
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement account deletion
      toast.success('Account deleted successfully');
      await signOut();
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // TODO: Implement avatar upload
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please sign in to view your profile
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
        <Typography variant="h4" fontWeight={600} gutterBottom>
          My Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Overview */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <Avatar
                  src={user.photoURL || undefined}
                  sx={{ width: 120, height: 120 }}
                >
                  {user.displayName?.[0] || user.email?.[0]}
                </Avatar>
                <input
                  accept="image/*"
                  id="avatar-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'background.paper',
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                  >
                    <CameraIcon />
                  </IconButton>
                </label>
              </Box>

              <Typography variant="h6" gutterBottom>
                {user.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                <Chip
                  label={user.role}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {user.organizationId && (
                  <Chip
                    label={user.organizationRole || 'member'}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Sessions Created"
                    secondary={user.sessionsCreated}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Sessions Joined"
                    secondary={user.sessionsParticipated}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Messages"
                    secondary={user.totalMessages}
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Settings Tabs */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<PersonIcon />} label="General" />
                <Tab icon={<NotificationsIcon />} label="Notifications" />
                <Tab icon={<SecurityIcon />} label="Security" />
                <Tab icon={<PaletteIcon />} label="Appearance" />
                {user.organizationId && (
                  <Tab icon={<BusinessIcon />} label="Organization" />
                )}
              </Tabs>

              {/* General Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Profile Information</Typography>
                  {!isEditing && (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </Box>

                <form onSubmit={handleSubmit(handleProfileUpdate)}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    name="displayName"
                    value={values.displayName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.displayName && !!errors.displayName}
                    helperText={touched.displayName && errors.displayName}
                    disabled={!isEditing}
                    sx={{ mb: 3 }}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    disabled={!isEditing || user.isAnonymous}
                    sx={{ mb: 3 }}
                  />

                  {isEditing && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={!isValid || isLoading}
                      >
                        {isLoading ? <CircularProgress size={20} /> : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </form>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.notifications.email}
                        onChange={(e) => handlePreferenceChange('notifications.email', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Receive browser push notifications"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.notifications.push}
                        onChange={(e) => handlePreferenceChange('notifications.push', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <Divider sx={{ my: 2 }} />

                  <ListItem>
                    <ListItemText
                      primary="Session Start"
                      secondary="When a session you're invited to begins"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.notifications.sessionStart}
                        onChange={(e) => handlePreferenceChange('notifications.sessionStart', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Session End"
                      secondary="When a session you participated in ends"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.notifications.sessionEnd}
                        onChange={(e) => handlePreferenceChange('notifications.sessionEnd', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Mentions"
                      secondary="When someone mentions you in a message"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.notifications.mentions}
                        onChange={(e) => handlePreferenceChange('notifications.mentions', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>

                {!user.isAnonymous && (
                  <>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Change Password
                      </Typography>
                      
                      <TextField
                        fullWidth
                        type="password"
                        label="Current Password"
                        name="currentPassword"
                        value={values.currentPassword || ''}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        name="newPassword"
                        value={values.newPassword || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.newPassword && !!errors.newPassword}
                        helperText={touched.newPassword && errors.newPassword}
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        type="password"
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={values.confirmPassword || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.confirmPassword && !!errors.confirmPassword}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        sx={{ mb: 2 }}
                      />

                      <Button
                        variant="contained"
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                      >
                        Change Password
                      </Button>
                    </Box>

                    <Divider sx={{ my: 3 }} />
                  </>
                )}

                <Box>
                  <Typography variant="subtitle1" gutterBottom color="error">
                    Danger Zone
                  </Typography>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Deleting your account is permanent and cannot be undone.
                  </Alert>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Account
                  </Button>
                </Box>
              </TabPanel>

              {/* Appearance Tab */}
              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                  Appearance Settings
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Theme"
                      secondary="Choose your preferred color scheme"
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={preferences.theme}
                        onClick={() => {
                          const themes = ['light', 'dark', 'system'];
                          const currentIndex = themes.indexOf(preferences.theme);
                          const nextTheme = themes[(currentIndex + 1) % themes.length];
                          handlePreferenceChange('theme', nextTheme);
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Reduced Motion"
                      secondary="Minimize animations and transitions"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.accessibility.reducedMotion}
                        onChange={(e) => handlePreferenceChange('accessibility.reducedMotion', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="High Contrast"
                      secondary="Increase contrast for better visibility"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.accessibility.highContrast}
                        onChange={(e) => handlePreferenceChange('accessibility.highContrast', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </TabPanel>

              {/* Organization Tab */}
              {user.organizationId && (
                <TabPanel value={tabValue} index={4}>
                  <Typography variant="h6" gutterBottom>
                    Organization Settings
                  </Typography>
                  <Alert severity="info">
                    Organization management features coming soon!
                  </Alert>
                </TabPanel>
              )}
            </Paper>
          </Grid>
        </Grid>
      </motion.div>

      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete your account? All your data, including:
          </Typography>
          <List dense>
            <ListItem>• All created sessions</ListItem>
            <ListItem>• Message history</ListItem>
            <ListItem>• Analytics data</ListItem>
            <ListItem>• Account settings</ListItem>
          </List>
          <Typography>
            will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteAccount}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;