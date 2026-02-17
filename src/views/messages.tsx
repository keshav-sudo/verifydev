"use client"

import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useChat } from '@/hooks/useChat'
import { chatApi, type RoomWithDetails } from '@/api/services/chat-api.service'
import type { ChatMessage, ChatRoom } from '@/api/services/chat.service'
import { useAuthStore } from '@/store/auth-store'
import { useRecruiterStore } from '@/store/recruiter-store'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { format, isToday, isYesterday } from 'date-fns'
import {
  MessageCircle,
  Search,
  Send,
  Loader2,
  ArrowLeft,
  Check,
  CheckCheck,
  Inbox,
} from 'lucide-react'

function formatLastSeen(d: string) {
  const date = new Date(d)
  if (isToday(date)) return format(date, 'h:mm a')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d')
}

function isGoogleMeetLink(text: string) { return /meet\.google\.com\/[a-z-]+/i.test(text) }

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 break-all">{isGoogleMeetLink(part) ? '🎥 Join Google Meet' : part}</a>
      : part
  )
}

function ConversationSkeleton() {
  return (
    <div className="p-4 border-b border-slate-100 animate-pulse flex gap-3">
      <div className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 bg-slate-100 rounded-sm" />
        <div className="h-3 w-48 bg-slate-100 rounded-sm" />
      </div>
    </div>
  )
}

