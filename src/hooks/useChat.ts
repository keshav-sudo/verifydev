/**
 * useChat Hook - WebSocket Chat Integration
 * Provides real-time chat functionality with automatic connection management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, type ChatMessage, type ChatRoom, type ConnectionState } from '@/api/services/chat.service';
import { useAuthStore } from '@/store/auth-store';
import { useRecruiterStore } from '@/store/recruiter-store';

interface UseChatOptions {
  autoConnect?: boolean;
}

interface UseChatReturn {
  // Connection
  isConnected: boolean;
  connectionState: ConnectionState;
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Current room
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  isLoading: boolean;
  
  // Actions
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  sendMessage: (content: string) => boolean;
  markAsRead: (messageId?: string) => void;
  
  // Typing
  typingUsers: Set<string>;
  startTyping: () => void;
  stopTyping: () => void;
  
  // Online users
  onlineUsers: Set<string>;
  
  // Errors
  error: string | null;
}

export function useChat(options: UseChatOptions = { autoConnect: true }): UseChatReturn {
  const { accessToken: userToken, isAuthenticated: isUserAuth } = useAuthStore();
  const { accessToken: recruiterToken, isAuthenticated: isRecruiterAuth } = useRecruiterStore();
  
  const isAuthenticated = isUserAuth || isRecruiterAuth;
  const getToken = useCallback(() => userToken || recruiterToken, [userToken, recruiterToken]);
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>({ connected: false });
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const currentRoomId = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('[useChat] Not authenticated, skipping connect');
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        // Don't set error, just log it - will fall back to REST
        console.log('[useChat] No auth token available, using REST fallback');
        return;
      }

      setIsLoading(true);
      const state = await chatService.connect(token);
      setConnectionState(state);
      setIsConnected(state.connected);
      
      // Only log if not connected, don't set error state
      if (!state.connected) {
        console.log('[useChat] Chat not connected, REST fallback will be used');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('[useChat] Connection failed:', err);
      // Don't set error for connection failures - REST fallback is available
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getToken]);

  // Disconnect
  const disconnect = useCallback(() => {
    chatService.disconnect();
    setIsConnected(false);
    setConnectionState({ connected: false });
    setCurrentRoom(null);
    setMessages([]);
  }, []);

  // Join a chat room
  const joinRoom = useCallback((roomId: string) => {
    if (currentRoomId.current) {
      chatService.leaveRoom(currentRoomId.current);
    }
    
    currentRoomId.current = roomId;
    setIsLoading(true);
    setMessages([]);
    chatService.joinRoom(roomId);
  }, []);

  // Leave current room
  const leaveRoom = useCallback(() => {
    if (currentRoomId.current) {
      chatService.leaveRoom(currentRoomId.current);
      currentRoomId.current = null;
      setCurrentRoom(null);
      setMessages([]);
      setTypingUsers(new Set());
      setOnlineUsers(new Set());
    }
  }, []);

  // Send message
  const sendMessage = useCallback((content: string): boolean => {
    if (!currentRoomId.current || !content.trim()) {
      return false;
    }
    return chatService.sendMessage(currentRoomId.current, content.trim());
  }, []);

  // Mark messages as read
  const markAsRead = useCallback((messageId?: string) => {
    if (currentRoomId.current) {
      chatService.markAsRead(currentRoomId.current, messageId);
    }
  }, []);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (currentRoomId.current) {
      chatService.startTyping(currentRoomId.current);
      
      // Auto-stop after 3 seconds of no typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        if (currentRoomId.current) {
          chatService.stopTyping(currentRoomId.current);
        }
      }, 3000);
    }
  }, []);

  const stopTyping = useCallback(() => {
    if (currentRoomId.current) {
      chatService.stopTyping(currentRoomId.current);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Room joined
    const unsubJoin = chatService.on('room_joined', (data: { roomId: string; room: ChatRoom; onlineUsers: string[] }) => {
      console.log('[useChat] Room joined:', data.roomId);
      setCurrentRoom(data.room);
      setOnlineUsers(new Set(data.onlineUsers));
      setIsLoading(false);
      
      // Fetch room messages via REST (for history)
      // This will be replaced by proper message history fetching
    });

    // New message
    const unsubMessage = chatService.on('new_message', (data: { message: ChatMessage }) => {
      console.log('[useChat] New message:', data.message.id);
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === data.message.id)) {
          return prev;
        }
        return [...prev, data.message];
      });
    });

    // Typing indicators
    const unsubTyping = chatService.on('user_typing', (data: { userId: string; roomId: string; isTyping: boolean }) => {
      if (data.roomId !== currentRoomId.current) return;
      
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    // User online/offline
    const unsubOnline = chatService.on('user_online', (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    });

    const unsubOffline = chatService.on('user_offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Connection state changes
    const unsubConnection = chatService.on('connection_change', (state: ConnectionState) => {
      setConnectionState(state);
      setIsConnected(state.connected);
    });

    // Errors
    const unsubError = chatService.on('error', (err: { code: string; message: string }) => {
      setError(err.message);
    });

    return () => {
      unsubJoin();
      unsubMessage();
      unsubTyping();
      unsubOnline();
      unsubOffline();
      unsubConnection();
      unsubError();
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (options.autoConnect && isAuthenticated && !isConnected) {
      connect();
    }

    return () => {
      // Cleanup on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [options.autoConnect, isAuthenticated, isConnected, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentRoomId.current) {
        chatService.leaveRoom(currentRoomId.current);
      }
    };
  }, []);

  return {
    // Connection
    isConnected,
    connectionState,
    connect,
    disconnect,
    
    // Room
    currentRoom,
    messages,
    isLoading,
    
    // Actions
    joinRoom,
    leaveRoom,
    sendMessage,
    markAsRead,
    
    // Typing
    typingUsers,
    startTyping,
    stopTyping,
    
    // Online
    onlineUsers,
    
    // Errors
    error,
  };
}
