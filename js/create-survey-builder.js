/**
 * Interactive Create Survey Builder
 * Supports Step 1 (General Information), Step 2 (5 Question Types Builder),
 * Live Preview Modal, and localStorage persistence via SurveyStore
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

  // ── State ──
  let currentStep = 1;
  let attachedFiles = [];

  // Default initial question
  let questions = [
    {
      id: `q-${Date.now()}-1`,
      type: 'single_choice',
      question: '',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: true,
      allowVoice: false,
      allowVideo: false,
      allowImage: false
    }
  ];

  // DOM Elements - Stepper & Containers
  const stepTab1 = document.getElementById('stepTab1');
  const stepTab2 = document.getElementById('stepTab2');
  const step1Container = document.getElementById('step1Container');
  const step2Container = document.getElementById('step2Container');

  // Step 1 Form Elements
  const surveyNameIn = document.getElementById('surveyNameIn');
  const surveyStartDateIn = document.getElementById('surveyStartDateIn');
  const surveyEndDateIn = document.getElementById('surveyEndDateIn');
  const surveyParticipantsIn = document.getElementById('surveyParticipantsIn');
  const surveyDescIn = document.getElementById('surveyDescIn');
  const targetPills = document.querySelectorAll('.cs-target-pill');
  const btnContinueToStep2 = document.getElementById('btnContinueToStep2');

  // Dropzone Elements
  const fileDropzone = document.getElementById('fileDropzone');
  const fileInputHidden = document.getElementById('fileInputHidden');
  const attachedFilesList = document.getElementById('attachedFilesList');

  // Step 2 Question Builder Elements
  const questionsListContainer = document.getElementById('questionsListContainer');
  const questionCountBadge = document.getElementById('questionCountBadge');
  const btnBackToStep1 = document.getElementById('btnBackToStep1');
  const btnSaveSurvey = document.getElementById('btnSaveSurvey');
  const btnSaveAndAllocate = document.getElementById('btnSaveAndAllocate');

  // Preview Modal Elements
  const btnLivePreviewTop = document.getElementById('btnLivePreviewTop');
  const btnPreviewBottom = document.getElementById('btnPreviewBottom');
  const livePreviewModal = document.getElementById('livePreviewModal');
  const btnCloseLivePreview = document.getElementById('btnCloseLivePreview');
  const btnCloseLivePreviewFooter = document.getElementById('btnCloseLivePreviewFooter');
  const previewSurveyTitle = document.getElementById('previewSurveyTitle');
  const previewSurveyDesc = document.getElementById('previewSurveyDesc');
  const previewDateRange = document.getElementById('previewDateRange');
  const previewTargetCount = document.getElementById('previewTargetCount');
  const previewQuestionsList = document.getElementById('previewQuestionsList');
  const previewTotalCount = document.getElementById('previewTotalCount');

  // Initialize Default Dates
  const today = new Date().toISOString().split('T')[0];
  const threeWeeksLater = new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0];
  if (surveyStartDateIn && !surveyStartDateIn.value) surveyStartDateIn.value = today;
  if (surveyEndDateIn && !surveyEndDateIn.value) surveyEndDateIn.value = threeWeeksLater;

  // Target Sample Size Quick Pills
  targetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      targetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const val = pill.getAttribute('data-val');
      if (surveyParticipantsIn) surveyParticipantsIn.value = val;
    });
  });

  if (surveyParticipantsIn) {
    surveyParticipantsIn.addEventListener('input', () => {
      const val = surveyParticipantsIn.value;
      targetPills.forEach(pill => {
        if (pill.getAttribute('data-val') === val) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    });
  }

  // ── File Upload / Drag & Drop ──
  if (fileDropzone && fileInputHidden) {
    fileDropzone.addEventListener('click', () => fileInputHidden.click());

    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('dragover');
    });

    fileDropzone.addEventListener('dragleave', () => {
      fileDropzone.classList.remove('dragover');
    });

    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    });

    fileInputHidden.addEventListener('change', () => {
      if (fileInputHidden.files && fileInputHidden.files.length) {
        addFiles(fileInputHidden.files);
      }
    });
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function addFiles(fileList) {
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      attachedFiles.push({
        id: `f-${Date.now()}-${i}`,
        name: f.name,
        size: formatBytes(f.size),
        type: f.name.split('.').pop()?.toUpperCase() || 'DOC'
      });
    }
    renderAttachedFiles();
  }

  function renderAttachedFiles() {
    if (!attachedFilesList) return;
    if (attachedFiles.length === 0) {
      attachedFilesList.innerHTML = '';
      return;
    }
    attachedFilesList.innerHTML = attachedFiles.map((file, idx) => `
      <div class="cs-file-item">
        <div class="cs-file-item-left">
          <i class="pi pi-file" style="color: #2563eb; font-size: 1.1rem;"></i>
          <span style="font-weight: 700; color: #0f172a;">${escapeHtml(file.name)}</span>
          <span style="font-size: 0.72rem; color: #64748b;">(${file.size})</span>
        </div>
        <i class="pi pi-times cs-file-remove" data-idx="${idx}" title="Remove file"></i>
      </div>
    `).join('');

    attachedFilesList.querySelectorAll('.cs-file-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        attachedFiles.splice(idx, 1);
        renderAttachedFiles();
      });
    });
  }

  // ── Step Navigation ──
  function goToStep(step) {
    if (step === 2) {
      const name = surveyNameIn.value.trim();
      if (!name) {
        surveyNameIn.focus();
        surveyNameIn.style.borderColor = '#ef4444';
        alert('Please enter a Survey Name before continuing.');
        return;
      }
      surveyNameIn.style.borderColor = '#cbd5e1';
      currentStep = 2;
      step1Container.style.display = 'none';
      step2Container.style.display = 'block';

      stepTab1.classList.remove('active');
      stepTab1.classList.add('completed');
      stepTab1.querySelector('.cs-step-num').innerHTML = '<i class="pi pi-check" style="font-weight: 900; font-size: 13px;"></i>';

      stepTab2.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderQuestionsList();
    } else {
      currentStep = 1;
      step2Container.style.display = 'none';
      step1Container.style.display = 'block';

      stepTab2.classList.remove('active');
      stepTab1.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (btnContinueToStep2) {
    btnContinueToStep2.addEventListener('click', () => goToStep(2));
  }

  if (btnBackToStep1) {
    btnBackToStep1.addEventListener('click', () => goToStep(1));
  }

  if (stepTab1) {
    stepTab1.addEventListener('click', () => goToStep(1));
  }

  if (stepTab2) {
    stepTab2.addEventListener('click', () => {
      if (surveyNameIn.value.trim()) goToStep(2);
    });
  }

  // ── Question Factory & Formats ──
  function createQuestion(type) {
    const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    switch (type) {
      case 'single_choice':
        return {
          id,
          type,
          question: '',
          options: ['Option 1', 'Option 2', 'Option 3'],
          required: true,
          allowVoice: false,
          allowVideo: false,
          allowImage: false
        };
      case 'multiple_choice':
        return {
          id,
          type,
          question: '',
          options: ['Option 1', 'Option 2', 'Option 3'],
          required: true,
          allowVoice: false,
          allowVideo: false,
          allowImage: false
        };
      case 'likert_scale':
        return {
          id,
          type,
          question: '',
          likertConfig: {
            points: 5,
            lowLabel: 'Very Dissatisfied',
            midLabel: 'Neutral',
            highLabel: 'Very Satisfied',
            labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
          },
          required: true,
          allowVoice: false,
          allowVideo: false,
          allowImage: false
        };
      case 'dichotomous':
        return {
          id,
          type,
          question: '',
          dichotomousLabels: ['Yes', 'No'],
          required: true,
          allowVoice: false,
          allowVideo: false,
          allowImage: false
        };
      case 'descriptive':
        return {
          id,
          type,
          question: '',
          placeholder: 'Type detailed observations or respondent response here…',
          required: true,
          allowVoice: true,
          allowVideo: false,
          allowImage: true
        };
      default:
        return {
          id,
          type: 'single_choice',
          question: '',
          options: ['Option 1', 'Option 2'],
          required: true
        };
    }
  }

  // ── Render Step 2 Question Cards ──
  function renderQuestionsList() {
    if (!questionsListContainer) return;

    if (questionCountBadge) {
      questionCountBadge.textContent = `${questions.length} Question${questions.length !== 1 ? 's' : ''} added`;
    }

    questionsListContainer.innerHTML = questions.map((q, idx) => {
      return `
        <div class="question-builder-card" data-id="${q.id}">
          <!-- Top Row: #, Type Dropdown, Required, Controls -->
          <div class="qbc-top-row">
            <div class="qbc-left">
              <div class="qbc-num-badge">${idx + 1}</div>
              <select class="qbc-type-select" data-action="change-type" data-id="${q.id}">
                <option value="single_choice" ${q.type === 'single_choice' ? 'selected' : ''}>Single Choice</option>
                <option value="multiple_choice" ${q.type === 'multiple_choice' ? 'selected' : ''}>Multiple Choice</option>
                <option value="likert_scale" ${q.type === 'likert_scale' ? 'selected' : ''}>Likert Scale</option>
                <option value="dichotomous" ${q.type === 'dichotomous' ? 'selected' : ''}>Dichotomous</option>
                <option value="descriptive" ${q.type === 'descriptive' ? 'selected' : ''}>Descriptive</option>
              </select>
            </div>

            <div class="qbc-right-actions">
              <label class="qbc-required-toggle">
                <input type="checkbox" data-action="toggle-required" data-id="${q.id}" ${q.required ? 'checked' : ''}>
                <span>Required</span>
              </label>

              <button type="button" class="qbc-icon-btn" data-action="move-up" data-id="${q.id}" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>
                <i class="pi pi-arrow-up"></i>
              </button>

              <button type="button" class="qbc-icon-btn" data-action="move-down" data-id="${q.id}" title="Move Down" ${idx === questions.length - 1 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>
                <i class="pi pi-arrow-down"></i>
              </button>

              <button type="button" class="qbc-icon-btn" data-action="duplicate" data-id="${q.id}" title="Duplicate Question">
                <i class="pi pi-copy"></i>
              </button>

              <button type="button" class="qbc-icon-btn danger" data-action="delete" data-id="${q.id}" title="Delete Question" ${questions.length === 1 ? 'style="opacity:0.3;pointer-events:none;"' : ''}>
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>

          <!-- Question Prompt Input -->
          <input type="text" class="qbc-prompt-input" data-action="edit-prompt" data-id="${q.id}" placeholder="Type your question prompt here..." value="${escapeHtml(q.question || '')}">

          <!-- Format specific UI -->
          ${renderFormatInputs(q)}

          <!-- Participant Media Capture -->
          <div class="qbc-media-capture-box">
            <div>
              <div class="qbc-media-title">Participant Media Capture</div>
              <div class="qbc-media-sub">Allow surveyor to capture voice note, video, or participant photo</div>
            </div>
            <div class="qbc-media-toggles">
              <button type="button" class="qbc-media-btn ${q.allowVoice ? 'active' : ''}" data-action="toggle-media" data-media="allowVoice" data-id="${q.id}">
                <i class="pi pi-volume-up"></i>
                <span>Voice Note</span>
              </button>
              <button type="button" class="qbc-media-btn ${q.allowVideo ? 'active' : ''}" data-action="toggle-media" data-media="allowVideo" data-id="${q.id}">
                <i class="pi pi-video"></i>
                <span>Video Note</span>
              </button>
              <button type="button" class="qbc-media-btn ${q.allowImage ? 'active' : ''}" data-action="toggle-media" data-media="allowImage" data-id="${q.id}">
                <i class="pi pi-camera"></i>
                <span>Photo / Image</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    attachQuestionEventListeners();
  }

  function renderFormatInputs(q) {
    if (q.type === 'single_choice' || q.type === 'multiple_choice') {
      const isRadio = q.type === 'single_choice';
      return `
        <div>
          <div class="qbc-options-title">OPTIONS</div>
          <div class="qbc-options-wrap">
            ${(q.options || ['Option 1', 'Option 2']).map((opt, oIdx) => `
              <div class="qbc-option-row">
                <div class="${isRadio ? 'qbc-option-radio-visual' : 'qbc-option-check-visual'}"></div>
                <input type="text" class="qbc-option-input" data-action="edit-option" data-id="${q.id}" data-oidx="${oIdx}" value="${escapeHtml(opt)}" placeholder="Option ${oIdx + 1}">
                ${(q.options.length > 2) ? `
                  <button type="button" class="qbc-option-remove" data-action="remove-option" data-id="${q.id}" data-oidx="${oIdx}">
                    <i class="pi pi-times"></i>
                  </button>
                ` : ''}
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-add-option" data-action="add-option" data-id="${q.id}">
            <i class="pi pi-plus" style="font-size: 11px;"></i>
            <span>Add Option</span>
          </button>
        </div>
      `;
    }

    if (q.type === 'likert_scale') {
      const labels = q.likertConfig?.labels || ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'];
      return `
        <div style="background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 12px; padding: 14px; margin-top: 10px;">
          <div style="font-size: 0.76rem; font-weight: 800; color: #7e22ce; margin-bottom: 8px;">
            5-POINT SCALE PREVIEWS
          </div>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; text-align: center;">
            ${labels.map((l, lIdx) => `
              <div style="background: #ffffff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 8px 4px;">
                <div style="font-size: 0.85rem; font-weight: 800; color: #7e22ce;">${lIdx + 1}</div>
                <div style="font-size: 0.68rem; font-weight: 600; color: #475569; margin-top: 2px;">${escapeHtml(l)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (q.type === 'dichotomous') {
      const labels = q.dichotomousLabels || ['Yes', 'No'];
      return `
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px; margin-top: 10px;">
          <div style="font-size: 0.76rem; font-weight: 800; color: #b45309; margin-bottom: 8px;">
            BINARY DECISION OPTIONS
          </div>
          <div style="display: flex; gap: 10px;">
            <div style="flex: 1; padding: 10px; border-radius: 8px; background: #ffffff; border: 1px solid #fde68a; font-size: 0.85rem; font-weight: 800; color: #92400e; text-align: center;">
              ${escapeHtml(labels[0])}
            </div>
            <div style="flex: 1; padding: 10px; border-radius: 8px; background: #ffffff; border: 1px solid #fde68a; font-size: 0.85rem; font-weight: 800; color: #92400e; text-align: center;">
              ${escapeHtml(labels[1])}
            </div>
          </div>
        </div>
      `;
    }

    if (q.type === 'descriptive') {
      return `
        <div style="margin-top: 8px;">
          <textarea class="cs-input" rows="2" placeholder="${escapeHtml(q.placeholder || 'Type detailed observations or respondent response here…')}" disabled style="background: #f8fafc; cursor: not-allowed; resize: none;"></textarea>
        </div>
      `;
    }

    return '';
  }

  function attachQuestionEventListeners() {
    // Edit prompt
    questionsListContainer.querySelectorAll('[data-action="edit-prompt"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = input.getAttribute('data-id');
        const q = questions.find(item => item.id === id);
        if (q) q.question = e.target.value;
      });
    });

    // Change Question Type
    questionsListContainer.querySelectorAll('[data-action="change-type"]').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        const newType = e.target.value;
        const qIdx = questions.findIndex(item => item.id === id);
        if (qIdx !== -1) {
          const oldPrompt = questions[qIdx].question;
          const oldReq = questions[qIdx].required;
          const updated = createQuestion(newType);
          updated.id = id;
          updated.question = oldPrompt;
          updated.required = oldReq;
          questions[qIdx] = updated;
          renderQuestionsList();
        }
      });
    });

    // Toggle required
    questionsListContainer.querySelectorAll('[data-action="toggle-required"]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = chk.getAttribute('data-id');
        const q = questions.find(item => item.id === id);
        if (q) q.required = e.target.checked;
      });
    });

    // Move Up
    questionsListContainer.querySelectorAll('[data-action="move-up"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const idx = questions.findIndex(item => item.id === id);
        if (idx > 0) {
          const temp = questions[idx];
          questions[idx] = questions[idx - 1];
          questions[idx - 1] = temp;
          renderQuestionsList();
        }
      });
    });

    // Move Down
    questionsListContainer.querySelectorAll('[data-action="move-down"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const idx = questions.findIndex(item => item.id === id);
        if (idx < questions.length - 1) {
          const temp = questions[idx];
          questions[idx] = questions[idx + 1];
          questions[idx + 1] = temp;
          renderQuestionsList();
        }
      });
    });

    // Duplicate
    questionsListContainer.querySelectorAll('[data-action="duplicate"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const idx = questions.findIndex(item => item.id === id);
        if (idx !== -1) {
          const original = questions[idx];
          const cloned = JSON.parse(JSON.stringify(original));
          cloned.id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          questions.splice(idx + 1, 0, cloned);
          renderQuestionsList();
        }
      });
    });

    // Delete
    questionsListContainer.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (questions.length <= 1) return;
        const id = btn.getAttribute('data-id');
        questions = questions.filter(item => item.id !== id);
        renderQuestionsList();
      });
    });

    // Edit Option
    questionsListContainer.querySelectorAll('[data-action="edit-option"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = input.getAttribute('data-id');
        const oidx = parseInt(input.getAttribute('data-oidx'), 10);
        const q = questions.find(item => item.id === id);
        if (q && q.options && q.options[oidx] !== undefined) {
          q.options[oidx] = e.target.value;
        }
      });
    });

    // Remove Option
    questionsListContainer.querySelectorAll('[data-action="remove-option"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const oidx = parseInt(btn.getAttribute('data-oidx'), 10);
        const q = questions.find(item => item.id === id);
        if (q && q.options && q.options.length > 2) {
          q.options.splice(oidx, 1);
          renderQuestionsList();
        }
      });
    });

    // Add Option
    questionsListContainer.querySelectorAll('[data-action="add-option"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const q = questions.find(item => item.id === id);
        if (q && q.options) {
          q.options.push(`Option ${q.options.length + 1}`);
          renderQuestionsList();
        }
      });
    });

    // Toggle Media
    questionsListContainer.querySelectorAll('[data-action="toggle-media"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const mediaProp = btn.getAttribute('data-media');
        const q = questions.find(item => item.id === id);
        if (q) {
          q[mediaProp] = !q[mediaProp];
          btn.classList.toggle('active', q[mediaProp]);
        }
      });
    });
  }

  // ── Format Quick-Add Bottom Cards ──
  document.querySelectorAll('.cs-format-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-type');
      if (type) {
        questions.push(createQuestion(type));
        renderQuestionsList();
        // Scroll to the new card
        setTimeout(() => {
          const cards = questionsListContainer.querySelectorAll('.question-builder-card');
          if (cards.length) {
            cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 80);
      }
    });
  });

  // ── Live Preview Modal Render ──
  function openLivePreview() {
    if (!livePreviewModal) return;

    const title = surveyNameIn.value.trim() || 'Untitled Survey';
    const desc = surveyDescIn.value.trim();
    const start = surveyStartDateIn.value;
    const end = surveyEndDateIn.value;
    const target = surveyParticipantsIn.value || 100;

    previewSurveyTitle.textContent = title;
    if (previewSurveyDesc) {
      previewSurveyDesc.textContent = desc || 'Field survey instructions and questionnaires for assigned cluster.';
    }
    if (previewDateRange) {
      previewDateRange.textContent = `📅 Active: ${start} → ${end}`;
    }
    if (previewTargetCount) {
      previewTargetCount.textContent = `🎯 Target: ${target} responses`;
    }
    if (previewTotalCount) {
      previewTotalCount.textContent = `${questions.length} question${questions.length !== 1 ? 's' : ''} in survey`;
    }

    if (previewQuestionsList) {
      previewQuestionsList.innerHTML = questions.map((q, idx) => {
        return `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(15,23,42,0.03);">
            <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px;">
              <span style="font-size: 0.85rem; font-weight: 800; color: #2563eb;">${idx + 1}.</span>
              <div style="font-size: 0.88rem; font-weight: 700; color: #0f172a; flex: 1;">
                ${escapeHtml(q.question || `Untitled Question ${idx + 1}`)}
                ${q.required ? '<span style="color: #ef4444; margin-left: 3px;">*</span>' : ''}
              </div>
            </div>

            <!-- Single choice preview -->
            ${q.type === 'single_choice' ? `
              <div style="margin-left: 20px; display: flex; flex-direction: column; gap: 8px;">
                ${(q.options || []).map(opt => `
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #334155; cursor: pointer;">
                    <input type="radio" name="preview_${q.id}">
                    <span>${escapeHtml(opt)}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}

            <!-- Multiple choice preview -->
            ${q.type === 'multiple_choice' ? `
              <div style="margin-left: 20px; display: flex; flex-direction: column; gap: 8px;">
                ${(q.options || []).map(opt => `
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #334155; cursor: pointer;">
                    <input type="checkbox">
                    <span>${escapeHtml(opt)}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}

            <!-- Likert preview -->
            ${q.type === 'likert_scale' ? `
              <div style="margin-left: 10px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; text-align: center;">
                ${(q.likertConfig?.labels || ['1', '2', '3', '4', '5']).map((l, lIdx) => `
                  <button type="button" style="padding: 8px 4px; border-radius: 8px; border: 1px solid #e9d5ff; background: #faf5ff; color: #7e22ce; font-size: 0.76rem; font-weight: 800; cursor: pointer;">
                    <div>${lIdx + 1}</div>
                    <div style="font-size: 0.64rem; font-weight: 600; color: #64748b; margin-top: 2px;">${escapeHtml(l)}</div>
                  </button>
                `).join('')}
              </div>
            ` : ''}

            <!-- Dichotomous preview -->
            ${q.type === 'dichotomous' ? `
              <div style="margin-left: 20px; display: flex; gap: 10px;">
                <button type="button" style="padding: 6px 18px; border-radius: 8px; border: 1px solid #fde68a; background: #fffbeb; color: #92400e; font-size: 0.8rem; font-weight: 800; cursor: pointer;">
                  ${escapeHtml(q.dichotomousLabels?.[0] || 'Yes')}
                </button>
                <button type="button" style="padding: 6px 18px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-size: 0.8rem; font-weight: 800; cursor: pointer;">
                  ${escapeHtml(q.dichotomousLabels?.[1] || 'No')}
                </button>
              </div>
            ` : ''}

            <!-- Descriptive preview -->
            ${q.type === 'descriptive' ? `
              <div style="margin-left: 20px;">
                <textarea rows="2" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; outline: none; resize: none;" placeholder="${escapeHtml(q.placeholder || 'Write response here…')}"></textarea>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    livePreviewModal.style.display = 'flex';
  }

  function closeLivePreview() {
    if (livePreviewModal) livePreviewModal.style.display = 'none';
  }

  if (btnLivePreviewTop) btnLivePreviewTop.addEventListener('click', openLivePreview);
  if (btnPreviewBottom) btnPreviewBottom.addEventListener('click', openLivePreview);
  if (btnCloseLivePreview) btnCloseLivePreview.addEventListener('click', closeLivePreview);
  if (btnCloseLivePreviewFooter) btnCloseLivePreviewFooter.addEventListener('click', closeLivePreview);

  if (livePreviewModal) {
    livePreviewModal.addEventListener('click', (e) => {
      if (e.target === livePreviewModal) closeLivePreview();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && livePreviewModal && livePreviewModal.style.display === 'flex') {
      closeLivePreview();
    }
  });

  // ── Save Survey ──
  function handleSaveSurvey(andAllocate = false) {
    const title = surveyNameIn.value.trim();
    if (!title) {
      goToStep(1);
      surveyNameIn.focus();
      alert('Please provide a Survey Name.');
      return;
    }

    // Ensure questions have at least a basic prompt
    questions.forEach((q, i) => {
      if (!q.question.trim()) {
        q.question = `Survey Question ${i + 1}`;
      }
    });

    const surveyData = {
      title,
      description: surveyDescIn.value.trim(),
      startDate: surveyStartDateIn.value,
      endDate: surveyEndDateIn.value,
      participantsRequired: parseInt(surveyParticipantsIn.value, 10) || 100,
      documents: attachedFiles,
      questions: questions,
      submissionStatus: 'draft'
    };

    if (window.SurveyStore) {
      const saved = window.SurveyStore.saveSurvey(surveyData);
      if (andAllocate) {
        window.location.href = `activities.html?surveyId=${saved.id}&title=${encodeURIComponent(saved.title)}`;
      } else {
        window.location.href = 'surveys.html?saved=true';
      }
    } else {
      window.location.href = 'surveys.html';
    }
  }

  if (btnSaveSurvey) {
    btnSaveSurvey.addEventListener('click', () => handleSaveSurvey(false));
  }

  if (btnSaveAndAllocate) {
    btnSaveAndAllocate.addEventListener('click', () => handleSaveSurvey(true));
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
});
