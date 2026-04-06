import { useEffect, useRef, useCallback } from 'react'
import * as PIXI from 'pixi.js'

const PROXIMITY_RADIUS = 150
const MOVE_SPEED = 3
const AVATAR_SIZE = 48
const LERP_FACTOR = 0.12 

const AVATAR_PALETTES = [
  { body: 0x4fc3f7, face: 0xffe0b2, hair: 0x333333, shirt: 0x26c6da },
  { body: 0xf48fb1, face: 0xffe0b2, hair: 0x795548, shirt: 0xe91e63 },
  { body: 0xa5d6a7, face: 0xffccbc, hair: 0x212121, shirt: 0x43a047 },
  { body: 0xce93d8, face: 0xffe0b2, hair: 0x4e342e, shirt: 0x9c27b0 },
  { body: 0xffcc80, face: 0xffccbc, hair: 0x3e2723, shirt: 0xff9800 },
  { body: 0xef9a9a, face: 0xffe0b2, hair: 0x1a237e, shirt: 0xf44336 },
]

function drawAvatar(gfx, palette, isMe = false) {
  gfx.clear()

  const { body, face, hair, shirt } = palette

  gfx.beginFill(0x000000, 0.2)
  gfx.drawEllipse(0, AVATAR_SIZE / 2 + 4, AVATAR_SIZE / 2 - 2, 5)
  gfx.endFill()

  gfx.beginFill(shirt)
  gfx.drawRoundedRect(-AVATAR_SIZE / 2 + 4, 4, AVATAR_SIZE - 8, AVATAR_SIZE / 2 + 4, 6)
  gfx.endFill()

  gfx.beginFill(body)
  gfx.drawRoundedRect(-AVATAR_SIZE / 2 + 8, AVATAR_SIZE / 2 + 2, 12, 12, 4)
  gfx.drawRoundedRect(AVATAR_SIZE / 2 - 20, AVATAR_SIZE / 2 + 2, 12, 12, 4)
  gfx.endFill()

  gfx.beginFill(face)
  gfx.drawCircle(0, -AVATAR_SIZE / 2 + 6, AVATAR_SIZE / 2 - 6)
  gfx.endFill()

  gfx.beginFill(hair)
  gfx.drawRoundedRect(-(AVATAR_SIZE / 2 - 6), -AVATAR_SIZE + 4, AVATAR_SIZE - 12, 14, 6)
  gfx.endFill()

  gfx.beginFill(0xffffff)
  gfx.drawCircle(-7, -AVATAR_SIZE / 2 + 4, 5)
  gfx.drawCircle(7, -AVATAR_SIZE / 2 + 4, 5)
  gfx.endFill()
  gfx.beginFill(0x222222)
  gfx.drawCircle(-7, -AVATAR_SIZE / 2 + 5, 2.5)
  gfx.drawCircle(7, -AVATAR_SIZE / 2 + 5, 2.5)
  gfx.endFill()

  gfx.lineStyle(2, 0x555555, 1)
  gfx.arc(0, -AVATAR_SIZE / 2 + 10, 6, 0.2, Math.PI - 0.2)
  gfx.lineStyle(0)

  if (isMe) {
    gfx.lineStyle(3, 0x5c7cfa, 1)
    gfx.drawCircle(0, 0, AVATAR_SIZE / 2 + 4)
    gfx.lineStyle(0)
  }
}

function drawProximityRing(gfx, active) {
  gfx.clear()
  if (active) {
    gfx.lineStyle(2, 0x5c7cfa, 0.5)
    gfx.drawCircle(0, 0, PROXIMITY_RADIUS)
    gfx.lineStyle(0)
    gfx.beginFill(0x5c7cfa, 0.06)
    gfx.drawCircle(0, 0, PROXIMITY_RADIUS)
    gfx.endFill()
  }
}

function drawNameLabel(container, username, isMe) {

  const old = container.getChildByName('nameLabel')
  if (old) container.removeChild(old)

  const label = new PIXI.Text(username + (isMe ? ' (You)' : ''), {
    fontFamily: 'Inter, sans-serif',
    fontSize: 11,
    fontWeight: '600',
    fill: isMe ? 0xa5b4fc : 0xe2e8f0,
    align: 'center',
    dropShadow: true,
    dropShadowAlpha: 0.7,
    dropShadowBlur: 4,
    dropShadowDistance: 1,
    dropShadowColor: 0x000000,
  })
  label.name = 'nameLabel'
  label.anchor.set(0.5, 0)
  label.position.set(0, AVATAR_SIZE / 2 + 10)
  container.addChild(label)
}

