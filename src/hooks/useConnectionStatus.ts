import { useState, useEffect, useCallback } from 'react';
import { db } from '@config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface ConnectionStatus {
  isOnline: boolean;
  connectionStrength: 'excellent' | 'good' | 'weak' | 'offline';
  latency: number;
  lastConnected: Date | null;
  isReconnecting: boolean;
}

export const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    connectionStrength: 'good',
    latency: 0,
    lastConnected: new Date(),
    isReconnecting: false,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  // Measure latency to Firestore
  const measureLatency = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      // Use Firestore's server timestamp as a ping
      const testDoc = doc(db, '.info', 'serverTimeOffset');
      await new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(
          testDoc,
          () => {
            unsubscribe();
            resolve(true);
          },
          reject
        );
        
        // Timeout after 5 seconds
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Timeout'));
        }, 5000);
      });
      
      const latency = Date.now() - startTime;
      
      // Determine connection strength based on latency
      let strength: ConnectionStatus['connectionStrength'];
      if (latency < 100) strength = 'excellent';
      else if (latency < 300) strength = 'good';
      else strength = 'weak';
      
      setStatus(prev => ({
        ...prev,
        latency,
        connectionStrength: strength,
        isOnline: true,
        lastConnected: new Date(),
        isReconnecting: false,
      }));
      
      setRetryCount(0);
    } catch (error) {
      console.error('Latency measurement failed:', error);
      
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        connectionStrength: 'offline',
        latency: -1,
      }));
    }
  }, []);

  // Reconnect logic
  const reconnect = useCallback(async () => {
    if (retryCount >= maxRetries) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setStatus(prev => ({ ...prev, isReconnecting: true }));
    setRetryCount(prev => prev + 1);

    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    
    setTimeout(async () => {
      try {
        await measureLatency();
      } catch (error) {
        console.error('Reconnection failed:', error);
        if (retryCount < maxRetries - 1) {
          reconnect();
        } else {
          setStatus(prev => ({ ...prev, isReconnecting: false }));
        }
      }
    }, delay);
  }, [retryCount, measureLatency]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Connection restored');
      setStatus(prev => ({ ...prev, isOnline: true }));
      measureLatency();
    };

    const handleOffline = () => {
      console.log('Connection lost');
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        connectionStrength: 'offline',
        latency: -1,
      }));
      reconnect();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial latency check
    measureLatency();

    // Periodic latency checks
    const interval = setInterval(measureLatency, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [measureLatency, reconnect]);

  // Monitor Firebase connection
  useEffect(() => {
    const connectedRef = doc(db, '.info', 'connected');
    
    const unsubscribe = onSnapshot(connectedRef, (snapshot) => {
      const isConnected = snapshot.data()?.connected || false;
      
      if (isConnected && !status.isOnline) {
        console.log('Firebase connection restored');
        setStatus(prev => ({ ...prev, isOnline: true }));
        measureLatency();
      } else if (!isConnected && status.isOnline) {
        console.log('Firebase connection lost');
        setStatus(prev => ({
          ...prev,
          isOnline: false,
          connectionStrength: 'offline',
        }));
        reconnect();
      }
    });

    return () => unsubscribe();
  }, [status.isOnline, measureLatency, reconnect]);

  return {
    ...status,
    reconnect,
    isConnected: status.isOnline && status.connectionStrength !== 'offline',
  };
};

// Hook for network quality monitoring
export const useNetworkQuality = () => {
  const [networkInfo, setNetworkInfo] = useState({
    type: 'unknown',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
  });

  useEffect(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) return;

    const updateNetworkInfo = () => {
      setNetworkInfo({
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 50,
        saveData: connection.saveData || false,
      });
    };

    updateNetworkInfo();
    connection.addEventListener('change', updateNetworkInfo);

    return () => {
      connection.removeEventListener('change', updateNetworkInfo);
    };
  }, []);

  return networkInfo;
};

// Hook for auto-retry failed operations
export const useAutoRetry = <T extends (...args: any[]) => Promise<any>>(
  operation: T,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: Error, attempt: number) => void;
  } = {}
) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const executeWithRetry = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        setRetryAttempt(attempt);
        
        const result = await operation(...args);
        
        setIsRetrying(false);
        setRetryAttempt(0);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        onError?.(lastError, attempt);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    setIsRetrying(false);
    throw lastError;
  }, [operation, maxRetries, retryDelay, onError]);

  return {
    execute: executeWithRetry as T,
    isRetrying,
    retryAttempt,
  };
};