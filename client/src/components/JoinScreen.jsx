import { useState } from 'react'

const AVATAR_COLORS = [
  'from-sky-400 to-cyan-400',
  'from-pink-400 to-rose-400',
  'from-green-400 to-emerald-400',
  'from-purple-400 to-violet-400',
  'from-amber-400 to-orange-400',
  'from-red-400 to-rose-500',
]

const AVATAR_EMOJIS = ['🧑‍🚀', '👩‍🎤', '🦸', '🧝', '🤖', '👾']

export default function JoinScreen({ onJoin, isLoading }) {
  const [username, setUsername] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = username.trim()
    if (!name) return
    onJoin(name, avatarIndex)
  }

  return (
    <div className="w-full h-full flex items-center justify-center stars-bg relative overflow-hidden">

      <div
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #5c7cfa 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }}
      />

      <div
        className="relative glass-card p-8 w-full max-w-sm mx-4 flex flex-col gap-6"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(92,124,250,0.1)' }}
      >

        <div className="text-center">
          <div className="text-5xl mb-3 animate-float">🌌</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Virtual <span className="text-cosmos-400">Cosmos</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            A 2D world where proximity creates connection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label htmlFor="username-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Your Name
            </label>
            <input
              id="username-input"
              type="text"
              autoFocus
              autoComplete="off"
              maxLength={20}
              className="cosmos-input px-4 py-3 w-full text-sm"
              placeholder="Enter your explorer name…"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Choose Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_EMOJIS.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`avatar-btn-${idx}`}
                  onClick={() => setAvatarIndex(idx)}
                  className="relative aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-200"
                  style={{
                    background:
                      avatarIndex === idx
                        ? 'linear-gradient(135deg, rgba(92,124,250,0.3), rgba(167,139,250,0.3))'
                        : 'rgba(255,255,255,0.04)',
                    border:
                      avatarIndex === idx
                        ? '2px solid rgba(92,124,250,0.7)'
                        : '2px solid rgba(255,255,255,0.06)',
                    boxShadow: avatarIndex === idx ? '0 0 12px rgba(92,124,250,0.4)' : 'none',
                    transform: avatarIndex === idx ? 'scale(1.1)' : 'scale(1)',
                  }}
                  title={`Avatar ${idx + 1}`}
                >
                  {emoji}
                  {avatarIndex === idx && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cosmos-400 border border-dark-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(92,124,250,0.06)', border: '1px solid rgba(92,124,250,0.15)' }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${AVATAR_COLORS[avatarIndex]}`}
            >
              {AVATAR_EMOJIS[avatarIndex]}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{username || 'Explorer'}</p>
              <p className="text-[10px] text-slate-500">Ready to join the Cosmos</p>
            </div>
          </div>

          <button
            id="join-btn"
            type="submit"
            disabled={!username.trim() || isLoading}
            className="btn-cosmos w-full py-3 text-sm"
            style={{ opacity: !username.trim() || isLoading ? 0.5 : 1 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Entering…
              </span>
            ) : (
              '🚀 Enter the Cosmos'
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-600">
          Use <kbd className="bg-dark-600 px-1 rounded text-slate-400">WASD</kbd> or Arrow keys to move.
          Get within <strong className="text-slate-400">150px</strong> of someone to chat.
        </p>
      </div>
    </div>
  )
}
