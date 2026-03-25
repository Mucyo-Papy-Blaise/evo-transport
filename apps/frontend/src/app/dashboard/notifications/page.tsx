"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  useUserNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/utils";

export default function NotificationsPage() {
  const { data, isLoading } = useUserNotifications(1, 40);
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const list = data?.notifications ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Updates about your bookings and requests.
          </p>
        </div>
        {list.some((n) => !n.readAt) && (
          <Button
            variant="outline"
            size="sm"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading…"
              : `${data?.unreadCount ?? 0} unread · ${data?.total ?? 0} total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {list.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "px-4 py-3 transition-colors",
                    !n.readAt && "bg-primary/5",
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{n.subject}</p>
                      {n.content && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                          {n.content}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(n.sentAt), "PPp")}
                        {n.bookingReference && (
                          <>
                            {" · "}
                            {n.bookingId ? (
                              <Link
                                href={`/dashboard/bookings/${n.bookingId}`}
                                className="text-primary hover:underline"
                              >
                                {n.bookingReference}
                              </Link>
                            ) : (
                              n.bookingReference
                            )}
                          </>
                        )}
                      </p>
                    </div>
                    {!n.readAt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        disabled={markOne.isPending}
                        onClick={() => markOne.mutate(n.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
