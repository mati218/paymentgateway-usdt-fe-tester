import { useEffect, useRef, useState } from 'react'
import { createEcho } from './echo'

/**
 * Subscribes to the private `deposit.{internalUserId}` channel and listens
 * for the `.deposit.completed` event from Laravel Reverb.
 *
 * @param {string|number|null} internalUserId  The org's internal DB user ID
 *                                              (returned as `data.user_id` in the submit response).
 *                                              Pass null/undefined to stay disconnected.
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
    // Don't connect until we have both userId and secretKey
    if (!internalUserId || !secretKey) return

    setWsStatus('connecting')
    const echo = createEcho(secretKey)
    echoRef.current = echo

    // Track Pusher connector state
    const connector = echo.connector?.pusher
    if (connector) {
      connector.connection.bind('connected',    () => setWsStatus('connected'))
      connector.connection.bind('disconnected', () => setWsStatus('idle'))
      connector.connection.bind('failed',       () => setWsStatus('error'))
      connector.connection.bind('error',        () => setWsStatus('error'))
    }

    echo
      .private(`deposit.${internalUserId}`)
      .listen('.deposit.completed', (data) => {
        // Optional reference filter — only accept events for this specific deposit
        if (reference && data.reference && data.reference !== reference) return
        setDepositEvent(data)
      })

    return () => {
      echo.disconnect()
      echoRef.current = null
      setWsStatus('idle')
    }
  }, [internalUserId, secretKey, reference])

  return { depositEvent, wsStatus }
}
