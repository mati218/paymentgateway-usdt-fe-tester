import { useState, useEffect, useRef } from 'react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { API_BASE_URL } from '../api/client'

window.Pusher = Pusher

// ── Config pulled from .env ───────────────────────────────────────────────────
const REVERB_HOST   = import.meta.env.VITE_REVERB_HOST   ?? 'api.aipay247.com'
const REVERB_PORT   = Number(import.meta.env.VITE_REVERB_PORT ?? 443)
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME ?? 'https'
const REVERB_KEY    = import.meta.env.VITE_REVERB_APP_KEY ?? 'bmr3rrg1fb2vysugfufv'

const WS_PROTO = REVERB_SCHEME === 'https' ? 'wss' : 'ws'
const WS_URL   = `${WS_PROTO}://${REVERB_HOST}:${REVERB_PORT}/app/${REVERB_KEY}`

// ── Status badge helper ───────────────────────────────────────────────────────
const STATUS_STYLE = {
  idle:         'bg-gray-500/20 text-gray-400 border-gray-500/30',
  connecting:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  connected:    'bg-green-500/20  text-green-400  border-green-500/30',
  unavailable:  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  failed:       'bg-red-500/20    text-red-400    border-red-500/30',
  error:        'bg-red-500/20    text-red-400    border-red-500/30',
  disconnected: 'bg-gray-500/20  text-gray-400   border-gray-500/30',
}

const STATUS_DOT = {
  idle:         'bg-gray-400',
  connecting:   'bg-yellow-400 animate-pulse',
  connected:    'bg-green-400',
  unavailable:  'bg-orange-400',
  failed:       'bg-red-400',
  error:        'bg-red-400',
  disconnected: 'bg-gray-400',
}

function LogLine({ entry }) {
  const color =
    entry.type === 'error'   ? 'text-red-400' :
    entry.type === 'warn'    ? 'text-yellow-400' :
    entry.type === 'success' ? 'text-green-400' :
    entry.type === 'event'   ? 'text-purple-400' :
    'text-slate-300'

  return (
    <div className={`font-mono text-xs leading-5 ${color}`}>
      <span className="text-slate-500 select-none mr-2">{entry.time}</span>
      {entry.msg}
    </div>
  )
}

