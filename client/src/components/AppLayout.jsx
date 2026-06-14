import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  ReceiptText,
  Search,
  Settings,
  Sun,
  Ticket,
  Users,
  Workflow
} from "lucide-react";
import { api, SOCKET_URL } from "../api/client.js";
import { useAuthStore } from "../store/authStore.js";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/customers", label: "Customers", icon: BriefcaseBusiness },
  { to: "/emails", label: "Emails", icon: Mail },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/invoices", label: "Invoices", icon: ReceiptText },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/crm", label: "CRM", icon: Search },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/ai-control", label: "AI Control", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings }
];

const socketEvents = ["new_email", "new_ticket", "invoice_created", "meeting_created", "agent_completed", "workflow_executed"];

const formatRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

export function AppLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/api/notifications")).data,
    refetchInterval: 60000
  });

  const unreadCount = useMemo(
    () => data?.notifications?.filter((n) => !n.read).length ?? 0,
    [data]
  );

  const markRead = useMutation({
    mutationFn: (id) => api.put(`/api/notifications/${id}`, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });

  const markAllRead = async () => {
    const unread = data?.notifications?.filter((n) => !n.read) ?? [];
    await Promise.all(unread.map((n) => api.put(`/api/notifications/${n._id}`, { read: true })));
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });

    socketEvents.forEach((eventName) => {
      socket.on(eventName, () => {
        toast.success(eventName.replaceAll("_", " "));
        queryClient.invalidateQueries();
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
          <div>
            <div className="text-lg font-semibold tracking-normal">NxtBiz</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Operations Console</div>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                    isActive
                      ? "bg-mint/10 text-mint"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-panel lg:px-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="text-sm font-semibold">{user?.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                className="icon-button relative"
                type="button"
                title="Notifications"
                onClick={() => setIsNotifOpen((v) => !v)}
              >
                <Bell className="h-4 w-4" />
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "9999px",
                    background: "#ef4444",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "bold",
                    display: unreadCount === 0 ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    pointerEvents: "none"
                  }}
                >
                  {unreadCount}
                </span>
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <div className="text-sm font-semibold">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-1.5 text-xs font-normal text-slate-500">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                        type="button"
                        onClick={markAllRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {!data?.notifications?.length ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">
                        No notifications
                      </div>
                    ) : (
                      data.notifications.map((n) => (
                        <button
                          key={n._id}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                          type="button"
                          onClick={() => {
                            if (!n.read) markRead.mutate(n._id);
                          }}
                        >
                          <span
                            className={[
                              "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                              n.read ? "bg-slate-300 dark:bg-slate-600" : "bg-red-500"
                            ].join(" ")}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium leading-tight">{n.title}</div>
                            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {n.message}
                            </div>
                            <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                              {formatRelativeTime(n.createdAt)}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              className="icon-button"
              type="button"
              title="Toggle dark mode"
              onClick={() => setDarkMode((value) => !value)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="icon-button" type="button" title="Log out" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
