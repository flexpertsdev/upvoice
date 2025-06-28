import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, Badge, Input, Loading, Avatar } from '@components/ui';
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
  LockIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@components/icons';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
    >
      {value === index && <div className="py-6">{children}</div>}
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

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState('');
  
  // Get user from localStorage (simplified for demo)
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  const userDisplayName = localStorage.getItem('userDisplayName') || 'Demo User';
  const userId = localStorage.getItem('userId') || 'demo-user-id';
  
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: userDisplayName,
    email: userEmail,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      sessionStart: true,
      sessionEnd: true,
      mentions: true,
    },
    privacy: {
      showEmail: false,
      allowAnalytics: true,
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
    },
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('userDisplayName', formData.displayName);
      localStorage.setItem('userEmail', formData.email);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.clear();
      navigate('/');
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const tabs = [
    { icon: PersonIcon, label: 'General' },
    { icon: NotificationsIcon, label: 'Notifications' },
    { icon: SecurityIcon, label: 'Security' },
    { icon: PaletteIcon, label: 'Appearance' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardBody className="text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar 
                      size="xl" 
                      name={userDisplayName}
                      className="w-24 h-24"
                    />
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                      <CameraIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {userDisplayName}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">{userEmail}</p>

                  <div className="flex justify-center gap-2 mb-6">
                    <Badge variant="primary">Free Plan</Badge>
                  </div>

                  <div className="space-y-4 text-left border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sessions Created</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sessions Joined</span>
                      <span className="font-medium">45</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Messages</span>
                      <span className="font-medium">327</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleSignOut}
                    className="mt-6 flex items-center justify-center gap-2"
                  >
                    <LogoutIcon className="w-4 h-4" />
                    Sign Out
                  </Button>
                </CardBody>
              </Card>
            </div>

            {/* Settings Tabs */}
            <div className="lg:col-span-2">
              <Card>
                <CardBody>
                  {/* Tab Navigation */}
                  <div className="flex border-b border-gray-200 mb-6">
                    {tabs.map((tab, index) => (
                      <button
                        key={tab.label}
                        onClick={() => setTabValue(index)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          tabValue === index
                            ? 'text-primary-600 border-primary-600'
                            : 'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-6">
                      {error}
                    </div>
                  )}

                  {/* General Tab */}
                  <TabPanel value={tabValue} index={0}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Profile Information
                      </h3>
                      {!isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2"
                        >
                          <EditIcon className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Name
                        </label>
                        <Input
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>

                      {isEditing && (
                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="primary"
                            onClick={handleProfileUpdate}
                            loading={isLoading}
                            disabled={isLoading}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabPanel>

                  {/* Notifications Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Notification Preferences
                    </h3>

                    <div className="space-y-4">
                      {Object.entries(preferences.notifications).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between cursor-pointer py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {key === 'email' && 'Receive notifications via email'}
                              {key === 'push' && 'Receive browser push notifications'}
                              {key === 'sessionStart' && 'When a session you\'re invited to begins'}
                              {key === 'sessionEnd' && 'When a session you participated in ends'}
                              {key === 'mentions' && 'When someone mentions you in a message'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, [key]: e.target.checked }
                            })}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </label>
                      ))}
                    </div>
                  </TabPanel>

                  {/* Security Tab */}
                  <TabPanel value={tabValue} index={2}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Security Settings
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-4">
                          Change Password
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <Input
                              type="password"
                              value={formData.currentPassword}
                              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                              placeholder="••••••••"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <Input
                              type="password"
                              value={formData.newPassword}
                              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                              placeholder="••••••••"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <Input
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              placeholder="••••••••"
                            />
                          </div>

                          <Button
                            variant="primary"
                            onClick={handlePasswordChange}
                            loading={isLoading}
                            disabled={isLoading}
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-base font-medium text-red-600 mb-4">
                          Danger Zone
                        </h4>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-red-800">
                            Deleting your account is permanent and cannot be undone.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <DeleteIcon className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </TabPanel>

                  {/* Appearance Tab */}
                  <TabPanel value={tabValue} index={3}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Appearance Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Theme</p>
                          <p className="text-sm text-gray-600">Choose your preferred color scheme</p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            const themes = ['light', 'dark', 'system'];
                            const currentIndex = themes.indexOf(preferences.theme);
                            const nextTheme = themes[(currentIndex + 1) % themes.length];
                            setPreferences({ ...preferences, theme: nextTheme });
                          }}
                        >
                          {preferences.theme}
                        </Badge>
                      </div>

                      {Object.entries(preferences.accessibility).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between cursor-pointer py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {key === 'reducedMotion' && 'Minimize animations and transitions'}
                              {key === 'highContrast' && 'Increase contrast for better visibility'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              accessibility: { ...preferences.accessibility, [key]: e.target.checked }
                            })}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </label>
                      ))}
                    </div>
                  </TabPanel>
                </CardBody>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Delete Account Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Account</h3>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium">This action cannot be undone!</p>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete your account? All your data, including:
              </p>
              
              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
                <li>All created sessions</li>
                <li>Message history</li>
                <li>Analytics data</li>
                <li>Account settings</li>
              </ul>
              
              <p className="text-sm text-gray-600 mb-6">will be permanently deleted.</p>
              
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleDeleteAccount}
                  loading={isLoading}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Account
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;