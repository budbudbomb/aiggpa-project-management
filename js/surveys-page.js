/**
 * Surveys Page Controller (Survey Management)
 * Matches Schame-managemt /admin/surveys page
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggling
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
      try {
        localStorage.setItem('aiggpa_sidebar_collapsed', isCollapsed);
      } catch (e) {}
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

  // User Dropdown
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

  // State
  let currentFilter = 'all';
  let searchTerm = '';

  // DOM Elements
  const kpiTotal = document.getElementById('kpiTotalSurveys');
  const kpiActive = document.getElementById('kpiActiveSurveys');
  const kpiTarget = document.getElementById('kpiTotalTarget');
  const kpiResponses = document.getElementById('kpiTotalResponses');
  const kpiRate = document.getElementById('kpiOverallRate');

  const countAll = document.getElementById('countAllSurveys');
  const countActive = document.getElementById('countActiveSurveys');
  const countClosed = document.getElementById('countClosedSurveys');

  const searchInput = document.getElementById('surveySearchInput');
  const filterTabs = document.querySelectorAll('.survey-tab-pill');
  const cardsContainer = document.getElementById('surveyCardsContainer');

  // Modal elements
  const detailsModal = document.getElementById('surveyDetailsModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalSurveyTitle');
  const modalBadge = document.getElementById('modalSurveyBadge');
  const modalQCount = document.getElementById('modalSurveyQCount');
  const modalTabQuestions = document.getElementById('modalTabQuestions');
  const modalTabFeedback = document.getElementById('modalTabFeedback');
  const modalQuestionsContent = document.getElementById('modalQuestionsContent');
  const modalFeedbackContent = document.getElementById('modalFeedbackContent');

  function formatDate(dStr) {
    if (!dStr) return '';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return new Date(dStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dStr;
    }
  }

  function getBadgeConfig(subStatus, surveyStatus) {
    if (subStatus === 'approved') {
      return { label: 'Approved', cssClass: 'badge-emerald', icon: 'pi-check-circle' };
    }
    if (subStatus === 'submitted_by_pc') {
      return { label: 'SUBMITTED BY PC', cssClass: 'badge-purple', icon: 'pi-check-circle' };
    }
    if (subStatus === 'submitted_by_fellow') {
      return { label: 'SUBMITTED BY FELLOW', cssClass: 'badge-blue', icon: 'pi-check-circle' };
    }
    if (subStatus === 'submitted_by_intern') {
      return { label: 'SUBMITTED BY INTERN', cssClass: 'badge-amber', icon: 'pi-check-circle' };
    }
    if (surveyStatus === 'closed') {
      return { label: 'CLOSED', cssClass: 'badge-slate', icon: 'pi-lock' };
    }
    return { label: 'ACTIVE (DRAFT)', cssClass: 'badge-emerald', icon: 'pi-check-circle' };
  }

  function renderKPIs(surveys) {
    const total = surveys.length;
    const active = surveys.filter(s => s.status !== 'closed').length;
    const closed = surveys.filter(s => s.status === 'closed').length;
    const target = surveys.reduce((acc, s) => acc + (s.participantsRequired || 100), 0);
    const responses = surveys.reduce((acc, s) => acc + (s.responsesCount || 0), 0);
    const rate = target > 0 ? Math.round((responses / target) * 100) : 0;

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiActive) kpiActive.textContent = active;
    if (kpiTarget) kpiTarget.textContent = target;
    if (kpiResponses) kpiResponses.textContent = responses;
    if (kpiRate) kpiRate.textContent = `(${rate}%)`;

    if (countAll) countAll.textContent = total;
    if (countActive) countActive.textContent = active;
    if (countClosed) countClosed.textContent = closed;
  }

  function renderCards() {
    const allSurveys = window.SurveyStore ? window.SurveyStore.getSurveys() : [];
    renderKPIs(allSurveys);

    const filtered = allSurveys.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter =
        currentFilter === 'all' ||
        (currentFilter === 'active' && s.status !== 'closed') ||
        (currentFilter === 'closed' && s.status === 'closed');
      return matchesSearch && matchesFilter;
    });

    if (!cardsContainer) return;

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 48px 20px; text-align: center;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: inline-flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 12px;">
            <i class="pi pi-file-edit"></i>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 6px;">No surveys found</h3>
          <p style="font-size: 0.82rem; color: #64748b; max-width: 400px; margin: 0 auto 16px;">
            ${searchTerm ? `No surveys matched your search "${searchTerm}".` : 'Get started by creating your first structured survey questionnaire.'}
          </p>
          <a href="create-survey.html" class="btn-create-survey-main" style="display: inline-flex;">
            <i class="pi pi-plus" style="font-weight: 800;"></i>
            <span>Create Survey Now</span>
          </a>
        </div>
      `;
      return;
    }

    cardsContainer.innerHTML = filtered.map(survey => {
      const req = survey.participantsRequired || 100;
      const resCount = survey.responsesCount || 0;
      const percent = Math.min(100, Math.round((resCount / req) * 100));
      const questionCount = survey.questions?.length || 0;
      const feedbackCount = survey.feedbacks?.length || 0;
      const badge = getBadgeConfig(survey.submissionStatus, survey.status);

      let fillClass = 'fill-blue';
      if (percent >= 100) fillClass = 'fill-emerald';
      else if (percent < 45) fillClass = 'fill-amber';

      return `
        <div class="survey-card" data-id="${survey.id}">
          <div>
            <!-- Top Badges Row -->
            <div class="survey-card-top-row">
              <span class="survey-badge ${badge.cssClass}">
                <i class="pi ${badge.icon}" style="font-size: 10px;"></i>
                <span>${badge.label}</span>
              </span>
              <div class="survey-card-meta">
                ${feedbackCount > 0 ? `
                  <span class="review-pill">
                    <i class="pi pi-comments" style="font-size: 10px;"></i>
                    <span>${feedbackCount} Review${feedbackCount > 1 ? 's' : ''}</span>
                  </span>
                ` : ''}
                <span class="q-count">${questionCount} Qs</span>
              </div>
            </div>

            <!-- Title & Description -->
            <div style="margin-top: 12px;">
              <h3 class="survey-card-title">${escapeHtml(survey.title)}</h3>
              ${survey.description ? `<p class="survey-card-desc">${escapeHtml(survey.description)}</p>` : ''}
            </div>

            <!-- Date Range -->
            ${(survey.startDate || survey.endDate) ? `
              <div class="survey-card-dates">
                <i class="pi pi-calendar"></i>
                <span>${formatDate(survey.startDate)} &rarr; ${formatDate(survey.endDate)}</span>
              </div>
            ` : ''}

            <!-- Progress Bar -->
            <div class="survey-progress-wrap">
              <div class="survey-progress-labels">
                <span class="lbl">Stakeholders Interviewed</span>
                <span class="stat">${resCount} / ${req} (${percent}%)</span>
              </div>
              <div class="survey-progress-bar">
                <div class="survey-progress-fill ${fillClass}" style="width: ${percent}%;"></div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="survey-card-footer">
            <button type="button" class="btn-card-details" data-action="details" data-id="${survey.id}">
              <i class="pi pi-eye"></i>
              <span>Details ${feedbackCount > 0 ? `(${feedbackCount})` : ''}</span>
            </button>

            <div style="display: flex; align-items: center; gap: 8px;">
              ${!survey.isAllocatedAsTask && (survey.responsesCount || 0) === 0 ? `
                <a href="activities.html?surveyId=${survey.id}&title=${encodeURIComponent(survey.title)}" class="btn-card-allocate">
                  <span>Allocate</span>
                  <i class="pi pi-arrow-right" style="font-size: 10px;"></i>
                </a>
              ` : ''}
              <div class="btn-card-dashboard" style="pointer-events: none; cursor: default; user-select: none;">
                <i class="pi pi-chart-bar"></i>
                <span>View Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach details click listeners
    cardsContainer.querySelectorAll('[data-action="details"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDetailsModal(id);
      });
    });
  }

  function openDetailsModal(surveyId) {
    const survey = window.SurveyStore.getSurveyById(surveyId);
    if (!survey || !detailsModal) return;

    modalTitle.textContent = survey.title;
    const badge = getBadgeConfig(survey.submissionStatus, survey.status);
    modalBadge.textContent = badge.label;
    modalBadge.className = `survey-badge ${badge.cssClass}`;
    modalQCount.textContent = `${survey.questions?.length || 0} Questions`;

    // Render questions tab
    if (modalQuestionsContent) {
      if (!survey.questions || survey.questions.length === 0) {
        modalQuestionsContent.innerHTML = `<p style="font-size: 0.82rem; color: #64748b; padding: 16px 0;">No questions configured for this survey.</p>`;
      } else {
        modalQuestionsContent.innerHTML = survey.questions.map((q, idx) => {
          let typeLabel = 'Single Choice';
          if (q.type === 'multiple_choice') typeLabel = 'Multiple Choice';
          if (q.type === 'likert_scale') typeLabel = '5-Point Likert Scale';
          if (q.type === 'dichotomous') typeLabel = 'Dichotomous (Yes/No)';
          if (q.type === 'descriptive') typeLabel = 'Descriptive Response';

          return `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px;">
              <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
                <span style="font-size: 0.8rem; font-weight: 800; color: #2563eb;">Q${idx + 1}.</span>
                <span style="font-size: 0.86rem; font-weight: 700; color: #0f172a; flex: 1;">${escapeHtml(q.question || 'Untitled Question')}</span>
                <span style="font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; background: #f1f5f9; color: #475569;">${typeLabel}</span>
              </div>
              ${q.options && q.options.length ? `
                <div style="margin-left: 24px; display: flex; flex-direction: column; gap: 4px; margin-top: 8px;">
                  ${q.options.map(opt => `
                    <div style="font-size: 0.78rem; color: #475569; display: flex; align-items: center; gap: 6px;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;"></span>
                      <span>${escapeHtml(opt)}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              ${q.dichotomousLabels ? `
                <div style="margin-left: 24px; display: flex; gap: 8px; margin-top: 8px;">
                  <span style="font-size: 0.74rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; background: #fef3c7; color: #92400e;">${q.dichotomousLabels[0]}</span>
                  <span style="font-size: 0.74rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; background: #f1f5f9; color: #475569;">${q.dichotomousLabels[1]}</span>
                </div>
              ` : ''}
              ${q.likertConfig ? `
                <div style="margin-left: 24px; display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap;">
                  ${(q.likertConfig.labels || ['1', '2', '3', '4', '5']).map((l, lIdx) => `
                    <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #faf5ff; border: 1px solid #e9d5ff; color: #7e22ce;">
                      ${lIdx + 1}. ${l}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('');
      }
    }

    // Render feedback tab
    if (modalFeedbackContent) {
      if (!survey.feedbacks || survey.feedbacks.length === 0) {
        modalFeedbackContent.innerHTML = `<p style="font-size: 0.82rem; color: #64748b; padding: 16px 0; text-align: center;">No supervisory reviews or field observations submitted yet.</p>`;
      } else {
        modalFeedbackContent.innerHTML = survey.feedbacks.map(fb => `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; position: relative;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.82rem; font-weight: 800; color: #0f172a;">${escapeHtml(fb.submittedBy?.name || 'Reviewer')}</span>
                <span style="font-size: 0.7rem; font-weight: 700; padding: 1px 7px; border-radius: 999px; background: #eff6ff; color: #1d4ed8;">${escapeHtml(fb.submittedBy?.role || fb.role)}</span>
              </div>
              <span style="font-size: 0.72rem; color: #94a3b8;">${fb.createdAt || ''}</span>
            </div>
            <p style="font-size: 0.8rem; color: #334155; line-height: 1.45; margin-bottom: 8px;">${escapeHtml(fb.feedbackText)}</p>
            ${fb.challengesFaced ? `
              <div style="font-size: 0.74rem; background: #fff1f2; border-left: 3px solid #f43f5e; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px; color: #9f1239;">
                <strong>Field Bottleneck:</strong> ${escapeHtml(fb.challengesFaced)}
              </div>
            ` : ''}
            ${fb.recommendations ? `
              <div style="font-size: 0.74rem; background: #f0fdf4; border-left: 3px solid #22c55e; padding: 6px 10px; border-radius: 4px; color: #166534;">
                <strong>Recommendation:</strong> ${escapeHtml(fb.recommendations)}
              </div>
            ` : ''}
          </div>
        `).join('');
      }
    }

    // Default to Questions tab
    switchModalTab('questions');
    detailsModal.style.display = 'flex';
  }

  function switchModalTab(tab) {
    if (tab === 'questions') {
      if (modalTabQuestions) {
        modalTabQuestions.style.background = '#0f172a';
        modalTabQuestions.style.color = '#ffffff';
      }
      if (modalTabFeedback) {
        modalTabFeedback.style.background = '#f1f5f9';
        modalTabFeedback.style.color = '#475569';
      }
      if (modalQuestionsContent) modalQuestionsContent.style.display = 'block';
      if (modalFeedbackContent) modalFeedbackContent.style.display = 'none';
    } else {
      if (modalTabFeedback) {
        modalTabFeedback.style.background = '#0f172a';
        modalTabFeedback.style.color = '#ffffff';
      }
      if (modalTabQuestions) {
        modalTabQuestions.style.background = '#f1f5f9';
        modalTabQuestions.style.color = '#475569';
      }
      if (modalQuestionsContent) modalQuestionsContent.style.display = 'none';
      if (modalFeedbackContent) modalFeedbackContent.style.display = 'block';
    }
  }

  if (modalTabQuestions) {
    modalTabQuestions.addEventListener('click', () => switchModalTab('questions'));
  }
  if (modalTabFeedback) {
    modalTabFeedback.addEventListener('click', () => switchModalTab('feedback'));
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      detailsModal.style.display = 'none';
    });
  }

  if (detailsModal) {
    detailsModal.addEventListener('click', (e) => {
      if (e.target === detailsModal) {
        detailsModal.style.display = 'none';
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailsModal && detailsModal.style.display === 'flex') {
      detailsModal.style.display = 'none';
    }
  });

  // Filter tabs click
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      renderCards();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderCards();
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial render
  renderCards();
});
