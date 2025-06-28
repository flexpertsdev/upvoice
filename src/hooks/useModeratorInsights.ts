import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { useMessages } from './useMessages';
import { useParticipants } from './useParticipants';
import type { ModeratorInsight, SessionMetrics } from '../types/moderation.types';

interface UseModeratorInsightsOptions {
  sessionId?: string;
  refreshInterval?: number;
}

interface UseModeratorInsightsReturn {
  insights: ModeratorInsight[];
  metrics: SessionMetrics;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useModeratorInsights = ({
  sessionId,
  refreshInterval = 30000 // 30 seconds
}: UseModeratorInsightsOptions = {}): UseModeratorInsightsReturn => {
  const [insights, setInsights] = useState<ModeratorInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCalculation, setLastCalculation] = useState(Date.now());

  const { messages } = useMessages({ sessionId, limit: 100 });
  const { participants } = useParticipants({ sessionId });

  // Calculate metrics from current data
  const metrics = useMemo<SessionMetrics>(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Active participants (activity within last 2 minutes)
    const activeParticipants = participants.filter(p => 
      p.status === 'active' && p.lastActivity && (now - p.lastActivity) < 120000
    ).length;

    // Messages per minute (last 5 minutes)
    const recentMessages = messages.filter(m => m.timestamp > fiveMinutesAgo);
    const messagesPerMinute = recentMessages.length / 5;

    // Votes per minute (estimated from participant data)
    const totalVotes = participants.reduce((sum, p) => sum + (p.votes?.length || 0), 0);
    const votesPerMinute = totalVotes / 5; // Rough estimate

    // Average engagement (active participants / total)
    const averageEngagement = participants.length > 0 
      ? activeParticipants / participants.length 
      : 0;

    // Topic completion (would need session data)
    const topicCompletionRate = 0.5; // Placeholder

    return {
      totalParticipants: participants.length,
      activeParticipants,
      totalMessages: messages.length,
      messagesPerMinute,
      totalVotes,
      votesPerMinute,
      averageEngagement,
      topicCompletionRate
    };
  }, [messages, participants]);

  // Generate insights based on metrics and patterns
  const generateInsights = useCallback(() => {
    const newInsights: ModeratorInsight[] = [];
    const now = Date.now();

    // Engagement insight
    if (metrics.averageEngagement < 0.5) {
      newInsights.push({
        id: `engagement-${now}`,
        type: 'engagement',
        title: 'Low Engagement Alert',
        description: 'Less than 50% of participants are actively engaged',
        value: metrics.averageEngagement,
        trend: 'down',
        timestamp: now,
        priority: 'high'
      });
    }

    // Activity insight
    if (metrics.messagesPerMinute < 2) {
      newInsights.push({
        id: `activity-${now}`,
        type: 'activity',
        title: 'Low Message Activity',
        description: 'Message rate has dropped below 2 per minute',
        value: metrics.messagesPerMinute,
        trend: 'down',
        timestamp: now,
        priority: 'medium'
      });
    }

    // Sentiment insight (based on viral messages)
    const viralMessages = messages.filter(m => 
      m.propagationHistory && m.propagationHistory.length > 3
    );
    if (viralMessages.length > 0) {
      const avgSentiment = viralMessages.reduce((sum, m) => {
        const avgVote = m.propagationHistory?.reduce((s, e) => s + e.voteValue, 0) || 0;
        return sum + avgVote / (m.propagationHistory?.length || 1);
      }, 0) / viralMessages.length;

      newInsights.push({
        id: `sentiment-${now}`,
        type: 'sentiment',
        title: 'Viral Message Sentiment',
        description: avgSentiment > 0.6 ? 'Positive sentiment trending' : 'Mixed sentiment detected',
        value: avgSentiment,
        trend: avgSentiment > 0.6 ? 'up' : 'stable',
        timestamp: now,
        priority: 'low'
      });
    }

    // Alert for inactive participants
    const inactiveCount = participants.filter(p => 
      p.status === 'active' && p.lastActivity && (now - p.lastActivity) > 300000
    ).length;
    if (inactiveCount > participants.length * 0.2) {
      newInsights.push({
        id: `alert-inactive-${now}`,
        type: 'alert',
        title: 'High Inactivity',
        description: `${inactiveCount} participants haven't been active for over 5 minutes`,
        value: inactiveCount,
        timestamp: now,
        priority: 'high'
      });
    }

    // Success indicators
    if (metrics.messagesPerMinute > 5 && metrics.averageEngagement > 0.7) {
      newInsights.push({
        id: `success-${now}`,
        type: 'engagement',
        title: 'High Engagement',
        description: 'Session is highly active with strong participation',
        value: metrics.averageEngagement,
        trend: 'up',
        timestamp: now,
        priority: 'low'
      });
    }

    return newInsights;
  }, [metrics, messages, participants]);

  // Set up real-time insights subscription
  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Generate initial insights
    const initialInsights = generateInsights();
    setInsights(initialInsights);
    setIsLoading(false);

    // Set up periodic insight generation
    const interval = setInterval(() => {
      const newInsights = generateInsights();
      setInsights(prev => {
        // Keep only the most recent 20 insights
        const combined = [...newInsights, ...prev];
        return combined.slice(0, 20);
      });
      setLastCalculation(Date.now());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [sessionId, generateInsights, refreshInterval]);

  // Manual refresh
  const refresh = useCallback(() => {
    const newInsights = generateInsights();
    setInsights(newInsights);
    setLastCalculation(Date.now());
  }, [generateInsights]);

  return {
    insights,
    metrics,
    isLoading,
    error,
    refresh
  };
};