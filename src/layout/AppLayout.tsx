import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { applySidebarState } from '../lib/sidebar';
import { DEFAULT_LAYOUT, PAGE_LAYOUTS } from './layoutConfig';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'AIGGPA - Project Management Dashboard',
  '/create-project': 'AIGGPA - Project Management & Creation Desk',
  '/activities': 'AIGGPA - Tasks',
  '/surveys': 'AIGGPA - Survey Management',
  '/create-survey': 'AIGGPA - Create Survey',
  '/complaints': 'AIGGPA - Complaint Management',
  '/question-bank': 'AIGGPA - Question Studio & Central Bank',
};

export default function AppLayout(): React.ReactElement {
  const location = useLocation();
  const layout = PAGE_LAYOUTS[location.pathname] ?? DEFAULT_LAYOUT;

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname];
    if (title) document.title = title;
    applySidebarState(document.documentElement.classList.contains('sidebar-collapsed'));
  }, [location.pathname]);

  const mainStyle = layout.mainStyle ?? { paddingTop: 18, paddingBottom: 40 };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar config={layout.topbar} />
        <main className={`workspace-content settings-container${layout.mainClass ? ` ${layout.mainClass}` : ''}`} style={mainStyle}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
