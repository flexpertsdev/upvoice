import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardBody } from '@components/ui';
import { ArrowForwardIcon, UsersIcon } from '@components/icons';

const JoinSession: React.FC = () => {
  const navigate = useNavigate();
  const { sessionCode: urlSessionCode } = useParams();
  const [sessionCode, setSessionCode] = useState(urlSessionCode || '');
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user already has a display name in localStorage
    const savedName = localStorage.getItem('displayName');
    if (savedName) {
      setDisplayName(savedName);
    }
  }, []);

  const handleJoinSession = async () => {
    // Validate inputs
    if (!sessionCode.trim()) {
      setError('Please enter a session code');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // For now, we'll simulate session joining with local storage
      const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save participant info
      localStorage.setItem('participantId', participantId);
      localStorage.setItem('displayName', displayName || 'Anonymous');
      localStorage.setItem('currentSessionCode', sessionCode.toUpperCase());
      
      // Simulate joining a session (in real app, this would check Firebase)
      // For demo, we'll create a mock session if it doesn't exist
      const sessions = JSON.parse(localStorage.getItem('sessions') || '{}');
      if (!sessions[sessionCode.toUpperCase()]) {
        // Create a demo session
        sessions[sessionCode.toUpperCase()] = {
          id: sessionCode.toUpperCase(),
          name: `Session ${sessionCode.toUpperCase()}`,
          currentTopic: 'Welcome! Share your thoughts on today\'s topic.',
          participantCount: 1,
          isActive: true,
          createdAt: Date.now()
        };
        localStorage.setItem('sessions', JSON.stringify(sessions));
      }

      // Navigate to active session
      setTimeout(() => {
        navigate(`/session/${sessionCode.toUpperCase()}`);
      }, 500);
    } catch (err) {
      setError('Failed to join session. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Session</h1>
          <p className="text-gray-600">Enter the session code to participate</p>
        </div>

        <Card>
          <CardBody className="space-y-6">
            <div>
              <label htmlFor="sessionCode" className="block text-sm font-medium text-gray-700 mb-2">
                Session Code
              </label>
              <Input
                id="sessionCode"
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="text-center text-xl font-mono uppercase"
                maxLength={6}
                disabled={isJoining}
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (Optional)
              </label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Anonymous"
                disabled={isJoining}
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be shown to the moderator only
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleJoinSession}
              loading={isJoining}
              className="flex items-center justify-center gap-2"
            >
              {isJoining ? 'Joining...' : 'Join Session'}
              {!isJoining && <ArrowForwardIcon className="w-5 h-5" />}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have a session code?{' '}
                <button
                  onClick={() => navigate('/create')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                  disabled={isJoining}
                >
                  Create a session
                </button>
              </p>
            </div>
          </CardBody>
        </Card>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <UsersIcon className="w-4 h-4" />
            <span>Your identity will remain anonymous to other participants</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinSession;