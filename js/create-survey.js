/**
 * Create Survey Controller
 * Maps questions from Store.getQuestionBank() and publishes surveys
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

  // Populate projects dropdown
  const projectSelect = document.getElementById('csSurveyProjectSelect');
  if (projectSelect) {
    const projects = Store.getProjects();
    projectSelect.innerHTML = projects.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
  }

  // Update badge counts
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

    const sbSurvey = document.getElementById('sidebarSurveyCountBadge');
    if (sbSurvey) sbSurvey.textContent = surveys.length;

    const sbTask = document.getElementById('sidebarTaskCountBadge');
    if (sbTask) sbTask.textContent = taskCount;
  }

  updateCounts();

  // Helper to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Master Questions and Selected IDs
  let masterQuestions = Store.getQuestionBank();
  let selectedQuestionIds = new Set(masterQuestions.map(q => q.id));

  // Populate Category Filter dropdown
  function populateCategoryFilter() {
    const categoryFilterSelect = document.getElementById('csCategoryFilterSelect');
    if (categoryFilterSelect) {
      const currentVal = categoryFilterSelect.value;
      const categories = Array.from(new Set(masterQuestions.map(q => q.category).filter(Boolean))).sort();
      categoryFilterSelect.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
      if (currentVal && categories.includes(currentVal)) {
        categoryFilterSelect.value = currentVal;
      }
    }
  }

  const categoryFilterSelect = document.getElementById('csCategoryFilterSelect');
  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener('change', renderQuestionsList);
  }
  populateCategoryFilter();

  function renderQuestionsList() {
    const list = document.getElementById('csQuestionsList');
    const badge = document.getElementById('csSelectedCountBadge');
    const filterText = (document.getElementById('csQuestionFilterIn')?.value || '').toLowerCase().trim();
    const filterCat = (document.getElementById('csCategoryFilterSelect')?.value || '').trim();

    if (badge) {
      badge.textContent = `${selectedQuestionIds.size} of ${masterQuestions.length} Selected`;
    }

    if (!list) return;

    if (masterQuestions.length === 0) {
      list.innerHTML = `
        <div style="background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center;">
          <div style="font-size: 1.6rem; color: #94a3b8; margin-bottom: 6px;">📂</div>
          <div style="font-size: 0.9rem; font-weight: 700; color: #1e293b;">Question Bank is currently empty</div>
          <p style="font-size: 0.78rem; color: #64748b; margin-top: 4px;">Add questions directly to the Master using the button above.</p>
        </div>
      `;
      return;
    }

    const filtered = masterQuestions.filter(q => {
      const matchesCat = !filterCat || (q.category && q.category === filterCat);
      if (!matchesCat) return false;

      if (!filterText) return true;
      return (q.text && q.text.toLowerCase().includes(filterText)) ||
        (q.id && q.id.toLowerCase().includes(filterText)) ||
        (q.category && q.category.toLowerCase().includes(filterText));
    });

    if (filtered.length === 0) {
      list.innerHTML = `<div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 0.84rem;">No questions found matching your filter criteria.</div>`;
      return;
    }

    list.innerHTML = filtered.map(q => {
      const isSelected = selectedQuestionIds.has(q.id);
      const mediaList = [];
      if (q.voice) mediaList.push('🎙️ Audio');
      if (q.image) mediaList.push('📷 Photo');
      if (q.video) mediaList.push('🎥 Video');

      return `
        <div class="cs-question-card-item ${isSelected ? 'selected' : ''}" onclick="window.toggleSurveyQuestion('${escapeHtml(q.id)}')">
          <div style="width: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); window.toggleSurveyQuestion('${escapeHtml(q.id)}')">
          </div>
          <span class="qb-code-badge" style="width: 60px; font-size: 0.74rem; font-weight: 800; padding: 3px 4px; text-align: center; flex-shrink: 0;">${escapeHtml(q.id || q.code)}</span>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 0.86rem; font-weight: 700; color: #1e293b; line-height: 1.35; margin-bottom: 4px;">${escapeHtml(q.text)}</div>
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              ${q.category ? `<span style="font-size: 0.7rem; background: #f1f5f9; color: #475569; padding: 2px 7px; border-radius: 6px; font-weight: 600;">${escapeHtml(q.category)}</span>` : ''}
              <span class="qb-type-tag" style="font-size: 0.7rem; padding: 2px 7px;">${escapeHtml(q.type || 'Standard')}</span>
              ${mediaList.map(m => `<span class="qb-media-tag" style="font-size: 0.7rem; padding: 2px 6px;">${m}</span>`).join('')}
              ${q.options ? `<span style="font-size: 0.7rem; color: #64748b; margin-left: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px;" title="${escapeHtml(q.options)}">(${escapeHtml(q.options)})</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.toggleSurveyQuestion = function (id) {
    if (selectedQuestionIds.has(id)) {
      selectedQuestionIds.delete(id);
    } else {
      selectedQuestionIds.add(id);
    }
    renderQuestionsList();
  };

  document.getElementById('btnCSSelectAll')?.addEventListener('click', () => {
    masterQuestions.forEach(q => selectedQuestionIds.add(q.id));
    renderQuestionsList();
  });

  document.getElementById('btnCSDeselectAll')?.addEventListener('click', () => {
    selectedQuestionIds.clear();
    renderQuestionsList();
  });

  document.getElementById('csQuestionFilterIn')?.addEventListener('input', renderQuestionsList);

  // --- Modal: Create Question in Master ---
  const modalAddQ = document.getElementById('modalAddQuestionToMaster');
  const btnOpenAddQ = document.getElementById('btnOpenAddQuestionModal');
  const mqQuestionText = document.getElementById('mqQuestionText');
  const mqCategorySelect = document.getElementById('mqCategorySelect');
  const mqTypeSelect = document.getElementById('mqTypeSelect');
  const mqOptionsContainer = document.getElementById('mqOptionsContainer');
  const mqOptionsInput = document.getElementById('mqOptionsInput');
  const btnSaveNewQuestionToMaster = document.getElementById('btnSaveNewQuestionToMaster');

  function openAddQuestionModal() {
    if (modalAddQ) {
      if (mqQuestionText) mqQuestionText.value = '';
      if (mqTypeSelect) mqTypeSelect.value = 'Single choice';
      if (mqOptionsContainer) mqOptionsContainer.style.display = 'block';
      if (mqOptionsInput) mqOptionsInput.value = 'Yes, No';
      modalAddQ.classList.add('active');
      setTimeout(() => mqQuestionText?.focus(), 100);
    }
  }

  function closeAddQuestionModal() {
    if (modalAddQ) {
      modalAddQ.classList.remove('active');
    }
  }

  if (btnOpenAddQ) {
    btnOpenAddQ.addEventListener('click', openAddQuestionModal);
  }

  document.querySelectorAll('#modalAddQuestionToMaster [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeAddQuestionModal);
  });

  if (modalAddQ) {
    modalAddQ.addEventListener('click', (e) => {
      if (e.target === modalAddQ) {
        closeAddQuestionModal();
      }
    });
  }

  // Adjust options field based on response type
  if (mqTypeSelect && mqOptionsContainer) {
    mqTypeSelect.addEventListener('change', () => {
      const type = mqTypeSelect.value;
      if (type === 'Numeric' || type === 'Text') {
        mqOptionsContainer.style.display = 'none';
      } else {
        mqOptionsContainer.style.display = 'block';
        if (type === 'Dichotomous') {
          if (mqOptionsInput) mqOptionsInput.value = 'Yes, No';
        } else if (type === 'Single choice' || type === 'Multiple choice') {
          if (!mqOptionsInput.value || mqOptionsInput.value === 'Yes, No') {
            mqOptionsInput.value = 'Option 1, Option 2, Option 3';
          }
        }
      }
    });
  }

  // Save new question into Master Question Bank and select it for current survey
  if (btnSaveNewQuestionToMaster) {
    btnSaveNewQuestionToMaster.addEventListener('click', () => {
      const text = mqQuestionText ? mqQuestionText.value.trim() : '';
      if (!text) {
        alert('Please enter the question statement/text.');
        mqQuestionText?.focus();
        return;
      }

      const category = mqCategorySelect?.value || 'Demographics';
      const type = mqTypeSelect?.value || 'Single choice';
      let options = '';

      if (type === 'Numeric' || type === 'Text') {
        options = '';
      } else {
        options = (mqOptionsInput?.value || '').trim();
      }

      // Compute next sequential Q code
      const currentBank = Store.getQuestionBank();
      let maxNum = 0;
      currentBank.forEach(q => {
        const m = (q.code || q.id || '').match(/Q-(\d+)/i);
        if (m) {
          const n = parseInt(m[1], 10);
          if (!isNaN(n) && n > maxNum) maxNum = n;
        }
      });
      const nextNum = Math.max(maxNum + 1, currentBank.length + 1);
      const newCode = `Q-${nextNum.toString().padStart(2, '0')}`;

      const newQuestion = {
        id: newCode,
        code: newCode,
        category: category,
        text: text,
        type: type,
        options: options,
        voice: false,
        image: false,
        video: false,
        required: true
      };

      // Add to master question bank in Store
      Store.addQuestion(newQuestion);

      // Refresh master questions in memory and auto-select
      masterQuestions = Store.getQuestionBank();
      selectedQuestionIds.add(newQuestion.id);

      // Update category dropdown and checklist view
      populateCategoryFilter();
      renderQuestionsList();
      closeAddQuestionModal();

      showToast(`✅ Question "${newCode}" added to Master Repository and auto-selected for this Survey!`);
    });
  }

  // Publish Survey Handler
  function handlePublishSurvey() {
    const name = document.getElementById('csSurveyNameIn')?.value.trim();
    const desc = document.getElementById('csSurveyDescIn')?.value.trim();
    const project = document.getElementById('csSurveyProjectSelect')?.value;
    const minRespondents = parseInt(document.getElementById('csSurveyMinRespondentsIn')?.value) || 100;
    const rawInvestigators = document.getElementById('csSurveyInvestigatorsIn')?.value.trim() || 'Field Team Alpha';
    const assignedSurveyors = rawInvestigators.split(',').map(s => s.trim()).filter(Boolean);

    if (!name) {
      alert('Please enter a Survey Title.');
      document.getElementById('csSurveyNameIn')?.focus();
      return;
    }

    const mapped = masterQuestions.filter(q => selectedQuestionIds.has(q.id));

    if (mapped.length === 0) {
      alert('Please select at least 1 question to map to this survey.');
      return;
    }

    const existingSurveys = Store.getSurveys();
    const newSurvey = {
      id: `SRV-0${existingSurveys.length + 1}`,
      name: name,
      description: desc || 'Field assessment instrument deployed to project clusters.',
      project: project,
      minRespondents: minRespondents,
      targetSample: minRespondents,
      collectedSamples: 0,
      progress: 0,
      assignedSurveyors: assignedSurveyors.length > 0 ? assignedSurveyors : ['Field Investigator Team'],
      questions: [...mapped],
      status: 'Active'
    };

    Store.addSurvey(newSurvey);
    showToast(`Survey "${name}" published with ${mapped.length} questions and ${newSurvey.assignedSurveyors.length} investigators assigned!`);

    setTimeout(() => {
      window.location.href = 'activities.html?category=survey';
    }, 800);
  }

  document.getElementById('btnPublishSurveyInPage')?.addEventListener('click', handlePublishSurvey);
  document.querySelectorAll('.btnPublishSurveyTrigger').forEach(btn => {
    btn.addEventListener('click', handlePublishSurvey);
  });

  renderQuestionsList();
});
