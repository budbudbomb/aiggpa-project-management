import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from 'auth/store/authStore';
import {
  getMenuSectionsForRole,
  type MenuItemConfig,
} from 'auth/config/menuConfig';
import './SmartLayout.css';

// ─── Types ─────────────────────────────────────────

interface SmartMenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  children?: SmartMenuItem[];
}

interface SmartMenuSection {
  title: string;
  items: SmartMenuItem[];
}

// ─── SmartSidebar ───────────────────────────────────

const SmartSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [expandedSlugs, setExpandedSlugs] = React.useState<
    Record<string, boolean>
  >({});
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Convert MenuSectionConfig to SmartMenuSection with guaranteed unique hierarchical IDs
  const menuSections: SmartMenuSection[] = React.useMemo(() => {
    const rawSections = getMenuSectionsForRole(user?.role);
    return rawSections.map(sec => {
      const sectionSlug = sec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return {
        title: sec.title,
        items: sec.items.map(item => mapMenuItem(item, sectionSlug)),
      };
    });
  }, [user?.role]);

  function mapMenuItem(item: MenuItemConfig, parentId: string): SmartMenuItem {
    const itemSlug = item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = `${parentId}/${itemSlug}`;
    return {
      id,
      label: item.label,
      path: item.path,
      icon: item.icon,
      children: item.children?.map(child => ({
        id: `${id}/${child.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        label: child.label,
        path: child.path,
        icon: child.icon,
        children: child.children?.map(sub => ({
          id: `${id}/${child.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${sub.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          label: sub.label,
          path: sub.path,
          icon: sub.icon,
        })),
      })),
    };
  }

  // Desktop collapse toggle
  React.useEffect(() => {
    const handleToggle = () => setIsCollapsed(prev => !prev);
    window.addEventListener('smart-sidebar-collapse', handleToggle);
    return () =>
      window.removeEventListener('smart-sidebar-collapse', handleToggle);
  }, []);

  // Mobile open/close toggle
  React.useEffect(() => {
    const handleMobileToggle = () => setIsMobileOpen(prev => !prev);
    window.addEventListener('smart-sidebar-mobile', handleMobileToggle);
    return () =>
      window.removeEventListener('smart-sidebar-mobile', handleMobileToggle);
  }, []);

  // Find the single active leaf path (exact match first, then longest matching prefix)
  const activePath = React.useMemo(() => {
    const allLeafPaths: string[] = [];
    const collectLeafs = (items: SmartMenuItem[]) => {
      for (const it of items) {
        if (it.children && it.children.length > 0) {
          collectLeafs(it.children);
        } else if (it.path) {
          allLeafPaths.push(it.path);
        }
      }
    };

    collectLeafs([
      { id: 'home', label: 'Home', path: '/home', icon: Home },
      ...menuSections.flatMap(s => s.items),
    ]);

    // 1. Exact match
    const exact = allLeafPaths.find(p => p === location.pathname);
    if (exact) return exact;

    // 2. Prefix match (pick the longest matching path)
    const prefixMatches = allLeafPaths
      .filter(
        p => p !== '/' && p !== '/home' && location.pathname.startsWith(p + '/')
      )
      .sort((a, b) => b.length - a.length);

    return prefixMatches[0] || '';
  }, [location.pathname, menuSections]);

  // Auto-expand ancestors of active route on navigation
  React.useEffect(() => {
    setIsMobileOpen(false);

    if (!activePath) return;

    const findAncestorIds = (
      items: SmartMenuItem[],
      target: string,
      chain: string[] = []
    ): string[] => {
      for (const it of items) {
        if (!it.children || it.children.length === 0) {
          if (it.path === target) {
            return chain;
          }
        } else {
          const found = findAncestorIds(it.children, target, [...chain, it.id]);
          if (found.length > 0) return found;
        }
      }
      return [];
    };

    const allItems = menuSections.flatMap(s => s.items);
    const ancestors = findAncestorIds(allItems, activePath);

    if (ancestors.length > 0) {
      setExpandedSlugs(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        for (const aId of ancestors) {
          if (!updated[aId]) {
            updated[aId] = true;
            hasChanges = true;
          }
        }
        return hasChanges ? updated : prev;
      });
    }
  }, [activePath, menuSections]);

  const toggleExpand = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedSlugs(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const isBranchActive = (item: SmartMenuItem): boolean => {
    if (!item.children || item.children.length === 0) {
      return item.path === location.pathname || item.path === activePath;
    }
    return item.children.some(child => isBranchActive(child));
  };

  const renderItem = (item: SmartMenuItem, depth = 0): React.ReactNode => {
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isExpanded = !!expandedSlugs[item.id];
    const isLeaf = !hasChildren;
    const isActive =
      isLeaf && (item.path === location.pathname || item.path === activePath);
    const branchActive = !isLeaf && isBranchActive(item);
    const Icon = item.icon;

    const handleClick = (e: React.MouseEvent) => {
      if (hasChildren) {
        toggleExpand(item.id, e);
      } else {
        navigate(item.path);
      }
    };

    return (
      <React.Fragment key={item.id}>
        <div
          className={`smart-sidebar-item ${isActive ? 'active' : ''} ${branchActive ? 'branch-active' : ''} ${isExpanded ? 'expanded' : ''} depth-${depth}`}
          onClick={handleClick}
        >
          <div className="item-icon-zone">
            {Icon && <Icon className="smart-sidebar-item-icon" />}
          </div>
          <div className="item-text-zone">
            <span className="smart-sidebar-item-label">{item.label}</span>
            {hasChildren &&
              (isExpanded ? (
                <ChevronUp className="smart-sidebar-expand-icon" />
              ) : (
                <ChevronDown className="smart-sidebar-expand-icon" />
              ))}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="smart-sidebar-dropdown">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="smart-sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`smart-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Logo & Brand */}
        <div className="smart-sidebar-header" onClick={() => navigate('/home')}>
          <div className="smart-logo-zone">
            <div className="smart-logo-box">
              <img
                src={`${import.meta.env.BASE_URL}Aiggpa_Logo.svg`}
                alt="AIGGPA Logo"
                className="smart-logo-img"
              />
            </div>
          </div>
          <div className="smart-brand-zone">
            <h2 className="smart-brand-title">AIGGPA ERP</h2>
            <p className="smart-brand-subtitle">
              Good Governance &amp; Policy Analysis
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="smart-sidebar-nav">
          {/* Home shortcut always at top */}
          {renderItem(
            { id: 'top-home', label: 'Home', path: '/home', icon: Home },
            0
          )}

          {/* Role-based menu sections */}
          {menuSections.map((section, sIdx) => {
            // Filter out Home from sections (already rendered above)
            const sectionItems = section.items.filter(i => i.path !== '/home');
            if (sectionItems.length === 0) return null;

            return (
              <React.Fragment key={sIdx}>
                {sectionItems.map(item => renderItem(item, 0))}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Sidebar Bottom: AIGGPA Logo Watermark */}
        <div className="smart-sidebar-watermark-container">
          <img
            src={`${import.meta.env.BASE_URL}Aiggpa_Logo.svg`}
            alt="AIGGPA Logo Watermark"
            className="smart-sidebar-watermark-img"
          />
        </div>
      </aside>
    </>
  );
};

export default SmartSidebar;
