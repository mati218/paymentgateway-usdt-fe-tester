import { useEffect, useRef, useState } from 'react'
import { createEcho } from './echo'

/**
 * Subscribes to the private `deposit.{userId}` channel and listens for
 * the `.deposit.completed` event.
 *
 * @param {string|number|null} userId  - Start listening when truthy.
 * @param {string|null}        reference - Only accept events matching this reference.
 * @returns {{ depositEvent: object|null, wsStatus: 'idle'|'connecting'|'connected'|'error' }}
 */
export function useDepositEcho(userId, reference) {
  const echoRef = useRef(null)
  const [depositEvent, setDepositEvent] = useState(null)
  const [wsStatus, setWsStatus]         = useState('idle')

  useEffect(() => {
    // Don't connect until we have a userId (i.e. after submit)
    if (!userId) return

    setWsStatus('connecting')
    const echo = createEcho()
    echoRef.current = echo

    // Track connector state
    const connector = echo.connector?.pusher
    if (connector) {
      connector.connection.bind('connected',    () => setWsStatus('connected'))
      connector.connection.bind('disconnected', () => setWsStatus('idle'))
      connector.connection.bind('failed',       () => setWsStatus('error'))
      connector.connection.bind('error',        () => setWsStatus('error'))
    }

    echo
      .private(`deposit.${userId}`)
      .listen('.deposit.completed', (data) => {
        // If a reference filter is provided, only accept matching events
        if (reference && data.reference && data.reference !== reference) return
        setDepositEvent(data)
      })

    return () => {
      echo.disconnect()
      echoRef.current = null
      setWsStatus('idle')
    }
  }, [userId, reference])

  return { depositEvent, wsStatus }
}
