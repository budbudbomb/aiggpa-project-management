/**
 * AIGGPA Project Management - Projects Portfolio & Single Project Audit Console
 * Shifted and adapted from ProjectsDashboard.tsx & CustomCharts.tsx
 */

(function () {
  'use strict';

  // Master Data Definitions
  const SCHEMES = [
    { id: 'sch-1', code: 'SCH-01', name: 'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis (AIGGPA)' },
    { id: 'sch-2', code: 'SCH-02', name: 'Viksit Madhya Pradesh 2047 Policy Formulation Grant' },
    { id: 'sch-3', code: 'SCH-03', name: 'M.P. State Planning Commission Special Research Studies' }
  ];

  const CENTERS = [
    { id: 'cat-1', code: 'CETI', name: 'Centre for Economy, Trade & Innovation' },
    { id: 'cat-2', code: 'CUG', name: 'Centre for Urban Governance' },
    { id: 'cat-3', code: 'CKMPT', name: 'Centre for Knowledge Management & Policy Transfer' },
    { id: 'cat-4', code: 'CHN', name: 'Centre for Health & Nutrition' },
    { id: 'cat-5', code: 'CSSD', name: 'Centre for Social Sector Development' }
  ];

  // Realistic mock proposals matching ProjectsDashboard.tsx
  const SEED_PROJECTS = [
    {
      id: 'PRJ-PROP-2025-001',
      proposalNumber: 'PRJ-PROP-2025-001',
      projectName: 'DPI-Based Open Networks for Human Capital in Viksit MP 2047',
      categoryId: 'cat-1',
      categoryName: 'Centre for Economy, Trade & Innovation (CETI)',
      schemeId: 'sch-1',
      schemeName: 'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
      financialYear: 'FY 2025-2026',
      status: 'Approved',
      durationValue: 12,
      durationUnit: 'Months',
      dateOfPrc: '2025-03-25',
      overheadsPercentage: 15,
      subTotal: 4500000,
      overheadsAmount: 675000,
      totalCost: 5175000,
      spent: 2400000,
      startMonthOffset: 0,
      team: { advisor: 1, ra: 2, fellow: 1, investigators: 4 },
      heads: [
        {
          id: 'head-1',
          headNumber: 1,
          particulars: 'Human Resources (HR & Research Personnel)',
          type: 'Detailed',
          headTotal: 3060000,
          spent: 1530000,
          subItems: [
            { id: 'sub-1-1', particulars: 'Lead Policy Fellow', units: 1, timePeriod: 12, timePeriodUnit: 'Months', costPerUnit: 125000, estimatedCost: 1500000, spent: 750000 },
            { id: 'sub-1-2', particulars: 'Senior Research Associate (RA)', units: 2, timePeriod: 12, timePeriodUnit: 'Months', costPerUnit: 65000, estimatedCost: 1560000, spent: 780000 }
          ]
        },
        {
          id: 'head-2',
          headNumber: 2,
          particulars: 'Travel Allowances & Field Mobility',
          type: 'Detailed',
          headTotal: 600000,
          spent: 450000,
          subItems: [
            { id: 'sub-2-1', particulars: 'District Consultation & Stakeholder Travel', units: 4, timePeriod: 6, timePeriodUnit: 'Trips', costPerUnit: 25000, estimatedCost: 600000, spent: 450000 }
          ]
        },
        {
          id: 'head-3',
          headNumber: 3,
          particulars: 'Workshops, Publications & Policy Dissemination',
          type: 'Lump Sum',
          headTotal: 840000,
          spent: 420000,
          subItems: []
        }
      ]
    },
    {
      id: 'PRJ-PROP-2025-002',
      proposalNumber: 'PRJ-PROP-2025-002',
      projectName: 'Urban Solid Waste & Sustainable Sanitation Roadmap for MP Municipalities',
      categoryId: 'cat-2',
      categoryName: 'Centre for Urban Governance (CUG)',
      schemeId: 'sch-2',
      schemeName: 'Viksit Madhya Pradesh 2047 Policy Formulation Grant',
      financialYear: 'FY 2025-2026',
      status: 'Draft',
      durationValue: 6,
      durationUnit: 'Months',
      dateOfPrc: '2025-04-02',
      overheadsPercentage: 15,
      subTotal: 1110000,
      overheadsAmount: 166500,
      totalCost: 1276500,
      spent: 0,
      startMonthOffset: 1,
      team: { advisor: 1, ra: 1, fellow: 1, investigators: 3 },
      heads: [
        {
          id: 'head-201',
          headNumber: 1,
          particulars: 'Urban Field Surveys & Sample Testing',
          type: 'Detailed',
          headTotal: 800000,
          spent: 0,
          subItems: [
            { id: 'sub-201-1', particulars: 'Sanitation Enumerators', units: 4, timePeriod: 4, timePeriodUnit: 'Months', costPerUnit: 30000, estimatedCost: 480000, spent: 0 }
          ]
        },
        {
          id: 'head-202',
          headNumber: 2,
          particulars: 'GIS Mapping & Logistics',
          type: 'Lump Sum',
          headTotal: 310000,
          spent: 0,
          subItems: []
        }
      ]
    },
    {
      id: 'PRJ-PROP-2025-003',
      proposalNumber: 'PRJ-PROP-2025-003',
      projectName: 'Direct Beneficiary Transfer (DBT) Leakage Audit & Policy Options',
      categoryId: 'cat-1',
      categoryName: 'Centre for Economy, Trade & Innovation (CETI)',
      schemeId: 'sch-1',
      schemeName: 'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
      financialYear: 'FY 2025-2026',
      status: 'Approved',
      durationValue: 9,
      durationUnit: 'Months',
      dateOfPrc: '2025-05-10',
      overheadsPercentage: 15,
      subTotal: 3000000,
      overheadsAmount: 450000,
      totalCost: 3450000,
      spent: 1800000,
      startMonthOffset: 2,
      team: { advisor: 1, ra: 2, fellow: 0, investigators: 5 },
      heads: [
        {
          id: 'head-301',
          headNumber: 1,
          particulars: 'Human Resources & Financial Auditors',
          type: 'Detailed',
          headTotal: 1800000,
          spent: 900000,
          subItems: [
            { id: 'sub-301-1', particulars: 'Technical Lead & Consultant', units: 1, timePeriod: 9, timePeriodUnit: 'Months', costPerUnit: 100000, estimatedCost: 900000, spent: 450000 },
            { id: 'sub-301-2', particulars: 'Statistical Data Analyst', units: 1, timePeriod: 9, timePeriodUnit: 'Months', costPerUnit: 100000, estimatedCost: 900000, spent: 450000 }
          ]
        },
        {
          id: 'head-302',
          headNumber: 2,
          particulars: 'Field Sample Verification & Travel',
          type: 'Detailed',
          headTotal: 1200000,
          spent: 900000,
          subItems: [
            { id: 'sub-302-1', particulars: 'District Audit Mobility', units: 6, timePeriod: 4, timePeriodUnit: 'Trips', costPerUnit: 50000, estimatedCost: 1200000, spent: 900000 }
          ]
        }
      ]
    },
    {
      id: 'PRJ-PROP-2025-004',
      proposalNumber: 'PRJ-PROP-2025-004',
      projectName: 'AIGGPA Nutrition Tracker in Tribal Districts',
      categoryId: 'cat-4',
      categoryName: 'Centre for Health & Nutrition (CHN)',
      schemeId: 'sch-2',
      schemeName: 'Viksit Madhya Pradesh 2047 Policy Formulation Grant',
      financialYear: 'FY 2025-2026',
      status: 'Approved',
      durationValue: 8,
      durationUnit: 'Months',
      dateOfPrc: '2025-04-15',
      overheadsPercentage: 10,
      subTotal: 4000000,
      overheadsAmount: 400000,
      totalCost: 4400000,
      spent: 4800000, // OVER BUDGET INTENTIONALLY
      startMonthOffset: 0,
      team: { advisor: 1, ra: 2, fellow: 1, investigators: 10 },
      heads: [
        {
          id: 'head-401',
          headNumber: 1,
          particulars: 'Field Enumerators & Nutritionists',
          type: 'Detailed',
          headTotal: 2000000,
          spent: 2400000, // Over budget head
          subItems: [
            { id: 'sub-401-1', particulars: 'Survey Honorarium for Field Teams', units: 10, timePeriod: 8, timePeriodUnit: 'Months', costPerUnit: 25000, estimatedCost: 2000000, spent: 2400000 }
          ]
        },
        {
          id: 'head-402',
          headNumber: 2,
          particulars: 'Boarding & Rural Mobility',
          type: 'Detailed',
          headTotal: 1000000,
          spent: 1400000, // Over budget head
          subItems: [
            { id: 'sub-402-1', particulars: 'Camp Stay & Remote Mobility Vehicles', units: 10, timePeriod: 8, timePeriodUnit: 'Months', costPerUnit: 12500, estimatedCost: 1000000, spent: 1400000 }
          ]
        },
        {
          id: 'head-403',
          headNumber: 3,
          particulars: 'Equipment & Medical Test Kits',
          type: 'Lump Sum',
          headTotal: 1000000,
          spent: 1000000,
          subItems: []
        }
      ]
    },
    {
      id: 'PRJ-PROP-2025-005',
      proposalNumber: 'PRJ-PROP-2025-005',
      projectName: 'CMYIP Fellowship Impact Assessment Study',
      categoryId: 'cat-5',
      categoryName: 'Centre for Social Sector Development (CSSD)',
      schemeId: 'sch-1',
      schemeName: 'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
      financialYear: 'FY 2025-2026',
      status: 'Closed',
      durationValue: 6,
      durationUnit: 'Months',
      dateOfPrc: '2025-03-12',
      overheadsPercentage: 15,
      subTotal: 2000000,
      overheadsAmount: 300000,
      totalCost: 2300000,
      spent: 2250000,
      startMonthOffset: 1,
      team: { advisor: 1, ra: 1, fellow: 1, investigators: 4 },
      heads: [
        {
          id: 'head-501',
          headNumber: 1,
          particulars: 'Fellowship Review Panel & Research',
          type: 'Detailed',
          headTotal: 1500000,
          spent: 1480000,
          subItems: [
            { id: 'sub-501-1', particulars: 'Principal Researcher', units: 1, timePeriod: 6, timePeriodUnit: 'Months', costPerUnit: 125000, estimatedCost: 750000, spent: 750000 },
            { id: 'sub-501-2', particulars: 'Research Associate', units: 2, timePeriod: 6, timePeriodUnit: 'Months', costPerUnit: 62500, estimatedCost: 750000, spent: 730000 }
          ]
        },
        {
          id: 'head-502',
          headNumber: 2,
          particulars: 'Report Printing & State Level Workshop',
          type: 'Lump Sum',
          headTotal: 500000,
          spent: 470000,
          subItems: []
        }
      ]
    },
    {
      id: 'PRJ-PROP-2025-006',
      proposalNumber: 'PRJ-PROP-2025-006',
      projectName: 'Smart City Transport Optimization Model',
      categoryId: 'cat-2',
      categoryName: 'Centre for Urban Governance (CUG)',
      schemeId: 'sch-2',
      schemeName: 'Viksit Madhya Pradesh 2047 Policy Formulation Grant',
      financialYear: 'FY 2025-2026',
      status: 'Approved',
      durationValue: 12,
      durationUnit: 'Months',
      dateOfPrc: '2025-06-01',
      overheadsPercentage: 12,
      subTotal: 5000000,
      overheadsAmount: 600000,
      totalCost: 5600000,
      spent: 3100000,
      startMonthOffset: 3,
      team: { advisor: 1, ra: 2, fellow: 2, investigators: 6 },
      heads: [
        {
          id: 'head-601',
          headNumber: 1,
          particulars: 'Traffic Data Collection & Sensors',
          type: 'Detailed',
          headTotal: 3000000,
          spent: 1900000,
          subItems: [
            { id: 'sub-601-1', particulars: 'IoT Deployment Engineers', units: 2, timePeriod: 12, timePeriodUnit: 'Months', costPerUnit: 75000, estimatedCost: 1800000, spent: 1100000 },
            { id: 'sub-601-2', particulars: 'Field Traffic Surveyors', units: 4, timePeriod: 6, timePeriodUnit: 'Months', costPerUnit: 50000, estimatedCost: 1200000, spent: 800000 }
          ]
        },
        {
          id: 'head-602',
          headNumber: 2,
          particulars: 'Cloud Computing & AI Simulation Software',
          type: 'Lump Sum',
          headTotal: 2000000,
          spent: 1200000,
          subItems: []
        }
      ]
    }
  ];

  // Double-Entry Ledger Vouchers for Drilldown
  const SAMPLE_VOUCHERS = [
    {
      id: 'v-1',
      voucherNumber: 'VOU-2025-0041',
      voucherDate: '2025-05-14',
      voucherType: 'Payment Voucher',
      schemeId: 'sch-1',
      ledgerName: 'Lead Policy Fellow Honorarium',
      narration: 'Disbursement of Monthly Honorarium for Lead Policy Fellow (CETI DPI Network)',
      totalAmount: 125000
    },
    {
      id: 'v-2',
      voucherNumber: 'VOU-2025-0062',
      voucherDate: '2025-06-18',
      voucherType: 'Payment Voucher',
      schemeId: 'sch-1',
      ledgerName: 'Senior Research Associate (RA)',
      narration: 'Honorarium disbursement for Senior Research Associates for May & June',
      totalAmount: 260000
    },
    {
      id: 'v-3',
      voucherNumber: 'VOU-2025-0089',
      voucherDate: '2025-07-22',
      voucherType: 'Journal Voucher',
      schemeId: 'sch-1',
      ledgerName: 'District Consultation & Stakeholder Travel',
      narration: 'Vehicle hire & fuel reimbursements for tribal district outreach',
      totalAmount: 150000
    },
    {
      id: 'v-4',
      voucherNumber: 'VOU-2025-0104',
      voucherDate: '2025-08-11',
      voucherType: 'Payment Voucher',
      schemeId: 'sch-2',
      ledgerName: 'Survey Honorarium for Field Teams',
      narration: 'Honorarium paid to 10 tribal enumerators across Mandla & Dindori districts',
      totalAmount: 480000
    },
    {
      id: 'v-5',
      voucherNumber: 'VOU-2025-0130',
      voucherDate: '2025-09-05',
      voucherType: 'Payment Voucher',
      schemeId: 'sch-2',
      ledgerName: 'Camp Stay & Remote Mobility Vehicles',
      narration: 'Field mobilization and camp stay arrangements in tribal blocks',
      totalAmount: 320000
    }
  ];

  // Helper function to format INR currency in Lakhs/Crores
  function formatINR(val, inLakhs = true) {
    if (val === undefined || val === null || isNaN(val)) return '₹0';
    if (inLakhs) {
      if (Math.abs(val) >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
      if (val === 0) return '₹0';
    }
    return '₹' + Number(val).toLocaleString('en-IN');
  }

  // Application State
  const State = {
    selectedProject: 'All', // 'All' = Portfolio, or project ID
    selectedScheme: 'All',
    selectedCenter: 'All',
    selectedStatus: 'All',
    projectSearch: '',
    activeKpi: null, // Expanded KPI accordion id
    dumbbellMode: 'chart', // 'chart' or 'table'
    headwiseMode: 'chart',
    projectDrilldown: null, // { headId, headName, subHeadId, subHeadName }
    selectedChartPeriod: null, // e.g. 'Month 2'

    // Get active projects (merges Store with SEED_PROJECTS)
    getAllProjects: function () {
      let storeProjects = [];
      if (typeof Store !== 'undefined' && Store.getProjects) {
        storeProjects = Store.getProjects();
      }

      // Start with SEED_PROJECTS
      const map = new Map();
      SEED_PROJECTS.forEach(p => map.set(p.id, { ...p }));

      // Merge user-created projects from store
      storeProjects.forEach(sp => {
        const id = sp.code || sp.id;
        const total = sp.budgetSanctioned || sp.budgetSummary?.totalEstimatedCost || 2000000;
        const spent = sp.budgetUtilized || (total * 0.4);
        const subTotal = sp.budgetSummary?.subTotal || (total * 0.85);
        const overheads = sp.budgetSummary?.overheadsAmount || (total * 0.15);

        // Convert store heads to matching schema
        const heads = (sp.budgetHeads || []).map((bh, idx) => ({
          id: bh.id || `bh-${idx}`,
          headNumber: idx + 1,
          particulars: bh.name,
          type: bh.mode === 'detailed' ? 'Detailed' : 'Lump Sum',
          headTotal: bh.mode === 'lumpSum' ? (bh.lumpSumAmount || 0) : (bh.subItems || []).reduce((s, it) => s + (it.total || 0), 0),
          spent: (bh.subItems || []).reduce((s, it) => s + ((it.total || 0) * 0.45), 0),
          subItems: (bh.subItems || []).map(si => ({
            id: si.id,
            particulars: si.particular,
            units: si.units || 1,
            timePeriod: si.period || 6,
            timePeriodUnit: si.unitType || 'Months',
            costPerUnit: si.costPerUnit || 50000,
            estimatedCost: si.total || (si.units * si.period * si.costPerUnit),
            spent: (si.total || 0) * 0.45
          }))
        }));

        map.set(id, {
          id: id,
          proposalNumber: sp.code || id,
          projectName: sp.name,
          categoryId: 'cat-1',
          categoryName: sp.nature || 'AIGGPA Special Research Studies',
          schemeId: sp.scheme?.includes('SCH-02') ? 'sch-2' : (sp.scheme?.includes('SCH-03') ? 'sch-3' : 'sch-1'),
          schemeName: sp.scheme || 'Atal Bihari Vajpayee Institute of Good Governance and Policy Analysis',
          financialYear: sp.financialYear || 'FY 2025-2026',
          status: sp.status === 'Active' ? 'Approved' : (sp.status || 'Approved'),
          durationValue: sp.durationMonths || 12,
          durationUnit: 'Months',
          dateOfPrc: sp.prcDate || '2025-05-15',
          overheadsPercentage: 15,
          subTotal: subTotal,
          overheadsAmount: overheads,
          totalCost: total,
          spent: spent,
          startMonthOffset: 0,
          team: sp.team || { advisor: 1, ra: 1, fellow: 1, investigators: 4 },
          heads: heads.length ? heads : [
            {
              id: 'bh-def-1',
              headNumber: 1,
              particulars: 'Human Resources (HR Personnel)',
              type: 'Detailed',
              headTotal: total * 0.6,
              spent: spent * 0.6,
              subItems: [
                { id: 'sub-def-1', particulars: 'Lead Policy Fellow', units: 1, timePeriod: 12, timePeriodUnit: 'Months', costPerUnit: 100000, estimatedCost: total * 0.6, spent: spent * 0.6 }
              ]
            }
          ]
        });
      });

      return Array.from(map.values());
    },

    // Filter projects based on current filter state
    getFilteredProjects: function () {
      const all = this.getAllProjects();
      const q = this.projectSearch.toLowerCase().trim();

      return all.filter(p => {
        if (q && !p.projectName.toLowerCase().includes(q) && !p.proposalNumber.toLowerCase().includes(q)) {
          return false;
        }
        if (this.selectedScheme !== 'All' && p.schemeId !== this.selectedScheme) {
          return false;
        }
        if (this.selectedCenter !== 'All' && p.categoryId !== this.selectedCenter) {
          return false;
        }
        if (this.selectedStatus !== 'All' && p.status !== this.selectedStatus) {
          return false;
        }
        return true;
      });
    },

    // Get Active Project details if in single-project mode
    getActiveProject: function () {
      if (this.selectedProject === 'All') return null;
      return this.getAllProjects().find(p => p.id === this.selectedProject) || null;
    }
  };

  // Main UI Controller
  const UI = {
    init: function () {
      this.bindSidebarAndTopNav();
      this.populateFilterDropdowns();
      this.bindFilterEvents();
      this.render();
    },

    bindSidebarAndTopNav: function () {
      // Sidebar Collapse Trigger
      const collapseTrigger = document.getElementById('sidebarCollapseTrigger');
      const sidebarBrandIcon = document.getElementById('sidebarBrandIcon');
      const toggleSidebar = () => {
        const isCollapsed = document.documentElement.classList.toggle('sidebar-collapsed');
        localStorage.setItem('aiggpa_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      };
      if (collapseTrigger) collapseTrigger.addEventListener('click', toggleSidebar);
      if (sidebarBrandIcon) sidebarBrandIcon.addEventListener('click', toggleSidebar);

      // Mobile Toggle
      const toggleBtn = document.getElementById('sidebarToggleBtn');
      const sidebar = document.getElementById('mainSidebar');
      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
      }

      // Top User Dropdown
      const userDropBtn = document.getElementById('topUserDropdownBtn');
      const userDropMenu = document.getElementById('topUserDropdownMenu');
      if (userDropBtn && userDropMenu) {
        userDropBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          userDropMenu.style.display = userDropMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', () => {
          userDropMenu.style.display = 'none';
        });
      }
    },

    populateFilterDropdowns: function () {
      const allProjects = State.getAllProjects();

      // Target Project Dropdown
      const projectSelect = document.getElementById('filterTargetProject');
      if (projectSelect) {
        projectSelect.innerHTML = `<option value="All">All Projects (Portfolio View)</option>` +
          allProjects.map(p => `<option value="${p.id}" ${p.id === State.selectedProject ? 'selected' : ''}>${p.proposalNumber} - ${p.projectName}</option>`).join('');
      }

      // Government Scheme Dropdown
      const schemeSelect = document.getElementById('filterGovernmentScheme');
      if (schemeSelect) {
        schemeSelect.innerHTML = `<option value="All">All Schemes (Institutional)</option>` +
          SCHEMES.map(s => `<option value="${s.id}" ${s.id === State.selectedScheme ? 'selected' : ''}>${s.code} - ${s.name}</option>`).join('');
      }

      // Research Center Dropdown
      const centerSelect = document.getElementById('filterResearchCenter');
      if (centerSelect) {
        centerSelect.innerHTML = `<option value="All">All Centers (Institutional)</option>` +
          CENTERS.map(c => `<option value="${c.id}" ${c.id === State.selectedCenter ? 'selected' : ''}>${c.code} - ${c.name}</option>`).join('');
      }
    },

    bindFilterEvents: function () {
      // Search Box
      const searchInput = document.getElementById('filterProjectSearch');
      const clearSearchBtn = document.getElementById('filterClearSearchBtn');

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          State.projectSearch = e.target.value;
          if (clearSearchBtn) clearSearchBtn.style.display = State.projectSearch ? 'flex' : 'none';
          this.render();
        });
      }

      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          State.projectSearch = '';
          if (searchInput) searchInput.value = '';
          clearSearchBtn.style.display = 'none';
          this.render();
        });
      }

      // Target Project Select
      const projectSelect = document.getElementById('filterTargetProject');
      if (projectSelect) {
        projectSelect.addEventListener('change', (e) => {
          State.selectedProject = e.target.value;
          State.projectDrilldown = null;
          State.selectedChartPeriod = null;
          State.activeKpi = null;
          this.render();
        });
      }

      // Scheme Select
      const schemeSelect = document.getElementById('filterGovernmentScheme');
      if (schemeSelect) {
        schemeSelect.addEventListener('change', (e) => {
          State.selectedScheme = e.target.value;
          this.render();
        });
      }

      // Center Select
      const centerSelect = document.getElementById('filterResearchCenter');
      if (centerSelect) {
        centerSelect.addEventListener('change', (e) => {
          State.selectedCenter = e.target.value;
          this.render();
        });
      }

      // Reset Filters Button
      const resetBtn = document.getElementById('dashResetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          State.selectedProject = 'All';
          State.selectedScheme = 'All';
          State.selectedCenter = 'All';
          State.selectedStatus = 'All';
          State.projectSearch = '';
          State.activeKpi = null;
          State.projectDrilldown = null;
          State.selectedChartPeriod = null;

          if (searchInput) searchInput.value = '';
          if (clearSearchBtn) clearSearchBtn.style.display = 'none';
          this.populateFilterDropdowns();
          this.render();
        });
      }
    },

    render: function () {
      const isPortfolio = State.selectedProject === 'All';
      const activeProject = State.getActiveProject();

      this.renderBreadcrumbs(isPortfolio, activeProject);
      this.renderBannerHeader(isPortfolio, activeProject);

      const portfolioContainer = document.getElementById('portfolioViewContainer');
      const singleProjectContainer = document.getElementById('singleProjectViewContainer');

      if (isPortfolio) {
        if (portfolioContainer) portfolioContainer.style.display = 'block';
        if (singleProjectContainer) singleProjectContainer.style.display = 'none';
        this.renderPortfolioView();
      } else {
        if (portfolioContainer) portfolioContainer.style.display = 'none';
        if (singleProjectContainer) singleProjectContainer.style.display = 'block';
        this.renderSingleProjectView(activeProject);
      }
    },

    renderBreadcrumbs: function (isPortfolio, activeProject) {
      const container = document.getElementById('dashBreadcrumbs');
      if (!container) return;

      if (isPortfolio) {
        container.innerHTML = `
          <a href="dashboard.html">Dashboard</a>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">Projects Portfolio Control Board</span>
        `;
      } else {
        let breadcrumbHTML = `
          <a href="javascript:void(0)" id="bcPortfolioLink">Projects Portfolio</a>
          <span class="crumb-sep">/</span>
          <a href="javascript:void(0)" id="bcProjectRootLink">${activeProject ? activeProject.projectName : 'Project'}</a>
        `;

        if (State.projectDrilldown) {
          breadcrumbHTML += `
            <span class="crumb-sep">/</span>
            <a href="javascript:void(0)" id="bcHeadLink">Head: ${State.projectDrilldown.headName}</a>
          `;
          if (State.projectDrilldown.subHeadName) {
            breadcrumbHTML += `
              <span class="crumb-sep">/</span>
              <span class="crumb-current">Sub-head: ${State.projectDrilldown.subHeadName}</span>
            `;
          }
        }

        if (State.selectedChartPeriod) {
          breadcrumbHTML += `
            <span class="crumb-sep">/</span>
            <span class="crumb-current">Period: ${State.selectedChartPeriod}</span>
          `;
        }

        container.innerHTML = breadcrumbHTML;

        // Bind breadcrumb clicks
        const bcPortfolio = document.getElementById('bcPortfolioLink');
        if (bcPortfolio) {
          bcPortfolio.addEventListener('click', () => {
            State.selectedProject = 'All';
            State.projectDrilldown = null;
            State.selectedChartPeriod = null;
            const sel = document.getElementById('filterTargetProject');
            if (sel) sel.value = 'All';
            UI.render();
          });
        }

        const bcProjectRoot = document.getElementById('bcProjectRootLink');
        if (bcProjectRoot) {
          bcProjectRoot.addEventListener('click', () => {
            State.projectDrilldown = null;
            State.selectedChartPeriod = null;
            UI.render();
          });
        }

        const bcHead = document.getElementById('bcHeadLink');
        if (bcHead && State.projectDrilldown) {
          bcHead.addEventListener('click', () => {
            State.projectDrilldown = {
              headId: State.projectDrilldown.headId,
              headName: State.projectDrilldown.headName
            };
            UI.render();
          });
        }
      }
    },

    renderBannerHeader: function (isPortfolio, activeProject) {
      const bannerTitle = document.getElementById('dashBannerTitle');
      const bannerDesc = document.getElementById('dashBannerDesc');
      const bannerIcon = document.getElementById('dashBannerIcon');

      if (isPortfolio) {
        if (bannerTitle) bannerTitle.textContent = 'Projects Portfolio Control Board';
        if (bannerDesc) bannerDesc.textContent = 'Cross-scheme portfolio analysis, approval funnels, and Gantt charts.';
        if (bannerIcon) bannerIcon.className = 'pi pi-folder-open';
      } else {
        if (bannerTitle) bannerTitle.textContent = 'Single Project Audit Console';
        if (bannerDesc) bannerDesc.textContent = 'Real-time burn rates, detailed head-wise allocations, and voucher tracing.';
        if (bannerIcon) bannerIcon.className = 'pi pi-shield';
      }
    },

    // ==========================================
    // PORTFOLIO VIEW RENDERER
    // ==========================================
    renderPortfolioView: function () {
      const projects = State.getFilteredProjects();

      // Calculations
      const totalCount = projects.length;
      const completeCount = projects.filter(p => p.status === 'Closed').length;
      const activeCount = projects.filter(p => p.status === 'Approved').length;
      const approvedBudgetSum = projects.reduce((sum, p) => sum + p.totalCost, 0);
      const spentBudgetSum = projects.reduce((sum, p) => sum + p.spent, 0);
      const remainingSum = Math.max(0, approvedBudgetSum - spentBudgetSum);
      const overBudgetList = projects.filter(p => p.spent > p.totalCost);
      const avgRate = approvedBudgetSum > 0 ? Math.round((spentBudgetSum / approvedBudgetSum) * 100) : 0;
      const overheadsSum = projects.reduce((sum, p) => sum + (p.overheadsAmount || 0), 0);

      // Render 7 KPI Cards
      this.renderPortfolioKPIs({
        totalCount,
        completeCount,
        activeCount,
        approvedBudgetSum,
        spentBudgetSum,
        remainingSum,
        overBudgetList,
        avgRate,
        overheadsSum
      });

      // Render KPI Accordion if active
      this.renderKPIAccordion(projects, {
        totalCount,
        completeCount,
        activeCount,
        approvedBudgetSum,
        spentBudgetSum,
        remainingSum,
        overBudgetList,
        avgRate,
        overheadsSum
      });

      // Render Dumbbell Chart
      this.renderDumbbellChart(projects);

      // Render Funnel Chart
      this.renderFunnelChart(projects);

      // Render Center Stacked Bar Chart
      this.renderCenterStackedBarChart(projects);

      // Render Outlay Burn Rate Area Chart
      this.renderCumulativeBurnRateChart(projects, approvedBudgetSum, spentBudgetSum);

      // Render Gantt Schedule Chart
      this.renderGanttChart(projects);

      // Render Projects Master Table
      this.renderProjectsTable(projects);
    },

    renderPortfolioKPIs: function (stats) {
      const container = document.getElementById('portfolio7KpiGrid');
      if (!container) return;

      const kpis = [
        {
          id: 'projects',
          label: 'Total Projects',
          value: stats.totalCount,
          sub: 'Scope-filtered',
          icon: 'pi pi-folder-open',
          iconClass: 'icon-blue',
          activeClass: 'active'
        },
        {
          id: 'complete',
          label: 'Completed',
          value: stats.completeCount,
          sub: 'Closed & audited',
          icon: 'pi pi-check-circle',
          iconClass: 'icon-emerald',
          activeClass: 'active-emerald'
        },
        {
          id: 'inprogress',
          label: 'In Progress',
          value: stats.activeCount,
          sub: 'PRC Active',
          icon: 'pi pi-clock',
          iconClass: 'icon-amber',
          activeClass: 'active-amber'
        },
        {
          id: 'budgetBreakdown',
          label: 'Approved Budget',
          value: formatINR(stats.approvedBudgetSum),
          sub: `Rem: ${formatINR(stats.remainingSum)}`,
          icon: 'pi pi-indian-rupee',
          iconClass: 'icon-blue',
          activeClass: 'active'
        },
        {
          id: 'overbudget',
          label: 'Over Budget',
          value: stats.overBudgetList.length,
          sub: 'Cost overrun alert',
          icon: 'pi pi-exclamation-triangle',
          iconClass: 'icon-rose',
          activeClass: 'active-rose'
        },
        {
          id: 'utilizationRate',
          label: 'Avg Util %',
          value: `${stats.avgRate}%`,
          sub: 'Burn velocity',
          icon: 'pi pi-percentage',
          iconClass: 'icon-teal',
          activeClass: 'active-teal'
        },
        {
          id: 'overheads',
          label: 'Overheads',
          value: formatINR(stats.overheadsSum),
          sub: 'Margin (10-15%)',
          icon: 'pi pi-chart-pie',
          iconClass: 'icon-indigo',
          activeClass: 'active'
        }
      ];

      container.innerHTML = kpis.map(kpi => {
        const isActive = State.activeKpi === kpi.id;
        return `
          <div class="dash-kpi-card ${isActive ? kpi.activeClass : ''}" data-kpi-id="${kpi.id}">
            <div class="dash-kpi-top">
              <span class="dash-kpi-label">${kpi.label}</span>
              <div class="dash-kpi-icon-wrap ${kpi.iconClass}">
                <i class="${kpi.icon}"></i>
              </div>
            </div>
            <div>
              <div class="dash-kpi-value">${kpi.value}</div>
              <div class="dash-kpi-sub">${kpi.sub}</div>
            </div>
            <div class="dash-kpi-toggle-indicator">
              <i class="pi pi-chevron-down"></i>
            </div>
          </div>
        `;
      }).join('');

      // Add click listeners to toggle KPI detail accordion
      container.querySelectorAll('.dash-kpi-card').forEach(card => {
        card.addEventListener('click', () => {
          const kpiId = card.getAttribute('data-kpi-id');
          State.activeKpi = State.activeKpi === kpiId ? null : kpiId;
          UI.render();
        });
      });
    },

    renderKPIAccordion: function (projects, stats) {
      const container = document.getElementById('dashKpiAccordionContainer');
      if (!container) return;

      if (!State.activeKpi) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
      }

      container.style.display = 'block';
      let contentHTML = '';

      switch (State.activeKpi) {
        case 'projects':
          contentHTML = `
            <div class="overflow-x-auto">
              <table class="dash-data-table">
                <thead>
                  <tr>
                    <th>Proposal No</th>
                    <th>Project Name</th>
                    <th>Research Block</th>
                    <th>Status</th>
                    <th style="text-align: right;">Cost Outlay</th>
                  </tr>
                </thead>
                <tbody>
                  ${projects.map(p => `
                    <tr>
                      <td style="font-family: monospace; font-weight: 800;">${p.proposalNumber}</td>
                      <td>
                        <a href="javascript:void(0)" class="act-proj-link" data-proj-id="${p.id}" style="color: #2563eb; text-decoration: none; font-weight: 750;">
                          ${p.projectName}
                        </a>
                      </td>
                      <td style="color: #64748b;">${p.categoryName}</td>
                      <td>
                        <span class="badge ${p.status === 'Closed' ? 'badge-slate' : 'badge-emerald'}" style="padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 750; background: ${p.status === 'Closed' ? '#f1f5f9' : '#ecfdf5'}; color: ${p.status === 'Closed' ? '#475569' : '#059669'};">
                          ${p.status}
                        </span>
                      </td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800;">${formatINR(p.totalCost, false)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
          break;

        case 'complete':
          const closed = projects.filter(p => p.status === 'Closed');
          contentHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;">
              ${closed.length ? closed.map(p => `
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-size: 0.68rem; font-weight: 800; color: #94a3b8; font-family: monospace;">${p.proposalNumber}</span>
                    <h4 style="font-size: 0.85rem; font-weight: 800; color: #1e293b; margin-top: 3px;">${p.projectName}</h4>
                    <p style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">${p.categoryName}</p>
                  </div>
                  <span style="background: #f1f5f9; color: #475569; font-size: 0.68rem; font-weight: 800; padding: 4px 8px; border-radius: 6px;">CLOSED</span>
                </div>
              `).join('') : '<p style="color: #94a3b8; padding: 12px;">No closed projects in scope.</p>'}
            </div>
          `;
          break;

        case 'inprogress':
          const inprog = projects.filter(p => p.status === 'Approved');
          contentHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;">
              ${inprog.map(p => `
                <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-size: 0.68rem; font-weight: 800; color: #94a3b8; font-family: monospace;">${p.proposalNumber}</span>
                    <h4 style="font-size: 0.85rem; font-weight: 800; color: #1e293b; margin-top: 3px;">${p.projectName}</h4>
                    <p style="font-size: 0.72rem; color: #059669; margin-top: 2px; font-weight: 700;">PRC Date: ${p.dateOfPrc}</p>
                  </div>
                  <span style="background: #ecfdf5; color: #059669; font-size: 0.68rem; font-weight: 800; padding: 4px 8px; border-radius: 6px;">ACTIVE</span>
                </div>
              `).join('')}
            </div>
          `;
          break;

        case 'budgetBreakdown':
          contentHTML = `
            <div class="overflow-x-auto">
              <table class="dash-data-table">
                <thead>
                  <tr>
                    <th>Project Title</th>
                    <th style="text-align: right;">Sanctioned Outlay</th>
                    <th style="text-align: right;">Utilized Cost</th>
                    <th style="text-align: right;">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody>
                  ${projects.map(p => `
                    <tr>
                      <td>
                        <a href="javascript:void(0)" class="act-proj-link" data-proj-id="${p.id}" style="color: #2563eb; text-decoration: none; font-weight: 750;">
                          ${p.projectName}
                        </a>
                      </td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800;">${formatINR(p.totalCost, false)}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800; color: #059669;">${formatINR(p.spent, false)}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800; color: #2563eb;">${formatINR(Math.max(0, p.totalCost - p.spent), false)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
          break;

        case 'overbudget':
          contentHTML = `
            <div style="background: #ffffff; border: 1.5px solid #fecaca; border-radius: 12px; padding: 14px;">
              <div style="font-size: 0.8rem; font-weight: 800; color: #dc2626; display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
                <i class="pi pi-exclamation-triangle"></i>
                <span>The following projects have exceeded their sanctioned budget outlays:</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${stats.overBudgetList.map(p => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; font-size: 0.78rem;">
                    <span style="font-weight: 800; color: #0f172a;">${p.projectName}</span>
                    <span style="color: #dc2626; font-weight: 800; font-family: monospace;">Exceeded by ${formatINR(p.spent - p.totalCost, false)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          break;

        case 'utilizationRate':
          contentHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
              ${projects.map(p => {
                const rate = p.totalCost > 0 ? Math.round((p.spent / p.totalCost) * 100) : 0;
                const isOver = rate > 100;
                return `
                  <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px;">
                    <div style="font-size: 0.78rem; font-weight: 750; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.projectName}</div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; font-size: 0.78rem;">
                      <span style="font-weight: 800; font-family: monospace; color: ${isOver ? '#dc2626' : '#059669'};">${rate}% Burn</span>
                      <div style="width: 140px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(100, rate)}%; background: ${isOver ? '#ef4444' : '#10b981'}; border-radius: 4px;"></div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
          break;

        case 'overheads':
          contentHTML = `
            <div class="overflow-x-auto">
              <table class="dash-data-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th style="text-align: right;">Sanctioned Outlay</th>
                    <th style="text-align: right;">Overheads Margin</th>
                    <th style="text-align: right;">Overheads Sum</th>
                  </tr>
                </thead>
                <tbody>
                  ${projects.map(p => `
                    <tr>
                      <td style="font-weight: 750;">${p.projectName}</td>
                      <td style="text-align: right; font-family: monospace;">${formatINR(p.totalCost, false)}</td>
                      <td style="text-align: right; font-weight: 800; font-family: monospace;">${p.overheadsPercentage}%</td>
                      <td style="text-align: right; font-weight: 800; font-family: monospace; color: #2563eb;">${formatINR(p.overheadsAmount || 0, false)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
          break;
      }

      container.innerHTML = `
        <div class="dash-kpi-accordion">
          <div class="dash-accordion-top">
            <span class="dash-accordion-title">Detailed Break-up for Selected Metric</span>
            <button class="dash-accordion-close-btn" id="dashCloseKpiAccordionBtn">
              <i class="pi pi-times"></i>
              <span>Close Details</span>
            </button>
          </div>
          ${contentHTML}
        </div>
      `;

      // Bind close button
      const closeBtn = document.getElementById('dashCloseKpiAccordionBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          State.activeKpi = null;
          UI.render();
        });
      }

      // Bind project row click to open single project view
      container.querySelectorAll('.act-proj-link').forEach(link => {
        link.addEventListener('click', () => {
          const id = link.getAttribute('data-proj-id');
          State.selectedProject = id;
          State.activeKpi = null;
          const sel = document.getElementById('filterTargetProject');
          if (sel) sel.value = id;
          UI.render();
        });
      });
    },

    // ==========================================
    // DUMBBELL CHART (Budget vs Actual)
    // ==========================================
    renderDumbbellChart: function (projects) {
      const card = document.getElementById('dumbbellChartCard');
      if (!card) return;

      const sorted = [...projects].map(p => ({
        id: p.id,
        name: p.projectName,
        approved: p.totalCost,
        utilized: p.spent,
        variance: p.totalCost - p.spent
      })).sort((a, b) => a.variance - b.variance);

      // Max value for scale
      const maxVal = Math.max(...sorted.flatMap(d => [d.approved, d.utilized]), 100000);

      // Ruler ticks
      const ticks = [
        { pct: 0, val: 0 },
        { pct: 25, val: maxVal * 0.25 },
        { pct: 50, val: maxVal * 0.5 },
        { pct: 75, val: maxVal * 0.75 },
        { pct: 100, val: maxVal }
      ];

      const headerHTML = `
        <div class="dash-chart-header">
          <div class="dash-chart-header-left">
            <div class="dash-chart-icon-box">
              <i class="pi pi-chart-bar"></i>
            </div>
            <div>
              <h3 class="dash-chart-title">Budget vs Actual by Project</h3>
              <p class="dash-chart-subtitle">Sorted by variance. Most overdrawn sits at the top. Click row to open.</p>
            </div>
          </div>
          <div class="dash-chart-tools">
            <div class="dash-chart-legend-strip" style="margin-right: 8px;">
              <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#10b981;"></span>Approved</span>
              <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#2563eb;"></span>Utilized</span>
            </div>
            <button class="dash-view-toggle-btn ${State.dumbbellMode === 'table' ? 'active' : ''}" id="dumbbellToggleBtn">
              ${State.dumbbellMode === 'chart' ? 'Table' : 'Chart'}
            </button>
          </div>
        </div>
      `;

      if (State.dumbbellMode === 'table') {
        card.innerHTML = headerHTML + `
          <div class="overflow-x-auto">
            <table class="dash-data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th style="text-align: right;">Sanctioned Outlay</th>
                  <th style="text-align: right;">Utilized Spent</th>
                  <th style="text-align: right;">Variance / %</th>
                </tr>
              </thead>
              <tbody>
                ${sorted.map(row => {
                  const pct = row.approved > 0 ? Math.round((row.utilized / row.approved) * 100) : 0;
                  const isOver = row.utilized > row.approved;
                  return `
                    <tr class="dumbbell-row-click" data-id="${row.id}" style="cursor: pointer;">
                      <td style="font-weight: 750; color: #1e293b;">${row.name}</td>
                      <td style="text-align: right; font-family: monospace;">${formatINR(row.approved)}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800; color: ${isOver ? '#dc2626' : '#2563eb'};">${formatINR(row.utilized)}</td>
                      <td style="text-align: right; font-weight: 800; color: ${isOver ? '#dc2626' : '#059669'};">${isOver ? `${pct}% over` : `${pct}%`}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else {
        const rowsHTML = sorted.map(row => {
          const isOver = row.utilized > row.approved;
          const pct = row.approved > 0 ? Math.round((row.utilized / row.approved) * 100) : 0;
          const approvedPct = Math.min(100, Math.max(0, (row.approved / maxVal) * 100));
          const utilizedPct = Math.min(100, Math.max(0, (row.utilized / maxVal) * 100));
          const leftEdge = Math.min(approvedPct, utilizedPct);
          const rightEdge = Math.max(approvedPct, utilizedPct);
          const lineWidth = Math.max(2, rightEdge - leftEdge);

          return `
            <div class="dumbbell-row dumbbell-row-click" data-id="${row.id}">
              <div class="dumbbell-row-title-col">
                <span class="dumbbell-row-title" title="${row.name}">${row.name}</span>
              </div>
              <div class="dumbbell-row-track-col">
                <div class="dumbbell-base-line"></div>
                <div class="dumbbell-range-bar ${isOver ? 'over' : 'normal'}" style="left: ${leftEdge}%; width: ${lineWidth}%;"></div>
                <div class="dumbbell-dot dot-approved" style="left: ${approvedPct}%;" title="Approved: ${formatINR(row.approved)}"></div>
                <div class="dumbbell-dot dot-utilized ${isOver ? 'over' : ''}" style="left: ${utilizedPct}%;" title="Utilized: ${formatINR(row.utilized)} (${pct}%)"></div>
              </div>
              <div class="dumbbell-row-meta-col">
                <span class="dumbbell-row-amount">${formatINR(row.utilized)}</span>
                <span class="dumbbell-row-badge ${isOver ? 'over' : 'normal'}">${isOver ? `${pct}% over` : `${pct}%`}</span>
              </div>
            </div>
          `;
        }).join('');

        card.innerHTML = headerHTML + `
          <div class="dumbbell-wrap">
            <div class="dumbbell-inner">
              <div class="dumbbell-ruler-header">
                <div class="dumbbell-ruler-title-col">Project</div>
                <div class="dumbbell-ruler-track-col">
                  ${ticks.map(t => `
                    <div class="dumbbell-ruler-tick" style="left: ${t.pct}%;">
                      <span>${formatINR(t.val)}</span>
                      <div class="dumbbell-ruler-tick-mark"></div>
                    </div>
                  `).join('')}
                </div>
                <div class="dumbbell-ruler-meta-col">Utilized</div>
              </div>
              ${rowsHTML}
            </div>
          </div>
        `;
      }

      // Bind Toggle View
      const toggleBtn = card.querySelector('#dumbbellToggleBtn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          State.dumbbellMode = State.dumbbellMode === 'chart' ? 'table' : 'chart';
          UI.renderDumbbellChart(projects);
        });
      }

      // Bind Row Click to open single project
      card.querySelectorAll('.dumbbell-row-click').forEach(elem => {
        elem.addEventListener('click', () => {
          const id = elem.getAttribute('data-id');
          State.selectedProject = id;
          const sel = document.getElementById('filterTargetProject');
          if (sel) sel.value = id;
          UI.render();
        });
      });
    },

    // ==========================================
    // FUNNEL CHART (PRC Project Lifecycle)
    // ==========================================
    renderFunnelChart: function (projects) {
      const card = document.getElementById('funnelChartCard');
      if (!card) return;

      const draft = projects.filter(p => p.status === 'Draft').length;
      const submitted = projects.filter(p => p.status === 'Submitted').length;
      const active = projects.filter(p => p.status === 'Approved').length;
      const closed = projects.filter(p => p.status === 'Closed').length;

      const sumByStatus = (status) => projects.filter(p => p.status === status).reduce((s, p) => s + p.totalCost, 0);

      const totalProposed = draft + submitted + active + closed;
      const activeOrDone = active + closed;
      const approvalRate = totalProposed > 0 ? Math.round((activeOrDone / totalProposed) * 100) : 0;
      const sanctionedSum = sumByStatus('Approved') + sumByStatus('Closed');

      const stages = [
        {
          stage: 'Drafts Created',
          desc: 'Initial proposal entry & costing',
          status: 'Draft',
          count: totalProposed,
          pct: '100%',
          amount: sumByStatus('Draft') + sumByStatus('Submitted') + sumByStatus('Approved') + sumByStatus('Closed'),
          themeClass: 'stage-blue'
        },
        {
          stage: 'Submitted for PRC',
          desc: 'Awaiting Committee Review',
          status: 'Submitted',
          count: submitted + active + closed,
          pct: totalProposed > 0 ? `${Math.round(((submitted + active + closed) / totalProposed) * 100)}%` : '0%',
          amount: sumByStatus('Submitted') + sumByStatus('Approved') + sumByStatus('Closed'),
          themeClass: 'stage-amber'
        },
        {
          stage: 'PRC Approved / Active',
          desc: 'Sanctioned & on-ground execution',
          status: 'Approved',
          count: active + closed,
          pct: totalProposed > 0 ? `${Math.round(((active + closed) / totalProposed) * 100)}%` : '0%',
          amount: sumByStatus('Approved') + sumByStatus('Closed'),
          themeClass: 'stage-emerald'
        },
        {
          stage: 'Completed & Closed',
          desc: 'Final deliverables & audited',
          status: 'Closed',
          count: closed,
          pct: totalProposed > 0 ? `${Math.round((closed / totalProposed) * 100)}%` : '0%',
          amount: sumByStatus('Closed'),
          themeClass: 'stage-slate'
        }
      ];

      card.innerHTML = `
        <div class="dash-chart-header">
          <div class="dash-chart-header-left">
            <div class="dash-chart-icon-box" style="background: rgba(217, 119, 6, 0.08); color: #d97706;">
              <i class="pi pi-filter"></i>
            </div>
            <div>
              <h3 class="dash-chart-title">PRC Project Lifecycle</h3>
              <p class="dash-chart-subtitle">Conversion from Draft Proposal to Project Closure. Click stage to filter.</p>
            </div>
          </div>
        </div>

        <div class="funnel-container">
          <!-- Summary Conversion KPI Strip -->
          <div class="funnel-metrics-strip">
            <div class="funnel-mini-stat">
              <span class="funnel-mini-stat-label">PRC Clearance Rate</span>
              <span class="funnel-mini-stat-val">${approvalRate}%</span>
              <span class="funnel-mini-stat-sub">${activeOrDone} of ${totalProposed} Sanctioned</span>
            </div>
            <div class="funnel-mini-stat">
              <span class="funnel-mini-stat-label">Sanctioned Outlay</span>
              <span class="funnel-mini-stat-val">${formatINR(sanctionedSum)}</span>
              <span class="funnel-mini-stat-sub">Active PRC Outlay</span>
            </div>
          </div>

          <!-- Funnel Stages -->
          ${stages.map((stg, idx) => `
            <div class="funnel-stage-row ${stg.themeClass}" data-status="${stg.status}" title="Click to filter by ${stg.stage}">
              <div class="funnel-stage-label">
                <span class="funnel-stage-name">${stg.stage}</span>
                <span class="funnel-stage-desc">${stg.desc}</span>
              </div>
              <div class="funnel-stage-count">
                <span>${stg.count}</span>
                <span class="funnel-stage-pct">${stg.pct}</span>
              </div>
              <div class="funnel-stage-amount">${formatINR(stg.amount)}</div>
            </div>
            ${idx < stages.length - 1 ? '<div class="funnel-connector-row"><i class="pi pi-arrow-down"></i></div>' : ''}
          `).join('')}

          <!-- Conversion Velocity Note -->
          <div class="funnel-footer-note">
            <i class="pi pi-info-circle"></i>
            <span>Average PRC review cycle: 21 days • 0 proposals rejected</span>
          </div>
        </div>
      `;

      // Bind Stage click to filter
      card.querySelectorAll('.funnel-stage-row').forEach(row => {
        row.addEventListener('click', () => {
          const status = row.getAttribute('data-status');
          State.selectedStatus = State.selectedStatus === status ? 'All' : status;
          UI.render();
        });
      });
    },

    // ==========================================
    // CENTER-WISE STACKED BAR CHART
    // ==========================================
    renderCenterStackedBarChart: function (projects) {
      const card = document.getElementById('centerStackedBarCard');
      if (!card) return;

      const centerStats = CENTERS.map(c => {
        const cProjects = projects.filter(p => p.categoryId === c.id);
        const toBeStarted = cProjects.filter(p => p.status === 'Draft' || p.status === 'Submitted').length;
        const inProgress = cProjects.filter(p => p.status === 'Approved').length;
        const completed = cProjects.filter(p => p.status === 'Closed').length;
        const total = toBeStarted + inProgress + completed;

        return {
          id: c.id,
          code: c.code,
          name: c.name,
          toBeStarted,
          inProgress,
          completed,
          total
        };
      });

      const maxTotal = Math.max(...centerStats.map(c => c.total), 4);
      const svgHeight = 180;
      const svgWidth = 420;
      const barWidth = 32;
      const chartPaddingBottom = 35;
      const chartPaddingTop = 20;
      const usableHeight = svgHeight - chartPaddingBottom - chartPaddingTop;

      const barsHTML = centerStats.map((c, idx) => {
        const x = 50 + idx * 75;
        const toStartH = (c.toBeStarted / maxTotal) * usableHeight;
        const inProgH = (c.inProgress / maxTotal) * usableHeight;
        const compH = (c.completed / maxTotal) * usableHeight;

        const yComp = svgHeight - chartPaddingBottom - compH;
        const yInProg = yComp - inProgH;
        const yToStart = yInProg - toStartH;

        return `
          <g class="center-bar-group" data-center-id="${c.id}" style="cursor: pointer;">
            <!-- Completed -->
            ${compH > 0 ? `<rect x="${x}" y="${yComp}" width="${barWidth}" height="${compH}" fill="#10b981" rx="2" ry="2"><title>${c.name} - Completed: ${c.completed}</title></rect>` : ''}
            <!-- In Progress -->
            ${inProgH > 0 ? `<rect x="${x}" y="${yInProg}" width="${barWidth}" height="${inProgH}" fill="#2563eb" rx="2" ry="2"><title>${c.name} - In Progress: ${c.inProgress}</title></rect>` : ''}
            <!-- To Be Started -->
            ${toStartH > 0 ? `<rect x="${x}" y="${yToStart}" width="${barWidth}" height="${toStartH}" fill="#cbd5e1" rx="4" ry="4"><title>${c.name} - To Be Started: ${c.toBeStarted}</title></rect>` : ''}
            <!-- Axis label -->
            <text x="${x + barWidth / 2}" y="${svgHeight - 12}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#475569">${c.code}</text>
          </g>
        `;
      }).join('');

      card.innerHTML = `
        <div class="dash-chart-header">
          <div class="dash-chart-header-left">
            <div class="dash-chart-icon-box" style="background: rgba(16, 185, 129, 0.08); color: #059669;">
              <i class="pi pi-th-large"></i>
            </div>
            <div>
              <h3 class="dash-chart-title">Center-wise Project Status</h3>
              <p class="dash-chart-subtitle">Active, in-progress, and to-be-started grouped by centre. Click bar to filter.</p>
            </div>
          </div>
        </div>
        <div class="dash-chart-legend-strip" style="justify-content: flex-end; margin-bottom: 8px;">
          <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#cbd5e1;"></span>To Be Started</span>
          <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#2563eb;"></span>In Progress</span>
          <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#10b981;"></span>Completed</span>
        </div>
        <div class="center-bar-chart-wrap">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;">
            <!-- Y-axis guide lines -->
            <line x1="40" y1="${svgHeight - chartPaddingBottom}" x2="${svgWidth - 20}" y2="${svgHeight - chartPaddingBottom}" stroke="#cbd5e1" stroke-width="1.5"></line>
            <line x1="40" y1="${svgHeight - chartPaddingBottom - usableHeight / 2}" x2="${svgWidth - 20}" y2="${svgHeight - chartPaddingBottom - usableHeight / 2}" class="svg-grid-line"></line>
            <line x1="40" y1="${chartPaddingTop}" x2="${svgWidth - 20}" y2="${chartPaddingTop}" class="svg-grid-line"></line>
            ${barsHTML}
          </svg>
        </div>
      `;

      // Click to filter by center
      card.querySelectorAll('.center-bar-group').forEach(grp => {
        grp.addEventListener('click', () => {
          const cId = grp.getAttribute('data-center-id');
          State.selectedCenter = State.selectedCenter === cId ? 'All' : cId;
          const sel = document.getElementById('filterResearchCenter');
          if (sel) sel.value = State.selectedCenter;
          UI.render();
        });
      });
    },

    // ==========================================
    // CUMULATIVE OUTLAY BURN RATE (AREA CHART)
    // ==========================================
    renderCumulativeBurnRateChart: function (projects, budgetSum, spendSum) {
      const card = document.getElementById('cumulativeBurnRateCard');
      if (!card) return;

      const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
      const multipliers = [0.08, 0.18, 0.32, 0.48, 0.65, 0.80, 0.88, 0.94, 0.97, 1.0, 1.0, 1.0];

      const maxLimit = Math.max(budgetSum * 1.15, 1000000);
      const svgWidth = 650;
      const svgHeight = 220;
      const pLeft = 65;
      const pRight = 25;
      const pTop = 25;
      const pBottom = 35;
      const plotW = svgWidth - pLeft - pRight;
      const plotH = svgHeight - pTop - pBottom;

      const spendPoints = months.map((m, idx) => {
        const val = spendSum * multipliers[idx];
        const x = pLeft + (idx / (months.length - 1)) * plotW;
        const y = pTop + plotH * (1 - (val / maxLimit));
        return { month: m, val, x, y };
      });

      const budgetY = pTop + plotH * (1 - (budgetSum / maxLimit));

      // Build SVG Area Path
      let pathD = `M ${spendPoints[0].x} ${spendPoints[0].y}`;
      for (let i = 1; i < spendPoints.length; i++) {
        const prev = spendPoints[i - 1];
        const curr = spendPoints[i];
        const cx = (prev.x + curr.x) / 2;
        pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
      }
      const areaD = `${pathD} L ${spendPoints[spendPoints.length - 1].x} ${pTop + plotH} L ${spendPoints[0].x} ${pTop + plotH} Z`;

      card.innerHTML = `
        <div class="dash-chart-header">
          <div class="dash-chart-header-left">
            <div class="dash-chart-icon-box" style="background: rgba(37, 99, 235, 0.08); color: #2563eb;">
              <i class="pi pi-chart-line"></i>
            </div>
            <div>
              <h3 class="dash-chart-title">Cumulative Outlay Burn Rate</h3>
              <p class="dash-chart-subtitle">Cumulative spend burn-up against total sanctioned budget across months.</p>
            </div>
          </div>
          <div class="dash-chart-legend-strip">
            <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#2563eb;"></span>Cumulative Spent</span>
            <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#f59e0b; border: 1px dashed #d97706;"></span>Sanctioned Limit</span>
          </div>
        </div>
        <div class="burnup-area-chart-wrap">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;">
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="#2563eb" stop-opacity="0.38"/>
                <stop offset="95%" stop-color="#2563eb" stop-opacity="0.0"/>
              </linearGradient>
            </defs>

            <!-- Gridlines -->
            <line x1="${pLeft}" y1="${pTop + plotH}" x2="${svgWidth - pRight}" y2="${pTop + plotH}" stroke="#cbd5e1" stroke-width="1.5"></line>
            <line x1="${pLeft}" y1="${pTop + plotH * 0.5}" x2="${svgWidth - pRight}" y2="${pTop + plotH * 0.5}" class="svg-grid-line"></line>
            <line x1="${pLeft}" y1="${pTop}" x2="${svgWidth - pRight}" y2="${pTop}" class="svg-grid-line"></line>

            <!-- Y-Axis labels -->
            <text x="${pLeft - 8}" y="${pTop + plotH + 3}" text-anchor="end" class="svg-axis-label">₹0</text>
            <text x="${pLeft - 8}" y="${pTop + plotH * 0.5 + 3}" text-anchor="end" class="svg-axis-label">${formatINR(maxLimit * 0.5)}</text>
            <text x="${pLeft - 8}" y="${pTop + 3}" text-anchor="end" class="svg-axis-label">${formatINR(maxLimit)}</text>

            <!-- Sanctioned Limit Dashed Line -->
            <line x1="${pLeft}" y1="${budgetY}" x2="${svgWidth - pRight}" y2="${budgetY}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 4"></line>

            <!-- Area & Line -->
            <path d="${areaD}" fill="url(#spendGrad)"></path>
            <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="3"></path>

            <!-- Dots & X-Labels -->
            ${spendPoints.map(pt => `
              <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#2563eb" stroke="#ffffff" stroke-width="2" style="cursor: pointer;">
                <title>${pt.month}: Spent ${formatINR(pt.val)} (Limit: ${formatINR(budgetSum)})</title>
              </circle>
              <text x="${pt.x}" y="${svgHeight - 12}" text-anchor="middle" class="svg-axis-label">${pt.month}</text>
            `).join('')}
          </svg>
        </div>
      `;
    },

    // ==========================================
    // GANTT SCHEDULE TIMELINE CHART
    // ==========================================
    renderGanttChart: function (projects) {
      const card = document.getElementById('ganttChartCard');
      if (!card) return;

      const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

      const lanesHTML = projects.map((p, idx) => {
        const startCol = Math.max(0, Math.min(11, p.startMonthOffset || (idx % 4)));
        const durationMonths = p.durationUnit === 'Months' ? p.durationValue : Math.ceil(p.durationValue / 30);
        const endCol = Math.min(12, startCol + durationMonths);
        const spanCols = endCol - startCol;

        // Visual gradients for lanes
        const gradients = [
          'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
          'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
        ];
        const barBg = gradients[idx % gradients.length];

        return `
          <div class="gantt-lane-row" data-proj-id="${p.id}">
            <div class="gantt-lane-info-col gantt-proj-trigger" data-proj-id="${p.id}">
              <div class="gantt-lane-project-name">${p.projectName}</div>
              <div class="gantt-lane-meta">${p.categoryName} • ${formatINR(p.totalCost)}</div>
            </div>
            <div class="gantt-lane-grid-col">
              ${months.map(() => '<div class="gantt-grid-col-divider"></div>').join('')}
              <div class="gantt-duration-bar gantt-proj-trigger" data-proj-id="${p.id}" style="grid-column-start: ${startCol + 1}; grid-column-end: ${endCol + 1}; background: ${barBg};">
                <span>${p.durationValue} ${p.durationUnit}</span>
                ${p.dateOfPrc ? `<div class="gantt-prc-pill" title="PRC Date: ${p.dateOfPrc}"><i class="pi pi-calendar" style="font-size: 8px;"></i> PRC</div>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div class="dash-chart-header">
          <div class="dash-chart-header-left">
            <div class="dash-chart-icon-box" style="background: rgba(99, 102, 241, 0.08); color: #6366f1;">
              <i class="pi pi-calendar"></i>
            </div>
            <div>
              <h3 class="dash-chart-title">Project Gantt Schedule Timelines</h3>
              <p class="dash-chart-subtitle">Gantt lanes reflecting project schedule and PRC Date markers. Click lane to open.</p>
            </div>
          </div>
        </div>
        <div class="gantt-chart-outer">
          <div class="gantt-chart-inner">
            <div class="gantt-header-row">
              <div class="gantt-header-title-col">Project & Cost Center</div>
              <div class="gantt-header-months-grid">
                ${months.map(m => `<div class="gantt-header-month-cell">${m}</div>`).join('')}
              </div>
            </div>
            ${lanesHTML}
          </div>
        </div>
      `;

      // Bind Click to Single Project View
      card.querySelectorAll('.gantt-proj-trigger').forEach(elem => {
        elem.addEventListener('click', () => {
          const id = elem.getAttribute('data-proj-id');
          State.selectedProject = id;
          const sel = document.getElementById('filterTargetProject');
          if (sel) sel.value = id;
          UI.render();
        });
      });
    },

    // ==========================================
    // PROJECTS MASTER TABLE
    // ==========================================
    renderProjectsTable: function (projects) {
      const tbody = document.getElementById('projectsTableTbody');
      if (!tbody) return;

      if (projects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 30px; text-align: center; color: #94a3b8;">No projects found matching current filters.</td></tr>`;
        return;
      }

      tbody.innerHTML = projects.map(p => {
        const team = p.team || { advisor: 1, ra: 1, fellow: 1, investigators: 4 };
        return `
          <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s ease;">
            <td style="padding: 14px 16px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="background: #eff6ff; color: #2563eb; font-weight: 800; font-family: monospace; font-size: 0.72rem; padding: 2px 7px; border-radius: 5px;">${p.proposalNumber}</span>
                <a href="javascript:void(0)" class="table-proj-link" data-id="${p.id}" style="font-weight: 750; color: #0f172a; text-decoration: none;">
                  ${p.projectName}
                </a>
              </div>
              <div style="font-size: 0.76rem; color: #64748b;">${p.categoryName}</div>
            </td>
            <td style="padding: 14px 16px; font-size: 0.8rem; color: #475569; font-weight: 600;">
              <div>${p.durationValue} ${p.durationUnit}</div>
              <div style="font-size: 0.72rem; color: #94a3b8;">PRC: ${p.dateOfPrc}</div>
            </td>
            <td style="padding: 14px 16px;">
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <span class="ref-assignee-badge" title="Advisor"><i class="pi pi-user"></i> Adv: ${team.advisor || 1}</span>
                <span class="ref-assignee-badge" title="Research Associates"><i class="pi pi-users"></i> RA: ${team.ra || 1}</span>
                <span class="ref-assignee-badge" title="Field Investigators"><i class="pi pi-id-card"></i> FI: ${team.investigators || 4}</span>
              </div>
            </td>
            <td style="padding: 14px 16px;">
              <div style="font-weight: 800; font-family: monospace; color: #0f172a;">${formatINR(p.totalCost)}</div>
              <div style="font-size: 0.72rem; color: #059669; font-weight: 700;">Spent: ${formatINR(p.spent)}</div>
            </td>
            <td style="padding: 14px 16px;">
              <span style="display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; background: ${p.status === 'Closed' ? '#f1f5f9' : '#ecfdf5'}; color: ${p.status === 'Closed' ? '#475569' : '#059669'};">
                ${p.status}
              </span>
            </td>
            <td style="padding: 14px 16px; text-align: center;">
              <button type="button" class="table-proj-link btn btn-secondary" data-id="${p.id}" style="padding: 5px 12px; font-size: 0.76rem; font-weight: 700; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer;">
                <i class="pi pi-eye"></i> Audit
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.table-proj-link').forEach(link => {
        link.addEventListener('click', () => {
          const id = link.getAttribute('data-id');
          State.selectedProject = id;
          const sel = document.getElementById('filterTargetProject');
          if (sel) sel.value = id;
          UI.render();
        });
      });
    },

    // ==========================================
    // SINGLE-PROJECT AUDIT CONSOLE RENDERER
    // ==========================================
    renderSingleProjectView: function (project) {
      if (!project) return;

      const container = document.getElementById('singleProjectViewContainer');
      if (!container) return;

      const budget = project.totalCost;
      const spent = project.spent || 0;
      const remaining = Math.max(0, budget - spent);
      const rate = budget > 0 ? Math.round((spent / budget) * 100) : 0;
      const isOver = rate > 100;

      const overBudgetHeads = (project.heads || []).filter(h => (h.spent || 0) > h.headTotal);

      // Render Single Project Banner & 4 KPIs
      let html = `
        <div class="single-project-banner">
          <div class="single-project-banner-left">
            <div class="single-project-avatar">
              <i class="pi pi-folder-open"></i>
            </div>
            <div>
              <div class="single-project-badges-row">
                <span style="font-family: monospace; font-size: 0.72rem; font-weight: 800; background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 6px;">
                  ${project.proposalNumber}
                </span>
                <span style="font-size: 0.72rem; font-weight: 800; background: ${project.status === 'Closed' ? '#f1f5f9' : '#ecfdf5'}; color: ${project.status === 'Closed' ? '#475569' : '#059669'}; padding: 2px 8px; border-radius: 6px;">
                  Status: ${project.status}
                </span>
              </div>
              <h2>${project.projectName}</h2>
              <p style="font-size: 0.78rem; color: #64748b; margin-top: 3px; font-weight: 600;">
                Research Center: <strong style="color: #1e293b;">${project.categoryName}</strong> • Scheme: <strong style="color: #1e293b;">${project.schemeName}</strong>
              </p>
            </div>
          </div>
          <button type="button" class="single-project-back-btn" id="spBackToPortfolioBtn">
            <i class="pi pi-arrow-left"></i>
            <span>Back to Portfolio</span>
          </button>
        </div>

        <!-- 4 Single-Project KPI Cards -->
        <div class="sp-4kpi-grid">
          <!-- 1. Sanctioned Outlay -->
          <div class="dash-kpi-card" id="spKpiOutlay">
            <div class="dash-kpi-top">
              <span class="dash-kpi-label">Sanctioned Outlay</span>
              <div class="dash-kpi-icon-wrap icon-blue">
                <i class="pi pi-indian-rupee"></i>
              </div>
            </div>
            <div>
              <div class="dash-kpi-value">${formatINR(budget)}</div>
              <div class="dash-kpi-sub" style="color: #059669; font-weight: 700;">Spent: ${formatINR(spent)}</div>
            </div>
          </div>

          <!-- 2. % Utilized -->
          <div class="dash-kpi-card" id="spKpiUtil">
            <div class="dash-kpi-top">
              <span class="dash-kpi-label">% Utilized</span>
              <div class="dash-kpi-icon-wrap ${isOver ? 'icon-rose' : 'icon-emerald'}">
                <i class="pi pi-percentage"></i>
              </div>
            </div>
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div class="dash-kpi-value" style="color: ${isOver ? '#dc2626' : '#0f172a'};">${rate}%</div>
                <span style="font-size: 0.68rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: ${isOver ? '#fef2f2' : '#ecfdf5'}; color: ${isOver ? '#dc2626' : '#059669'};">
                  ${isOver ? 'OVER' : 'NORMAL'}
                </span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-top: 8px;">
                <div style="height: 100%; width: ${Math.min(100, rate)}%; background: ${isOver ? '#ef4444' : '#10b981'};"></div>
              </div>
            </div>
          </div>

          <!-- 3. Heads Over Limit -->
          <div class="dash-kpi-card" id="spKpiOverHeads">
            <div class="dash-kpi-top">
              <span class="dash-kpi-label">Heads Over Limit</span>
              <div class="dash-kpi-icon-wrap ${overBudgetHeads.length ? 'icon-rose' : 'icon-emerald'}">
                <i class="pi ${overBudgetHeads.length ? 'pi-exclamation-triangle' : 'pi-check-circle'}"></i>
              </div>
            </div>
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div class="dash-kpi-value">${overBudgetHeads.length}</div>
                <span style="font-size: 0.68rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: ${overBudgetHeads.length ? '#fef2f2' : '#ecfdf5'}; color: ${overBudgetHeads.length ? '#dc2626' : '#059669'};">
                  ${overBudgetHeads.length ? 'ATTENTION' : 'CLEAN'}
                </span>
              </div>
              <div class="dash-kpi-sub">Cost center variances</div>
            </div>
          </div>

          <!-- 4. Project Timeline -->
          <div class="dash-kpi-card" id="spKpiTimeline">
            <div class="dash-kpi-top">
              <span class="dash-kpi-label">Project Timeline</span>
              <div class="dash-kpi-icon-wrap icon-blue">
                <i class="pi pi-calendar"></i>
              </div>
            </div>
            <div>
              <div class="dash-kpi-value">${project.durationValue} ${project.durationUnit}</div>
              <div class="dash-kpi-sub">PRC: <strong>${project.dateOfPrc}</strong></div>
            </div>
          </div>
        </div>
      `;

      // Check if we are inside a Drilldown view
      if (State.projectDrilldown) {
        html += this.renderDrilldownSection(project);
      } else if (State.selectedChartPeriod) {
        html += this.renderPeriodTransactions(project);
      } else {
        html += `
          <!-- Single Project Charts Grid -->
          <div class="dash-charts-grid">
            <!-- Head-wise Budget vs Actual (Span 2) -->
            <div class="dash-chart-card col-span-2" id="spHeadwiseCard">
              ${this.renderHeadWiseChartHTML(project)}
            </div>

            <!-- Cost Structure Donut -->
            <div class="dash-chart-card" id="spCostStructureCard">
              ${this.renderCostStructureDonutHTML(project)}
            </div>

            <!-- Cumulative Burn-Up Trajectory (Span 3) -->
            <div class="dash-chart-card col-span-3" id="spBurnUpCard">
              ${this.renderSingleProjectBurnUpHTML(project)}
            </div>
          </div>
        `;
      }

      container.innerHTML = html;

      // Bind Back Button
      const backBtn = document.getElementById('spBackToPortfolioBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          State.selectedProject = 'All';
          State.projectDrilldown = null;
          State.selectedChartPeriod = null;
          const sel = document.getElementById('filterTargetProject');
          if (sel) sel.value = 'All';
          UI.render();
        });
      }

      // Bind Head-wise Chart / Table Toggle
      const headToggleBtn = document.getElementById('spHeadwiseToggleBtn');
      if (headToggleBtn) {
        headToggleBtn.addEventListener('click', () => {
          State.headwiseMode = State.headwiseMode === 'chart' ? 'table' : 'chart';
          UI.renderSingleProjectView(project);
        });
      }

      // Bind Head click for drilldown
      container.querySelectorAll('.headwise-item-click').forEach(elem => {
        elem.addEventListener('click', () => {
          const headId = elem.getAttribute('data-head-id');
          const head = (project.heads || []).find(h => h.id === headId);
          if (head) {
            State.projectDrilldown = {
              headId: head.id,
              headName: head.particulars
            };
            UI.render();
          }
        });
      });

      // Bind Subhead click for voucher drilldown
      container.querySelectorAll('.subhead-drill-click').forEach(elem => {
        elem.addEventListener('click', () => {
          const subId = elem.getAttribute('data-sub-id');
          const head = (project.heads || []).find(h => h.id === State.projectDrilldown.headId);
          const sub = (head?.subItems || []).find(s => s.id === subId);
          if (sub) {
            State.projectDrilldown.subHeadId = sub.id;
            State.projectDrilldown.subHeadName = sub.particulars;
            UI.render();
          }
        });
      });

      // Bind Period click
      container.querySelectorAll('.sp-period-dot-click').forEach(elem => {
        elem.addEventListener('click', () => {
          State.selectedChartPeriod = elem.getAttribute('data-period');
          UI.render();
        });
      });

      // Bind back from drilldown
      const drillBackBtn = document.getElementById('drilldownBackBtn');
      if (drillBackBtn) {
        drillBackBtn.addEventListener('click', () => {
          if (State.projectDrilldown?.subHeadName) {
            State.projectDrilldown = {
              headId: State.projectDrilldown.headId,
              headName: State.projectDrilldown.headName
            };
          } else {
            State.projectDrilldown = null;
          }
          UI.render();
        });
      }

      const periodBackBtn = document.getElementById('periodBackBtn');
      if (periodBackBtn) {
        periodBackBtn.addEventListener('click', () => {
          State.selectedChartPeriod = null;
          UI.render();
        });
      }
    },

    renderHeadWiseChartHTML: function (project) {
      const heads = project.heads || [];

      const headerHTML = `
        <div class="dash-chart-header">
          <div class="dash-chart-header-left">
            <div class="dash-chart-icon-box" style="background: rgba(37, 99, 235, 0.08); color: #2563eb;">
              <i class="pi pi-list"></i>
            </div>
            <div>
              <h3 class="dash-chart-title">Head-wise Budget vs Actual</h3>
              <p class="dash-chart-subtitle">Project master budget heads in order. Click a head to inspect sub-heads.</p>
            </div>
          </div>
          <button class="dash-view-toggle-btn ${State.headwiseMode === 'table' ? 'active' : ''}" id="spHeadwiseToggleBtn">
            ${State.headwiseMode === 'chart' ? 'Table' : 'Chart'}
          </button>
        </div>
      `;

      if (State.headwiseMode === 'table') {
        return headerHTML + `
          <div class="overflow-x-auto">
            <table class="dash-data-table">
              <thead>
                <tr>
                  <th>Head Particulars</th>
                  <th style="text-align: right;">Sanctioned Outlay</th>
                  <th style="text-align: right;">Actual Spent</th>
                  <th style="text-align: right;">Utilization %</th>
                </tr>
              </thead>
              <tbody>
                ${heads.map(h => {
                  const pct = h.headTotal > 0 ? Math.round(((h.spent || 0) / h.headTotal) * 100) : 0;
                  const isOver = pct > 100;
                  return `
                    <tr class="headwise-item-click" data-head-id="${h.id}" style="cursor: pointer;">
                      <td style="font-weight: 750; color: #1e293b;">${h.particulars}</td>
                      <td style="text-align: right; font-family: monospace;">${formatINR(h.headTotal)}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800; color: ${isOver ? '#dc2626' : '#059669'};">${formatINR(h.spent || 0)}</td>
                      <td style="text-align: right; font-weight: 800; color: ${isOver ? '#dc2626' : '#2563eb'};">${pct}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      const barsHTML = heads.map(h => {
        const pct = h.headTotal > 0 ? Math.round(((h.spent || 0) / h.headTotal) * 100) : 0;
        const isOver = pct > 100;

        return `
          <div class="headwise-bar-item headwise-item-click" data-head-id="${h.id}">
            <div class="headwise-bar-header">
              <span class="headwise-bar-title">${h.particulars}</span>
              <div class="headwise-bar-stats">
                <span style="color: #64748b;">Budget: ${formatINR(h.headTotal)}</span>
                <span style="color: ${isOver ? '#dc2626' : '#059669'}; font-weight: 800;">Spent: ${formatINR(h.spent || 0)}</span>
                <span style="padding: 1px 7px; border-radius: 5px; font-size: 0.7rem; font-weight: 800; background: ${isOver ? '#fef2f2' : '#ecfdf5'}; color: ${isOver ? '#dc2626' : '#059669'};">
                  ${pct}%
                </span>
              </div>
            </div>
            <div class="headwise-progress-track">
              <div class="headwise-progress-fill" style="width: ${Math.min(100, pct)}%; background: ${isOver ? '#ef4444' : '#2563eb'};"></div>
            </div>
          </div>
        `;
      }).join('');

      return headerHTML + `<div class="headwise-bars-container">${barsHTML}</div>`;
    },

    renderCostStructureDonutHTML: function (project) {
      const direct = project.subTotal || (project.totalCost * 0.85);
      const overheads = project.overheadsAmount || (project.totalCost * 0.15);
      const total = direct + overheads;
      const directPct = Math.round((direct / total) * 100);
      const overheadsPct = Math.round((overheads / total) * 100);

      // SVG Donut calculation
      const radius = 60;
      const circ = 2 * Math.PI * radius; // ~377
      const directStroke = (directPct / 100) * circ;
      const overheadsStroke = (overheadsPct / 100) * circ;

      return `
        <div class="dash-chart-header">
          <div class="dash-chart-header-left">
            <div class="dash-chart-icon-box" style="background: rgba(245, 158, 11, 0.08); color: #d97706;">
              <i class="pi pi-chart-pie"></i>
            </div>
            <div>
              <h3 class="dash-chart-title">Cost Structure Allocation</h3>
              <p class="dash-chart-subtitle">Direct research costs vs institutional overheads.</p>
            </div>
          </div>
        </div>

        <div class="donut-chart-container">
          <svg viewBox="0 0 160 160" style="width: 140px; height: 140px; transform: rotate(-90deg);">
            <!-- Direct Costs Segment -->
            <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#2563eb" stroke-width="22"
              stroke-dasharray="${directStroke} ${circ}" stroke-dashoffset="0"></circle>
            <!-- Overheads Segment -->
            <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#f59e0b" stroke-width="22"
              stroke-dasharray="${overheadsStroke} ${circ}" stroke-dashoffset="-${directStroke}"></circle>
          </svg>
          <div class="donut-center-label">
            <span class="donut-center-sub">Total Outlay</span>
            <span class="donut-center-val">${formatINR(total)}</span>
          </div>
        </div>

        <div class="donut-legend-list">
          <div class="donut-legend-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="dash-legend-dot" style="background: #2563eb;"></span>
              <span style="font-weight: 750; color: #1e293b;">Direct Project Costs</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-weight: 800;">${formatINR(direct)}</span>
              <span style="background: #2563eb; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 1px 6px; border-radius: 4px;">${directPct}%</span>
            </div>
          </div>

          <div class="donut-legend-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="dash-legend-dot" style="background: #f59e0b;"></span>
              <span style="font-weight: 750; color: #1e293b;">Institutional Overheads</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-weight: 800;">${formatINR(overheads)}</span>
              <span style="background: #f59e0b; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 1px 6px; border-radius: 4px;">${overheadsPct}%</span>
            </div>
          </div>
        </div>
      `;
    },

    renderSingleProjectBurnUpHTML: function (project) {
      const budget = project.totalCost;
      const spent = project.spent || 0;
      const periods = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
      const fractions = [0.10, 0.25, 0.50, 0.70, 0.90, 1.0];

      const maxLimit = budget * 1.15;
      const svgWidth = 650;
      const svgHeight = 200;
      const pLeft = 65;
      const pRight = 25;
      const pTop = 20;
      const pBottom = 35;
      const plotW = svgWidth - pLeft - pRight;
      const plotH = svgHeight - pTop - pBottom;

      const points = periods.map((p, idx) => {
        const val = spent * fractions[idx];
        const x = pLeft + (idx / (periods.length - 1)) * plotW;
        const y = pTop + plotH * (1 - (val / maxLimit));
        return { period: p, val, x, y };
      });

      const budgetY = pTop + plotH * (1 - (budget / maxLimit));

      let pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cx = (prev.x + curr.x) / 2;
        pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
      }
      const areaD = `${pathD} L ${points[points.length - 1].x} ${pTop + plotH} L ${points[0].x} ${pTop + plotH} Z`;

      return `
        <div class="dash-chart-header">
          <div class="dash-chart-header-left">
            <div class="dash-chart-icon-box" style="background: rgba(37, 99, 235, 0.08); color: #2563eb;">
              <i class="pi pi-chart-line"></i>
            </div>
            <div>
              <h3 class="dash-chart-title">Cumulative Burn-up Trajectory</h3>
              <p class="dash-chart-subtitle">Monthly actual spent trajectory against overall limit. Click a point to inspect transactions.</p>
            </div>
          </div>
          <div class="dash-chart-legend-strip">
            <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#2563eb;"></span>Utilized Burn</span>
            <span class="dash-legend-item"><span class="dash-legend-dot" style="background:#f59e0b; border: 1px dashed #d97706;"></span>Sanctioned Limit</span>
          </div>
        </div>

        <div class="burnup-area-chart-wrap" style="height: 200px;">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;">
            <defs>
              <linearGradient id="spSpendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="#2563eb" stop-opacity="0.35"/>
                <stop offset="95%" stop-color="#2563eb" stop-opacity="0.0"/>
              </linearGradient>
            </defs>

            <!-- Guide lines -->
            <line x1="${pLeft}" y1="${pTop + plotH}" x2="${svgWidth - pRight}" y2="${pTop + plotH}" stroke="#cbd5e1" stroke-width="1.5"></line>
            <line x1="${pLeft}" y1="${budgetY}" x2="${svgWidth - pRight}" y2="${budgetY}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 4"></line>

            <!-- Y Axis values -->
            <text x="${pLeft - 8}" y="${pTop + plotH + 3}" text-anchor="end" class="svg-axis-label">₹0</text>
            <text x="${pLeft - 8}" y="${budgetY + 3}" text-anchor="end" class="svg-axis-label" fill="#d97706">${formatINR(budget)}</text>

            <!-- Area & Line -->
            <path d="${areaD}" fill="url(#spSpendGrad)"></path>
            <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="2.5"></path>

            <!-- Points & Labels -->
            ${points.map(pt => `
              <circle class="sp-period-dot-click" data-period="${pt.period}" cx="${pt.x}" cy="${pt.y}" r="5" fill="#2563eb" stroke="#ffffff" stroke-width="2" style="cursor: pointer;">
                <title>${pt.period}: ${formatINR(pt.val)} (Click to view vouchers)</title>
              </circle>
              <text x="${pt.x}" y="${svgHeight - 12}" text-anchor="middle" class="svg-axis-label">${pt.period}</text>
            `).join('')}
          </svg>
        </div>
      `;
    },

    renderDrilldownSection: function (project) {
      const drill = State.projectDrilldown;
      const head = (project.heads || []).find(h => h.id === drill.headId);

      if (drill.subHeadName) {
        // Render Double-entry vouchers for this subhead
        const vouchers = SAMPLE_VOUCHERS.filter(v => v.schemeId === project.schemeId);
        return `
          <div class="drilldown-panel">
            <div class="drilldown-header">
              <div class="drilldown-header-title">
                <span class="pulse-dot"></span>
                <span>Drill-down: ${drill.headName} &gt; ${drill.subHeadName}</span>
              </div>
              <button type="button" class="dash-accordion-close-btn" id="drilldownBackBtn">
                <i class="pi pi-arrow-left"></i>
                <span>Back to Sub-Heads</span>
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="dash-data-table">
                <thead>
                  <tr>
                    <th>Voucher Number</th>
                    <th>Voucher Date</th>
                    <th>Voucher Type</th>
                    <th>Ledger / Narration</th>
                    <th style="text-align: right;">Debit Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${vouchers.map(v => `
                    <tr>
                      <td style="font-family: monospace; font-weight: 800;">${v.voucherNumber}</td>
                      <td style="color: #64748b;">${v.voucherDate}</td>
                      <td><span class="voucher-pill">${v.voucherType}</span></td>
                      <td>
                        <div style="font-weight: 750; color: #1e293b;">${v.ledgerName}</div>
                        <div style="font-size: 0.72rem; color: #64748b;">${v.narration}</div>
                      </td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800; color: #0f172a;">${formatINR(v.totalAmount, false)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else {
        // Render Subheads Table for this Head
        const subItems = head?.subItems || [];
        return `
          <div class="drilldown-panel">
            <div class="drilldown-header">
              <div class="drilldown-header-title">
                <span class="pulse-dot"></span>
                <span>Drill-down: ${drill.headName}</span>
              </div>
              <button type="button" class="dash-accordion-close-btn" id="drilldownBackBtn">
                <i class="pi pi-arrow-left"></i>
                <span>Back to Project Details</span>
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="dash-data-table">
                <thead>
                  <tr>
                    <th>Detailed Line Item Name</th>
                    <th>Units / Rate Details</th>
                    <th style="text-align: right;">Sanctioned Outlay</th>
                    <th style="text-align: right;">Spent Actual</th>
                    <th style="text-align: right;">Unspent Variance</th>
                  </tr>
                </thead>
                <tbody>
                  ${subItems.length ? subItems.map(sh => `
                    <tr>
                      <td>
                        <a href="javascript:void(0)" class="subhead-drill-click" data-sub-id="${sh.id}" style="color: #2563eb; text-decoration: none; font-weight: 750;">
                          ${sh.particulars}
                        </a>
                      </td>
                      <td style="font-family: monospace; font-size: 0.74rem; color: #64748b;">
                        ${sh.units} × ${sh.timePeriod} ${sh.timePeriodUnit} @ ${formatINR(sh.costPerUnit, false)}
                      </td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800;">${formatINR(sh.estimatedCost, false)}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800; color: #059669;">${formatINR(sh.spent || 0, false)}</td>
                      <td style="text-align: right; font-family: monospace; font-weight: 800; color: #2563eb;">${formatINR(sh.estimatedCost - (sh.spent || 0), false)}</td>
                    </tr>
                  `).join('') : `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">No detailed sub-items recorded for this lump-sum budget head.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
    },

    renderPeriodTransactions: function (project) {
      const vouchers = SAMPLE_VOUCHERS.filter(v => v.schemeId === project.schemeId);
      return `
        <div class="drilldown-panel">
          <div class="drilldown-header">
            <div class="drilldown-header-title">
              <span class="pulse-dot"></span>
              <span>Drill-down: Transactions in ${State.selectedChartPeriod}</span>
            </div>
            <button type="button" class="dash-accordion-close-btn" id="periodBackBtn">
              <i class="pi pi-arrow-left"></i>
              <span>Back to Charts</span>
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="dash-data-table">
              <thead>
                <tr>
                  <th>Voucher No</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Narration</th>
                  <th style="text-align: right;">Debit Amount</th>
                </tr>
              </thead>
              <tbody>
                ${vouchers.map(v => `
                  <tr>
                    <td style="font-family: monospace; font-weight: 800;">${v.voucherNumber}</td>
                    <td style="color: #64748b;">${v.voucherDate}</td>
                    <td><span class="voucher-pill">${v.voucherType}</span></td>
                    <td>${v.narration}</td>
                    <td style="text-align: right; font-family: monospace; font-weight: 800;">${formatINR(v.totalAmount, false)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  };

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    UI.init();
  });

})();
