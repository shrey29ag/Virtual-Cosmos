import { useState, useCallback, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import JoinScreen from './components/JoinScreen'
import CosmosCanvas from './components/CosmosCanvas'
import ChatPanel from './components/ChatPanel'
import HUD from './components/HUD'
import ProximityToast from './components/ProximityToast'
import socket from './socket'

export default function App() {
  const [myPlayer, setMyPlayer] = useState(null)             
  const [isJoining, setIsJoining] = useState(false)

  const [playerCount, setPlayerCount] = useState(1)

  const [proximityRoom, setProximityRoom] = useState(null)   
  const [chatHistories, setChatHistories] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})

  const prevRoomRef = useRef(null)

  const [chatOpen, setChatOpen] = useState(false)

  const [toast, setToast] = useState(null)                   
  const toastTimerRef = useRef(null)

  const handleJoin = useCallback(async (username, avatarIndex) => {
    setIsJoining(true)
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || ''
      const res = await fetch(`${serverUrl}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatarIndex }),
      })
      const data = await res.json()
      setMyPlayer({ userId: data.userId, username: data.username, avatarIndex: data.avatarIndex })
    } catch (err) {

      console.warn('[join] server unreachable, using local ID', err.message)
      setMyPlayer({ userId: uuidv4(), username, avatarIndex })
    } finally {
      setIsJoining(false)
    }
  }, [])

  useEffect(() => {
    if (!myPlayer) return

    const onSnapshot = (players) => setPlayerCount(players.length)
    const onJoined = () => setPlayerCount((c) => c + 1)
    const onLeft = () => setPlayerCount((c) => Math.max(1, c - 1))

    socket.on('players:snapshot', onSnapshot)
    socket.on('player:joined', onJoined)
    socket.on('player:left', onLeft)

    return () => {
      socket.off('players:snapshot', onSnapshot)
      socket.off('player:joined', onJoined)
      socket.off('player:left', onLeft)
    }
  }, [myPlayer])

  useEffect(() => {
    if (!myPlayer) return

    const handleChatMessage = (msg) => {
      setChatHistories((prev) => {
        const roomMsgs = prev[msg.roomId] || []
        if (roomMsgs.some((m) => m.id === msg.id)) return prev
        return {
          ...prev,
          [msg.roomId]: [...roomMsgs, msg]
        }
      })

      if (!chatOpen || !proximityRoom || proximityRoom.roomId !== msg.roomId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.roomId]: (prev[msg.roomId] || 0) + 1
        }))
      }
    }

    socket.on('chat:message', handleChatMessage)
    return () => {
      socket.off('chat:message', handleChatMessage)
    }
  }, [myPlayer, chatOpen, proximityRoom])

  useEffect(() => {
    if (chatOpen && proximityRoom) {
      setUnreadCounts((prev) => {
        if (!prev[proximityRoom.roomId]) return prev
        return {
          ...prev,
          [proximityRoom.roomId]: 0
        }
      })
    }
  }, [chatOpen, proximityRoom])

  const handleProximityChange = useCallback((roomId, partnerUsername, partnerUserId) => {
    if (roomId) {

      if (prevRoomRef.current?.roomId !== roomId) {

        setProximityRoom({ roomId, partnerUsername, partnerUserId })
        prevRoomRef.current = { roomId }

        clearTimeout(toastTimerRef.current)
        setToast({ partnerUsername })
        toastTimerRef.current = setTimeout(() => setToast(null), 4000)
      }
    } else {
      if (prevRoomRef.current?.roomId) {
        const oldRoomId = prevRoomRef.current.roomId
        setUnreadCounts((prev) => {
          if (!prev[oldRoomId]) return prev
          return {
            ...prev,
            [oldRoomId]: 0
          }
        })
      }
      setProximityRoom(null)
      setChatOpen(false)
      prevRoomRef.current = null
      setToast(null)
    }
  }, [])

  if (!myPlayer) {
    return <JoinScreen onJoin={handleJoin} isLoading={isJoining} />
  }

  return (
    <div className="relative w-full h-full flex overflow-hidden" style={{ background: '#0d0f1a' }}>

      <div
        className="relative flex-1 overflow-hidden transition-all duration-300"
        style={{ width: chatOpen ? 'calc(100% - 340px)' : '100%' }}
      >
        <CosmosCanvas
          myPlayer={myPlayer}
          onProximityChange={handleProximityChange}
        />

        <HUD
          myPlayer={myPlayer}
          playerCount={playerCount}
          proximityRoom={proximityRoom}
          unreadCount={proximityRoom ? (unreadCounts[proximityRoom.roomId] || 0) : 0}
          onOpenChat={() => setChatOpen(true)}
        />

        {toast && (
          <div className="absolute bottom-16 left-5 z-20">
            <ProximityToast
              partnerUsername={toast.partnerUsername}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {!proximityRoom && chatOpen === false && prevRoomRef.current && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20">
            <div
              className="glass-card px-4 py-2 text-xs text-slate-400 flex items-center gap-2 toast-enter"
            >
              <span>📡</span> You moved out of range. Chat closed.
            </div>
          </div>
        )}
      </div>

      {chatOpen && proximityRoom && (
        <div
          className="flex-shrink-0 h-full overflow-hidden"
          style={{ width: '340px' }}
        >
          <ChatPanel
            myPlayer={myPlayer}
            proximityRoom={proximityRoom}
            messages={proximityRoom ? (chatHistories[proximityRoom.roomId] || []) : []}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
