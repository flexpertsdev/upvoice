import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardBody } from '@components/ui';
import { MicIcon, PeopleIcon, AnalyticsIcon, SecurityIcon, SpeedIcon, CloudIcon, PlayIcon, ArrowForwardIcon } from '@components/icons';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState('');

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      navigate(`/join/${sessionCode.trim()}`);
    }
  };

  const handleCreateSession = () => {
    navigate('/create');
  };

  const handleQuickStart = () => {
    // Store a temporary user ID in local storage
    const tempUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('tempUserId', tempUserId);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="animate-fadeIn">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                Amplify Every Voice
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transform presentations into interactive conversations. Let your audience participate, vote, and engage in real-time.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleQuickStart}
                  className="flex items-center gap-2"
                >
                  <PlayIcon className="w-5 h-5" />
                  Quick Start
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="animate-scaleIn">
              <Card className="shadow-xl">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Join a Session</h3>
                </CardHeader>
                <CardBody>
                  <div className="flex gap-3 mb-4">
                    <Input
                      placeholder="Enter session code"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                      className="flex-1"
                    />
                    <Button
                      variant="primary"
                      onClick={handleJoinSession}
                      disabled={!sessionCode.trim()}
                      className="flex items-center gap-2"
                    >
                      Join
                      <ArrowForwardIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-3">OR</p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCreateSession}
                    >
                      Create New Session
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Modern Engagement
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create interactive sessions that captivate and involve your audience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
                  <CardBody className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fadeIn">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Sessions?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
              Join thousands of presenters who are creating more engaging and interactive experiences
            </p>
            <Button
              variant="primary"
              size="xl"
              onClick={handleQuickStart}
              className="shadow-lg"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;