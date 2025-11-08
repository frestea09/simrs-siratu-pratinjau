import type { NextRequest } from 'next/server'
import { eventBus } from '@/lib/realtime-event-bus'

export const runtime = 'nodejs'

export function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const onProfileCreated = (payload: any) => send('profile:created', payload)
      const onProfileUpdated = (payload: any) => send('profile:updated', payload)
      const onProfileDeleted = (payload: any) => send('profile:deleted', payload)
      const onCreated = (payload: any) => send('submittedIndicator:created', payload)
      const onUpdated = (payload: any) => send('submittedIndicator:updated', payload)
      const onDeleted = (payload: any) => send('submittedIndicator:deleted', payload)
      const onNotification = (payload: any) => send('notification:new', payload)

      eventBus.on('profile:created', onProfileCreated)
      eventBus.on('profile:updated', onProfileUpdated)
      eventBus.on('profile:deleted', onProfileDeleted)
      eventBus.on('submittedIndicator:created', onCreated)
      eventBus.on('submittedIndicator:updated', onUpdated)
      eventBus.on('submittedIndicator:deleted', onDeleted)
      eventBus.on('notification:new', onNotification)

      // Initial heartbeat to keep connection alive
      controller.enqueue(encoder.encode(': connected\n\n'))

      const close = () => {
        eventBus.off('profile:created', onProfileCreated)
        eventBus.off('profile:updated', onProfileUpdated)
        eventBus.off('profile:deleted', onProfileDeleted)
        eventBus.off('submittedIndicator:created', onCreated)
        eventBus.off('submittedIndicator:updated', onUpdated)
        eventBus.off('submittedIndicator:deleted', onDeleted)
        eventBus.off('notification:new', onNotification)
        controller.close()
      }

      req.signal.addEventListener('abort', close)
    },
    cancel() {
      // No-op; listeners are removed via abort handler
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
