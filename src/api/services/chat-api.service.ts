import { get, post } from '../client';
import type { ChatRoom, ChatMessage } from './chat.service';

const BASE_URL = '/v1/chat';

export interface RoomWithDetails extends ChatRoom {
  unread: number;
  otherParticipant?: {
    userId: string;
    role: string;
    name: string;
  };
  otherOnline?: boolean;
}

export const chatApi = {
  /**
   * Get all rooms for current user
   */
  getRooms: async () => {
    return get<RoomWithDetails[]>(`${BASE_URL}/rooms`);
  },

  /**
   * Get specific room details
   */
  getRoom: async (roomId: string) => {
    return get<RoomWithDetails>(`${BASE_URL}/rooms/${roomId}`);
  },

  /**
   * Create or get existing room
   */
  createRoom: async (data: {
    candidateId?: string;
    recruiterId?: string;
    jobId?: string;
    candidateName?: string;
    recruiterName?: string;
  }) => {
    return post<ChatRoom>(`${BASE_URL}/rooms`, data);
  },

  /**
   * Get message history for a room
   */
  getMessages: async (roomId: string, params?: { limit?: number; before?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.before) searchParams.append('before', params.before);
    
    return get<{
        messages: ChatMessage[];
        unreadCount: number;
        hasMore: boolean;
        nextCursor: string | null;
    }>(`${BASE_URL}/rooms/${roomId}/messages?${searchParams.toString()}`);
  },

  /**
   * Mark messages as read
   */
  markRead: async (roomId: string, messageId?: string) => {
    return post(`${BASE_URL}/rooms/${roomId}/read`, { messageId });
  },

  /**
   * Send a direct message (creates room if needed)
   */
  sendDirectMessage: async (data: {
    candidateId?: string;
    recruiterId?: string;
    content: string;
    subject?: string;
    jobId?: string;
  }) => {
    return post<any>(`${BASE_URL}/direct`, data);
  }
};
