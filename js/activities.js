/**
 * Activities Controller (Tasks, Surveys & Meetings)
 * Tab-driven UI with Meeting Detail / RSVP modal
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Sidebar collapse toggle ──
  const sidebar = document.getElementById('mainSidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const collapseTrigger = document.getElementById('sidebarCollapseTrigger');
  const brandIcon = document.getElementById('sidebarBrandIcon');

  function doSidebarToggle() {
    if (typeof window.toggleAiggpaSidebar === 'function') {
      window.toggleAiggpaSidebar();
    } else {
      const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
      document.documentElement.classList.toggle('sidebar-collapsed', isCollapsed);
      if (sidebar) sidebar.classList.toggle('collapsed', isCollapsed);
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      doSidebarToggle();
    });
  }
  if (collapseTrigger) {
    collapseTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      doSidebarToggle();
    });
  }
  if (brandIcon) {
    brandIcon.addEventListener('click', (e) => {
      if (document.documentElement.classList.contains('sidebar-collapsed') ||
          document.body?.classList.contains('sidebar-collapsed')) {
        e.preventDefault();
        doSidebarToggle();
      }
    });
  }

  // ── Top User Dropdown ──
  const userDropBtn = document.getElementById('topUserDropdownBtn');
  const userDropMenu = document.getElementById('topUserDropdownMenu');
  if (userDropBtn && userDropMenu) {
    userDropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropMenu.style.display = userDropMenu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => { userDropMenu.style.display = 'none'; });
  }

  // ── Generic modal helpers ──
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  }
  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal-backdrop')));
  });
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) closeModal(e.target);
  });

  // ── Populate project selects ──
  function populateProjects() {
    const projects = Store.getProjects();
    ['taskProjectSelect', 'meetingProjectSelect'].forEach(sId => {
      const el = document.getElementById(sId);
      if (el) el.innerHTML = projects.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
    });

    const actProjectFilter = document.getElementById('actProjectFilter');
    if (actProjectFilter) {
      const currentSelected = actProjectFilter.value;
      actProjectFilter.innerHTML = '<option value="">All Projects</option>' +
        projects.map(p => `<option value="${escapeHtml(p.name)}"${p.name === currentSelected ? ' selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
    }
  }

  // ── Avatar & Assignee Helpers (Matching Screenshot 2) ──
  const AVATAR_COLORS = [
    '#7c3aed', // purple (RS)
    '#059669', // teal/green (PP)
    '#8b5cf6', // purple (SM)
    '#d97706', // orange/amber (VT)
    '#2563eb', // blue
    '#dc2626', // red
    '#0891b2', // cyan
    '#ea580c'  // orange
  ];

  const MEMBER_COLOR_MAP = {
    'Dr. Rameshwar Singh': '#7c3aed',
    'Priya Patel': '#059669',
    'Sunita Meena': '#8b5cf6',
    'Vikas Tiwari': '#d97706',
    'Amit Sharma': '#2563eb',
    'Dr. A. Verma': '#7c3aed',
    'P. Joshi': '#059669',
    'R. Sharma': '#d97706',
    'Dr. Neha Gupta': '#ea580c',
    'Prof. Manish Gupta': '#0891b2'
  };

  function getAvatarInitials(name) {
    if (!name) return 'U';
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  function getAvatarColor(name) {
    if (MEMBER_COLOR_MAP[name]) return MEMBER_COLOR_MAP[name];
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i);
      hash |= 0;
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  // Multi-check team members catalog
  const GRID_AVAILABLE_MEMBERS = [
    { name: 'Dr. Rameshwar Singh', role: 'Senior Advisor' },
    { name: 'Priya Patel', role: 'Research Associate' },
    { name: 'Sunita Meena', role: 'Fellow' },
    { name: 'Vikas Tiwari', role: 'Field Investigator' },
    { name: 'Amit Sharma', role: 'Field Investigator' },
    { name: 'Dr. A. Verma', role: 'Lead Advisor' },
    { name: 'Dr. Neha Gupta', role: 'Research Lead' },
    { name: 'Prof. Manish Gupta', role: 'Principal Investigator' }
  ];

  // Default selected assignees for the in-grid quick-add row (5 members matching Screenshot 2)
  let gridSelectedAssignees = [
    'Dr. Rameshwar Singh',
    'Priya Patel',
    'Sunita Meena',
    'Vikas Tiwari',
    'Amit Sharma'
  ];

  function buildAvatarStackHtml(namesList) {
    const list = Array.isArray(namesList) ? namesList : [];
    if (list.length === 0) {
      return `<span style="font-size:0.75rem;font-weight:600;color:#94a3b8;display:inline-flex;align-items:center;gap:4px;"><i class="pi pi-user-plus" style="font-size:11px;"></i> Select</span>`;
    }

    const maxVisible = 4;
    const visible = list.slice(0, maxVisible);
    const remaining = list.length - maxVisible;

    let avatarsHtml = visible.map(name => {
      const initials = getAvatarInitials(name);
      const bg = getAvatarColor(name);
      return `<div class="assignee-avatar-circle" style="background: ${bg};" title="${escapeHtml(name)}">${initials}</div>`;
    }).join('');

    if (remaining > 0) {
      avatarsHtml += `<div class="assignee-avatar-more" title="${remaining} more assignee${remaining > 1 ? 's' : ''}">+${remaining}</div>`;
    }

    return `
      <div class="assignee-avatar-group" style="padding:0;">
        ${avatarsHtml}
        <span style="margin-left: 5px; font-size: 0.74rem; font-weight: 800; color: #1e293b;">${list.length}</span>
      </div>
    `;
  }

  function renderGridAssigneeCheckboxesHtml() {
    return GRID_AVAILABLE_MEMBERS.map(m => {
      const isChecked = gridSelectedAssignees.includes(m.name);
      const initials = getAvatarInitials(m.name);
      const bg = getAvatarColor(m.name);
      return `
        <label style="display:flex;align-items:center;gap:9px;padding:6px 12px;cursor:pointer;transition:background 0.12s;user-select:none;"
          onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'"
          onclick="window.toggleGridAssigneeMember('${escapeHtml(m.name)}', event)">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); window.toggleGridAssigneeMember('${escapeHtml(m.name)}', event)"
            style="width:15px;height:15px;cursor:pointer;accent-color:#2563eb;margin:0;">
          <div class="assignee-avatar-circle" style="width:24px;height:24px;font-size:0.62rem;background:${bg};border:none;margin-left:0;box-shadow:none;">${initials}</div>
          <div style="flex:1;line-height:1.2;">
            <div style="font-size:0.8rem;font-weight:700;color:#1e293b;">${escapeHtml(m.name)}</div>
            <div style="font-size:0.69rem;color:#64748b;">${escapeHtml(m.role)}</div>
          </div>
        </label>
      `;
    }).join('');
  }

  window.toggleGridAssigneeDropdown = function (e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('gridAssigneeDropdownMenu');
    if (!menu) return;
    const isShowing = menu.style.display === 'block';
    menu.style.display = isShowing ? 'none' : 'block';
    if (!isShowing) {
      const listEl = document.getElementById('gridAssigneeItemsList');
      if (listEl) listEl.innerHTML = renderGridAssigneeCheckboxesHtml();
    }
  };

  window.toggleGridAssigneeMember = function (name, e) {
    if (e) e.stopPropagation();
    const idx = gridSelectedAssignees.indexOf(name);
    if (idx !== -1) {
      gridSelectedAssignees.splice(idx, 1);
    } else {
      gridSelectedAssignees.push(name);
    }
    const avatarContent = document.getElementById('gridAssigneeAvatarContent');
    if (avatarContent) {
      avatarContent.innerHTML = buildAvatarStackHtml(gridSelectedAssignees);
    }
    const listEl = document.getElementById('gridAssigneeItemsList');
    if (listEl) listEl.innerHTML = renderGridAssigneeCheckboxesHtml();
  };

  window.setAllGridAssignees = function (selectAll, e) {
    if (e) e.stopPropagation();
    if (selectAll) {
      gridSelectedAssignees = GRID_AVAILABLE_MEMBERS.map(m => m.name);
    } else {
      gridSelectedAssignees = [];
    }
    const avatarContent = document.getElementById('gridAssigneeAvatarContent');
    if (avatarContent) {
      avatarContent.innerHTML = buildAvatarStackHtml(gridSelectedAssignees);
    }
    const listEl = document.getElementById('gridAssigneeItemsList');
    if (listEl) listEl.innerHTML = renderGridAssigneeCheckboxesHtml();
  };

  // Close assignee dropdown on click outside
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('gridAssigneeDropdownMenu');
    const wrapper = document.getElementById('gridAssigneeWrapper');
    if (menu && menu.style.display === 'block') {
      if (!wrapper || !wrapper.contains(e.target)) {
        menu.style.display = 'none';
      }
    }
    const subPop = document.getElementById('subtaskAssigneePopover');
    if (subPop && !subPop.contains(e.target) && !e.target.closest('.subtask-add-assignee-btn') && !e.target.closest('.assignee-avatar-circle') && !e.target.closest('.assignee-avatar-group')) {
      subPop.remove();
    }
  });

  // ── Date formatting helpers (dd/MM/yyyy) ──
  function formatDisplayDate(d) {
    return Store.formatDate ? Store.formatDate(d) : d;
  }
  function formatDisplayDateTime(dt) {
    return Store.formatDateTime ? Store.formatDateTime(dt) : dt;
  }

  // ── Helper to escape HTML ──
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Format Date for Screenshot Grid (e.g. 15 Sep 2026) ──
  function formatScreenshotDate(dStr) {
    if (!dStr) return '—';
    if (dStr.includes('Sep') || dStr.includes('Aug') || dStr.includes('Jul') || dStr.includes('Oct') || dStr.includes('Nov')) return dStr;
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2].padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[monthIdx] || parts[1]} ${year}`;
    }
    return dStr;
  }

  function renderAssigneeBadge(t) {
    let names = [];
    if (t.assignees && t.assignees.length > 0) {
      names = t.assignees.map(a => typeof a === 'string' ? a : a.name).filter(Boolean);
    } else if (t.assignee) {
      names = t.assignee.split(',').map(s => s.trim()).filter(Boolean);
    }

    return `
      <div style="display:inline-flex;align-items:center;gap:6px;">
        ${names.length > 0 ? `
          <div class="assignee-avatar-group" style="padding:0;cursor:pointer;" 
            onclick="window.openTaskReceipts('${t.id}', 'all'); event.stopPropagation();"
            title="${escapeHtml(names.join(', '))}">
            ${names.slice(0, 4).map((name, idx) => `
              <div class="assignee-avatar-circle" 
                style="width:24px;height:24px;font-size:0.62rem;background:${getAvatarColor(name)};border:2px solid #ffffff;margin-left:${idx > 0 ? '-6px' : '0'};box-shadow:0 1px 2px rgba(0,0,0,0.1);">
                ${getAvatarInitials(name)}
              </div>
            `).join('')}
            ${names.length > 4 ? `<div class="assignee-avatar-more" style="width:24px;height:24px;font-size:0.58rem;">+${names.length - 4}</div>` : ''}
            <span style="margin-left:5px;font-size:0.74rem;font-weight:800;color:#1e293b;">${names.length}</span>
          </div>
        ` : ''}
        <button type="button" class="subtask-add-assignee-btn" 
          onclick="window.openTaskReceipts('${t.id}', 'all'); event.stopPropagation();"
          title="${names.length > 0 ? 'Change / View Assignees' : 'Add Assignee'}"
          style="width:24px;height:24px;border-radius:50%;border:1.5px dashed #94a3b8;background:#f8fafc;color:#64748b;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:all 0.15s ease;box-sizing:border-box;"
          onmouseover="this.style.borderColor='#2563eb';this.style.color='#2563eb';this.style.background='#eff6ff';"
          onmouseout="this.style.borderColor='#94a3b8';this.style.color='#64748b';this.style.background='#f8fafc';">
          <i class="pi pi-user-plus" style="font-size:9px;"></i>
        </button>
      </div>
    `;
  }

  function renderPriorityBadge(priority, taskId = null, subtaskId = null) {
    const p = (priority || 'Medium').trim();
    let bg = '#fffbeb', color = '#b45309', border = '#fde68a', dot = '#f59e0b';
    if (p === 'High') {
      bg = '#fef2f2'; color = '#dc2626'; border = '#fecaca'; dot = '#ef4444';
    } else if (p === 'Low') {
      bg = '#f0fdf4'; color = '#15803d'; border = '#bbf7d0'; dot = '#10b981';
    }

    if (!taskId) {
      return `
        <span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:9999px;background:${bg};color:${color};border:1px solid ${border};font-size:0.70rem;font-weight:700;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
          <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${dot};"></span>
          <span>${p}</span>
        </span>
      `;
    }

    const onchangeCall = subtaskId
      ? `window.updateGridSubtaskField('${taskId}', '${subtaskId}', 'priority', this.value); event.stopPropagation();`
      : `window.updateGridTaskField('${taskId}', 'priority', this.value); event.stopPropagation();`;

    return `
      <div style="position:relative;display:inline-block;white-space:nowrap;" onclick="event.stopPropagation();" title="Click to change priority">
        <select onchange="${onchangeCall}" onclick="event.stopPropagation();"
          style="appearance:none;-webkit-appearance:none;background:${bg};color:${color};border:1px solid ${border};border-radius:9999px;font-size:0.70rem;font-weight:700;padding:3px 18px 3px 8px;cursor:pointer;outline:none;font-family:inherit;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,0.03);transition:all 0.15s ease;">
          <option value="High" ${p === 'High' ? 'selected' : ''} style="color:#dc2626;background:#fff;">• High</option>
          <option value="Medium" ${p === 'Medium' ? 'selected' : ''} style="color:#b45309;background:#fff;">• Medium</option>
          <option value="Low" ${p === 'Low' ? 'selected' : ''} style="color:#15803d;background:#fff;">• Low</option>
        </select>
        <i class="pi pi-chevron-down" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:7px;color:${color};pointer-events:none;"></i>
      </div>
    `;
  }

  function renderStatusBadge(status, taskId = null, subtaskId = null) {
    const s = (status || 'In Progress').trim();
    let bg = '#eff6ff', color = '#2563eb', border = '#bfdbfe';
    if (s === 'Completed') {
      bg = '#f0fdf4'; color = '#15803d'; border = '#bbf7d0';
    } else if (s === 'Pending') {
      bg = '#fffbeb'; color = '#b45309'; border = '#fde68a';
    } else if (s === 'Overdue') {
      bg = '#fef2f2'; color = '#dc2626'; border = '#fecaca';
    }

    if (!taskId) {
      return `
        <span style="display:inline-flex;align-items:center;justify-content:center;padding:3px 10px;border-radius:9999px;background:${bg};color:${color};border:1px solid ${border};font-size:0.70rem;font-weight:700;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
          ${s}
        </span>
      `;
    }

    const onchangeCall = subtaskId
      ? `window.updateGridSubtaskField('${taskId}', '${subtaskId}', 'status', this.value); event.stopPropagation();`
      : `window.updateGridTaskField('${taskId}', 'status', this.value); event.stopPropagation();`;

    return `
      <div style="position:relative;display:inline-block;white-space:nowrap;" onclick="event.stopPropagation();" title="Click to change status">
        <select onchange="${onchangeCall}" onclick="event.stopPropagation();"
          style="appearance:none;-webkit-appearance:none;background:${bg};color:${color};border:1px solid ${border};border-radius:9999px;font-size:0.70rem;font-weight:700;padding:3px 18px 3px 8px;cursor:pointer;outline:none;font-family:inherit;text-align:center;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,0.03);transition:all 0.15s ease;">
          <option value="In Progress" ${s === 'In Progress' ? 'selected' : ''} style="color:#2563eb;background:#fff;">In Progress</option>
          <option value="Pending" ${s === 'Pending' ? 'selected' : ''} style="color:#b45309;background:#fff;">Pending</option>
          <option value="Completed" ${s === 'Completed' ? 'selected' : ''} style="color:#15803d;background:#fff;">Completed</option>
          <option value="Overdue" ${s === 'Overdue' ? 'selected' : ''} style="color:#dc2626;background:#fff;">Overdue</option>
        </select>
        <i class="pi pi-chevron-down" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:7px;color:${color};pointer-events:none;"></i>
      </div>
    `;
  }

  function renderDueDateCell(dueDate, status) {
    const formatted = formatScreenshotDate(dueDate);
    const isOverdue = status === 'Overdue' || (dueDate && dueDate < '2026-09-01' && status !== 'Completed');
    return `
      <div style="display:inline-flex;align-items:center;gap:5px;font-size:0.76rem;font-weight:600;color:#334155;white-space:nowrap;">
        <i class="pi pi-calendar" style="font-size:11px;color:#94a3b8;"></i>
        <span>${formatted}</span>
        ${isOverdue ? `
          <span style="background:#fef2f2;color:#ef4444;border:1px solid #fecaca;font-size:0.62rem;font-weight:800;padding:1px 5px;border-radius:4px;margin-left:3px;">Overdue</span>
        ` : ''}
      </div>
    `;
  }

  window.editTask = function (id) {
    const list = Store.getTasks();
    const t = list.find(x => x.id === id);
    if (!t) return;
    populateProjects();
    const titleIn = document.getElementById('taskTitleIn');
    const descIn = document.getElementById('taskDescIn');
    const dueIn = document.getElementById('taskDueIn');
    const prioIn = document.getElementById('taskPrioritySelect');
    if (titleIn) titleIn.value = t.title || '';
    if (descIn) descIn.value = t.description || '';
    if (dueIn) dueIn.value = t.dueDate || '';
    if (prioIn) prioIn.value = t.priority || 'Medium';
    openModal('modalNewTask');
  };


  // ══════════════════════════════════════════════
  //  TAB STATE & PAGINATION STATE
  // ══════════════════════════════════════════════
  let currentTab = 'task';
  let currentPage = 1;
  const pageSize = 10;
  let hasSearched = true;
  let expandedTaskIds = new Set(['TSK-01']);
  let kpiStatusFilter = 'all';

  // Check URL params for initial tab
  const urlParams = new URLSearchParams(window.location.search);
  const initCat = urlParams.get('category');
  if (initCat === 'survey') {
    window.location.href = 'create-survey.html';
    return;
  }
  if (initCat && ['task', 'meeting'].includes(initCat)) currentTab = initCat;

  window.switchTab = function (tab) {
    if (tab !== 'task' && tab !== 'meeting') tab = 'task';
    currentTab = tab;
    currentPage = 1;

    // Update tab buttons (clean - no badge numbers)
    ['task', 'meeting'].forEach(t => {
      const btn = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
      if (btn) btn.classList.toggle('active', t === tab);
    });

    // Update action button label
    const lblMap = { task: 'New Standard Task', meeting: 'Schedule Meeting' };
    const lbl = document.getElementById('lblDynamicNewActivity');
    if (lbl) lbl.textContent = lblMap[tab] || 'New';

    // Reset filter input
    const filter = document.getElementById('actTableFilter');
    if (filter) filter.value = '';

    renderTable();
  };

  window.goToPage = function (page) {
    currentPage = page;
    renderTable();
  };

  // ── Dynamic In-Grid Task Field Update ──
  window.updateGridTaskField = function (taskId, field, value) {
    Store.updateTaskField(taskId, field, value);
    if (typeof showToast === 'function') {
      showToast(`Task ${field} updated to "${value}"`);
    }
    renderTable();
  };

  // ── Dynamic In-Grid Subtask Field Update ──
  window.updateGridSubtaskField = function (taskId, subtaskId, field, value) {
    Store.updateSubtaskField(taskId, subtaskId, field, value);
    if (typeof showToast === 'function') {
      showToast(`Subtask ${field} updated to "${value}"`);
    }
    renderTable();
  };

  // ── Multi-check Subtask Assignee Popover ──
  window.openSubtaskAssigneePicker = function (taskId, subtaskId, triggerEl, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const existing = document.getElementById('subtaskAssigneePopover');
    if (existing) {
      const isSame = existing.dataset.taskId === taskId && existing.dataset.subtaskId === subtaskId;
      existing.remove();
      if (isSame) return;
    }

    const popover = document.createElement('div');
    popover.id = 'subtaskAssigneePopover';
    popover.dataset.taskId = taskId;
    popover.dataset.subtaskId = subtaskId;
    popover.className = 'grid-assignee-dropdown';
    popover.style.cssText = 'position:fixed;z-index:99999;background:#ffffff;border:1.5px solid #cbd5e1;border-radius:8px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.18), 0 8px 10px -6px rgba(0,0,0,0.1);width:230px;overflow:hidden;font-family:inherit;display:block;';

    const rect = triggerEl.getBoundingClientRect();
    let top = rect.bottom + 4;
    let left = rect.left;
    if (left + 230 > window.innerWidth) {
      left = Math.max(10, window.innerWidth - 240);
    }
    if (top + 280 > window.innerHeight) {
      top = Math.max(10, rect.top - 280);
    }
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    window.renderSubtaskAssigneePopoverContent(taskId, subtaskId, popover);
    document.body.appendChild(popover);
  };

  window.renderSubtaskAssigneePopoverContent = function (taskId, subtaskId, popover) {
    const t = Store.getTasks().find(x => x.id === taskId);
    const st = t && Array.isArray(t.subtasks) ? t.subtasks.find(s => s.id === subtaskId) : null;
    const rawAssignees = st ? (st.assignees || (st.assignee ? st.assignee.split(',').map(s => s.trim()).filter(Boolean) : [])) : [];
    const currentAssignees = Array.isArray(rawAssignees) ? rawAssignees.map(a => typeof a === 'string' ? a : a.name).filter(Boolean) : [];

    const itemsHtml = GRID_AVAILABLE_MEMBERS.map(m => {
      const isChecked = currentAssignees.includes(m.name);
      const initials = getAvatarInitials(m.name);
      const bg = getAvatarColor(m.name);
      return `
        <label style="display:flex;align-items:center;gap:9px;padding:6px 12px;cursor:pointer;transition:background 0.12s;user-select:none;${isChecked ? 'background:#f8fafc;' : ''}"
          onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='${isChecked ? '#f8fafc' : 'transparent'}'"
          onclick="window.toggleSubtaskMember('${taskId}', '${subtaskId}', '${escapeHtml(m.name)}', event)">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); window.toggleSubtaskMember('${taskId}', '${subtaskId}', '${escapeHtml(m.name)}', event)"
            style="width:15px;height:15px;cursor:pointer;accent-color:#2563eb;margin:0;">
          <div class="assignee-avatar-circle" style="width:24px;height:24px;font-size:0.62rem;background:${bg};border:none;margin-left:0;box-shadow:none;flex-shrink:0;">${initials}</div>
          <div style="flex:1;min-width:0;line-height:1.2;">
            <div style="font-size:0.80rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(m.name)}</div>
            <div style="font-size:0.69rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(m.role)}</div>
          </div>
        </label>
      `;
    }).join('');

    popover.innerHTML = `
      <div style="padding:6px 12px 8px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;background:#f8fafc;">
        <span style="font-size:0.70rem;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.04em;">Assign Team</span>
        <div style="display:flex;gap:6px;align-items:center;">
          <button type="button" onclick="window.setAllSubtaskAssignees('${taskId}', '${subtaskId}', true, event)" style="background:none;border:none;color:#2563eb;font-size:0.70rem;font-weight:700;cursor:pointer;padding:2px 4px;">All</button>
          <span style="color:#cbd5e1;font-size:0.70rem;">|</span>
          <button type="button" onclick="window.setAllSubtaskAssignees('${taskId}', '${subtaskId}', false, event)" style="background:none;border:none;color:#64748b;font-size:0.70rem;font-weight:700;cursor:pointer;padding:2px 4px;">Clear</button>
        </div>
      </div>
      <div style="max-height:220px;overflow-y:auto;padding:4px 0;">
        ${itemsHtml}
      </div>
    `;
  };

  window.toggleSubtaskMember = function (taskId, subtaskId, memberName, e) {
    if (e) e.stopPropagation();
    const t = Store.getTasks().find(x => x.id === taskId);
    const st = t && Array.isArray(t.subtasks) ? t.subtasks.find(s => s.id === subtaskId) : null;
    if (!st) return;

    let list = Array.isArray(st.assignees) ? [...st.assignees] : (st.assignee ? st.assignee.split(',').map(s => s.trim()).filter(Boolean) : []);
    const idx = list.indexOf(memberName);
    if (idx !== -1) {
      list.splice(idx, 1);
    } else {
      list.push(memberName);
    }
    Store.updateSubtaskField(taskId, subtaskId, 'assignees', list);

    const popover = document.getElementById('subtaskAssigneePopover');
    if (popover && popover.dataset.subtaskId === subtaskId) {
      window.renderSubtaskAssigneePopoverContent(taskId, subtaskId, popover);
    }
    renderTable();
  };

  window.setAllSubtaskAssignees = function (taskId, subtaskId, selectAll, e) {
    if (e) e.stopPropagation();
    const list = selectAll ? GRID_AVAILABLE_MEMBERS.map(m => m.name) : [];
    Store.updateSubtaskField(taskId, subtaskId, 'assignees', list);

    const popover = document.getElementById('subtaskAssigneePopover');
    if (popover && popover.dataset.subtaskId === subtaskId) {
      window.renderSubtaskAssigneePopoverContent(taskId, subtaskId, popover);
    }
    renderTable();
  };

  // ── Quick Subtask Inline Multi-check Assignee Picker ──
  let quickSubtaskAssigneesMap = {};

  window.openQuickSubtaskAssigneePicker = function (taskId, triggerEl, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const existing = document.getElementById('subtaskAssigneePopover');
    if (existing) {
      const isSame = existing.dataset.taskId === taskId && existing.dataset.isQuickAdd === 'true';
      existing.remove();
      if (isSame) return;
    }

    const popover = document.createElement('div');
    popover.id = 'subtaskAssigneePopover';
    popover.dataset.taskId = taskId;
    popover.dataset.isQuickAdd = 'true';
    popover.className = 'grid-assignee-dropdown';
    popover.style.cssText = 'position:fixed;z-index:99999;background:#ffffff;border:1.5px solid #cbd5e1;border-radius:8px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.18), 0 8px 10px -6px rgba(0,0,0,0.1);width:230px;overflow:hidden;font-family:inherit;display:block;';

    const rect = triggerEl.getBoundingClientRect();
    let top = rect.bottom + 4;
    let left = rect.left;
    if (left + 230 > window.innerWidth) {
      left = Math.max(10, window.innerWidth - 240);
    }
    if (top + 280 > window.innerHeight) {
      top = Math.max(10, rect.top - 280);
    }
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    window.renderQuickSubtaskAssigneePopoverContent(taskId, popover);
    document.body.appendChild(popover);
  };

  window.renderQuickSubtaskAssigneePopoverContent = function (taskId, popover) {
    if (!Array.isArray(quickSubtaskAssigneesMap[taskId])) {
      const val = document.getElementById('quickSubtaskAssignee-' + taskId)?.value || '';
      quickSubtaskAssigneesMap[taskId] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
    }
    const currentAssignees = quickSubtaskAssigneesMap[taskId];

    const itemsHtml = GRID_AVAILABLE_MEMBERS.map(m => {
      const isChecked = currentAssignees.includes(m.name);
      const initials = getAvatarInitials(m.name);
      const bg = getAvatarColor(m.name);
      return `
        <label style="display:flex;align-items:center;gap:9px;padding:6px 12px;cursor:pointer;transition:background 0.12s;user-select:none;${isChecked ? 'background:#f8fafc;' : ''}"
          onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='${isChecked ? '#f8fafc' : 'transparent'}'"
          onclick="window.toggleQuickSubtaskMember('${taskId}', '${escapeHtml(m.name)}', event)">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); window.toggleQuickSubtaskMember('${taskId}', '${escapeHtml(m.name)}', event)"
            style="width:15px;height:15px;cursor:pointer;accent-color:#2563eb;margin:0;">
          <div class="assignee-avatar-circle" style="width:24px;height:24px;font-size:0.62rem;background:${bg};border:none;margin-left:0;box-shadow:none;flex-shrink:0;">${initials}</div>
          <div style="flex:1;min-width:0;line-height:1.2;">
            <div style="font-size:0.80rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(m.name)}</div>
            <div style="font-size:0.69rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(m.role)}</div>
          </div>
        </label>
      `;
    }).join('');

    popover.innerHTML = `
      <div style="padding:6px 12px 8px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;background:#f8fafc;">
        <span style="font-size:0.70rem;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.04em;">Assign Team</span>
        <div style="display:flex;gap:6px;align-items:center;">
          <button type="button" onclick="window.setAllQuickSubtaskAssignees('${taskId}', true, event)" style="background:none;border:none;color:#2563eb;font-size:0.70rem;font-weight:700;cursor:pointer;padding:2px 4px;">All</button>
          <span style="color:#cbd5e1;font-size:0.70rem;">|</span>
          <button type="button" onclick="window.setAllQuickSubtaskAssignees('${taskId}', false, event)" style="background:none;border:none;color:#64748b;font-size:0.70rem;font-weight:700;cursor:pointer;padding:2px 4px;">Clear</button>
        </div>
      </div>
      <div style="max-height:220px;overflow-y:auto;padding:4px 0;">
        ${itemsHtml}
      </div>
    `;
  };

  window.toggleQuickSubtaskMember = function (taskId, memberName, e) {
    if (e) e.stopPropagation();
    if (!Array.isArray(quickSubtaskAssigneesMap[taskId])) {
      quickSubtaskAssigneesMap[taskId] = [];
    }
    const list = quickSubtaskAssigneesMap[taskId];
    const idx = list.indexOf(memberName);
    if (idx !== -1) {
      list.splice(idx, 1);
    } else {
      list.push(memberName);
    }
    window.syncQuickSubtaskAssigneeDisplay(taskId);
    const popover = document.getElementById('subtaskAssigneePopover');
    if (popover && popover.dataset.taskId === taskId && popover.dataset.isQuickAdd === 'true') {
      window.renderQuickSubtaskAssigneePopoverContent(taskId, popover);
    }
  };

  window.setAllQuickSubtaskAssignees = function (taskId, selectAll, e) {
    if (e) e.stopPropagation();
    quickSubtaskAssigneesMap[taskId] = selectAll ? GRID_AVAILABLE_MEMBERS.map(m => m.name) : [];
    window.syncQuickSubtaskAssigneeDisplay(taskId);
    const popover = document.getElementById('subtaskAssigneePopover');
    if (popover && popover.dataset.taskId === taskId && popover.dataset.isQuickAdd === 'true') {
      window.renderQuickSubtaskAssigneePopoverContent(taskId, popover);
    }
  };

  window.syncQuickSubtaskAssigneeDisplay = function (taskId) {
    const list = quickSubtaskAssigneesMap[taskId] || [];
    const hiddenIn = document.getElementById('quickSubtaskAssignee-' + taskId);
    if (hiddenIn) hiddenIn.value = list.join(', ');

    const avatarBox = document.getElementById('quickSubtaskAvatarContainer-' + taskId);
    if (avatarBox) {
      if (list.length > 0) {
        avatarBox.innerHTML = `
          <div class="assignee-avatar-group" style="padding:0;margin-right:4px;cursor:pointer;" 
            onclick="const btn = document.getElementById('quickSubtaskAssigneeBtn-${taskId}'); if(btn) window.openQuickSubtaskAssigneePicker('${taskId}', btn, event)"
            title="${escapeHtml(list.join(', '))}">
            ${list.slice(0, 4).map((name, i) => `
              <div class="assignee-avatar-circle" style="width:22px;height:22px;font-size:0.60rem;background:${getAvatarColor(name)};border:none;margin-left:${i > 0 ? '-5px' : '0'};box-shadow:none;">${getAvatarInitials(name)}</div>
            `).join('')}
            ${list.length > 4 ? `<div class="assignee-avatar-more" style="width:22px;height:22px;font-size:0.55rem;">+${list.length - 4}</div>` : ''}
            <span style="margin-left:5px;font-size:0.74rem;font-weight:800;color:#1e293b;">${list.length}</span>
          </div>
        `;
      } else {
        avatarBox.innerHTML = '';
      }
    }
  };

  window.updateQuickSubtaskPriorityStyle = function (selectEl) {
    if (!selectEl) return;
    const p = selectEl.value;
    let bg = '#fffbeb', color = '#d97706', border = '#fde68a';
    if (p === 'High') {
      bg = '#fef2f2'; color = '#dc2626'; border = '#fecaca';
    } else if (p === 'Low') {
      bg = '#f0fdf4'; color = '#16a34a'; border = '#bbf7d0';
    }
    selectEl.style.background = bg;
    selectEl.style.color = color;
    selectEl.style.borderColor = border;
    const chevron = selectEl.nextElementSibling;
    if (chevron) chevron.style.color = color;
  };

  window.updateQuickSubtaskStatusStyle = function (selectEl) {
    if (!selectEl) return;
    const s = selectEl.value;
    let bg = '#f0f9ff', color = '#0284c7', border = '#bae6fd';
    if (s === 'Completed') {
      bg = '#f0fdf4'; color = '#16a34a'; border = '#bbf7d0';
    } else if (s === 'Pending') {
      bg = '#fffbeb'; color = '#d97706'; border = '#fde68a';
    } else if (s === 'Overdue') {
      bg = '#fef2f2'; color = '#dc2626'; border = '#fecaca';
    }
    selectEl.style.background = bg;
    selectEl.style.color = color;
    selectEl.style.borderColor = border;
    const chevron = selectEl.nextElementSibling;
    if (chevron) chevron.style.color = color;
  };

  // ── Grid Meeting Details State & Modal ──
  let gridMeetingDetails = {
    url: '',
    duration: '45 mins',
    description: ''
  };

  window.openGridMeetingDetailsModal = function () {
    const urlIn = document.getElementById('gridMeetingUrlIn');
    const durIn = document.getElementById('gridMeetingDurationSelect');
    const descIn = document.getElementById('gridMeetingDescIn');
    if (urlIn) urlIn.value = gridMeetingDetails.url || '';
    if (durIn) durIn.value = gridMeetingDetails.duration || '45 mins';
    if (descIn) descIn.value = gridMeetingDetails.description || '';
    openModal('modalGridMeetingDetails');
  };

  window.saveGridMeetingDetailsModal = function () {
    const urlIn = document.getElementById('gridMeetingUrlIn');
    const durIn = document.getElementById('gridMeetingDurationSelect');
    const descIn = document.getElementById('gridMeetingDescIn');

    gridMeetingDetails.url = urlIn ? urlIn.value.trim() : '';
    gridMeetingDetails.duration = durIn ? durIn.value : '45 mins';
    gridMeetingDetails.description = descIn ? descIn.value.trim() : '';

    const pencilBtn = document.getElementById('gridMeetingPencilBtn');
    const pencilText = document.getElementById('gridMeetingPencilText');
    if (pencilBtn) {
      if (gridMeetingDetails.url || gridMeetingDetails.description) {
        pencilBtn.style.background = '#dcfce7';
        pencilBtn.style.borderColor = '#86efac';
        pencilBtn.style.color = '#15803d';
        if (pencilText) pencilText.textContent = 'Details Added ✓';
      } else {
        pencilBtn.style.background = '#eff6ff';
        pencilBtn.style.borderColor = '#bfdbfe';
        pencilBtn.style.color = '#2563eb';
        if (pencilText) pencilText.textContent = 'Meeting Details';
      }
    }

    closeModal(document.getElementById('modalGridMeetingDetails'));
    if (typeof showToast === 'function') {
      showToast('Meeting details saved!');
    }
  };

  // ── Dynamic In-Grid Task Type Selector ──
  window.selectGridTaskType = function (type) {
    const input = document.getElementById('gridNewTaskType');
    if (input) input.value = type;

    const pills = [
      { id: 'pillTypeStandard', type: 'standard', cls: 'active' },
      { id: 'pillTypeSurvey', type: 'survey', cls: 'active pill-survey' },
      { id: 'pillTypeMeeting', type: 'meeting', cls: 'active pill-meeting' },
      { id: 'pillTypeMilestone', type: 'milestone', cls: 'active pill-milestone' }
    ];

    pills.forEach(p => {
      const el = document.getElementById(p.id);
      if (el) {
        el.className = 'grid-type-pill' + (p.type === type ? ` ${p.cls}` : '');
      }
    });

    const titleEl = document.getElementById('gridNewTaskTitle');
    const surveySelect = document.getElementById('gridNewTaskSurveySelect');
    const badgeIcon = document.getElementById('gridTypeBadgeIcon');
    const pencilBtn = document.getElementById('gridMeetingPencilBtn');

    if (type === 'survey') {
      if (titleEl) titleEl.style.display = 'none';
      if (surveySelect) {
        surveySelect.style.display = 'block';
        const selectorBox = document.getElementById('gridTaskSelectorBox');
        if (selectorBox && selectorBox.offsetWidth > 0) {
          surveySelect.style.width = selectorBox.offsetWidth + 'px';
          surveySelect.style.maxWidth = selectorBox.offsetWidth + 'px';
        } else {
          surveySelect.style.width = '335px';
          surveySelect.style.maxWidth = '335px';
        }
        surveySelect.style.flex = 'none';
        surveySelect.focus();
      }
      if (pencilBtn) pencilBtn.style.display = 'none';
      if (badgeIcon) {
        badgeIcon.innerHTML = '📋';
        badgeIcon.style.background = '#faf5ff';
        badgeIcon.style.color = '#9333ea';
      }
    } else if (type === 'meeting') {
      if (titleEl) {
        titleEl.style.display = 'block';
        titleEl.placeholder = 'Write meeting task title (e.g. Weekly Governance Sync) & press Enter...';
        titleEl.focus();
      }
      if (surveySelect) surveySelect.style.display = 'none';
      if (pencilBtn) pencilBtn.style.display = 'inline-flex';
      if (badgeIcon) {
        badgeIcon.innerHTML = '📅';
        badgeIcon.style.background = '#eff6ff';
        badgeIcon.style.color = '#2563eb';
      }
    } else if (type === 'milestone') {
      if (titleEl) {
        titleEl.style.display = 'block';
        titleEl.placeholder = '◆ Enter milestone name (e.g. Field Survey Complete) & press Enter...';
        titleEl.focus();
      }
      if (surveySelect) surveySelect.style.display = 'none';
      if (pencilBtn) pencilBtn.style.display = 'none';
      if (badgeIcon) {
        badgeIcon.innerHTML = '◆';
        badgeIcon.style.background = '#fef3c7';
        badgeIcon.style.color = '#d97706';
      }
    } else {
      if (titleEl) {
        titleEl.style.display = 'block';
        titleEl.placeholder = 'Write standard task name & press Enter to add...';
        titleEl.focus();
      }
      if (surveySelect) surveySelect.style.display = 'none';
      if (pencilBtn) pencilBtn.style.display = 'none';
      if (badgeIcon) {
        badgeIcon.innerHTML = '+';
        badgeIcon.style.background = '#e0e7ff';
        badgeIcon.style.color = '#1837d4';
      }
    }
  };

  // Sync survey dropdown width on window resize
  window.addEventListener('resize', () => {
    const surveySelect = document.getElementById('gridNewTaskSurveySelect');
    const selectorBox = document.getElementById('gridTaskSelectorBox');
    if (surveySelect && selectorBox && selectorBox.offsetWidth > 0 && surveySelect.style.display !== 'none') {
      surveySelect.style.width = selectorBox.offsetWidth + 'px';
      surveySelect.style.maxWidth = selectorBox.offsetWidth + 'px';
    }
  });

  // ── Dynamic In-Grid Task Creation Row HTML ──
  function getGridInlineCreationRowHtml() {
    const toDate = document.getElementById('actToDate')?.value || '';
    const fromDate = document.getElementById('actFromDate')?.value || '';
    const defaultDueDate = toDate || fromDate || '2026-09-23';
    const surveys = Store.getSurveys();

    return `
      <tr id="gridQuickAddRow" class="grid-quick-add-row" style="background:#f8fafc;border-bottom:1.5px solid #e2e8f0;transition:all 0.25s ease;">
        <!-- 1. TASK SELECTOR ON TOP & TEXT FIELD / DROPDOWN BELOW IT -->
        <td style="padding:8px 10px;vertical-align:middle;">
          <div style="display:flex;flex-direction:column;gap:6px;">
            <!-- TOP ROW: TYPE SELECTOR -->
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="display:inline-flex;align-items:center;gap:5px;">
                <span style="color:#64748b;font-weight:700;font-size:0.69rem;text-transform:uppercase;letter-spacing:0.04em;">Type:</span>
                <div id="gridTaskSelectorBox" style="display:inline-flex;align-items:center;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:9px;padding:2px;gap:2px;box-shadow:inset 0 1px 2px rgba(0,0,0,0.03);">
                  <button type="button" class="grid-type-pill active" id="pillTypeStandard" onclick="window.selectGridTaskType('standard')" title="Standard Deliverable Task">
                    📌 Standard task
                  </button>
                  <button type="button" class="grid-type-pill" id="pillTypeSurvey" onclick="window.selectGridTaskType('survey')" title="Field Survey Task">
                    📋 Survey task
                  </button>
                  <button type="button" class="grid-type-pill" id="pillTypeMeeting" onclick="window.selectGridTaskType('meeting')" title="Review / Sync Meeting Task">
                    📅 Meeting task
                  </button>
                  <button type="button" class="grid-type-pill" id="pillTypeMilestone" onclick="window.selectGridTaskType('milestone')" title="Project Milestone">
                    ◆ Milestone
                  </button>
                </div>
                <input type="hidden" id="gridNewTaskType" value="standard">
              </div>
            </div>

            <!-- BOTTOM ROW: TEXT FIELD (OR DROPDOWN FOR SURVEY) & PENCIL ICON ON RIGHT -->
            <div style="display:flex;align-items:center;gap:6px;">
              <span id="gridTypeBadgeIcon" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:7px;background:linear-gradient(135deg, #2563eb, #1d4ed8);color:#ffffff;font-size:13px;font-weight:800;flex-shrink:0;box-shadow:0 2px 5px rgba(37,99,235,0.25);">+</span>
              
              <!-- Standard / Meeting Text Input -->
              <input type="text" id="gridNewTaskTitle" placeholder="Write standard task name &amp; press Enter to add..." 
                onkeydown="if(event.key === 'Enter') { event.preventDefault(); window.createTaskFromGrid(); }"
                style="flex:1;min-width:0;border:1px solid #cbd5e1;background:#ffffff;border-radius:7px;padding:5px 10px;font-size:0.80rem;font-weight:600;color:#0f172a;outline:none;font-family:inherit;box-shadow:0 1px 2px rgba(0,0,0,0.03);transition:all 0.18s ease;"
                onfocus="this.style.borderColor='#3b82f6';this.style.boxShadow='0 0 0 3px rgba(59,130,246,0.12)';"
                onblur="this.style.borderColor='#cbd5e1';this.style.boxShadow='0 1px 2px rgba(0,0,0,0.03)';">

              <!-- Survey Dropdown (shown when survey task is selected - width matched to task selector) -->
              <select id="gridNewTaskSurveySelect" 
                onkeydown="if(event.key === 'Enter') { event.preventDefault(); window.createTaskFromGrid(); }"
                style="display:none;width:280px;max-width:280px;flex:none;border:1px solid #cbd5e1;background:#ffffff;border-radius:7px;padding:5px 9px;font-size:0.80rem;font-weight:600;color:#0f172a;outline:none;cursor:pointer;font-family:inherit;box-shadow:0 1px 2px rgba(0,0,0,0.03);transition:all 0.18s ease;"
                onfocus="this.style.borderColor='#7c3aed';this.style.boxShadow='0 0 0 3px rgba(124,58,237,0.12)';"
                onblur="this.style.borderColor='#cbd5e1';this.style.boxShadow='0 1px 2px rgba(0,0,0,0.03)';">
                <option value="">-- Select a Survey --</option>
                ${surveys.map(s => `<option value="${escapeHtml(s.name)}" data-project="${escapeHtml(s.project || '')}">📋 ${escapeHtml(s.name)} (${escapeHtml(s.id)})</option>`).join('')}
              </select>

              <!-- Pencil Icon for Meeting Details -->
              <button type="button" id="gridMeetingPencilBtn" onclick="window.openGridMeetingDetailsModal()" 
                style="display:none;align-items:center;gap:4px;border:1px solid #bfdbfe;background:#eff6ff;color:#2563eb;font-size:0.70rem;font-weight:700;padding:4px 8px;border-radius:7px;cursor:pointer;flex-shrink:0;transition:all 0.15s ease;"
                title="Add Meeting URL, Duration & Description"
                onmouseover="this.style.background='#dbeafe';this.style.borderColor='#93c5fd';"
                onmouseout="if(!window.gridMeetingDetails || (!window.gridMeetingDetails.url && !window.gridMeetingDetails.description)){this.style.background='#eff6ff';this.style.borderColor='#bfdbfe';}">
                <i class="pi pi-pencil" style="font-size:11px;"></i>
                <span id="gridMeetingPencilText">Details</span>
              </button>
            </div>
          </div>
        </td>

        <!-- 2. ASSIGNEE: MULTI-CHECK DROPDOWN WITH AVATAR STACK TRIGGER -->
        <td style="padding:8px 8px;vertical-align:middle;">
          <div style="position:relative;display:inline-block;" id="gridAssigneeWrapper">
            <div id="gridAssigneeTrigger" class="grid-assignee-trigger" onclick="window.toggleGridAssigneeDropdown(event)" title="Click to assign team members">
              <div id="gridAssigneeAvatarContent">
                ${buildAvatarStackHtml(gridSelectedAssignees)}
              </div>
              <i class="pi pi-chevron-down" style="font-size:8px;color:#64748b;margin-left:3px;"></i>
            </div>

            <!-- Multi-check Dropdown Menu -->
            <div id="gridAssigneeDropdownMenu" class="grid-assignee-dropdown">
              <div style="padding:6px 12px 8px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.70rem;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.04em;">Assign Team</span>
                <div style="display:flex;gap:6px;align-items:center;">
                  <button type="button" onclick="window.setAllGridAssignees(true, event)" style="background:none;border:none;color:#2563eb;font-size:0.70rem;font-weight:700;cursor:pointer;padding:2px 4px;">All</button>
                  <span style="color:#cbd5e1;font-size:0.70rem;">|</span>
                  <button type="button" onclick="window.setAllGridAssignees(false, event)" style="background:none;border:none;color:#64748b;font-size:0.70rem;font-weight:700;cursor:pointer;padding:2px 4px;">Clear</button>
                </div>
              </div>
              <div id="gridAssigneeItemsList" style="max-height:220px;overflow-y:auto;padding:4px 0;">
                ${renderGridAssigneeCheckboxesHtml()}
              </div>
            </div>
          </div>
        </td>

        <!-- 3. DUE DATE -->
        <td style="padding:8px 8px;vertical-align:middle;">
          <input type="date" id="gridNewTaskDueDate" value="${defaultDueDate}"
            style="width:100%;border:1px solid #cbd5e1;background:#ffffff;border-radius:7px;padding:4px 6px;font-size:0.74rem;font-weight:600;color:#0f172a;outline:none;cursor:pointer;font-family:inherit;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        </td>

        <!-- 4. PRIORITY -->
        <td style="padding:8px 6px;vertical-align:middle;white-space:nowrap;">
          <div style="position:relative;display:inline-block;width:100%;white-space:nowrap;">
            <select id="gridNewTaskPriority" style="width:100%;appearance:none;-webkit-appearance:none;border:1px solid #fde68a;background:#fffbeb;color:#b45309;border-radius:9999px;padding:4px 18px 4px 8px;font-size:0.70rem;font-weight:700;outline:none;cursor:pointer;font-family:inherit;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
              <option value="High" style="color:#dc2626;background:#fff;">• High</option>
              <option value="Medium" selected style="color:#b45309;background:#fff;">• Medium</option>
              <option value="Low" style="color:#15803d;background:#fff;">• Low</option>
            </select>
            <i class="pi pi-chevron-down" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:7px;color:#b45309;pointer-events:none;"></i>
          </div>
        </td>

        <!-- 5. STATUS -->
        <td style="padding:8px 6px;vertical-align:middle;white-space:nowrap;">
          <div style="position:relative;display:inline-block;width:100%;white-space:nowrap;">
            <select id="gridNewTaskStatus" style="width:100%;appearance:none;-webkit-appearance:none;border:1px solid #bfdbfe;background:#eff6ff;color:#2563eb;border-radius:9999px;padding:4px 18px 4px 8px;font-size:0.70rem;font-weight:700;outline:none;cursor:pointer;font-family:inherit;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
              <option value="In Progress" selected style="color:#2563eb;background:#fff;">In Progress</option>
              <option value="Pending" style="color:#b45309;background:#fff;">Pending</option>
              <option value="Completed" style="color:#15803d;background:#fff;">Completed</option>
            </select>
            <i class="pi pi-chevron-down" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:7px;color:#2563eb;pointer-events:none;"></i>
          </div>
        </td>

        <!-- 6. ACTIONS (CIRCULAR ADD BUTTON) -->
        <td style="padding:8px 8px;vertical-align:middle;text-align:center;">
          <button type="button" onclick="window.createTaskFromGrid()" 
            style="width:28px;height:28px;border-radius:50%;border:none;background:linear-gradient(135deg, #2563eb, #1d4ed8);color:#ffffff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 6px rgba(37,99,235,0.3);transition:all 0.18s cubic-bezier(0.16, 1, 0.3, 1);padding:0;"
            onmouseover="this.style.transform='scale(1.1) translateY(-1px)';this.style.boxShadow='0 4px 12px rgba(37,99,235,0.4)';" 
            onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 2px 6px rgba(37,99,235,0.3)';"
            title="Create task immediately (Enter)">
            <i class="pi pi-plus" style="font-size:11px;font-weight:700;"></i>
          </button>
        </td>
      </tr>
    `;
  }

  // ── Dynamic In-Grid Task Creation Handler ──
  window.createTaskFromGrid = function () {
    const taskType = document.getElementById('gridNewTaskType')?.value || 'standard';
    const titleEl = document.getElementById('gridNewTaskTitle');
    const surveySelect = document.getElementById('gridNewTaskSurveySelect');
    
    let title = '';
    let surveyProject = '';
    if (taskType === 'survey') {
      title = (surveySelect ? surveySelect.value : '').trim();
      if (!title) {
        if (surveySelect) {
          surveySelect.focus();
          surveySelect.style.borderColor = '#ef4444';
          setTimeout(() => { if (surveySelect) surveySelect.style.borderColor = '#cbd5e1'; }, 1500);
        }
        if (typeof showToast === 'function') {
          showToast('Please select a survey from the dropdown.');
        }
        return;
      }
      const opt = surveySelect.options[surveySelect.selectedIndex];
      surveyProject = opt ? (opt.getAttribute('data-project') || '') : '';
    } else {
      title = (titleEl ? titleEl.value : '').trim();
      if (!title) {
        if (titleEl) {
          titleEl.focus();
          titleEl.style.borderColor = '#ef4444';
          setTimeout(() => { if (titleEl) titleEl.style.borderColor = '#cbd5e1'; }, 1500);
        }
        if (typeof showToast === 'function') {
          showToast(taskType === 'meeting' ? 'Please enter a meeting title.' : 'Please type a task name first.');
        }
        return;
      }
    }

    let dueDateVal = document.getElementById('gridNewTaskDueDate')?.value;
    if (!dueDateVal) {
      const today = new Date().toISOString().split('T')[0];
      dueDateVal = today;
    }
    const priorityVal = document.getElementById('gridNewTaskPriority')?.value || 'Medium';
    const statusVal = document.getElementById('gridNewTaskStatus')?.value || 'In Progress';
    const activeProject = document.getElementById('actProjectFilter')?.value;
    const projectVal = activeProject || surveyProject || (Store.getProjects()[0]?.name || 'Poverty & Social Protection Impact Assessment');

    // Parse assignees list from multi-check selection
    const selectedNames = (gridSelectedAssignees && gridSelectedAssignees.length > 0)
      ? [...gridSelectedAssignees]
      : ['Dr. Rameshwar Singh'];

    const assigneesList = selectedNames.map((name, i) => {
      const found = GRID_AVAILABLE_MEMBERS.find(m => m.name === name);
      return {
        name,
        role: found ? found.role : (i === 0 ? 'Lead Member' : 'Team Member'),
        read: i === 0,
        readAt: i === 0 ? 'Today, 10:00 AM' : null,
        completed: statusVal === 'Completed',
        completedAt: statusVal === 'Completed' ? 'Today, 11:30 AM' : null
      };
    });

    let description = `Deliverable and milestone execution for ${projectVal}.`;
    let tag = 'Standard';
    let category = 'task';
    let meetingUrl = '';
    let meetingDuration = '';
    let isMilestone = false;
    let projectId = '';

    if (taskType === 'milestone') {
      description = `Milestone checkpoint for ${projectVal}.`;
      tag = 'Milestone';
      category = 'milestone';
      isMilestone = true;
      // Resolve projectId for milestone store indexing
      const matchedProject = Store.getProjects().find(p =>
        (p.name || '').toLowerCase() === projectVal.toLowerCase()
      );
      projectId = matchedProject ? matchedProject.id : '';
    } else if (taskType === 'survey') {
      description = `Field survey and data collection deliverable for ${projectVal}.`;
      tag = 'Survey';
      category = 'survey';
    } else if (taskType === 'meeting') {
      description = gridMeetingDetails.description || `Governance sync & review meeting for ${projectVal}.`;
      tag = 'Meeting';
      category = 'meeting';
      meetingUrl = gridMeetingDetails.url || '';
      meetingDuration = gridMeetingDetails.duration || '45 mins';

      // Also create corresponding meeting entry in Store so it's accessible in Meeting Tasks tab
      const meetings = Store.getMeetings();
      const newMeeting = {
        id: `MTG-0${meetings.length + 1}`,
        title,
        project: projectVal,
        dateTime: `${dueDateVal}T11:00`,
        mode: meetingUrl ? 'Virtual (Meeting Link)' : 'In-Person / Virtual',
        meetingUrl: meetingUrl,
        duration: meetingDuration,
        agenda: description,
        participants: assigneesList.map((a, i) => ({
          name: a.name,
          role: 'Attendee',
          status: i === 0 ? 'Accepted' : 'Pending'
        })),
        minutes: ''
      };
      if (Store.addMeeting) {
        Store.addMeeting(newMeeting);
      }
    }

    const newTask = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      title,
      description,
      project: projectVal,
      projectId,
      projectName: projectVal,
      assignee: assigneesList.map(a => a.name).join(', '),
      assignees: assigneesList,
      progress: statusVal === 'Completed' ? 100 : (statusVal === 'Pending' ? 0 : 40),
      dueDate: dueDateVal,
      priority: priorityVal,
      status: statusVal,
      tag,
      type: taskType,
      category,
      isMilestone,
      meetingUrl,
      meetingDuration,
      subtasks: []
    };

    Store.addTask(newTask);

    // Also register manually created milestones in the milestones index store
    if (isMilestone && Store.saveMilestones) {
      const allMilestones = Store.getMilestones ? Store.getMilestones() : [];
      allMilestones.unshift({ ...newTask });
      Store.saveMilestones(allMilestones);
    }

    expandedTaskIds.add(newTask.id);

    // Milestones bypass the date filter so no need to adjust date range
    if (!isMilestone) {
      // Adjust date filter if needed so newly created task is visible right away
      const toDateEl = document.getElementById('actToDate');
      const fromDateEl = document.getElementById('actFromDate');
      if (toDateEl && toDateEl.value && toDateEl.value < dueDateVal) {
        toDateEl.value = dueDateVal;
      }
      if (fromDateEl && fromDateEl.value && fromDateEl.value > dueDateVal) {
        fromDateEl.value = dueDateVal;
      }
    }

    const typeLabel = taskType === 'milestone' ? '◆ Milestone' : (taskType === 'survey' ? 'Survey task' : (taskType === 'meeting' ? 'Meeting task' : 'Standard task'));
    if (typeof showToast === 'function') {
      showToast(`${typeLabel} "${title}" added to grid!`);
    }

    // Reset meeting details state
    gridMeetingDetails = { url: '', duration: '45 mins', description: '' };
    const pencilBtn = document.getElementById('gridMeetingPencilBtn');
    const pencilText = document.getElementById('gridMeetingPencilText');
    if (pencilBtn) {
      pencilBtn.style.background = '#eff6ff';
      pencilBtn.style.borderColor = '#bfdbfe';
      pencilBtn.style.color = '#2563eb';
    }
    if (pencilText) {
      pencilText.textContent = 'Meeting Details';
    }

    // Re-render table to display the new task
    renderTable();

    // Reset input fields and refocus
    setTimeout(() => {
      const nextTitleEl = document.getElementById('gridNewTaskTitle');
      const nextSurveySelect = document.getElementById('gridNewTaskSurveySelect');
      if (nextTitleEl) nextTitleEl.value = '';
      if (nextSurveySelect) nextSurveySelect.value = '';
      if (taskType === 'survey' && nextSurveySelect) {
        nextSurveySelect.focus();
      } else if (nextTitleEl) {
        nextTitleEl.focus();
      }
    }, 50);
  };

  // ── Action button (+ Task) ──
  const btnOpenTaskModal = document.getElementById('btnOpenTaskModal');
  if (btnOpenTaskModal) {
    btnOpenTaskModal.addEventListener('click', () => {
      populateProjects();
      openModal('modalNewTask');
    });
  }

  const btnNew = document.getElementById('btnDynamicNewActivity');
  if (btnNew) {
    btnNew.addEventListener('click', () => {
      if (currentTab === 'task') {
        populateProjects();
        openModal('modalNewTask');
      }
      else if (currentTab === 'meeting') {
        populateProjects();
        openModal('modalNewMeeting');
      }
    });
  }

  // ── KPI Summary Cards Click Listeners ──
  document.querySelectorAll('.kpi-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.kpi-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      kpiStatusFilter = card.dataset.filter || 'all';
      currentPage = 1;
      renderTable();
    });
  });

  // ── Search & Filter Input Listeners ──
  const actTableFilter = document.getElementById('actTableFilter');
  if (actTableFilter) {
    actTableFilter.addEventListener('input', () => {
      currentPage = 1;
      renderTable();
    });
  }

  const actPriorityFilter = document.getElementById('actPriorityFilter');
  if (actPriorityFilter) {
    actPriorityFilter.addEventListener('change', () => {
      currentPage = 1;
      renderTable();
    });
  }

  const actTimeFilter = document.getElementById('actTimeFilter');
  if (actTimeFilter) {
    actTimeFilter.addEventListener('change', () => {
      currentPage = 1;
      renderTable();
    });
  }

  // ── View Toggle Switcher (List / Cards) ──
  const viewToggleList = document.getElementById('viewToggleList');
  const viewToggleCards = document.getElementById('viewToggleCards');
  if (viewToggleList && viewToggleCards) {
    viewToggleList.addEventListener('click', () => {
      viewToggleList.classList.add('active');
      viewToggleList.style.background = '#ffffff';
      viewToggleList.style.color = '#0f172a';
      viewToggleList.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';
      viewToggleCards.classList.remove('active');
      viewToggleCards.style.background = 'transparent';
      viewToggleCards.style.color = '#64748b';
      viewToggleCards.style.boxShadow = 'none';
    });
    viewToggleCards.addEventListener('click', () => {
      viewToggleCards.classList.add('active');
      viewToggleCards.style.background = '#ffffff';
      viewToggleCards.style.color = '#0f172a';
      viewToggleCards.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';
      viewToggleList.classList.remove('active');
      viewToggleList.style.background = 'transparent';
      viewToggleList.style.color = '#64748b';
      viewToggleList.style.boxShadow = 'none';
    });
  }

  // ── Date and Search Execution ──
  window.triggerTaskSearch = function () {
    hasSearched = true;
    currentPage = 1;
    renderTable();
  };

  document.getElementById('btnExecuteSearch')?.addEventListener('click', () => {
    window.triggerTaskSearch();
  });
  document.getElementById('actClearDatesBtn')?.addEventListener('click', () => {
    const fromEl = document.getElementById('actFromDate');
    const toEl = document.getElementById('actToDate');
    if (fromEl) fromEl.value = '';
    if (toEl) toEl.value = '';
    window.triggerTaskSearch();
  });

  // ══════════════════════════════════════════════
  //  UPDATE COUNTS
  // ══════════════════════════════════════════════
  function updateCounts() {
    const tasks = Store.getTasks();
    const meetings = Store.getMeetings();
    const surveys = Store.getSurveys();
    const qb = Store.getQuestionBank();

    const taskCount = tasks.length + meetings.length;

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('sidebarTaskCountBadge', taskCount || '');
    setEl('sidebarSurveyCountBadge', surveys.length || '0');
    setEl('sidebarQBCountBadge', qb.length);
  }

  // ══════════════════════════════════════════════
  //  MAIN TABLE RENDERER (Clean, Date-filtered, Paginated)
  // ══════════════════════════════════════════════
  function renderTable() {
    updateCounts();
    const thead = document.getElementById('actTableThead');
    const tbody = document.getElementById('actTableTbody');
    const title = document.getElementById('actTableTitle');
    const desc = document.getElementById('actTableDesc');
    const badge = document.getElementById('actTableCountBadge');
    const filter = (document.getElementById('actTableFilter')?.value || '').trim().toLowerCase();
    const projectFilter = (document.getElementById('actProjectFilter')?.value || '').trim().toLowerCase();
    const fromDate = document.getElementById('actFromDate')?.value || '';
    const toDate = document.getElementById('actToDate')?.value || '';

    // ── TASKS ──────────────────────────────────
    if (currentTab === 'task') {
      if (title) title.textContent = 'Task Management';
      if (desc) desc.textContent = 'Create, assign, and track tasks across Program Coordinators, Fellows, and Interns state-wide';

      const allTasks = Store.getTasks();

      // Dynamic KPI Metric Card live counts
      const totalAll = allTasks.length;
      const totalPending = allTasks.filter(t => t.status === 'Pending').length;
      const totalInProgress = allTasks.filter(t => t.status === 'In Progress').length;
      const totalDone = allTasks.filter(t => t.status === 'Completed').length;
      const totalOverdue = allTasks.filter(t => t.status === 'Overdue' || (t.dueDate && t.dueDate < '2026-09-01' && t.status !== 'Completed')).length;

      const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      setEl('kpiCountTotal', totalAll);
      setEl('kpiCountPending', totalPending);
      setEl('kpiCountInProgress', totalInProgress);
      setEl('kpiCountDone', totalDone);
      setEl('kpiCountOverdue', totalOverdue);
      setEl('actTotalCount', totalAll);

      let tasks = [...allTasks];

      // KPI card filter
      if (kpiStatusFilter && kpiStatusFilter !== 'all') {
        if (kpiStatusFilter === 'Overdue') {
          tasks = tasks.filter(t => t.status === 'Overdue' || (t.dueDate && t.dueDate < '2026-09-01' && t.status !== 'Completed'));
        } else {
          tasks = tasks.filter(t => t.status === kpiStatusFilter);
        }
      }

      // Priority dropdown filter
      const prioFilterVal = (document.getElementById('actPriorityFilter')?.value || '').trim();
      if (prioFilterVal) {
        tasks = tasks.filter(t => (t.priority || '').toLowerCase() === prioFilterVal.toLowerCase());
      }

      // Project / Role dropdown filter
      if (projectFilter) {
        tasks = tasks.filter(t =>
          (t.project || '').toLowerCase().includes(projectFilter) ||
          (t.assignee || '').toLowerCase().includes(projectFilter)
        );
      }

      // Text search filter
      if (filter) {
        tasks = tasks.filter(t =>
          (t.title || '').toLowerCase().includes(filter) ||
          (t.description || '').toLowerCase().includes(filter) ||
          (t.project || '').toLowerCase().includes(filter) ||
          (t.assignee || '').toLowerCase().includes(filter)
        );
      }

      // Date range filtering
      if (fromDate) {
        tasks = tasks.filter(t => t.isMilestone || !t.dueDate || t.dueDate >= fromDate);
      }
      if (toDate) {
        tasks = tasks.filter(t => t.isMilestone || !t.dueDate || t.dueDate <= toDate);
      }

      // Sort tasks date-wise (closest due date first)
      tasks.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

      const totalItems = tasks.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      setEl('actShowingCount', totalItems);

      if (badge) badge.textContent = `${totalItems} ${totalItems === 1 ? 'Task' : 'Tasks'}`;

      if (thead) thead.innerHTML = `
        <tr style="background:#fafbfd;border-bottom:1.5px solid #edf2f7;color:#64748b;text-transform:uppercase;font-size:0.71rem;font-weight:700;letter-spacing:0.05em;">
          <th style="padding:12px 14px;width:34%;">TASK NAME</th>
          <th style="padding:12px 10px;width:15%;">ASSIGNEE</th>
          <th style="padding:12px 10px;width:14%;">DUE DATE</th>
          <th style="padding:12px 8px;width:12%;">PRIORITY</th>
          <th style="padding:12px 8px;width:16%;">STATUS</th>
          <th style="padding:12px 10px;width:9%;text-align:center;">ACTIONS</th>
        </tr>`;

      const inlineRowHtml = getGridInlineCreationRowHtml();

      if (totalItems === 0) {
        tbody.innerHTML = inlineRowHtml + `
          <tr>
            <td colspan="6" style="padding:0;">
              ${emptyState('pi-calendar-times', 'No Tasks Found', 'No tasks match the selected search or filter criteria. You can create a new task directly using the row above!')}
            </td>
          </tr>`;
        renderPagination(0, 0, 0);
        return;
      }

      const startIdx = (currentPage - 1) * pageSize;
      const pageTasks = tasks.slice(startIdx, startIdx + pageSize);

      tbody.innerHTML = inlineRowHtml + pageTasks.map(t => {
        const dotColorClass = (t.priority || '').toLowerCase() === 'high' ? 'high' : ((t.priority || '').toLowerCase() === 'low' ? 'low' : 'medium');
        const isSurvey = (t.tag && t.tag.toLowerCase().includes('survey')) ||
          (t.category && t.category.toLowerCase().includes('survey')) ||
          (t.type && t.type.toLowerCase().includes('survey')) ||
          (t.title && t.title.toLowerCase().includes('survey'));
        const isMeeting = (t.tag && t.tag.toLowerCase().includes('meeting')) ||
          (t.category && t.category.toLowerCase().includes('meeting')) ||
          (t.type && t.type.toLowerCase().includes('meeting')) ||
          (t.title && t.title.toLowerCase().includes('meeting'));
        const isMilestone = !!t.isMilestone;

        const subtasks = Array.isArray(t.subtasks) ? t.subtasks : [];
        const isExpanded = expandedTaskIds.has(t.id);

        const expandBtnHtml = `
          <button type="button" class="task-expand-btn ${isExpanded ? 'expanded' : ''}" 
            onclick="window.toggleTaskExpand('${t.id}', event)" 
            title="${isExpanded ? 'Collapse subtasks' : (subtasks.length > 0 ? `Expand ${subtasks.length} subtasks` : 'Add subtask')}"
            style="margin-right:4px;">
            <i class="pi pi-chevron-right" style="font-size:9px;"></i>
          </button>
        `;

        const milestoneRowStyle = isMilestone
          ? 'border-left: 3.5px solid #f59e0b; background: linear-gradient(90deg, #fffdf5 0%, #ffffff 100%) !important;'
          : '';

        let parentRowHtml = `
          <tr class="act-row-clickable" style="border-bottom:1px solid #f1f5f9;transition:all 0.15s ease;${milestoneRowStyle}" 
              onmouseover="this.style.background='${isMilestone ? '#fefce8' : '#fafcff'}'" 
              onmouseout="this.style.background='${isMilestone ? '#fffdf5' : 'transparent'}'" 
              onclick="window.openTaskReceipts('${t.id}', 'all')">
            <!-- 1. TASK NAME -->
            <td style="padding:12px 14px;vertical-align:middle;">
              <div style="display:flex;align-items:flex-start;gap:8px;">
                <span class="task-priority-dot ${dotColorClass}" style="margin-top:6px;" title="Priority: ${t.priority}"></span>
                ${expandBtnHtml}
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
                    ${isMilestone ? `<span style="color:#d97706;font-size:0.80rem;" title="Milestone">◆</span>` : ''}
                    <span style="font-weight:700;color:#0f172a;font-size:0.84rem;line-height:1.35;letter-spacing:-0.01em;">${escapeHtml(t.title)}</span>
                    ${isSurvey && !isMilestone ? `<span style="background:#faf5ff;color:#9333ea;border:1px solid #e9d5ff;font-size:0.66rem;font-weight:700;padding:1px 8px;border-radius:9999px;line-height:1.2;">Survey</span>` : ''}
                    ${isMilestone ? `<span style="background:#fef3c7;color:#92400e;border:1px solid #fde68a;font-size:0.66rem;font-weight:700;padding:1px 8px;border-radius:9999px;line-height:1.2;">Milestone</span>` : ''}
                    ${isMeeting ? `<span style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;font-size:0.66rem;font-weight:700;padding:1px 8px;border-radius:9999px;line-height:1.2;">Meeting</span>` : ''}
                  </div>
                  ${t.description ? `<div style="font-size:0.75rem;color:#64748b;margin-top:3px;line-height:1.4;">${escapeHtml(t.description)}</div>` : ''}
                </div>
              </div>
            </td>

            <!-- 2. ASSIGNEE (Circular Avatars + Add Button) -->
            <td style="padding:12px 10px;vertical-align:middle;">
              ${renderAssigneeBadge(t)}
            </td>

            <!-- 3. DUE DATE -->
            <td style="padding:12px 10px;vertical-align:middle;white-space:nowrap;">
              ${renderDueDateCell(t.dueDate, t.status)}
            </td>

            <!-- 4. PRIORITY -->
            <td style="padding:12px 8px;vertical-align:middle;white-space:nowrap;">
              ${renderPriorityBadge(t.priority, t.id)}
            </td>

            <!-- 5. STATUS -->
            <td style="padding:12px 8px;vertical-align:middle;white-space:nowrap;">
              ${renderStatusBadge(t.status, t.id)}
            </td>

            <!-- 6. ACTIONS -->
            <td style="padding:12px 10px;text-align:center;vertical-align:middle;" onclick="event.stopPropagation()">
              <div style="display:inline-flex;align-items:center;justify-content:center;gap:4px;">
                <button type="button" onclick="window.openTaskReceipts('${t.id}', 'all')" 
                  style="width:26px;height:26px;border-radius:6px;border:none;background:transparent;cursor:pointer;color:#94a3b8;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s ease;"
                  onmouseover="this.style.background='#eff6ff';this.style.color='#2563eb';"
                  onmouseout="this.style.background='transparent';this.style.color='#94a3b8';"
                  title="View Task Details">
                  <i class="pi pi-eye" style="font-size:12px;"></i>
                </button>
                <button type="button" onclick="window.deleteT('${t.id}')" 
                  style="width:26px;height:26px;border-radius:6px;border:none;background:transparent;cursor:pointer;color:#94a3b8;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s ease;"
                  onmouseover="this.style.background='#fee2e2';this.style.color='#ef4444';"
                  onmouseout="this.style.background='transparent';this.style.color='#94a3b8';"
                  title="Delete Task">
                  <i class="pi pi-trash" style="font-size:12px;"></i>
                </button>
              </div>
            </td>
          </tr>
        `;

        let subtasksRowsHtml = '';
        if (isExpanded) {
          subtasksRowsHtml += subtasks.map(st => {
            const isDone = !!st.completed;
            const rawAssignees = st.assignees || (st.assignee ? st.assignee.split(',').map(s => s.trim()).filter(Boolean) : []);
            const stNames = Array.isArray(rawAssignees) ? rawAssignees.map(a => typeof a === 'string' ? a : a.name).filter(Boolean) : [];
            const stDueDate = st.dueDate || t.dueDate || '2026-09-24';
            const stPriority = st.priority || 'Medium';
            const stStatus = st.status || (isDone ? 'Completed' : 'In Progress');

            return `
              <tr class="subtask-row" id="subtask-row-${st.id}" style="border-bottom:1px solid #f1f5f9;background:#fcfdfe;">
                <!-- 1. SUBTASK TITLE -->
                <td style="padding:8px 14px 8px 36px;vertical-align:middle;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span class="subtask-tree-guide">↳</span>
                    <div class="subtask-checkbox ${isDone ? 'checked' : ''}" 
                      onclick="window.toggleSubtaskCheck('${t.id}', '${st.id}', event)" 
                      title="${isDone ? 'Click to mark as incomplete' : 'Click to mark as completed'}">
                      ${isDone ? '<i class="pi pi-check" style="font-size:8px;"></i>' : ''}
                    </div>
                    <span class="subtask-title-text ${isDone ? 'completed' : ''}" style="cursor:pointer;" onclick="window.openSubtaskDetailsModal('${t.id}', '${st.id}', event, 'view')" title="Click to view details">${escapeHtml(st.title)}</span>
                    <button type="button" onclick="window.openSubtaskDetailsModal('${t.id}', '${st.id}', event, 'edit')"
                      title="${st.description ? 'Edit subtask details & notes' : 'Add subtask details & notes'}"
                      style="background:transparent;border:none;color:${st.description ? '#2563eb' : '#94a3b8'};cursor:pointer;font-size:12px;padding:2px 4px;border-radius:4px;display:inline-flex;align-items:center;transition:all 0.15s;flex-shrink:0;"
                      onmouseover="this.style.color='#2563eb';"
                      onmouseout="this.style.color='${st.description ? '#2563eb' : '#94a3b8'}';">
                      <i class="pi pi-file-edit"></i>
                    </button>
                  </div>
                </td>

                <!-- 2. ASSIGNEE -->
                <td style="padding:8px 10px;vertical-align:middle;">
                  <div style="display:inline-flex;align-items:center;">
                    ${stNames.length > 0 ? `
                      <div class="assignee-avatar-group" style="padding:0;margin-right:4px;cursor:pointer;" 
                        onclick="window.openSubtaskAssigneePicker('${t.id}', '${st.id}', this, event)"
                        title="${escapeHtml(stNames.join(', '))}">
                        ${stNames.slice(0, 4).map((name, idx) => `
                          <div class="assignee-avatar-circle" 
                            style="width:22px;height:22px;font-size:0.60rem;background:${getAvatarColor(name)};border:none;margin-left:${idx > 0 ? '-5px' : '0'};box-shadow:none;">
                            ${getAvatarInitials(name)}
                          </div>
                        `).join('')}
                        ${stNames.length > 4 ? `<div class="assignee-avatar-more" style="width:22px;height:22px;font-size:0.55rem;">+${stNames.length - 4}</div>` : ''}
                        <span style="margin-left:5px;font-size:0.74rem;font-weight:800;color:#1e293b;">${stNames.length}</span>
                      </div>
                    ` : ''}
                    <button type="button" class="subtask-add-assignee-btn" 
                      onclick="window.openSubtaskAssigneePicker('${t.id}', '${st.id}', this, event)"
                      title="${stNames.length > 0 ? 'Add / Change Assignees' : 'Add Assignee'}"
                      style="width:22px;height:22px;border-radius:50%;border:1.5px dashed #94a3b8;background:#f8fafc;color:#64748b;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:all 0.15s ease;box-sizing:border-box;"
                      onmouseover="this.style.borderColor='#2563eb';this.style.color='#2563eb';this.style.background='#eff6ff';"
                      onmouseout="this.style.borderColor='#94a3b8';this.style.color='#64748b';this.style.background='#f8fafc';">
                      <i class="pi pi-user-plus" style="font-size:9px;"></i>
                    </button>
                  </div>
                </td>

                <!-- 3. DUE DATE -->
                <td style="padding:8px 10px;vertical-align:middle;">
                  <div style="display:inline-flex;align-items:center;gap:4px;font-size:0.74rem;color:#64748b;">
                    <i class="pi pi-calendar" style="font-size:10px;color:#94a3b8;"></i>
                    <span>${formatScreenshotDate(stDueDate)}</span>
                  </div>
                </td>

                <!-- 4. PRIORITY -->
                <td style="padding:8px 8px;vertical-align:middle;white-space:nowrap;">
                  ${renderPriorityBadge(stPriority, t.id, st.id)}
                </td>

                <!-- 5. STATUS -->
                <td style="padding:8px 8px;vertical-align:middle;white-space:nowrap;">
                  ${renderStatusBadge(stStatus, t.id, st.id)}
                </td>

                <!-- 6. ACTIONS -->
                <td style="padding:8px 10px;text-align:center;vertical-align:middle;" onclick="event.stopPropagation()">
                  <div style="display:inline-flex;align-items:center;justify-content:center;gap:8px;">
                    <button type="button" onclick="window.openSubtaskDetailsModal('${t.id}', '${st.id}', event, 'view')" 
                      style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:13px;padding:2px;transition:color 0.15s;" 
                      onmouseover="this.style.color='#3b82f6'" 
                      onmouseout="this.style.color='#94a3b8'" 
                      title="View Subtask Details">
                      <i class="pi pi-eye"></i>
                    </button>
                    <button type="button" onclick="window.deleteSubtaskItem('${t.id}', '${st.id}', event)" 
                      style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:12px;padding:2px;transition:color 0.15s;" 
                      onmouseover="this.style.color='#ef4444'" 
                      onmouseout="this.style.color='#94a3b8'" 
                      title="Delete Subtask">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('');

          const subtaskDefaultDate = t.dueDate || defaultDueDate;

          subtasksRowsHtml += `
            <tr class="subtask-quick-add-row" id="subtask-quick-add-${t.id}" style="border-bottom:1px dashed #e2e8f0;background:#f8fafc;">
              <!-- 1. SUBTASK TITLE -->
              <td style="padding:6px 14px 6px 36px;vertical-align:middle;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="color:#94a3b8;font-size:12px;user-select:none;">↳</span>
                  <div style="position:relative;flex:1;display:flex;align-items:center;">
                    <input type="text" class="subtask-quick-input" id="quickSubtaskInput-${t.id}" 
                      placeholder="Add a subtask... (type name & press Enter)" 
                      onkeydown="if(event.key === 'Enter') { event.preventDefault(); window.submitQuickSubtask('${t.id}'); }"
                      onclick="event.stopPropagation();"
                      style="width:100%;border:1.5px solid #cbd5e1;background:#ffffff;border-radius:6px;padding:4px 28px 4px 8px;font-size:0.75rem;font-weight:600;color:#1e293b;outline:none;font-family:inherit;">
                    <button type="button" onclick="window.openQuickSubtaskDetailsModal('${t.id}', event)" 
                      style="position:absolute;right:4px;background:none;border:none;color:#94a3b8;cursor:pointer;padding:2px 4px;font-size:11px;border-radius:3px;display:flex;align-items:center;"
                      onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#94a3b8'"
                      title="Add details / notes in pop up before saving">
                      <i class="pi pi-file-edit"></i>
                    </button>
                  </div>
                </div>
              </td>

              <!-- 2. ASSIGNEE -->
              <td style="padding:6px 10px;vertical-align:middle;">
                <div style="display:inline-flex;align-items:center;" id="quickSubtaskAssigneeWrapper-${t.id}">
                  <input type="hidden" id="quickSubtaskAssignee-${t.id}" value="">
                  <span id="quickSubtaskAvatarContainer-${t.id}"></span>
                  <button type="button" class="subtask-add-assignee-btn" id="quickSubtaskAssigneeBtn-${t.id}"
                    onclick="window.openQuickSubtaskAssigneePicker('${t.id}', this, event)"
                    title="Add Assignee"
                    style="width:22px;height:22px;border-radius:50%;border:1.5px dashed #94a3b8;background:#f8fafc;color:#64748b;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:all 0.15s ease;box-sizing:border-box;"
                    onmouseover="this.style.borderColor='#2563eb';this.style.color='#2563eb';this.style.background='#eff6ff';"
                    onmouseout="this.style.borderColor='#94a3b8';this.style.color='#64748b';this.style.background='#f8fafc';">
                    <i class="pi pi-user-plus" style="font-size:9px;"></i>
                  </button>
                </div>
              </td>

              <!-- 3. DUE DATE -->
              <td style="padding:6px 10px;vertical-align:middle;">
                <input type="date" id="quickSubtaskDueDate-${t.id}" value="${subtaskDefaultDate}"
                  style="width:100%;border:1.5px solid #cbd5e1;background:#ffffff;border-radius:6px;padding:3px 6px;font-size:0.72rem;font-weight:600;color:#334155;outline:none;cursor:pointer;font-family:inherit;">
              </td>

              <!-- 4. PRIORITY -->
              <td style="padding:6px 8px;vertical-align:middle;white-space:nowrap;">
                <div style="position:relative;display:inline-block;white-space:nowrap;" onclick="event.stopPropagation();">
                  <select id="quickSubtaskPriority-${t.id}" 
                    onchange="window.updateQuickSubtaskPriorityStyle(this)"
                    style="appearance:none;-webkit-appearance:none;background:#fffbeb;color:#d97706;border:1.5px solid #fde68a;border-radius:18px;font-size:0.72rem;font-weight:700;padding:4px 22px 4px 10px;cursor:pointer;outline:none;font-family:inherit;white-space:nowrap;transition:all 0.15s ease;">
                    <option value="High" style="color:#dc2626;background:#fff;">• High</option>
                    <option value="Medium" selected style="color:#d97706;background:#fff;">• Medium</option>
                    <option value="Low" style="color:#16a34a;background:#fff;">• Low</option>
                  </select>
                  <i class="pi pi-chevron-down" style="position:absolute;right:7px;top:50%;transform:translateY(-50%);font-size:7px;color:#d97706;pointer-events:none;"></i>
                </div>
              </td>

              <!-- 5. STATUS -->
              <td style="padding:6px 8px;vertical-align:middle;white-space:nowrap;">
                <div style="position:relative;display:inline-block;white-space:nowrap;" onclick="event.stopPropagation();">
                  <select id="quickSubtaskStatus-${t.id}"
                    onchange="window.updateQuickSubtaskStatusStyle(this)"
                    style="appearance:none;-webkit-appearance:none;background:#f0f9ff;color:#0284c7;border:1.5px solid #bae6fd;border-radius:18px;font-size:0.72rem;font-weight:700;padding:4px 22px 4px 10px;cursor:pointer;outline:none;font-family:inherit;text-align:center;white-space:nowrap;transition:all 0.15s ease;">
                    <option value="In Progress" selected style="color:#0284c7;background:#fff;">In Progress</option>
                    <option value="Pending" style="color:#d97706;background:#fff;">Pending</option>
                    <option value="Completed" style="color:#16a34a;background:#fff;">Completed</option>
                    <option value="Overdue" style="color:#dc2626;background:#fff;">Overdue</option>
                  </select>
                  <i class="pi pi-chevron-down" style="position:absolute;right:7px;top:50%;transform:translateY(-50%);font-size:7px;color:#0284c7;pointer-events:none;"></i>
                </div>
              </td>

              <!-- 6. ACTIONS (Circular Add Button) -->
              <td style="padding:5px 10px;text-align:center;vertical-align:middle;" onclick="event.stopPropagation();">
                <button type="button" onclick="window.submitQuickSubtask('${t.id}');" 
                  style="width:24px;height:24px;border-radius:50%;border:none;background:#2563eb;color:#ffffff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 3px rgba(37,99,235,0.3);transition:all 0.15s ease;padding:0;"
                  onmouseover="this.style.background='#1d4ed8';this.style.transform='scale(1.1)';" 
                  onmouseout="this.style.background='#2563eb';this.style.transform='scale(1)';"
                  title="Add Subtask (Enter)">
                  <i class="pi pi-plus" style="font-size:10px;font-weight:700;"></i>
                </button>
              </td>
            </tr>
          `;
        }

        return parentRowHtml + subtasksRowsHtml;
      }).join('');

      renderPagination(totalItems, startIdx + 1, Math.min(startIdx + pageSize, totalItems));

      // ── SURVEYS ────────────────────────────────
    } else if (currentTab === 'survey') {
      if (title) title.textContent = 'Field Surveys';
      if (desc) desc.textContent = 'Track surveyors, sample collection progress, and mapped questions';

      let surveys = Store.getSurveys();

      // Text search
      if (filter) {
        surveys = surveys.filter(s =>
          (s.name || '').toLowerCase().includes(filter) ||
          (s.project || '').toLowerCase().includes(filter)
        );
      }

      // Date range filtering
      if (fromDate) {
        surveys = surveys.filter(s => {
          const d = s.date || s.startDate || s.dueDate || '2026-10-20';
          return d >= fromDate;
        });
      }
      if (toDate) {
        surveys = surveys.filter(s => {
          const d = s.date || s.startDate || s.dueDate || '2026-10-20';
          return d <= toDate;
        });
      }

      const totalItems = surveys.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      if (badge) badge.textContent = `${totalItems} ${totalItems === 1 ? 'Survey' : 'Surveys'}`;

      if (thead) thead.innerHTML = `
        <tr style="background:#f8fafc;border-bottom:1.5px solid #e2e8f0;color:#475569;text-transform:uppercase;font-size:0.74rem;">
          <th style="padding:12px 16px;width:38%;">Survey &amp; Details</th>
          <th style="padding:12px 14px;width:24%;">Target Quota</th>
          <th style="padding:12px 14px;width:26%;">Surveyors Status</th>
          <th style="padding:12px 14px;width:12%;text-align:center;">Action</th>
        </tr>`;

      if (totalItems === 0) {
        tbody.innerHTML = emptyState('pi-clipboard', 'No Surveys Found', 'No surveys match the selected search or date range.');
        renderPagination(0, 0, 0);
        return;
      }

      const startIdx = (currentPage - 1) * pageSize;
      const pageSurveys = surveys.slice(startIdx, startIdx + pageSize);

      tbody.innerHTML = pageSurveys.map(s => {
        const qCount = s.questions ? s.questions.length : 0;
        const surveyors = s.assignedSurveyors || ['Field Team'];
        const target = s.targetSample || s.minRespondents || 100;
        const collected = typeof s.collectedSamples !== 'undefined' ? s.collectedSamples : Math.round(target * 0.65);
        const sPct = s.progress || Math.min(100, Math.round((collected / target) * 100));

        return `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <!-- 1. Survey & Project -->
            <td style="padding:12px 16px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
                <span class="qb-code-badge" style="background:#e0f2fe;color:#0369a1;">${s.id}</span>
                <span style="font-weight:700;color:#1837d4;font-size:0.88rem;">${s.name}</span>
              </div>
              <div style="font-size:0.77rem;color:#64748b;display:flex;align-items:center;gap:5px;">
                <i class="pi pi-folder" style="font-size:11px;color:#94a3b8;"></i>
                <span style="max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${s.project}">${s.project}</span>
              </div>
            </td>

            <!-- 2. Target Quota & Progress -->
            <td style="padding:12px 14px;">
              <div style="display:flex;flex-direction:column;gap:3px;max-width:140px;">
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.74rem;font-weight:800;">
                  <span style="color:#1837d4;">${collected} / ${target}</span>
                  <span style="color:#475569;">${sPct}%</span>
                </div>
                <div class="act-progress-track" style="max-width:140px;">
                  <div class="act-progress-fill ${sPct === 100 ? 'success' : ''}" style="width:${sPct}%;"></div>
                </div>
              </div>
            </td>

            <!-- 3. Surveyors Status -->
            <td style="padding:12px 14px;">
              <div style="display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span class="act-surveyor-badge" title="${surveyors.join(', ')}">👥 ${surveyors.length} Surveyors</span>
                <span style="font-size:0.74rem;font-weight:800;background:#eff4fe;color:#1837d4;padding:3px 8px;border-radius:10px;">📋 ${qCount} Qs</span>
              </div>
            </td>

            <!-- 4. Action -->
            <td style="padding:12px 14px;text-align:center;" onclick="event.stopPropagation()">
              <div style="display:inline-flex;align-items:center;gap:8px;">
                <button type="button" class="btn btn-secondary" style="padding:4px 10px;font-size:0.74rem;font-weight:700;color:#1837d4;background:#eff4fe;border:1px solid #c7d7fc;border-radius:6px;" onclick="window.previewSurvey('${s.id}')" title="Preview Questionnaire">
                  🔍 View
                </button>
                <button onclick="window.deleteS('${s.id}')" style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:4px;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'" title="Delete Survey">
                  <i class="pi pi-trash" style="font-size:13px;"></i>
                </button>
              </div>
            </td>
          </tr>`;
      }).join('');

      renderPagination(totalItems, startIdx + 1, Math.min(startIdx + pageSize, totalItems));

      // ── MEETINGS ───────────────────────────────
    } else if (currentTab === 'meeting') {
      if (title) title.textContent = 'Meeting Tasks';
      if (desc) desc.textContent = 'Track review meetings, attendance RSVPs, and minutes';

      let meetings = Store.getMeetings();

      // Text search
      if (filter) {
        meetings = meetings.filter(m =>
          (m.title || '').toLowerCase().includes(filter) ||
          (m.project || '').toLowerCase().includes(filter) ||
          (m.agenda || '').toLowerCase().includes(filter)
        );
      }

      // Project filter from common header dropdown
      if (projectFilter) {
        meetings = meetings.filter(m => (m.project || '').toLowerCase().includes(projectFilter));
      }

      // Date range filtering
      if (fromDate) {
        meetings = meetings.filter(m => {
          const dt = (m.dateTime || '').slice(0, 10);
          return !dt || dt >= fromDate;
        });
      }
      if (toDate) {
        meetings = meetings.filter(m => {
          const dt = (m.dateTime || '').slice(0, 10);
          return !dt || dt <= toDate;
        });
      }

      // Sort meetings date-wise
      meetings.sort((a, b) => (a.dateTime || '').localeCompare(b.dateTime || ''));

      const totalItems = meetings.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      if (badge) badge.textContent = `${totalItems} ${totalItems === 1 ? 'Meeting' : 'Meetings'}`;

      if (thead) thead.innerHTML = `
        <tr style="background:#f8fafc;border-bottom:1.5px solid #e2e8f0;color:#475569;text-transform:uppercase;font-size:0.70rem;letter-spacing:0.4px;">
          <th style="padding:8px 10px;width:40%;">Meeting &amp; Project</th>
          <th style="padding:8px 10px;width:20%;">Date</th>
          <th style="padding:8px 10px;width:28%;">RSVP Receipts</th>
          <th style="padding:8px 10px;width:12%;text-align:center;">Action</th>
        </tr>`;

      if (totalItems === 0) {
        tbody.innerHTML = emptyState('pi-calendar', 'No Meetings Found', 'No meetings match the selected search or date range.');
        renderPagination(0, 0, 0);
        return;
      }

      const startIdx = (currentPage - 1) * pageSize;
      const pageMeetings = meetings.slice(startIdx, startIdx + pageSize);

      tbody.innerHTML = pageMeetings.map(m => {
        const participants = m.participants || [];
        const accepted = participants.filter(p => p.status === 'Accepted').length;
        const total = participants.length || 1;
        const pending = total - accepted;
        const meetingDate = (m.dateTime || '').slice(0, 10);

        return `
          <tr class="mtg-row-clickable" style="border-bottom:1px solid #f1f5f9;" onclick="window.openMeetingDetail('${m.id}')">
            <!-- 1. Meeting & Project (Strictly NO TIME, NO MODE in table) -->
            <td style="padding:8px 10px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                <span class="qb-code-badge" style="background:#fef3c7;color:#92400e;font-size:0.65rem;padding:1px 5px;">${m.id}</span>
                <span style="font-weight:700;color:#1837d4;font-size:0.80rem;">${m.title}</span>
              </div>
              <div style="font-size:0.72rem;color:#64748b;display:flex;align-items:center;gap:4px;">
                <i class="pi pi-folder" style="font-size:10px;color:#94a3b8;"></i>
                <span style="max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${m.project}">${m.project}</span>
              </div>
            </td>

            <!-- 2. Date Only (Strictly NO TIME) -->
            <td style="padding:8px 10px;">
              <div style="font-size:0.76rem;font-weight:700;color:#334155;display:flex;align-items:center;gap:4px;">
                <i class="pi pi-calendar" style="font-size:11px;color:#64748b;"></i>
                <span>${formatDisplayDate(meetingDate)}</span>
              </div>
            </td>

            <!-- 3. RSVP Receipts: Single column with separate buttons -->
            <td style="padding:8px 10px;" onclick="event.stopPropagation()">
              <div style="display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <button type="button" class="act-btn-receipt-read" onclick="window.openMeetingDetail('${m.id}')" title="Click to view confirmed attendees" style="font-size:0.70rem;padding:3px 8px;">
                  👥 ${accepted} Confirmed
                </button>
                ${pending > 0 ? `
                  <button type="button" class="act-btn-receipt-unread" onclick="window.openMeetingDetail('${m.id}')" title="Click to view pending attendees" style="font-size:0.70rem;padding:3px 8px;">
                    ⏳ ${pending} Pending
                  </button>` : ''}
              </div>
              <div style="font-size:0.71rem;color:#94a3b8;margin-top:4px;">
                👥 ${total} Invited Attendees
              </div>
            </td>

            <!-- 4. Action -->
            <td style="padding:12px 14px;text-align:center;" onclick="event.stopPropagation()">
              <div style="display:inline-flex;align-items:center;gap:8px;">
                <button type="button" class="btn btn-secondary" style="padding:4px 10px;font-size:0.74rem;font-weight:700;color:#1837d4;background:#eff4fe;border:1px solid #c7d7fc;border-radius:6px;" onclick="window.openMeetingDetail('${m.id}')" title="Manage RSVP & Minutes">
                  👁️ View
                </button>
                <button onclick="window.deleteM('${m.id}')" style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:4px;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'" title="Delete Meeting">
                  <i class="pi pi-trash" style="font-size:13px;"></i>
                </button>
              </div>
            </td>
          </tr>`;
      }).join('');

      renderPagination(totalItems, startIdx + 1, Math.min(startIdx + pageSize, totalItems));
    }
  }

  // ── Render Pagination Bar Helper ──
  function renderPagination(totalItems, startCount, endCount) {
    const infoEl = document.getElementById('actPaginationInfo');
    const btnsEl = document.getElementById('actPaginationBtns');

    if (infoEl) {
      if (totalItems === 0) {
        infoEl.textContent = 'Showing 0 items';
      } else {
        infoEl.textContent = `Showing ${startCount}–${endCount} of ${totalItems}`;
      }
    }

    if (!btnsEl) return;

    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    if (totalPages <= 1) {
      btnsEl.innerHTML = '';
      return;
    }

    let btnsHtml = `
      <button type="button" class="btn" ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;height:30px;padding:0 10px;font-size:0.75rem;background:#fff;border:1px solid #cbd5e1;border-radius:6px;font-weight:700;"' : 'onclick="window.goToPage(' + (currentPage - 1) + ')" style="height:30px;padding:0 10px;font-size:0.75rem;background:#fff;border:1px solid #cbd5e1;border-radius:6px;font-weight:700;cursor:pointer;"'}>Previous</button>
    `;

    for (let p = 1; p <= totalPages; p++) {
      const isActive = p === currentPage;
      btnsHtml += `
        <button type="button" class="btn" onclick="window.goToPage(${p})" style="height:30px;min-width:30px;padding:0 8px;font-size:0.75rem;border-radius:6px;font-weight:800;border:1px solid ${isActive ? '#1837d4' : '#cbd5e1'};background:${isActive ? '#1837d4' : '#fff'};color:${isActive ? '#fff' : '#475569'};cursor:pointer;">${p}</button>
      `;
    }

    btnsHtml += `
      <button type="button" class="btn" ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;height:30px;padding:0 10px;font-size:0.75rem;background:#fff;border:1px solid #cbd5e1;border-radius:6px;font-weight:700;"' : 'onclick="window.goToPage(' + (currentPage + 1) + ')" style="height:30px;padding:0 10px;font-size:0.75rem;background:#fff;border:1px solid #cbd5e1;border-radius:6px;font-weight:700;cursor:pointer;"'}>Next</button>
    `;

    btnsEl.innerHTML = btnsHtml;
  }

  // ── Empty state helper ──
  function emptyState(icon, title, desc) {
    return `
      <tr><td colspan="6">
        <div class="act-empty-state">
          <div class="act-empty-icon"><i class="pi ${icon}"></i></div>
          <div class="act-empty-title">${title}</div>
          <div class="act-empty-desc">${desc}</div>
        </div>
      </td></tr>`;
  }

  // ══════════════════════════════════════════════
  //  ACTION HANDLERS
  // ══════════════════════════════════════════════
  window.toggleTask = function (id) {
    const t = Store.toggleTaskStatus(id);
    renderTable();
    showToast(`Task status updated to "${t.status}"!`);
  };
  window.deleteT = function (id) {
    Store.deleteTask(id);
    renderTable();
    showToast('Task removed.');
  };
  window.toggleSurvey = function (id) {
    const s = Store.toggleSurveyStatus(id);
    renderTable();
    showToast(`Survey status updated to "${s.status}"!`);
  };
  window.deleteS = function (id) {
    Store.deleteSurvey(id);
    renderTable();
    showToast('Survey removed.');
  };
  window.toggleMeeting = function (id) {
    const m = Store.toggleMeetingStatus(id);
    renderTable();
    showToast(`Meeting status updated to "${m.status}"!`);
  };
  window.deleteM = function (id) {
    Store.deleteMeeting(id);
    renderTable();
    showToast('Meeting removed.');
  };

  // ── Subtask Handlers ──
  window.toggleTaskExpand = function (taskId, e) {
    if (e) e.stopPropagation();
    if (expandedTaskIds.has(taskId)) {
      expandedTaskIds.delete(taskId);
    } else {
      expandedTaskIds.add(taskId);
    }
    renderTable();
  };

  window.promptAddSubtask = function (taskId, e) {
    if (e) e.stopPropagation();
    expandedTaskIds.add(taskId);
    renderTable();
    setTimeout(() => {
      const el = document.getElementById('quickSubtaskInput-' + taskId);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  window.submitQuickSubtask = function (taskId, inputEl = null) {
    const inEl = inputEl || document.getElementById('quickSubtaskInput-' + taskId);
    if (!inEl) return;
    const title = inEl.value.trim();
    if (!title) {
      inEl.focus();
      return;
    }

    const assigneeEl = document.getElementById('quickSubtaskAssignee-' + taskId);
    const dueDateEl = document.getElementById('quickSubtaskDueDate-' + taskId);
    const priorityEl = document.getElementById('quickSubtaskPriority-' + taskId);
    const statusEl = document.getElementById('quickSubtaskStatus-' + taskId);

    const assignee = assigneeEl ? assigneeEl.value.trim() : '';
    const dueDate = dueDateEl ? dueDateEl.value : '';
    const priority = priorityEl ? priorityEl.value : 'Medium';
    const status = statusEl ? statusEl.value : 'In Progress';
    const completed = status === 'Completed';

    const assignedList = (quickSubtaskAssigneesMap[taskId] && quickSubtaskAssigneesMap[taskId].length > 0)
      ? quickSubtaskAssigneesMap[taskId]
      : (assignee ? assignee.split(',').map(s => s.trim()).filter(Boolean) : []);

    const created = Store.addSubtask(taskId, {
      title,
      assignees: assignedList,
      assignee: assignedList.join(', '),
      dueDate,
      priority,
      status,
      completed
    });

    quickSubtaskAssigneesMap[taskId] = [];

    if (created && typeof showToast === 'function') {
      showToast(`Subtask "${title}" added!`);
    }
    renderTable();
    setTimeout(() => {
      const nextEl = document.getElementById('quickSubtaskInput-' + taskId);
      if (nextEl) {
        nextEl.focus();
      }
    }, 50);
  };

  window.toggleSubtaskCheck = function (taskId, subtaskId, e) {
    if (e) e.stopPropagation();
    const st = Store.toggleSubtask(taskId, subtaskId);
    if (st && typeof showToast === 'function') {
      showToast(st.completed ? `Subtask marked completed ✓` : `Subtask marked in progress`);
    }
    renderTable();
  };

  window.deleteSubtaskItem = function (taskId, subtaskId, e) {
    if (e) e.stopPropagation();
    Store.deleteSubtask(taskId, subtaskId);
    if (typeof showToast === 'function') {
      showToast('Subtask deleted.');
    }
    renderTable();
  };

  // ══════════════════════════════════════════════
  //  SUBTASK DETAILS POPUP & COLLABORATION MODAL
  // ══════════════════════════════════════════════
  let activeModalSubtaskChecklists = [];
  let activeModalSubtaskAssignees = [];

  window.openSubtaskDetailsModal = function (taskId, subtaskId, e, mode = 'view') {
    if (e) e.stopPropagation();
    const tasks = Store.getTasks();
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    const st = Array.isArray(t.subtasks) ? t.subtasks.find(s => s.id === subtaskId) : null;
    if (!st) return;

    const tIdEl = document.getElementById('stModalTaskId');
    const stIdEl = document.getElementById('stModalSubtaskId');
    const parentTitleEl = document.getElementById('stModalParentTitle');

    if (tIdEl) tIdEl.value = taskId;
    if (stIdEl) stIdEl.value = subtaskId;
    if (parentTitleEl) parentTitleEl.textContent = `${t.id}: ${t.title}`;

    const rawAssignees = st.assignees || (st.assignee ? st.assignee.split(',').map(s => s.trim()).filter(Boolean) : []);
    activeModalSubtaskAssignees = Array.isArray(rawAssignees) ? rawAssignees.map(a => typeof a === 'string' ? a : a.name).filter(Boolean) : [];
    activeModalSubtaskChecklists = Array.isArray(st.checklists) ? JSON.parse(JSON.stringify(st.checklists)) : [];

    const stStatus = st.status || (st.completed ? 'Completed' : 'In Progress');
    const stPriority = st.priority || 'Medium';
    const stDueDate = st.dueDate || t.dueDate || '2026-09-24';
    const stEstHours = st.estimatedHours || '';
    const stDesc = st.description || '';

    // ── 1. Populate Saved Details View Panel ──
    const viewTitleEl = document.getElementById('stModalViewTitle');
    if (viewTitleEl) viewTitleEl.textContent = st.title || 'Untitled Subtask';

    const viewStatusEl = document.getElementById('stModalViewStatusBadge');
    if (viewStatusEl) {
      let bg = '#f0f9ff', color = '#0284c7', border = '#bae6fd';
      if (stStatus === 'Completed') { bg = '#f0fdf4'; color = '#16a34a'; border = '#bbf7d0'; }
      else if (stStatus === 'Pending') { bg = '#fffbeb'; color = '#d97706'; border = '#fde68a'; }
      else if (stStatus === 'Overdue') { bg = '#fef2f2'; color = '#dc2626'; border = '#fecaca'; }
      viewStatusEl.innerHTML = `<span style="background:${bg};color:${color};border:1.5px solid ${border};border-radius:18px;padding:3px 12px;font-size:0.75rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;">${stStatus}</span>`;
    }

    const viewPriorityEl = document.getElementById('stModalViewPriorityBadge');
    if (viewPriorityEl) {
      let bg = '#fffbeb', color = '#d97706', border = '#fde68a', dot = '🟡';
      if (stPriority === 'High') { bg = '#fef2f2'; color = '#dc2626'; border = '#fecaca'; dot = '🔴'; }
      else if (stPriority === 'Low') { bg = '#f0fdf4'; color = '#16a34a'; border = '#bbf7d0'; dot = '🟢'; }
      viewPriorityEl.innerHTML = `<span style="background:${bg};color:${color};border:1px solid ${border};border-radius:14px;padding:2px 8px;font-size:0.75rem;font-weight:700;">${dot} ${stPriority}</span>`;
    }

    const viewDueDateEl = document.getElementById('stModalViewDueDate');
    if (viewDueDateEl) {
      viewDueDateEl.innerHTML = `<i class="pi pi-calendar" style="color:#64748b;font-size:11px;"></i> <span>${formatScreenshotDate(stDueDate)}</span>`;
    }

    const viewEstEl = document.getElementById('stModalViewEstHours');
    if (viewEstEl) {
      viewEstEl.innerHTML = stEstHours ? `<i class="pi pi-clock" style="color:#64748b;font-size:11px;"></i> <span>${escapeHtml(stEstHours)}</span>` : `<span style="color:#94a3b8;font-style:italic;">None</span>`;
    }

    const viewAssigneesEl = document.getElementById('stModalViewAssigneesList');
    if (viewAssigneesEl) {
      if (activeModalSubtaskAssignees.length > 0) {
        viewAssigneesEl.innerHTML = activeModalSubtaskAssignees.map(name => `
          <div style="display:inline-flex;align-items:center;gap:6px;background:#f8fafc;border:1px solid #e2e8f0;padding:3px 9px 3px 4px;border-radius:16px;">
            <div class="assignee-avatar-circle" style="width:20px;height:20px;font-size:0.56rem;background:${getAvatarColor(name)};border:none;margin-left:0;box-shadow:none;">${getAvatarInitials(name)}</div>
            <span style="font-size:0.75rem;font-weight:700;color:#1e293b;">${escapeHtml(name)}</span>
          </div>
        `).join('');
      } else {
        viewAssigneesEl.innerHTML = `<span style="color:#94a3b8;font-size:0.78rem;font-style:italic;">No team members assigned.</span>`;
      }
    }

    const viewDescEl = document.getElementById('stModalViewDescText');
    if (viewDescEl) {
      viewDescEl.textContent = stDesc || 'No deliverable instructions or notes recorded for this subtask yet.';
      viewDescEl.style.color = stDesc ? '#334155' : '#94a3b8';
      viewDescEl.style.fontStyle = stDesc ? 'normal' : 'italic';
    }

    window.renderModalViewChecklist();

    // ── 2. Populate Edit Form Panel ──
    const titleIn = document.getElementById('stModalTitleIn');
    if (titleIn) titleIn.value = st.title || '';

    const statusIn = document.getElementById('stModalStatusIn');
    if (statusIn) statusIn.value = stStatus;

    const priorityIn = document.getElementById('stModalPriorityIn');
    if (priorityIn) priorityIn.value = stPriority;

    const dueDateIn = document.getElementById('stModalDueDateIn');
    if (dueDateIn) dueDateIn.value = stDueDate;

    const estIn = document.getElementById('stModalEstIn');
    if (estIn) estIn.value = stEstHours;

    const descIn = document.getElementById('stModalDescIn');
    if (descIn) descIn.value = stDesc;

    window.renderModalAssigneesList();
    window.renderModalChecklist();

    // Show delete buttons for existing subtask
    const delBtn1 = document.getElementById('stModalViewDeleteBtn');
    const delBtn2 = document.getElementById('stModalDeleteBtn');
    if (delBtn1) delBtn1.style.display = 'inline-flex';
    if (delBtn2) delBtn2.style.display = 'inline-flex';

    window.switchSubtaskModalMode(mode);
    openModal('modalSubtaskDetails');
  };

  window.switchSubtaskModalMode = function (mode) {
    const viewPanel = document.getElementById('stModalViewPanel');
    const editPanel = document.getElementById('stModalEditPanel');
    const viewFooter = document.getElementById('stModalViewFooter');
    const editFooter = document.getElementById('stModalEditFooter');
    const headerTitle = document.getElementById('stModalHeaderTitle');

    if (mode === 'edit') {
      if (viewPanel) viewPanel.style.display = 'none';
      if (editPanel) editPanel.style.display = 'flex';
      if (viewFooter) viewFooter.style.display = 'none';
      if (editFooter) editFooter.style.display = 'flex';
      if (headerTitle) headerTitle.textContent = 'Edit Subtask Details';
      setTimeout(() => {
        const inEl = document.getElementById('stModalTitleIn');
        if (inEl) inEl.focus();
      }, 50);
    } else {
      if (viewPanel) viewPanel.style.display = 'flex';
      if (editPanel) editPanel.style.display = 'none';
      if (viewFooter) viewFooter.style.display = 'flex';
      if (editFooter) editFooter.style.display = 'none';
      if (headerTitle) headerTitle.textContent = 'Subtask Saved Details';
    }
  };

  window.cancelSubtaskModalEdit = function () {
    const subtaskId = document.getElementById('stModalSubtaskId')?.value;
    if (subtaskId) {
      window.switchSubtaskModalMode('view');
    } else {
      closeModal(document.getElementById('modalSubtaskDetails'));
    }
  };

  window.renderModalViewChecklist = function () {
    const container = document.getElementById('stModalViewChecklistContainer');
    const progressEl = document.getElementById('stModalViewChecklistProgress');
    if (!container) return;

    const total = activeModalSubtaskChecklists.length;
    const done = activeModalSubtaskChecklists.filter(c => c.done).length;
    if (progressEl) progressEl.textContent = `${done}/${total} Completed`;

    if (total === 0) {
      container.innerHTML = `<div style="font-size:0.78rem;color:#94a3b8;font-style:italic;">No checklist items recorded.</div>`;
      return;
    }

    container.innerHTML = activeModalSubtaskChecklists.map((item, idx) => `
      <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;background:${item.done ? '#f0fdf4' : '#ffffff'};border:1px solid ${item.done ? '#bbf7d0' : '#e2e8f0'};">
        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="window.toggleModalChecklistItem(${idx})" style="accent-color:#16a34a;cursor:pointer;">
        <span style="font-size:0.80rem;font-weight:600;color:${item.done ? '#15803d' : '#334155'};text-decoration:${item.done ? 'line-through' : 'none'};">
          ${escapeHtml(item.text)}
        </span>
      </div>
    `).join('');
  };

  window.openQuickSubtaskDetailsModal = function (taskId, e) {
    if (e) e.stopPropagation();
    const tasks = Store.getTasks();
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;

    const tIdEl = document.getElementById('stModalTaskId');
    const stIdEl = document.getElementById('stModalSubtaskId');
    const parentTitleEl = document.getElementById('stModalParentTitle');

    if (tIdEl) tIdEl.value = taskId;
    if (stIdEl) stIdEl.value = ''; // new subtask indicator
    if (parentTitleEl) parentTitleEl.textContent = `${t.id}: ${t.title}`;

    // Title from quick input if user already typed something
    const quickTitle = document.getElementById('quickSubtaskInput-' + taskId)?.value || '';
    const titleIn = document.getElementById('stModalTitleIn');
    if (titleIn) titleIn.value = quickTitle;

    // Status & Priority from quick inputs
    const quickStatus = document.getElementById('quickSubtaskStatus-' + taskId)?.value || 'In Progress';
    const quickPriority = document.getElementById('quickSubtaskPriority-' + taskId)?.value || 'Medium';
    const quickDueDate = document.getElementById('quickSubtaskDueDate-' + taskId)?.value || t.dueDate || '2026-09-24';

    const statusIn = document.getElementById('stModalStatusIn');
    if (statusIn) statusIn.value = quickStatus;

    const priorityIn = document.getElementById('stModalPriorityIn');
    if (priorityIn) priorityIn.value = quickPriority;

    const dueDateIn = document.getElementById('stModalDueDateIn');
    if (dueDateIn) dueDateIn.value = quickDueDate;

    const estIn = document.getElementById('stModalEstIn');
    if (estIn) estIn.value = '';

    const descIn = document.getElementById('stModalDescIn');
    if (descIn) descIn.value = '';

    // Assignees from quick input if any
    const list = quickSubtaskAssigneesMap[taskId] || [];
    activeModalSubtaskAssignees = [...list];
    window.renderModalAssigneesList();

    activeModalSubtaskChecklists = [];
    window.renderModalChecklist();

    // Hide delete buttons for new subtask
    const delBtn1 = document.getElementById('stModalViewDeleteBtn');
    const delBtn2 = document.getElementById('stModalDeleteBtn');
    if (delBtn1) delBtn1.style.display = 'none';
    if (delBtn2) delBtn2.style.display = 'none';

    window.switchSubtaskModalMode('edit');
    openModal('modalSubtaskDetails');
  };

  window.renderModalAssigneesList = function () {
    const container = document.getElementById('stModalAssigneesList');
    if (!container) return;

    container.innerHTML = GRID_AVAILABLE_MEMBERS.map(m => {
      const isChecked = activeModalSubtaskAssignees.includes(m.name);
      const initials = getAvatarInitials(m.name);
      const bg = getAvatarColor(m.name);
      return `
        <label style="display:flex;align-items:center;gap:6px;padding:3px 6px;cursor:pointer;border-radius:6px;user-select:none;${isChecked ? 'background:#eff6ff;' : ''}"
          onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='${isChecked ? '#eff6ff' : 'transparent'}'"
          onclick="window.toggleModalMember('${escapeHtml(m.name)}', event)">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); window.toggleModalMember('${escapeHtml(m.name)}', event)"
            style="width:13px;height:13px;cursor:pointer;accent-color:#2563eb;margin:0;">
          <div class="assignee-avatar-circle" style="width:20px;height:20px;font-size:0.56rem;background:${bg};border:none;margin-left:0;box-shadow:none;flex-shrink:0;">${initials}</div>
          <div style="flex:1;min-width:0;line-height:1.2;">
            <div style="font-size:0.75rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(m.name)}</div>
          </div>
        </label>
      `;
    }).join('');
  };

  window.toggleModalMember = function (name, e) {
    if (e) e.stopPropagation();
    const idx = activeModalSubtaskAssignees.indexOf(name);
    if (idx !== -1) {
      activeModalSubtaskAssignees.splice(idx, 1);
    } else {
      activeModalSubtaskAssignees.push(name);
    }
    window.renderModalAssigneesList();
  };

  window.setModalAssigneesAll = function (selectAll) {
    activeModalSubtaskAssignees = selectAll ? GRID_AVAILABLE_MEMBERS.map(m => m.name) : [];
    window.renderModalAssigneesList();
  };

  // Checklist helper inside modal
  window.renderModalChecklist = function () {
    const container = document.getElementById('stModalChecklistContainer');
    const progressEl = document.getElementById('stModalChecklistProgress');
    if (!container) return;

    const total = activeModalSubtaskChecklists.length;
    const done = activeModalSubtaskChecklists.filter(c => c.done).length;
    if (progressEl) progressEl.textContent = `${done}/${total}`;

    if (total === 0) {
      container.innerHTML = `<div style="font-size:0.74rem;color:#94a3b8;font-style:italic;padding:4px 0;">No checklist items added yet.</div>`;
      return;
    }

    container.innerHTML = activeModalSubtaskChecklists.map((item, idx) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;border-radius:6px;background:${item.done ? '#f0fdf4' : '#ffffff'};border:1px solid ${item.done ? '#bbf7d0' : '#e2e8f0'};">
        <label style="display:flex;align-items:center;gap:7px;cursor:pointer;flex:1;min-width:0;">
          <input type="checkbox" ${item.done ? 'checked' : ''} onchange="window.toggleModalChecklistItem(${idx})" style="accent-color:#16a34a;cursor:pointer;">
          <span style="font-size:0.78rem;font-weight:600;color:${item.done ? '#15803d' : '#334155'};text-decoration:${item.done ? 'line-through' : 'none'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${escapeHtml(item.text)}
          </span>
        </label>
        <button type="button" onclick="window.removeModalChecklistItem(${idx})" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:10px;padding:2px 4px;transition:color 0.15s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">
          <i class="pi pi-times"></i>
        </button>
      </div>
    `).join('');
  };

  window.addModalChecklistItem = function () {
    const input = document.getElementById('stModalNewChecklistIn');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    activeModalSubtaskChecklists.push({ id: 'ck-' + Date.now().toString(36), text, done: false });
    input.value = '';
    window.renderModalChecklist();
    window.renderModalViewChecklist();
    input.focus();
  };

  window.toggleModalChecklistItem = function (idx) {
    if (activeModalSubtaskChecklists[idx]) {
      activeModalSubtaskChecklists[idx].done = !activeModalSubtaskChecklists[idx].done;
      window.renderModalChecklist();
      window.renderModalViewChecklist();
    }
  };

  window.removeModalChecklistItem = function (idx) {
    activeModalSubtaskChecklists.splice(idx, 1);
    window.renderModalChecklist();
    window.renderModalViewChecklist();
  };

  window.saveSubtaskDetailsModal = function () {
    const taskId = document.getElementById('stModalTaskId')?.value;
    const subtaskId = document.getElementById('stModalSubtaskId')?.value;
    const title = (document.getElementById('stModalTitleIn')?.value || '').trim();

    if (!taskId) return;
    if (!title) {
      const titleIn = document.getElementById('stModalTitleIn');
      if (titleIn) {
        titleIn.focus();
        titleIn.style.borderColor = '#ef4444';
        setTimeout(() => { if (titleIn) titleIn.style.borderColor = '#cbd5e1'; }, 1500);
      }
      if (typeof showToast === 'function') showToast('Please enter a subtask name.');
      return;
    }

    const status = document.getElementById('stModalStatusIn')?.value || 'In Progress';
    const priority = document.getElementById('stModalPriorityIn')?.value || 'Medium';
    const dueDate = document.getElementById('stModalDueDateIn')?.value || '';
    const estimatedHours = document.getElementById('stModalEstIn')?.value?.trim() || '';
    const description = document.getElementById('stModalDescIn')?.value?.trim() || '';
    const completed = status === 'Completed';

    if (subtaskId) {
      // Update existing subtask
      Store.updateSubtask(taskId, subtaskId, {
        title,
        status,
        priority,
        dueDate,
        estimatedHours,
        description,
        assignees: [...activeModalSubtaskAssignees],
        assignee: activeModalSubtaskAssignees.join(', '),
        checklists: activeModalSubtaskChecklists,
        completed
      });
      if (typeof showToast === 'function') {
        showToast(`Subtask "${title}" details saved!`);
      }
      // Re-populate and display as saved details in view mode
      window.openSubtaskDetailsModal(taskId, subtaskId, null, 'view');
    } else {
      // Create new subtask from modal
      const newSt = Store.addSubtask(taskId, {
        title,
        status,
        priority,
        dueDate,
        estimatedHours,
        description,
        assignees: [...activeModalSubtaskAssignees],
        assignee: activeModalSubtaskAssignees.join(', '),
        checklists: activeModalSubtaskChecklists,
        completed
      });
      quickSubtaskAssigneesMap[taskId] = [];
      const quickInput = document.getElementById('quickSubtaskInput-' + taskId);
      if (quickInput) quickInput.value = '';
      if (typeof showToast === 'function') {
        showToast(`Subtask "${title}" added with details!`);
      }
      if (newSt && newSt.id) {
        window.openSubtaskDetailsModal(taskId, newSt.id, null, 'view');
      } else {
        closeModal(document.getElementById('modalSubtaskDetails'));
      }
    }

    renderTable();
  };

  window.deleteActiveModalSubtask = function () {
    const taskId = document.getElementById('stModalTaskId')?.value;
    const subtaskId = document.getElementById('stModalSubtaskId')?.value;
    if (taskId && subtaskId) {
      Store.deleteSubtask(taskId, subtaskId);
      closeModal(document.getElementById('modalSubtaskDetails'));
      if (typeof showToast === 'function') {
        showToast('Subtask deleted.');
      }
      renderTable();
    }
  };

  // ══════════════════════════════════════════════
  //  TASK DETAIL MODAL (Read Receipts & Filtered Roster)
  // ══════════════════════════════════════════════
  let activeReadReceiptTaskId = null;
  let activeReceiptFilter = 'all'; // 'all' | 'read' | 'unread'

  window.openTaskReceipts = function (id, filter = 'all') {
    activeReadReceiptTaskId = id;
    activeReceiptFilter = filter;

    const task = Store.getTasks().find(t => t.id === id);
    if (!task) return;

    const setEl = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
    setEl('mrrTaskTitle', `${task.id}: ${task.title}`);
    setEl('mrrTaskSubtitle', `Project: ${task.project} · Due: ${formatDisplayDate(task.dueDate)} · Priority: ${task.priority}`);
    setEl('mrrTaskDesc', task.description || 'No specific deliverable instructions provided.');

    const assignees = task.assignees || [];
    const totalCount = assignees.length || 1;
    const readCount = assignees.filter(a => a.read).length;
    const unreadCount = totalCount - readCount;

    // Set summary stats
    setEl('mrrStatRead', `${readCount}`);
    setEl('mrrStatUnread', `${unreadCount}`);
    setEl('mrrTotalAssignedCount', `${totalCount}`);

    // Update filter pill UI and render roster
    updateModalFilterTabs(activeReceiptFilter);
    renderModalRoster(task, activeReceiptFilter);

    openModal('modalReadReceipts');
  };

  window.openTaskDetail = function (id) {
    window.openTaskReceipts(id, 'all');
  };

  window.filterModalReceipts = function (filter) {
    activeReceiptFilter = filter;
    updateModalFilterTabs(filter);
    if (!activeReadReceiptTaskId) return;
    const task = Store.getTasks().find(t => t.id === activeReadReceiptTaskId);
    if (task) renderModalRoster(task, filter);
  };

  function updateModalFilterTabs(filter) {
    ['all', 'read', 'unread'].forEach(f => {
      const btn = document.getElementById('mrrFilterBtn' + f.charAt(0).toUpperCase() + f.slice(1));
      if (btn) btn.classList.toggle('active', f === filter);
    });
  }

  function renderModalRoster(task, filter = 'all') {
    const listEl = document.getElementById('mrrMembersList');
    if (!listEl) return;

    let assignees = (task.assignees || []).map((a, originalIndex) => ({ ...a, originalIndex }));

    if (filter === 'read') {
      assignees = assignees.filter(a => a.read);
    } else if (filter === 'unread') {
      assignees = assignees.filter(a => !a.read);
    }

    if (assignees.length === 0) {
      listEl.innerHTML = `<div style="padding:20px;text-align:center;color:#94a3b8;font-size:0.84rem;background:#f8fafc;border-radius:10px;border:1px dashed #cbd5e1;">
        No ${filter === 'read' ? 'read' : (filter === 'unread' ? 'unread' : 'assigned')} members found.
      </div>`;
      return;
    }

    listEl.innerHTML = assignees.map(a => {
      const initials = getAvatarInitials(a.name);
      const color = AVATAR_COLORS[a.originalIndex % AVATAR_COLORS.length];
      const isRead = !!a.read;

      return `
        <div style="display:flex;align-items:center;justify-content:space-between;background:${isRead ? '#ffffff' : '#fffdfa'};border:1.5px solid ${isRead ? '#e2e8f0' : '#fed7aa'};border-radius:10px;padding:10px 14px;gap:12px;">
          <!-- Member Avatar, Full Name & Role -->
          <div style="display:flex;align-items:center;gap:10px;min-width:160px;">
            <div style="width:34px;height:34px;border-radius:50%;background:${color};color:#ffffff;font-weight:800;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              ${initials}
            </div>
            <div>
              <div style="font-weight:800;color:#0f172a;font-size:0.85rem;">${a.name}</div>
              <div style="font-size:0.72rem;color:#64748b;">${a.role || 'Assigned Member'}</div>
            </div>
          </div>

          <!-- Read Status Badge (View Only) -->
          <div style="display:flex;align-items:center;">
            ${isRead
              ? `<span style="font-size:0.74rem;font-weight:700;color:#15803d;background:#f0fdf4;border:1.5px solid #bbf7d0;padding:4px 12px;border-radius:20px;display:inline-flex;align-items:center;gap:5px;">
                   <i class="pi pi-check" style="font-size:10px;font-weight:900;"></i>
                   <span>Read · ${a.readAt || 'Earlier'}</span>
                 </span>`
              : `<span style="font-size:0.74rem;font-weight:700;color:#b45309;background:#fffbeb;border:1.5px solid #fde68a;padding:4px 12px;border-radius:20px;display:inline-flex;align-items:center;gap:5px;">
                   <i class="pi pi-clock" style="font-size:10px;"></i>
                   <span>⏳ Unread</span>
                 </span>`
            }
          </div>
        </div>`;
    }).join('');
  }

  // Toggle member read status
  window.toggleMemberReadStatus = function (taskId, memberIdx) {
    const list = Store.getTasks();
    const task = list.find(t => t.id === taskId);
    if (!task || !task.assignees || !task.assignees[memberIdx]) return;

    const m = task.assignees[memberIdx];
    m.read = !m.read;
    m.readAt = m.read ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
    Store.saveTasks(list);

    showToast(`${m.name}: marked as ${m.read ? 'Read' : 'Unread'}`);
    window.openTaskReceipts(taskId, activeReceiptFilter);
    renderTable();
  };

  // ══════════════════════════════════════════════
  //  MEETING DETAIL MODAL (RSVP + Minutes)
  // ══════════════════════════════════════════════
  let activeMeetingId = null;

  window.openMeetingDetail = function (id) {
    activeMeetingId = id;
    const meetings = Store.getMeetings();
    const m = meetings.find(x => x.id === id);
    if (!m) return;

    const setEl = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };

    setEl('mdTitle', `${m.id}: ${m.title}`);
    setEl('mdSubtitle', `${m.project} · ${formatDisplayDateTime(m.dateTime)} · ${m.mode || 'Virtual'}`);
    setEl('mdProject', m.project || '—');
    setEl('mdDateTime', formatDisplayDateTime(m.dateTime));
    setEl('mdMode', m.mode || 'Virtual (Google Meet)');

    // Status
    const mdStatus = document.getElementById('mdStatus');
    if (mdStatus) {
      mdStatus.innerHTML = m.status === 'Scheduled'
        ? `<span style="color:#1837d4;background:#eff4fe;border:1px solid #c7d7fc;padding:2px 10px;border-radius:8px;font-size:0.82rem;">📅 Scheduled</span>`
        : `<span style="color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:2px 10px;border-radius:8px;font-size:0.82rem;">✅ Completed</span>`;
    }

    // Agenda
    const mdAgenda = document.getElementById('mdAgenda');
    if (mdAgenda) mdAgenda.textContent = m.agenda || 'No agenda specified.';

    // Minutes
    const minutesEl = document.getElementById('mdMinutesTextarea');
    if (minutesEl) minutesEl.value = m.minutes || '';

    // RSVP List
    buildRsvpList(m);

    openModal('modalMeetingDetail');
  };

  function buildRsvpList(m) {
    const participants = m.participants || [];
    const accepted = participants.filter(p => p.status === 'Accepted').length;
    const rsvpList = document.getElementById('mdRsvpList');
    const rsvpCount = document.getElementById('mdRsvpCount');
    const rsvpPill = document.getElementById('mdRsvpSummaryPill');

    if (rsvpCount) rsvpCount.textContent = `${accepted} of ${participants.length} Confirmed`;
    if (rsvpPill) rsvpPill.textContent = participants.length ? `${Math.round((accepted / participants.length) * 100)}% Acceptance` : '';

    if (!rsvpList) return;

    if (participants.length === 0) {
      rsvpList.innerHTML = `<div style="padding:14px;text-align:center;color:#94a3b8;font-size:0.84rem;">No attendees listed.</div>`;
      return;
    }

    rsvpList.innerHTML = participants.map((p, idx) => {
      const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
      const initials = getAvatarInitials(p.name);
      const isAccepted = p.status === 'Accepted';
      const isDeclined = p.status === 'Declined';

      return `
        <div class="rsvp-row" id="rsvp-row-${idx}">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:50%;background:${color};color:#fff;font-weight:800;font-size:0.78rem;display:flex;align-items:center;justify-content:center;">${initials}</div>
            <div>
              <div style="font-weight:700;color:#1e293b;font-size:0.86rem;">${p.name}</div>
              <div style="font-size:0.72rem;color:#64748b;">${p.role || 'Attendee'}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <button class="rsvp-accept-btn ${isAccepted ? 'accepted' : ''}" onclick="window.setRsvp(${idx},'Accepted')" id="rsvp-accept-${idx}">
              <i class="pi pi-check" style="font-size:10px;"></i> Accept
            </button>
            <button class="rsvp-decline-btn ${isDeclined ? 'declined' : ''}" onclick="window.setRsvp(${idx},'Declined')" id="rsvp-decline-${idx}">
              <i class="pi pi-times" style="font-size:10px;"></i> Decline
            </button>
          </div>
        </div>`;
    }).join('');
  }

  window.setRsvp = function (participantIdx, status) {
    if (!activeMeetingId) return;
    const meetings = Store.getMeetings();
    const m = meetings.find(x => x.id === activeMeetingId);
    if (!m || !m.participants || !m.participants[participantIdx]) return;

    m.participants[participantIdx].status = status;
    Store.saveMeetings(meetings);

    // Re-build RSVP section in modal
    buildRsvpList(m);
    renderTable();
    showToast(`RSVP updated: ${m.participants[participantIdx].name} → ${status}`);
  };

  // Save Meeting Detail (minutes + any changes)
  document.getElementById('btnSaveMeetingDetail')?.addEventListener('click', () => {
    if (!activeMeetingId) return;
    const meetings = Store.getMeetings();
    const m = meetings.find(x => x.id === activeMeetingId);
    if (!m) return;

    const minutesEl = document.getElementById('mdMinutesTextarea');
    if (minutesEl) m.minutes = minutesEl.value.trim();

    Store.saveMeetings(meetings);
    closeModal(document.getElementById('modalMeetingDetail'));
    renderTable();
    showToast('Meeting details saved!');
  });

  // ══════════════════════════════════════════════
  //  SURVEY DETAIL MODAL
  // ══════════════════════════════════════════════
  window.previewSurvey = function (id) {
    const surveys = Store.getSurveys();
    const s = surveys.find(x => x.id === id);
    if (!s) return;

    const setEl = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
    setEl('sdvSurveyTitle', s.name);
    setEl('sdvSurveySubtitle', `Project: ${s.project} | Quota: ${s.targetSample || s.minRespondents} Target Samples`);
    setEl('sdvQuestionsCount', s.questions ? s.questions.length : 0);

    const sdvQuestionsList = document.getElementById('sdvQuestionsList');
    if (sdvQuestionsList) {
      if (!s.questions || s.questions.length === 0) {
        sdvQuestionsList.innerHTML = `<div style="padding:20px;color:#94a3b8;text-align:center;">No questions attached to this survey.</div>`;
      } else {
        sdvQuestionsList.innerHTML = s.questions.map((q, idx) => {
          const mediaList = [];
          if (q.voice) mediaList.push('🎙️ Voice');
          if (q.image) mediaList.push('📷 Photo');
          if (q.video) mediaList.push('🎥 Video');
          return `
            <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 16px;display:flex;align-items:flex-start;gap:12px;">
              <div style="font-weight:800;color:#64748b;font-size:0.8rem;width:26px;padding-top:2px;">Q${idx + 1}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
                  <span class="qb-code-badge">${q.id || 'Q-CUST'}</span>
                  <span class="qb-type-tag">${q.type}</span>
                  ${mediaList.map(ml => `<span class="qb-media-tag">${ml}</span>`).join('')}
                </div>
                <div style="font-size:0.88rem;font-weight:700;color:#1e293b;">${q.text}</div>
                ${q.options ? `<div style="font-size:0.76rem;color:#64748b;margin-top:4px;"><strong>Options:</strong> ${q.options}</div>` : ''}
              </div>
            </div>`;
        }).join('');
      }
    }
    openModal('modalSurveyDetailView');
  };

  // Survey detail tabs
  const tabBtnSDVQuestions = document.getElementById('tabBtnSDVQuestions');
  const tabBtnSDVMatching = document.getElementById('tabBtnSDVMatching');
  const sdvPanelQuestions = document.getElementById('sdvPanelQuestions');
  const sdvPanelMatching = document.getElementById('sdvPanelMatching');

  tabBtnSDVQuestions?.addEventListener('click', () => {
    tabBtnSDVQuestions.classList.add('active');
    tabBtnSDVMatching.classList.remove('active');
    if (sdvPanelQuestions) sdvPanelQuestions.style.display = 'block';
    if (sdvPanelMatching) sdvPanelMatching.style.display = 'none';
  });
  tabBtnSDVMatching?.addEventListener('click', () => {
    tabBtnSDVMatching.classList.add('active');
    tabBtnSDVQuestions.classList.remove('active');
    if (sdvPanelQuestions) sdvPanelQuestions.style.display = 'none';
    if (sdvPanelMatching) sdvPanelMatching.style.display = 'block';
  });

  // ══════════════════════════════════════════════
  //  SAVE NEW TASK
  // ══════════════════════════════════════════════
  document.getElementById('btnSaveTaskModal')?.addEventListener('click', () => {
    const taskType = document.getElementById('modalTaskTypeSelect')?.value || 'standard';
    const title = document.getElementById('taskTitleIn')?.value.trim();
    const desc = document.getElementById('taskDescIn')?.value.trim();
    const project = document.getElementById('taskProjectSelect')?.value;
    const assigneesRaw = document.getElementById('taskAssigneesIn')?.value.trim() || 'Assigned Member';
    const dueDate = document.getElementById('taskDueDateIn')?.value;
    const priority = document.getElementById('taskPrioritySelect')?.value;
    const initialProgress = parseInt(document.getElementById('taskProgressIn')?.value) || 0;

    if (!title) { alert('Please enter a Task Title.'); return; }

    const names = assigneesRaw.split(',').map(s => s.trim()).filter(Boolean);
    const assigneesList = names.map(name => ({ name, role: 'Assigned Member', read: false, readAt: null, completed: false, completedAt: null }));

    let tag = 'Standard';
    let category = 'task';
    if (taskType === 'survey') {
      tag = 'Survey';
      category = 'survey';
    } else if (taskType === 'meeting') {
      tag = 'Meeting';
      category = 'meeting';

      const meetings = Store.getMeetings();
      const newMeeting = {
        id: `MTG-0${meetings.length + 1}`,
        title,
        project,
        dateTime: `${dueDate || '2026-11-15'}T11:00`,
        mode: 'In-Person / Virtual',
        agenda: desc || `Review meeting regarding ${project}.`,
        participants: assigneesList.map((a, i) => ({
          name: a.name,
          role: 'Attendee',
          status: i === 0 ? 'Accepted' : 'Pending'
        })),
        minutes: ''
      };
      if (Store.addMeeting) Store.addMeeting(newMeeting);
    }

    const tasks = Store.getTasks();
    const newTask = {
      id: `TSK-0${tasks.length + 1}`,
      title,
      description: desc || 'No specific deliverable instructions provided.',
      project,
      assignee: names.join(', '),
      assignees: assigneesList,
      progress: initialProgress,
      dueDate,
      priority,
      status: initialProgress === 100 ? 'Completed' : 'Active',
      tag,
      type: taskType,
      category
    };

    Store.addTask(newTask);
    closeModal(document.getElementById('modalNewTask'));
    currentTab = 'task';
    window.switchTab('task');
    showToast(`Task "${title}" created and assigned to ${names.length} member(s)!`);

    document.getElementById('taskTitleIn').value = '';
    document.getElementById('taskDescIn').value = '';
  });

  // ══════════════════════════════════════════════
  //  SAVE NEW MEETING
  // ══════════════════════════════════════════════
  document.getElementById('btnSaveMeetingModal')?.addEventListener('click', () => {
    const title = document.getElementById('meetingTitleIn')?.value.trim();
    const agenda = document.getElementById('meetingAgendaIn')?.value.trim();
    const project = document.getElementById('meetingProjectSelect')?.value;
    const dateTime = document.getElementById('meetingDateTimeIn')?.value;
    const mode = document.getElementById('meetingModeSelect')?.value;
    const attendeesRaw = document.getElementById('meetingAttendeesIn')?.value.trim() || '';

    if (!title) { alert('Please enter a Meeting Title.'); return; }

    // Build participants array from comma-separated names
    const names = attendeesRaw.split(',').map(s => s.trim()).filter(Boolean);
    const participants = names.map((name, i) => ({
      name,
      role: 'Attendee',
      status: i === 0 ? 'Accepted' : 'Pending'
    }));

    const meetings = Store.getMeetings();
    const newMeeting = {
      id: `MTG-0${meetings.length + 1}`,
      title,
      agenda: agenda || 'Steering and project coordination review.',
      project,
      dateTime: dateTime || '2026-10-15 15:00',
      mode,
      attendees: attendeesRaw,
      participants,
      minutes: '',
      status: 'Scheduled'
    };

    Store.addMeeting(newMeeting);
    closeModal(document.getElementById('modalNewMeeting'));
    currentTab = 'meeting';
    window.switchTab('meeting');
    showToast(`Meeting "${title}" scheduled with ${participants.length} attendee(s)!`);

    document.getElementById('meetingTitleIn').value = '';
    document.getElementById('meetingAgendaIn').value = '';
  });

  // ══════════════════════════════════════════════
  //  INITIAL LOAD
  // ══════════════════════════════════════════════
  populateProjects();
  window.switchTab(currentTab);
});
