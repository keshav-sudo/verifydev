/**
 * Bulk Message Dialog Component
 * Send message to multiple candidates at once
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { sendBulkMessage } from '@/api/services/message.service'
import {
    Send,
    Loader2,
    Users,
    MessageSquare,
    CheckCircle,
    X,
} from 'lucide-react'

interface Candidate {
    id: string
    name: string
    avatarUrl?: string
    email?: string
}

interface BulkMessageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    candidates: Candidate[]
    jobId?: string
    jobTitle?: string
    senderName?: string
}

export function BulkMessageDialog({
    open,
    onOpenChange,
    candidates,
    jobId,
    jobTitle,
    senderName,
}: BulkMessageDialogProps) {
    const queryClient = useQueryClient()
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const [progress, setProgress] = useState(0)

    const bulkMutation = useMutation({
        mutationFn: sendBulkMessage,
        onSuccess: (data) => {
            toast({
                title: `Messages sent! 🎉`,
                description: `Successfully sent to ${data.data.sentCount} candidates`,
            })
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            setSubject('')
            setContent('')
            setProgress(0)
            onOpenChange(false)
        },
        onError: (error: any) => {
            toast({
                title: 'Failed to send messages',
                description: error?.response?.data?.message || 'Please try again',
                variant: 'destructive',
            })
            setProgress(0)
        },
    })

    const handleSend = async () => {
        if (!content.trim() || candidates.length === 0) return

        setProgress(10) // Start progress

        bulkMutation.mutate({
            receiverIds: candidates.map(c => c.id),
            subject: subject.trim() || undefined,
            content: content.trim(),
            senderName,
            jobId,
        })
    }

    const handleClose = () => {
        if (!bulkMutation.isPending) {
            setSubject('')
            setContent('')
            setProgress(0)
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] bg-card border-border">
                {/* Gradient header */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        Send Bulk Message
                    </DialogTitle>
                    <DialogDescription>
                        Send a message to {candidates.length} selected candidate{candidates.length !== 1 ? 's' : ''}
                    </DialogDescription>
                </DialogHeader>

                {/* Recipients preview */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border mb-4">
                    <div className="flex -space-x-2">
                        {candidates.slice(0, 5).map((candidate) => (
                            <Avatar key={candidate.id} className="w-8 h-8 border-2 border-card">
                                <AvatarImage src={candidate.avatarUrl} />
                                <AvatarFallback className="bg-primary/10 text-xs">
                                    {candidate.name[0]?.toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">
                            {candidates.slice(0, 3).map(c => c.name).join(', ')}
                            {candidates.length > 3 && ` +${candidates.length - 3} more`}
                        </p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {candidates.length} recipients
                    </Badge>
                </div>

                {jobTitle && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MessageSquare className="w-4 h-4" />
                        Regarding: <span className="font-medium text-primary">{jobTitle}</span>
                    </div>
                )}

                {/* Message form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bulk-subject">Subject (Optional)</Label>
                        <Input
                            id="bulk-subject"
                            placeholder="e.g., Interview invitation..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="bg-background border-border"
                            disabled={bulkMutation.isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bulk-content">Message</Label>
                        <Textarea
                            id="bulk-content"
                            placeholder="Write your message here... You can include links like meet.google.com"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[120px] bg-background border-border resize-none"
                            disabled={bulkMutation.isPending}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {content.length}/2000 characters
                        </p>
                    </div>
                </div>

                {/* Progress indicator */}
                {bulkMutation.isPending && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Sending messages...</span>
                            <span className="font-medium text-primary">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}

                <DialogFooter className="gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={bulkMutation.isPending}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={bulkMutation.isPending || !content.trim() || candidates.length === 0}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {bulkMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send to {candidates.length}
                                <CheckCircle className="w-3 h-3 ml-2 opacity-75" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default BulkMessageDialog
