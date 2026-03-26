/**
 * DataSphere Innovation - Email Tracking API
 * Tracks email opens and clicks
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ==========================================
// Types
// ==========================================

interface EmailTrackingEvent {
  id: string
  trackingId: string
  eventType: 'open' | 'click'
  timestamp: Date
  userAgent?: string
  ipAddress?: string
  location?: {
    country?: string
    city?: string
  }
  emailId?: string
  linkUrl?: string
}

// In-memory tracking store (use database in production)
const trackingStore: Map<string, EmailTrackingEvent[]> = new Map()

// ==========================================
// Helper Functions
// ==========================================

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function getClientInfo(request: NextRequest): Promise<{
  ipAddress?: string
  userAgent?: string
}> {
  const forwarded = request.headers.get('x-forwarded-for')
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 
                    request.headers.get('x-real-ip') || undefined
  const userAgent = request.headers.get('user-agent') || undefined

  return { ipAddress, userAgent }
}

// ==========================================
// GET Handler - Track Email Open
// ==========================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const trackingId = searchParams.get('id')
  const eventType = searchParams.get('type') as 'open' | 'click' || 'open'
  const linkUrl = searchParams.get('url')

  if (!trackingId) {
    // Return 1x1 transparent pixel even on error
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }

  try {
    // Get client info
    const clientInfo = await getClientInfo(request)

    // Create tracking event
    const event: EmailTrackingEvent = {
      id: generateEventId(),
      trackingId,
      eventType,
      timestamp: new Date(),
      userAgent: clientInfo.userAgent,
      ipAddress: clientInfo.ipAddress,
      linkUrl: linkUrl ? decodeURIComponent(linkUrl) : undefined
    }

    // Store event
    const existingEvents = trackingStore.get(trackingId) || []
    existingEvents.push(event)
    trackingStore.set(trackingId, existingEvents)

    // Log for debugging
    console.log(`[Email Tracking] ${eventType.toUpperCase()}: ${trackingId} at ${event.timestamp.toISOString()}`)

    // Try to persist to database (if tracking table exists)
    try {
      await persistTrackingEvent(event)
    } catch (dbError) {
      // Silently fail - tracking store already has the data
      console.debug('Could not persist tracking event to database:', dbError)
    }

    // If this is a click event with a URL, redirect
    if (eventType === 'click' && linkUrl) {
      return NextResponse.redirect(decodeURIComponent(linkUrl))
    }

    // Return 1x1 transparent pixel for open tracking
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('Email tracking error:', error)
    
    // Still return the pixel on error
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    )
  }
}

// ==========================================
// POST Handler - Get Tracking Stats
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingId, emailId } = body

    // API key validation
    const apiKey = request.headers.get('x-api-key') || 
                   request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (process.env.EMAIL_API_KEY && apiKey !== process.env.EMAIL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (trackingId) {
      const events = trackingStore.get(trackingId) || []
      
      return NextResponse.json({
        success: true,
        trackingId,
        stats: {
          opens: events.filter(e => e.eventType === 'open').length,
          clicks: events.filter(e => e.eventType === 'click').length,
          firstOpen: events.find(e => e.eventType === 'open')?.timestamp,
          lastOpen: [...events].reverse().find(e => e.eventType === 'open')?.timestamp,
          events: events.map(e => ({
            type: e.eventType,
            timestamp: e.timestamp,
            linkUrl: e.linkUrl
          }))
        }
      })
    }

    if (emailId) {
      // Find all tracking events for this email
      const allEvents: EmailTrackingEvent[] = []
      
      for (const [_, events] of trackingStore.entries()) {
        const emailEvents = events.filter(e => e.trackingId.startsWith(emailId))
        allEvents.push(...emailEvents)
      }

      return NextResponse.json({
        success: true,
        emailId,
        stats: {
          totalOpens: allEvents.filter(e => e.eventType === 'open').length,
          totalClicks: allEvents.filter(e => e.eventType === 'click').length,
          uniqueOpens: new Set(allEvents.filter(e => e.eventType === 'open').map(e => e.ipAddress)).size,
          events: allEvents
        }
      })
    }

    // Return all tracking stats
    const stats = {
      totalTrackingIds: trackingStore.size,
      totalEvents: Array.from(trackingStore.values()).flat().length,
      opens: 0,
      clicks: 0
    }

    for (const events of trackingStore.values()) {
      stats.opens += events.filter(e => e.eventType === 'open').length
      stats.clicks += events.filter(e => e.eventType === 'click').length
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Email tracking stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get tracking stats' },
      { status: 500 }
    )
  }
}

// ==========================================
// Database Persistence
// ==========================================

async function persistTrackingEvent(event: EmailTrackingEvent): Promise<void> {
  // This would normally persist to a database table
  // For now, we just store in memory and log
  // 
  // Example Prisma schema:
  // model EmailTracking {
  //   id          String   @id @default(cuid())
  //   trackingId  String
  //   eventType   String
  //   timestamp   DateTime @default(now())
  //   userAgent   String?
  //   ipAddress   String?
  //   linkUrl     String?
  //   emailId     String?
  //   
  //   @@index([trackingId])
  //   @@index([emailId])
  // }
  
  // Placeholder for database persistence
  // await db.emailTracking.create({
  //   data: {
  //     trackingId: event.trackingId,
  //     eventType: event.eventType,
  //     timestamp: event.timestamp,
  //     userAgent: event.userAgent,
  //     ipAddress: event.ipAddress,
  //     linkUrl: event.linkUrl
  //   }
  // })
}

// ==========================================
// Export tracking store for testing
// ==========================================

export function getTrackingStore(): Map<string, EmailTrackingEvent[]> {
  return trackingStore
}

export function clearTrackingStore(): void {
  trackingStore.clear()
}