function drawBackground() {
  const bg = new PIXI.Graphics()

  const W = 4000
  const H = 4000

  bg.beginFill(0x0d0f1a)
  bg.drawRect(0, 0, W, H)
  bg.endFill()

  const tileColors = [0x1a1f2e, 0x161b2e]
  const tileW = 120
  const tileH = 100
  for (let row = 0; row < Math.ceil(H / tileH) + 1; row++) {
    for (let col = 0; col < Math.ceil(W / tileW) + 1; col++) {
      const c = (row + col) % 2 === 0 ? tileColors[0] : tileColors[1]
      bg.beginFill(c, 0.5)
      bg.drawRect(col * tileW, row * tileH, tileW, tileH)
      bg.endFill()
    }
  }

  const nebulaGfx = new PIXI.Graphics()
  nebulaGfx.beginFill(0x5c7cfa, 0.04)
  nebulaGfx.drawEllipse(W * 0.7, H * 0.3, 300, 200)
  nebulaGfx.endFill()
  nebulaGfx.beginFill(0xa78bfa, 0.03)
  nebulaGfx.drawEllipse(W * 0.2, H * 0.7, 250, 180)
  nebulaGfx.endFill()

  const grid = new PIXI.Graphics()
  grid.lineStyle(1, 0x1e2440, 0.8)
  for (let x = 0; x < W; x += tileW) {
    grid.moveTo(x, 0)
    grid.lineTo(x, H)
  }
  for (let y = 0; y < H; y += tileH) {
    grid.moveTo(0, y)
    grid.lineTo(W, y)
  }

  return [bg, nebulaGfx, grid]
}