export default function Messages() {
  const searchParams = useSearchParams()
  const targetUserId = searchParams.get('userId')
  const targetJobId = searchParams.get('jobId')

  const { user } = useAuthStore()
  const { recruiter } = useRecruiterStore()
  const currentUserId = user?.id || recruiter?.id
  const currentRole = recruiter?.id ? 'recruiter' : 'developer'

  // Chat hook
  const {
    isConnected,
    messages: wsMessages,
    isLoading: wsLoading,
    joinRoom,
    leaveRoom,
    sendMessage,
    markAsRead,
    typingUsers,
    startTyping,
    stopTyping,
    onlineUsers,
  } = useChat()

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobile, setShowMobile] = useState<'list' | 'chat'>('list')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  // Fetch rooms
  const { data: rooms = [], isLoading: roomsLoading, refetch: refetchRooms } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: chatApi.getRooms,
    refetchInterval: 15000,
  })

  // Fetch messages for selected room (REST fallback)
  const { data: restMessages } = useQuery({
    queryKey: ['chat-messages', selectedRoomId],
    queryFn: () => selectedRoomId ? chatApi.getMessages(selectedRoomId, { limit: 50 }) : null,
    enabled: !!selectedRoomId,
  })

  const allMessages: ChatMessage[] = useMemo(() => {
    const ws = wsMessages || []
    const rest = (restMessages as any)?.messages || []
    const map = new Map<string, ChatMessage>()
    rest.forEach((m: ChatMessage) => map.set(m.id, m))
    ws.forEach((m: ChatMessage) => map.set(m.id, m))
    return Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [wsMessages, restMessages])

  // Auto-create room if target user
  const createRoomMutation = useMutation({
    mutationFn: (data: Parameters<typeof chatApi.createRoom>[0]) => chatApi.createRoom(data),
    onSuccess: (room: ChatRoom) => {
      setSelectedRoomId(room.roomId)
      joinRoom(room.roomId)
      setShowMobile('chat')
      refetchRooms()
    },
    onError: () => toast({ variant: 'destructive', title: 'Failed to start conversation' }),
  })

  useEffect(() => {
    if (targetUserId && currentUserId && rooms !== undefined) {
      const existing = (rooms as RoomWithDetails[]).find(r =>
        r.candidateId === targetUserId || r.recruiterId === targetUserId
      )
      if (existing) {
        setSelectedRoomId(existing.roomId)
        joinRoom(existing.roomId)
        setShowMobile('chat')
      } else {
        const data: any = { jobId: targetJobId || undefined }
        if (currentRole === 'recruiter') {
          data.candidateId = targetUserId
          data.recruiterId = currentUserId
          data.recruiterName = recruiter?.companyName || recruiter?.name || 'Recruiter'
        } else {
          data.recruiterId = targetUserId
          data.candidateId = currentUserId
          data.candidateName = user?.name || 'Developer'
        }
        createRoomMutation.mutate(data)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, currentUserId, rooms])

  // Select room
  const handleSelectRoom = (roomId: string) => {
    if (selectedRoomId) leaveRoom()
    setSelectedRoomId(roomId)
    joinRoom(roomId)
    setShowMobile('chat')
    markAsRead()
  }

  // Send message
  const handleSend = () => {
    if (!message.trim() || !selectedRoomId) return
    const sent = sendMessage(message.trim())
    if (sent) {
      setMessage('')
      stopTyping()
    } else {
      toast({ variant: 'destructive', title: 'Failed to send message' })
    }
  }

  // Typing handler
  const handleTyping = () => {
    startTyping()
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(stopTyping, 2000)
  }

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms as RoomWithDetails[]
    const q = searchQuery.toLowerCase()
    return (rooms as RoomWithDetails[]).filter(r =>
      r.candidateName?.toLowerCase().includes(q) ||
      r.recruiterName?.toLowerCase().includes(q) ||
      r.otherParticipant?.name?.toLowerCase().includes(q) ||
      r.lastMessage?.content?.toLowerCase().includes(q)
    )
  }, [rooms, searchQuery])

  // Get other participant info
  const getOtherName = (room: RoomWithDetails) => {
    if (room.otherParticipant?.name) return room.otherParticipant.name
    if (currentUserId === room.candidateId) return room.recruiterName || 'Recruiter'
    return room.candidateName || 'Developer'
  }

  const selectedRoom = useMemo(() => (rooms as RoomWithDetails[]).find(r => r.roomId === selectedRoomId), [rooms, selectedRoomId])

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#F0F2F5] p-4 md:p-6 lg:p-8 font-['Plus_Jakarta_Sans'] text-slate-800 overflow-hidden">
      <div className="max-w-[1536px] mx-auto h-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">

          {/* DARK HEADER */}
          <div className="bg-[#0A0A0A] p-4 lg:p-6 relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ADFF2F]/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-[4px] bg-white/10 border border-white/5 text-[#ADFF2F] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <MessageCircle className="w-3 h-3" /> Messages
                </div>
                <h1 className="text-lg lg:text-xl font-black text-white tracking-tight hidden sm:block">Conversations</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-[#ADFF2F]" : "bg-red-500")} />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{isConnected ? "Connected" : "Offline"}</span>
              </div>
            </div>
          </div>

          {/* MAIN BODY */}
          <div className="flex flex-1 overflow-hidden">

            {/* SIDEBAR — Conversation List */}
            <div className={cn("w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col", showMobile === 'chat' ? 'hidden md:flex' : 'flex')}>
              {/* Search */}
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-slate-50 border-slate-200 rounded-lg text-xs font-medium" />
                </div>
              </div>

              {/* Room List */}
              <div className="flex-1 overflow-y-auto">
                {roomsLoading && [...Array(5)].map((_, i) => <ConversationSkeleton key={i} />)}
                {!roomsLoading && filteredRooms.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                      <Inbox className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No conversations yet</p>
                  </div>
                )}
                {filteredRooms.map((room) => {
                  const isActive = room.roomId === selectedRoomId
                  const isOnline = room.otherParticipant ? onlineUsers.has(room.otherParticipant.userId) : false
                  const name = getOtherName(room)
                  const unread = room.unread || room.unreadCount || 0

                  return (
                    <button
                      key={room.roomId}
                      onClick={() => handleSelectRoom(room.roomId)}
                      className={cn(
                        "w-full p-3 flex gap-3 items-start text-left transition-all border-b border-slate-50 hover:bg-slate-50",
                        isActive && "bg-slate-50 border-l-2 border-l-[#ADFF2F]"
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10 border border-slate-200">
                          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">{name?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#ADFF2F] border-2 border-white rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("text-xs font-extrabold truncate", unread > 0 ? "text-slate-900" : "text-slate-700")}>{name}</span>
                          {room.lastMessage && (
                            <span className="text-[9px] font-bold text-slate-400 flex-shrink-0">{formatLastSeen(room.lastMessage.createdAt)}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className={cn("text-[11px] truncate", unread > 0 ? "font-bold text-slate-700" : "font-medium text-slate-400")}>
                            {room.lastMessage?.content || 'Start a conversation...'}
                          </p>
                          {unread > 0 && (
                            <span className="min-w-[18px] h-[18px] rounded-full bg-[#ADFF2F] text-black text-[9px] font-extrabold flex items-center justify-center flex-shrink-0">{unread}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* CHAT AREA */}
            <div className={cn("flex-1 flex flex-col", showMobile === 'list' ? 'hidden md:flex' : 'flex')}>
              {!selectedRoomId ? (
                /* No room selected */
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-1">Select a Conversation</h3>
                  <p className="text-xs font-medium text-slate-400">Pick a conversation from the sidebar to start chatting</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-white flex-shrink-0">
                    <button onClick={() => { setShowMobile('list'); leaveRoom(); setSelectedRoomId(null) }} className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                      <ArrowLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <Avatar className="h-9 w-9 border border-slate-200">
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                        {selectedRoom ? getOtherName(selectedRoom)?.charAt(0)?.toUpperCase() : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-extrabold text-slate-900 truncate">
                        {selectedRoom ? getOtherName(selectedRoom) : 'Chat'}
                      </h3>
                      {typingUsers.size > 0 ? (
                        <p className="text-[10px] font-bold text-[#ADFF2F] animate-pulse">typing...</p>
                      ) : (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {selectedRoom && (selectedRoom.otherParticipant ? (onlineUsers.has(selectedRoom.otherParticipant.userId) ? 'Online' : 'Offline') : 'Connected')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-50/30">
                    {allMessages.length === 0 && !wsLoading && (
                      <div className="text-center py-12">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No messages yet. Say hello! 👋</p>
                      </div>
                    )}
                    {wsLoading && (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                      </div>
                    )}

                    {allMessages.map((msg, i) => {
                      const isMine = msg.visitorId === currentUserId || msg.senderRole === currentRole
                      const showDate = i === 0 || new Date(msg.createdAt).toDateString() !== new Date(allMessages[i-1].createdAt).toDateString()
                      const prevSameSender = i > 0 && allMessages[i-1].visitorId === msg.visitorId

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {isToday(new Date(msg.createdAt)) ? 'Today' : isYesterday(new Date(msg.createdAt)) ? 'Yesterday' : format(new Date(msg.createdAt), 'EEEE, MMM d')}
                              </span>
                            </div>
                          )}
                          <div className={cn("flex", isMine ? "justify-end" : "justify-start", !prevSameSender ? "mt-3" : "mt-0.5")}>
                            <div className={cn("max-w-[75%] lg:max-w-[60%]", isMine ? "items-end" : "items-start")}>
                              <div className={cn(
                                "px-3.5 py-2 text-[13px] font-medium leading-relaxed",
                                isMine
                                  ? "bg-[#0A0A0A] text-white rounded-2xl rounded-br-md"
                                  : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md",
                                prevSameSender && isMine && "rounded-tr-2xl",
                                prevSameSender && !isMine && "rounded-tl-2xl",
                              )}>
                                {linkify(msg.content)}
                              </div>
                              <div className={cn("flex items-center gap-1 mt-0.5 px-1", isMine ? "justify-end" : "justify-start")}>
                                <span className="text-[9px] font-medium text-slate-400">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                                {isMine && (
                                  msg.isRead
                                    ? <CheckCheck className="w-3 h-3 text-[#ADFF2F]" />
                                    : <Check className="w-3 h-3 text-slate-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          ref={inputRef}
                          value={message}
                          onChange={(e) => { setMessage(e.target.value); handleTyping() }}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                          placeholder="Type a message..."
                          className="h-10 bg-slate-50 border-slate-200 rounded-lg text-sm font-medium pr-10"
                        />
                      </div>
                      <Button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className={cn(
                          "h-10 w-10 rounded-lg p-0 transition-all flex-shrink-0",
                          message.trim()
                            ? "bg-[#0A0A0A] hover:bg-slate-800 text-[#ADFF2F]"
                            : "bg-slate-100 text-slate-400"
                        )}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
