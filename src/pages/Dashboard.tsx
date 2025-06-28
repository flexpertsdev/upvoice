import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardBody, Badge } from '@components/ui';
import {
  AddIcon,
  GroupIcon,
  ClockIcon,
  MessageIcon,
  MoreVertIcon,
  EditIcon,
  DeleteIcon,
  ShareIcon,
  DownloadIcon,
  BarChartIcon,
  CheckIcon
} from '@components/icons';

interface Session {
  id: string;
  code: string;
  name: string;
  currentTopic: string;
  participantCount: number;
  messageCount: number;
  isActive: boolean;
  createdAt: number;
  duration: number;
  moderatorId: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center mb-3">
          <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600 mr-3`}>
            {icon}
          </div>
          <span className="text-sm text-gray-600">{title}</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </CardBody>
    </Card>
  );
};

interface SessionCardProps {
  session: Session;
  onJoin: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onJoin, onShare, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/join/${session.code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShare();
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardBody>
        <div className="flex justify-between items-start mb-3">
          <Badge variant={session.isActive ? 'success' : 'secondary'}>
            {session.isActive ? 'Active' : 'Ended'}
          </Badge>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertIcon className="w-5 h-5 text-gray-600" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  {copied ? <CheckIcon className="w-4 h-4" /> : <ShareIcon className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <DeleteIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{session.currentTopic}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <GroupIcon className="w-4 h-4" />
            <span>{session.participantCount} participants</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageIcon className="w-4 h-4" />
            <span>{session.messageCount} messages</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{getTimeAgo(session.createdAt)}</span>
          <Button
            variant={session.isActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={onJoin}
          >
            {session.isActive ? 'Join' : 'View Results'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'all'>('active');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalParticipants: 0,
    totalMessages: 0,
    activeSessions: 0
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    // Load sessions from localStorage
    const storedSessions = JSON.parse(localStorage.getItem('sessions') || '{}');
    const sessionList: Session[] = Object.values(storedSessions);

    // Sort by created date, newest first
    sessionList.sort((a, b) => b.createdAt - a.createdAt);

    setSessions(sessionList);

    // Calculate stats
    const activeSessions = sessionList.filter(s => s.isActive);
    const totalParticipants = sessionList.reduce((sum, s) => sum + s.participantCount, 0);
    const totalMessages = sessionList.reduce((sum, s) => sum + (s.messageCount || 0), 0);

    setStats({
      totalSessions: sessionList.length,
      totalParticipants,
      totalMessages,
      activeSessions: activeSessions.length
    });
  };

  const handleDeleteSession = (sessionId: string, sessionCode: string) => {
    if (window.confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      const storedSessions = JSON.parse(localStorage.getItem('sessions') || '{}');
      delete storedSessions[sessionCode];
      localStorage.setItem('sessions', JSON.stringify(storedSessions));
      loadSessions();
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'active') return session.isActive;
    if (activeTab === 'past') return !session.isActive;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your upVoice sessions and view insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Sessions"
            value={stats.totalSessions}
            icon={<BarChartIcon className="w-5 h-5" />}
            color="primary"
          />
          <StatsCard
            title="Total Participants"
            value={stats.totalParticipants}
            icon={<GroupIcon className="w-5 h-5" />}
            color="blue"
          />
          <StatsCard
            title="Messages Received"
            value={stats.totalMessages}
            icon={<MessageIcon className="w-5 h-5" />}
            color="green"
          />
          <StatsCard
            title="Active Now"
            value={stats.activeSessions}
            icon={<ClockIcon className="w-5 h-5" />}
            color="orange"
          />
        </div>

        {/* Sessions Section */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Sessions</h2>
              <Button
                variant="primary"
                onClick={() => navigate('/create')}
                className="flex items-center gap-2"
              >
                <AddIcon className="w-5 h-5" />
                Create Session
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'active'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Active ({sessions.filter(s => s.isActive).length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'past'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Past ({sessions.filter(s => !s.isActive).length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                All Sessions
              </button>
            </div>

            {/* Session Grid */}
            {filteredSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoin={() => {
                      if (session.isActive) {
                        // Store moderator flag and navigate
                        localStorage.setItem('isModerator', 'true');
                        navigate(`/session/${session.code}`);
                      } else {
                        // View results
                        navigate(`/results/${session.code}`);
                      }
                    }}
                    onShare={() => {}}
                    onDelete={() => handleDeleteSession(session.id, session.code)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChartIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'active' ? 'No active sessions' : 
                   activeTab === 'past' ? 'No past sessions' : 
                   'No sessions yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first session to start collecting feedback
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/create')}
                  className="flex items-center gap-2 mx-auto"
                >
                  <AddIcon className="w-5 h-5" />
                  Create Session
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;