export default function CosmosCanvas({ myPlayer, onProximityChange }) {
  const containerRef = useRef(null)
  const appRef = useRef(null)

  const playerSpritesRef = useRef({}) 
  const myPosRef = useRef({ x: 400, y: 300 })
  const targetPosRef = useRef({}) 

  const keysRef = useRef({})

  const clickTargetRef = useRef(null)

  const rippleRef = useRef(null)

  const proximityRef = useRef(null) 

  const socketRef = useRef(null)

  const createPlayerSprite = useCallback((userId, username, avatarIndex = 0, isMe = false) => {
    const app = appRef.current
    if (!app) return null

    const palette = AVATAR_PALETTES[avatarIndex % AVATAR_PALETTES.length]
    const container = new PIXI.Container()
    container.sortableChildren = true

    const ring = new PIXI.Graphics()
    ring.zIndex = 0
    container.addChild(ring)

    const avatarGfx = new PIXI.Graphics()
    avatarGfx.zIndex = 1
    drawAvatar(avatarGfx, palette, isMe)
    container.addChild(avatarGfx)

    drawNameLabel(container, username, isMe)

    container.interactive = true
    container.buttonMode = true

    app.stage.addChild(container)

    const entry = { container, avatar: avatarGfx, ring, palette, username, isMe }
    playerSpritesRef.current[userId] = entry
    return entry
  }, [])

  const removePlayerSprite = useCallback((userId) => {
    const entry = playerSpritesRef.current[userId]
    if (!entry) return
    appRef.current?.stage?.removeChild(entry.container)
    entry.container.destroy({ children: true })
    delete playerSpritesRef.current[userId]
  }, [])

  useEffect(() => {
    if (!containerRef.current || !myPlayer) return

    const app = new PIXI.Application({
      resizeTo: containerRef.current,
      backgroundColor: 0x0d0f1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })
    appRef.current = app
    containerRef.current.appendChild(app.view)

    const [bg, nebula, grid] = drawBackground()
    app.stage.addChild(bg, nebula, grid)

    const { x: startX, y: startY } = myPosRef.current
    const myEntry = createPlayerSprite(myPlayer.userId, myPlayer.username, myPlayer.avatarIndex, true)
    if (myEntry) {
      myEntry.container.position.set(startX, startY)
    }

    const ripple = new PIXI.Graphics()
    ripple.zIndex = 5
    ripple.alpha = 0
    app.stage.addChild(ripple)
    rippleRef.current = ripple

    let rippleProgress = 0  
    let rippleX = 0
    let rippleY = 0

    const onCanvasPointerDown = (e) => {

      if (e.target !== app.view) return
      if (e.button !== undefined && e.button !== 0) return 

      const rect = app.view.getBoundingClientRect()

      const scaleX = app.screen.width / rect.width
      const scaleY = app.screen.height / rect.height
      const cx = (e.clientX - rect.left) * scaleX
      const cy = (e.clientY - rect.top) * scaleY

      const hw = AVATAR_SIZE
      const hh = AVATAR_SIZE
      const tx = Math.max(hw, Math.min(app.screen.width - hw, cx))
      const ty = Math.max(hh, Math.min(app.screen.height - hh, cy))

      clickTargetRef.current = { x: tx, y: ty }

      rippleX = tx
      rippleY = ty
      rippleProgress = 0
      ripple.alpha = 1
    }

    window.addEventListener('pointerdown', onCanvasPointerDown)

    const isTypingInInput = () => {
      const tag = document.activeElement?.tagName?.toLowerCase()
      return tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable
    }

    const onKeyDown = (e) => {
      if (isTypingInInput()) return
      keysRef.current[e.key] = true
    }
    const onKeyUp = (e) => {

      keysRef.current[e.key] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let frameCount = 0
    app.ticker.add(() => {
      frameCount++
      const keys = keysRef.current
      let { x, y } = myPosRef.current
      let moved = false

      const anyKey = keys['w'] || keys['W'] || keys['ArrowUp']
                  || keys['s'] || keys['S'] || keys['ArrowDown']
                  || keys['a'] || keys['A'] || keys['ArrowLeft']
                  || keys['d'] || keys['D'] || keys['ArrowRight']
      if (anyKey) {

        clickTargetRef.current = null
        if (keys['w'] || keys['W'] || keys['ArrowUp'])    y -= MOVE_SPEED
        if (keys['s'] || keys['S'] || keys['ArrowDown'])  y += MOVE_SPEED
        if (keys['a'] || keys['A'] || keys['ArrowLeft'])  x -= MOVE_SPEED
        if (keys['d'] || keys['D'] || keys['ArrowRight']) x += MOVE_SPEED
        moved = true
      }

      if (!moved && clickTargetRef.current) {
        const dx = clickTargetRef.current.x - x
        const dy = clickTargetRef.current.y - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= MOVE_SPEED + 0.5) {

          x = clickTargetRef.current.x
          y = clickTargetRef.current.y
          clickTargetRef.current = null
        } else {

          x += (dx / dist) * MOVE_SPEED
          y += (dy / dist) * MOVE_SPEED
        }
        moved = true
      }

      if (ripple.alpha > 0) {
        rippleProgress = Math.min(1, rippleProgress + 0.04) 
        ripple.clear()
        const radius = 6 + rippleProgress * 28
        const alpha = (1 - rippleProgress) * 0.8

        ripple.lineStyle(2, 0x5c7cfa, alpha)
        ripple.drawCircle(rippleX, rippleY, radius)
        ripple.lineStyle(0)

        ripple.beginFill(0x748ffc, alpha * 0.15)
        ripple.drawCircle(rippleX, rippleY, radius * 0.6)
        ripple.endFill()

        ripple.beginFill(0xa5b4fc, alpha * 0.9)
        ripple.drawCircle(rippleX, rippleY, 3)
        ripple.endFill()
        if (rippleProgress >= 1) ripple.alpha = 0
      }

      const hw = AVATAR_SIZE
      const hh = AVATAR_SIZE
      x = Math.max(hw, Math.min(app.screen.width - hw, x))
      y = Math.max(hh, Math.min(app.screen.height - hh, y))

      if (moved) {
        myPosRef.current = { x, y }
        const mySprite = playerSpritesRef.current[myPlayer.userId]
        if (mySprite) mySprite.container.position.set(x, y)

        if (frameCount % 2 === 0 && socketRef.current) {
          socketRef.current.emit('player:move', { userId: myPlayer.userId, x, y })
        }

        checkProximityLocally(x, y)
      }

      Object.entries(targetPosRef.current).forEach(([uid, target]) => {
        const sprite = playerSpritesRef.current[uid]
        if (!sprite) return
        const pos = sprite.container.position
        pos.x += (target.x - pos.x) * LERP_FACTOR
        pos.y += (target.y - pos.y) * LERP_FACTOR
      })
    })

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointerdown', onCanvasPointerDown)
      Object.keys(playerSpritesRef.current).forEach(removePlayerSprite)
      app.destroy(true, { children: true })
      appRef.current = null
      rippleRef.current = null
    }
  }, [myPlayer]) 

  const checkProximityLocally = useCallback((myX, myY) => {
    let closestDist = Infinity
    let closestId = null
    let closestName = null

    Object.entries(playerSpritesRef.current).forEach(([uid, entry]) => {
      if (uid === myPlayer?.userId) return
      const pos = entry.container.position
      const dist = Math.sqrt(Math.pow(pos.x - myX, 2) + Math.pow(pos.y - myY, 2))

      drawProximityRing(entry.ring, dist < PROXIMITY_RADIUS)

      if (dist < PROXIMITY_RADIUS && dist < closestDist) {
        closestDist = dist
        closestId = uid
        closestName = entry.username
      }
    })

    const mySprite = playerSpritesRef.current[myPlayer?.userId]
    if (mySprite) drawProximityRing(mySprite.ring, closestId !== null)

    const prev = proximityRef.current
    if (closestId) {
      const rid = [myPlayer.userId, closestId].sort().join('::')
      if (!prev || prev.partnerId !== closestId) {
        proximityRef.current = { roomId: rid, partnerId: closestId, partnerUsername: closestName }
        onProximityChange?.(rid, closestName, closestId)
      }
    } else {
      if (prev) {
        proximityRef.current = null
        onProximityChange?.(null, null, null)
      }
    }
  }, [myPlayer, onProximityChange])

  useEffect(() => {
    if (!myPlayer) return

    import('../socket').then(({ default: sock }) => {
      socketRef.current = sock

      if (!sock.connected) sock.connect()

      sock.emit('player:join', {
        userId: myPlayer.userId,
        username: myPlayer.username,
        avatarIndex: myPlayer.avatarIndex,
        ...myPosRef.current,
      })

      sock.on('players:snapshot', (allPlayers) => {
        allPlayers.forEach((p) => {
          if (p.userId === myPlayer.userId) return
          if (!playerSpritesRef.current[p.userId]) {
            const entry = createPlayerSprite(p.userId, p.username, p.avatarIndex, false)
            if (entry) {
              entry.container.position.set(p.x, p.y)
              targetPosRef.current[p.userId] = { x: p.x, y: p.y }
            }
          }
        })
      })

      sock.on('player:joined', (p) => {
        if (p.userId === myPlayer.userId) return
        if (!playerSpritesRef.current[p.userId]) {
          const entry = createPlayerSprite(p.userId, p.username, p.avatarIndex, false)
          if (entry) {
            entry.container.position.set(p.x, p.y)
            targetPosRef.current[p.userId] = { x: p.x, y: p.y }
          }
        }
      })

      sock.on('player:moved', ({ userId, x, y }) => {
        if (userId === myPlayer.userId) return
        targetPosRef.current[userId] = { x, y }

        const sprite = playerSpritesRef.current[userId]
        if (sprite) {

          checkProximityLocally(myPosRef.current.x, myPosRef.current.y)
        }
      })

      sock.on('player:left', ({ userId }) => {
        removePlayerSprite(userId)
        delete targetPosRef.current[userId]
        if (proximityRef.current?.partnerId === userId) {
          proximityRef.current = null
          onProximityChange?.(null, null, null)
        }
      })
    })

    return () => {
      import('../socket').then(({ default: sock }) => {
        sock.off('players:snapshot')
        sock.off('player:joined')
        sock.off('player:moved')
        sock.off('player:left')
      })
    }
  }, [myPlayer, createPlayerSprite, removePlayerSprite, checkProximityLocally, onProximityChange])

  return (
    <div
      id="cosmos-canvas-container"
      ref={containerRef}
      className="w-full h-full"
      style={{ cursor: 'crosshair' }}
      tabIndex={0}
      onFocus={() => containerRef.current?.focus()}
    />
  )
}
