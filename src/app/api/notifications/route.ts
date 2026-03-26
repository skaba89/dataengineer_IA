// AI Data Engineering System - API: Notifications

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Notification types
export type NotificationType = 
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'agent_completed'
  | 'agent_failed'
  | 'artifact_generated'
  | 'project_created'
  | 'system_alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// In-memory notifications store (in production, use Redis or database)
const notificationsStore: Notification[] = [];

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, projectId, metadata } = body;

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      projectId,
      metadata,
      read: false,
      createdAt: new Date(),
    };

    notificationsStore.unshift(notification);

    // Keep only last 100 notifications
    if (notificationsStore.length > 100) {
      notificationsStore.pop();
    }

    return NextResponse.json({
      success: true,
      notification,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// GET /api/notifications - Get notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    let notifications = [...notificationsStore];

    // Filter by project
    if (projectId) {
      notifications = notifications.filter(n => n.projectId === projectId);
    }

    // Filter unread
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    // Limit
    notifications = notifications.slice(0, limit);

    // Stats
    const stats = {
      total: notificationsStore.length,
      unread: notificationsStore.filter(n => !n.read).length,
      byType: notificationsStore.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      notifications,
      stats,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAllRead, projectId } = body;

    if (markAllRead) {
      // Mark all as read
      notificationsStore.forEach(n => {
        if (!projectId || n.projectId === projectId) {
          n.read = true;
        }
      });

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (notificationId) {
      const notification = notificationsStore.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        return NextResponse.json({
          success: true,
          notification,
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Notification not found' },
      { status: 404 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Clear notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');
    const clearAll = searchParams.get('clearAll') === 'true';
    const projectId = searchParams.get('projectId');

    if (clearAll) {
      const before = notificationsStore.length;
      
      if (projectId) {
        // Clear only for project
        const indices = notificationsStore
          .map((n, i) => (n.projectId === projectId ? i : -1))
          .filter(i => i !== -1)
          .reverse();
        
        indices.forEach(i => notificationsStore.splice(i, 1));
      } else {
        // Clear all
        notificationsStore.length = 0;
      }

      return NextResponse.json({
        success: true,
        deleted: before - notificationsStore.length,
      });
    }

    if (notificationId) {
      const index = notificationsStore.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notificationsStore.splice(index, 1);
        return NextResponse.json({
          success: true,
          message: 'Notification deleted',
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Notification not found' },
      { status: 404 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

// Helper to create notification (for use by other APIs)
export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  projectId?: string,
  metadata?: Record<string, unknown>
): Notification {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    projectId,
    metadata,
    read: false,
    createdAt: new Date(),
  };
  
  notificationsStore.unshift(notification);
  
  // Keep only last 100
  if (notificationsStore.length > 100) {
    notificationsStore.pop();
  }
  
  return notification;
}
