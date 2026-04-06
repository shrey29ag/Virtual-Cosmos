import { useState, useEffect, useRef, useCallback } from 'react'
import socket from '../socket'

const EMOJI_LIST = ['👋', '😄', '🎉', '❤️', '👍', '🌌', '✨', '🚀', '😂', '🤝']

function MessageBubble({ msg, myUserId }) {
  const isMe = msg.senderId === myUserId
  return (
    <div className={`flex items-end gap-2 mb-3 msg-bubble ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

      <div
        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
          ${isMe ? 'bg-cosmos-600' : 'bg-dark-600'}`}
        style={{ border: '2px solid rgba(92,124,250,0.4)' }}
      >
        {msg.senderName?.[0]?.toUpperCase() ?? '?'}
      </div>

      <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>

        <span className="text-[10px] text-slate-400 px-1">
          {isMe ? 'You' : msg.senderName}
        </span>

        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-snug break-words
            ${isMe
              ? 'bg-gradient-to-br from-cosmos-600 to-cosmos-700 text-white rounded-br-sm'
              : 'bg-dark-600 text-slate-200 rounded-bl-sm border border-white/5'
            }`}
        >
          {msg.text}
        </div>

        <span className="text-[9px] text-slate-600 px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export default function ChatPanel({ myPlayer, proximityRoom, onClose }) {
  const [messages, setMessages] = useState([])          
  const [input, setInput] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimerRef = useRef(null)
  const messagesEndRef = useRef(null)

  const historyRef = useRef(new Map())

  const roomId = proximityRoom?.roomId
  const partnerUsername = proximityRoom?.partnerUsername

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {

    const saved = roomId ? (historyRef.current.get(roomId) ?? []) : []
    setMessages(saved)
    setInput('')
    setShowEmoji(false)
  }, [roomId])

  useEffect(() => {
    const handler = (msg) => {
      if (msg.roomId !== roomId) return
      setMessages((prev) => {

        if (prev.some((m) => m.id === msg.id)) return prev
        const updated = [...prev, msg]

        historyRef.current.set(msg.roomId, updated)
        return updated
      })
    }

    socket.on('chat:message', handler)
    return () => socket.off('chat:message', handler)
  }, [roomId])

  useEffect(() => {
    const onTyping = ({ roomId: r, senderId }) => {
      if (r !== roomId || senderId === myPlayer.userId) return
      setIsTyping(true)
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000)
    }
    socket.on('chat:typing', onTyping)
    return () => socket.off('chat:typing', onTyping)
  }, [roomId, myPlayer.userId])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text || !roomId) return

    const msg = {
      id: `${myPlayer.userId}-${Date.now()}`,
      roomId,
      senderId: myPlayer.userId,
      senderName: myPlayer.username,
      text,
      timestamp: Date.now(),
    }

    socket.emit('chat:message', msg)
    setInput('')
    setShowEmoji(false)
  }, [input, roomId, myPlayer])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    } else {

      socket.emit('chat:typing', { roomId, senderId: myPlayer.userId })
    }
  }

  return (
    <div
      className="chat-panel-enter flex flex-col h-full"
      style={{
        background: 'linear-gradient(180deg, rgba(13,15,26,0.97) 0%, rgba(18,21,42,0.97) 100%)',
        backdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(92,124,250,0.2)',
      }}
    >

      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(92,124,250,0.15)' }}
      >
        <div className="flex items-center gap-3">

          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold"
              style={{
                background: 'linear-gradient(135deg, #5c7cfa, #a78bfa)',
                boxShadow: '0 0 12px rgba(92,124,250,0.6)',
              }}
            >
              {partnerUsername?.[0]?.toUpperCase() ?? '?'}
            </div>

            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-dark-900" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white leading-tight">{partnerUsername}</p>
            <p className="text-[10px] text-emerald-400 font-medium tracking-wide">● In range</p>
          </div>
        </div>

        <button
          id="chat-close-btn"
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          title="Close chat"
        >
          ✕
        </button>
      </div>

      <div className="px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <span className="cosmos-badge">Room</span>
        <code className="text-[10px] text-slate-500 font-mono truncate">
          {roomId?.split('::').map((id) => id.slice(0, 6)).join(' ↔ ')}
        </code>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60 text-center py-8">
            <div className="text-4xl">🌌</div>
            <p className="text-sm text-slate-400 font-medium">
              This is the beginning of your chat with
            </p>
            <p className="text-cosmos-400 font-semibold">@{partnerUsername}</p>
            <p className="text-xs text-slate-600">Send emojis, ideas, and more.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} myUserId={myPlayer.userId} />
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-500 text-xs px-1 py-1">
            <div className="flex gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
            {partnerUsername} is typing…
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showEmoji && (
        <div
          className="px-4 py-2 flex flex-wrap gap-2 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(92,124,250,0.1)' }}
        >
          {EMOJI_LIST.map((em) => (
            <button
              key={em}
              onClick={() => setInput((prev) => prev + em)}
              className="text-xl hover:scale-125 transition-transform"
              title={em}
            >
              {em}
            </button>
          ))}
        </div>
      )}

      <div
        className="px-3 py-3 flex items-end gap-2 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(92,124,250,0.15)' }}
      >

        <button
          id="emoji-toggle-btn"
          onClick={() => setShowEmoji((v) => !v)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all flex-shrink-0
            ${showEmoji ? 'bg-cosmos-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          style={showEmoji ? { boxShadow: '0 0 8px rgba(92,124,250,0.5)' } : {}}
          title="Emoji"
        >
          😊
        </button>

        <textarea
          id="chat-input"
          rows={1}
          className="cosmos-input flex-1 px-3 py-2 text-sm resize-none"
          style={{ maxHeight: '80px', minHeight: '36px' }}
          placeholder={`Message ${partnerUsername}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!roomId}
        />

        <button
          id="chat-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || !roomId}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: input.trim()
              ? 'linear-gradient(135deg, #5c7cfa, #a78bfa)'
              : 'rgba(255,255,255,0.05)',
            opacity: input.trim() ? 1 : 0.4,
            boxShadow: input.trim() ? '0 0 12px rgba(92,124,250,0.5)' : 'none',
          }}
          title="Send message"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
