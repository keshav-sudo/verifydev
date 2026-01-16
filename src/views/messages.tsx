"use client"

/**
 * Messages Page - WebSocket Chat
 * Real-time bi-directional messaging via Socket.IO
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import { useChat } from '@/hooks/useChat'
import { chatApi, type RoomWithDetails } from '@/api/services/chat-api.service'
import { useAuthStore } from '@/store/auth-store'
import { useRecruiterStore } from '@/store/recruiter-store'
import { getPublicRecruiterProfile } from '@/api/services/recruiter.service'

// Dynamically import emoji picker to avoid SSR issues
const Picker = dynamic(
    () => import('@emoji-mart/react'),
    { ssr: false }
)
import data from '@emoji-mart/data'

// Linkify utility - converts URLs to clickable links
const urlRegex = /(https?:\/\/[^\s]+)/g
const meetRegex = /(meet\.google\.com|zoom\.us|teams\.microsoft\.com)/i

function Linkify({ children }: { children: string }) {
    if (!children) return null
    const parts = children.split(urlRegex)

    return (
        <>
            {parts.map((part, index) => {
                if (urlRegex.test(part)) {
                    const isMeetLink = meetRegex.test(part)
                    return (
                        <a
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 underline hover:no-underline transition-all ${isMeetLink
                                ? 'text-primary hover:text-primary/80 font-medium'
                                : 'text-primary/70 hover:text-primary'
                                }`}
                        >
                            {isMeetLink && '🔗 '}
                            {part.length > 50 ? part.substring(0, 50) + '...' : part}
                        </a>
                    )
                }
                return part
            })}
        </>
    )
}

import {
    MessageSquare,
    Send,
    Loader2,
    Inbox,
    ArrowLeft,
    Check,
    CheckCheck,
    Search,
    MoreVertical,
    Sparkles,
    Wifi,
    WifiOff,
    Smile,
} from 'lucide-react'

// Extended interface for UI display
interface ConversationContact {
    roomId: string
    userId: string
    name: string
    avatarUrl?: string
    lastMessage?: string
    lastMessageTime?: string
    unreadCount: number
    isOnline?: boolean
    role: string
}

export default function MessagesPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    
    // Auth context
    const { user: candidateUser } = useAuthStore()
    const { recruiter: recruiterUser } = useRecruiterStore()
    const isRecruiter = !!recruiterUser
    const currentUserId = isRecruiter ? recruiterUser?.id : candidateUser?.id
    const currentUserName = isRecruiter ? recruiterUser?.name : candidateUser?.name

    // URL State
    const targetUserId = searchParams.get('userId')
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

    const [messageText, setMessageText] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    
    // WebSocket Chat Hook
    const {
        isConnected,
        messages: wsMessages,
        joinRoom,
        leaveRoom,
        sendMessage: wsSendMessage,
        markAsRead,
        startTyping,
        stopTyping,
        typingUsers,
        onlineUsers,
        error: wsError,
    } = useChat({ autoConnect: true })

    // 1. Fetch Rooms (Sidebar)
    const { data: rooms = [], isLoading: roomsLoading, refetch: refetchRooms, error: roomsError } = useQuery({
        queryKey: ['chat', 'rooms'],
        queryFn: async () => {
            try {
                return await chatApi.getRooms()
            } catch (error: any) {
                // Don't throw on auth errors - let the interceptor handle it
                // Just return empty array to prevent UI breaking
                if (error?.response?.status === 401) {
                    console.log('[Messages] Auth error fetching rooms, will retry after token refresh')
                }
                return []
            }
        },
        refetchInterval: 10000,
        retry: 2, // Retry twice before giving up
        retryDelay: 1000, // Wait 1 second between retries
        enabled: !!currentUserId, // Only fetch if user is logged in
    })

    // 2. Derive Conversations from Rooms
    const conversations: ConversationContact[] = useMemo(() => {
        if (!currentUserId) return []
        // rooms is verified as array by default value above
        const roomArray = Array.isArray(rooms) ? rooms : []
        
        return roomArray.map(room => {
            // Find "other" participant - the person we're chatting WITH
            let otherUser;
            let displayName = 'Unknown User'; // Better default than "Recruiter" or "Candidate"
            
            // Backend helper might return it, or we parse participants
            if (room.otherParticipant) {
                otherUser = room.otherParticipant;
                displayName = otherUser.name || displayName;
            } else {
                // Fallback parsing: determine other participant based on current user role
                // If I'm a recruiter, show the candidate's info
                // If I'm a candidate, show the recruiter's info
                if (isRecruiter) {
                    otherUser = {
                        userId: room.candidateId,
                        name: room.candidateName,
                        role: 'candidate'
                    };
                    // Priority: candidateName from room > fallback
                    displayName = room.candidateName || displayName;
                } else {
                    otherUser = {
                        userId: room.recruiterId,
                        name: room.recruiterName,
                        role: 'recruiter'
                    };
                    // Priority: recruiterName from room > fallback
                    displayName = room.recruiterName || displayName;
                }
            }

           return {
               roomId: room.roomId,
               userId: otherUser?.userId || '',
               name: displayName,
               avatarUrl: undefined, 
               lastMessage: room.lastMessage?.content,
               lastMessageTime: room.lastMessage?.createdAt || room.updatedAt,
               unreadCount: room.unread || 0,
               isOnline: otherUser?.userId ? onlineUsers.has(otherUser.userId) : false,
               role: otherUser?.role || 'user'
           }
        })
        .sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime())
        .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [rooms, currentUserId, onlineUsers, searchQuery, isRecruiter])

    // Track target user details for room creation
    const [targetUserDetails, setTargetUserDetails] = useState<{name: string, role: string} | null>(null);

    // Fetch target user details when targetUserId changes
    useEffect(() => {
        if (targetUserId && !targetUserDetails) {
            // For new conversations, we'll use the userName from URL params if available
            // Otherwise, we'll show "Chat" temporarily until the room is created with proper names
            const nameFromUrl = searchParams.get('userName');
            setTargetUserDetails({ 
                name: nameFromUrl || 'Chat',
                role: isRecruiter ? 'candidate' : 'recruiter'
            });
        } else if (!targetUserId) {
            setTargetUserDetails(null);
        }
    }, [targetUserId, isRecruiter, searchParams]);

    // 3. Handle Target User (URL) -> Find or Create Room
    // Track if we've already attempted creation for this targetUserId
    const attemptedCreationRef = useRef<string | null>(null);

    const createRoomMutation = useMutation({
        mutationFn: chatApi.createRoom,
        onSuccess: (newRoom) => {
            // newRoom is the ChatRoom object directly
            if (newRoom && newRoom.roomId) {
                setSelectedRoomId(newRoom.roomId);
                refetchRooms(); // Refresh list to show new room
                
                // Clear the attempt tracker
                attemptedCreationRef.current = null;
            }
        },
        onError: (err: any) => {
            // Reset attempt tracker on error so user can retry
            attemptedCreationRef.current = null;
            
            // Don't show error for auth issues - they're handled by interceptor
            if (err?.response?.status !== 401 && err?.response?.status !== 403) {
                toast({
                    title: 'Error starting chat',
                    description: 'Could not create or access chat room.',
                    variant: 'destructive',
                })
            }
        },
        retry: 2,
        retryDelay: 1000,
    })

    useEffect(() => {
        // If we have a targetUserId from URL, try to find an existing room
        if (targetUserId && !selectedRoomId && !roomsLoading) {
            // Check if we already have a room with this user
            const existingRoom = conversations.find(c => c.userId === targetUserId);
            if (existingRoom) {
                setSelectedRoomId(existingRoom.roomId);
                return; // Found existing room, no need to create
            }
            
            // No existing room found in list - need to CREATE/GET one from backend
            // Only try once per targetUserId to avoid infinite loops
            if (attemptedCreationRef.current !== targetUserId && 
                !createRoomMutation.isPending && 
                !createRoomMutation.isSuccess) {
                
                // Mark that we're attempting creation for this user
                attemptedCreationRef.current = targetUserId;
                
                console.log('[Messages] Creating room for target:', targetUserId);
                const payload: any = {};
                if (isRecruiter) {
                    payload.candidateId = targetUserId;
                    // Use userName from URL params, or targetUserDetails, or fallback
                    payload.candidateName = searchParams.get('userName') || targetUserDetails?.name || 'User';
                    payload.recruiterId = currentUserId;
                    payload.recruiterName = currentUserName || recruiterUser?.companyName || 'Recruiter';
                } else {
                    payload.recruiterId = targetUserId;
                    // Use userName from URL params, or targetUserDetails, or fallback
                    payload.recruiterName = searchParams.get('userName') || targetUserDetails?.name || 'Recruiter';
                    payload.candidateId = currentUserId;
                    payload.candidateName = currentUserName || candidateUser?.username || 'User';
                }
                createRoomMutation.mutate(payload);
            }
        }
        
        // Reset attempt tracker when targetUserId changes
        if (!targetUserId) {
            attemptedCreationRef.current = null;
        }
    }, [targetUserId, selectedRoomId, roomsLoading, conversations, isRecruiter, currentUserId, currentUserName, targetUserDetails, searchParams]);

    // 4. Join Room when ID selected
    useEffect(() => {
        if (selectedRoomId && isConnected) {
            joinRoom(selectedRoomId)
        }
        return () => {
             if (selectedRoomId) leaveRoom()
        }
    }, [selectedRoomId, isConnected, joinRoom, leaveRoom])



    // 5. Fetch Message History
    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ['chat', 'history', selectedRoomId],
        queryFn: async () => {
            try {
                return await chatApi.getMessages(selectedRoomId!, { limit: 50 })
            } catch (error: any) {
                // Return empty data structure on error
                if (error?.response?.status === 401) {
                    console.log('[Messages] Auth error fetching history, will retry')
                }
                return { messages: [], unreadCount: 0, hasMore: false, nextCursor: null }
            }
        },
        enabled: !!selectedRoomId,
        refetchOnWindowFocus: false,
        retry: 2,
        retryDelay: 1000,
    })

    const historicalMessages = historyData?.messages || []

    // Merge History + Realtime
    const messages = useMemo(() => {
        const all = [...historicalMessages, ...wsMessages]
        // Deduplicate
        const unique = new Map()
        all.forEach(m => unique.set(m.id || m.createdAt, m)) // using ID or timestamp as fallback
        return Array.from(unique.values()).sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    }, [historicalMessages, wsMessages])

    // 4.5. Mark messages as read when viewing a room
    useEffect(() => {
        // Use the combined messages array which is now safely defined
        if (selectedRoomId && messages.length > 0 && isConnected) {
            // Mark all messages as read after a short delay (user has viewed them)
            const timer = setTimeout(() => {
                markAsRead();
                // Also refetch rooms to update unread count in sidebar
                refetchRooms();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [selectedRoomId, messages.length, isConnected, markAsRead, refetchRooms]);

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
        }
    }, [messages.length])



    // Handlers
    const handleSendMessage = () => {
        const text = messageText.trim()
        if (!text || !selectedRoomId) return

        if (isConnected) {
            const sent = wsSendMessage(text)
            if (sent) {
                setMessageText('')
                stopTyping()
            } else {
                 toast({ title: "Failed to send", description: "Connection issue" })
            }
        } else {
            // TODO: Add REST fallback if strictly needed, but user requested WS priority.
            toast({ title: "Offline", description: "Waiting for connection..." })
        }
    }

    const handleEmojiSelect = (emoji: any) => {
        const emojiChar = emoji.native || emoji.shortcodes || ''
        if (emojiChar) {
            setMessageText(prev => prev + emojiChar)
            inputRef.current?.focus()
        }
    }

    // Determine current contact view
    const selectedContact = conversations.find(c => c.roomId === selectedRoomId) || 
                           (targetUserId ? { name: 'Chat', userId: targetUserId, isOnline: false } : null);

    // 6. Fetch Recruiter Profile (for Organization display)
    // Needs to be after selectedContact is defined
    const { data: recruiterProfile } = useQuery({
        queryKey: ['recruiter', 'public', (selectedContact as any)?.userId],
        queryFn: async () => {
             const res = await getPublicRecruiterProfile((selectedContact as any).userId);
             return res;
        },
        enabled: !!selectedContact && !isRecruiter && !!(selectedContact as any)?.userId && (selectedContact as any)?.role === 'recruiter',
        staleTime: 1000 * 60 * 5,
        retry: 1
    });

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageText(e.target.value)
        if (e.target.value.trim()) startTyping()
        else stopTyping()
    }

    return (
        <div className="max-h-full h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                         <div className="p-2 bg-primary/10 rounded-xl ring-1 ring-primary/20">
                            <MessageSquare className="h-6 w-6 text-primary" />
                         </div>
                        Messages
                        <Badge variant={isConnected ? 'default' : 'secondary'} className="ml-2 text-xs font-mono tracking-wide">
                            {isConnected ? (
                                <><Wifi className="h-3 w-3 mr-1.5" /> LIVE</>
                            ) : (
                                <><WifiOff className="h-3 w-3 mr-1.5" /> CONNECTING</>
                            )}
                        </Badge>
                    </h1>
                </div>
            </div>

            {/* Main Chat Container */}
            <Card className="flex-1 min-h-0 overflow-hidden border border-border/50 shadow-2xl bg-card/40 backdrop-blur-xl relative flex flex-col rounded-2xl">
                 {/* Decorative background gradients */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

                <div className="flex flex-1 relative z-10 overflow-hidden">
                    {/* Left Panel - Conversations List */}
                    <div className={`w-full md:w-80 border-r border-border/50 flex flex-col bg-muted/10 ${selectedRoomId ? 'hidden md:flex' : 'flex'}`}>
                        {/* Search */}
                        <div className="p-4 border-b border-border/50">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                                />
                            </div>
                        </div>

                        {/* Conversations */}
                        <ScrollArea className="flex-1">
                            {roomsLoading ? (
                                <div className="p-4 space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 opacity-50">
                                            <Skeleton className="w-12 h-12 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : conversations.length > 0 ? (
                                <div className="p-3 space-y-1">
                                    {conversations.map((contact) => (
                                        <motion.button
                                            key={contact.roomId}
                                            onClick={() => {
                                                setSelectedRoomId(contact.roomId)
                                                // Only replace URL if we have user ID
                                                // Use correct path based on user type
                                                if(contact.userId) {
                                                    const basePath = isRecruiter ? '/recruiter/messages' : '/messages'
                                                    router.replace(`${basePath}?userId=${contact.userId}`)
                                                }
                                            }}
                                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 border border-transparent ${selectedRoomId === contact.roomId
                                                ? 'bg-primary/10 border-primary/20 shadow-sm'
                                                : 'hover:bg-muted/50 hover:border-border/30'
                                                }`}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="relative">
                                                <Avatar className="w-12 h-12 ring-2 ring-background shadow-sm">
                                                    <AvatarImage src={contact.avatarUrl} className="object-cover" />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold">
                                                        {contact.name[0]?.toUpperCase() || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {contact.isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background ring-1 ring-green-500/30" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-left overflow-hidden">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`font-semibold truncate text-sm ${selectedRoomId === contact.roomId ? 'text-primary' : 'text-foreground'}`}>
                                                        {contact.name}
                                                    </span>
                                                    {contact.lastMessageTime && (
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            {new Date(contact.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs truncate max-w-[140px] ${contact.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                        {contact.lastMessage || 'No messages'}
                                                    </span>
                                                    {contact.unreadCount > 0 && (
                                                        <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-lg shadow-primary/20">
                                                            {contact.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                                    <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                                        <Inbox className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium">No conversations yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Start chatting with candidates or recruiters</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Right Panel - Chat Thread */}
                    <div className={`flex-1 flex-col bg-background/30 ${!selectedRoomId && !targetUserId ? 'hidden md:flex' : 'flex'}`}>
                        {(selectedRoomId && selectedContact) || targetUserId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 py-3 border-b border-white/5 flex items-center justify-between bg-background/40 backdrop-blur-md sticky top-0 z-20">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="md:hidden -ml-2 hover:bg-white/5"
                                            onClick={() => setSelectedRoomId(null)}
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </Button>
                                        
                                        <div className="relative">
                                            <Avatar className="w-10 h-10 ring-2 ring-background/50 cursor-pointer transition-transform hover:scale-105" onClick={() => (selectedContact as any)?.userId && router.push(isRecruiter ? `/recruiter/candidates/${(selectedContact as any).userId}` : '#')}>
                                                <AvatarImage src={(selectedContact as any)?.avatarUrl} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                                    {selectedContact?.name?.[0]?.toUpperCase() || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            {selectedContact && (selectedContact as any).isOnline && (
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                                            )}
                                        </div>
                                        
                                        <div className="cursor-pointer group" onClick={() => (selectedContact as any)?.userId && router.push(isRecruiter ? `/recruiter/candidates/${(selectedContact as any).userId}` : '#')}>
                                            <div className="flex flex-col">
                                                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                                                    {selectedContact?.name || 'Chat'}
                                                    <ArrowLeft className="w-3 h-3 rotate-180 opacity-0 group-hover:opacity-50 transition-opacity" />
                                                </h3>
                                                {recruiterProfile?.organization && (
                                                    <span 
                                                        className="text-xs text-muted-foreground font-normal hover:text-primary cursor-pointer hover:underline -mt-0.5"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/organizations/${recruiterProfile.organization.id}`);
                                                        }}
                                                    >
                                                        from {recruiterProfile.organization.name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                {typingUsers.size > 0 ? (
                                                    <span className="text-primary font-medium flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                                                        <span className="w-1 h-1 rounded-full bg-primary animate-bounce delay-75" />
                                                        <span className="w-1 h-1 rounded-full bg-primary animate-bounce delay-150" />
                                                        typing
                                                    </span>
                                                ) : (selectedContact as any)?.isOnline ? (
                                                    <span className="text-green-500 font-medium">Online</span>
                                                ) : (
                                                    'Offline'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <Button variant="ghost" size="icon" className="hover:bg-white/5 rounded-full">
                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-6">
                                    {(historyLoading && messages.length === 0) ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                                        </div>
                                    ) : messages.length > 0 ? (
                                        <div className="space-y-1 pb-4">
                                            {messages.map((msg: any, idx: number) => {
                                                const isSent = msg.senderId === currentUserId
                                                const prevMsg = messages[idx - 1]
                                                const nextMsg = messages[idx + 1]
                                                
                                                // Grouping logic for styles
                                                const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId || (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 60000 * 5)
                                                const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || (new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime() > 60000 * 5)
                                                
                                                const bubbleRadius = isSent
                                                    ? `rounded-2xl ${isLastInGroup ? 'rounded-br-sm' : ''} ${!isFirstInGroup ? 'rounded-tr-sm' : ''}`
                                                    : `rounded-2xl ${isLastInGroup ? 'rounded-bl-sm' : ''} ${!isFirstInGroup ? 'rounded-tl-sm' : ''}`

                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        key={msg.id || idx}
                                                        className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}
                                                    >
                                                        {!isSent && (
                                                            <div className={`mr-2 flex-shrink-0 flex items-end w-8 ${!isLastInGroup ? 'invisible' : ''}`}>
                                                                <Avatar className="w-8 h-8 ring-1 ring-border/50 shadow-sm">
                                                                    <AvatarImage src={(selectedContact as any)?.avatarUrl} />
                                                                    <AvatarFallback className="bg-muted text-[10px]">
                                                                        {selectedContact?.name?.[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                        )}

                                                        <div
                                                            className={`max-w-[85%] md:max-w-[70%] px-4 py-2.5 shadow-sm transition-all relative group ${bubbleRadius} ${isSent
                                                                ? 'bg-primary text-primary-foreground shadow-primary/10'
                                                                : 'bg-white/10 backdrop-blur-md text-foreground border border-white/5'
                                                                }`}
                                                        >
                                                            <div className="text-sm leading-relaxed whitespace-pre-wrap"><Linkify>{msg.content}</Linkify></div>
                                                            <div className={`flex items-center justify-end gap-1 mt-1 opacity-50 text-[10px] select-none ${isSent ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                                                                <span>
                                                                   {new Date(msg.createdAt).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                                                                </span>
                                                                {isSent && (
                                                                    <CheckCheck className="w-3 h-3" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
                                                <Sparkles className="w-10 h-10 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">Start conversation</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                Say hello to <Badge variant="outline" className="text-xs bg-muted/50">{selectedContact?.name}</Badge>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Message Composer */}
                                <div className="p-4 border-t border-white/5 bg-background/50 backdrop-blur-md">
                                    <div className="flex items-end gap-2 relative bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className={`h-9 w-9 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-yellow-400 transition-colors ${showEmojiPicker ? 'bg-white/10 text-yellow-400' : ''}`}
                                        >
                                            <Smile className="w-5 h-5" />
                                        </Button>
                                        
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-xl overflow-hidden border border-border">
                                                <Picker
                                                    data={data}
                                                    onEmojiSelect={handleEmojiSelect}
                                                    theme="dark"
                                                    previewPosition="none"
                                                    skinTonePosition="search"
                                                />
                                            </div>
                                        )}
                                        
                                        <Input
                                            ref={inputRef}
                                            placeholder="Type a message..."
                                            value={messageText}
                                            onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                            disabled={!isConnected}
                                            className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2 py-2.5 h-auto min-h-[40px] max-h-[120px] resize-none"
                                        />
                                        
                                        <Button
                                            onClick={() => {
                                                handleSendMessage()
                                                setShowEmojiPicker(false)
                                            }}
                                            disabled={!messageText.trim() || !isConnected}
                                            size="icon"
                                            className={`h-9 w-9 rounded-xl transition-all duration-300 ${!messageText.trim() ? 'opacity-50 grayscale' : 'shadow-lg shadow-primary/25'}`}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="text-[10px] text-center mt-2 text-muted-foreground/50">
                                        Press Enter to send, Shift + Enter for new line
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin-slow" />
                                    <MessageSquare className="w-10 h-10 text-muted-foreground/70" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Welcome to Messages</h3>
                                <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                                    Select a conversation from the list or start a new chat to connect instantly.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
