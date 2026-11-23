import React, { useState, useEffect } from 'react'
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
    IconUser
} from '@tabler/icons-react'
import {
    fetchMailbox,
    syncMailbox,
    sendMailboxMessage,
    updateMailAction,
    type MailboxMessage
} from '../../services/mailboxService'
import { useToast } from '../../contexts/ToastContext'
import SEOHead from '../../components/common/SEOHead'

export default function AdminMailbox() {
    const { showToast } = useToast()

    const [folder, setFolder] = useState<'inbox' | 'sent' | 'starred' | 'trash'>('inbox')
    const [messages, setMessages] = useState<MailboxMessage[]>([])
    const [selectedMessage, setSelectedMessage] = useState<MailboxMessage | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)

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

    // Load Messages
    const loadMessages = async (targetFolder = folder, search = searchQuery) => {
        setLoading(true)
        try {
            const res = await fetchMailbox(targetFolder, search)
            if (res.success) {
                setMessages(res.messages || [])
                setUnreadCount(res.unreadCount || 0)
                if (selectedMessage) {
                    const updated = res.messages.find(m => m.message_id === selectedMessage.message_id)
                    if (updated) setSelectedMessage(updated)
                }
            } else {
                showToast(res.error || 'Failed to load messages', 'error')
            }
        } catch {
            showToast('Unable to connect to mailbox service', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMessages(folder, searchQuery)
    }, [folder])

    // Trigger IMAP Mailbox Sync
    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const res = await syncMailbox()
            if (res.success) {
                showToast(res.message || 'Mailbox synchronized!', 'success')
                await loadMessages(folder, searchQuery)
            } else {
                showToast(res.error || 'Sync failed. Verify credentials in .env', 'error')
            }
        } catch {
            showToast('Network error while syncing mailbox', 'error')
        } finally {
            setIsSyncing(false)
        }
    }

    // Toggle Star
    const handleToggleStar = async (msg: MailboxMessage, e: React.MouseEvent) => {
        e.stopPropagation()
        const nextState = !msg.is_starred
        setMessages(prev => prev.map(m => m.message_id === msg.message_id ? { ...m, is_starred: nextState } : m))
        if (selectedMessage?.message_id === msg.message_id) {
            setSelectedMessage(prev => prev ? { ...prev, is_starred: nextState } : null)
        }
        await updateMailAction(msg.message_id, 'star', nextState)
    }

    // Select Message & Mark Read
    const handleSelectMessage = async (msg: MailboxMessage) => {
        setSelectedMessage(msg)
        setIsReplying(false)
        setReplyBody('')

        if (!msg.is_read) {
            setMessages(prev => prev.map(m => m.message_id === msg.message_id ? { ...m, is_read: true } : m))
            setUnreadCount(prev => Math.max(0, prev - 1))
            await updateMailAction(msg.message_id, 'read', true)
        }
    }

    // Move to Trash
    const handleTrash = async (msg: MailboxMessage, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setMessages(prev => prev.filter(m => m.message_id !== msg.message_id))
        if (selectedMessage?.message_id === msg.message_id) {
            setSelectedMessage(null)
        }
        showToast('Message moved to trash', 'info')
        await updateMailAction(msg.message_id, 'trash')
    }

    // Submit Reply
    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMessage || !replyBody.trim()) return

        setIsSendingReply(true)
        try {
            const res = await sendMailboxMessage({
                to: selectedMessage.from_email,
                subject: selectedMessage.subject.startsWith('Re:') ? selectedMessage.subject : `Re: ${selectedMessage.subject}`,
                html: `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
                    ${replyBody.replace(/\n/g, '<br/>')}
                    <br/><br/>
                    <div style="border-left: 2px solid #cbd5e1; padding-left: 12px; margin-top: 16px; color: #64748b; font-size: 13px;">
                        <strong>On ${new Date(selectedMessage.received_at).toLocaleString()}, ${selectedMessage.from_name} &lt;${selectedMessage.from_email}&gt; wrote:</strong><br/>
                        ${selectedMessage.body_html || selectedMessage.body_text || selectedMessage.snippet}
                    </div>
                </div>`,
                text: `${replyBody}\n\n--- Original Message ---\nFrom: ${selectedMessage.from_name} <${selectedMessage.from_email}>\nDate: ${selectedMessage.received_at}\n\n${selectedMessage.body_text || selectedMessage.snippet}`,
                inReplyTo: selectedMessage.message_id,
                references: selectedMessage.message_id
            })

            if (res.success) {
                showToast('Reply dispatched successfully!', 'success')
                setReplyBody('')
                setIsReplying(false)
            } else {
                showToast(res.error || 'Failed to dispatch reply', 'error')
            }
        } catch {
            showToast('Network error dispatching reply', 'error')
        } finally {
            setIsSendingReply(false)
        }
    }

    // Submit New Compose
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
                html: `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
                    ${composeBody.replace(/\n/g, '<br/>')}
                    <br/><br/>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                        <strong>ICST Connect</strong> • Institute of Computer Science & Technology<br/>
                        Vill & P.O. Chowberia, North 24 Parganas, WB 743273 • info@icstconnect.in
                    </p>
                </div>`,
                text: `${composeBody}\n\n---\nICST Connect • Institute of Computer Science & Technology\ninfo@icstconnect.in`
            })

            if (res.success) {
                showToast('Email sent successfully!', 'success')
                setIsComposeOpen(false)
                setComposeTo('')
                setComposeSubject('')
                setComposeBody('')
                if (folder === 'sent') loadMessages('sent')
            } else {
                showToast(res.error || 'Failed to send email', 'error')
            }
        } catch {
            showToast('Network error sending email', 'error')
        } finally {
            setIsSendingCompose(false)
        }
    }

    const filteredMessages = messages.filter(m => {
        if (filterUnreadOnly && m.is_read) return false
        return true
    })

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-inter">
            <SEOHead
                title="Institution Mailbox - ICST Connect"
                description="Institution email and communications center."
                noindex={true}
            />

            {/* Top Bar Header */}
            <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <IconMail size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Institution Mailbox
                            </h1>
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                info@icstconnect.in
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Centralized institutional email client with live IMAP sync and outbound SMTP relay.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                        title="Sync with IMAP server"
                    >
                        <IconRefresh size={16} className={isSyncing ? 'animate-spin text-blue-500' : ''} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync Mailbox'}</span>
                    </button>

                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                        <IconSend size={16} />
                        <span>Compose Email</span>
                    </button>
                </div>
            </header>

            {/* Main Email Workspace (3 Columns: Folders, List, Viewer) */}
            <div className="flex-1 flex overflow-hidden">
                {/* 1. Folders Navigation */}
                <div className="w-56 bg-slate-100/70 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 p-4 space-y-1.5 shrink-0 hidden md:block">
                    <button
                        onClick={() => { setFolder('inbox'); setSelectedMessage(null); }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            folder === 'inbox'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <IconInbox size={18} />
                            <span>Inbox</span>
                        </div>
                        {unreadCount > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                folder === 'inbox' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
                            }`}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => { setFolder('sent'); setSelectedMessage(null); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            folder === 'sent'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <IconSend size={18} />
                        <span>Sent Messages</span>
                    </button>

                    <button
                        onClick={() => { setFolder('starred'); setSelectedMessage(null); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            folder === 'starred'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <IconStar size={18} />
                        <span>Starred</span>
                    </button>

                    <button
                        onClick={() => { setFolder('trash'); setSelectedMessage(null); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            folder === 'trash'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <IconTrash size={18} />
                        <span>Trash</span>
                    </button>

                    <div className="pt-6 px-3">
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Server Gateway
                            </span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                                smtp.google.com
                            </p>
                            <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> SSL Protected
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Messages List Column */}
                <div className={`w-full md:w-96 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 ${
                    selectedMessage ? 'hidden lg:flex' : 'flex'
                }`}>
                    {/* Search & Quick Filter */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="relative">
                            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by sender or subject..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && loadMessages(folder, searchQuery)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                            <span>{filteredMessages.length} message(s)</span>
                            <button
                                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                                className={`font-semibold cursor-pointer transition-colors ${
                                    filterUnreadOnly ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {filterUnreadOnly ? 'Showing unread' : 'Filter unread'}
                            </button>
                        </div>
                    </div>

                    {/* Messages Scrollable List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                <IconRefresh size={24} className="animate-spin mx-auto mb-2 text-indigo-500" />
                                Loading mailbox...
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                                <IconMail size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
                                <p className="font-semibold">No messages found in {folder}</p>
                                <p className="text-[11px] text-slate-500">
                                    Click "Sync Mailbox" to check Google Workspace.
                                </p>
                            </div>
                        ) : (
                            filteredMessages.map(msg => {
                                const isSelected = selectedMessage?.message_id === msg.message_id
                                return (
                                    <div
                                        key={msg.message_id}
                                        onClick={() => handleSelectMessage(msg)}
                                        className={`p-3.5 transition-all cursor-pointer relative ${
                                            isSelected
                                                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        } ${!msg.is_read ? 'font-bold' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2 truncate">
                                                {!msg.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                                                )}
                                                <span className="text-xs text-slate-900 dark:text-white truncate">
                                                    {msg.from_name || msg.from_email}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                                {new Date(msg.received_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-800 dark:text-slate-200 truncate mb-1">
                                            {msg.subject || '(No Subject)'}
                                        </p>

                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-normal leading-relaxed">
                                            {msg.snippet || 'No message snippet available.'}
                                        </p>

                                        <div className="flex items-center justify-between mt-2 pt-1">
                                            <button
                                                onClick={(e) => handleToggleStar(msg, e)}
                                                className="text-slate-400 hover:text-amber-500 transition-colors"
                                            >
                                                {msg.is_starred ? (
                                                    <IconStarFilled size={15} className="text-amber-500" />
                                                ) : (
                                                    <IconStar size={15} />
                                                )}
                                            </button>

                                            <div className="flex items-center gap-2 text-slate-400">
                                                {msg.has_attachments && <IconPaperclip size={13} title="Has attachments" />}
                                                <button
                                                    onClick={(e) => handleTrash(msg, e)}
                                                    className="hover:text-red-500 transition-colors"
                                                    title="Move to trash"
                                                >
                                                    <IconTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 3. Message Reader & Reply Viewport */}
                <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden ${
                    !selectedMessage ? 'hidden lg:flex' : 'flex'
                }`}>
                    {selectedMessage ? (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            {/* Message Actions Header */}
                            <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                    >
                                        <IconX size={18} />
                                    </button>
                                    <button
                                        onClick={() => setIsReplying(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold text-xs transition-colors cursor-pointer"
                                    >
                                        <IconArrowBackUp size={16} />
                                        <span>Reply</span>
                                    </button>
                                    <button
                                        onClick={(e) => handleToggleStar(selectedMessage, e)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        {selectedMessage.is_starred ? <IconStarFilled size={18} className="text-amber-500" /> : <IconStar size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleTrash(selectedMessage)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        <IconTrash size={18} />
                                    </button>
                                </div>

                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <IconClock size={14} />
                                    <span>{new Date(selectedMessage.received_at).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Message Content View */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Header Info */}
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                        {selectedMessage.subject || '(No Subject)'}
                                    </h2>

                                    <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                                                {selectedMessage.from_name ? selectedMessage.from_name[0].toUpperCase() : <IconUser size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                    {selectedMessage.from_name}
                                                </div>
                                                <div className="text-xs text-slate-500 font-mono">
                                                    &lt;{selectedMessage.from_email}&gt;
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right text-xs text-slate-400 font-mono">
                                            To: {selectedMessage.to_email}
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm leading-relaxed overflow-x-auto shadow-sm">
                                    {selectedMessage.body_html ? (
                                        <div
                                            dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }}
                                            className="prose dark:prose-invert max-w-none"
                                        />
                                    ) : (
                                        <pre className="whitespace-pre-wrap font-sans">
                                            {selectedMessage.body_text || selectedMessage.snippet}
                                        </pre>
                                    )}
                                </div>

                                {/* Attachments (if any) */}
                                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <IconPaperclip size={15} />
                                            <span>Attachments ({selectedMessage.attachments.length})</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMessage.attachments.map((att, idx) => (
                                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                                    <span className="truncate max-w-[200px]">{att.filename}</span>
                                                    {att.size && <span className="text-[10px] text-slate-400">({Math.round(att.size / 1024)} KB)</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Reply Box */}
                                {isReplying ? (
                                    <form onSubmit={handleSendReply} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-500/40 shadow-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                                <IconArrowBackUp size={16} /> Replying to {selectedMessage.from_email}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setIsReplying(false)}
                                                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        <textarea
                                            rows={5}
                                            placeholder="Write your official response..."
                                            value={replyBody}
                                            onChange={e => setReplyBody(e.target.value)}
                                            required
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSendingReply}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                <IconSend size={15} />
                                                <span>{isSendingReply ? 'Sending Reply...' : 'Send Reply'}</span>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div>
                                        <button
                                            onClick={() => setIsReplying(true)}
                                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer shadow-sm"
                                        >
                                            <IconArrowBackUp size={16} className="text-indigo-600" />
                                            <span>Click here to Reply to this email</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                                <IconMail size={32} />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                                No Message Selected
                            </h3>
                            <p className="text-xs max-w-sm text-slate-500">
                                Select an email from the list on the left to read its contents or reply directly.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Modal */}
            {isComposeOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                <IconSend size={18} className="text-indigo-600" />
                                <span>Compose New Email</span>
                            </div>
                            <button
                                onClick={() => setIsComposeOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <IconX size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSendCompose} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                                    To (Recipient Email)
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="student@example.com, parent@gmail.com..."
                                    value={composeTo}
                                    onChange={e => setComposeTo(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Admission Confirmation / Class Notice"
                                    value={composeSubject}
                                    onChange={e => setComposeSubject(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                                    Message
                                </label>
                                <textarea
                                    rows={8}
                                    required
                                    placeholder="Type your official message here..."
                                    value={composeBody}
                                    onChange={e => setComposeBody(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[11px] text-slate-400">
                                    Sending from <strong>info@icstconnect.in</strong>
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsComposeOpen(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSendingCompose}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <IconSend size={15} />
                                        <span>{isSendingCompose ? 'Sending...' : 'Send Message'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
