
export default function HUD({ myPlayer, playerCount, proximityRoom, onOpenChat }) {
  return (
    <>

      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3 z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(13,15,26,0.9) 0%, transparent 100%)',
        }}
      >

        <div className="flex items-center gap-2">
          <span className="text-xl">🌌</span>
          <h1 className="text-base font-bold tracking-tight text-white">
            Virtual <span className="text-cosmos-400">Cosmos</span>
          </h1>
          <span className="cosmos-badge hidden sm:inline">Beta</span>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card"
          style={{ border: '1px solid rgba(92,124,250,0.2)' }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            {playerCount} {playerCount === 1 ? 'Explorer' : 'Explorers'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #5c7cfa, #a78bfa)' }}
          >
            {myPlayer?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-medium text-slate-300 hidden sm:inline">
            {myPlayer?.username}
          </span>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-3 z-10"
        style={{
          background: 'linear-gradient(0deg, rgba(13,15,26,0.92) 0%, transparent 100%)',
        }}
      >

        <div className="flex items-center gap-1.5">
          {['W', 'A', 'S', 'D'].map((k) => (
            <kbd
              key={k}
              className="w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center text-slate-400"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {k}
            </kbd>
          ))}
          <span className="text-[10px] text-slate-600 ml-1">to move</span>
        </div>

        {proximityRoom ? (
          <button
            id="open-chat-btn"
            onClick={onOpenChat}
            className="btn-cosmos flex items-center gap-2 px-4 py-2 text-sm"
          >
            <span>💬</span>
            <span>Chat with @{proximityRoom.partnerUsername}</span>
          </button>
        ) : (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-500"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span>📡</span> Move near another explorer to connect
          </div>
        )}

        <div className="text-[10px] text-slate-600 hidden sm:flex items-center gap-1">
          <span>🎯</span> Radius: 150px
        </div>
      </div>
    </>
  )
}
