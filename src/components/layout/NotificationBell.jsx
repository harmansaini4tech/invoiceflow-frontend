import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Send,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_CONFIG = {
  overdue_invoice: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  payment_received: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  invoice_sent: { icon: Send, color: "text-blue-500", bg: "bg-blue-50" },
  customer_added: {
    icon: UserPlus,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch notifications + check overdue on mount
  useEffect(() => {
    fetchNotifications();

    const token = localStorage.getItem("token");
    const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

    let eventSource;
    let reconnectTimer;

    const connect = () => {
      // ✅ Close existing connection if any
      if (eventSource) eventSource.close();

      eventSource = new EventSource(
        `${API}/notifications/stream?token=${token}`
      );

      eventSource.onopen = () => {
        console.log("✅ SSE connected");
      };

      eventSource.onmessage = (e) => {
        console.log("📨 RAW SSE:", e.data); // ✅ add this
        try {
          const data = JSON.parse(e.data);
          console.log("📨 PARSED:", data.type); // ✅ add this
          if (data.type === "notification") {
            setNotifications((prev) => [data.data, ...prev]);
            setUnreadCount((prev) => prev + 1);
            document.title = `🔔 New notification | InvoiceFlow`;
            setTimeout(() => {
              document.title = "InvoiceFlow";
            }, 3000);
          }
        } catch {}
      };

      eventSource.onerror = () => {
        console.log("❌ SSE disconnected, reconnecting in 5s...");
        eventSource.close();
        // ✅ Auto reconnect after 5 seconds
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect(); // ✅ Initial connect

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch {}
  };

  const checkOverdue = async () => {
    try {
      await api.post("/notifications/check-overdue");
    } catch {}
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) fetchNotifications();
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const wasUnread = notifications.find((n) => n._id === id && !n.read);
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const clearAll = async () => {
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const handleClick = (notification) => {
    if (!notification.read) markRead(notification._id);
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white
    text-xs font-bold rounded-full flex items-center justify-center animate-pulse"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-2xl
          shadow-2xl border border-gray-100 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span
                  className="text-xs bg-red-100 text-red-600 font-bold
                  px-2 py-0.5 rounded-full"
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck className="w-4 h-4 text-gray-500" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <div
                  className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center
                  justify-center mx-auto mb-3"
                >
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  All caught up!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.invoice_sent;
                const Icon = config.icon;
                return (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50
                      cursor-pointer transition-colors group hover:bg-gray-50
                      ${!n.read ? "bg-blue-50/40" : "bg-white"}`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center
                      flex-shrink-0 mt-0.5 ${config.bg}`}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            !n.read ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {n.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!n.read && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                          )}
                          <button
                            onClick={(e) => deleteNotification(e, n._id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5
                              hover:bg-red-100 rounded transition-all"
                          >
                            <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {n.link && (
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">
                Showing last {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
