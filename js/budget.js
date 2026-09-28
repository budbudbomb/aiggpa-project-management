/**
 * AIGGPA Project Management - Dedicated Budget Estimation Desk Controller
 * Standalone page logic for budget.html
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle for mobile/compact views
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  sidebarToggleBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('collapsed');
  });

  // User Profile Dropdown
  const topUserDropdownBtn = document.getElementById('topUserDropdownBtn');
  const topUserDropdownMenu = document.getElementById('topUserDropdownMenu');
  topUserDropdownBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (topUserDropdownMenu) {
      topUserDropdownMenu.style.display = topUserDropdownMenu.style.display === 'block' ? 'none' : 'block';
    }
  });

  document.addEventListener('click', (e) => {
    if (topUserDropdownMenu && !topUserDropdownBtn?.contains(e.target)) {
      topUserDropdownMenu.style.display = 'none';
    }
  });

  const BUDGET_HEAD_METADATA = [
    {
      name: 'Human Resources (HR & Research Personnel)',
      mode: 'detailed',
      label: 'Human Resources (HR & Research Personnel)',
      badgeText: 'Detailed: Units × Duration × Rate',
      particulars: [
        'Lead Policy Fellow',
        'Senior Advisor / Consultant',
        'Research Associate (RA)',
        'Field Investigator (FI)',
        'Data Analyst / Statistician'
      ],
      defaultUnit: 'Months',
      defaultRate: 125000,
      defaultUnits: 1,
      defaultPeriod: 12
    },
    {
      name: 'Field Survey & Primary Data Collection',
      mode: 'detailed',
      label: 'Field Survey & Primary Data Collection',
      badgeText: 'Detailed: Samples × Rate',
      particulars: [
        'Household Survey Questionnaires',
        'Key Informant Interviews (KII)',
        'Focus Group Discussions (FGD)',
        'Ground Enumerators Daily Mobility'
      ],
      defaultUnit: 'Units',
      defaultRate: 350,
      defaultUnits: 500,
      defaultPeriod: 1
    },
    {
      name: 'Travel Allowances & Field Mobility',
      mode: 'lumpSum',
      label: 'Travel Allowances & Field Mobility',
      badgeText: 'Lump Sum (Fixed Amount)',
      defaultParticular: 'District Field Mobility & Monitoring Travel',
      defaultAmount: 150000
    },
    {
      name: 'Workshops, Seminars & Dissemination',
      mode: 'lumpSum',
      label: 'Workshops, Seminars & Dissemination',
      badgeText: 'Lump Sum (Fixed Amount)',
      defaultParticular: 'Stakeholder Workshop & Policy Dissemination',
      defaultAmount: 75000
    },
    {
      name: 'Equipment & Technological Infrastructure',
      mode: 'lumpSum',
      label: 'Equipment & Technological Infrastructure',
      badgeText: 'Lump Sum (Fixed Amount)',
      defaultParticular: 'Data Tablets & Analytical Software Licenses',
      defaultAmount: 80000
    },
    {
      name: 'Printing, Publication & Documentation',
      mode: 'lumpSum',
      label: 'Printing, Publication & Documentation',
      badgeText: 'Lump Sum (Fixed Amount)',
      defaultParticular: 'Policy Briefs & Final Monograph Printing',
      defaultAmount: 45000
    }
  ];

  const UNIT_TYPES = ['Months', 'Days', 'Trips', 'Units', 'Persons', 'Lump Sum'];

  let currentBudgetList = [];
  let currentActiveCategory = 'detailed';

  function formatRupees(num) {
    if (isNaN(num)) return '₹ 0';
    return '₹ ' + Number(num).toLocaleString('en-IN');
  }

  window.handleBudgetHeadSelection = function(headName) {
    const config = BUDGET_HEAD_METADATA.find(h => h.name === headName) || BUDGET_HEAD_METADATA[0];
    window.setEntryCategory(config.mode);

    if (config.mode === 'detailed') {
      const partSel = document.getElementById('entryDetailedParticular');
      if (partSel && config.particulars) {
        partSel.innerHTML = config.particulars.map(opt => `<option value="${opt}">${opt}</option>`).join('');
      }
      if (config.defaultUnit) {
        const uSel = document.getElementById('entryUnitType');
        if (uSel) uSel.value = config.defaultUnit;
      }
      if (config.defaultRate) {
        const rInp = document.getElementById('entryCostPerUnit');
        if (rInp) rInp.value = config.defaultRate;
      }
      if (config.defaultUnits) {
        const unInp = document.getElementById('entryUnits');
        if (unInp) unInp.value = config.defaultUnits;
      }
      if (config.defaultPeriod) {
        const pInp = document.getElementById('entryPeriod');
        if (pInp) pInp.value = config.defaultPeriod;
      }
      window.calcDetailedPreview();
    } else {
      const partInp = document.getElementById('entryLumpSumParticular');
      if (partInp) partInp.value = config.defaultParticular || config.name;
      const amtInp = document.getElementById('entryLumpSumAmount');
      if (amtInp) amtInp.value = config.defaultAmount || '';
    }
  };

  function initBudgetDeskControls() {
    const headSel = document.getElementById('entryBudgetHead');
    if (headSel) {
      headSel.innerHTML = BUDGET_HEAD_METADATA.map(opt => `<option value="${opt.name}">${opt.name}</option>`).join('');
      headSel.addEventListener('change', (e) => {
        window.handleBudgetHeadSelection(e.target.value);
      });
    }

    const unitSel = document.getElementById('entryUnitType');
    if (unitSel) {
      unitSel.innerHTML = UNIT_TYPES.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    }

    if (BUDGET_HEAD_METADATA[0]) {
      window.handleBudgetHeadSelection(BUDGET_HEAD_METADATA[0].name);
    }
  }

  window.setEntryCategory = function(mode) {
    currentActiveCategory = mode;
    const catSel = document.getElementById('entryCategorySelect');
    if (catSel && catSel.value !== mode) {
      catSel.value = mode;
    }

    const fLump = document.getElementById('fieldsLumpSum');
    const fDet = document.getElementById('fieldsDetailed');

    if (mode === 'lumpSum') {
      if (fLump) fLump.style.display = 'grid';
      if (fDet) fDet.style.display = 'none';
    } else {
      if (fDet) fDet.style.display = 'block';
      if (fLump) fLump.style.display = 'none';
      window.calcDetailedPreview();
    }
  };

  window.calcDetailedPreview = function() {
    const u = parseInt(document.getElementById('entryUnits')?.value) || 0;
    const p = parseInt(document.getElementById('entryPeriod')?.value) || 0;
    const c = parseInt(document.getElementById('entryCostPerUnit')?.value) || 0;
    const total = u * p * c;

    const tText = document.getElementById('previewTotalCostText');
    if (tText) tText.textContent = formatRupees(total);
  };

  window.clearBudgetForm = function() {
    if (currentActiveCategory === 'detailed') {
      const u = document.getElementById('entryUnits');
      const p = document.getElementById('entryPeriod');
      const c = document.getElementById('entryCostPerUnit');
      if (u) u.value = 1;
      if (p) p.value = 12;
      if (c) c.value = 0;
      window.calcDetailedPreview();
    } else {
      const p = document.getElementById('entryLumpSumParticular');
      const a = document.getElementById('entryLumpSumAmount');
      if (p) p.value = '';
      if (a) a.value = '';
    }
  };

  window.clearAllBudgetEntries = function() {
    if (currentBudgetList.length === 0) return;
    if (confirm('Are you sure you want to clear all budget entries? This cannot be undone.')) {
      currentBudgetList = [];
      renderBudgetList();
      showToast('All budget entries cleared');
    }
  };

  window.addBudgetEntryToList = function() {
    const headSel = document.getElementById('entryBudgetHead');
    const headName = headSel?.value || BUDGET_HEAD_METADATA[0].name;

    if (currentActiveCategory === 'detailed') {
      const particular = document.getElementById('entryDetailedParticular')?.value || BUDGET_HEAD_METADATA[0].particulars[0];
      const units = parseInt(document.getElementById('entryUnits')?.value) || 1;
      const period = parseInt(document.getElementById('entryPeriod')?.value) || 1;
      const unitType = document.getElementById('entryUnitType')?.value || 'Months';
      const costPerUnit = parseInt(document.getElementById('entryCostPerUnit')?.value) || 0;
      const amount = units * period * costPerUnit;

      if (amount <= 0) {
        alert('Please enter valid Units, Period, and Cost Per Unit.');
        return;
      }

      currentBudgetList.unshift({
        id: 'bitem-' + Date.now(),
        headName: headName,
        category: 'detailed',
        particular: particular,
        units: units,
        period: period,
        unitType: unitType,
        costPerUnit: costPerUnit,
        breakdown: `${units} × ${period} @ ₹${Number(costPerUnit).toLocaleString('en-IN')}`,
        amount: amount
      });

      renderBudgetList();
      showToast(`Row #1 added: ${particular} (${formatRupees(amount)})`);
      return;
    } else {
      const particularInput = document.getElementById('entryLumpSumParticular');
      const amountInput = document.getElementById('entryLumpSumAmount');
      const particular = particularInput?.value.trim() || 'Lump Sum Provision';
      const amount = parseInt(amountInput?.value) || 0;

      if (amount <= 0) {
        alert('Please enter a valid Estimated Amount.');
        amountInput?.focus();
        return;
      }

      currentBudgetList.unshift({
        id: 'bitem-' + Date.now(),
        headName: headName,
        category: 'lumpSum',
        particular: particular,
        units: 1,
        period: 1,
        unitType: 'Lump Sum',
        costPerUnit: amount,
        breakdown: 'Lump Sum',
        amount: amount
      });

      // Clear lump sum input fields for next entry
      if (particularInput) particularInput.value = '';
      if (amountInput) amountInput.value = '';

      renderBudgetList();
      showToast(`Row #1 added: ${particular} (${formatRupees(amount)})`);
    }
  };

  window.removeBudgetEntryFromList = function(idx) {
    currentBudgetList.splice(idx, 1);
    renderBudgetList();
  };

  function renderBudgetList() {
    const tbody = document.getElementById('budgetEntriesTbody');
    const tfoot = document.getElementById('budgetTableTfoot');
    const badge = document.getElementById('budgetEntriesCountBadge');
    if (!tbody) return;

    if (badge) {
      badge.textContent = `${currentBudgetList.length} ${currentBudgetList.length === 1 ? 'entry' : 'entries'} added`;
    }

    if (currentBudgetList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 24px 14px; color: #94a3b8; font-size: 0.86rem;">
            No budget entries added yet for this project. Select a Head and Expense Type above, then click <strong>Add to Budget</strong>.
          </td>
        </tr>
      `;
      if (tfoot) tfoot.innerHTML = '';
      updateInstitutionalOverheads(0);
      return;
    }

    let directSubTotal = 0;

    tbody.innerHTML = currentBudgetList.map((item, idx) => {
      directSubTotal += item.amount;
      const isDet = item.category === 'detailed';
      const catBadge = isDet 
        ? `<span class="budget-badge-detailed">Detailed</span>`
        : `<span class="budget-badge-lumpsum">Lump Sum</span>`;

      // Clean headName (remove code like (BH-HR-01))
      const cleanHeadName = (item.headName || '').replace(/\s*\([A-Z0-9-]+\)\s*$/gi, '').trim();

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; background: ${idx % 2 === 0 ? '#ffffff' : '#fafcff'};">
          <td style="padding: 9px 12px; text-align: center; font-weight: 700; color: #64748b;">${idx + 1}</td>
          <td style="padding: 9px 12px; font-weight: 700; color: #1e293b;">${cleanHeadName}</td>
          <td style="padding: 9px 10px;">${catBadge}</td>
          <td style="padding: 9px 12px; color: #334155; font-weight: 600;">${item.particular}</td>
          <td style="padding: 9px 12px; color: #64748b; font-size: 0.8rem; font-family: monospace;">${item.breakdown || '-'}</td>
          <td style="padding: 9px 12px; text-align: right; font-weight: 800; color: #1e293b;">${formatRupees(item.amount)}</td>
          <td style="padding: 9px 10px; text-align: center;">
            <button type="button" onclick="window.removeBudgetEntryFromList(${idx})" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'" title="Delete Entry">
              <i class="pi pi-trash" style="font-size: 13px;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Calculate Overheads & Render Table Footer (Subtotal, Overheads Row, Grand Total)
    const existingPctInput = document.getElementById('bgOverheadsPct');
    const overheadsPct = existingPctInput ? (parseFloat(existingPctInput.value) || 0) : 15;
    const overheadsAmount = Math.round(directSubTotal * (overheadsPct / 100));
    const grandTotal = directSubTotal + overheadsAmount;

    if (tfoot) {
      tfoot.innerHTML = `
        <!-- Direct Heads Subtotal Row -->
        <tr style="background: #f1f5f9; border-top: 2px solid #cbd5e1; font-weight: 700;">
          <td style="padding: 8px 10px; text-align: center; color: #64748b;"></td>
          <td colspan="4" style="padding: 8px 10px; color: #334155; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.03em;">
            Subtotal (Direct Heads)
          </td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 800; color: #1e293b; font-size: 0.92rem;">
            ${formatRupees(directSubTotal)}
          </td>
          <td style="padding: 8px 8px; text-align: center; color: #94a3b8;"></td>
        </tr>

        <!-- Institutional Overheads Row (15% by default, editable directly in table) -->
        <tr style="background: #eff6ff; border-top: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe;">
          <td style="padding: 8px 10px; text-align: center; color: #1d4ed8;"></td>
          <td style="padding: 8px 10px; font-weight: 800; color: #1e3a8a;">
            Institutional Overheads
          </td>
          <td style="padding: 8px 8px;">
            <span style="background: #dbeafe; color: #1e40af; font-weight: 800; font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; border: 1px solid #93c5fd; white-space: nowrap;">
              Overheads (${overheadsPct}%)
            </span>
          </td>
          <td style="padding: 8px 10px; color: #1e40af; font-weight: 600;">
            Administrative &amp; Institutional Support
          </td>
          <td style="padding: 8px 10px; color: #1e40af; font-size: 0.8rem;">
            <div style="display: inline-flex; align-items: center; gap: 4px;">
              <input type="number" id="bgOverheadsPct" min="0" max="100" value="${overheadsPct}"
                style="width: 48px; height: 26px; font-weight: 800; font-size: 0.86rem; border: 1.5px solid #93c5fd; border-radius: 6px; padding: 0 4px; text-align: center; color: #1d4ed8; background: #ffffff;"
                oninput="window.recomputeOverheadsOnly()">
              <span style="font-weight: 700; font-size: 0.76rem;">% of Subtotal</span>
            </div>
          </td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 800; color: #1d4ed8; font-size: 0.92rem;" id="tableOverheadsAmountText">
            ${formatRupees(overheadsAmount)}
          </td>
          <td style="padding: 8px 8px; text-align: center; color: #3b82f6;"></td>
        </tr>

        <!-- Total Estimated Cost Row -->
        <tr style="background: #f0fdf4; border-top: 2px solid #86efac; font-weight: 800;">
          <td style="padding: 9px 10px; text-align: center; color: #15803d;"></td>
          <td colspan="4" style="padding: 9px 10px; color: #15803d; font-size: 0.84rem; text-transform: uppercase; letter-spacing: 0.03em;">
            Total Estimated Project Cost (Direct Heads + Institutional Overheads)
          </td>
          <td style="padding: 9px 10px; text-align: right; font-weight: 900; color: #15803d; font-size: 1.15rem;" id="tableGrandTotalText">
            ${formatRupees(grandTotal)}
          </td>
          <td style="padding: 9px 10px; text-align: center; color: #15803d;"></td>
        </tr>
      `;
    }

    updateInstitutionalOverheads(directSubTotal);
  }

  function updateInstitutionalOverheads(subTotal) {
    const pctInput = document.getElementById('bgOverheadsPct');
    const pct = parseFloat(pctInput?.value) || 0;
    const overheadsAmount = Math.round(subTotal * (pct / 100));
    const grandTotal = subTotal + overheadsAmount;

    const elTot = document.getElementById('bgStatTotalCost');
    if (elTot) elTot.textContent = formatRupees(grandTotal);

    const tOver = document.getElementById('tableOverheadsAmountText');
    const tGrand = document.getElementById('tableGrandTotalText');
    if (tOver) tOver.textContent = formatRupees(overheadsAmount);
    if (tGrand) tGrand.textContent = formatRupees(grandTotal);
  }

  window.recomputeOverheadsOnly = function() {
    let subTotal = 0;
    currentBudgetList.forEach(item => {
      subTotal += (item.amount || 0);
    });
    updateInstitutionalOverheads(subTotal);
  };

  function populateBudgetProjectSelect() {
    const projects = Store.getProjects();
    const sel = document.getElementById('budgetProjectSelect');
    if (!sel) return;

    sel.innerHTML = projects.map(p => {
      return `<option value="${p.id}">${p.name}</option>`;
    }).join('');

    sel.addEventListener('change', (e) => {
      loadBudgetForSelectedProject(e.target.value);
    });

    // Check URL query parameter: ?project=PRJ-01
    const urlParams = new URLSearchParams(window.location.search);
    const targetProjectId = urlParams.get('project');

    let initialId = projects[0]?.id;
    if (targetProjectId && projects.some(p => p.id === targetProjectId)) {
      initialId = targetProjectId;
    }
    if (initialId) {
      sel.value = initialId;
      loadBudgetForSelectedProject(initialId);
    }
  }

  const SAMPLE_10_BUDGET_ITEMS = [
    {
      id: 'bitem-1',
      headName: 'Human Resources (HR & Research Personnel) (BH-HR-01)',
      category: 'detailed',
      particular: 'Lead Policy Fellow',
      units: 1,
      period: 6,
      unitType: 'Months',
      costPerUnit: 100000,
      breakdown: '1 × 6 @ ₹1,00,000',
      amount: 600000
    },
    {
      id: 'bitem-2',
      headName: 'Human Resources (HR & Research Personnel) (BH-HR-01)',
      category: 'detailed',
      particular: 'Senior Advisor / Consultant',
      units: 1,
      period: 3,
      unitType: 'Months',
      costPerUnit: 50000,
      breakdown: '1 × 3 @ ₹50,000',
      amount: 150000
    },
    {
      id: 'bitem-3',
      headName: 'Human Resources (HR & Research Personnel) (BH-HR-01)',
      category: 'detailed',
      particular: 'Research Associate (RA)',
      units: 1,
      period: 6,
      unitType: 'Months',
      costPerUnit: 45000,
      breakdown: '1 × 6 @ ₹45,000',
      amount: 270000
    },
    {
      id: 'bitem-4',
      headName: 'Human Resources (HR & Research Personnel) (BH-HR-01)',
      category: 'detailed',
      particular: 'Field Investigator (FI)',
      units: 2,
      period: 3,
      unitType: 'Months',
      costPerUnit: 25000,
      breakdown: '2 × 3 @ ₹25,000',
      amount: 150000
    },
    {
      id: 'bitem-5',
      headName: 'Human Resources (HR & Research Personnel) (BH-HR-01)',
      category: 'detailed',
      particular: 'Data Analyst / Statistician',
      units: 1,
      period: 3,
      unitType: 'Months',
      costPerUnit: 35000,
      breakdown: '1 × 3 @ ₹35,000',
      amount: 105000
    },
    {
      id: 'bitem-6',
      headName: 'Travel Allowances & Field Mobility (BH-TRV-02)',
      category: 'detailed',
      particular: 'Travel TA / DA Allowances',
      units: 2,
      period: 5,
      unitType: 'Trips',
      costPerUnit: 3000,
      breakdown: '2 × 5 @ ₹3,000',
      amount: 30000
    },
    {
      id: 'bitem-7',
      headName: 'Travel Allowances & Field Mobility (BH-TRV-02)',
      category: 'lumpSum',
      particular: 'District Field Mobility & Fuel',
      units: 1,
      period: 1,
      unitType: 'Lump Sum',
      costPerUnit: 95000,
      breakdown: 'Lump Sum',
      amount: 95000
    },
    {
      id: 'bitem-8',
      headName: 'Field Survey & Data Collection Contingency (BH-SRV-03)',
      category: 'lumpSum',
      particular: 'Focus Group Discussion Logistics',
      units: 1,
      period: 1,
      unitType: 'Lump Sum',
      costPerUnit: 65000,
      breakdown: 'Lump Sum',
      amount: 65000
    },
    {
      id: 'bitem-9',
      headName: 'Workshops, Seminars & Dissemination (BH-WKS-04)',
      category: 'lumpSum',
      particular: 'Stakeholder Consultation Workshop',
      units: 1,
      period: 1,
      unitType: 'Lump Sum',
      costPerUnit: 85000,
      breakdown: 'Lump Sum',
      amount: 85000
    },
    {
      id: 'bitem-10',
      headName: 'Printing, Publication & Documentation (BH-PUB-06)',
      category: 'lumpSum',
      particular: 'Report Printing & Dissemination',
      units: 1,
      period: 1,
      unitType: 'Lump Sum',
      costPerUnit: 100000,
      breakdown: 'Lump Sum',
      amount: 100000
    }
  ];

  function loadBudgetForSelectedProject(projectId) {
    const projects = Store.getProjects();
    const p = projects.find(x => x.id === projectId);
    if (p) {
      const sel = document.getElementById('budgetProjectSelect');
      if (sel && sel.value !== p.id) {
        sel.value = p.id;
      }

      // Sync URL without page reload
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('project', p.id);
        window.history.replaceState(null, '', url.toString());
      } catch (e) {}

      // Update active project header
      const codeBadge = document.getElementById('activeProjectCodeBadge');
      const titleDisplay = document.getElementById('activeProjectTitleDisplay');

      if (codeBadge) codeBadge.textContent = p.code || p.id;
      if (titleDisplay) titleDisplay.textContent = p.name;

      // Update project metadata strip
      const tileScheme = document.getElementById('projectTileScheme');
      const tileDuration = document.getElementById('projectTileDuration');
      const tileTeam = document.getElementById('projectTileTeam');
      const tileFunding = document.getElementById('projectTileFunding');

      if (tileScheme) {
        let schemeClean = p.nature || p.scheme || 'ABVIPA Policy Analysis';
        if (schemeClean.includes(':')) schemeClean = schemeClean.split(':')[1].trim();
        if (schemeClean.includes('(')) schemeClean = schemeClean.split('(')[0].trim();
        tileScheme.textContent = schemeClean;
      }

      if (tileDuration) {
        const fy = p.financialYear ? p.financialYear.split('(')[0].trim() : 'FY 2025–26';
        const months = p.durationMonths ? `${p.durationMonths} Months` : '12 Months';
        tileDuration.textContent = `${fy} (${months})`;
      }

      if (tileTeam) {
        const lead = p.lead || 'Center Head';
        const totalTeam = p.team?.totalMembers ? `${p.team.totalMembers} Members` : '7 Members';
        tileTeam.textContent = `${lead} • ${totalTeam}`;
      }

      if (tileFunding) {
        tileFunding.textContent = p.fundingPattern || 'Internal Institute Funding';
      }

      if (p.id === 'PRJ-01' && (!p.budgetItems || p.budgetItems.length < 10)) {
        currentBudgetList = JSON.parse(JSON.stringify(SAMPLE_10_BUDGET_ITEMS));
      } else if (p.budgetItems && p.budgetItems.length > 0) {
        currentBudgetList = JSON.parse(JSON.stringify(p.budgetItems));
      } else if (p.budgetHeads && p.budgetHeads.length > 0) {
        currentBudgetList = [];
        p.budgetHeads.forEach(head => {
          if (head.mode === 'lumpSum') {
            currentBudgetList.push({
              id: 'bitem-' + (head.id || Date.now()),
              headName: head.name,
              category: 'lumpSum',
              particular: 'Lump Sum Provision',
              units: 1,
              period: 1,
              unitType: 'Lump Sum',
              costPerUnit: head.lumpSumAmount || 0,
              breakdown: 'Lump Sum',
              amount: head.lumpSumAmount || 0
            });
          } else if (head.subItems && head.subItems.length > 0) {
            head.subItems.forEach(sub => {
              const u = parseInt(sub.units) || 1;
              const per = parseInt(sub.period) || 1;
              const c = parseInt(sub.costPerUnit) || 0;
              currentBudgetList.push({
                id: 'bitem-' + (sub.id || Date.now()),
                headName: head.name,
                category: 'detailed',
                particular: sub.particular || 'Policy Personnel',
                units: u,
                period: per,
                unitType: sub.unitType || 'Months',
                costPerUnit: c,
                breakdown: `${u} × ${per} @ ₹${Number(c).toLocaleString('en-IN')}`,
                amount: u * per * c
              });
            });
          }
        });
      } else {
        currentBudgetList = [];
      }

      const pctInput = document.getElementById('bgOverheadsPct');
      if (pctInput && p.budgetSummary && typeof p.budgetSummary.overheadsPct !== 'undefined') {
        pctInput.value = p.budgetSummary.overheadsPct;
      }

      // Update Live Estimation Status Badge
      const statusBadge = document.getElementById('estimationStatusBadge');
      if (statusBadge) {
        if (p.budgetSummary?.status === 'Submitted') {
          statusBadge.style.background = '#f0fdf4';
          statusBadge.style.color = '#15803d';
          statusBadge.style.borderColor = '#bbf7d0';
          const timeStr = p.budgetSummary?.lastSaved ? ` (${p.budgetSummary.lastSaved})` : '';
          statusBadge.innerHTML = `<i class="pi pi-check-circle" style="font-size: 11px;"></i> <span id="estimationStatusText">Submitted for Approval${timeStr}</span>`;
        } else if (p.budgetSummary?.status === 'Draft') {
          statusBadge.style.background = '#fef3c7';
          statusBadge.style.color = '#b45309';
          statusBadge.style.borderColor = '#fde68a';
          const timeStr = p.budgetSummary?.lastSaved ? ` (${p.budgetSummary.lastSaved})` : '';
          statusBadge.innerHTML = `<i class="pi pi-file-edit" style="font-size: 11px;"></i> <span id="estimationStatusText">Draft Saved${timeStr}</span>`;
        } else {
          statusBadge.style.background = '#fef3c7';
          statusBadge.style.color = '#b45309';
          statusBadge.style.borderColor = '#fde68a';
          statusBadge.innerHTML = `<i class="pi pi-file-edit" style="font-size: 11px;"></i> <span id="estimationStatusText">Draft (In Progress)</span>`;
        }
      }

      renderBudgetList();
    }
  }

  document.getElementById('budgetProjectSelect')?.addEventListener('change', (e) => {
    loadBudgetForSelectedProject(e.target.value);
  });

  window.saveCurrentBudget = function(isDraft = false) {
    const pId = document.getElementById('budgetProjectSelect')?.value;
    if (!pId) return;

    let subTotal = 0;
    currentBudgetList.forEach(item => {
      subTotal += (item.amount || 0);
    });

    const pct = parseFloat(document.getElementById('bgOverheadsPct')?.value) || 0;
    const overheadsAmount = Math.round(subTotal * (pct / 100));
    const grandTotal = subTotal + overheadsAmount;
    const projects = Store.getProjects();
    const p = projects.find(x => x.id === pId);

    // If clicking "Submit Budget", open the final confirmation modal
    if (!isDraft) {
      const modal = document.getElementById('submitConfirmModal');
      const mProj = document.getElementById('modalProjectName');
      const mItems = document.getElementById('modalTotalItems');
      const mSub = document.getElementById('modalSubtotal');
      const mOver = document.getElementById('modalOverheads');
      const mGrand = document.getElementById('modalGrandTotal');

      if (mProj) mProj.textContent = `[${p?.code || pId}] ${p?.name || ''}`;
      if (mItems) mItems.textContent = `${currentBudgetList.length} line items`;
      if (mSub) mSub.textContent = formatRupees(subTotal);
      if (mOver) mOver.textContent = `${formatRupees(overheadsAmount)} (${pct}%)`;
      if (mGrand) mGrand.textContent = formatRupees(grandTotal);

      if (modal) modal.style.display = 'flex';
      return;
    }

    // Save as Draft
    const headGroups = {};
    currentBudgetList.forEach(item => {
      if (!headGroups[item.headName]) {
        headGroups[item.headName] = {
          id: 'head-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          name: item.headName,
          mode: item.category,
          lumpSumAmount: 0,
          subItems: []
        };
      }
      if (item.category === 'lumpSum') {
        headGroups[item.headName].lumpSumAmount += item.amount;
        headGroups[item.headName].mode = 'lumpSum';
      } else {
        headGroups[item.headName].mode = 'detailed';
        headGroups[item.headName].subItems.push({
          id: item.id,
          particular: item.particular,
          units: item.units,
          period: item.period,
          unitType: item.unitType,
          costPerUnit: item.costPerUnit,
          total: item.amount
        });
      }
    });

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const budgetData = {
      items: currentBudgetList,
      heads: Object.values(headGroups),
      summary: {
        subTotal: subTotal,
        overheadsPct: pct,
        overheadsAmount: overheadsAmount,
        totalEstimatedCost: grandTotal,
        status: 'Draft',
        lastSaved: nowTime
      },
      totalEstimatedCost: grandTotal
    };

    Store.updateProjectBudgetDetails(pId, budgetData);

    // Update Top Status Pill
    const badge = document.getElementById('estimationStatusBadge');
    if (badge) {
      badge.style.background = '#fef3c7';
      badge.style.color = '#b45309';
      badge.style.borderColor = '#fde68a';
      badge.innerHTML = `<i class="pi pi-file-edit" style="font-size: 11px;"></i> <span id="estimationStatusText">Draft Saved (${nowTime})</span>`;
    }

    showToast(`Draft estimation for "${p?.name || pId}" saved (${formatRupees(grandTotal)})!`);
  };

  window.closeSubmitModal = function() {
    const modal = document.getElementById('submitConfirmModal');
    if (modal) modal.style.display = 'none';
  };

  window.confirmFinalSubmit = function() {
    const pId = document.getElementById('budgetProjectSelect')?.value;
    if (!pId) return;

    let subTotal = 0;
    currentBudgetList.forEach(item => {
      subTotal += (item.amount || 0);
    });

    const pct = parseFloat(document.getElementById('bgOverheadsPct')?.value) || 0;
    const overheadsAmount = Math.round(subTotal * (pct / 100));
    const grandTotal = subTotal + overheadsAmount;

    const headGroups = {};
    currentBudgetList.forEach(item => {
      if (!headGroups[item.headName]) {
        headGroups[item.headName] = {
          id: 'head-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          name: item.headName,
          mode: item.category,
          lumpSumAmount: 0,
          subItems: []
        };
      }
      if (item.category === 'lumpSum') {
        headGroups[item.headName].lumpSumAmount += item.amount;
        headGroups[item.headName].mode = 'lumpSum';
      } else {
        headGroups[item.headName].mode = 'detailed';
        headGroups[item.headName].subItems.push({
          id: item.id,
          particular: item.particular,
          units: item.units,
          period: item.period,
          unitType: item.unitType,
          costPerUnit: item.costPerUnit,
          total: item.amount
        });
      }
    });

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const budgetData = {
      items: currentBudgetList,
      heads: Object.values(headGroups),
      summary: {
        subTotal: subTotal,
        overheadsPct: pct,
        overheadsAmount: overheadsAmount,
        totalEstimatedCost: grandTotal,
        status: 'Submitted',
        lastSaved: nowTime
      },
      totalEstimatedCost: grandTotal
    };

    Store.updateProjectBudgetDetails(pId, budgetData);

    const badge = document.getElementById('estimationStatusBadge');
    if (badge) {
      badge.style.background = '#f0fdf4';
      badge.style.color = '#15803d';
      badge.style.borderColor = '#bbf7d0';
      badge.innerHTML = `<i class="pi pi-check-circle" style="font-size: 11px;"></i> <span id="estimationStatusText">Submitted for Approval (${nowTime})</span>`;
    }

    window.closeSubmitModal();
    const projects = Store.getProjects();
    const p = projects.find(x => x.id === pId);
    showToast(`Budget Estimation for "${p?.name || pId}" submitted for approval (${formatRupees(grandTotal)})!`);
  };

  // Enter key support for fast punching
  ['entryCostPerUnit', 'entryUnits', 'entryPeriod', 'entryLumpSumAmount', 'entryLumpSumParticular'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.addBudgetEntryToList();
      }
    });
  });

  // Initial initialization
  initBudgetDeskControls();
  populateBudgetProjectSelect();
});
