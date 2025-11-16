import { NextResponse } from 'next/server'
import { addNotification, listNotifications } from '@/lib/notification-memory-store'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const unit = searchParams.get('unit')

  try {
    const notifications = listNotifications({ role, unit })
    return NextResponse.json(notifications)
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to load notifications' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body?.title || !body?.description) {
      return NextResponse.json(
        { error: 'title and description are required' },
        { status: 400 }
      )
    }

    const created = addNotification({
      title: body.title,
      description: body.description,
      link: body.link,
      recipientRole: body.recipientRole ?? undefined,
      recipientUnit: body.recipientUnit ?? undefined,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create notification' },
      { status: 500 }
    )
  }
}
