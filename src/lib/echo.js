import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

/**
 * Create and return a Laravel Echo instance connected to Reverb.
 * Call .disconnect() on the returned instance when done.
 */
export function createEcho() {
  return new Echo({
    broadcaster: 'reverb',
    key: 'bmr3rrg1fb2vysugfufv',
    wsHost: '192.168.101.13',
    wsPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws'],
  })
}
