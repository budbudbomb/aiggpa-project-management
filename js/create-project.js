/**
 * AIGGPA - Create & Sanction Project Controller
 * Handles dual-tab layout: Projects List (with FY filter & Add Budget/Assignee buttons)
 * and Create New Project (with General Details & Save button)
 * plus contextual Head-Wise Budget Estimation and Assign Team Desks
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

  // ── Top Dropdown ──
  const userDropBtn = document.getElementById('topUserDropdownBtn');
  const userDropMenu = document.getElementById('topUserDropdownMenu');
  if (userDropBtn && userDropMenu) {
    userDropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropMenu.style.display = userDropMenu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => { userDropMenu.style.display = 'none'; });
  }

  // ══════════════════════════════════════════════
  //  MODAL POPUP CONTROLLERS
  // ══════════════════════════════════════════════
  let editingProjectId = null;

  window.openCreateProjectModal = function (editId = null) {
    editingProjectId = editId;
    const modal = document.getElementById('createProjectModal');
    if (!modal) return;

    const modalTitle = document.getElementById('createProjectModalTitle');
    const modalSubtitle = document.getElementById('createProjectModalSubtitle');
    const saveBtnText = document.getElementById('btnSaveNewProjectText');

    if (editId) {
      const p = Store.getProjects().find(x => x.id === editId);
      if (p) {
        if (modalTitle) modalTitle.textContent = 'Edit Basic Details';
        if (modalSubtitle) modalSubtitle.textContent = `Update basic information for ${p.code || p.id}`;
        if (saveBtnText) saveBtnText.textContent = 'Save Changes';

        const nameInp = document.getElementById('cpProjectName');
        const schemeInp = document.getElementById('cpProjectScheme');
        const fyInp = document.getElementById('cpProjectFY');
        const fundInp = document.getElementById('cpFundingPattern');
        const prcInp = document.getElementById('cpPrcDate');
        const startInp = document.getElementById('cpStartDate');
        const endInp = document.getElementById('cpEndDate');
        const durInp = document.getElementById('cpDurationMonths');

        if (nameInp) nameInp.value = p.name || '';
        if (schemeInp) schemeInp.value = p.scheme || '';
        if (fyInp) fyInp.value = p.financialYear || '2026–2027';
        if (fundInp) fundInp.value = p.fundingPattern || 'Internal';
        if (prcInp) prcInp.value = p.prcDate || '';
        if (startInp) startInp.value = p.startDate || '';
        if (endInp) endInp.value = p.endDate || '';
        if (durInp) durInp.value = p.durationMonths || 12;
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'Add General Details';
      if (modalSubtitle) modalSubtitle.textContent = 'Fill in the project general details below and save.';
      if (saveBtnText) saveBtnText.textContent = 'Save Project';

      const nameInp = document.getElementById('cpProjectName');
      const schemeInp = document.getElementById('cpProjectScheme');
      const fundInp = document.getElementById('cpFundingPattern');
      const prcInp = document.getElementById('cpPrcDate');
      const startInp = document.getElementById('cpStartDate');
      const endInp = document.getElementById('cpEndDate');
      const durInp = document.getElementById('cpDurationMonths');

      if (nameInp) nameInp.value = '';
      if (schemeInp) schemeInp.value = '';
      if (fundInp) fundInp.value = 'Internal';
      if (prcInp) prcInp.value = '';
      if (startInp) startInp.value = '';
      if (endInp) endInp.value = '';
      if (durInp) durInp.value = 12;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.getElementById('cpProjectName')?.focus();
    }, 50);
  };

  window.closeCreateProjectModal = function () {
    editingProjectId = null;
    const modal = document.getElementById('createProjectModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // ══════════════════════════════════════════════
  //  TAB SWITCHER & ROUTING
  // ══════════════════════════════════════════════
  window.handleCreateProjectTabClick = function () {
    window.switchProjectTab('list');
    window.openCreateProjectModal();
  };

  window.switchProjectTab = function (tabName, projectId = null) {
    if (tabName === 'new') {
      window.openCreateProjectModal();
      return;
    }

    const allTabs = ['list', 'budget', 'team'];

    allTabs.forEach(t => {
      const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
      const content = document.getElementById('tabContent' + t.charAt(0).toUpperCase() + t.slice(1));
      if (btn) btn.classList.toggle('active', t === tabName);
      if (content) content.style.display = (t === tabName) ? 'block' : 'none';
    });

    const teamTabBtn = document.getElementById('tabBtnTeam');
    if (teamTabBtn) {
      teamTabBtn.style.display = (tabName === 'team') ? 'inline-flex' : 'none';
    }

    if (tabName === 'list') {
      renderProjectsListTable();
    } else if (tabName === 'budget') {
      populateBudgetFlowProjectSelect(projectId);
    } else if (tabName === 'team') {
      populateTeamProjectSelect(projectId);
      if (projectId) {
        window.handleTeamProjectChange(projectId);
      } else {
        window.updateCpTeamSummary();
      }
    }
  };

  // ── Duration Auto-Calculation ──
  function calculateDuration() {
    const s = document.getElementById('cpStartDate')?.value;
    const e = document.getElementById('cpEndDate')?.value;
    if (s && e) {
      const d1 = new Date(s);
      const d2 = new Date(e);
      let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
      if (months <= 0) months = 1;
      const dInput = document.getElementById('cpDurationMonths');
      if (dInput) dInput.value = months;
    }
  }
  document.getElementById('cpStartDate')?.addEventListener('change', calculateDuration);
  document.getElementById('cpEndDate')?.addEventListener('change', calculateDuration);

  // ══════════════════════════════════════════════
  //  TAB 1: PROJECTS LIST WITH FINANCIAL YEAR FILTER & PAGINATION
  // ══════════════════════════════════════════════
  let projectListPage = 1;
  const projectListPageSize = 5;

  // ── Circular Avatar Helpers for Assignees Column ──
  const AVATAR_COLORS = [
    '#2563eb', // Royal Blue
    '#7c3aed', // Violet
    '#059669', // Emerald Green
    '#d97706', // Amber
    '#dc2626', // Crimson Red
    '#0891b2', // Teal/Cyan
    '#4f46e5', // Indigo
    '#db2777', // Hot Pink
    '#0284c7'  // Sky Blue
  ];

  function getInitials(name) {
    if (!name) return 'TM';
    const clean = name.replace(/^Dr\.\s*/i, '').replace(/^Prof\.\s*/i, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function getAvatarColor(name) {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  }

  function getProjectAssignees(p) {
    let list = [];
    if (p.team && Array.isArray(p.team.assignedDetails) && p.team.assignedDetails.length > 0) {
      p.team.assignedDetails.forEach(item => {
        if (item.employees && item.employees.length > 0) {
          item.employees.forEach(emp => {
            list.push({ name: emp, role: item.designation || 'Team Member' });
          });
        } else {
          const count = item.positions || 1;
          for (let i = 0; i < count; i++) {
            list.push({ name: `${item.designation} #${i + 1}`, role: item.designation });
          }
        }
      });
    }

    if (list.length === 0) {
      if (p.id === 'PRJ-01' || p.code === 'PRJ-01') {
        list = [
          { name: 'Dr. Rameshwar Singh', role: 'Senior Advisor' },
          { name: 'Priya Patel', role: 'Research Associate' },
          { name: 'Sunita Meena', role: 'Fellow' },
          { name: 'Vikas Tiwari', role: 'Field Investigator' },
          { name: 'Amit Sharma', role: 'Field Investigator' }
        ];
      } else if (p.id === 'PRJ-02' || p.code === 'PRJ-02') {
        list = [
          { name: 'Dr. Ananya Joshi', role: 'Lead Advisor' },
          { name: 'Neha Gupta', role: 'Research Associate' },
          { name: 'Vikas Tiwari', role: 'Field Investigator' }
        ];
      } else if (p.id === 'PRJ-03' || p.code === 'PRJ-03') {
        list = [
          { name: 'Rajesh Kumar', role: 'Lead Fellow' },
          { name: 'Kavita Verma', role: 'Research Associate' }
        ];
      } else if (p.lead) {
        list = [{ name: p.lead, role: 'Project Lead' }];
      }
    }
    return list;
  }

  function getAssigneeAvatarsHtml(project) {
    const assignees = getProjectAssignees(project);

    if (!assignees || assignees.length === 0) {
      return `
        <div style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;" onclick="window.openAssigneeModal('${project.id}')" title="Click to assign team members">
          <span style="background: #f8fafc; border: 1.5px dashed #cbd5e1; color: #64748b; font-weight: 700; font-size: 0.76rem; padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s;" onmouseover="this.style.borderColor='#15803d'; this.style.color='#15803d';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.color='#64748b';">
            <i class="pi pi-user-plus" style="font-size: 11px;"></i>
            <span>Assign</span>
          </span>
        </div>
      `;
    }

    const maxVisible = 4;
    const visible = assignees.slice(0, maxVisible);
    const remaining = assignees.length - maxVisible;

    let avatarsHtml = visible.map(m => {
      const initials = getInitials(m.name);
      const bg = getAvatarColor(m.name);
      return `<div class="assignee-avatar-circle" style="background: ${bg};" title="${m.name} (${m.role})">${initials}</div>`;
    }).join('');

    if (remaining > 0) {
      avatarsHtml += `<div class="assignee-avatar-more" title="${remaining} more assignee${remaining > 1 ? 's' : ''}">+${remaining}</div>`;
    }

    return `
      <div class="assignee-avatar-group" onclick="window.openAssigneeModal('${project.id}')" title="Assigned: ${assignees.map(a => a.name).join(', ')} (Click to edit)">
        ${avatarsHtml}
        <span style="margin-left: 8px; font-size: 0.78rem; font-weight: 700; color: #475569;">${assignees.length}</span>
      </div>
    `;
  }

  function renderProjectsListTable() {
    const tbody = document.getElementById('projectsListTableTbody');
    if (!tbody) return;

    const fyFilter = document.getElementById('projectFyFilter')?.value || 'ALL';
    const searchQuery = (document.getElementById('projectListSearchInput')?.value || '').toLowerCase().trim();

    const projects = Store.getProjects();

    const filtered = projects.filter(p => {
      // FY match
      if (fyFilter !== 'ALL') {
        const filterYear = fyFilter.match(/\d{4}/)?.[0];
        const pYear = (p.financialYear || '').match(/\d{4}/)?.[0];
        if (filterYear && pYear && filterYear !== pYear) {
          return false;
        }
      }
      // Search match
      if (searchQuery) {
        const nameMatch = (p.name || '').toLowerCase().includes(searchQuery);
        const codeMatch = (p.code || p.id || '').toLowerCase().includes(searchQuery);
        const schemeMatch = (p.scheme || p.nature || '').toLowerCase().includes(searchQuery);
        if (!nameMatch && !codeMatch && !schemeMatch) return false;
      }
      return true;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / projectListPageSize) || 1;
    if (projectListPage > totalPages) projectListPage = totalPages;
    if (projectListPage < 1) projectListPage = 1;

    const startIndex = (projectListPage - 1) * projectListPageSize;
    const endIndex = Math.min(startIndex + projectListPageSize, totalItems);
    const pageItems = filtered.slice(startIndex, endIndex);

    // Update count badge
    const badge = document.getElementById('projectListCountBadge');
    if (badge) {
      badge.textContent = `${totalItems} ${totalItems === 1 ? 'Project' : 'Projects'}`;
    }

    if (totalItems === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 32px; text-align: center; color: #94a3b8; font-weight: 600;">No projects found for ${fyFilter === 'ALL' ? 'the selected filter' : fyFilter}. Click "Create New Project" tab above to add one.</td></tr>`;
      const pInfo = document.getElementById('paginationInfoText');
      const pBox = document.getElementById('paginationControlsBox');
      if (pInfo) pInfo.textContent = 'Showing 0 Projects';
      if (pBox) pBox.innerHTML = '';
      return;
    }

    tbody.innerHTML = pageItems.map(p => {
      let budgetFmt = '';
      if (p.budgetSummary && p.budgetSummary.totalEstimatedCost > 0) {
        budgetFmt = `<span style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 8px; color: #15803d; font-weight: 800;">₹${(p.budgetSummary.totalEstimatedCost / 100000).toFixed(1)} L</span>`;
      } else {
        budgetFmt = `<span style="background: #fef2f2; border: 1px solid #fecaca; padding: 4px 10px; border-radius: 8px; color: #b91c1c; font-weight: 800;">Pending</span>`;
      }

      // Action buttons states
      const hasBudget = (p.budgetItems && p.budgetItems.length > 0) ||
                        (p.budgetHeads && p.budgetHeads.length > 0 && p.budgetSummary && p.budgetSummary.totalEstimatedCost > 0);
      
      let budgetActionButtons = '';
      if (hasBudget) {
        budgetActionButtons = `
          <button type="button" class="btn-action-budget-view" onclick="window.openViewBudgetModal('${p.id}')" title="View Project Budget in Modal">
            <i class="pi pi-eye" style="font-size: 11px;"></i>
            <span>View budget</span>
          </button>
          <button type="button" class="btn-action-edit-pencil" onclick="window.openProjectEditOptionsModal('${p.id}')" title="Edit Project (Basic details, Budget, Assignee)">
            <i class="pi pi-pencil"></i>
          </button>
        `;
      } else {
        budgetActionButtons = `
          <button type="button" class="btn-action-budget" onclick="window.openAddBudgetForProject('${p.id}')" title="Add Project Budget">
            <i class="pi pi-wallet" style="font-size: 11px;"></i>
            <span>Add Budget</span>
          </button>
          <button type="button" class="btn-action-edit-pencil" onclick="window.openProjectEditOptionsModal('${p.id}')" title="Edit Project (Basic details, Budget, Assignee)">
            <i class="pi pi-pencil"></i>
          </button>
        `;
      }

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
          <td style="padding: 14px 16px;">
            <div style="font-weight: 700; color: #0f172a; font-size: 0.92rem; line-height: 1.35;">${p.name}</div>
          </td>
          <td style="padding: 14px 16px;">
            <span style="display: inline-block; font-size: 0.76rem; font-weight: 700; color: #0369a1; background: #e0f2fe; padding: 3px 9px; border-radius: 6px; border: 1px solid #bae6fd; white-space: nowrap;">
              ${p.financialYear || '2026–2027'}
            </span>
          </td>
          <td style="padding: 14px 16px; font-size: 0.82rem; color: #334155; white-space: nowrap;">
            <span style="font-size: 0.82rem; color: #1837d4; font-weight: 800; background: #eff6ff; padding: 4px 10px; border-radius: 6px; border: 1.5px solid #bfdbfe;">
              <i class="pi pi-clock" style="font-size: 0.75rem; margin-right: 4px;"></i> ${p.durationMonths || 12} Months
            </span>
          </td>
          <td style="padding: 14px 16px; font-size: 0.88rem; white-space: nowrap;">
            ${budgetFmt}
          </td>
          <td style="padding: 14px 16px; font-size: 0.8rem; color: #475569; white-space: nowrap;">
            ${getAssigneeAvatarsHtml(p)}
          </td>
          <td style="padding: 14px 16px; text-align: center; white-space: nowrap;">
            <div style="display: inline-flex; align-items: center; gap: 8px;">
              ${budgetActionButtons}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Update Pagination Bar
    const pInfo = document.getElementById('paginationInfoText');
    if (pInfo) {
      pInfo.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalItems} Projects`;
    }

    const pBox = document.getElementById('paginationControlsBox');
    if (pBox) {
      let pagesHtml = '';
      pagesHtml += `<button type="button" class="pagination-btn" ${projectListPage === 1 ? 'disabled' : ''} onclick="window.changeProjectListPage(${projectListPage - 1})"><i class="pi pi-chevron-left" style="font-size: 10px;"></i> Prev</button>`;

      for (let i = 1; i <= totalPages; i++) {
        pagesHtml += `<button type="button" class="pagination-btn ${i === projectListPage ? 'active' : ''}" onclick="window.changeProjectListPage(${i})">${i}</button>`;
      }

      pagesHtml += `<button type="button" class="pagination-btn" ${projectListPage === totalPages ? 'disabled' : ''} onclick="window.changeProjectListPage(${projectListPage + 1})">Next <i class="pi pi-chevron-right" style="font-size: 10px;"></i></button>`;

      pBox.innerHTML = pagesHtml;
    }
  }

  window.changeProjectListPage = function (newPage) {
    projectListPage = newPage;
    renderProjectsListTable();
  };

  window.openTeamDetailsModal = function(projectId) {
    const project = Store.getProjects().find(p => p.id === projectId);
    if (!project || !project.team || !project.team.assignedDetails) return;

    const body = document.getElementById('teamDetailsModalBody');
    if (!body) return;

    let html = '';
    project.team.assignedDetails.forEach(d => {
      html += `<div style="margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
        <div style="font-weight: 800; color: #1e293b; font-size: 0.95rem;">${d.positions} ${d.designation}</div>
        <div style="font-size: 0.85rem; color: #475569; margin-top: 4px; line-height: 1.5;">${d.employees.length ? d.employees.join(', ') : '<span style="font-style: italic; color: #94a3b8;">No specific names selected</span>'}</div>
      </div>`;
    });
    
    body.innerHTML = html;
    
    const modal = document.getElementById('teamDetailsModal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeTeamDetailsModal = function() {
    const modal = document.getElementById('teamDetailsModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // Filter Listeners
  document.getElementById('projectFyFilter')?.addEventListener('change', () => {
    projectListPage = 1;
    renderProjectsListTable();
  });
  document.getElementById('projectListSearchInput')?.addEventListener('input', () => {
    projectListPage = 1;
    renderProjectsListTable();
  });
  document.getElementById('globalSearchInput')?.addEventListener('input', (e) => {
    const listInput = document.getElementById('projectListSearchInput');
    if (listInput) {
      listInput.value = e.target.value;
      projectListPage = 1;
      renderProjectsListTable();
    }
  });

  // Action Button Triggers from Table Rows
  window.openAddBudgetForProject = function (projectId) {
    window.switchProjectTab('budget', projectId);
  };

  window.openAddAssigneeForProject = function (projectId) {
    window.openAssigneeModal(projectId);
  };

  // ══════════════════════════════════════════════
  //  TAB 2: CREATE NEW PROJECT (Save Button Action)
  // ══════════════════════════════════════════════
  window.handleSaveProjectOnly = function () {
    const name = document.getElementById('cpProjectName')?.value.trim();
    const scheme = document.getElementById('cpProjectScheme')?.value || '';
    const financialYear = document.getElementById('cpProjectFY')?.value || '2026–2027';
    const fundingPattern = document.getElementById('cpFundingPattern')?.value || 'Internal';
    const prcDate = document.getElementById('cpPrcDate')?.value || '';
    const startDate = document.getElementById('cpStartDate')?.value || '';
    const endDate = document.getElementById('cpEndDate')?.value || '';
    const durationMonths = parseInt(document.getElementById('cpDurationMonths')?.value) || 12;

    if (!name) {
      alert('Please enter a Project Title.');
      document.getElementById('cpProjectName')?.focus();
      return;
    }

    if (editingProjectId) {
      const existingProject = Store.getProjects().find(p => p.id === editingProjectId);
      if (existingProject) {
        existingProject.name = name;
        existingProject.scheme = scheme;
        existingProject.nature = scheme || existingProject.nature;
        existingProject.financialYear = financialYear;
        existingProject.fundingPattern = fundingPattern;
        existingProject.prcDate = prcDate;
        existingProject.startDate = startDate;
        existingProject.endDate = endDate;
        existingProject.durationMonths = durationMonths;

        Store.updateProject(existingProject);
        showToast(`Project "${name}" updated successfully!`);
        editingProjectId = null;
        window.closeCreateProjectModal();
        renderProjectsListTable();
        return;
      }
    }

    const existingProjects = Store.getProjects();
    let maxNum = 0;
    existingProjects.forEach(p => {
      const match = (p.id || '').match(/PRJ-(\d+)/i) || (p.code || '').match(/PRJ-(\d+)/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextNum = Math.max(maxNum + 1, existingProjects.length + 1);
    const autoCode = `PRJ-${String(nextNum).padStart(2, '0')}`;

    // Project created with basic details (budget and assignee can be added later)
    const newProject = {
      id: autoCode,
      code: autoCode,
      name,
      nature: scheme || 'General Policy Research Study',
      scheme: scheme || 'General Policy Research Study',
      financialYear,
      fundingPattern,
      prcDate,
      startDate,
      endDate,
      durationMonths,
      budgetSanctioned: 0,
      budgetUtilized: 0,
      status: 'Active',
      team: {
        advisor: 0,
        ra: 0,
        fellow: 0,
        investigators: 0,
        totalMembers: 0,
        assignedDetails: []
      },
      lead: '',
      progressPercent: 0,
      budgetItems: [],
      budgetHeads: [],
      budgetSummary: {
        subTotal: 0,
        overheadsPct: 15,
        overheadsAmount: 0,
        totalEstimatedCost: 0
      }
    };

    Store.addProject(newProject);

    // Reset form inputs for next time
    const nameEl = document.getElementById('cpProjectName');
    if (nameEl) nameEl.value = '';
    const schemeEl = document.getElementById('cpProjectScheme');
    if (schemeEl) schemeEl.value = '';

    // Close the popup modal
    window.closeCreateProjectModal();

    // Reset FY filter to ALL so the newly created project is always visible
    const fyFilter = document.getElementById('projectFyFilter');
    if (fyFilter) {
      fyFilter.value = 'ALL';
    }

    // Clear search box so it doesn't hide the newly created project
    const searchInput = document.getElementById('projectListSearchInput');
    if (searchInput) searchInput.value = '';

    // Switch to List Tab and re-render the table with the new project at row 1
    projectListPage = 1;
    window.switchProjectTab('list');
    renderProjectsListTable();

    showToast(`Project "${name}" added to list! You can now view it or add budget and assignees.`);
  };

  // ══════════════════════════════════════════════
  //  TAB 4 (Contextual): ASSIGN TEAM DESK
  // ══════════════════════════════════════════════
  function populateTeamProjectSelect(selectedId = null) {
    const sel = document.getElementById('cpTeamProjectSelect');
    if (!sel) return;

    const projects = Store.getProjects();
    let optionsHtml = '';

    projects.forEach(p => {
      const isSel = (selectedId && selectedId === p.id) ? 'selected' : '';
      optionsHtml += `<option value="${p.id}" ${isSel}>${p.name}</option>`;
    });

    sel.innerHTML = optionsHtml;

    const activeId = selectedId || (projects[0] ? projects[0].id : null);
    if (activeId) {
      sel.value = activeId;
      window.handleTeamProjectChange(activeId);
    }
  }

  const EMPLOYEE_DB = {
    'Senior Advisor': ['Anis', 'Kiran', 'Dr. Alok Verma', 'Prof. Gupta'],
    'Research Associate': ['Priya Verma', 'Rahul Sharma', 'Ankit Jain', 'Sneha Patel'],
    'Fellow': ['Rohan Sharma', 'Deepak Chouhan', 'Manish Verma'],
    'Field Investigator': ['Rajesh Kumar', 'Sunita Meena', 'Vikas Tiwari', 'Anita Das', 'Gaurav Yadav']
  };

  let currentAssignedTeam = [];

  window.handleTeamProjectChange = function (selectedId) {
    const project = Store.getProjects().find(p => p.id === selectedId);
    if (!project) return;
    
    // Reset form
    document.getElementById('teamDesignationSelect').value = '';
    document.getElementById('teamPositionCount').value = '1';
    window.updateEmployeeList();

    if (project.team && project.team.assignedDetails) {
      currentAssignedTeam = JSON.parse(JSON.stringify(project.team.assignedDetails));
    } else {
      currentAssignedTeam = [];
    }
    window.renderAssignedTeamTable();
  };

  window.toggleEmployeeMenu = function(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('employeeCheckboxMenu');
    if (menu) {
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
  };

  // Close the employee dropdown when clicking outside
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('employeeCheckboxMenu');
    const trigger = document.getElementById('employeeDropdownTrigger');
    if (menu && trigger) {
      if (menu.style.display === 'block' && !menu.contains(e.target) && !trigger.contains(e.target)) {
        menu.style.display = 'none';
      }
    }
  });

  window.updateEmployeeList = function () {
    const desig = document.getElementById('teamDesignationSelect').value;
    const emptyMsg = document.getElementById('employeeMenuEmpty');
    const menuList = document.getElementById('employeeMenuList');
    const selectText = document.getElementById('selectedEmployeesText');

    if (!desig) {
      emptyMsg.style.display = 'block';
      menuList.style.display = 'none';
      selectText.textContent = 'Select employees...';
      return;
    }

    emptyMsg.style.display = 'none';
    menuList.style.display = 'block';
    selectText.textContent = 'Select employees...';

    const employees = EMPLOYEE_DB[desig] || [];
    menuList.innerHTML = employees.map(emp => `
      <label style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; transition: background 0.1s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
        <input type="checkbox" value="${emp}" class="emp-checkbox" onchange="window.handleEmployeeSelectionChange()" style="accent-color: #1837d4;">
        <span style="font-size: 0.85rem; color: #334155;">${emp}</span>
      </label>
    `).join('');
  };

  window.handleEmployeeSelectionChange = function() {
    const checkboxes = document.querySelectorAll('.emp-checkbox:checked');
    const selected = Array.from(checkboxes).map(cb => cb.value);
    const selectText = document.getElementById('selectedEmployeesText');
    
    if (selected.length === 0) {
      selectText.textContent = 'Select employees...';
    } else {
      selectText.textContent = selected.join(', ');
    }
  };

  window.addTeamMemberRow = function() {
    const desig = document.getElementById('teamDesignationSelect').value;
    const count = parseInt(document.getElementById('teamPositionCount').value) || 0;
    const checkboxes = document.querySelectorAll('.emp-checkbox:checked');
    const selectedEmps = Array.from(checkboxes).map(cb => cb.value);

    if (!desig || count < 1) {
      alert('Please select a designation and enter at least 1 position.');
      return;
    }

    currentAssignedTeam.push({
      designation: desig,
      positions: count,
      employees: selectedEmps
    });

    // Reset form
    document.getElementById('teamDesignationSelect').value = '';
    document.getElementById('teamPositionCount').value = '1';
    window.updateEmployeeList();

    window.renderAssignedTeamTable();
  };

  window.removeTeamMemberRow = function(index) {
    currentAssignedTeam.splice(index, 1);
    window.renderAssignedTeamTable();
  };

  window.renderAssignedTeamTable = function() {
    const tbody = document.getElementById('assignedTeamTbody');
    const summary = document.getElementById('cpTeamSummaryText');
    
    let totalPositions = 0;

    if (currentAssignedTeam.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8; font-weight: 600;">No team members assigned yet. Use the form above to add members.</td></tr>';
      summary.innerHTML = 'No team members added.';
      return;
    }

    let summaryText = [];

    tbody.innerHTML = currentAssignedTeam.map((item, idx) => {
      totalPositions += item.positions;
      summaryText.push(`${item.positions} ${item.designation}`);
      const empDisplay = item.employees.length > 0 ? item.employees.join(', ') : '<span style="color: #94a3b8; font-style: italic;">To be assigned later</span>';
      
      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 14px; font-weight: 700; color: #1e293b;">${item.designation}</td>
          <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #1837d4;">${item.positions}</td>
          <td style="padding: 10px 14px; font-size: 0.82rem; color: #475569;">${empDisplay}</td>
          <td style="padding: 10px 14px; text-align: center;">
            <button type="button" onclick="window.removeTeamMemberRow(${idx})" style="background: #fef2f2; color: #ef4444; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;" title="Remove">
              <i class="pi pi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    summary.innerHTML = `${summaryText.join(', ')} (Total ${totalPositions} Positions)`;
  };

  window.saveTeamForSelectedProject = function () {
    const sel = document.getElementById('cpTeamProjectSelect');
    const selectedProjectId = sel?.value;

    if (!selectedProjectId) {
      alert('Please select a project to save team.');
      return;
    }

    const project = Store.getProjects().find(p => p.id === selectedProjectId);
    if (!project) return;

    let sa = 0, ra = 0, fel = 0, inv = 0, total = 0;
    
    currentAssignedTeam.forEach(item => {
      total += item.positions;
      if (item.designation.includes('Senior')) sa += item.positions;
      else if (item.designation.includes('Associate')) ra += item.positions;
      else if (item.designation.includes('Fellow')) fel += item.positions;
      else inv += item.positions;
    });

    project.team = {
      advisor: sa, ra, fellow: fel, investigators: inv, totalMembers: total, assignedDetails: currentAssignedTeam
    };

    Store.updateProject(project);
    showToast(`Team of ${total} members saved for ${project.name}!`);
    window.switchProjectTab('list');
  };

  // ══════════════════════════════════════════════
  //  MODAL: ASSIGN TEAM MEMBERS / ADD ASSIGNEE (#assigneeModal)
  // ══════════════════════════════════════════════
  let modalCurrentAssignedTeam = [];

  window.openAssigneeModal = function (projectId = null) {
    const modal = document.getElementById('assigneeModal');
    if (!modal) return;

    const sel = document.getElementById('modalAssignProjectSelect');
    const projects = Store.getProjects();

    if (sel && projects.length > 0) {
      sel.innerHTML = projects.map(p => {
        const isSel = (projectId && p.id === projectId) ? 'selected' : '';
        return `<option value="${p.id}" ${isSel}>${p.code || p.id} - ${p.name}</option>`;
      }).join('');

      const targetId = projectId || (sel.value || projects[0].id);
      sel.value = targetId;
      window.handleModalAssignProjectChange(targetId);
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeAssigneeModal = function () {
    const modal = document.getElementById('assigneeModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    const menu = document.getElementById('modalEmployeeCheckboxMenu');
    if (menu) menu.style.display = 'none';
  };

  window.handleModalAssignProjectChange = function (selectedId) {
    const project = Store.getProjects().find(p => p.id === selectedId);
    if (!project) return;

    // Reset inputs
    const desigSel = document.getElementById('modalTeamDesignationSelect');
    const posInput = document.getElementById('modalTeamPositionCount');
    if (desigSel) desigSel.value = '';
    if (posInput) posInput.value = '1';
    window.updateModalEmployeeList();

    if (project.team && Array.isArray(project.team.assignedDetails) && project.team.assignedDetails.length > 0) {
      modalCurrentAssignedTeam = JSON.parse(JSON.stringify(project.team.assignedDetails));
    } else {
      const defaults = getProjectAssignees(project);
      if (defaults && defaults.length > 0) {
        const groups = {};
        defaults.forEach(d => {
          const role = d.role || 'Field Investigator';
          if (!groups[role]) groups[role] = [];
          groups[role].push(d.name);
        });
        modalCurrentAssignedTeam = Object.keys(groups).map(role => ({
          designation: role,
          positions: groups[role].length,
          employees: groups[role]
        }));
      } else {
        modalCurrentAssignedTeam = [];
      }
    }
    window.renderModalAssignedTeamTable();
  };

  window.toggleModalEmployeeMenu = function (e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('modalEmployeeCheckboxMenu');
    if (menu) {
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
  };

  window.updateModalEmployeeList = function () {
    const desig = document.getElementById('modalTeamDesignationSelect')?.value;
    const emptyMsg = document.getElementById('modalEmployeeMenuEmpty');
    const menuList = document.getElementById('modalEmployeeMenuList');
    const selectText = document.getElementById('modalSelectedEmployeesText');

    if (!desig) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (menuList) menuList.style.display = 'none';
      if (selectText) selectText.textContent = 'Select employees...';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (menuList) menuList.style.display = 'block';
    if (selectText) selectText.textContent = 'Select employees...';

    const employees = EMPLOYEE_DB[desig] || [
      'Anis', 'Kiran', 'Dr. Alok Verma', 'Prof. Gupta', 'Priya Verma', 'Rahul Sharma', 'Sunita Meena', 'Vikas Tiwari'
    ];
    if (menuList) {
      menuList.innerHTML = employees.map(emp => `
        <label style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; transition: background 0.1s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
          <input type="checkbox" value="${emp}" class="modal-emp-checkbox" onchange="window.handleModalEmployeeSelectionChange()" style="accent-color: #15803d; width: 16px; height: 16px;">
          <span style="font-size: 0.85rem; color: #334155; font-weight: 600;">${emp}</span>
        </label>
      `).join('');
    }
  };

  window.handleModalEmployeeSelectionChange = function () {
    const checkboxes = document.querySelectorAll('.modal-emp-checkbox:checked');
    const selected = Array.from(checkboxes).map(cb => cb.value);
    const selectText = document.getElementById('modalSelectedEmployeesText');
    const countInput = document.getElementById('modalTeamPositionCount');

    if (!selectText) return;
    if (selected.length === 0) {
      selectText.textContent = 'Select employees...';
    } else {
      selectText.textContent = selected.join(', ');
      if (countInput && parseInt(countInput.value) < selected.length) {
        countInput.value = selected.length;
      }
    }
  };

  window.addModalTeamMemberRow = function () {
    const desig = document.getElementById('modalTeamDesignationSelect')?.value;
    const count = parseInt(document.getElementById('modalTeamPositionCount')?.value) || 0;
    const checkboxes = document.querySelectorAll('.modal-emp-checkbox:checked');
    const selectedEmps = Array.from(checkboxes).map(cb => cb.value);

    if (!desig || count < 1) {
      alert('Please select a designation and enter at least 1 position.');
      return;
    }

    modalCurrentAssignedTeam.push({
      designation: desig,
      positions: Math.max(count, selectedEmps.length, 1),
      employees: selectedEmps
    });

    // Reset inputs
    const desigSel = document.getElementById('modalTeamDesignationSelect');
    const posInput = document.getElementById('modalTeamPositionCount');
    if (desigSel) desigSel.value = '';
    if (posInput) posInput.value = '1';
    window.updateModalEmployeeList();
    window.renderModalAssignedTeamTable();
  };

  window.removeModalTeamMemberRow = function (index) {
    modalCurrentAssignedTeam.splice(index, 1);
    window.renderModalAssignedTeamTable();
  };

  window.renderModalAssignedTeamTable = function () {
    const tbody = document.getElementById('modalAssignedTeamTbody');
    if (!tbody) return;

    if (!modalCurrentAssignedTeam || modalCurrentAssignedTeam.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 24px; color: #94a3b8; font-weight: 600;">No team members assigned yet. Use the form above to add members.</td></tr>';
      return;
    }

    tbody.innerHTML = modalCurrentAssignedTeam.map((item, idx) => {
      const empBadges = (item.employees && item.employees.length > 0)
        ? item.employees.map(emp => {
            const bg = getAvatarColor(emp);
            const ini = getInitials(emp);
            return `
              <span style="display: inline-flex; align-items: center; gap: 5px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 14px; padding: 2px 8px 2px 4px; font-size: 0.78rem; font-weight: 700; color: #1e293b; margin: 2px 4px 2px 0;">
                <span style="width: 20px; height: 20px; border-radius: 50%; background: ${bg}; color: #fff; font-size: 0.62rem; display: inline-flex; align-items: center; justify-content: center;">${ini}</span>
                ${emp}
              </span>
            `;
          }).join('')
        : '<span style="color: #94a3b8; font-style: italic; font-size: 0.8rem;">To be assigned later</span>';

      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 14px; font-weight: 700; color: #1e293b;">${item.designation}</td>
          <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #15803d;">${item.positions}</td>
          <td style="padding: 10px 14px;">${empBadges}</td>
          <td style="padding: 10px 14px; text-align: center;">
            <button type="button" onclick="window.removeModalTeamMemberRow(${idx})" style="background: #fef2f2; color: #ef4444; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'" title="Remove Row">
              <i class="pi pi-trash" style="font-size: 11px;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.saveModalTeamForSelectedProject = function () {
    const sel = document.getElementById('modalAssignProjectSelect');
    const selectedProjectId = sel?.value;

    if (!selectedProjectId) {
      alert('Please select a project.');
      return;
    }

    const project = Store.getProjects().find(p => p.id === selectedProjectId);
    if (!project) return;

    let sa = 0, ra = 0, fel = 0, inv = 0, total = 0;

    modalCurrentAssignedTeam.forEach(item => {
      total += item.positions;
      const desig = (item.designation || '').toLowerCase();
      if (desig.includes('senior') || desig.includes('advisor')) sa += item.positions;
      else if (desig.includes('associate') || desig.includes('ra')) ra += item.positions;
      else if (desig.includes('fellow')) fel += item.positions;
      else inv += item.positions;
    });

    project.team = {
      advisor: sa,
      ra: ra,
      fellow: fel,
      investigators: inv,
      totalMembers: total || 1,
      assignedDetails: modalCurrentAssignedTeam
    };

    Store.updateProject(project);

    // Seed the 5 default research milestones for this project (idempotent — skipped if already exist)
    const seeded = Store.createDefaultMilestones(project.id, project.name);
    const milestoneMsg = seeded.length > 0
      ? ` ${seeded.length} default milestones created.`
      : '';

    showToast(`Team assignees saved for "${project.name}"!${milestoneMsg}`);
    window.closeAssigneeModal();
    renderProjectsListTable();
  };

  // Close the modal employee dropdown when clicking outside
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('modalEmployeeCheckboxMenu');
    const trigger = document.getElementById('modalEmployeeDropdownTrigger');
    if (menu && trigger) {
      if (menu.style.display === 'block' && !menu.contains(e.target) && !trigger.contains(e.target)) {
        menu.style.display = 'none';
      }
    }
  });

  // ══════════════════════════════════════════════
  //  TAB 2: ADD BUDGET FLOW (SCREENSHOT 2 & 3)
  // ══════════════════════════════════════════════
  const BUDGET_CATEGORIES_MAP = {
    'HR': [
      'Fellow',
      'Research Associate',
      'Field investigator',
      'Consultant',
      'Subject matter expert'
    ],
    'Travel Allowances': [
      'Fellow Airfare',
      'Local travel'
    ],
    'Stay arrangement': [
      'Fellow',
      'Research Associate',
      'Field investigator',
      'Consultant',
      'Subject matter expert'
    ],
    'Others': [
      'Stakeholder consultation and workshop',
      'Printing & Publication',
      'Contingency'
    ]
  };

  let currentBudgetProject = null;
  let currentBudgetLineItems = [];
  let budgetSortDirection = {};

  function formatCurrencyRupees(val) {
    if (val === '-' || val === null || typeof val === 'undefined') return '-';
    if (typeof val === 'string' && val.includes('%')) return val;
    if (typeof val === 'string' && val.startsWith('₹')) return val;
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (num % 1 !== 0) {
      return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '₹ ' + Number(num).toLocaleString('en-IN');
  }

  function ensureOverheadAtEnd(items) {
    if (!items || items.length <= 1) return items;
    const ovhIndex = items.findIndex(it => it && it.category && it.category.toLowerCase().includes('overhead'));
    if (ovhIndex !== -1 && ovhIndex !== items.length - 1) {
      const [ovhItem] = items.splice(ovhIndex, 1);
      items.push(ovhItem);
    }
    return items;
  }

  function recalculateInstitutionalOverheads() {
    let directTotal = 0;
    currentBudgetLineItems.forEach(it => {
      if (!it.category.toLowerCase().includes('overhead')) {
        directTotal += (parseFloat(it.amount) || 0);
      }
    });

    let ovhItem = currentBudgetLineItems.find(it => it.category.toLowerCase().includes('overhead'));
    if (!ovhItem) {
      ovhItem = {
        id: 'bli-overheads',
        category: 'Institutional Overheads Cost',
        subcategory: 'Fixed Overheads (15%)',
        quantity: '-',
        duration: '-',
        unitType: 'Percentage (%)',
        costPerUnit: '15%',
        amount: directTotal > 0 ? Math.round(directTotal * 0.15) : 0,
        badgeText: '15% Fixed'
      };
      currentBudgetLineItems.push(ovhItem);
    } else {
      const pct = parseFloat(String(ovhItem.costPerUnit || '15%').replace('%', '')) || 15;
      ovhItem.amount = directTotal > 0 ? Math.round(directTotal * (pct / 100)) : 0;
    }

    // Institutional overhead must ALWAYS stay as the last item in the budget
    ensureOverheadAtEnd(currentBudgetLineItems);
  }

  function getNormalizedProjectBudgetItems(project) {
    if (!project) return [];
    let items = [];
    if (project.budgetItems && Array.isArray(project.budgetItems) && project.budgetItems.length > 0) {
      items = JSON.parse(JSON.stringify(project.budgetItems));
    } else if (project.budgetHeads && Array.isArray(project.budgetHeads) && project.budgetHeads.length > 0) {
      project.budgetHeads.forEach(bh => {
        let cleanCategory = (bh.name || '').replace(/\s*\([A-Z0-9-]+\)\s*$/gi, '').trim();
        if (cleanCategory.toLowerCase().includes('human resource') || cleanCategory === 'HR') cleanCategory = 'HR';
        else if (cleanCategory.toLowerCase().includes('travel')) cleanCategory = 'Travel Allowances';
        else if (cleanCategory.toLowerCase().includes('stay')) cleanCategory = 'Stay arrangement';
        else if (!cleanCategory.toLowerCase().includes('overhead')) cleanCategory = 'Others';

        if (bh.mode === 'detailed' && bh.subItems && bh.subItems.length > 0) {
          bh.subItems.forEach(si => {
            items.push({
              id: 'bli-' + Math.random().toString(36).substr(2, 9),
              category: cleanCategory,
              subcategory: si.particular || '-',
              quantity: si.units || '-',
              duration: si.period || '-',
              unitType: si.unitType || 'Month',
              costPerUnit: si.costPerUnit ? `₹ ${Number(si.costPerUnit).toLocaleString('en-IN')}` : '-',
              amount: si.total || (si.units * si.period * si.costPerUnit) || 0,
              badgeText: null
            });
          });
        } else if (bh.mode === 'lumpSum' && (bh.lumpSumAmount > 0 || (bh.subItems && bh.subItems.length === 0))) {
          items.push({
            id: 'bli-' + Math.random().toString(36).substr(2, 9),
            category: cleanCategory,
            subcategory: '-',
            quantity: '-',
            duration: '-',
            unitType: 'Lump Sum',
            costPerUnit: '-',
            amount: bh.lumpSumAmount || 0,
            badgeText: null
          });
        }
      });
    }

    // Ensure "Institutional Overheads Cost" is present by default for EVERY project!
    let directTotal = 0;
    items.forEach(it => {
      if (!it.category.toLowerCase().includes('overhead')) {
        directTotal += (parseFloat(it.amount) || 0);
      }
    });

    const pct = (project.budgetSummary && project.budgetSummary.overheadsPct) ? project.budgetSummary.overheadsPct : 15;
    const existingOvh = items.find(it => it.category.toLowerCase().includes('overhead'));

    if (!existingOvh) {
      const ovhAmount = (project.budgetSummary && project.budgetSummary.overheadsAmount && project.budgetSummary.overheadsAmount > 0)
        ? project.budgetSummary.overheadsAmount
        : (directTotal > 0 ? Math.round(directTotal * (pct / 100)) : 0);

      items.push({
        id: 'bli-overheads',
        category: 'Institutional Overheads Cost',
        subcategory: 'Fixed Overheads (15%)',
        quantity: '-',
        duration: '-',
        unitType: 'Percentage (%)',
        costPerUnit: `${pct}%`,
        amount: ovhAmount,
        badgeText: `${pct}% Fixed`
      });
    } else {
      existingOvh.category = 'Institutional Overheads Cost';
      existingOvh.subcategory = 'Fixed Overheads (15%)';
      existingOvh.unitType = 'Percentage (%)';
      existingOvh.costPerUnit = `${pct}%`;
      existingOvh.badgeText = `${pct}% Fixed`;
      if (existingOvh.amount === 0 && directTotal > 0) {
        existingOvh.amount = Math.round(directTotal * (pct / 100));
      }
    }

    // Institutional overhead must ALWAYS stay as the last item in the budget
    ensureOverheadAtEnd(items);
    return items;
  }

  function populateBudgetFlowProjectSelect(selectedId = null) {
    const sel = document.getElementById('cpBudgetProjectSelect');
    if (!sel) return;

    const projects = Store.getProjects();
    if (!projects || projects.length === 0) return;

    let optionsHtml = '';
    projects.forEach(p => {
      const isSel = (selectedId && selectedId === p.id) ? 'selected' : '';
      optionsHtml += `<option value="${p.id}" ${isSel}>${p.name}</option>`;
    });

    sel.innerHTML = optionsHtml;

    const activeId = selectedId || (projects[0] ? projects[0].id : null);
    if (activeId) {
      sel.value = activeId;
      window.handleBudgetProjectChange(activeId);
    }
  }

  window.handleBudgetProjectChange = function (selectedId) {
    const project = Store.getProjects().find(p => p.id === selectedId);
    if (!project) return;

    currentBudgetProject = project;

    // Update context pill
    const pill = document.getElementById('budgetProjectContextPill');
    if (pill) {
      pill.innerHTML = `
        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; border: 1px solid #bae6fd;">
          <i class="pi pi-calendar" style="font-size: 11px; margin-right: 4px;"></i>${project.financialYear || '2026–2027'}
        </span>
        <span style="background: #eff6ff; color: #1837d4; padding: 4px 10px; border-radius: 6px; border: 1.5px solid #bfdbfe;">
          <i class="pi pi-clock" style="font-size: 11px; margin-right: 4px;"></i>${project.durationMonths || 12} Months
        </span>
      `;
    }

    // Reset line items form
    window.resetBudgetLineItemForm();

    // Load line items (with Institutional Overheads Cost guaranteed by default)
    currentBudgetLineItems = getNormalizedProjectBudgetItems(project);
    renderBudgetLineItemsTable();
  };

  window.onBudgetCategoryChange = function (catName) {
    const subSel = document.getElementById('bLineSubcategory');
    if (!subSel) return;

    const subcats = BUDGET_CATEGORIES_MAP[catName] || [];
    if (subcats.length === 0) {
      subSel.innerHTML = '<option value="">— Select Sub Category —</option>';
    } else {
      subSel.innerHTML = '<option value="">— Select Sub Category —</option>' +
        subcats.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    const unitSel = document.getElementById('bLineUnitType');
    if (unitSel) {
      if (catName === 'HR') {
        unitSel.value = 'Month';
      } else if (catName === 'Stay arrangement') {
        unitSel.value = 'Night';
      } else if (catName === 'Travel Allowances') {
        unitSel.value = 'Person';
      } else if (catName === 'Others') {
        unitSel.value = 'Lump Sum';
      }
    }

    window.calcLineEstimatedAmount();
  };

  window.calcLineEstimatedAmount = function () {
    const qVal = parseFloat(document.getElementById('bLineQuantity')?.value);
    const dVal = parseFloat(document.getElementById('bLineDuration')?.value);
    const costRaw = (document.getElementById('bLineCostPerUnit')?.value || '').trim();
    const estInput = document.getElementById('bLineEstimatedAmount');
    if (!estInput) return;

    if (!costRaw) return;

    // Check if percentage
    if (costRaw.includes('%')) {
      const pct = parseFloat(costRaw.replace('%', ''));
      if (!isNaN(pct) && currentBudgetLineItems.length > 0) {
        let subtotal = 0;
        currentBudgetLineItems.forEach(i => {
          if (!i.category.toLowerCase().includes('overhead')) subtotal += (parseFloat(i.amount) || 0);
        });
        estInput.value = (subtotal * (pct / 100)).toFixed(2);
      }
      return;
    }

    const cleanCost = parseFloat(costRaw.replace(/[^\d.-]/g, ''));
    if (isNaN(cleanCost)) return;

    const q = isNaN(qVal) || qVal <= 0 ? 1 : qVal;
    
    // Auto calculate Quantity * Cost (or Quantity * Duration * Cost if duration is provided)
    let total = 0;
    if (!isNaN(dVal) && dVal > 0) {
      total = Math.round(q * dVal * cleanCost);
    } else {
      total = Math.round(q * cleanCost);
    }
    estInput.value = total;
  };

  window.resetBudgetLineItemForm = function () {
    const catSel = document.getElementById('bLineCategory');
    const subSel = document.getElementById('bLineSubcategory');
    const qInp = document.getElementById('bLineQuantity');
    const dInp = document.getElementById('bLineDuration');
    const uSel = document.getElementById('bLineUnitType');
    const cInp = document.getElementById('bLineCostPerUnit');
    const eInp = document.getElementById('bLineEstimatedAmount');

    if (catSel) catSel.value = '';
    if (subSel) subSel.innerHTML = '<option value="">Select Category first</option>';
    if (qInp) qInp.value = '';
    if (dInp) dInp.value = '';
    if (uSel) uSel.value = '';
    if (cInp) cInp.value = '';
    if (eInp) eInp.value = '';
  };

  window.addBudgetLineItem = function () {
    const catSel = document.getElementById('bLineCategory');
    const subSel = document.getElementById('bLineSubcategory');
    const qInp = document.getElementById('bLineQuantity');
    const dInp = document.getElementById('bLineDuration');
    const uSel = document.getElementById('bLineUnitType');
    const cInp = document.getElementById('bLineCostPerUnit');
    const eInp = document.getElementById('bLineEstimatedAmount');

    const category = catSel?.value?.trim();
    if (!category) {
      alert('Please select a Category.');
      catSel?.focus();
      return;
    }

    const subcategory = subSel?.value?.trim() || '-';
    const quantity = qInp?.value ? parseFloat(qInp.value) : '-';
    const duration = dInp?.value ? parseFloat(dInp.value) : '-';
    const unitType = uSel?.value?.trim() || '-';
    const costPerUnit = cInp?.value?.trim() || '-';
    const amountVal = parseFloat(eInp?.value);

    if (isNaN(amountVal) || amountVal < 0) {
      alert('Please enter a valid Estimated Amount (₹).');
      eInp?.focus();
      return;
    }

    let badgeText = null;
    if (category.toLowerCase().includes('overhead') || (typeof costPerUnit === 'string' && costPerUnit.includes('%'))) {
      badgeText = (typeof costPerUnit === 'string' && costPerUnit.includes('%')) ? `${costPerUnit} Fixed` : 'Fixed';
    }

    const newItem = {
      id: 'bli-' + Date.now(),
      category,
      subcategory,
      quantity,
      duration,
      unitType,
      costPerUnit,
      amount: amountVal,
      badgeText
    };

    // Institutional overhead should always stay as the last item in the budget:
    // Insert new item before overhead item if present
    const ovhIndex = currentBudgetLineItems.findIndex(it => it && it.category && it.category.toLowerCase().includes('overhead'));
    if (ovhIndex !== -1) {
      currentBudgetLineItems.splice(ovhIndex, 0, newItem);
    } else {
      currentBudgetLineItems.push(newItem);
    }

    recalculateInstitutionalOverheads();
    renderBudgetLineItemsTable();
    window.resetBudgetLineItemForm();
    showToast(`Added line item: ${category} (${formatCurrencyRupees(amountVal)})`);
  };

  window.removeBudgetLineItem = function (idx) {
    if (idx >= 0 && idx < currentBudgetLineItems.length) {
      const item = currentBudgetLineItems[idx];
      if (item.category.toLowerCase().includes('overhead')) {
        alert('"Institutional Overheads Cost" is standard and required by default for every project.');
        return;
      }
      currentBudgetLineItems.splice(idx, 1);
      recalculateInstitutionalOverheads();
      renderBudgetLineItemsTable();
    }
  };

  window.clearAllCurrentBudgetItems = function () {
    if (currentBudgetLineItems.length === 0) return;
    if (confirm('Are you sure you want to clear all budget line items?')) {
      currentBudgetLineItems = [
        {
          id: 'bli-overheads',
          category: 'Institutional Overheads Cost',
          subcategory: 'Fixed Overheads (15%)',
          quantity: '-',
          duration: '-',
          unitType: 'Percentage (%)',
          costPerUnit: '15%',
          amount: 0,
          badgeText: '15% Fixed'
        }
      ];
      renderBudgetLineItemsTable();
      showToast('Budget items cleared. Institutional Overheads Cost retained.');
    }
  };

  window.sortBudgetLineItems = function (columnKey) {
    budgetSortDirection[columnKey] = !budgetSortDirection[columnKey];
    const isAsc = budgetSortDirection[columnKey];

    // Separate regular items and overhead items so overhead ALWAYS stays as the last item
    const regularItems = currentBudgetLineItems.filter(it => !it.category.toLowerCase().includes('overhead'));
    const overheadItems = currentBudgetLineItems.filter(it => it.category.toLowerCase().includes('overhead'));

    regularItems.sort((a, b) => {
      let v1 = a[columnKey];
      let v2 = b[columnKey];

      if (v1 === '-' || v1 === null || typeof v1 === 'undefined') v1 = -999999999;
      if (v2 === '-' || v2 === null || typeof v2 === 'undefined') v2 = -999999999;

      const n1 = typeof v1 === 'number' ? v1 : parseFloat(String(v1).replace(/[^\d.-]/g, '')) || 0;
      const n2 = typeof v2 === 'number' ? v2 : parseFloat(String(v2).replace(/[^\d.-]/g, '')) || 0;

      return isAsc ? n1 - n2 : n2 - n1;
    });

    currentBudgetLineItems = [...regularItems, ...overheadItems];
    renderBudgetLineItemsTable();
  };

  function renderBudgetLineItemsTable() {
    const tbody = document.getElementById('bLineItemsTbody');
    const tfoot = document.getElementById('bLineItemsTfoot');
    const badge = document.getElementById('bLineItemsCountBadge');

    if (badge) {
      badge.textContent = `${currentBudgetLineItems.length} Line ${currentBudgetLineItems.length === 1 ? 'Item' : 'Items'}`;
    }

    if (!tbody) return;

    if (currentBudgetLineItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 28px 16px; color: #94a3b8; font-weight: 600;">
            No budget detail line items added yet. Use the form above to add items to this project.
          </td>
        </tr>
      `;
      if (tfoot) tfoot.innerHTML = '';
      return;
    }

    let totalAmount = 0;

    tbody.innerHTML = currentBudgetLineItems.map((item, idx) => {
      totalAmount += (parseFloat(item.amount) || 0);

      let categoryHtml = `<div style="font-weight: 700; color: #1e293b;">${item.category}</div>`;
      if (item.badgeText) {
        categoryHtml += `<span style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; font-size: 0.68rem; padding: 2px 7px; border-radius: 4px; font-weight: 700; margin-top: 3px; display: inline-block;">${item.badgeText}</span>`;
      }

      const costFormatted = typeof item.costPerUnit === 'string' && (item.costPerUnit.includes('%') || item.costPerUnit === '-')
        ? item.costPerUnit
        : formatCurrencyRupees(item.costPerUnit);

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; background: ${idx % 2 === 0 ? '#ffffff' : '#fafcff'}; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${idx % 2 === 0 ? '#ffffff' : '#fafcff'}'">
          <td style="padding: 12px 14px; text-align: center; font-weight: 700; color: #64748b;">${idx + 1}</td>
          <td style="padding: 12px 16px;">${categoryHtml}</td>
          <td style="padding: 12px 16px; color: #475569; font-weight: 600;">${item.subcategory || '-'}</td>
          <td style="padding: 12px 14px; color: #334155; font-weight: 600;">${item.quantity !== undefined ? item.quantity : '-'}</td>
          <td style="padding: 12px 14px; color: #334155; font-weight: 600;">${item.duration !== undefined ? item.duration : '-'}</td>
          <td style="padding: 12px 14px; color: #475569;">${item.unitType || '-'}</td>
          <td style="padding: 12px 16px; font-weight: 700; color: #1e293b;">${costFormatted}</td>
          <td style="padding: 12px 16px; font-weight: 800; color: #1e293b;">${formatCurrencyRupees(item.amount)}</td>
          <td style="padding: 12px 14px; text-align: center;">
            ${item.category.toLowerCase().includes('overhead')
              ? `<span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; color: #64748b; font-size: 13px; border: 1px solid #e2e8f0;" title="Default overhead cost (Required for every project)"><i class="pi pi-lock"></i></span>`
              : `<button type="button" onclick="window.removeBudgetLineItem(${idx})"
                  style="background: #ffffff; border: 1.5px solid #fee2e2; color: #ef4444; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s ease;"
                  onmouseover="this.style.background='#fee2e2'; this.style.borderColor='#fca5a5';"
                  onmouseout="this.style.background='#ffffff'; this.style.borderColor='#fee2e2';"
                  title="Delete line item">
                  <i class="pi pi-trash" style="font-size: 13px;"></i>
                </button>`}
          </td>
        </tr>
      `;
    }).join('');

    if (tfoot) {
      tfoot.innerHTML = `
        <tr style="border-top: 2px solid #cbd5e1; background: #f8fafc;">
          <td colspan="7" style="padding: 14px 16px; font-size: 0.85rem; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.03em;">
            Total Estimated Project Budget (${currentBudgetLineItems.length} Line Items)
          </td>
          <td style="padding: 14px 16px; font-size: 1.05rem; font-weight: 900; color: #15803d; white-space: nowrap;">
            ${formatCurrencyRupees(totalAmount)}
          </td>
          <td></td>
        </tr>
      `;
    }
  }

  window.saveBudgetForSelectedProject = function () {
    if (!currentBudgetProject) {
      alert('No project selected.');
      return;
    }

    ensureOverheadAtEnd(currentBudgetLineItems);

    let grandTotal = 0;
    currentBudgetLineItems.forEach(i => {
      grandTotal += (parseFloat(i.amount) || 0);
    });

    const budgetData = {
      items: currentBudgetLineItems,
      summary: {
        totalEstimatedCost: grandTotal,
        subTotal: grandTotal,
        overheadsPct: 15,
        overheadsAmount: 0,
        status: 'Submitted',
        lastSaved: new Date().toLocaleDateString('en-GB')
      },
      totalEstimatedCost: grandTotal
    };

    Store.updateProjectBudgetDetails(currentBudgetProject.id, budgetData);

    // Also update project's sanctioned budget in store
    const projects = Store.getProjects();
    const p = projects.find(x => x.id === currentBudgetProject.id);
    if (p) {
      p.budgetSanctioned = grandTotal;
      Store.updateProject(p);
    }

    showToast(`Budget of ${formatCurrencyRupees(grandTotal)} saved successfully for "${currentBudgetProject.name}"!`);
    window.switchProjectTab('list');
  };

  // ══════════════════════════════════════════════
  //  VIEW BUDGET POP-UP MODAL
  // ══════════════════════════════════════════════
  window.openViewBudgetModal = function (projectId) {
    const project = Store.getProjects().find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('viewBudgetModal');
    if (!modal) return;

    const titleEl = document.getElementById('viewBudgetModalProjectName');
    const metaEl = document.getElementById('viewBudgetModalProjectMeta');
    const kpiEl = document.getElementById('viewBudgetModalKpiRow');
    const tbody = document.getElementById('viewBudgetModalTbody');
    const tfoot = document.getElementById('viewBudgetModalTfoot');
    const editBtn = document.getElementById('viewBudgetModalEditBtn');

    if (titleEl) titleEl.textContent = `Project Budget: ${project.name}`;
    if (metaEl) metaEl.textContent = `Financial Year: ${project.financialYear || '2026–2027'} | Code: ${project.id || project.code}`;

    const items = getNormalizedProjectBudgetItems(project);
    let totalAmt = 0;
    items.forEach(i => { totalAmt += (parseFloat(i.amount) || 0); });

    if (kpiEl) {
      const budgetDisplayLakhs = (totalAmt / 100000).toFixed(2);
      kpiEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Budget:</span>
          <span style="font-size: 1.15rem; font-weight: 900; color: #15803d; background: #f0fdf4; border: 1.5px solid #bbf7d0; padding: 4px 12px; border-radius: 8px;">
            ${formatCurrencyRupees(totalAmt)} (${budgetDisplayLakhs} Lakhs)
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="font-size: 0.82rem; font-weight: 700; color: #334155; background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px;">
            <i class="pi pi-list" style="color: #1837d4; margin-right: 4px;"></i>${items.length} Line Items
          </span>
          <span style="font-size: 0.82rem; font-weight: 700; color: #334155; background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px;">
            <i class="pi pi-clock" style="color: #1837d4; margin-right: 4px;"></i>${project.durationMonths || 12} Months
          </span>
        </div>
      `;
    }

    if (tbody) {
      if (items.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8; font-weight: 600;">
              No budget items recorded for this project yet. Click "Modify Budget" to add items.
            </td>
          </tr>
        `;
        if (tfoot) tfoot.innerHTML = '';
      } else {
        tbody.innerHTML = items.map((item, idx) => {
          let categoryHtml = `<div style="font-weight: 700; color: #1e293b;">${item.category}</div>`;
          if (item.badgeText) {
            categoryHtml += `<span style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; font-size: 0.68rem; padding: 2px 7px; border-radius: 4px; font-weight: 700; margin-top: 3px; display: inline-block;">${item.badgeText}</span>`;
          }

          const costFormatted = typeof item.costPerUnit === 'string' && (item.costPerUnit.includes('%') || item.costPerUnit === '-')
            ? item.costPerUnit
            : formatCurrencyRupees(item.costPerUnit);

          return `
            <tr style="border-bottom: 1px solid #f1f5f9; background: ${idx % 2 === 0 ? '#ffffff' : '#fafcff'};">
              <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: #64748b;">${idx + 1}</td>
              <td style="padding: 10px 16px;">${categoryHtml}</td>
              <td style="padding: 10px 16px; color: #475569; font-weight: 600;">${item.subcategory || '-'}</td>
              <td style="padding: 10px 14px; color: #334155; font-weight: 600;">${item.quantity !== undefined ? item.quantity : '-'}</td>
              <td style="padding: 10px 14px; color: #334155; font-weight: 600;">${item.duration !== undefined ? item.duration : '-'}</td>
              <td style="padding: 10px 14px; color: #475569;">${item.unitType || '-'}</td>
              <td style="padding: 10px 16px; font-weight: 700; color: #1e293b;">${costFormatted}</td>
              <td style="padding: 10px 16px; font-weight: 800; color: #1e293b;">${formatCurrencyRupees(item.amount)}</td>
            </tr>
          `;
        }).join('');

        if (tfoot) {
          tfoot.innerHTML = `
            <tr style="border-top: 2px solid #cbd5e1; background: #f8fafc;">
              <td colspan="7" style="padding: 12px 16px; font-size: 0.85rem; font-weight: 800; color: #0f172a; text-transform: uppercase;">
                Total Estimated Cost
              </td>
              <td style="padding: 12px 16px; font-size: 1.05rem; font-weight: 900; color: #15803d; white-space: nowrap;">
                ${formatCurrencyRupees(totalAmt)}
              </td>
            </tr>
          `;
        }
      }
    }

    if (editBtn) {
      editBtn.onclick = function () {
        window.closeViewBudgetModal();
        window.openAddBudgetForProject(projectId);
      };
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeViewBudgetModal = function () {
    const modal = document.getElementById('viewBudgetModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // ══════════════════════════════════════════════
  //  EDIT PROJECT OPTIONS MODAL (Basic details, Budget, Assignee)
  // ══════════════════════════════════════════════
  let currentEditProjectId = null;

  window.openProjectEditOptionsModal = function (projectId) {
    currentEditProjectId = projectId;
    const project = Store.getProjects().find(p => p.id === projectId);
    const titleEl = document.getElementById('editOptionsModalProjectName');
    if (titleEl && project) {
      titleEl.textContent = `Edit: ${project.name}`;
    }

    const modal = document.getElementById('projectEditOptionsModal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeProjectEditOptionsModal = function () {
    const modal = document.getElementById('projectEditOptionsModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  window.handleEditOptionSelect = function (option) {
    const pId = currentEditProjectId;
    window.closeProjectEditOptionsModal();

    if (!pId) return;

    if (option === 'basic') {
      window.openCreateProjectModal(pId);
    } else if (option === 'budget') {
      window.switchProjectTab('budget', pId);
    } else if (option === 'assignee') {
      window.openAssigneeModal(pId);
    }
  };

  // Modal Backdrop & Escape Key Listeners
  const modalEl = document.getElementById('createProjectModal');
  if (modalEl) {
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) {
        window.closeCreateProjectModal();
      }
    });
  }

  const vbModalEl = document.getElementById('viewBudgetModal');
  if (vbModalEl) {
    vbModalEl.addEventListener('click', function (e) {
      if (e.target === vbModalEl) {
        window.closeViewBudgetModal();
      }
    });
  }

  const peoModalEl = document.getElementById('projectEditOptionsModal');
  if (peoModalEl) {
    peoModalEl.addEventListener('click', function (e) {
      if (e.target === peoModalEl) {
        window.closeProjectEditOptionsModal();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeCreateProjectModal();
      window.closeViewBudgetModal();
      window.closeTeamDetailsModal();
      window.closeAssigneeModal();
      window.closeProjectEditOptionsModal();
    }
  });

  const assigneeModalEl = document.getElementById('assigneeModal');
  if (assigneeModalEl) {
    assigneeModalEl.addEventListener('click', function (e) {
      if (e.target === assigneeModalEl) {
        window.closeAssigneeModal();
      }
    });
  }

  // Initial load execution
  if (typeof initBudgetDeskControls === 'function') {
    initBudgetDeskControls();
  }
  window.switchProjectTab('list');
});
