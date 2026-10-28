import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { X, ChevronDown } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import {
  getMenuSectionsForRole,
  type MenuItemConfig,
  type SubMenuItemConfig,
} from '../config/menuConfig';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  isMobile: boolean;
}

export default function Sidebar({
  isOpen,
  onClose,
  onOpen,
  isMobile,
}: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuthStore();
  const navigationSections = getMenuSectionsForRole(user?.role);
  const { layoutStyle, sidebarBgStyle, layoutType } = useThemeStore();
  const isDetached = layoutStyle === 'detached' && layoutType === 'sidebar';
  const isFilled = sidebarBgStyle === 'filled';
  const isTinted = sidebarBgStyle === 'tinted';

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );
  const [openSubDropdowns, setOpenSubDropdowns] = useState<
    Record<string, boolean>
  >({});

  const isParentActive = (
    menuItem: MenuItemConfig | SubMenuItemConfig,
    activePath: string
  ): boolean => {
    if (
      menuItem.path &&
      (activePath === menuItem.path ||
        activePath.startsWith(menuItem.path + '/'))
    ) {
      return true;
    }
    if ('children' in menuItem && menuItem.children) {
      return menuItem.children.some(child => isParentActive(child, activePath));
    }
    return false;
  };

  if (isMobile && !isOpen) {
    return null;
  }

  const sidebarContent = (
    <aside
      className={`shrink-0 flex flex-col p-2.5 z-50 transition-all duration-300 overflow-hidden ${
        isFilled
          ? 'bg-[#2D247D] text-white shadow-xl shadow-[#2D247D]/20'
          : isTinted
            ? 'bg-sidebar-tinted text-slate-900 dark:text-slate-100 shadow-xl'
            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
      } ${
        isMobile
          ? `fixed top-0 bottom-0 left-0 w-76 h-full shadow-2xl animate-in slide-in-from-left duration-200 ${
              isFilled
                ? 'border-r border-white/20'
                : isTinted
                  ? 'border-0'
                  : 'border-r border-slate-200/80 dark:border-slate-800'
            }`
          : `fixed ${isOpen ? 'w-64' : 'w-20 items-center'} ${
              isDetached
                ? isFilled
                  ? 'top-3 bottom-3 left-3 h-auto rounded-xl border border-white/20 shadow-xl shadow-primary/20'
                  : isTinted
                    ? 'top-3 bottom-3 left-3 h-auto rounded-xl border-0 shadow-xl shadow-black/5'
                    : 'top-3 bottom-3 left-3 h-auto rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none'
                : isFilled
                  ? 'top-0 bottom-0 left-0 h-screen border-r border-white/20'
                  : isTinted
                    ? 'top-0 bottom-0 left-0 h-screen border-0'
                    : 'top-0 bottom-0 left-0 h-screen border-r border-slate-200/80 dark:border-slate-800'
            }`
      }`}
    >
      {/* Sidebar Header */}
      <div
        onClick={!isOpen && !isMobile && onOpen ? onOpen : undefined}
        className={`relative z-10 flex items-center justify-between gap-3 px-1 py-1 pb-3 w-full ${
          isFilled
            ? 'border-b border-white/20'
            : isTinted
              ? 'border-b border-black/5 dark:border-white/10'
              : 'border-b border-slate-200/80 dark:border-slate-800'
        } ${!isOpen && !isMobile ? 'justify-center cursor-pointer' : ''}`}
        title={!isOpen && !isMobile ? 'Expand Sidebar' : undefined}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 font-bold shrink-0 shadow-xs border border-slate-200/80 dark:border-slate-800 transition-transform">
            <img
              src="/Aiggpa_Logo.svg"
              alt="AIGGPA Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {(isOpen || isMobile) && (
            <div className="flex flex-col min-w-0">
              <h2
                className={`text-sm font-semibold tracking-tight leading-tight truncate ${
                  isFilled ? 'text-white' : 'text-slate-900 dark:text-white'
                }`}
              >
                AIGGPA ERP
              </h2>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider leading-tight ${
                  isFilled ? 'text-white/80' : 'text-primary'
                }`}
              >
                Good Governance & Policy Analysis
              </span>
            </div>
          )}
        </div>

        {isMobile && (
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              isFilled
                ? 'text-white/80 hover:bg-white/10 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Navigation List */}
      <div
        className={`relative z-10 flex-1 overflow-x-hidden w-full py-4 ${
          isOpen || isMobile
            ? `pl-1 pr-0 overflow-y-auto ${isFilled ? 'scrollbar-thin-white' : 'scrollbar-thin'}`
            : 'px-0 overflow-y-hidden'
        }`}
      >
        <nav className="flex flex-col gap-5 w-full">
          {navigationSections.map((sec, secIdx) => (
            <div key={secIdx} className="flex flex-col gap-1.5 w-full">
              {(isOpen || isMobile) && (
                <span
                  className={`px-3 text-2xs font-semibold uppercase tracking-wider ${
                    isFilled
                      ? 'text-white/70'
                      : isTinted
                        ? 'text-slate-700/80 dark:text-slate-300/80'
                        : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {sec.title}
                </span>
              )}

              {sec.items.map((item, i) => {
                const Icon = item.icon;
                const hasChildren = Boolean(
                  item.children && item.children.length > 0
                );
                const itemKey = `${sec.title}/${item.label}`;
                const isParentChildActive = isParentActive(item, currentPath);
                const isDropdownOpen =
                  openDropdowns[itemKey] !== undefined
                    ? openDropdowns[itemKey]
                    : isParentChildActive;

                if (hasChildren) {
                  return (
                    <div key={i} className="flex flex-col gap-1 w-full">
                      {/* Parent Header Button */}
                      <button
                        onClick={() => {
                          if (!isOpen && !isMobile) {
                            onOpen?.();
                            setOpenDropdowns(prev => ({
                              ...prev,
                              [itemKey]: true,
                            }));
                          } else {
                            setOpenDropdowns(prev => ({
                              ...prev,
                              [itemKey]: !isDropdownOpen,
                            }));
                          }
                        }}
                        title={!isOpen && !isMobile ? item.label : undefined}
                        className={`flex items-center rounded-xl transition-all duration-150 cursor-pointer ${
                          isOpen || isMobile
                            ? 'px-3.5 py-2.5 text-[13px] font-medium w-full justify-between'
                            : 'w-11 h-11 justify-center mx-auto'
                        } ${
                          isFilled
                            ? isParentChildActive
                              ? 'bg-white/20 text-white font-semibold shadow-xs'
                              : 'text-white hover:bg-white/15'
                            : isTinted
                              ? isParentChildActive
                                ? 'bg-white/60 dark:bg-white/15 text-primary font-semibold shadow-xs'
                                : 'text-slate-800 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10'
                              : isParentChildActive
                                ? 'bg-primary-light text-primary font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-4.5 h-4.5 shrink-0 ${
                              isParentChildActive && !isFilled
                                ? 'text-primary font-bold'
                                : ''
                            }`}
                          />
                          {(isOpen || isMobile) && (
                            <span className="truncate text-[13px]">
                              {item.label}
                            </span>
                          )}
                        </div>
                        {(isOpen || isMobile) && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                              isDropdownOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        )}
                      </button>

                      {/* Submenu Children Dropdown */}
                      {(isOpen || isMobile) && isDropdownOpen && (
                        <div className="flex flex-col gap-1 pl-3 ml-3 mt-1">
                          {item.children!.map((child, childIdx) => {
                            const ChildIcon = child.icon;
                            const hasSubChildren = Boolean(
                              child.children && child.children.length > 0
                            );
                            const childKey = `${itemKey}/${child.label}`;
                            const isSubParentChildActive = isParentActive(
                              child,
                              currentPath
                            );
                            const isSubDropdownOpen =
                              openSubDropdowns[childKey] !== undefined
                                ? openSubDropdowns[childKey]
                                : isSubParentChildActive;

                            if (hasSubChildren) {
                              return (
                                <div
                                  key={childIdx}
                                  className="flex flex-col gap-1 w-full"
                                >
                                  <button
                                    onClick={() => {
                                      setOpenSubDropdowns(prev => ({
                                        ...prev,
                                        [childKey]: !isSubDropdownOpen,
                                      }));
                                    }}
                                    className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                                      isFilled
                                        ? isSubParentChildActive
                                          ? 'bg-white/20 text-white font-semibold'
                                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        : isTinted
                                          ? isSubParentChildActive
                                            ? 'bg-white/60 dark:bg-white/15 text-primary font-semibold'
                                            : 'text-slate-800 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10'
                                          : isSubParentChildActive
                                            ? 'bg-primary-light text-primary font-semibold'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate text-xs">
                                        {child.label}
                                      </span>
                                    </div>
                                    <ChevronDown
                                      className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                                        isSubDropdownOpen
                                          ? 'transform rotate-180'
                                          : ''
                                      }`}
                                    />
                                  </button>

                                  {isSubDropdownOpen && (
                                    <div className="flex flex-col gap-1 pl-2.5 ml-2 mt-0.5">
                                      {child.children!.map(
                                        (subChild, subIdx) => {
                                          const SubChildIcon = subChild.icon;

                                          return (
                                            <NavLink
                                              key={subIdx}
                                              to={subChild.path}
                                              end
                                              className={({ isActive }) =>
                                                `relative flex items-center gap-2.5 pl-3 pr-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                                                  isFilled
                                                    ? isActive
                                                      ? 'bg-white text-[#2D247D] shadow-sm font-bold'
                                                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                    : isTinted
                                                      ? isActive
                                                        ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                                      : isActive
                                                        ? 'bg-primary text-white shadow-md shadow-primary/20 font-semibold'
                                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                                }`
                                              }
                                              onClick={() => {
                                                if (isMobile) onClose();
                                              }}
                                            >
                                              {() => (
                                                <>
                                                  <SubChildIcon className="w-3.5 h-3.5 shrink-0 ml-0.5" />
                                                  <span className="truncate text-xs">
                                                    {subChild.label}
                                                  </span>
                                                </>
                                              )}
                                            </NavLink>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <NavLink
                                key={childIdx}
                                to={child.path}
                                end
                                className={({ isActive }) =>
                                  `relative flex items-center gap-2.5 pl-3 pr-2.5 py-2 text-[13px] font-medium rounded-xl transition-all duration-150 ${
                                    isFilled
                                      ? isActive
                                        ? 'bg-white text-[#2D247D] shadow-sm font-bold'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                      : isTinted
                                        ? isActive
                                          ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                                          : 'text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                        : isActive
                                          ? 'bg-primary text-white shadow-md shadow-primary/20 font-semibold'
                                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                  }`
                                }
                                onClick={() => {
                                  if (isMobile) onClose();
                                }}
                              >
                                {() => (
                                  <>
                                    <ChildIcon className="w-4 h-4 shrink-0" />
                                    <span className="truncate text-[13px]">
                                      {child.label}
                                    </span>
                                  </>
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Standard Link (No Children)
                return (
                  <NavLink
                    key={i}
                    to={item.path}
                    end
                    title={!isOpen && !isMobile ? item.label : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center transition-all duration-150 cursor-pointer ${
                        isOpen || isMobile
                          ? 'px-3.5 py-2.5 rounded-xl text-[13px] font-medium w-full gap-3'
                          : 'w-11 h-11 justify-center mx-auto rounded-xl'
                      } ${
                        isFilled
                          ? isActive
                            ? 'bg-white text-[#2D247D] shadow-sm font-bold'
                            : 'text-white/80 hover:bg-white/15 hover:text-white'
                          : isTinted
                            ? isActive
                              ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                              : 'text-slate-800 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                            : isActive
                              ? 'bg-primary text-white shadow-md shadow-primary/20 font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                    onClick={() => {
                      setOpenDropdowns({});
                      setOpenSubDropdowns({});
                      if (isMobile) onClose();
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (isOpen || isMobile) && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full shadow-2xs opacity-75 transition-colors"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          />
                        )}
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        {(isOpen || isMobile) && (
                          <span className="truncate text-[13px]">
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Bottom: AIGGPA Logo Watermark (Pure Background Watermark) */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/Aiggpa_Logo.svg"
          alt="AIGGPA Logo Watermark"
          className={`transition-all duration-300 object-contain ${
            isOpen || isMobile ? 'w-36 h-36 sm:w-40 sm:h-40' : 'w-10 h-10'
          } ${
            isFilled
              ? 'brightness-0 invert opacity-[0.03]'
              : 'opacity-[0.02] dark:brightness-0 dark:invert dark:opacity-[0.08]'
          }`}
        />
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <>
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 animate-in fade-in duration-200"
          onClick={onClose}
        />
        {sidebarContent}
      </>
    );
  }

  return sidebarContent;
}
