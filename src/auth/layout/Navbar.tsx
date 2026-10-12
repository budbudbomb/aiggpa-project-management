import React from 'react';
import { NavLink, useLocation } from 'react-router';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import {
  getMenuItemsForRole,
  type MenuItemConfig,
  type SubMenuItemConfig,
  type SubSubMenuItemConfig,
} from '../config/menuConfig';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const { layoutStyle, layoutType } = useThemeStore();
  const { user } = useAuthStore();
  const menuItems = getMenuItemsForRole(user?.role);
  const isDetached = layoutStyle === 'detached' && layoutType === 'sidebar';
  const location = useLocation();
  const currentPath = location.pathname;

  // Helper function to recursively check if a menu path or its children match the active route
  const isParentActive = (
    menuItem: MenuItemConfig | SubMenuItemConfig | SubSubMenuItemConfig,
    activePath: string
  ): boolean => {
    if (menuItem.path && activePath === menuItem.path) {
      return true;
    }
    if ('children' in menuItem && menuItem.children) {
      return menuItem.children.some(child => isParentActive(child, activePath));
    }
    return false;
  };

  return (
    <nav
      className={`bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4 sm:px-6 transition-all duration-200 sticky z-30 shadow-xs ${
        isDetached
          ? 'top-19 mt-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 py-2.5'
          : 'top-15.25 w-full border-b border-slate-200/75 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center gap-2 py-2.5">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          const hasChildren = Boolean(
            item.children && item.children.length > 0
          );
          const isDropdownActive = isParentActive(item, currentPath);

          if (hasChildren) {
            return (
              <div key={i} className="relative group shrink-0">
                {/* Parent Dropdown Button */}
                <button
                  type="button"
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isDropdownActive
                      ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 group-hover:rotate-180 ${
                      isDropdownActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* Dropdown Menu Overlay */}
                <div className="absolute top-full left-0 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 hidden group-hover:flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {item.children!.map((child, childIdx) => {
                    const ChildIcon = child.icon;
                    const hasSubChildren = Boolean(
                      child.children && child.children.length > 0
                    );
                    const isSubParentActive = isParentActive(
                      child,
                      currentPath
                    );

                    if (hasSubChildren) {
                      return (
                        <div
                          key={childIdx}
                          className="relative group/sub w-full shrink-0"
                        >
                          {/* Sub Parent Button */}
                          <button
                            type="button"
                            className={`flex items-center justify-between w-full px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              isSubParentActive
                                ? 'bg-primary-light text-primary font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/55'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{child.label}</span>
                            </div>
                            <ChevronRight
                              className={`w-3 h-3 ${
                                isSubParentActive
                                  ? 'text-primary'
                                  : 'text-slate-400'
                              }`}
                            />
                          </button>

                          {/* 3rd Layer Flyout Overlay */}
                          <div className="absolute left-full top-0 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 hidden group-hover/sub:flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-left-1 duration-150">
                            {child.children!.map((subChild, subChildIdx) => {
                              const SubChildIcon = subChild.icon;
                              return (
                                <NavLink
                                  key={subChildIdx}
                                  to={subChild.path}
                                  end
                                  className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                                      isActive
                                        ? 'bg-primary text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/55'
                                    }`
                                  }
                                >
                                  <SubChildIcon className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">
                                    {subChild.label}
                                  </span>
                                </NavLink>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <NavLink
                        key={childIdx}
                        to={child.path}
                        end
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                            isActive
                              ? 'bg-primary text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/55'
                          }`
                        }
                      >
                        <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