export default function ReverbTest({ secretKey }) {
  const [wsStatus,   setWsStatus]   = useState('idle')
  const [socketId,   setSocketId]   = useState(null)
  const [logs,       setLogs]       = useState([])
  const [channel,    setChannel]    = useState(`deposit.1`)
  const [channelInput, setChannelInput] = useState('deposit.1')
  const [events,     setEvents]     = useState([])
  const [isPrivate,  setIsPrivate]  = useState(true)

  const echoRef    = useRef(null)
  const logsEndRef = useRef(null)

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  function addLog(msg, type = 'info') {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setLogs(prev => [...prev, { time, msg, type }])
    // Also mirror to browser console
    const fn = type === 'error' ? console.error : type === 'warn' ? console.warn : console.log
    fn(`[ReverbTest] ${msg}`)
  }

  function connect() {
    if (echoRef.current) {
      addLog('Already connected — disconnect first', 'warn')
      return
    }

    addLog(`Connecting to ${WS_URL}…`)
    setWsStatus('connecting')

    const echo = new Echo({
      broadcaster:       'reverb',
      key:               REVERB_KEY,
      wsHost:            REVERB_HOST,
      wsPort:            REVERB_PORT,
      wssPort:           REVERB_PORT,
      forceTLS:          REVERB_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint:      `${API_BASE_URL}/api/broadcasting/auth`,
      auth: {
        headers: {
          'X-SECRET-KEY': secretKey || '',
        },
      },
    })

    echoRef.current = echo
    const pusher = echo.connector?.pusher

    if (pusher) {
      pusher.connection.bind('state_change', ({ previous, current }) => {
        addLog(`State: ${previous} → ${current}`)
        setWsStatus(current)
        if (current === 'connected') {
          const sid = pusher.connection.socket_id
          setSocketId(sid)
          addLog(`✅ Connected! socket_id = ${sid}`, 'success')
        }
        if (current === 'disconnected') setSocketId(null)
      })

      pusher.connection.bind('error', err => {
        addLog(`Connection error: ${JSON.stringify(err)}`, 'error')
        setWsStatus('error')
      })
    }
  }

  function disconnect() {
    if (!echoRef.current) return
    echoRef.current.disconnect()
    echoRef.current = null
    setWsStatus('idle')
    setSocketId(null)
    setEvents([])
    addLog('Disconnected', 'warn')
  }

  function subscribe() {
    if (!echoRef.current) {
      addLog('Connect first before subscribing', 'warn')
      return
    }

    const ch = channelInput.trim()
    if (!ch) return

    setChannel(ch)
    const fullName = isPrivate ? `private-${ch}` : ch
    addLog(`Subscribing to ${fullName}…`)

    const sub = isPrivate
      ? echoRef.current.private(ch)
      : echoRef.current.channel(ch)

    sub
      .subscribed(() => {
        addLog(`📡 Subscribed to ${fullName}`, 'success')
      })
      .error(err => {
        addLog(`❌ Subscription error on ${fullName}: ${JSON.stringify(err)}`, 'error')
      })
      // Listen to ALL events via a catch-all listener
      .listenToAll((eventName, data) => {
        const entry = { time: new Date().toLocaleTimeString(), event: eventName, data }
        setEvents(prev => [entry, ...prev].slice(0, 50))
        addLog(`📨 Event "${eventName}" received`, 'event')
        console.log(`[ReverbTest] Event "${eventName}"`, data)
      })
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-lg font-bold text-content mb-1">Reverb WebSocket Tester</h1>
        <p className="text-xs text-content-3">
          Live connection diagnostics for Laravel Reverb
        </p>
      </div>

      {/* ── Config card ── */}
      <div className="bg-bg-2 border border-border rounded-xl p-4 space-y-2">
        <div className="text-xs font-bold text-content-3 uppercase tracking-widest mb-3">
          Connection Config
        </div>
        {[
          ['WS URL',       WS_URL],
          ['Host',         REVERB_HOST],
          ['Port',         REVERB_PORT],
          ['Scheme',       REVERB_SCHEME],
          ['App Key',      REVERB_KEY],
          ['Auth Endpoint',`${API_BASE_URL}/api/broadcasting/auth`],
          ['Secret Key',   secretKey ? `${secretKey.slice(0, 8)}…` : '⚠️ Not set'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-start gap-3 text-xs">
            <span className="text-content-3 w-28 flex-shrink-0">{label}</span>
            <span className={`font-mono break-all ${label === 'Secret Key' && !secretKey ? 'text-yellow-400' : 'text-content'}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Status + controls ── */}
      <div className="bg-bg-2 border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Status badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${STATUS_STYLE[wsStatus] ?? STATUS_STYLE.idle}`}>
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[wsStatus] ?? STATUS_DOT.idle}`} />
            {wsStatus.toUpperCase()}
            {socketId && <span className="font-mono font-normal opacity-70 ml-1">· {socketId}</span>}
          </div>

          {/* Connect / Disconnect */}
          <div className="flex gap-2">
            <button
              onClick={connect}
              disabled={wsStatus === 'connected' || wsStatus === 'connecting'}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/80 transition-colors cursor-pointer border-0"
            >
              Connect
            </button>
            <button
              onClick={disconnect}
              disabled={wsStatus === 'idle'}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Channel subscription */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-xs text-content-3">Private</label>
            <button
              type="button"
              onClick={() => setIsPrivate(v => !v)}
              className={`w-9 h-5 rounded-full transition-colors cursor-pointer border-0 relative ${isPrivate ? 'bg-accent' : 'bg-bg-3 border border-border'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isPrivate ? 'left-4' : 'left-0.5'}`} />
            </button>
          </div>
          <input
            type="text"
            value={channelInput}
            onChange={e => setChannelInput(e.target.value)}
            placeholder="Channel name e.g. deposit.1"
            className="flex-1 min-w-[180px] text-xs font-mono py-2 px-3 bg-bg-3 border border-border rounded-lg text-content placeholder:text-content-3 focus:outline-none focus:border-accent"
          />
          <button
            onClick={subscribe}
            disabled={wsStatus !== 'connected'}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-500/30 transition-colors cursor-pointer"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* ── Events received ── */}
      {events.length > 0 && (
        <div className="bg-bg-2 border border-border rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-content-3 uppercase tracking-widest">
            Events Received ({events.length})
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.map((e, i) => (
              <div key={i} className="bg-bg-3 border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-purple-400">{e.event}</span>
                  <span className="text-[10px] text-content-3 font-mono">{e.time}</span>
                </div>
                <pre className="text-[11px] text-content font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(e.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Connection log ── */}
      <div className="bg-bg-2 border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-content-3 uppercase tracking-widest">
            Connection Log
          </div>
          <button
            onClick={() => setLogs([])}
            className="text-[10px] text-content-3 hover:text-content transition-colors cursor-pointer border-0 bg-transparent"
          >
            Clear
          </button>
        </div>
        <div className="bg-bg-3 rounded-lg p-3 h-56 overflow-y-auto space-y-0.5">
          {logs.length === 0 && (
            <div className="text-xs text-content-3 font-mono">Waiting for events…</div>
          )}
          {logs.map((entry, i) => <LogLine key={i} entry={entry} />)}
          <div ref={logsEndRef} />
        </div>
      </div>

    </div>
  )
}
