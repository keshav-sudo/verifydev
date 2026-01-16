/**
 * Chat Service - WebSocket Integration
 * Handles real-time chat via Socket.IO
 */

import { io, Socket } from 'socket.io-client';

// Types matching backend
export interface ChatRoom {
  roomId: string;
  // Participants info from backend
  candidateId: string;
  recruiterId: string;
  candidateName?: string;
  recruiterName?: string;
  adminId?: string; // Optional if needed
  
  participants?: Array<{ // Legacy or derived
    userId: string;
    name: string;
    avatarUrl?: string;
    role: 'candidate' | 'recruiter';
  }>;
  jobId?: string;
  lastMessage?: ChatMessage;
  unreadCount?: number; // Backend returns 'unreadCounts' array, controller maps to 'unread'
  unread?: number; // Mapped by controller
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
visitorId: string;
  senderRole: 'developer' | 'recruiter';
  senderName?: string;
  content: string;
  type: 'text' | 'file';
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface ConnectionState {
  connected: boolean;
  userId?: string;
  role?: string;
  socketId?: string;
}

// Socket event types
interface ServerToClientEvents {
  connected: (data: { userId: string; role: string; socketId: string }) => void;
  room_joined: (data: { roomId: string; room: ChatRoom; onlineUsers: string[] }) => void;
  new_message: (data: { message: ChatMessage }) => void;
  user_typing: (data: { userId: string; roomId: string; isTyping: boolean }) => void;
  user_online: (data: { userId: string; roomId: string }) => void;
  user_offline: (data: { userId: string; roomId: string }) => void;
  messages_read: (data: { roomId: string; readBy: string; upToMessageId?: string; count: number }) => void;
  error: (data: { code: string; message: string }) => void;
}

interface ClientToServerEvents {
  join_room: (data: { roomId: string }) => void;
  leave_room: (data: { roomId: string }) => void;
  send_message: (data: { roomId: string; content: string; type?: 'text' | 'file'; metadata?: Record<string, unknown> }) => void;
  typing_start: (data: { roomId: string }) => void;
  typing_stop: (data: { roomId: string }) => void;
  mark_read: (data: { roomId: string; messageId?: string }) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class ChatService {
  private socket: TypedSocket | null = null;
  private connectionState: ConnectionState = { connected: false };
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Get base URL for WebSocket
  private getBaseUrl(): string {
    // In production, use gateway
    // In development, connect directly to chat-service
    // Support both Next.js (NEXT_PUBLIC_*) and Vite (VITE_*) env vars
    const apiUrl = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://api.verifydev.me')
      : 'https://api.verifydev.me';
    
    try {
        const url = new URL(apiUrl);
        return url.origin; // Returns http://localhost:8000 without path
    } catch (e) {
        return apiUrl.replace('/api', '').replace(/\/v1$/, ''); // Fallback
    }
  }

  // Connect to WebSocket server
  connect(token: string): Promise<ConnectionState> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(this.connectionState);
        return;
      }

      const baseUrl = this.getBaseUrl();
      console.log('[ChatService] Connecting to:', baseUrl);

      // Add connection timeout to prevent hanging
      const connectionTimeout = setTimeout(() => {
        console.warn('[ChatService] Connection timeout - chat server may be unavailable');
        this.connectionState = { connected: false };
        resolve(this.connectionState); // Resolve with disconnected state instead of rejecting
      }, 3000); // 3 second timeout for faster fallback

      this.socket = io(baseUrl, {
        auth: { token: `Bearer ${token}` },
        query: { token }, // Redundancy: Backend falls back to query if auth header parsing fails
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      // Connection established
      this.socket.on('connected', (data) => {
        clearTimeout(connectionTimeout);
        console.log('[ChatService] ✅ Connected:', data);
        this.connectionState = { connected: true, ...data };
        this.reconnectAttempts = 0;
        resolve(this.connectionState);
      });

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('[ChatService] ❌ Connection error:', error.message);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          clearTimeout(connectionTimeout);
          console.warn('[ChatService] Max reconnection attempts reached');
          this.connectionState = { connected: false };
          resolve(this.connectionState); // Resolve with disconnected state instead of rejecting
        }
      });

      // Disconnected
      this.socket.on('disconnect', (reason) => {
        console.log('[ChatService] 🔌 Disconnected:', reason);
        this.connectionState = { connected: false };
        this.emit('connection_change', this.connectionState);
      });

      // Reconnected
      this.socket.io.on('reconnect', (attempt) => {
        console.log('[ChatService] 🔄 Reconnected after', attempt, 'attempts');
        this.connectionState.connected = true;
        this.emit('connection_change', this.connectionState);
      });

      // Server errors
      this.socket.on('error', (error) => {
        console.error('[ChatService] Server error:', error);
        this.emit('error', error);
      });

      // Forward all events to listeners
      this.setupEventForwarding();
    });
  }

  // Setup forwarding of socket events to local listeners
  private setupEventForwarding() {
    if (!this.socket) return;

    const events: (keyof ServerToClientEvents)[] = [
      'room_joined',
      'new_message',
      'user_typing',
      'user_online',
      'user_offline',
      'messages_read',
    ];

    events.forEach((event) => {
      this.socket?.on(event, (data: any) => {
        this.emit(event, data);
      });
    });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionState = { connected: false };
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get connection state
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // ==================== ROOM OPERATIONS ====================

  joinRoom(roomId: string) {
    if (!this.socket?.connected) {
      console.warn('[ChatService] Cannot join room - not connected');
      return;
    }
    this.socket.emit('join_room', { roomId });
  }

  leaveRoom(roomId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_room', { roomId });
  }

  // ==================== MESSAGING ====================

  sendMessage(roomId: string, content: string, type: 'text' | 'file' = 'text', metadata?: Record<string, unknown>) {
    if (!this.socket?.connected) {
      console.error('[ChatService] Cannot send message - not connected');
      return false;
    }
    this.socket.emit('send_message', { roomId, content, type, metadata });
    return true;
  }

  markAsRead(roomId: string, messageId?: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('mark_read', { roomId, messageId });
  }

  // ==================== TYPING INDICATORS ====================

  startTyping(roomId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_start', { roomId });
  }

  stopTyping(roomId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_stop', { roomId });
  }

  // ==================== EVENT LISTENER MANAGEMENT ====================

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error('[ChatService] Listener error:', error);
      }
    });
  }
}

// Singleton instance
export const chatService = new ChatService();
