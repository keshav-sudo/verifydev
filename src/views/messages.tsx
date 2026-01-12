"use client"

/**
 * Messages Page
 * Full chat interface for bi-directional messaging
 * Premium split-view design with conversations list and chat thread
 */

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import { getInbox, getSentMessages, getConversation, sendMessage, getUnreadCount } from '@/api/services/message.service'
import { formatMessagePreview, getTimeAgo } from '@/api/services/message.service'

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
} from 'lucide-react'

interface ConversationContact {
    id: string
    name: string
    email?: string
    avatarUrl?: string
    lastMessage?: string
    lastMessageTime?: string
    unreadCount: number
    isOnline?: boolean
}

export default function MessagesPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [selectedUserId, setSelectedUserId] = useState<string | null>(searchParams.get('userId'))
    const [messageText, setMessageText] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch inbox messages to build conversation list
    const { data: inboxData, isLoading: inboxLoading } = useQuery({
        queryKey: ['messages', 'inbox'],
        queryFn: () => getInbox({ limit: 100 }),
        staleTime: 2000,
        refetchInterval: 15000, // Check inbox every 15 sec (Background sync)
    })

    // Fetch sent messages
    const { data: sentData } = useQuery({
        queryKey: ['messages', 'sent'],
        queryFn: () => getSentMessages({ limit: 100 }),
        staleTime: 10 * 1000,
    })

    // Fetch conversation for selected user
    // Smart Polling Strategy:
    // - Active Chat: Poll every 2 seconds for real-time feel
    // - Background/Inactive: Poll less frequently to save server resources
    const { data: conversationData, isLoading: conversationLoading } = useQuery({
        queryKey: ['messages', 'conversation', selectedUserId],
        queryFn: () => getConversation(selectedUserId!),
        enabled: !!selectedUserId,
        refetchInterval: () => {
            // "Smart Polling V2" - Scalable Production Strategy
            // - Active Window: 3.5s (Human reaction time ~2s, so 3.5s feels responsive but cuts load by ~70% vs 1s)
            // - Background/Blur: 15s (Save massive resources when user is alt-tabbed)
            if (document.hasFocus()) return 3500
            return 15000
        },
        staleTime: 0, // Always fetch fresh
        refetchOnWindowFocus: true,
    })

    // Fetch unread count
    useQuery({
        queryKey: ['messages', 'unread-count'],
        queryFn: getUnreadCount,
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000,
    })

    // Send message mutation with optimistic updates
    const sendMutation = useMutation({
        mutationFn: sendMessage,
        onMutate: async (newMessage) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['messages', 'conversation', selectedUserId] })

            // Snapshot previous value
            const previousMessages = queryClient.getQueryData(['messages', 'conversation', selectedUserId])

            // Optimistically add new message
            queryClient.setQueryData(['messages', 'conversation', selectedUserId], (old: any) => {
                const optimisticMessage = {
                    id: `temp-${Date.now()}`,
                    content: newMessage.content,
                    senderId: 'me',
                    receiverId: selectedUserId,
                    sentAt: new Date().toISOString(),
                    isRead: false,
                }
                return {
                    ...old,
                    data: [...(old?.data || []), optimisticMessage]
                }
            })

            return { previousMessages }
        },
        onSuccess: () => {
            setMessageText('')
            queryClient.invalidateQueries({ queryKey: ['messages'] })
        },
        onError: (error: any, _, context) => {
            // Revert on error
            if (context?.previousMessages) {
                queryClient.setQueryData(['messages', 'conversation', selectedUserId], context.previousMessages)
            }
            toast({
                title: 'Failed to send',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'destructive',
            })
        },
    })

    // Build conversation list from inbox and sent messages
    const conversations: ConversationContact[] = (() => {
        const contactsMap = new Map<string, ConversationContact>()

        // Process inbox messages - Check if array (runtime) or object (type definition mismatch)
        // client.ts unwraps .data, so this is likely an array at runtime
        const inboxArray = Array.isArray(inboxData) ? inboxData : (inboxData as any)?.data || []
        inboxArray.forEach((msg: any) => {
            const senderId = msg.senderId
            const msgName = msg.sender?.name || msg.senderName
            if (!contactsMap.has(senderId)) {
                contactsMap.set(senderId, {
                    id: senderId,
                    name: msgName || 'Unknown User',
                    email: msg.sender?.email,
                    avatarUrl: msg.sender?.avatarUrl,
                    lastMessage: msg.content,
                    lastMessageTime: msg.sentAt || msg.createdAt,
                    unreadCount: msg.isRead ? 0 : 1,
                })
            } else {
                const existing = contactsMap.get(senderId)!
                // Update name if current is Unknown User and this message has a real name
                if (existing.name === 'Unknown User' && msgName) {
                    existing.name = msgName
                }
                if (!msg.isRead) existing.unreadCount++
                const msgTime = msg.sentAt || msg.createdAt
                if (new Date(msgTime) > new Date(existing.lastMessageTime || 0)) {
                    existing.lastMessage = msg.content
                    existing.lastMessageTime = msgTime
                }
            }
        })

        // Process sent messages
        const sentArray = Array.isArray(sentData) ? sentData : (sentData as any)?.data || []
        sentArray.forEach((msg: any) => {
            const receiverId = msg.receiverId
            const msgName = msg.receiver?.name || msg.receiverName
            if (!contactsMap.has(receiverId)) {
                contactsMap.set(receiverId, {
                    id: receiverId,
                    name: msgName || 'Unknown User',
                    email: msg.receiver?.email,
                    avatarUrl: msg.receiver?.avatarUrl,
                    lastMessage: msg.content,
                    lastMessageTime: msg.sentAt || msg.createdAt,
                    unreadCount: 0,
                })
            } else {
                const existing = contactsMap.get(receiverId)!
                // Update name if current is Unknown User and this message has a real name
                if (existing.name === 'Unknown User' && msgName) {
                    existing.name = msgName
                }
                const msgTime = msg.sentAt || msg.createdAt
                if (new Date(msgTime) > new Date(existing.lastMessageTime || 0)) {
                    existing.lastMessage = msg.content
                    existing.lastMessageTime = msgTime
                }
            }
        })

        return Array.from(contactsMap.values())
            .sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime())
            .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    })()

    const selectedContact = conversations.find(c => c.id === selectedUserId)
    // Fix messages data access similarly
    const messages = Array.isArray(conversationData) ? conversationData : (conversationData as any)?.data || []

    // Auto-scroll to bottom when new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Update URL when selection changes
    useEffect(() => {
        if (selectedUserId) {
            router.replace(`/messages?userId=${selectedUserId}`, { scroll: false })
            // Mark as read logic is handled by backend or manual action usually, 
            // but we can trigger a read here if needed
        }
    }, [selectedUserId, router])

    // Mark unread messages as read when viewing conversation
    // useEffect(() => {
    //     if (conversationData && Array.isArray(conversationData)) {
    //         conversationData.forEach((msg: any) => {
    //             // Only mark as read if this message is sent TO us (we are the receiver) and it's unread
    //             if (!msg.isRead && msg.receiverId !== selectedUserId) {
    //                 markAsRead(msg.id).then(() => {
    //                     queryClient.invalidateQueries({ queryKey: ['messages'] })
    //                 }).catch(console.error)
    //             }
    //         })
    //     }
    // }, [conversationData, selectedUserId, queryClient])

    const handleSendMessage = () => {
        if (!messageText.trim() || !selectedUserId) return

        sendMutation.mutate({
            receiverId: selectedUserId,
            content: messageText.trim(),
            subject: 'Message', // Default subject
        })
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className="h-full flex flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-7 w-7 text-primary" />
                        Messages
                    </h1>
                    <p className="text-muted-foreground mt-1">Chat with recruiters and candidates</p>
                </div>
            </div>

            {/* Main Chat Container - Fills remaining height */}
            <Card className="flex-1 min-h-0 overflow-hidden border border-border/50 shadow-xl bg-card/60 backdrop-blur-xl relative flex flex-col">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-grid-premium opacity-[0.03] pointer-events-none" />

                <div className="flex flex-1 relative z-10 overflow-hidden">
                    {/* Left Panel - Conversations List */}
                    <div className={`w-full md:w-80 border-r border-border/50 flex flex-col bg-muted/10 ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                        {/* Search */}
                        <div className="p-4 border-b border-border/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                                />
                            </div>
                        </div>

                        {/* Conversations */}
                        <ScrollArea className="flex-1">
                            {inboxLoading ? (
                                <div className="p-4 space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="w-12 h-12 rounded-full" />
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-24 mb-2" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : conversations.length > 0 ? (
                                <div className="p-2">
                                    {conversations.map((contact) => (
                                        <motion.button
                                            key={contact.id}
                                            onClick={() => setSelectedUserId(contact.id)}
                                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedUserId === contact.id
                                                ? 'bg-primary/10 border border-primary/20'
                                                : 'hover:bg-muted/50'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="relative">
                                                <Avatar className="w-12 h-12 ring-2 ring-background">
                                                    <AvatarImage src={contact.avatarUrl} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {contact.name[0]?.toUpperCase() || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {contact.isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-left overflow-hidden">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium truncate">{contact.name}</span>
                                                    {contact.lastMessageTime && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {getTimeAgo(contact.lastMessageTime)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-sm text-muted-foreground truncate">
                                                        {contact.lastMessage ? formatMessagePreview(contact.lastMessage, 30) : 'No messages'}
                                                    </span>
                                                    {contact.unreadCount > 0 && (
                                                        <Badge className="bg-primary text-primary-foreground text-xs h-5 min-w-5 flex items-center justify-center">
                                                            {contact.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                        <Inbox className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground">No conversations yet</p>
                                    <p className="text-sm text-muted-foreground/70 mt-1">
                                        Your messages will appear here
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Right Panel - Chat Thread */}
                    <div className={`flex-1 flex-col ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                        {selectedUserId && selectedContact ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="lg:hidden"
                                            onClick={() => setSelectedUserId(null)}
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </Button>
                                        <Avatar className="w-10 h-10 ring-2 ring-background">
                                            <AvatarImage src={selectedContact.avatarUrl} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {selectedContact.name[0]?.toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => router.push(`/recruiter/candidates/${selectedUserId}`)}
                                        >
                                            <h3 className="font-semibold text-foreground">{selectedContact.name}</h3>
                                            <p className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                                {selectedContact.email || 'Click to view profile'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="hover:text-primary">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Messages - Native Scroll for reliability */}
                                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                    {conversationLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                                        </div>
                                    ) : messages.length > 0 ? (
                                        <div className="space-y-4">
                                            <AnimatePresence>
                                                {messages.map((msg: any, idx: number) => {
                                                    const isSent = msg.senderId !== selectedUserId
                                                    return (
                                                        <motion.div
                                                            key={msg.id || idx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div
                                                                className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${isSent
                                                                    ? 'bg-primary text-primary-foreground border-0'
                                                                    : 'bg-card border border-border'
                                                                    }`}
                                                            >
                                                                {msg.subject && (
                                                                    <p className={`text-sm font-semibold mb-1 ${isSent ? 'text-white/90' : 'text-primary'}`}>
                                                                        {msg.subject}
                                                                    </p>
                                                                )}
                                                                <p className="text-sm whitespace-pre-wrap leading-relaxed"><Linkify>{msg.content}</Linkify></p>
                                                                <div className={`flex items-center justify-end gap-1 mt-2 ${isSent ? 'text-white/70' : 'text-muted-foreground'}`}>
                                                                    <span className="text-[10px]">
                                                                        {msg.sentAt ? getTimeAgo(msg.sentAt) : 'Just now'}
                                                                    </span>
                                                                    {isSent && (
                                                                        msg.isRead ? (
                                                                            <CheckCheck className="w-3 h-3 text-white/90" />
                                                                        ) : (
                                                                            <Check className="w-3 h-3 text-white/70" />
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </AnimatePresence>
                                            <div ref={messagesEndRef} />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                                                <Sparkles className="w-8 h-8 text-primary" />
                                            </div>
                                            <p className="text-lg font-medium text-foreground">Start the conversation</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Send a message to start chatting with {selectedContact.name}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Message Composer */}
                                <div className="p-4 border-t border-border/50 bg-card/30">
                                    <div className="flex items-center gap-3">
                                        <Input
                                            placeholder="Type your message..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={sendMutation.isPending}
                                            className="flex-1 bg-background/50 border-border/50 focus:border-primary/50 shadow-sm"
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!messageText.trim() || sendMutation.isPending}
                                            className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 text-primary-foreground"
                                        >
                                            {sendMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* No conversation selected with matching theme */
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-primary/5">
                                    <MessageSquare className="w-12 h-12 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-foreground">Select a conversation</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    Choose a conversation from the list to view messages and continue chatting
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
