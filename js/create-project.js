/**
 * AIGGPA ERP - Complete Project Management Module Controller
 * Implementation Plan:
 * 1. Project List Page (/project-management/project)
 * 2. Create Project Page (/project-management/project/create) - Screenshot 1
 * 3. Edit Project Page (/project-management/project/edit/:id) - Screenshot 5
 * 4. Add Budget Layout (/project-management/project/add-budget) - Screenshot 3
 * 5. Add Budget Modal (/project-management/project/add-budget/create) - Screenshot 2 & 4
 */

document.addEventListener('DOMContentLoaded', () => {
  // Views
  const viewCreate = document.getElementById('viewCreateProject');
  const viewBudget = document.getElementById('viewAddBudget');
  const viewList = document.getElementById('viewProjectsList');
  const pageTitle = document.getElementById('erpPageTitle');
  const pageSubtitle = document.getElementById('erpPageSubtitle');
  const btnTopViewList = document.getElementById('btnTopViewList');

  // Sidebar Links
  const navCreateProject = document.getElementById('navLinkCreateProject');
  const navAddBudget = document.getElementById('navLinkAddBudget');

  // Form Elements (Create / Edit Project)
  const formProject = document.getElementById('erpProjectForm');
  const inputProjectId = document.getElementById('cpProjectId');
  const inputProjectName = document.getElementById('cpProjectName');
  const inputLocalName = document.getElementById('cpLocalName');
  const selectDepartment = document.getElementById('cpDepartment');
  const selectScheme = document.getElementById('cpScheme');
  const selectFinancialYear = document.getElementById('cpFinancialYear');
  const selectFundingPattern = document.getElementById('cpFundingPattern');
  const inputFromDate = document.getElementById('cpFromDate');
  const inputToDate = document.getElementById('cpToDate');
  const inputDuration = document.getElementById('cpDuration');
  const inputDateOfPrc = document.getElementById('cpDateOfPrc');

  // Budget Elements
  const selectBudgetProject = document.getElementById('budgetProjectSelect');
  const inputBudgetSearch = document.getElementById('budgetSearchInput');
  const btnExpandAll = document.getElementById('btnExpandAll');
  const btnOpenAddBudgetModal = document.getElementById('btnOpenAddBudgetModal');
  const modalAddBudget = document.getElementById('modalAddBudget');
  const btnCloseBudgetModal = document.getElementById('btnCloseBudgetModal');
  const btnSubmitBudget = document.getElementById('btnSubmitBudget');

  // Budget Modal Form Fields
  const modalCategory = document.getElementById('modalBudgetCategory');
  const modalSubCategory = document.getElementById('modalBudgetSubCategory');
  const modalUnitType = document.getElementById('modalBudgetUnitType');
  const modalQuantity = document.getElementById('modalBudgetQuantity');
  const modalDuration = document.getElementById('modalBudgetDuration');
  const modalRate = document.getElementById('modalBudgetRate');
  const modalTotal = document.getElementById('modalBudgetTotal');
  const modalFormulaPreview = document.getElementById('modalFormulaPreview');

  // Budget Summary Elements
  const txtSubTotal = document.getElementById('txtBudgetSubTotal');
  const txtSubTotalPct = document.getElementById('txtBudgetSubTotalPct');
  const txtOverhead = document.getElementById('txtBudgetOverhead');
  const txtOverheadPct = document.getElementById('txtBudgetOverheadPct');
  const txtTotalBudget = document.getElementById('txtBudgetTotal');
  const txtTotalBudgetPct = document.getElementById('txtBudgetTotalPct');
  const budgetTableBody = document.getElementById('budgetTableBody');

  // State
  let currentMode = 'create'; // 'create' | 'edit' | 'budget' | 'list'
  let currentEditingId = null;
  let activeProjectId = 'ABC';
  let allCategoriesExpanded = true;
  const collapsedCategories = new Set();

  // Category Configuration (Codes: DTL = Detail, LMP = Lump Sum, FXD = Fixed)
  const CATEGORY_CONFIG = {
    'Human resources': {
      code: 'HR',
      type: 'DTL',
      subCategories: [
        'Research Associate',
        'Fellow',
        'Senior Advisor',
        'Lead Policy Fellow',
        'Field Investigator',
        'Data Analyst'
      ],
      defaultUnit: 'Months'
    },
    'Printing & Publications': {
      code: 'P&P',
      type: 'LMP',
      badge: 'Lump Sum',
      subCategories: [
        'Lump Sum Direct Allocation',
        'Report Printing & Publication',
        'Dissemination Materials'
      ],
      defaultUnit: 'Lump Sum'
    },
    'Contingency': {
      code: 'CTG',
      type: 'LMP',
      badge: 'Lump Sum',
      subCategories: [
        'Contingency Allocation',
        'Emergency Survey Contingency'
      ],
      defaultUnit: 'Lump Sum'
    },
    'Institutional overheads cost': {
      code: 'IOC',
      type: 'FXD',
      badge: 'Fixed % Overhead',
      subNote: '(40% overhead)',
      subCategories: [
        'Institutional Overhead Charge'
      ],
      defaultUnit: '% Overhead'
    }
  };

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  function formatINR(val) {
    const num = parseFloat(val) || 0;
    return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function showToast(msg) {
    let toast = document.querySelector('.erp-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'erp-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="pi pi-check-circle" style="color: #4ade80; font-size: 1.15rem;"></i><span>${msg}</span>`;
    toast.style.display = 'flex';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3200);
  }

  // Duration auto-calculation: (ToDate - FromDate) / 30.4375
  function calculateDuration(fromStr, toStr) {
    if (!fromStr || !toStr) return 0;
    const d1 = new Date(fromStr);
    const d2 = new Date(toStr);
    if (isNaN(d1) || isNaN(d2)) return 0;
    const diffTime = d2.getTime() - d1.getTime();
    if (diffTime < 0) return 0;
    const days = diffTime / (1000 * 60 * 60 * 24);
    const months = Math.round(days / 30.4375);
    return Math.max(0, months);
  }

  // Update date inputs change handler
  if (inputFromDate && inputToDate && inputDuration) {
    const onDatesChange = () => {
      const dur = calculateDuration(inputFromDate.value, inputToDate.value);
      inputDuration.value = dur;
    };
    inputFromDate.addEventListener('change', onDatesChange);
    inputToDate.addEventListener('change', onDatesChange);
  }

  // -------------------------------------------------------------
  // View Router (List, Create, Edit, AddBudget)
  // -------------------------------------------------------------
  window.switchView = function (mode, projectId = null) {
    currentMode = mode;
    currentEditingId = projectId;

    if (viewCreate) viewCreate.style.display = 'none';
    if (viewBudget) viewBudget.style.display = 'none';
    if (viewList) viewList.style.display = 'none';

    if (navCreateProject) navCreateProject.classList.remove('active');
    if (navAddBudget) navAddBudget.classList.remove('active');

    // Update URL state smoothly without reload
    const url = new URL(window.location);

    if (mode === 'create') {
      if (viewCreate) viewCreate.style.display = 'block';
      if (navCreateProject) navCreateProject.classList.add('active');
      if (pageTitle) pageTitle.textContent = 'Create Project';
      if (pageSubtitle) pageSubtitle.textContent = 'Enter project details to create a new project proposal';
      if (btnTopViewList) {
        btnTopViewList.style.display = 'inline-flex';
        btnTopViewList.innerHTML = `<i class="pi pi-bars"></i><span>View List</span>`;
      }
      resetFormToCreate();
      url.searchParams.set('view', 'create');
      url.searchParams.delete('id');
      url.searchParams.delete('projectId');
    } else if (mode === 'edit') {
      if (viewCreate) viewCreate.style.display = 'block';
      if (navCreateProject) navCreateProject.classList.add('active');
      if (pageTitle) pageTitle.textContent = 'Edit Project';
      if (pageSubtitle) pageSubtitle.textContent = 'Modify project details';
      if (btnTopViewList) {
        btnTopViewList.style.display = 'inline-flex';
        btnTopViewList.innerHTML = `<i class="pi pi-bars"></i><span>View List</span>`;
      }
      loadProjectForEdit(projectId || 'ABC');
      url.searchParams.set('view', 'edit');
      url.searchParams.set('id', projectId || 'ABC');
    } else if (mode === 'budget') {
      if (viewBudget) viewBudget.style.display = 'block';
      if (navAddBudget) navAddBudget.classList.add('active');
      if (pageTitle) pageTitle.textContent = 'Add Budget';
      if (pageSubtitle) pageSubtitle.textContent = 'Allocate project budgets from this page.';
      if (btnTopViewList) {
        btnTopViewList.style.display = 'inline-flex';
        btnTopViewList.innerHTML = `<i class="pi pi-bars"></i><span>View List</span>`;
      }
      if (projectId) activeProjectId = projectId;
      populateBudgetProjectsDropdown();
      renderBudgetTable();
      url.searchParams.set('view', 'budget');
      url.searchParams.set('projectId', activeProjectId);
    } else if (mode === 'list') {
      if (viewList) viewList.style.display = 'block';
      if (navCreateProject) navCreateProject.classList.add('active');
      if (pageTitle) pageTitle.textContent = 'Projects Master List';
      if (pageSubtitle) pageSubtitle.textContent = 'Comprehensive repository of sanctioned and proposed projects';
      if (btnTopViewList) {
        btnTopViewList.style.display = 'none';
      }
      renderProjectsListTable();
      url.searchParams.set('view', 'list');
      url.searchParams.delete('id');
    }

    window.history.replaceState({}, '', url);
  };

  // -------------------------------------------------------------
  // Form Populate & Handlers
  // -------------------------------------------------------------
  function resetFormToCreate() {
    if (inputProjectId) inputProjectId.value = '';
    if (inputProjectName) inputProjectName.value = '';
    if (inputLocalName) inputLocalName.value = '';
    if (selectDepartment) selectDepartment.value = '';
    if (selectScheme) selectScheme.value = '';
    if (selectFinancialYear) selectFinancialYear.value = '';
    if (selectFundingPattern) selectFundingPattern.value = '';
    
    // Screenshot 1 defaults: 10/06/2026
    const defDate = '2026-10-06';
    if (inputFromDate) inputFromDate.value = defDate;
    if (inputToDate) inputToDate.value = defDate;
    if (inputDateOfPrc) inputDateOfPrc.value = defDate;
    if (inputDuration) inputDuration.value = '0';
  }

  function loadProjectForEdit(id) {
    const projects = Store.getProjects();
    const p = projects.find(x => x.id === id || x.code === id) || projects[0];
    if (!p) return;

    if (inputProjectId) inputProjectId.value = p.id;
    if (inputProjectName) inputProjectName.value = p.name || '';
    if (inputLocalName) inputLocalName.value = p.localName || p.name?.toLowerCase() || '';
    if (selectDepartment) selectDepartment.value = p.department || 'Center 11';
    if (selectScheme) selectScheme.value = p.scheme || 'Atal Bihari Vajpayee Institute of GG';
    if (selectFinancialYear) selectFinancialYear.value = p.financialYear || '2018-2019';
    if (selectFundingPattern) selectFundingPattern.value = p.fundingPattern || 'Internal';

    function normalizeDate(d) {
      if (!d) return '2026-09-28';
      if (d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      return d;
    }

    if (inputFromDate) inputFromDate.value = normalizeDate(p.fromDate || '2026-09-28');
    if (inputToDate) inputToDate.value = normalizeDate(p.toDate || '2026-09-28');
    if (inputDateOfPrc) inputDateOfPrc.value = normalizeDate(p.prcDate || '2026-09-28');
    if (inputDuration) inputDuration.value = p.durationMonths !== undefined ? p.durationMonths : 0;
  }

  // Submit Project Form (Create / Edit)
  if (formProject) {
    formProject.addEventListener('submit', (e) => {
      e.preventDefault();
      const pName = inputProjectName ? inputProjectName.value.trim() : '';
      if (!pName) {
        alert('Please enter a Project Name');
        inputProjectName?.focus();
        return;
      }

      const pId = inputProjectId && inputProjectId.value ? inputProjectId.value : ('PRJ-' + Date.now().toString().slice(-4));
      const projects = Store.getProjects();
      const existing = projects.find(x => x.id === pId);

      const projectData = {
        id: pId,
        code: pId,
        name: pName,
        localName: inputLocalName ? inputLocalName.value.trim() : '',
        department: selectDepartment ? selectDepartment.value : 'Center 11',
        scheme: selectScheme ? selectScheme.value : 'Atal Bihari Vajpayee Institute of GG',
        financialYear: selectFinancialYear ? selectFinancialYear.value : '2026-2027',
        fundingPattern: selectFundingPattern ? selectFundingPattern.value : 'Internal',
        fromDate: inputFromDate ? inputFromDate.value : '2026-10-06',
        toDate: inputToDate ? inputToDate.value : '2026-10-06',
        durationMonths: parseInt(inputDuration ? inputDuration.value : 0, 10) || 0,
        prcDate: inputDateOfPrc ? inputDateOfPrc.value : '2026-10-06',
        budgetSanctioned: existing?.budgetSanctioned || 0,
        budgetUtilized: existing?.budgetUtilized || 0,
        status: 'Submitted', // Business Rule 5: isSubmitted = true
        isSubmitted: true,
        budgetHeads: existing?.budgetHeads || [],
        budgetSummary: existing?.budgetSummary || {}
      };

      if (existing) {
        Store.updateProject(projectData);
        showToast(`Project "${pName}" successfully updated!`);
      } else {
        Store.addProject(projectData);
        showToast(`Project "${pName}" proposal created!`);
      }

      setTimeout(() => {
        window.switchView('list');
      }, 700);
    });
  }

  // Top View List Button
  if (btnTopViewList) {
    btnTopViewList.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentMode === 'list') {
        window.switchView('create');
      } else {
        window.switchView('list');
      }
    });
  }

  // -------------------------------------------------------------
  // BUDGET DESK FUNCTIONALITY (Screenshot 3)
  // -------------------------------------------------------------
  function populateBudgetProjectsDropdown() {
    if (!selectBudgetProject) return;
    const projects = Store.getProjects();
    selectBudgetProject.innerHTML = '';
    projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.code || p.id})`;
      if (p.id === activeProjectId) opt.selected = true;
      selectBudgetProject.appendChild(opt);
    });
  }

  if (selectBudgetProject) {
    selectBudgetProject.addEventListener('change', (e) => {
      activeProjectId = e.target.value;
      const url = new URL(window.location);
      url.searchParams.set('projectId', activeProjectId);
      window.history.replaceState({}, '', url);
      renderBudgetTable();
    });
  }

  function getActiveProject() {
    const projects = Store.getProjects();
    return projects.find(x => x.id === activeProjectId) || projects[0];
  }

  function renderBudgetTable() {
    if (!budgetTableBody) return;
    const p = getActiveProject();
    if (!p) return;

    const filterText = inputBudgetSearch ? inputBudgetSearch.value.trim().toLowerCase() : '';
    const heads = p.budgetHeads || [];

    // Calculate direct line item subtotal
    let subTotal = 0;
    heads.forEach(h => {
      if (h.mode !== 'overhead') {
        const itemSum = (h.subItems || []).reduce((acc, s) => acc + (parseFloat(s.total) || 0), 0);
        const actualHeadTotal = (typeof h.headTotal === 'number' && h.headTotal > 0) ? h.headTotal : itemSum;
        h.headTotal = actualHeadTotal;
        subTotal += actualHeadTotal;
      }
    });

    // 40% Fixed Overhead (Business Rule 3)
    const overheadPct = 40;
    const overheadAmount = Math.round(subTotal * (overheadPct / 100) * 100) / 100;
    const totalBudget = subTotal + overheadAmount;

    // Update Summary Footer Cards
    if (txtSubTotal) txtSubTotal.textContent = formatINR(subTotal);
    if (txtSubTotalPct) txtSubTotalPct.textContent = totalBudget > 0 ? `(${((subTotal / totalBudget) * 100).toFixed(2)}%)` : '(0%)';

    if (txtOverhead) txtOverhead.textContent = formatINR(overheadAmount);
    if (txtOverheadPct) txtOverheadPct.textContent = totalBudget > 0 ? `(${((overheadAmount / totalBudget) * 100).toFixed(2)}%)` : '(0%)';

    if (txtTotalBudget) txtTotalBudget.textContent = formatINR(totalBudget);
    if (txtTotalBudgetPct) txtTotalBudgetPct.textContent = '(100%)';

    updateExpandAllButtonText(heads);
    budgetTableBody.innerHTML = '';

    heads.forEach((head) => {
      const matchesHead = head.name.toLowerCase().includes(filterText);
      const matchingSubItems = (head.subItems || []).filter(sub => 
        sub.particular.toLowerCase().includes(filterText)
      );

      if (filterText && !matchesHead && matchingSubItems.length === 0) {
        return;
      }

      // Category color class
      let catClass = 'cat-hr';
      if (head.code === 'P&P' || head.name.includes('Printing')) catClass = 'cat-printing';
      else if (head.code === 'CTG' || head.name.includes('Contingency')) catClass = 'cat-contingency';
      else if (head.code === 'IOC' || head.mode === 'overhead' || head.name.includes('overhead')) catClass = 'cat-overhead';

      const headKey = head.id || head.name;
      const isCollapsed = collapsedCategories.has(headKey);
      const chevronIcon = isCollapsed ? 'pi-chevron-right' : 'pi-chevron-down';
      const actionText = isCollapsed ? 'Show <i class="pi pi-chevron-down"></i>' : 'Hide <i class="pi pi-chevron-up"></i>';

      let badgesHtml = '';
      if (head.code) badgesHtml += `<span class="cat-tag">${head.code}</span>`;
      if (head.badge) badgesHtml += `<span class="cat-tag">${head.badge}</span>`;
      if (head.subNote) badgesHtml += `<span class="cat-tag">${head.subNote}</span>`;

      const subItemsCount = head.subItems ? head.subItems.length : 0;
      const countText = subItemsCount === 1 ? '(1 sub-item)' : `(${subItemsCount} sub-items)`;

      // Category Header Row
      const catRow = document.createElement('tr');
      catRow.className = `category-header-row ${catClass}`;
      catRow.style.cursor = 'pointer';
      catRow.innerHTML = `
        <td colspan="5">
          <div class="category-title-box">
            <i class="pi ${chevronIcon} cat-chevron"></i>
            <span>${head.name}</span>
            ${badgesHtml}
            <span class="cat-subcount">${countText}</span>
          </div>
        </td>
        <td style="text-align: right;">
          <span class="cat-total-pill">${formatINR(head.mode === 'overhead' ? overheadAmount : head.headTotal)}</span>
        </td>
        <td style="text-align: center;">
          <button type="button" class="cat-action-toggle">
            ${actionText}
          </button>
        </td>
      `;

      budgetTableBody.appendChild(catRow);

      catRow.addEventListener('click', (e) => {
        if (collapsedCategories.has(headKey)) {
          collapsedCategories.delete(headKey);
        } else {
          collapsedCategories.add(headKey);
        }
        renderBudgetTable();
      });

      // Sub Items Rows
      if (!isCollapsed && head.subItems && head.subItems.length > 0) {
        head.subItems.forEach((sub) => {
          if (filterText && !matchesHead && !sub.particular.toLowerCase().includes(filterText)) {
            return;
          }

          const subRow = document.createElement('tr');
          subRow.className = 'subitem-row';

          let unitBadge = sub.unitType;
          if (sub.unitType === 'Months') {
            unitBadge = `<span class="badge-unit-months">Months</span>`;
          } else if (sub.unitType === '% Overhead') {
            unitBadge = `<span class="badge-unit-overhead">% Overhead</span>`;
          }

          let rateText = sub.costPerUnit !== '-' ? formatINR(sub.costPerUnit) : '-';
          if (typeof sub.costPerUnit === 'string' && sub.costPerUnit.includes('%')) {
            rateText = sub.costPerUnit;
          }

          let totalText = formatINR(sub.total);
          if (head.mode === 'overhead') {
            totalText = formatINR(overheadAmount);
          }

          let actionHtml = `<button type="button" class="btn-delete-row" title="Delete Line Item" data-head-id="${head.id}" data-sub-id="${sub.id}"><i class="pi pi-trash"></i></button>`;
          if (head.mode === 'overhead') {
            actionHtml = `-`;
          }

          subRow.innerHTML = `
            <td>
              <div class="subitem-title-box">
                <div class="main-name">${sub.particular}</div>
                ${sub.subtext ? `<div class="sub-note">${sub.subtext}</div>` : ''}
              </div>
            </td>
            <td style="text-align: center;">${sub.units}</td>
            <td style="text-align: center;">${sub.period}</td>
            <td style="text-align: center;">${unitBadge}</td>
            <td style="text-align: right;">${rateText}</td>
            <td style="text-align: right; font-weight: 700;">${totalText}</td>
            <td style="text-align: center;">${actionHtml}</td>
          `;

          budgetTableBody.appendChild(subRow);
        });
      }
    });

    // Soft delete action (Business Rule 4)
    budgetTableBody.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const headId = btn.dataset.headId;
        const subId = btn.dataset.subId;
        deleteBudgetSubItem(headId, subId);
      });
    });
  }

  function deleteBudgetSubItem(headId, subId) {
    const p = getActiveProject();
    if (!p) return;

    const head = (p.budgetHeads || []).find(h => h.id === headId);
    if (!head || !head.subItems) return;

    head.subItems = head.subItems.filter(s => s.id !== subId);
    head.headTotal = head.subItems.reduce((acc, s) => acc + (parseFloat(s.total) || 0), 0);

    Store.updateProject(p);
    showToast('Budget line item removed.');
    renderBudgetTable();
  }

  if (inputBudgetSearch) {
    inputBudgetSearch.addEventListener('input', () => {
      renderBudgetTable();
    });
  }

  function updateExpandAllButtonText(heads) {
    if (!btnExpandAll) return;
    const total = heads ? heads.length : 4;
    const isAllCollapsed = total > 0 && collapsedCategories.size >= total;
    btnExpandAll.innerHTML = isAllCollapsed
      ? `<i class="pi pi-arrows-alt"></i><span>Expand All</span>`
      : `<i class="pi pi-arrows-alt"></i><span>Collapse All</span>`;
  }

  if (btnExpandAll) {
    btnExpandAll.addEventListener('click', (e) => {
      e.preventDefault();
      const p = getActiveProject();
      const heads = p ? (p.budgetHeads || []) : [];
      if (collapsedCategories.size === 0) {
        // If all currently open, collapse all!
        heads.forEach(h => collapsedCategories.add(h.id || h.name));
      } else {
        // If any or all collapsed, expand all!
        collapsedCategories.clear();
      }
      renderBudgetTable();
    });
  }

  // -------------------------------------------------------------
  // ADD BUDGET MODAL (Screenshot 2 & 4)
  // Handles Case 1: DTL and Case 2: LMP (Lump Sum)
  // -------------------------------------------------------------
  if (btnOpenAddBudgetModal) {
    btnOpenAddBudgetModal.addEventListener('click', () => {
      openAddBudgetModal();
    });
  }

  if (btnCloseBudgetModal) {
    btnCloseBudgetModal.addEventListener('click', () => {
      closeAddBudgetModal();
    });
  }

  function openAddBudgetModal() {
    if (!modalAddBudget) return;
    modalAddBudget.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Populate category dropdown excluding FXD (Business Rule 7)
    if (modalCategory) {
      modalCategory.innerHTML = `<option value="">-- Select Category --</option>`;
      Object.keys(CATEGORY_CONFIG).forEach(cat => {
        if (CATEGORY_CONFIG[cat].type !== 'FXD') {
          const opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat;
          modalCategory.appendChild(opt);
        }
      });
      modalCategory.value = '';
    }

    if (modalSubCategory) {
      modalSubCategory.innerHTML = `<option value="">Select Category first</option>`;
      modalSubCategory.disabled = false;
    }

    if (modalUnitType) modalUnitType.value = 'Months';
    if (modalQuantity) modalQuantity.value = 0;
    if (modalDuration) modalDuration.value = 0;
    if (modalRate) modalRate.value = '0.00';
    if (modalTotal) {
      modalTotal.value = '0.00';
      modalTotal.readOnly = true;
    }
    if (modalFormulaPreview) modalFormulaPreview.textContent = 'Quantity × Duration × Rate';

    toggleModalLumpSumFields(false);
  }

  function closeAddBudgetModal() {
    if (!modalAddBudget) return;
    modalAddBudget.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  function toggleModalLumpSumFields(isLumpSum) {
    const qtyField = modalQuantity?.closest('.erp-form-field');
    const durField = modalDuration?.closest('.erp-form-field');
    const rateField = modalRate?.closest('.erp-form-field');
    const unitField = modalUnitType?.closest('.erp-form-field');

    if (isLumpSum) {
      // Case 2: Lump Sum
      if (qtyField) qtyField.style.display = 'none';
      if (durField) durField.style.display = 'none';
      if (rateField) rateField.style.display = 'none';
      if (unitField) unitField.style.display = 'none';
      if (modalSubCategory) {
        modalSubCategory.disabled = true;
        modalSubCategory.innerHTML = `<option value="Lump Sum Direct Allocation">Not applicable for Lump Sum</option>`;
      }
      if (modalTotal) {
        modalTotal.readOnly = false;
        modalTotal.classList.remove('modal-input-total');
      }
      if (modalFormulaPreview) {
        modalFormulaPreview.textContent = 'Direct Lump Sum Entry';
      }
    } else {
      // Case 1: DTL
      if (qtyField) qtyField.style.display = 'flex';
      if (durField) durField.style.display = 'flex';
      if (rateField) rateField.style.display = 'flex';
      if (unitField) unitField.style.display = 'flex';
      if (modalSubCategory) modalSubCategory.disabled = false;
      if (modalTotal) {
        modalTotal.readOnly = true;
        modalTotal.classList.add('modal-input-total');
      }
    }
  }

  if (modalCategory) {
    modalCategory.addEventListener('change', () => {
      const cat = modalCategory.value;
      const conf = CATEGORY_CONFIG[cat];

      if (!conf) {
        if (modalSubCategory) modalSubCategory.innerHTML = `<option value="">Select Category first</option>`;
        toggleModalLumpSumFields(false);
        return;
      }

      if (conf.type === 'LMP') {
        toggleModalLumpSumFields(true);
      } else {
        toggleModalLumpSumFields(false);
        if (modalSubCategory) {
          modalSubCategory.innerHTML = '';
          conf.subCategories.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            modalSubCategory.appendChild(opt);
          });
        }
        if (modalUnitType) modalUnitType.value = conf.defaultUnit || 'Months';
        recalculateModalFormula();
      }
    });
  }

  // Formula: Total = Quantity x Duration x Cost per Unit (Duration 0 means 1)
  function recalculateModalFormula() {
    const cat = modalCategory?.value;
    const conf = CATEGORY_CONFIG[cat];
    if (conf && conf.type === 'LMP') return;

    const qty = parseFloat(modalQuantity?.value) || 0;
    const durRaw = parseFloat(modalDuration?.value) || 0;
    const dur = durRaw === 0 ? 1 : durRaw;
    const rate = parseFloat(modalRate?.value) || 0;

    let computed = 0;
    let formulaText = 'Quantity × Duration × Rate';

    if (qty > 0 && rate > 0) {
      computed = qty * dur * rate;
      formulaText = `${qty} × ${dur} × ₹ ${rate.toLocaleString('en-IN')} = ₹ ${computed.toLocaleString('en-IN')}`;
    }

    if (modalTotal) {
      modalTotal.value = computed.toFixed(2);
    }
    if (modalFormulaPreview) {
      modalFormulaPreview.textContent = formulaText;
    }
  }

  if (modalQuantity) modalQuantity.addEventListener('input', recalculateModalFormula);
  if (modalDuration) modalDuration.addEventListener('input', recalculateModalFormula);
  if (modalRate) modalRate.addEventListener('input', recalculateModalFormula);

  if (btnSubmitBudget) {
    btnSubmitBudget.addEventListener('click', () => {
      const category = modalCategory?.value;
      if (!category) {
        alert('Please select a Category');
        return;
      }

      const conf = CATEGORY_CONFIG[category] || {};
      const isLump = conf.type === 'LMP';
      const subCategory = isLump ? 'Lump Sum Direct Allocation' : (modalSubCategory?.value || 'General');
      const unitType = isLump ? '-' : (modalUnitType?.value || 'Months');
      const qty = isLump ? '-' : (parseFloat(modalQuantity?.value) || 0);
      const dur = isLump ? '-' : (parseFloat(modalDuration?.value) || 0);
      const rate = isLump ? '-' : (parseFloat(modalRate?.value) || 0);
      const total = parseFloat(modalTotal?.value) || 0;

      if (total <= 0) {
        alert('Estimated Amount must be greater than 0');
        return;
      }

      const p = getActiveProject();
      if (!p) return;

      if (!p.budgetHeads) p.budgetHeads = [];

      let head = p.budgetHeads.find(h => h.name.toLowerCase().includes(category.toLowerCase()));
      if (!head) {
        head = {
          id: 'BH-' + Date.now().toString().slice(-4),
          name: `${p.budgetHeads.length + 1}. ${category}`,
          code: conf.code || 'OTH',
          badge: conf.badge || '',
          mode: isLump ? 'lumpSum' : 'detailed',
          subItems: [],
          headTotal: 0
        };
        p.budgetHeads.push(head);
      }

      head.subItems.push({
        id: 'sub-' + Date.now().toString().slice(-4),
        particular: subCategory,
        units: qty,
        period: dur,
        unitType: unitType,
        costPerUnit: rate,
        total: total
      });

      head.headTotal = head.subItems.reduce((acc, s) => acc + (parseFloat(s.total) || 0), 0);

      Store.updateProject(p);
      closeAddBudgetModal();
      showToast(`Budget item "${subCategory}" successfully added!`);
      renderBudgetTable();
    });
  }

  // -------------------------------------------------------------
  // ASSIGNEE AVATARS HELPER (4 visible circles + remaining count)
  // -------------------------------------------------------------
  const AVATAR_COLORS = [
    '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706',
    '#0891b2', '#4f46e5', '#ca8a04', '#dc2626', '#475569'
  ];

  function getInitials(name) {
    if (!name) return 'TM';
    const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
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
          { name: 'Amit Sharma', role: 'Field Investigator' },
          { name: 'Neha Saxena', role: 'Field Investigator' },
          { name: 'Rajesh Kumar', role: 'Field Investigator' }
        ];
      } else if (p.id === 'PRJ-02' || p.code === 'PRJ-02') {
        list = [
          { name: 'Dr. Ananya Joshi', role: 'Lead / Advisor' },
          { name: 'Kavita Joshi', role: 'Research Associate' },
          { name: 'Rohan Sharma', role: 'Research Associate' },
          { name: 'Rahul Sharma', role: 'Fellow' },
          { name: 'Pooja Tiwari', role: 'Field Investigator' },
          { name: 'Alok Mishra', role: 'Field Investigator' },
          { name: 'Manish Verma', role: 'Field Investigator' },
          { name: 'Deepak Chouhan', role: 'Field Investigator' }
        ];
      } else if (p.id === 'PRJ-03' || p.code === 'PRJ-03') {
        list = [
          { name: 'Prof. Manish Gupta', role: 'Advisor' },
          { name: 'Siddharth Sen', role: 'Research Associate' },
          { name: 'Aakash Rathore', role: 'Field Investigator' },
          { name: 'Megha Patidar', role: 'Field Investigator' },
          { name: 'Nikhil Jain', role: 'Field Investigator' }
        ];
      } else {
        list = [
          { name: 'Dr. Alok Verma', role: 'Senior Advisor' },
          { name: 'Dr. Neha Saxena', role: 'Lead Policy Fellow' },
          { name: 'Kavita Solanki', role: 'Research Associate' },
          { name: 'Rahul Verma', role: 'Data Analyst' },
          { name: 'Rajesh Kumar', role: 'Field Investigator' },
          { name: 'Sunita Chouhan', role: 'Field Investigator' },
          { name: 'Vikas Sharma', role: 'Field Investigator' },
          { name: 'Amit Verma', role: 'Field Investigator' }
        ];
      }
    }

    return list;
  }

  function getAssigneeAvatarsHtml(project) {
    const assignees = getProjectAssignees(project);

    if (!assignees || assignees.length === 0) {
      return `
        <div class="assignee-avatar-group" onclick="window.openAssigneeModal('${project.id}')" title="Click to assign team members" style="cursor: pointer;">
          <span style="background: #f8fafc; border: 1.5px dashed #cbd5e1; color: #64748b; font-weight: 700; font-size: 0.76rem; padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px;">
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
      <div class="assignee-avatar-group" onclick="window.openAssigneeModal('${project.id}')" title="Assigned: ${assignees.map(a => a.name).join(', ')} (Click to view/assign team members)" style="cursor: pointer;">
        ${avatarsHtml}
        <span style="margin-left: 8px; font-size: 0.78rem; font-weight: 700; color: #475569;">${assignees.length}</span>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // PROJECTS LIST TABLE (Page 1)
  // Columns: Project Name, Department & Scheme, FY, Timeline, Budget, Assignees (Circles), Status, Actions
  // -------------------------------------------------------------
  function renderProjectsListTable() {
    const tbody = document.getElementById('projectsListTbody');
    if (!tbody) return;

    const searchInput = document.getElementById('projectListSearchInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let projects = Store.getProjects();

    if (query) {
      projects = projects.filter(p =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        (p.scheme && p.scheme.toLowerCase().includes(query)) ||
        (p.department && p.department.toLowerCase().includes(query))
      );
    }

    const countBadge = document.getElementById('projectListCountBadge');
    if (countBadge) {
      countBadge.textContent = `${projects.length} ${projects.length === 1 ? 'Project' : 'Projects'}`;
    }

    tbody.innerHTML = '';

    if (projects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: #94a3b8; font-weight: 600;">No projects found matching "${query}".</td></tr>`;
      return;
    }

    projects.forEach(p => {
      const tr = document.createElement('tr');

      // Status Badge (Business Rule 6)
      const isSub = p.isSubmitted !== false && (p.status === 'Submitted' || p.status === 'Active');
      const statusBadge = isSub
        ? `<span style="display: inline-block; padding: 2px 10px; border-radius: 12px; background: #dcfce7; color: #166534; font-size: 0.76rem; font-weight: 700;">Submitted</span>`
        : `<span style="display: inline-block; padding: 2px 10px; border-radius: 12px; background: #fef3c7; color: #92400e; font-size: 0.76rem; font-weight: 700;">Draft</span>`;

      const durationStr = `${p.durationMonths || 12} Months`;

      // Estimated Budget formatting
      let budgetVal = p.budgetSanctioned;
      if (!budgetVal && p.budgetSummary && p.budgetSummary.totalEstimatedCost) {
        budgetVal = p.budgetSummary.totalEstimatedCost;
      }
      if (!budgetVal) budgetVal = 55308.40;

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: #0f172a; font-size: 0.9rem; line-height: 1.35;">${p.name}</div>
          <div style="font-size: 0.76rem; color: #64748b; margin-top: 2px;">Local: ${p.localName || '-'}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: #334155; font-size: 0.84rem;">${p.department || 'Center 11'}</div>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 1px; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.scheme || '-'}</div>
        </td>
        <td style="font-size: 0.82rem; font-weight: 600;">
          <span style="display: inline-block; font-size: 0.76rem; font-weight: 700; color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 6px;">
            ${p.financialYear || '2026–2027'}
          </span>
        </td>
        <td style="text-align: center;">
          <span style="font-size: 0.8rem; color: #1e40af; font-weight: 700; background: #eff6ff; padding: 3px 8px; border-radius: 6px; white-space: nowrap;">
            <i class="pi pi-clock" style="font-size: 0.72rem; margin-right: 3px;"></i>${durationStr}
          </span>
        </td>
        <td style="text-align: right; font-weight: 800; color: #0f172a;">${formatINR(budgetVal)}</td>
        <td>
          ${getAssigneeAvatarsHtml(p)}
        </td>
        <td style="text-align: center;">${statusBadge}</td>
        <td style="text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
            <button type="button" class="btn-action-edit" onclick="window.switchView('edit', '${p.id}')" title="Edit Project">
              <i class="pi pi-pencil"></i>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-action-budget-view" onclick="window.switchView('budget', '${p.id}')" title="Manage Budget">
              <i class="pi pi-wallet"></i>
              <span>Budget</span>
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  // Project List search input filter listener
  const prjSearchInput = document.getElementById('projectListSearchInput');
  if (prjSearchInput) {
    prjSearchInput.addEventListener('input', () => {
      renderProjectsListTable();
    });
  }

  // Sidebar Collapse & Expand (Matches dashboard.html & activities.js)
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
      localStorage.setItem('aiggpa_sidebar_collapsed', isCollapsed);
    }
  }

  if (toggleBtn) toggleBtn.addEventListener('click', (e) => { e.preventDefault(); doSidebarToggle(); });
  if (collapseTrigger) collapseTrigger.addEventListener('click', (e) => { e.preventDefault(); doSidebarToggle(); });
  if (brandIcon) {
    brandIcon.addEventListener('click', (e) => {
      if (document.documentElement.classList.contains('sidebar-collapsed') ||
          document.body?.classList.contains('sidebar-collapsed')) {
        e.preventDefault();
        doSidebarToggle();
      }
    });
  }

  // Top User Dropdown with Logout
  const userDropBtn = document.getElementById('topUserDropdownBtn');
  const userDropMenu = document.getElementById('topUserDropdownMenu');
  if (userDropBtn && userDropMenu) {
    userDropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropMenu.style.display = userDropMenu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => { userDropMenu.style.display = 'none'; });
  }

  // Intercept Sidebar menu clicks if switching between views on same page
  if (navCreateProject) {
    navCreateProject.addEventListener('click', (e) => {
      e.preventDefault();
      window.switchView('list');
    });
  }
  if (navAddBudget) {
    navAddBudget.addEventListener('click', (e) => {
      e.preventDefault();
      window.switchView('budget', activeProjectId || 'ABC');
    });
  }

  // ══════════════════════════════════════════════
  //  MODAL: ASSIGN TEAM MEMBERS / ADD ASSIGNEE (#assigneeModal)
  // ══════════════════════════════════════════════
  const EMPLOYEE_DB = {
    'Senior Advisor': ['Anis', 'Kiran', 'Dr. Alok Verma', 'Prof. Gupta'],
    'Research Associate': ['Priya Verma', 'Rahul Sharma', 'Ankit Jain', 'Sneha Patel', 'Priya Patel', 'Kavita Joshi'],
    'Fellow': ['Rohan Sharma', 'Deepak Chouhan', 'Manish Verma', 'Sunita Meena'],
    'Field Investigator': ['Rajesh Kumar', 'Sunita Meena', 'Vikas Tiwari', 'Anita Das', 'Gaurav Yadav', 'Amit Sharma', 'Neha Saxena', 'Pooja Tiwari']
  };

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
          <td style="padding: 10px 14px; font-weight: 700; color: #0f172a;">${item.designation}</td>
          <td style="padding: 10px 14px; text-align: center; font-weight: 800; color: #1e3a8a;">${item.positions}</td>
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

    // Also sync milestones if helper exists
    if (typeof Store.createDefaultMilestones === 'function') {
      Store.createDefaultMilestones(project.id, project.name);
    }

    showToast(`Team assignees saved for "${project.name}"!`);
    window.closeAssigneeModal();
    renderProjectsListTable();
  };

  // Close the modal employee dropdown when clicking outside
  document.addEventListener('click', function (e) {
    const menu = document.getElementById('modalEmployeeCheckboxMenu');
    const trigger = document.getElementById('modalEmployeeDropdownTrigger');
    if (menu && trigger) {
      if (menu.style.display === 'block' && !menu.contains(e.target) && !trigger.contains(e.target)) {
        menu.style.display = 'none';
      }
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

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeAssigneeModal();
      window.closeAddBudgetModal();
    }
  });

  // -------------------------------------------------------------
  // Initial Route Load
  // -------------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const pid = params.get('projectId') || params.get('id');

  if (view === 'create') {
    window.switchView('create');
  } else if (view === 'budget') {
    window.switchView('budget', pid || 'ABC');
  } else if (view === 'edit') {
    window.switchView('edit', pid || 'ABC');
  } else {
    // Default to Projects List view with avatar circles
    window.switchView('list');
  }
});
