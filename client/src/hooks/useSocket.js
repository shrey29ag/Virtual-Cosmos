import { useEffect, useRef, useCallback } from 'react'
import socket from '../socket'

export function useSocket(handlers = {}) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers 

  useEffect(() => {
    if (!socket.connected) socket.connect()

    const registeredEvents = Object.keys(handlersRef.current)

    const proxyHandler = (event) => (...args) => {
      handlersRef.current[event]?.(...args)
    }

    const proxies = {}
    registeredEvents.forEach((event) => {
      proxies[event] = proxyHandler(event)
      socket.on(event, proxies[event])
    })

    return () => {
      registeredEvents.forEach((event) => {
        socket.off(event, proxies[event])
      })
    }
  }, []) 

  const emit = useCallback((event, data) => {
    socket.emit(event, data)
  }, [])

  return { emit }
}
