"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  X,
  Info,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { formatDistanceToNow } from "date-fns";
import {
  useAdminNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";

type NotifType = "info" | "success" | "warning" | "booking";

const ICON_MAP: Record<NotifType, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-primary" />,
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
  booking: <Clock className="w-4 h-4 text-primary" />,
};

const getNotificationType = (type: string): NotifType => {
  if (type.includes("BOOKING_CREATED")) return "booking";
  if (type.includes("CONFIRMED")) return "success";
  if (type.includes("REJECTED") || type.includes("CANCELLED")) return "warning";
  return "info";
};

export function NotificationPopover() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch real notifications
  const { data: notificationsData, isLoading } = useAdminNotifications({
    limit: 10,
    unreadOnly: false,
  });
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadData?.count || 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.readAt) {
      handleMarkAsRead(notification.id);
    }

    if (notification.bookingId) {
      router.push(`/admin/bookings/${notification.bookingId}`);
      setOpen(false);
    }
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleMarkAsRead(id);
  };

  const isLoading_ = isLoading || markAsRead.isPending;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
          open
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {isLoading_ ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bell className="w-4.5 h-4.5" />
        )}
        {unreadCount > 0 && !isLoading_ && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-90 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllAsRead.isPending}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium disabled:opacity-50"
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-95 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((n: any) => {
                const type = getNotificationType(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "flex items-start gap-3 px-5 py-3.5 transition-colors group cursor-pointer",
                      !n.readAt
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {ICON_MAP[type]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            !n.readAt
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {n.subject}
                        </p>
                        {n.bookingReference && (
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                            {n.bookingReference}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                        {n.content}
                      </p>

                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.sentAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDismiss(n.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground mt-0.5"
                      disabled={markAsRead.isPending}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {!n.readAt && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-5 py-3 border-t border-border text-center">
            <button
              onClick={() => {
                router.push("/admin/notifications");
                setOpen(false);
              }}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
