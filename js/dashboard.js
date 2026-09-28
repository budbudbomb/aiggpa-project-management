/**
 * AIGGPA Project Management Controller
 * Handles Project Management, Metrics, and Project Creation Wizard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile sidebar toggle
  const sidebar = document.getElementById('mainSidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // Top User Dropdown Toggle
  const userDropBtn = document.getElementById('topUserDropdownBtn');
  const userDropMenu = document.getElementById('topUserDropdownMenu');
  if (userDropBtn && userDropMenu) {
    userDropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = userDropMenu.style.display === 'block';
      userDropMenu.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      userDropMenu.style.display = 'none';
    });
  }

  // Generic modal handlers
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-open-modal');
      if (modalId === 'modalBudgetDesk') populateBudgetProjectSelect();
      openModal(modalId);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      closeModal(modal);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target);
    }
  });

  // Update counts
  function updateCounts() {
    const qb = Store.getQuestionBank();
    const tasks = Store.getTasks();
    const surveys = Store.getSurveys();
    const meetings = Store.getMeetings();

    const qbCount = qb.length;
    const taskCount = tasks.filter(t => t.status === 'Active').length +
      surveys.filter(s => s.status === 'Active').length +
      meetings.filter(m => m.status === 'Scheduled').length;

    const sbQB = document.getElementById('sidebarQBCountBadge');
    if (sbQB) sbQB.textContent = qbCount;

    const topQB = document.getElementById('topbarQBCount');
    if (topQB) topQB.textContent = qbCount;

    const sbTask = document.getElementById('sidebarTaskCountBadge');
    if (sbTask) sbTask.textContent = taskCount;
  }

  // Render KPI Metrics
  function renderMetrics() {
    const projects = Store.getProjects();
    const activeCount = projects.filter(p => p.status === 'Active').length;
    let totalSanctioned = 0;
    let totalUtilized = 0;
    let totalInvestigators = 0;

    projects.forEach(p => {
      totalSanctioned += p.budgetSanctioned || 0;
      totalUtilized += p.budgetUtilized || 0;
      if (p.team && p.team.investigators) {
        totalInvestigators += parseInt(p.team.investigators) || 0;
      }
    });

    const kpiActive = document.getElementById('kpiActiveProjects');
    const kpiSanctioned = document.getElementById('kpiTotalBudget');
    const kpiUtilized = document.getElementById('kpiUtilizedBudget');
    const kpiInv = document.getElementById('kpiTotalInvestigators');

    if (kpiActive) kpiActive.textContent = activeCount;
    if (kpiSanctioned) kpiSanctioned.textContent = `₹${(totalSanctioned / 100000).toFixed(1)} L`;
    if (kpiUtilized) kpiUtilized.textContent = `₹${(totalUtilized / 100000).toFixed(1)} L`;
    if (kpiInv) kpiInv.textContent = totalInvestigators;
  }

  // Projects Table Renderer
  function renderProjectsTable() {
    updateCounts();
    renderMetrics();

    const projects = Store.getProjects();
    const tbody = document.getElementById('projectsTableTbody');
    const filter = (document.getElementById('projectsTableSearchInput')?.value || '').toLowerCase().trim();

    if (!tbody) return;

    if (projects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding: 30px; text-align: center; color: #94a3b8;">No projects found. Click "Create Project" to add one.</td></tr>`;
      return;
    }

    const filtered = projects.filter(p => {
      if (!filter) return true;
      return p.name.toLowerCase().includes(filter) ||
        p.code.toLowerCase().includes(filter) ||
        p.nature.toLowerCase().includes(filter);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #94a3b8;">No matching projects found for "${filter}".</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const budgetFmt = p.budgetSanctioned ? `₹${(p.budgetSanctioned / 100000).toFixed(1)} Lakhs` : 'Pending Approval';
      const team = p.team || { advisor: 1, ra: 1, fellow: 1, investigators: 4 };

      return `
        <tr class="act-row-clickable" style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 14px 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
              <span class="qb-code-badge" style="background:#eff4fe; color:#1837d4;">${p.code || p.id}</span>
              <span style="font-weight: 700; color: #1e293b;">${p.name}</span>
            </div>
            <div style="font-size: 0.78rem; color: #64748b;">${p.scheme || p.nature}</div>
          </td>
          <td style="padding: 14px 16px; font-size: 0.82rem; color: #334155;">
            <div>${Store.formatDate(p.startDate)} ➔ ${Store.formatDate(p.endDate)}</div>
            <div style="font-size: 0.74rem; color: #1837d4; font-weight: 700;">${p.durationMonths} Months Duration</div>
          </td>
          <td style="padding: 14px 16px; font-size: 0.8rem; color: #475569;">
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <span style="background: #f1f5f9; padding: 2px 7px; border-radius: 4px;">SA: ${team.advisor || 1}</span>
              <span style="background: #f1f5f9; padding: 2px 7px; border-radius: 4px;">RA: ${team.ra || 1}</span>
              <span style="background: #f1f5f9; padding: 2px 7px; border-radius: 4px;">Fellow: ${team.fellow || 0}</span>
              <span style="background: #eff6ff; color:#1e40af; font-weight:700; padding: 2px 7px; border-radius: 4px;">Inv: ${team.investigators || 4}</span>
            </div>
          </td>
          <td style="padding: 14px 16px; font-weight: 700; color: #15803d; font-size: 0.88rem;">
            <span style="cursor: pointer; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 8px;" onclick="window.openBudgetForProject('${p.id}')" title="Click to view/edit budget">
              ${budgetFmt}
            </span>
          </td>
          <td style="padding: 14px 16px;">
            <span class="badge ${p.status === 'Active' ? 'badge-active' : 'badge-completed'}">
              ${p.status}
            </span>
          </td>
          <td style="padding: 14px 16px; text-align: center;">
            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 700; color: #1837d4; background: #eff4fe; border: 1px solid #bfdbfe; border-radius: 8px;" onclick="window.openBudgetForProject('${p.id}')" title="Configure Budget Estimate">
              <i class="pi pi-wallet" style="font-size: 11px;"></i>
              <span>Budget</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.openBudgetForProject = function (pId) {
    window.location.href = 'budget.html?project=' + encodeURIComponent(pId);
  };

  document.getElementById('projectsTableSearchInput')?.addEventListener('input', renderProjectsTable);
  document.getElementById('globalSearchInput')?.addEventListener('input', (e) => {
    const pInput = document.getElementById('projectsTableSearchInput');
    if (pInput) {
      pInput.value = e.target.value;
      renderProjectsTable();
    }
  });

  // Initial render
  renderProjectsTable();
});

