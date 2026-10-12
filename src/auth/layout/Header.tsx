import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import Avatar from './Avatar';
import { getMenuItemsForRole } from '../config/menuConfig';
import {
  Menu,
  Settings,
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  Search,
  X,
  ArrowRight,
  Maximize,
  Minimize,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isMobile?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'system' | 'content' | 'user';
}

const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'System Engine Updated',
    message: 'Tailwind v4 theme engine upgraded with 0 build errors.',
    time: '10m ago',
    unread: true,
    type: 'system',
  },
  {
    id: 'notif-2',
    title: 'New Page Published',
    message: 'Page "Annual Schedule 2026" published successfully.',
    time: '45m ago',
    unread: true,
    type: 'content',
  },
  {
    id: 'notif-3',
    title: 'New User Registered',
    message: 'Candidate profile #12450 verified and activated.',
    time: '2h ago',
    unread: false,
    type: 'user',
  },
];

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-primary/15 dark:bg-primary/30 text-primary dark:text-blue-300 font-semibold px-0.5 rounded transition-colors"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function Header({
  onToggleSidebar,
  isSidebarOpen,
  isMobile = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleCustomizer, layoutStyle, layoutType } = useThemeStore();
  const isDetached = layoutStyle === 'detached' && layoutType === 'sidebar';
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(mockNotifications);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const userFullName = user?.name || 'Super Admin';

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Filter menu items based on input search query (flattening nested menus up to 3 levels for direct leaf links)
  const roleMenuItems = getMenuItemsForRole(user?.role);
  const flattenedMenuItems = roleMenuItems.flatMap(item => {
    if (item.children) {
      return item.children.flatMap(child =>
        child.children ? child.children : [child]
      );
    }
    return [item];
  });

  const filteredMenuItems = flattenedMenuItems.filter(
    item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerContent = (
    <>
      {/* Left Logo & Toggle Menu */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none ${
            layoutType === 'navbar' && !isMobile ? 'hidden' : 'flex'
          }`}
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile-Only AIGGPA ERP Brand Title */}
        {isMobile && (
          <div
            onClick={() => navigate('/home')}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs border border-slate-200/80 dark:border-slate-800">
              <img
                src="/Aiggpa_Logo.svg"
                alt="AIGGPA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h4 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                AIGGPA ERP
              </h4>
              <span className="text-[10px] font-semibold text-primary leading-none mt-0.5">
                ERP System
              </span>
            </div>
          </div>
        )}

        {layoutType === 'navbar' && (
          <div
            onClick={() => navigate('/home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center font-bold shrink-0 shadow-xs border border-slate-200/80 dark:border-slate-800 transition-transform duration-200">
              <img
                src="/Aiggpa_Logo.svg"
                alt="AIGGPA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                AIGGPA
              </h4>
              <span className="text-2xs font-semibold text-primary">
                ERP System
              </span>
            </div>
          </div>
        )}

        {/* Left-Aligned Inline Menu Search Bar */}
        <div className="relative hidden md:block w-48 sm:w-64" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search menus, features..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-normal shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Menu Results Dropdown (Only appears when user types search query) */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 w-72 sm:w-80 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Menu Results
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-1 max-h-64 overflow-y-auto">
                {filteredMenuItems.length > 0 ? (
                  filteredMenuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors truncate">
                              <HighlightText
                                text={item.label}
                                query={searchQuery}
                              />
                            </span>
                            {item.description && (
                              <span className="text-2xs text-slate-400 dark:text-slate-500 truncate">
                                <HighlightText
                                  text={item.description}
                                  query={searchQuery}
                                />
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching menu found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right User Bar & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Fullscreen Toggle Button (Desktop View Only) */}
        {!isMobile && (
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:shadow-xs transition-all duration-150 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Notification Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:shadow-xs transition-all duration-150 cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-2xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-2xs font-medium text-primary hover:text-primary-hover hover:underline cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto py-2">
                {notifications.map(item => (
                  <div
                    key={item.id}
                    className={`p-3 flex items-start gap-3 rounded-xl border transition-colors ${
                      item.unread
                        ? 'bg-primary/5 dark:bg-primary/10 border-primary/20'
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h5>
                        <span className="text-2xs text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dropdown Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-medium text-primary hover:text-primary-hover hover:underline cursor-pointer"
                >
                  Close Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Icon Button (Opens Theme Customizer - Desktop View Only) */}
        {!isMobile && (
          <button
            onClick={toggleCustomizer}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors cursor-pointer"
            title="Theme & Layout Settings"
          >
            <Settings className="w-5 h-5 hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {/* Vertical Divider Line */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

        {/* User Info Label */}
        <div className="hidden sm:flex flex-col items-end text-right pr-1">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {userFullName}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {user?.role || 'Center Head'}
            </span>
            {user?.code && (
              <span className="text-[10px] text-slate-400 font-mono">
                {user.code}
              </span>
            )}
          </div>
        </div>

        {/* Avatar Dropdown */}
        <Avatar onLogout={handleLogout} />
      </div>
    </>
  );

  if (isDetached) {
    return (
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-950 pt-3 transition-colors duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-200">
          <header className="px-3 sm:px-4 py-3 flex items-center justify-between transition-all duration-200">
            {headerContent}
          </header>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <header className="px-3 sm:px-4 py-3 flex items-center justify-between transition-all duration-200">
        {headerContent}
      </header>
    </div>
  );
}
