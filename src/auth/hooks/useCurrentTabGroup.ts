import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { useAuthStore } from '../store/authStore';
import {
  getMenuItemsForRole,
  type SubMenuItemConfig,
  type SubSubMenuItemConfig,
} from '../config/menuConfig';

export interface TabItem {
  label: string;
  icon: React.ElementType;
  path?: string;
}

export interface TabGroupState {
  level: number;
  parentLabel: string;
  activeIndex: number;
  items: TabItem[];
}

export function useCurrentTabGroup(): TabGroupState | null {
  const location = useLocation();
  const { user } = useAuthStore();

  return useMemo(() => {
    const currentPath = location.pathname;
    const menuItems = getMenuItemsForRole(user?.role);

    // 1st Priority: Check for 3rd-level children tab group
    for (const level1 of menuItems) {
      if (!level1.children) continue;

      for (const level2 of level1.children) {
        if (!level2.children || level2.children.length < 2) continue;

        const matchingChildIndex = level2.children.findIndex(
          (child: SubSubMenuItemConfig) =>
            child.path &&
            (currentPath === child.path ||
              currentPath.startsWith(child.path + '/'))
        );

        if (matchingChildIndex !== -1) {
          return {
            level: 3,
            parentLabel: level2.label,
            activeIndex: matchingChildIndex,
            items: level2.children.map((child: SubSubMenuItemConfig) => ({
              label: child.label,
              icon: child.icon,
              path: child.path,
            })),
          };
        }
      }
    }

    // 2nd Priority: Fallback to 2nd-level children tab group if 3rd-level not active
    for (const level1 of menuItems) {
      if (!level1.children || level1.children.length < 2) continue;

      // Exact match first
      let matchingLevel2Index = level1.children.findIndex(
        (level2: SubMenuItemConfig) => level2.path === currentPath
      );

      // If no exact match on level2, check exact match on subchildren
      if (matchingLevel2Index === -1) {
        matchingLevel2Index = level1.children.findIndex(
          (level2: SubMenuItemConfig) =>
            level2.children &&
            level2.children.some(
              (child: SubSubMenuItemConfig) => child.path === currentPath
            )
        );
      }

      // If still no exact match, fallback to prefix matching
      if (matchingLevel2Index === -1) {
        matchingLevel2Index = level1.children.findIndex(
          (level2: SubMenuItemConfig) => {
            if (level2.path && currentPath.startsWith(level2.path + '/')) {
              return true;
            }
            if (level2.children) {
              return level2.children.some(
                (child: SubSubMenuItemConfig) =>
                  child.path && currentPath.startsWith(child.path + '/')
              );
            }
            return false;
          }
        );
      }

      if (matchingLevel2Index !== -1) {
        // Collect items that have valid paths (either direct or from first child)
        const items = level1.children
          .map((level2: SubMenuItemConfig) => {
            const itemPath =
              level2.path ||
              (level2.children && level2.children[0]
                ? level2.children[0].path
                : undefined);
            return {
              label: level2.label,
              icon: level2.icon,
              path: itemPath,
            };
          })
          .filter((item: TabItem) => Boolean(item.path));

        if (items.length >= 2) {
          return {
            level: 2,
            parentLabel: level1.label,
            activeIndex: matchingLevel2Index,
            items,
          };
        }
      }
    }

    return null;
  }, [location.pathname, user?.role]);
}
