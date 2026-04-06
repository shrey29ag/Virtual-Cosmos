
export default function ProximityToast({ partnerUsername, onClose }) {
  return (
    <div
      id="proximity-toast"
      className="toast-enter flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(22,27,60,0.95), rgba(30,36,80,0.95))',
        border: '1px solid rgba(92,124,250,0.4)',
        boxShadow: '0 8px 40px rgba(92,124,250,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        maxWidth: '280px',
      }}
    >

      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-cosmos-600 flex items-center justify-center text-lg">
          🤝
        </div>
        <span
          className="absolute inset-0 rounded-full proximity-ring"
          style={{ border: '2px solid rgba(92,124,250,0.6)' }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-widest text-cosmos-400 font-semibold mb-0.5">
          Connection Detected
        </p>
        <p className="text-sm text-white font-semibold truncate">
          You're near <span className="text-cosmos-300">@{partnerUsername}</span>
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">Chat is now available ✨</p>
      </div>

      <button
        onClick={onClose}
        className="text-slate-500 hover:text-white transition-colors flex-shrink-0 text-xs"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
