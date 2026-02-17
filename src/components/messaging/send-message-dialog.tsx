/**
 * Send Message Dialog Component
 * Premium dialog for recruiters to send messages to candidates
 */

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import emoji picker to avoid SSR issues
const Picker = dynamic(
    () => import('@emoji-mart/react').then((mod) => mod.default),
    { ssr: false }
)
import data from '@emoji-mart/data'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { chatApi } from '@/api/services/chat-api.service'
import {
    Send,
    Loader2,
    MessageSquare,
    Smile,
} from 'lucide-react'

interface SendMessageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    candidateId: string
    candidateName: string
    candidateAvatar?: string
    jobId?: string
    jobTitle?: string
    redirectAfterSend?: boolean // NEW: Control whether to redirect to messages page after sending
}

export function SendMessageDialog({
    open,
    onOpenChange,
    candidateId,
    candidateName,
    candidateAvatar,
    jobId,
    jobTitle,
    redirectAfterSend = false, // Default to false - don't redirect unless explicitly requested
}: SendMessageDialogProps) {
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleEmojiSelect = (emoji: any) => {
        const emojiChar = emoji.native || emoji.shortcodes || ''
        if (emojiChar) {
            // Insert emoji at cursor position or at end
            const textarea = textareaRef.current
            if (textarea) {
                const start = textarea.selectionStart
                const end = textarea.selectionEnd
                const newBody = body.substring(0, start) + emojiChar + body.substring(end)
                setBody(newBody)
                // Move cursor after emoji
                setTimeout(() => {
                    textarea.focus()
                    textarea.setSelectionRange(start + emojiChar.length, start + emojiChar.length)
                }, 0)
            } else {
                setBody(body + emojiChar)
            }
        }
    }

    const router = useRouter()

    const handleSend = async () => {
        if (!subject.trim() || !body.trim()) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in both subject and message',
                variant: 'destructive',
            })
            return
        }

        setIsSending(true)
        try {
            await chatApi.sendDirectMessage({
                candidateId,
                content: body.trim(),
                subject: subject.trim(),
                jobId,
            })

            toast({
                title: 'Message sent! 🎉',
                description: `Your message has been sent to ${candidateName}`,
            })

            // Reset form and close
            setSubject('')
            setBody('')
            setShowEmojiPicker(false)
            onOpenChange(false)
            
            // Only redirect if explicitly requested
            // This prevents unwanted navigation when dialog is used for quick messages
            if (redirectAfterSend) {
                // Include userName in URL so messages page can use it
                router.push(`/recruiter/messages?userId=${candidateId}&userName=${encodeURIComponent(candidateName)}`)
            }
        } catch (error: any) {
            toast({
                title: 'Failed to send message',
                description: error?.response?.data?.message || error?.message || 'Please try again',
                variant: 'destructive',
            })
        } finally {
            setIsSending(false)
        }
    }

    const handleClose = () => {
        if (!isSending) {
            setSubject('')
            setBody('')
            setShowEmojiPicker(false)
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
                {/* Header Background */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                <DialogHeader className="p-6 pb-2 relative z-10">
                    <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        Send Message
                    </DialogTitle>
                    <DialogDescription>
                        Start a conversation with this candidate.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 space-y-6 relative z-10 pb-6">
                    {/* Recipient Card */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                        <div className="relative">
                            <Avatar className="w-12 h-12 border-2 border-background ring-2 ring-border/20">
                                <AvatarImage src={candidateAvatar} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {candidateName[0]?.toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{candidateName}</h4>
                            <p className="text-xs text-muted-foreground">Candidate</p>
                        </div>
                        {jobTitle && (
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Position</p>
                                <p className="text-sm font-medium truncate max-w-[150px]">{jobTitle}</p>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="Brief subject..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="bg-background/50"
                                disabled={isSending}
                            />
                        </div>

                        <div className="space-y-2">
                             <div className="flex items-center justify-between">
                                <Label htmlFor="body" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`h-6 w-6 p-0 rounded-full hover:bg-muted ${showEmojiPicker ? 'text-yellow-500 bg-muted' : 'text-muted-foreground'}`}
                                >
                                    <Smile className="w-4 h-4" />
                                </Button>
                            </div>
                            
                             <div className="relative">
                                {showEmojiPicker && (
                                    <div className="absolute z-50 top-0 right-0 shadow-xl rounded-xl overflow-hidden border border-border">
                                        <Picker
                                            data={data}
                                            onEmojiSelect={handleEmojiSelect}
                                            theme="dark" // Ideally this should follow system theme
                                            previewPosition="none"
                                            skinTonePosition="search"
                                            maxFrequentRows={1}
                                            perLine={8}
                                        />
                                    </div>
                                )}
                                <Textarea
                                    ref={textareaRef}
                                    id="body"
                                    placeholder="Type your message..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="min-h-[120px] resize-none bg-background/50 leading-relaxed"
                                    disabled={isSending}
                                />
                            </div>
                            <div className="flex justify-end">
                                <span className={`text-[10px] ${body.length > 1900 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    {body.length}/2000
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 bg-muted/20 border-t border-border/50 gap-3">
                     <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isSending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={isSending || !subject.trim() || !body.trim()}
                        className="gap-2"
                    >
                         {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send Message
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SendMessageDialog

