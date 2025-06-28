import React, { useState, useRef, KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Send, Mic, MicOff, Paperclip, EmojiHappy } from '@/components/icons';
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Attachments button */}
      {allowAttachments && !isRecording && (
        <Tooltip title="Attach file">
          <IconButton
            size="small"
            disabled={disabled || isSubmitting}
            sx={{ mb: 0.5 }}
          >
            <Paperclip size={20} />
          </IconButton>
        </Tooltip>
      )}

      {/* Message input */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <TextField
          ref={inputRef}
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isRecording ? 'Recording...' : placeholder}
          disabled={disabled || isSubmitting || isRecording}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'grey.50',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'grey.100',
              },
              '&.Mui-focused': {
                bgcolor: 'background.paper',
              },
            },
          }}
        />
        
        {/* Character count */}
        {isFocused && !isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: -20,
                right: 0,
                fontSize: '0.75rem',
                color: message.length > maxLength * 0.9 ? 'error.main' : 'text.secondary',
              }}
            >
              {message.length}/{maxLength}
            </Box>
          </motion.div>
        )}
      </Box>

      {/* Emoji picker */}
      {allowEmojis && !isRecording && (
        <Tooltip title="Add emoji">
          <IconButton
            size="small"
            disabled={disabled || isSubmitting}
            sx={{ mb: 0.5 }}
          >
            <EmojiHappy size={20} />
          </IconButton>
        </Tooltip>
      )}

      {/* Voice recording button */}
      {allowVoice && (
        <Tooltip title={isRecording ? 'Stop recording' : 'Start voice recording'}>
          <IconButton
            size="medium"
            onClick={handleVoiceToggle}
            disabled={disabled || isSubmitting}
            sx={{
              mb: 0.5,
              bgcolor: isRecording ? 'error.main' : 'grey.200',
              color: isRecording ? 'white' : 'text.primary',
              '&:hover': {
                bgcolor: isRecording ? 'error.dark' : 'grey.300',
              },
            }}
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
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </motion.div>
          </IconButton>
        </Tooltip>
      )}

      {/* Send button */}
      <Tooltip title="Send message">
        <span>
          <IconButton
            size="medium"
            onClick={handleSend}
            disabled={!canSend}
            sx={{
              mb: 0.5,
              bgcolor: canSend ? 'primary.main' : 'grey.200',
              color: canSend ? 'white' : 'text.disabled',
              '&:hover': {
                bgcolor: canSend ? 'primary.dark' : 'grey.200',
              },
              '&:disabled': {
                bgcolor: 'grey.200',
                color: 'text.disabled',
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Send size={20} />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default MessageInput;