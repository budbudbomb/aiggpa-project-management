import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebarCollapse } from '../lib/sidebar';

interface MenuItem {
  to: string;
  label: string;
  icon: string;
  tooltip: string;
  end?: boolean;
  isActive: (pathname: string, search: string) => boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: 'pi-th-large',
    tooltip: 'Dashboard',
    isActive: (pathname) => pathname === '/dashboard',
  },
  {
    to: '/create-project',
    label: 'Create Project',
    icon: 'pi-plus-circle',
    tooltip: 'Create Project',
    isActive: (pathname, search) =>
      pathname === '/create-project' && new URLSearchParams(search).get('view') !== 'budget',
  },
  {
    to: '/create-project?view=budget',
    label: 'Add Budget',
    icon: 'pi-wallet',
    tooltip: 'Add Budget',
    isActive: (pathname, search) =>
      pathname === '/create-project' && new URLSearchParams(search).get('view') === 'budget',
  },
  {
    to: '/activities',
    label: 'Tasks',
    icon: 'pi-check-square',
    tooltip: 'Tasks & Activities',
    isActive: (pathname) => pathname === '/activities',
  },
  {
    to: '/surveys',
    label: 'Surveys',
    icon: 'pi-file-edit',
    tooltip: 'Surveys',
    isActive: (pathname) => pathname === '/surveys',
  },
  {
    to: '/complaints',
    label: 'Complaints',
    icon: 'pi-shield',
    tooltip: 'Complaints',
    isActive: (pathname) => pathname === '/complaints',
  },
];

export default function Sidebar(): React.ReactElement {
  const location = useLocation();

  return (
    <aside className="sidebar" id="mainSidebar">
      <div className="sidebar-header">
        <div className="company-logo-box">
          <div
            className="aiggpa-brand-icon"
            id="sidebarBrandIcon"
            title="Toggle Sidebar"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (
                document.documentElement.classList.contains('sidebar-collapsed') ||
                document.body.classList.contains('sidebar-collapsed')
              ) {
                toggleSidebarCollapse();
              }
            }}
          >
            <img src="assets/logo.png" alt="AIGGPA Logo" className="brand-logo-img" />
          </div>
          <div className="aiggpa-brand-text">
            <span className="brand-title">AIGGPA</span>
            <span className="brand-sub">Project Governance</span>
          </div>
          <button
            type="button"
            className="sidebar-collapse-trigger"
            id="sidebarCollapseTrigger"
            title="Collapse Sidebar"
            onClick={() => toggleSidebarCollapse()}
          >
            <i className="pi pi-chevron-left" />
          </button>
        </div>
      </div>

      <nav className="sidebar-menu">
        {MENU_ITEMS.map((item) => {
          const active = item.isActive(location.pathname, location.search);
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`menu-item${active ? ' active' : ''}`}
              data-tooltip={item.tooltip}
              style={{ textDecoration: 'none' }}
            >
              <div className="menu-item-left">
                <i className={`pi ${item.icon}`} />
                <span>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-pill">
          <div className="profile-left">
            <div className="profile-avatar-wrap" data-tooltip="AIGGPA — Center Head">
              <div className="profile-avatar" id="sidebarAvatar">
                AI
              </div>
              <div className="profile-status-dot" />
            </div>
            <div className="profile-info">
              <h4 id="sidebarUserName">AIGGPA</h4>
              <p id="sidebarUserRole">Center Head</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
