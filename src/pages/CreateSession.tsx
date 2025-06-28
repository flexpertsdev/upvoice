import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardBody } from '@components/ui';
import { 
  ArrowForwardIcon, 
  CopyIcon, 
  CheckIcon,
  SettingsIcon,
  ClockIcon,
  UsersIcon,
  MessageIcon
} from '@components/icons';

interface SessionSettings {
  name: string;
  topic: string;
  duration: number;
  maxParticipants: number;
  allowAnonymous: boolean;
  requireCode: boolean;
}

const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'setup' | 'created'>('setup');
  const [sessionCode, setSessionCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [settings, setSettings] = useState<SessionSettings>({
    name: '',
    topic: '',
    duration: 30,
    maxParticipants: 100,
    allowAnonymous: true,
    requireCode: true
  });

  const generateSessionCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleCreateSession = async () => {
    // Validate inputs
    if (!settings.name.trim() || !settings.topic.trim()) {
      return;
    }

    setIsCreating(true);

    try {
      // Generate session code
      const code = generateSessionCode();
      setSessionCode(code);

      // Create session in local storage (simplified version)
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const moderatorId = localStorage.getItem('tempUserId') || `mod_${Date.now()}`;
      
      const session = {
        id: sessionId,
        code: code,
        name: settings.name,
        currentTopic: settings.topic,
        duration: settings.duration * 60, // Convert to seconds
        maxParticipants: settings.maxParticipants,
        allowAnonymous: settings.allowAnonymous,
        moderatorId: moderatorId,
        isActive: true,
        createdAt: Date.now(),
        participants: []
      };

      // Store session
      const sessions = JSON.parse(localStorage.getItem('sessions') || '{}');
      sessions[code] = session;
      localStorage.setItem('sessions', JSON.stringify(sessions));
      localStorage.setItem('currentSessionCode', code);
      localStorage.setItem('isModerator', 'true');

      // Move to created step
      setTimeout(() => {
        setIsCreating(false);
        setStep('created');
      }, 500);
    } catch (error) {
      console.error('Failed to create session:', error);
      setIsCreating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartSession = () => {
    navigate(`/moderate/${sessionCode}`);
  };

  if (step === 'created') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Created!</h1>
            <p className="text-gray-600">Share this code with participants</p>
          </div>

          <Card>
            <CardBody className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Session Code</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-mono font-bold text-primary-600">
                    {sessionCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy code"
                  >
                    {copied ? (
                      <CheckIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <CopyIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-3">Session Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-900">{settings.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Topic:</span>
                    <span className="text-gray-900">{settings.topic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="text-gray-900">{settings.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Participants:</span>
                    <span className="text-gray-900">{settings.maxParticipants}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleStartSession}
                  className="flex items-center justify-center gap-2"
                >
                  Start Moderating
                  <ArrowForwardIcon className="w-5 h-5" />
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Share URL:{' '}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/join/${sessionCode}`
                        );
                      }}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {window.location.origin}/join/{sessionCode}
                    </button>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Session</h1>
          <p className="text-gray-600">Set up a new discussion session</p>
        </div>

        <Card>
          <CardBody className="space-y-6">
            <div>
              <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-2">
                Session Name
              </label>
              <Input
                id="sessionName"
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="e.g., Team Retrospective"
                disabled={isCreating}
              />
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                First Topic / Question
              </label>
              <textarea
                id="topic"
                value={settings.topic}
                onChange={(e) => setSettings({ ...settings, topic: e.target.value })}
                placeholder="What should we discuss today?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Duration (min)
                </label>
                <Input
                  id="duration"
                  type="number"
                  value={settings.duration}
                  onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) || 30 })}
                  min={5}
                  max={120}
                  disabled={isCreating}
                />
              </div>

              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                  <UsersIcon className="w-4 h-4 inline mr-1" />
                  Max Participants
                </label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={settings.maxParticipants}
                  onChange={(e) => setSettings({ ...settings, maxParticipants: parseInt(e.target.value) || 100 })}
                  min={2}
                  max={1000}
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Session Settings</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Allow anonymous participants</span>
                  <input
                    type="checkbox"
                    checked={settings.allowAnonymous}
                    onChange={(e) => setSettings({ ...settings, allowAnonymous: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    disabled={isCreating}
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Require session code to join</span>
                  <input
                    type="checkbox"
                    checked={settings.requireCode}
                    onChange={(e) => setSettings({ ...settings, requireCode: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    disabled={isCreating}
                  />
                </label>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCreateSession}
              loading={isCreating}
              disabled={!settings.name.trim() || !settings.topic.trim()}
              className="flex items-center justify-center gap-2"
            >
              {isCreating ? 'Creating...' : 'Create Session'}
              {!isCreating && <ArrowForwardIcon className="w-5 h-5" />}
            </Button>

            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-700"
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CreateSession;