import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button, Input, Loading } from '@components/ui';
import { 
  SendIcon, 
  MicIcon, 
  MicOffIcon, 
  Paperclip, 
  EmojiHappy 
} from '@components/icons';
import { motion } from 'framer-motion';

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isRecording?: boolean;
  isSubmitting?: boolean;
  placeholder?: string;
  maxLength?: number;
  allowVoice?: boolean;
  allowAttachments?: boolean;
  allowEmojis?: boolean;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  isSubmitting = false,
  placeholder = 'Type your message...',
  maxLength = 500,
  allowVoice = true,
  allowAttachments = false,
  allowEmojis = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isSubmitting && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      onStopRecording?.();
    } else {
      onStartRecording?.();
    }
  };

  const canSend = message.trim().length > 0 && !isSubmitting && !disabled;

  return (
    <div className="flex items-end gap-2 p-4 border-t border-gray-200 bg-white">
      {/* Attachments button */}
      {allowAttachments && !isRecording && (
        <button
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
          disabled={disabled || isSubmitting}
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
      )}

      {/* Message input */}
      <div className="flex-1 relative">
        <textarea
          ref={inputRef as any}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isRecording ? 'Recording...' : placeholder}
          disabled={disabled || isSubmitting || isRecording}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl resize-none 
                   focus:bg-white focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20
                   hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                   min-h-[40px] max-h-[120px]"
          rows={1}
        />
        
        {/* Character count */}
        {isFocused && !isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-5 right-0"
          >
            <span className={`text-xs ${
              message.length > maxLength * 0.9 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {message.length}/{maxLength}
            </span>
          </motion.div>
        )}
      </div>

      {/* Emoji picker */}
      {allowEmojis && !isRecording && (
        <button
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
          disabled={disabled || isSubmitting}
          title="Add emoji"
        >
          <EmojiHappy className="w-5 h-5" />
        </button>
      )}

      {/* Voice recording button */}
      {allowVoice && (
        <button
          onClick={handleVoiceToggle}
          disabled={disabled || isSubmitting}
          className={`p-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-0.5 ${
            isRecording 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={isRecording ? 'Stop recording' : 'Start voice recording'}
        >
          <motion.div
            animate={{
              scale: isRecording ? [1, 1.2, 1] : 1,
            }}
            transition={{
              repeat: isRecording ? Infinity : 0,
              duration: 1,
            }}
          >
            {isRecording ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
          </motion.div>
        </button>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        className={`p-2.5 rounded-lg transition-all duration-200 disabled:cursor-not-allowed mb-0.5 ${
          canSend 
            ? 'bg-primary-600 text-white hover:bg-primary-700' 
            : 'bg-gray-200 text-gray-400'
        }`}
        title="Send message"
      >
        {isSubmitting ? (
          <Loading size="sm" className="w-5 h-5" />
        ) : (
          <SendIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default MessageInput;