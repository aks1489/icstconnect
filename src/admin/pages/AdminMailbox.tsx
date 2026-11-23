import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
    IconMail,
    IconSend,
    IconInbox,
    IconStar,
    IconStarFilled,
    IconTrash,
    IconRefresh,
    IconSearch,
    IconArrowBackUp,
    IconPaperclip,
    IconX,
    IconClock,
    IconCheck,
    IconCopy,
    IconPencil,
    IconAlertTriangle,
    IconMailOpened,
    IconKeyboard,
    IconEye,
    IconEyeOff,
    IconShieldCheck
} from '@tabler/icons-react'
import { animate, stagger } from 'animejs'
import {
    fetchMailbox,
    syncMailbox,
    sendMailboxMessage,
    updateMailAction,
    batchMailAction,
    subscribeToMailboxChanges,
    type MailboxMessage
} from '../../services/mailboxService'
import { useToast } from '../../contexts/ToastContext'
import SEOHead from '../../components/common/SEOHead'

// Curated Institutional Tonal Avatar Palette
const getAvatarStyle = (str: string = '') => {
    const styles = [
        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return styles[Math.abs(hash) % styles.length]
}

// Clean date formatting
const formatEmailTime = (isoString?: string) => {
    if (!isoString) return ''
    try {
        const date = new Date(isoString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } else if (diffDays === 1) {
            return 'Yesterday'
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' })
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
        }
    } catch {
        return ''
    }
}

// Adapts raw email HTML so text is always crystal-clear and high-contrast in both light and dark themes
const formatEmailBodyForDisplay = (html: string = '') => {
    if (!html) return ''
    return html
        // Normalize dark inline text colors to inherit theme text color (bright in dark mode, crisp in light mode)
        .replace(/color\s*:\s*(#1e293b|#0f172a|#000000|#000|black|#111827|#1f2937|#1a202c|#2d3748|#374151|#334155|#475569|rgb\(\s*30\s*,\s*41\s*,\s*59\s*\)|rgb\(\s*15\s*,\s*23\s*,\s*42\s*\)|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))/gi, 'color: inherit')
        // Normalize muted slate / gray colors to inherit with slight opacity
        .replace(/color\s*:\s*(#64748b|#6b7280|#666|#555|rgb\(\s*100\s*,\s*116\s*,\s*139\s*\))/gi, 'color: inherit; opacity: 0.85')
        // Normalize border dividers to subtle currentColor
        .replace(/border-top\s*:\s*1px\s*solid\s*(#e2e8f0|#e5e7eb|#cbd5e1)/gi, 'border-top: 1px solid currentColor; opacity: 0.2')
        .replace(/border-bottom\s*:\s*1px\s*solid\s*(#e2e8f0|#e5e7eb|#cbd5e1)/gi, 'border-bottom: 1px solid currentColor; opacity: 0.2')
        // Strip hardcoded pure white backgrounds that clash in dark mode
        .replace(/background(-color)?\s*:\s*(#ffffff|#fff|white)/gi, 'background$1: transparent')
}

// Quick reply templates
const REPLY_TEMPLATES = [
    {
        label: 'Acknowledge',
        text: 'Thank you for contacting ICST Chowberia. We have received your message and our office will follow up shortly.'
    },
    {
        label: 'Admissions Open',
        text: 'Admissions are currently open for DCA, ADCA, TallyPrime, Web Development, and Python programming. Campus counseling is open Monday to Saturday, 9:00 AM - 6:00 PM.'
    },
    {
        label: 'Campus Counseling',
        text: 'You are welcome to visit our Chowberia campus for in-person counseling. Please bring your educational certificates and photo ID.'
    },
    {
        label: 'Fee Receipt Verified',
        text: 'Your payment confirmation and official computerized fee receipt have been verified by the administration desk.'
    }
]

export default function AdminMailbox() {
    const { showToast } = useToast()

    // Mailbox state
    const [folder, setFolder] = useState<'inbox' | 'sent' | 'starred' | 'trash'>('inbox')
    const [messages, setMessages] = useState<MailboxMessage[]>([])
    const [selectedMessage, setSelectedMessage] = useState<MailboxMessage | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [lastSyncText, setLastSyncText] = useState('Just now')
    const [unreadCount, setUnreadCount] = useState(0)
    const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)
    const [copiedEmail, setCopiedEmail] = useState(false)

    // Multi-Select Batch State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Quick Reply State
    const [isReplying, setIsReplying] = useState(false)
    const [replyBody, setReplyBody] = useState('')
    const [isSendingReply, setIsSendingReply] = useState(false)

    // Compose Modal State
    const [isComposeOpen, setIsComposeOpen] = useState(false)
    const [composeTo, setComposeTo] = useState('')
    const [composeSubject, setComposeSubject] = useState('')
    const [composeBody, setComposeBody] = useState('')
    const [isSendingCompose, setIsSendingCompose] = useState(false)

    // Shortcuts Modal State
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

    // Confirmation Modal State (Anime.js animated)
    const [confirmDialog, setConfirmDialog] = useState<{
        title: string
        message: string
        confirmLabel?: string
        confirmColor?: 'red' | 'blue'
        onConfirm: () => void
    } | null>(null)

    // DOM Refs for Anime.js
    const listContainerRef = useRef<HTMLDivElement>(null)
    const readerRef = useRef<HTMLDivElement>(null)
    const replyBoxRef = useRef<HTMLFormElement>(null)
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null)
    const modalBackdropRef = useRef<HTMLDivElement>(null)
    const modalContentRef = useRef<HTMLDivElement>(null)
    const confirmBackdropRef = useRef<HTMLDivElement>(null)
    const confirmCardRef = useRef<HTMLDivElement>(null)
    const shortcutsBackdropRef = useRef<HTMLDivElement>(null)
    const shortcutsContentRef = useRef<HTMLDivElement>(null)
    const syncButtonRef = useRef<HTMLButtonElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const batchBarRef = useRef<HTMLDivElement>(null)

    // =========================================================================
    // 1. LOAD MESSAGES
    // =========================================================================
    const loadMessages = useCallback(async (targetFolder = folder, search = searchQuery, silent = false) => {
        if (!silent) setLoading(true)
        try {
            const res = await fetchMailbox(targetFolder, search)
            if (res.success) {
                setMessages(res.messages || [])
                setUnreadCount(res.unreadCount || 0)
                if (selectedMessage) {
                    const updated = (res.messages || []).find(m => m.message_id === selectedMessage.message_id)
                    if (updated) setSelectedMessage(updated)
                }
            } else if (!silent) {
                showToast(res.error || 'Failed to load messages', 'error')
            }
        } catch {
            if (!silent) showToast('Unable to connect to mailbox service', 'error')
        } finally {
            if (!silent) setLoading(false)
        }
    }, [folder, searchQuery, selectedMessage, showToast])

    useEffect(() => {
        setSelectedIds(new Set())
        setSelectedMessage(null)
        loadMessages(folder, searchQuery)
    }, [folder])

    // =========================================================================
    // 2. REAL-TIME SUBSCRIPTION
    // =========================================================================
    useEffect(() => {
        syncMailbox()
            .then(res => {
                if (res.success) {
                    setLastSyncText('Just now')
                    loadMessages(folder, searchQuery, true)
                }
            })
            .catch(() => {})

        const unsubscribe = subscribeToMailboxChanges((payload) => {
            if (payload.eventType === 'INSERT') {
                const newRecord = payload.new as MailboxMessage
                setMessages(prev => {
                    const exists = prev.some(m => m.message_id === newRecord.message_id)
                    if (exists) return prev
                    return [newRecord, ...prev]
                })

                if (newRecord.folder === 'inbox' && !newRecord.is_read) {
                    setUnreadCount(prev => prev + 1)
                }
                setLastSyncText('Just now')
                showToast(`New email: ${newRecord.subject || '(No Subject)'}`, 'info')
            } else if (payload.eventType === 'UPDATE') {
                const updatedRecord = payload.new as MailboxMessage
                setMessages(prev => prev.map(m => m.message_id === updatedRecord.message_id ? updatedRecord : m))
                setSelectedMessage(curr => curr?.message_id === updatedRecord.message_id ? updatedRecord : curr)
            } else if (payload.eventType === 'DELETE') {
                const deletedRecord = payload.old as { message_id: string }
                setMessages(prev => prev.filter(m => m.message_id !== deletedRecord.message_id))
                setSelectedMessage(curr => curr?.message_id === deletedRecord.message_id ? null : curr)
                setSelectedIds(prev => {
                    const next = new Set(prev)
                    next.delete(deletedRecord.message_id)
                    return next
                })
            }
        })

        const interval = setInterval(() => {
            syncMailbox().catch(() => {})
        }, 120000)

        return () => {
            unsubscribe()
            clearInterval(interval)
        }
    }, [])

    // =========================================================================
    // 3. ANIME.JS V4 MOTION CHOREOGRAPHY
    // =========================================================================
    // List Cards Stagger
    useEffect(() => {
        if (!loading && listContainerRef.current) {
            const cards = listContainerRef.current.querySelectorAll<HTMLElement>('.mailbox-msg-card')
            if (cards.length > 0) {
                animate(cards, {
                    opacity: [0, 1],
                    translateY: [6, 0],
                    duration: 180,
                    delay: stagger(15),
                    ease: 'outCubic'
                })
            }
        }
    }, [messages.length, loading, folder, filterUnreadOnly])

    // Reader Pane Crossfade
    useEffect(() => {
        if (selectedMessage && readerRef.current) {
            animate(readerRef.current, {
                opacity: [0.3, 1],
                translateY: [4, 0],
                duration: 150,
                ease: 'outCubic'
            })
        }
    }, [selectedMessage?.message_id])

    // Quick Reply Accordion Expand
    useEffect(() => {
        if (isReplying && replyBoxRef.current) {
            animate(replyBoxRef.current, {
                opacity: [0, 1],
                translateY: [8, 0],
                duration: 180,
                ease: 'outCubic'
            })
        }
    }, [isReplying])

    // Compose Modal
    useEffect(() => {
        if (isComposeOpen && modalContentRef.current && modalBackdropRef.current) {
            animate(modalBackdropRef.current, {
                opacity: [0, 1],
                duration: 160,
                ease: 'linear'
            })
            animate(modalContentRef.current, {
                opacity: [0, 1],
                scale: [0.93, 1],
                translateY: [8, 0],
                duration: 200,
                ease: 'outCubic'
            })
        }
    }, [isComposeOpen])

    const closeComposeModal = (onDone?: () => void) => {
        if (modalContentRef.current && modalBackdropRef.current) {
            animate(modalBackdropRef.current, {
                opacity: [1, 0],
                duration: 140,
                ease: 'linear'
            })
            animate(modalContentRef.current, {
                opacity: [1, 0],
                scale: [1, 0.95],
                duration: 140,
                ease: 'inCubic',
                onComplete: () => {
                    setIsComposeOpen(false)
                    if (onDone) onDone()
                }
            })
        } else {
            setIsComposeOpen(false)
            if (onDone) onDone()
        }
    }

    // Confirmation Dialog
    useEffect(() => {
        if (confirmDialog && confirmCardRef.current && confirmBackdropRef.current) {
            animate(confirmBackdropRef.current, {
                opacity: [0, 1],
                duration: 160,
                ease: 'linear'
            })
            animate(confirmCardRef.current, {
                opacity: [0, 1],
                scale: [0.93, 1],
                translateY: [10, 0],
                duration: 220,
                ease: 'outCubic'
            })
        }
    }, [confirmDialog])

    const closeConfirmModal = (onDone?: () => void) => {
        if (confirmCardRef.current && confirmBackdropRef.current) {
            animate(confirmBackdropRef.current, {
                opacity: [1, 0],
                duration: 140,
                ease: 'linear'
            })
            animate(confirmCardRef.current, {
                opacity: [1, 0],
                scale: [1, 0.95],
                duration: 140,
                ease: 'inCubic',
                onComplete: () => {
                    setConfirmDialog(null)
                    if (onDone) onDone()
                }
            })
        } else {
            setConfirmDialog(null)
            if (onDone) onDone()
        }
    }

    // Shortcuts Modal
    useEffect(() => {
        if (isShortcutsOpen && shortcutsContentRef.current && shortcutsBackdropRef.current) {
            animate(shortcutsBackdropRef.current, {
                opacity: [0, 1],
                duration: 160,
                ease: 'linear'
            })
            animate(shortcutsContentRef.current, {
                opacity: [0, 1],
                scale: [0.93, 1],
                translateY: [8, 0],
                duration: 200,
                ease: 'outCubic'
            })
        }
    }, [isShortcutsOpen])

    const closeShortcutsModal = () => {
        if (shortcutsContentRef.current && shortcutsBackdropRef.current) {
            animate(shortcutsBackdropRef.current, {
                opacity: [1, 0],
                duration: 140,
                ease: 'linear'
            })
            animate(shortcutsContentRef.current, {
                opacity: [1, 0],
                scale: [1, 0.95],
                duration: 140,
                ease: 'inCubic',
                onComplete: () => setIsShortcutsOpen(false)
            })
        } else {
            setIsShortcutsOpen(false)
        }
    }

    // =========================================================================
    // 4. MANUAL SYNC
    // =========================================================================
    const handleManualSync = async () => {
        if (isSyncing) return
        setIsSyncing(true)

        if (syncButtonRef.current) {
            animate(syncButtonRef.current.querySelector('.sync-icon') as HTMLElement, {
                rotate: [0, 360],
                duration: 750,
                ease: 'outElastic(1, .8)'
            })
        }

        try {
            const res = await syncMailbox()
            if (res.success) {
                setLastSyncText('Just now')
                await loadMessages(folder, searchQuery, true)
                showToast('Mailbox synchronized with Google Workspace', 'success')
            } else {
                showToast(res.error || 'Sync failed', 'error')
            }
        } catch {
            showToast('Sync error', 'error')
        } finally {
            setIsSyncing(false)
        }
    }

    // =========================================================================
    // 5. MESSAGE INTERACTIONS
    // =========================================================================
    const handleToggleStar = useCallback(async (msg: MailboxMessage, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        const nextState = !msg.is_starred
        setMessages(prev => prev.map(m => m.message_id === msg.message_id ? { ...m, is_starred: nextState } : m))
        if (selectedMessage?.message_id === msg.message_id) {
            setSelectedMessage(prev => prev ? { ...prev, is_starred: nextState } : null)
        }
        await updateMailAction(msg.message_id, 'star', nextState)
    }, [selectedMessage])

    const handleToggleRead = useCallback(async (msg: MailboxMessage, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        const nextState = !msg.is_read
        setMessages(prev => prev.map(m => m.message_id === msg.message_id ? { ...m, is_read: nextState } : m))
        if (selectedMessage?.message_id === msg.message_id) {
            setSelectedMessage(prev => prev ? { ...prev, is_read: nextState } : null)
        }
        setUnreadCount(prev => nextState ? Math.max(0, prev - 1) : prev + 1)
        await updateMailAction(msg.message_id, 'read', nextState)
    }, [selectedMessage])

    const handleSelectMessage = useCallback(async (msg: MailboxMessage) => {
        setSelectedMessage(msg)
        setIsReplying(false)
        setReplyBody('')

        if (!msg.is_read) {
            setMessages(prev => prev.map(m => m.message_id === msg.message_id ? { ...m, is_read: true } : m))
            setUnreadCount(prev => Math.max(0, prev - 1))
            await updateMailAction(msg.message_id, 'read', true)
        }
    }, [])

    const handlePermanentDelete = useCallback((msg: MailboxMessage, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setConfirmDialog({
            title: 'Delete Message Permanently?',
            message: `Are you sure you want to permanently delete "${msg.subject || '(No Subject)'}"? This will expunge it forever from both the database and Google Workspace.`,
            confirmLabel: 'Delete Permanently',
            confirmColor: 'red',
            onConfirm: async () => {
                setMessages(prev => prev.filter(m => m.message_id !== msg.message_id))
                if (selectedMessage?.message_id === msg.message_id) {
                    setSelectedMessage(null)
                }
                setSelectedIds(prev => {
                    const next = new Set(prev)
                    next.delete(msg.message_id)
                    return next
                })
                showToast('Message permanently deleted', 'info')
                await updateMailAction(msg.message_id, 'delete_permanent')
            }
        })
    }, [selectedMessage, showToast])

    const handleTrash = useCallback(async (msg: MailboxMessage, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()

        if (folder === 'trash' || msg.folder === 'trash') {
            handlePermanentDelete(msg, e)
            return
        }

        setMessages(prev => prev.filter(m => m.message_id !== msg.message_id))
        if (selectedMessage?.message_id === msg.message_id) {
            setSelectedMessage(null)
        }
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.delete(msg.message_id)
            return next
        })
        showToast('Moved to Trash', 'info')
        await updateMailAction(msg.message_id, 'trash')
    }, [folder, handlePermanentDelete, selectedMessage, showToast])

    const handleRestore = useCallback(async (msg: MailboxMessage, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setMessages(prev => prev.filter(m => m.message_id !== msg.message_id))
        if (selectedMessage?.message_id === msg.message_id) {
            setSelectedMessage(null)
        }
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.delete(msg.message_id)
            return next
        })
        showToast('Restored to Inbox', 'success')
        await updateMailAction(msg.message_id, 'restore')
    }, [selectedMessage, showToast])

    const handleEmptyTrash = () => {
        setConfirmDialog({
            title: 'Empty Trash Permanently?',
            message: 'Are you sure you want to permanently delete all messages in Trash? This action cannot be undone and will expunge all trashed items from Google Workspace.',
            confirmLabel: 'Empty Trash',
            confirmColor: 'red',
            onConfirm: async () => {
                setMessages([])
                setSelectedMessage(null)
                setSelectedIds(new Set())
                showToast('Trash permanently emptied', 'info')
                await updateMailAction('all', 'empty_trash')
            }
        })
    }

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email)
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
    }

    // =========================================================================
    // 6. MULTI-SELECT BATCH OPERATIONS
    // =========================================================================
    const handleToggleSelectId = useCallback((id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    const filteredMessages = messages.filter(m => {
        if (filterUnreadOnly && m.is_read) return false
        return true
    })

    const handleSelectAll = useCallback(() => {
        if (selectedIds.size === filteredMessages.length && filteredMessages.length > 0) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredMessages.map(m => m.message_id)))
        }
    }, [filteredMessages, selectedIds.size])

    const handleBatchMarkRead = useCallback(async (readState: boolean) => {
        const ids = Array.from(selectedIds)
        if (ids.length === 0) return

        setMessages(prev => prev.map(m => ids.includes(m.message_id) ? { ...m, is_read: readState } : m))
        if (selectedMessage && ids.includes(selectedMessage.message_id)) {
            setSelectedMessage(prev => prev ? { ...prev, is_read: readState } : null)
        }
        showToast(`Marked ${ids.length} message${ids.length > 1 ? 's' : ''} as ${readState ? 'read' : 'unread'}`, 'info')
        setSelectedIds(new Set())
        await batchMailAction(ids, 'read', readState)
    }, [selectedIds, selectedMessage, showToast])

    const handleBatchToggleStar = useCallback(async () => {
        const ids = Array.from(selectedIds)
        if (ids.length === 0) return
        const hasUnstarred = messages.some(m => ids.includes(m.message_id) && !m.is_starred)
        const nextState = hasUnstarred

        setMessages(prev => prev.map(m => ids.includes(m.message_id) ? { ...m, is_starred: nextState } : m))
        if (selectedMessage && ids.includes(selectedMessage.message_id)) {
            setSelectedMessage(prev => prev ? { ...prev, is_starred: nextState } : null)
        }
        showToast(`${nextState ? 'Starred' : 'Unstarred'} ${ids.length} message${ids.length > 1 ? 's' : ''}`, 'info')
        setSelectedIds(new Set())
        await batchMailAction(ids, 'star', nextState)
    }, [messages, selectedIds, selectedMessage, showToast])

    const handleBatchTrash = useCallback(async () => {
        const ids = Array.from(selectedIds)
        if (ids.length === 0) return

        if (folder === 'trash') {
            setConfirmDialog({
                title: `Permanently Delete ${ids.length} Message${ids.length > 1 ? 's' : ''}?`,
                message: `Are you sure you want to permanently delete these ${ids.length} messages? This action cannot be undone.`,
                confirmLabel: 'Delete Permanently',
                confirmColor: 'red',
                onConfirm: async () => {
                    setMessages(prev => prev.filter(m => !ids.includes(m.message_id)))
                    if (selectedMessage && ids.includes(selectedMessage.message_id)) {
                        setSelectedMessage(null)
                    }
                    setSelectedIds(new Set())
                    showToast(`Permanently deleted ${ids.length} messages`, 'info')
                    await batchMailAction(ids, 'delete_permanent')
                }
            })
            return
        }

        setMessages(prev => prev.filter(m => !ids.includes(m.message_id)))
        if (selectedMessage && ids.includes(selectedMessage.message_id)) {
            setSelectedMessage(null)
        }
        setSelectedIds(new Set())
        showToast(`Moved ${ids.length} message${ids.length > 1 ? 's' : ''} to trash`, 'info')
        await batchMailAction(ids, 'trash')
    }, [folder, selectedIds, selectedMessage, showToast])

    // =========================================================================
    // 7. KEYBOARD SHORTCUTS ENGINE (Superhuman style)
    // =========================================================================
    const handleSelectNext = useCallback(() => {
        if (filteredMessages.length === 0) return
        if (!selectedMessage) {
            handleSelectMessage(filteredMessages[0])
            return
        }
        const currentIndex = filteredMessages.findIndex(m => m.message_id === selectedMessage.message_id)
        if (currentIndex < filteredMessages.length - 1) {
            const nextMsg = filteredMessages[currentIndex + 1]
            handleSelectMessage(nextMsg)
            const cardEl = listContainerRef.current?.querySelector(`[data-message-id="${nextMsg.message_id}"]`)
            cardEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    }, [filteredMessages, handleSelectMessage, selectedMessage])

    const handleSelectPrev = useCallback(() => {
        if (filteredMessages.length === 0) return
        if (!selectedMessage) {
            handleSelectMessage(filteredMessages[0])
            return
        }
        const currentIndex = filteredMessages.findIndex(m => m.message_id === selectedMessage.message_id)
        if (currentIndex > 0) {
            const prevMsg = filteredMessages[currentIndex - 1]
            handleSelectMessage(prevMsg)
            const cardEl = listContainerRef.current?.querySelector(`[data-message-id="${prevMsg.message_id}"]`)
            cardEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    }, [filteredMessages, handleSelectMessage, selectedMessage])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null
            const isInput = target && (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable ||
                target.getAttribute('role') === 'textbox'
            )

            // Escape always works
            if (e.key === 'Escape') {
                if (isInput) {
                    target.blur()
                    return
                }
                if (confirmDialog) {
                    closeConfirmModal()
                    return
                }
                if (isShortcutsOpen) {
                    closeShortcutsModal()
                    return
                }
                if (isComposeOpen) {
                    closeComposeModal()
                    return
                }
                if (isReplying) {
                    setIsReplying(false)
                    return
                }
                if (selectedIds.size > 0) {
                    setSelectedIds(new Set())
                    return
                }
                if (selectedMessage) {
                    setSelectedMessage(null)
                    return
                }
            }

            // Quick reply send shortcut: Ctrl+Enter or Cmd+Enter
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (isReplying && replyBody.trim()) {
                    e.preventDefault()
                    const form = replyBoxRef.current
                    form?.requestSubmit()
                    return
                }
            }

            // Skip single-key shortcuts if inside an input/textarea
            if (isInput) return

            // Focus search: '/'
            if (e.key === '/') {
                e.preventDefault()
                searchInputRef.current?.focus()
                searchInputRef.current?.select()
                return
            }

            // Open shortcuts cheat-sheet: '?'
            if (e.key === '?') {
                e.preventDefault()
                setIsShortcutsOpen(true)
                return
            }

            // Compose new email: 'c' or 'C'
            if (e.key === 'c' || e.key === 'C') {
                e.preventDefault()
                setIsComposeOpen(true)
                return
            }

            // Next message: 'j' or 'ArrowDown'
            if (e.key === 'j' || e.key === 'ArrowDown') {
                e.preventDefault()
                handleSelectNext()
                return
            }

            // Prev message: 'k' or 'ArrowUp'
            if (e.key === 'k' || e.key === 'ArrowUp') {
                e.preventDefault()
                handleSelectPrev()
                return
            }

            // Quick reply to selected: 'r' or 'R'
            if (e.key === 'r' || e.key === 'R') {
                if (selectedMessage) {
                    e.preventDefault()
                    setIsReplying(true)
                    setTimeout(() => replyTextareaRef.current?.focus(), 50)
                }
                return
            }

            // Toggle star: 's' or 'S'
            if (e.key === 's' || e.key === 'S') {
                e.preventDefault()
                if (selectedIds.size > 0) {
                    handleBatchToggleStar()
                } else if (selectedMessage) {
                    handleToggleStar(selectedMessage)
                }
                return
            }

            // Toggle read / unread: 'e' or 'E'
            if (e.key === 'e' || e.key === 'E') {
                e.preventDefault()
                if (selectedIds.size > 0) {
                    handleBatchMarkRead(true)
                } else if (selectedMessage) {
                    handleToggleRead(selectedMessage)
                }
                return
            }

            // Trash: '#' or 'Delete'
            if (e.key === '#' || e.key === 'Delete') {
                e.preventDefault()
                if (selectedIds.size > 0) {
                    handleBatchTrash()
                } else if (selectedMessage) {
                    handleTrash(selectedMessage)
                }
                return
            }

            // Toggle select checkbox: 'x' or 'X'
            if (e.key === 'x' || e.key === 'X') {
                e.preventDefault()
                if (selectedMessage) {
                    handleToggleSelectId(selectedMessage.message_id)
                }
                return
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [
        confirmDialog,
        handleBatchMarkRead,
        handleBatchToggleStar,
        handleBatchTrash,
        handleSelectNext,
        handleSelectPrev,
        handleToggleRead,
        handleToggleSelectId,
        handleToggleStar,
        handleTrash,
        isComposeOpen,
        isReplying,
        isShortcutsOpen,
        replyBody,
        selectedIds,
        selectedMessage
    ])

    // =========================================================================
    // 8. SEND DIRECT REPLY
    // =========================================================================
    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMessage || !replyBody.trim()) return

        setIsSendingReply(true)
        try {
            const cleanSubject = selectedMessage.subject.startsWith('Re:')
                ? selectedMessage.subject
                : `Re: ${selectedMessage.subject}`

            const res = await sendMailboxMessage({
                to: selectedMessage.from_email,
                subject: cleanSubject,
                html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #0f172a;">
                    <div style="margin: 0 0 16px 0;">${replyBody.replace(/\n/g, '<br/>')}</div>
                    <div style="border-top: 1px solid rgba(100, 116, 139, 0.2); padding-top: 14px; margin-top: 20px; color: #64748b; font-size: 12px; line-height: 1.5;">
                        <strong style="color: #0f172a;">ICST Chowberia</strong><br/>
                        Institute of Computer Science and Technology<br/>
                        Vill & P.O. Chowberia, North 24 Parganas, WB 743273<br/>
                        Email: <a href="mailto:info@icstconnect.in" style="color: #2563eb; text-decoration: none;">info@icstconnect.in</a> | Web: <a href="https://icstconnect.in" style="color: #2563eb; text-decoration: none;">https://icstconnect.in</a>
                    </div>
                </div>`,
                text: `${replyBody}\n\n--\nICST Chowberia\nInstitute of Computer Science and Technology\nVill & P.O. Chowberia, North 24 Parganas, WB 743273\ninfo@icstconnect.in`,
                inReplyTo: selectedMessage.message_id,
                references: selectedMessage.message_id
            })

            if (res.success) {
                showToast('Reply dispatched successfully!', 'success')
                setReplyBody('')
                setIsReplying(false)
                if (folder === 'sent') loadMessages('sent', searchQuery, true)
            } else {
                showToast(res.error || 'Failed to dispatch reply', 'error')
            }
        } catch {
            showToast('Network error sending reply', 'error')
        } finally {
            setIsSendingReply(false)
        }
    }

    // =========================================================================
    // 9. COMPOSE EMAIL
    // =========================================================================
    const handleSendCompose = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!composeTo || !composeSubject || !composeBody.trim()) {
            showToast('Please provide recipient, subject and message body', 'warning')
            return
        }

        setIsSendingCompose(true)
        try {
            const res = await sendMailboxMessage({
                to: composeTo.trim(),
                subject: composeSubject.trim(),
                html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #0f172a;">
                    <div style="margin: 0 0 16px 0;">${composeBody.replace(/\n/g, '<br/>')}</div>
                    <div style="border-top: 1px solid rgba(100, 116, 139, 0.2); padding-top: 14px; margin-top: 20px; color: #64748b; font-size: 12px; line-height: 1.5;">
                        <strong style="color: #0f172a;">ICST Chowberia</strong><br/>
                        Institute of Computer Science and Technology<br/>
                        Vill & P.O. Chowberia, North 24 Parganas, WB 743273<br/>
                        Email: <a href="mailto:info@icstconnect.in" style="color: #2563eb; text-decoration: none;">info@icstconnect.in</a> | Web: <a href="https://icstconnect.in" style="color: #2563eb; text-decoration: none;">https://icstconnect.in</a>
                    </div>
                </div>`,
                text: `${composeBody}\n\n--\nICST Chowberia\nInstitute of Computer Science and Technology\nVill & P.O. Chowberia, North 24 Parganas, WB 743273\ninfo@icstconnect.in`
            })

            if (res.success) {
                showToast('Email sent successfully!', 'success')
                closeComposeModal(() => {
                    setComposeTo('')
                    setComposeSubject('')
                    setComposeBody('')
                })
                if (folder === 'sent') loadMessages('sent', searchQuery, true)
            } else {
                showToast(res.error || 'Failed to send email', 'error')
            }
        } catch {
            showToast('Network error sending email', 'error')
        } finally {
            setIsSendingCompose(false)
        }
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
            <SEOHead
                title="Institution Mailbox - ICST Connect"
                description="Institution email and communications center."
                noindex={true}
            />

            {/* 3-Pane Edge-to-Edge Grid Layout */}
            <div className="flex-1 flex overflow-hidden w-full h-full">

                {/* ========================================================= */}
                {/* 1. FOLDERS SIDEBAR                                        */}
                {/* ========================================================= */}
                <aside className="w-56 bg-white dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between p-3 shrink-0 hidden md:flex">
                    <div className="space-y-1">
                        {/* Compose CTA Button */}
                        <button
                            onClick={() => setIsComposeOpen(true)}
                            className="w-full h-9 px-3.5 mb-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs flex items-center justify-between shadow-sm shadow-blue-600/20 active:scale-98 transition-all cursor-pointer"
                            title="Compose New Email (c)"
                        >
                            <div className="flex items-center gap-2">
                                <IconPencil size={14} />
                                <span>Compose</span>
                            </div>
                            <kbd className="text-[10px] bg-blue-700/60 px-1.5 py-0.2 rounded font-mono text-blue-100">
                                c
                            </kbd>
                        </button>

                        {/* Navigation Items */}
                        {[
                            { id: 'inbox', label: 'Inbox', icon: IconInbox, badge: unreadCount },
                            { id: 'sent', label: 'Sent', icon: IconSend },
                            { id: 'starred', label: 'Starred', icon: IconStar },
                            { id: 'trash', label: 'Trash', icon: IconTrash },
                        ].map(item => {
                            const isActive = folder === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => { setFolder(item.id as any); setSelectedMessage(null); }}
                                    className={`w-full h-8 flex items-center justify-between px-2.5 rounded-lg text-xs transition-colors cursor-pointer group ${
                                        isActive
                                            ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <item.icon size={15} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && item.badge > 0 ? (
                                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-blue-600 text-white">
                                            {item.badge}
                                        </span>
                                    ) : null}
                                </button>
                            )
                        })}
                    </div>

                    {/* Bottom Status & Mailbox Identity */}
                    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 px-1">
                            <span className="flex items-center gap-1.5 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-xs shadow-emerald-500/50"></span>
                                <span>Live • {lastSyncText}</span>
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsShortcutsOpen(true)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
                                    title="Keyboard Shortcuts (?)"
                                >
                                    <IconKeyboard size={13} />
                                </button>
                                <button
                                    ref={syncButtonRef}
                                    onClick={handleManualSync}
                                    disabled={isSyncing}
                                    className="p-1 rounded text-slate-400 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
                                    title="Sync with Google Workspace"
                                >
                                    <IconRefresh size={13} className={`sync-icon inline-block origin-center ${isSyncing ? 'text-blue-500' : ''}`} />
                                </button>
                            </div>
                        </div>
                        <div className="px-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            info@icstconnect.in
                        </div>
                    </div>
                </aside>

                {/* ========================================================= */}
                {/* 2. MESSAGE LIST COLUMN                                    */}
                {/* ========================================================= */}
                <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 shrink-0 h-full overflow-hidden ${
                    selectedMessage ? 'hidden md:flex' : 'flex'
                }`}>
                    {/* Fixed 48px Header */}
                    <div className="h-12 px-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2 bg-slate-50/60 dark:bg-slate-950/40 shrink-0">
                        <div className="relative flex-1">
                            <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search mail (Press '/' to focus)..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && loadMessages(folder, searchQuery)}
                                className="w-full pl-7 pr-7 py-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); loadMessages(folder, ''); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <IconX size={12} />
                                </button>
                            )}
                        </div>

                        {/* Unread Filter Toggle */}
                        <button
                            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                            className={`cursor-pointer transition-colors px-2 py-1 rounded text-[11px] font-medium shrink-0 ${
                                filterUnreadOnly
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {filterUnreadOnly ? 'Unread' : 'All'}
                        </button>
                    </div>

                    {/* Sub-header: Count and Batch Actions */}
                    <div className="px-3 py-1.5 bg-slate-50/40 dark:bg-slate-950/20 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 shrink-0">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={filteredMessages.length > 0 && selectedIds.size === filteredMessages.length}
                                onChange={handleSelectAll}
                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                            />
                            <span className="font-medium capitalize text-slate-800 dark:text-slate-200">
                                {folder} • {filteredMessages.length}
                            </span>
                        </label>

                        {folder === 'trash' && messages.length > 0 && (
                            <button
                                onClick={handleEmptyTrash}
                                className="text-red-500 hover:text-red-600 dark:text-red-400 font-semibold cursor-pointer transition-colors"
                            >
                                Empty Trash
                            </button>
                        )}
                    </div>

                    {/* Batch Action Bar */}
                    {selectedIds.size > 0 && (
                        <div
                            ref={batchBarRef}
                            className="px-3 py-1.5 bg-blue-50/80 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs shrink-0"
                        >
                            <span className="font-mono text-[11px] font-medium text-blue-700 dark:text-blue-200">
                                {selectedIds.size} selected
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleBatchMarkRead(true)}
                                    className="p-1 rounded text-slate-600 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                                    title="Mark as read (e)"
                                >
                                    <IconMailOpened size={13} />
                                </button>
                                <button
                                    onClick={handleBatchToggleStar}
                                    className="p-1 rounded text-slate-600 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                                    title="Star (s)"
                                >
                                    <IconStar size={13} />
                                </button>
                                <button
                                    onClick={handleBatchTrash}
                                    className="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                                    title={folder === 'trash' ? 'Delete Permanently (#)' : 'Move to Trash (#)'}
                                >
                                    <IconTrash size={13} />
                                </button>
                                <button
                                    onClick={() => setSelectedIds(new Set())}
                                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ml-1"
                                    title="Clear selection (Esc)"
                                >
                                    <IconX size={13} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Message List */}
                    <div ref={listContainerRef} className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 select-text">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                                <IconRefresh size={18} className="animate-spin mx-auto mb-2 text-blue-500" />
                                <span>Loading messages...</span>
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs space-y-1.5">
                                <IconMail size={24} className="mx-auto text-slate-400 dark:text-slate-500 stroke-1" />
                                <p className="font-medium text-slate-800 dark:text-slate-200">No messages in {folder}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">All messages in this folder are cleared.</p>
                            </div>
                        ) : (
                            filteredMessages.map(msg => {
                                const isSelected = selectedMessage?.message_id === msg.message_id
                                const isChecked = selectedIds.has(msg.message_id)
                                const avatarStyle = getAvatarStyle(msg.from_email || msg.from_name)
                                const senderInitial = (msg.from_name || msg.from_email || '?')[0].toUpperCase()

                                return (
                                    <div
                                        key={msg.message_id}
                                        data-message-id={msg.message_id}
                                        onClick={() => handleSelectMessage(msg)}
                                        className={`mailbox-msg-card group px-3.5 py-2.5 transition-colors cursor-pointer relative flex gap-2.5 items-start ${
                                            isSelected
                                                ? 'bg-blue-50/60 dark:bg-blue-950/30 border-l-2 border-l-blue-600 dark:border-l-blue-500'
                                                : isChecked
                                                ? 'bg-blue-50/30 dark:bg-blue-950/20 border-l-2 border-l-transparent'
                                                : 'border-l-2 border-l-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                                        }`}
                                    >
                                        {/* Avatar & Checkbox Column */}
                                        <div className="relative shrink-0 mt-0.5">
                                            <div
                                                onClick={(e) => handleToggleSelectId(msg.message_id, e)}
                                                className={`absolute inset-0 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border transition-opacity cursor-pointer ${
                                                    isChecked || selectedIds.size > 0
                                                        ? 'opacity-100 z-10'
                                                        : 'opacity-0 group-hover:opacity-100 z-10'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {}}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                            <div className={`w-7 h-7 rounded-full border ${avatarStyle} text-[11px] font-semibold flex items-center justify-center`}>
                                                {senderInitial}
                                            </div>
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 min-w-0">
                                            {/* Line 1: Sender & Date / Hover Action Bar */}
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <span className={`text-[13px] truncate ${!msg.is_read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-800 dark:text-slate-200 font-semibold'}`}>
                                                    {msg.from_name || msg.from_email}
                                                </span>

                                                {/* Timestamp (Normal state) */}
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:hidden shrink-0 tabular-nums">
                                                    {formatEmailTime(msg.received_at)}
                                                </span>

                                                {/* Hover Action Bar (Reveals on hover) */}
                                                <div className="hidden group-hover:flex items-center gap-1 shrink-0 text-slate-400">
                                                    <button
                                                        onClick={(e) => handleToggleStar(msg, e)}
                                                        className="hover:text-amber-500 p-0.5 transition-colors cursor-pointer"
                                                        title={msg.is_starred ? 'Unstar (s)' : 'Star (s)'}
                                                    >
                                                        {msg.is_starred ? <IconStarFilled size={13} className="text-amber-500" /> : <IconStar size={13} />}
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleTrash(msg, e)}
                                                        className="hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                                                        title={folder === 'trash' ? 'Delete Permanently (#)' : 'Move to trash (#)'}
                                                    >
                                                        <IconTrash size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Line 2: Subject */}
                                            <p className={`text-xs truncate mb-0.5 ${!msg.is_read ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-700 dark:text-slate-300 font-normal'}`}>
                                                {msg.subject || '(No Subject)'}
                                            </p>

                                            {/* Line 3: Snippet & Attachment */}
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[11px] text-slate-500 dark:text-slate-300 truncate font-normal flex-1">
                                                    {msg.snippet || 'No preview text.'}
                                                </p>
                                                {msg.has_attachments && (
                                                    <IconPaperclip size={12} className="text-slate-400 shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 3. READING PANE (Continuous Document Canvas)               */}
                {/* ========================================================= */}
                <main className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950 overflow-hidden h-full ${
                    !selectedMessage ? 'hidden md:flex' : 'flex'
                }`}>
                    {selectedMessage ? (
                        <div ref={readerRef} className="flex-1 flex flex-col h-full overflow-hidden">
                            {/* Fixed 48px Header Toolbar */}
                            <div className="h-12 px-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="md:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer mr-1"
                                        title="Back to list"
                                    >
                                        <IconX size={16} />
                                    </button>

                                    {folder === 'trash' ? (
                                        <>
                                            <button
                                                onClick={() => handleRestore(selectedMessage)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
                                            >
                                                <IconArrowBackUp size={14} />
                                                <span>Restore</span>
                                            </button>
                                            <button
                                                onClick={() => handlePermanentDelete(selectedMessage)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
                                            >
                                                <IconTrash size={14} />
                                                <span>Delete Permanently</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setIsReplying(true)
                                                    setTimeout(() => replyTextareaRef.current?.focus(), 50)
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer active:scale-98"
                                            >
                                                <IconArrowBackUp size={14} />
                                                <span>Reply</span>
                                                <kbd className="hidden lg:inline-block ml-0.5 text-[9px] font-mono text-blue-200">r</kbd>
                                            </button>
                                            <button
                                                onClick={() => handleToggleRead(selectedMessage)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                title={selectedMessage.is_read ? 'Mark as unread (e)' : 'Mark as read (e)'}
                                            >
                                                {selectedMessage.is_read ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                                            </button>
                                            <button
                                                onClick={(e) => handleToggleStar(selectedMessage, e)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                title={selectedMessage.is_starred ? 'Unstar (s)' : 'Star (s)'}
                                            >
                                                {selectedMessage.is_starred ? <IconStarFilled size={15} className="text-amber-500" /> : <IconStar size={15} />}
                                            </button>
                                            <button
                                                onClick={() => handleTrash(selectedMessage)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                title="Move to trash (#)"
                                            >
                                                <IconTrash size={15} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="text-[11px] text-slate-500 dark:text-slate-300 font-mono flex items-center gap-2">
                                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-[10px]">
                                        {selectedMessage.folder}
                                    </span>
                                    <span>{new Date(selectedMessage.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            {/* Elevated Document Reader Canvas */}
                            <div className="flex-1 overflow-y-auto p-4 lg:p-8 select-text">
                                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm p-6 lg:p-8 space-y-6">
                                    {/* Subject Title */}
                                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                                        {selectedMessage.subject || '(No Subject)'}
                                    </h1>

                                    {/* Sender & Recipient Metadata */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 dark:border-slate-800/80 gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full border ${getAvatarStyle(selectedMessage.from_email || selectedMessage.from_name)} font-semibold text-sm flex items-center justify-center shrink-0`}>
                                                {selectedMessage.from_name ? selectedMessage.from_name[0].toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                                        {selectedMessage.from_name || selectedMessage.from_email}
                                                    </span>
                                                    {selectedMessage.from_email?.toLowerCase().includes('icstconnect.in') ? (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                                            <IconShieldCheck size={11} /> Institutional
                                                        </span>
                                                    ) : (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                            External
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                                                    <span>&lt;{selectedMessage.from_email}&gt;</span>
                                                    <button
                                                        onClick={() => handleCopyEmail(selectedMessage.from_email)}
                                                        className="text-slate-400 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer p-0.5"
                                                        title="Copy address"
                                                    >
                                                        {copiedEmail ? <IconCheck size={12} className="text-emerald-500" /> : <IconCopy size={12} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:items-end text-xs text-slate-500 dark:text-slate-300 font-mono space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <IconClock size={12} className="text-slate-400 dark:text-slate-400" />
                                                <span>
                                                    {new Date(selectedMessage.received_at).toLocaleDateString([], {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="text-slate-500 dark:text-slate-400">
                                                to: <span className="text-slate-800 dark:text-slate-100 font-medium">{selectedMessage.to_email || 'info@icstconnect.in'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Message Content */}
                                    <div className="email-body-content text-slate-900 dark:text-slate-100 text-sm leading-relaxed overflow-x-auto min-h-[140px]">
                                        {selectedMessage.body_html ? (
                                            <div
                                                dangerouslySetInnerHTML={{ __html: formatEmailBodyForDisplay(selectedMessage.body_html) }}
                                                className="prose dark:prose-invert max-w-none text-sm text-slate-900 dark:text-slate-100 font-sans leading-relaxed [&_*]:!text-inherit [&_a]:!text-blue-600 dark:[&_a]:!text-blue-400 [&_a]:underline"
                                            />
                                        ) : (
                                            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                                                {selectedMessage.body_text || selectedMessage.snippet}
                                            </pre>
                                        )}
                                    </div>

                                    {/* Attachments */}
                                    {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                <IconPaperclip size={13} />
                                                <span>Attachments ({selectedMessage.attachments.length})</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedMessage.attachments.map((att, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                        <span className="truncate max-w-[200px]">{att.filename}</span>
                                                        {att.size && <span className="text-[10px] text-slate-400 font-mono">({Math.round(att.size / 1024)} KB)</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Inline Quick Reply Drawer */}
                                    {isReplying ? (
                                        <form
                                            ref={replyBoxRef}
                                            onSubmit={handleSendReply}
                                            className="pt-5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                                    <IconArrowBackUp size={14} />
                                                    Replying to {selectedMessage.from_name || selectedMessage.from_email}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsReplying(false)}
                                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                                                >
                                                    Cancel (Esc)
                                                </button>
                                            </div>

                                            {/* Quick Templates */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {REPLY_TEMPLATES.map((tmpl, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setReplyBody(tmpl.text)}
                                                        className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700"
                                                    >
                                                        {tmpl.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <textarea
                                                ref={replyTextareaRef}
                                                rows={5}
                                                placeholder="Write your official response..."
                                                value={replyBody}
                                                onChange={e => setReplyBody(e.target.value)}
                                                required
                                                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans"
                                            />

                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-[11px] text-slate-500 dark:text-slate-300 font-mono">
                                                    Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-200">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-200">Enter</kbd> to send
                                                </span>
                                                <button
                                                    type="submit"
                                                    disabled={isSendingReply}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                                                >
                                                    <IconSend size={14} />
                                                    <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                                            <button
                                                onClick={() => {
                                                    setIsReplying(true)
                                                    setTimeout(() => replyTextareaRef.current?.focus(), 50)
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-xs transition-colors cursor-pointer active:scale-98"
                                            >
                                                <IconArrowBackUp size={15} className="text-blue-600 dark:text-blue-400" />
                                                <span>Click here to reply (r)</span>
                                            </button>

                                            <button
                                                onClick={() => setIsShortcutsOpen(true)}
                                                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <IconKeyboard size={14} />
                                                <span>Shortcuts (?)</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty State when no message selected */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 shadow-sm">
                                <IconMail size={28} className="text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                                No message selected
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mb-4">
                                Select an email from the list or use keyboard shortcuts to triage quickly.
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsShortcutsOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    <IconKeyboard size={13} />
                                    <span>Keyboard Shortcuts (?)</span>
                                </button>
                                <button
                                    onClick={() => setIsComposeOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors cursor-pointer"
                                >
                                    <IconPencil size={13} />
                                    <span>Compose (c)</span>
                                </button>
                            </div>
                        </div>
                    )}
                </main>

            </div>

            {/* Compose Modal */}
            {isComposeOpen && (
                <div
                    ref={modalBackdropRef}
                    onClick={() => closeComposeModal()}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                >
                    <div
                        ref={modalContentRef}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <IconPencil size={15} className="text-blue-600" />
                                New Message
                            </span>
                            <button
                                type="button"
                                onClick={() => closeComposeModal()}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                title="Close (Esc)"
                            >
                                <IconX size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSendCompose} className="p-5 space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    To
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="student@example.com..."
                                    value={composeTo}
                                    onChange={e => setComposeTo(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Subject..."
                                    value={composeSubject}
                                    onChange={e => setComposeSubject(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Message
                                </label>
                                <textarea
                                    rows={8}
                                    required
                                    placeholder="Type your message here..."
                                    value={composeBody}
                                    onChange={e => setComposeBody(e.target.value)}
                                    className="w-full p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                                <span className="text-[11px] text-slate-500 dark:text-slate-300 font-mono">
                                    From: info@icstconnect.in
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => closeComposeModal()}
                                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSendingCompose}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                                    >
                                        <IconSend size={13} />
                                        <span>{isSendingCompose ? 'Sending...' : 'Send'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Shortcuts Cheat-sheet Modal */}
            {isShortcutsOpen && (
                <div
                    ref={shortcutsBackdropRef}
                    onClick={closeShortcutsModal}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                >
                    <div
                        ref={shortcutsContentRef}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 flex flex-col"
                    >
                        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-slate-800/80">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                                <IconKeyboard size={16} className="text-blue-600" />
                                <span>Keyboard Shortcuts</span>
                            </div>
                            <button
                                onClick={closeShortcutsModal}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <IconX size={15} />
                            </button>
                        </div>

                        <div className="py-4 space-y-4 text-xs">
                            <div>
                                <h4 className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                                    Navigation
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Next message</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">j / ↓</kbd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Previous message</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">k / ↑</kbd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Focus search</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">/</kbd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Close / Deselect</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">Esc</kbd>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                                <h4 className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                                    Actions
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Compose new email</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">c</kbd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Quick reply to selected</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">r</kbd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Toggle read / unread</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">e</kbd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Toggle star</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">s</kbd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Move to trash / Delete</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"># / Del</kbd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 dark:text-slate-200">Select checkbox</span>
                                        <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">x</kbd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
                            <span className="text-[11px] text-slate-500 dark:text-slate-300">
                                Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">?</kbd> anywhere to toggle this guide
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Anime.js Confirmation Dialog */}
            {confirmDialog && (
                <div
                    ref={confirmBackdropRef}
                    onClick={() => closeConfirmModal()}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                >
                    <div
                        ref={confirmCardRef}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden p-6 flex flex-col"
                    >
                        <div className="flex items-start gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                                <IconAlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {confirmDialog.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                    {confirmDialog.message}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-3">
                            <button
                                type="button"
                                onClick={() => closeConfirmModal()}
                                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-98"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const action = confirmDialog.onConfirm
                                    closeConfirmModal(action)
                                }}
                                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20 transition-all cursor-pointer active:scale-98"
                            >
                                {confirmDialog.confirmLabel || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
