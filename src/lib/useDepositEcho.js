import { useEffect, useRef, useState } from 'react'
import { createEcho } from './echo'

/**
 * Subscribes to the private `deposit.{internalUserId}` channel and listens
 * for the `.deposit.completed` event from Laravel Reverb.
 *
 * @param {string|number|null} internalUserId  The org's internal DB user ID.
 * @param {string}             secretKey        X-SECRET-KEY for private channel auth.
 * @param {string|null}        reference        Optional: only accept events matching this reference.
 *
 * @returns {{ depositEvent: object|null, wsStatus: 'idle'|'connecting'|'connected'|'error' }}
 */
export function useDepositEcho(internalUserId, secretKey, reference) {
  const echoRef = useRef(null)
  const [depositEvent, setDepositEvent] = useState(null)
  const [wsStatus, setWsStatus]         = useState('idle')

  useEffect(() => {
    if (!internalUserId || !secretKey) {
      console.log('[useDepositEcho] Skipping — missing userId or secretKey')
      return
    }

    const channelName = `deposit.${internalUserId}`
    console.log('[useDepositEcho] 🔌 Initialising Echo for channel:', `private-${channelName}`)

    setWsStatus('connecting')
    const echo = createEcho(secretKey)
    echoRef.current = echo

    // Track Pusher connector state
    const connector = echo.connector?.pusher
    if (connector) {
      connector.connection.bind('connected',    () => {
        console.log('[useDepositEcho] ✅ WS connected, socket_id:', connector.connection.socket_id)
        setWsStatus('connected')
      })
      connector.connection.bind('disconnected', () => {
        console.warn('[useDepositEcho] ⚠️ WS disconnected')
        setWsStatus('idle')
      })
      connector.connection.bind('failed',       () => {
        console.error('[useDepositEcho] ❌ WS connection failed')
        setWsStatus('error')
      })
      connector.connection.bind('error',        (err) => {
        console.error('[useDepositEcho] ❌ WS error', err)
        setWsStatus('error')
      })
    }

    const channel = echo.private(channelName)

    channel
      .subscribed(() => {
        console.log('[useDepositEcho] 📡 Subscribed to channel:', `private-${channelName}`)
      })
      .error((err) => {
        console.error('[useDepositEcho] ❌ Channel subscription error:', err)
        setWsStatus('error')
      })
      .listen('.deposit.completed', (data) => {
        console.log('[useDepositEcho] 📨 deposit.completed event received:', data)

        // Optional reference filter — only accept events for this specific deposit
        if (reference && data.reference && data.reference !== reference) {
          console.log('[useDepositEcho] Ignored — reference mismatch:', data.reference, '≠', reference)
          return
        }

        setDepositEvent(data)
      })

    return () => {
      console.log('[useDepositEcho] 🔌 Disconnecting Echo')
      echo.disconnect()
      echoRef.current = null
      setWsStatus('idle')
    }
  }, [internalUserId, secretKey, reference])

  return { depositEvent, wsStatus }
}
