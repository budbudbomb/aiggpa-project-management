const COLLAPSE_KEY = 'aiggpa_sidebar_collapsed';

export function applySidebarState(isCollapsed: boolean): void {
  document.documentElement.classList.toggle('sidebar-collapsed', isCollapsed);
  if (document.body)
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
  document
    .getElementById('mainSidebar')
    ?.classList.toggle('collapsed', isCollapsed);
}

export function toggleSidebarCollapse(): boolean {
  const isCurrentlyCollapsed =
    document.documentElement.classList.contains('sidebar-collapsed') ||
    (document.body != null &&
      document.body.classList.contains('sidebar-collapsed'));
  const newState = !isCurrentlyCollapsed;
  applySidebarState(newState);
  try {
    localStorage.setItem(COLLAPSE_KEY, String(newState));
  } catch {
    /* ignore */
  }
  return newState;
}

export function initSidebarFromStorage(): void {
  try {
    if (localStorage.getItem(COLLAPSE_KEY) === 'true') {
      applySidebarState(true);
    }
  } catch {
    /* ignore */
  }
}

export function registerSidebarShortcut(): void {
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      const tag = document.activeElement?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    }
  });
}
