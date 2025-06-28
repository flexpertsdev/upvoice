import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, VotingSlider, Loading } from '@components/ui';
import { 
  ArrowForwardIcon, 
  SendIcon, 
  ThumbsUpIcon, 
  ThumbsDownIcon,
  UsersIcon,
  ClockIcon,
  MessageIcon
} from '@components/icons';

interface Message {
  id: string;
  content: string;
  timestamp: number;
  votes: number;
  userVote?: number;
  isVoting?: boolean;
}

interface Session {
  id: string;
  name: string;
  currentTopic: string;
  participantCount: number;
  isActive: boolean;
  timeRemaining?: number;
}

const ActiveSession: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Load session data
  useEffect(() => {
    loadSession();
    loadMockMessages();
  }, [sessionId]);

  const loadSession = () => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '{}');
    const sessionData = sessions[sessionId?.toUpperCase() || ''];
    
    if (sessionData) {
      setSession({
        ...sessionData,
        participantCount: Math.floor(Math.random() * 50) + 10,
        timeRemaining: 300 // 5 minutes
      });
      setIsLoading(false);
    } else {
      // Session not found, redirect to join
      navigate('/join');
    }
  };

  const loadMockMessages = () => {
    // Create some mock messages for demo
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'I believe we should focus on improving team communication through regular stand-ups and clear documentation.',
        timestamp: Date.now() - 300000,
        votes: 12,
        userVote: 0.8
      },
      {
        id: '2',
        content: 'The current process is too slow. We need to automate repetitive tasks to increase efficiency.',
        timestamp: Date.now() - 240000,
        votes: 8,
        userVote: undefined
      },
      {
        id: '3',
        content: 'Employee well-being should be our top priority. Happy employees are more productive.',
        timestamp: Date.now() - 180000,
        votes: 15,
        userVote: -0.5
      },
      {
        id: '4',
        content: 'We should invest more in training and development programs for our team members.',
        timestamp: Date.now() - 120000,
        votes: 6,
        userVote: undefined
      },
      {
        id: '5',
        content: 'Remote work has shown us that flexibility can lead to better results. We should make it permanent.',
        timestamp: Date.now() - 60000,
        votes: 20,
        userVote: 1.0
      }
    ];
    setMessages(mockMessages);
  };

  const handleVote = (value: number) => {
    if (!messages[currentMessageIndex]) return;

    // Update message with vote
    const updatedMessages = [...messages];
    updatedMessages[currentMessageIndex] = {
      ...updatedMessages[currentMessageIndex],
      userVote: value,
      isVoting: true
    };
    setMessages(updatedMessages);

    // Simulate vote submission
    setTimeout(() => {
      updatedMessages[currentMessageIndex].isVoting = false;
      updatedMessages[currentMessageIndex].votes += 1;
      setMessages([...updatedMessages]);
      
      // Move to next message after voting
      if (currentMessageIndex < messages.length - 1) {
        setCurrentMessageIndex(currentMessageIndex + 1);
      }
    }, 500);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    
    // Add new message
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      content: newMessage.trim(),
      timestamp: Date.now(),
      votes: 0,
      userVote: undefined
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };

  const handleSkipMessage = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading session..." />;
  }

  if (!session) {
    return null;
  }

  const currentMessage = messages[currentMessageIndex];
  const hasMoreMessages = currentMessageIndex < messages.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{session.name}</h1>
              <p className="text-sm text-gray-600">{session.currentTopic}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UsersIcon className="w-4 h-4" />
                <span>{session.participantCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClockIcon className="w-4 h-4" />
                <span>5:00</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                Leave
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Message Voting Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Vote on Messages ({currentMessageIndex + 1}/{messages.length})
            </h2>
            
            {currentMessage ? (
              <Card className="mb-4">
                <CardBody>
                  <p className="text-gray-900 mb-4">{currentMessage.content}</p>
                  
                  {currentMessage.userVote !== undefined ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Your vote:</span>
                        <span className={`font-medium ${
                          currentMessage.userVote > 0 ? 'text-green-600' : 
                          currentMessage.userVote < 0 ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {currentMessage.userVote > 0 ? 'Agree' : 
                           currentMessage.userVote < 0 ? 'Disagree' : 
                           'Neutral'} ({Math.abs(currentMessage.userVote * 100).toFixed(0)}%)
                        </span>
                      </div>
                      
                      {hasMoreMessages && (
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={handleSkipMessage}
                          className="flex items-center justify-center gap-2"
                        >
                          Next Message
                          <ArrowForwardIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <VotingSlider
                        value={0}
                        onChange={handleVote}
                        disabled={currentMessage.isVoting}
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <ThumbsDownIcon className="w-4 h-4" />
                          Disagree
                        </span>
                        <span>Neutral</span>
                        <span className="flex items-center gap-1">
                          Agree
                          <ThumbsUpIcon className="w-4 h-4" />
                        </span>
                      </div>
                      {hasMoreMessages && (
                        <Button
                          variant="ghost"
                          fullWidth
                          onClick={handleSkipMessage}
                          size="sm"
                        >
                          Skip this message
                        </Button>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{currentMessage.votes} votes</span>
                      <span>{new Date(currentMessage.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardBody className="text-center py-8">
                  <MessageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No more messages to vote on</p>
                  <p className="text-sm text-gray-500 mt-1">Check back later or share your own thoughts</p>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Message Input Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Share Your Thoughts</h2>
            
            <Card>
              <CardBody>
                <textarea
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  maxLength={280}
                  disabled={isSending}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-600">
                    {newMessage.length}/280
                  </span>
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    loading={isSending}
                    className="flex items-center gap-2"
                  >
                    Send
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Recent Messages */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Messages</h3>
              <div className="space-y-2">
                {messages.slice(-3).reverse().map((msg) => (
                  <div key={msg.id} className="bg-white p-3 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-900">{msg.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{msg.votes} votes</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSession;