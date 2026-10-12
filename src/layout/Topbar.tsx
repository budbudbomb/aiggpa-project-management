import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toggleSidebarCollapse } from '../lib/sidebar';
import type { TopbarConfig, TopbarUserVariant } from './layoutConfig';

function UserButton({
  user,
  open: _open,
  onToggle,
}: {
  user: TopbarUserVariant;
  open: boolean;
  onToggle: (e: React.MouseEvent) => void;
}): React.ReactElement {
  if (user.style === 'blue') {
    return (
      <button
        type="button"
        id="topUserDropdownBtn"
        onClick={onToggle}
        style={{
          border: '1px solid #dbeafe',
          background: '#eff6ff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 12px 4px 6px',
          borderRadius: 20,
          transition: 'all 0.2s',
        }}
      >
        <div
          className="avatar-small"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {user.avatar}
        </div>
        <span
          style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}
          id="topbarUserName"
        >
          {user.name}
        </span>
        <i
          className="pi pi-chevron-down"
          style={{ fontSize: 9, color: '#64748b' }}
        />
      </button>
    );
  }

  if (user.style === 'white') {
    return (
      <button
        type="button"
        id="topUserDropdownBtn"
        onClick={onToggle}
        style={{
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 12px 4px 6px',
          borderRadius: 20,
          transition: 'all 0.2s',
        }}
      >
        <div
          className="avatar-small"
          style={{ background: '#1e3a8a', color: '#fff' }}
        >
          {user.avatar}
        </div>
        <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
          <div
            style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}
          >
            {user.name}
          </div>
          <div
            style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}
          >
            {user.role}
          </div>
        </div>
        <i
          className="pi pi-chevron-down"
          style={{ fontSize: 9, color: '#64748b' }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      id="topUserDropdownBtn"
      onClick={onToggle}
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 0,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#0f172a',
          color: '#ffffff',
          fontSize: '0.84rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      >
        {user.avatar}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left',
          lineHeight: 1.2,
        }}
      >
        <span
          style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}
        >
          {user.name}
        </span>
        <span
          style={{ fontSize: '0.70rem', fontWeight: 600, color: '#94a3b8' }}
        >
          {user.role}
        </span>
      </div>
    </button>
  );
}

export default function Topbar({
  config,
}: {
  config: TopbarConfig;
}): React.ReactElement {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dropdownOpen) return;
    const onDocClick = () => setDropdownOpen(false);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [dropdownOpen]);

  function logout(e: React.MouseEvent) {
    e.preventDefault();
    navigate('/login');
  }

  const user = config.user;
  const menuWidth = user.style === 'blue' ? 190 : 220;

  return (
    <header className="topbar">
      <div
        className="topbar-left"
        style={
          config.crumb
            ? { display: 'flex', alignItems: 'center', gap: 16 }
            : undefined
        }
      >
        <button
          className="sidebar-toggle-btn"
          id="sidebarToggleBtn"
          title="Toggle Sidebar"
          onClick={() => toggleSidebarCollapse()}
        >
          <i className="pi pi-bars" />
        </button>

        {config.crumb && !config.crumb.page && (
          <span
            style={{
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#64748b',
              letterSpacing: '-0.01em',
            }}
          >
            {config.crumb.label}
          </span>
        )}

        {config.crumb?.page && (
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{config.crumb.label}</span>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ color: '#0f172a' }}>{config.crumb.page}</span>
          </div>
        )}

        {config.searchPlaceholder && (
          <div className="search-box">
            <i className="pi pi-search search-icon" />
            <input
              type="text"
              id="globalSearchInput"
              placeholder={config.searchPlaceholder}
            />
          </div>
        )}
      </div>

      <div className="topbar-right">
        {config.bell === 'circle' && (
          <div
            style={{ position: 'relative', marginRight: 6, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
              }}
            >
              <i className="pi pi-bell" style={{ fontSize: 15 }} />
            </div>
            <span
              style={{
                position: 'absolute',
                top: 3,
                right: 3,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #ffffff',
              }}
            />
          </div>
        )}

        {config.bell === 'plain' && (
          <div
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Notifications"
          >
            <i
              className="pi pi-bell"
              style={{ fontSize: '1.15rem', color: '#64748b' }}
            />
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 0 2px #ffffff',
              }}
            />
          </div>
        )}

        <div className="user-profile-dropdown" style={{ position: 'relative' }}>
          <UserButton
            user={user}
            open={dropdownOpen}
            onToggle={e => {
              e.stopPropagation();
              setDropdownOpen(v => !v);
            }}
          />

          <div
            id="topUserDropdownMenu"
            style={{
              display: dropdownOpen ? 'block' : 'none',
              position: 'absolute',
              right: 0,
              top: '120%',
              width: menuWidth,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              padding: '8px 0',
              zIndex: 99999,
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: '#1e293b',
                  fontSize: '0.88rem',
                }}
              >
                {user.menuName}
              </div>
              <div
                style={{ fontSize: '0.74rem', color: '#64748b' }}
                id="topbarDropdownRole"
              >
                {user.menuRole}
              </div>
            </div>
            <Link
              to="/login"
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                color: '#ef4444',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'background 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#fef2f2')}
              onMouseOut={e =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <i className="pi pi-sign-out" style={{ fontSize: 14 }} />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
