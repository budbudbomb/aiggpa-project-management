/**
 * Question Studio & Central Bank Controller
 * 100% English, Simplified Guided Question Builder with Visual Option Rows
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

  // Toast notification helper
  function showToast(msg, duration = 4000) {
    let toast = document.getElementById('qsToastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'qsToastNotification';
      toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; background: #1e293b; color: #ffffff; padding: 14px 22px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); font-size: 0.9rem; z-index: 99999; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease; border-left: 5px solid #1837d4;';
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, duration);
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

    const tabBadge = document.getElementById('tabListBadge');
    if (tabBadge) tabBadge.textContent = qbCount;

    const catalogBadge = document.getElementById('catalogCountBadge');
    if (catalogBadge) catalogBadge.textContent = `${qbCount} Questions`;

    const sbTask = document.getElementById('sidebarTaskCountBadge');
    if (sbTask) sbTask.textContent = taskCount;
  }

  // ==================== MODE CONTROLLER (LIST vs CREATE) ====================
  const btnModeCreate = document.getElementById('btnModeCreate');
  const btnModeList = document.getElementById('btnModeList');
  const sectionQBCreate = document.getElementById('sectionQBCreate');
  const sectionQBList = document.getElementById('sectionQBList');
  const btnListAddNew = document.getElementById('btnListAddNewQuestion');
  const btnEmptyAddNew = document.getElementById('btnEmptyAddNewQuestion');

  function setQBMode(mode) {
    if (mode === 'list') {
      btnModeList?.classList.add('active');
      btnModeCreate?.classList.remove('active');
      if (sectionQBCreate) sectionQBCreate.style.display = 'none';
      if (sectionQBList) sectionQBList.style.display = 'block';
      renderCatalog();
      if (window.location.hash !== '#list') {
        history.replaceState(null, '', '#list');
      }
    } else {
      btnModeCreate?.classList.add('active');
      btnModeList?.classList.remove('active');
      if (sectionQBCreate) sectionQBCreate.style.display = 'block';
      if (sectionQBList) sectionQBList.style.display = 'none';
      updateCardPreview();
      if (window.location.hash !== '#create') {
        history.replaceState(null, '', '#create');
      }
    }
  }

  btnModeCreate?.addEventListener('click', () => setQBMode('create'));
  btnModeList?.addEventListener('click', () => setQBMode('list'));
  btnListAddNew?.addEventListener('click', () => setQBMode('create'));
  btnEmptyAddNew?.addEventListener('click', () => setQBMode('create'));

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#list') {
      setQBMode('list');
    } else {
      setQBMode('create');
    }
  });

  // ==================== TABS: GUIDED BUILDER vs BULK PASTE ====================
  const tabQSVisual = document.getElementById('tabQSVisual');
  const tabQSBulk = document.getElementById('tabQSBulk');
  const panelQSVisual = document.getElementById('panelQSVisual');
  const panelQSBulk = document.getElementById('panelQSBulk');

  function switchTab(mode) {
    if (mode === 'visual') {
      tabQSVisual?.classList.add('active');
      tabQSBulk?.classList.remove('active');
      if (panelQSVisual) panelQSVisual.style.display = 'block';
      if (panelQSBulk) panelQSBulk.style.display = 'none';
      updateCardPreview();
    } else {
      tabQSBulk?.classList.add('active');
      tabQSVisual?.classList.remove('active');
      if (panelQSVisual) panelQSVisual.style.display = 'none';
      if (panelQSBulk) panelQSBulk.style.display = 'block';
    }
  }

  tabQSVisual?.addEventListener('click', () => switchTab('visual'));
  tabQSBulk?.addEventListener('click', () => switchTab('bulk'));

  // ==================== STEP 2: ANSWER TYPE SELECTION ====================
  let currentType = 'Single choice';
  const typeCards = document.querySelectorAll('.qs-type-card');

  const optionsBuilderArea = document.getElementById('qsOptionsBuilderArea');
  const bannerYesNo = document.getElementById('qsBannerYesNo');
  const bannerRating = document.getElementById('qsBannerRating');
  const bannerNumeric = document.getElementById('qsBannerNumeric');
  const bannerDescriptive = document.getElementById('qsBannerDescriptive');

  function updateTypeUI(newType) {
    currentType = newType;
    typeCards.forEach(c => {
      if (c.getAttribute('data-type') === currentType) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    // Hide all step 3 sections first
    if (optionsBuilderArea) optionsBuilderArea.style.display = 'none';
    if (bannerYesNo) bannerYesNo.style.display = 'none';
    if (bannerRating) bannerRating.style.display = 'none';
    if (bannerNumeric) bannerNumeric.style.display = 'none';
    if (bannerDescriptive) bannerDescriptive.style.display = 'none';

    // Show the appropriate section for the selected type
    if (currentType === 'Single choice' || currentType === 'Multiple choice') {
      if (optionsBuilderArea) optionsBuilderArea.style.display = 'block';
      renderOptionRows();
    } else if (currentType === 'Dichotomous') {
      if (bannerYesNo) bannerYesNo.style.display = 'flex';
    } else if (currentType === 'Likert Scale') {
      if (bannerRating) bannerRating.style.display = 'flex';
    } else if (currentType === 'Numeric') {
      if (bannerNumeric) bannerNumeric.style.display = 'flex';
    } else if (currentType === 'Descriptive') {
      if (bannerDescriptive) bannerDescriptive.style.display = 'flex';
    }

    updateCardPreview();
  }

  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      const typeVal = card.getAttribute('data-type') || 'Single choice';
      updateTypeUI(typeVal);
    });
  });

  // ==================== STEP 3: DYNAMIC ROW-BY-ROW OPTIONS BUILDER ====================
  let currentOptionsList = [
    'Agriculture / Farming',
    'Daily Wage Labor',
    'Salaried Job (Govt / Private)',
    'Business / Shop / Self-Employed'
  ];

  function renderOptionRows() {
    const container = document.getElementById('qsOptionsRowsContainer');
    if (!container) return;

    container.innerHTML = currentOptionsList.map((optText, idx) => `
      <div class="qs-option-row-item">
        <span class="qs-option-num-badge">${idx + 1}</span>
        <input type="text" class="form-control-input qs-opt-input" value="${optText.replace(/"/g, '&quot;')}" placeholder="e.g. Choice ${idx + 1}" style="height: 40px; font-size: 0.88rem;" oninput="window.handleOptionInput(${idx}, this.value)">
        ${currentOptionsList.length > 1 ? `
          <button type="button" class="qs-option-remove-btn" title="Remove choice" onclick="window.removeOptionRow(${idx})">
            ✕
          </button>
        ` : ''}
      </div>
    `).join('');
  }

  window.handleOptionInput = function(idx, val) {
    currentOptionsList[idx] = val;
    updateCardPreview();
  };

  window.removeOptionRow = function(idx) {
    if (currentOptionsList.length > 1) {
      currentOptionsList.splice(idx, 1);
      renderOptionRows();
      updateCardPreview();
    }
  };

  document.getElementById('btnAddOptionRow')?.addEventListener('click', () => {
    currentOptionsList.push('');
    renderOptionRows();
    const inputs = document.querySelectorAll('.qs-opt-input');
    if (inputs.length > 0) {
      inputs[inputs.length - 1].focus();
    }
  });

  // 1-Click Templates
  const TEMPLATES = {
    income: ['Agriculture / Farming', 'Daily Wage Labor', 'Salaried Employment', 'Trade / Shop / Business', 'Remittances / Other'],
    gender: ['Male', 'Female', 'Transgender / Other'],
    rating: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
    agreement: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree']
  };

  document.querySelectorAll('.qs-preset-chip[data-template]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tmpl = btn.getAttribute('data-template');
      if (TEMPLATES[tmpl]) {
        currentOptionsList = [...TEMPLATES[tmpl]];
        renderOptionRows();
        updateCardPreview();
        showToast(`Loaded ${TEMPLATES[tmpl].length} template choices.`);
      }
    });
  });

  // ==================== STEP 4: MULTIMEDIA TOGGLES ====================
  ['qsSingleVoice', 'qsSingleImage', 'qsSingleVideo'].forEach(mId => {
    const el = document.getElementById(mId);
    if (el) {
      el.addEventListener('click', () => {
        const isActive = el.classList.toggle('active');
        el.setAttribute('data-active', isActive ? 'true' : 'false');
        updateCardPreview();
      });
    }
  });

  // ==================== RIGHT COLUMN: LIVE SURVEYOR PREVIEW ====================
  function updateCardPreview() {
    const text = document.getElementById('qsSingleText')?.value.trim() || 'What is the primary source of household monthly income?';
    const cat = document.getElementById('qsSingleCat')?.value || 'Income & Livelihood';
    const hasVoice = document.getElementById('qsSingleVoice')?.getAttribute('data-active') === 'true';
    const hasImage = document.getElementById('qsSingleImage')?.getAttribute('data-active') === 'true';
    const hasVideo = document.getElementById('qsSingleVideo')?.getAttribute('data-active') === 'true';

    const pText = document.getElementById('qsPreviewQuestionText');
    const pTypeBadge = document.getElementById('qsPreviewTypeBadge');
    const pCategory = document.getElementById('qsPreviewCategory');
    const pOpts = document.getElementById('qsPreviewOptionsContainer');
    const pMedia = document.getElementById('qsPreviewMediaBar');

    if (pText) pText.textContent = text;
    if (pCategory) pCategory.textContent = cat;

    const TYPE_TITLES = {
      'Single choice': 'Single Choice',
      'Multiple choice': 'Multiple Choice',
      'Dichotomous': 'Yes / No',
      'Likert Scale': 'Rating (1–5)',
      'Numeric': 'Number / Amount',
      'Descriptive': 'Text Response'
    };

    if (pTypeBadge) pTypeBadge.textContent = TYPE_TITLES[currentType] || currentType;

    if (pOpts) {
      if (currentType === 'Single choice') {
        const activeOpts = currentOptionsList.filter(o => o.trim().length > 0);
        const displayList = activeOpts.length > 0 ? activeOpts : ['Choice 1', 'Choice 2'];
        pOpts.innerHTML = displayList.map((opt, i) => `
          <label style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="radio" name="previewRadio" ${i === 0 ? 'checked' : ''} style="cursor: pointer;">
            <span>${opt}</span>
          </label>
        `).join('');
      } else if (currentType === 'Multiple choice') {
        const activeOpts = currentOptionsList.filter(o => o.trim().length > 0);
        const displayList = activeOpts.length > 0 ? activeOpts : ['Choice 1', 'Choice 2'];
        pOpts.innerHTML = displayList.map((opt, i) => `
          <label style="display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" ${i === 0 ? 'checked' : ''} style="cursor: pointer;">
            <span>${opt}</span>
          </label>
        `).join('');
      } else if (currentType === 'Dichotomous') {
        pOpts.innerHTML = `
          <div style="display: flex; gap: 12px;">
            <button type="button" style="flex: 1; padding: 12px; border-radius: 8px; border: 1.5px solid #22c55e; background: #f0fdf4; color: #15803d; font-weight: 700; font-size: 0.88rem;">
              ✓ Yes
            </button>
            <button type="button" style="flex: 1; padding: 12px; border-radius: 8px; border: 1.5px solid #cbd5e1; background: #ffffff; color: #475569; font-weight: 700; font-size: 0.88rem;">
              ✕ No
            </button>
          </div>
        `;
      } else if (currentType === 'Likert Scale') {
        pOpts.innerHTML = `
          <div style="display: flex; gap: 6px; justify-content: space-between; padding: 6px 0;">
            ${[1, 2, 3, 4, 5].map(num => `
              <div style="flex: 1; text-align: center; padding: 10px 4px; background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 8px; font-weight: 800; color: #1d4ed8; font-size: 0.85rem;">
                ⭐ ${num}
              </div>
            `).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #64748b; padding: 0 4px;">
            <span>1 = Very Poor</span>
            <span>5 = Excellent</span>
          </div>
        `;
      } else if (currentType === 'Numeric') {
        pOpts.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="number" placeholder="Enter numeric value or count..." disabled style="flex: 1; height: 42px; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 0 12px; font-size: 0.88rem; background: #f8fafc;">
          </div>
        `;
      } else {
        pOpts.innerHTML = `
          <textarea placeholder="Field enumerator will type descriptive remarks..." disabled style="width: 100%; height: 56px; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; font-size: 0.84rem; background: #f8fafc; font-family: inherit;"></textarea>
        `;
      }
    }

    if (pMedia) {
      const mediaHtml = [];
      if (hasVoice) mediaHtml.push('<span style="font-size: 0.74rem; background: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 6px; font-weight: 700;">🎙️ Audio Recording Enabled</span>');
      if (hasImage) mediaHtml.push('<span style="font-size: 0.74rem; background: #f0fdf4; color: #15803d; padding: 4px 8px; border-radius: 6px; font-weight: 700;">📷 Photo Upload Required</span>');
      if (hasVideo) mediaHtml.push('<span style="font-size: 0.74rem; background: #fef2f2; color: #b91c1c; padding: 4px 8px; border-radius: 6px; font-weight: 700;">🎥 Video Recording Required</span>');

      pMedia.innerHTML = mediaHtml.length > 0 ? mediaHtml.join('') : '<span style="font-size: 0.72rem; color: #94a3b8;">No multimedia requirement attached</span>';
      pMedia.style.display = 'flex';
    }
  }

  document.getElementById('qsSingleText')?.addEventListener('input', updateCardPreview);
  document.getElementById('qsSingleCat')?.addEventListener('change', updateCardPreview);

  // ==================== SAVE SINGLE QUESTION ====================
  document.getElementById('btnSaveQSSingle')?.addEventListener('click', () => {
    const text = document.getElementById('qsSingleText')?.value.trim();
    const cat = document.getElementById('qsSingleCat')?.value || 'General';
    const voice = document.getElementById('qsSingleVoice')?.getAttribute('data-active') === 'true';
    const image = document.getElementById('qsSingleImage')?.getAttribute('data-active') === 'true';
    const video = document.getElementById('qsSingleVideo')?.getAttribute('data-active') === 'true';

    if (!text) {
      alert('Please enter a Question Text in Step 1.');
      document.getElementById('qsSingleText')?.focus();
      return;
    }

    let finalOptions = '';
    if (currentType === 'Single choice' || currentType === 'Multiple choice') {
      const cleanOpts = currentOptionsList.map(o => o.trim()).filter(o => o.length > 0);
      if (cleanOpts.length < 2) {
        alert('Please provide at least 2 option choices for this question type.');
        return;
      }
      finalOptions = cleanOpts.join(', ');
    } else if (currentType === 'Dichotomous') {
      finalOptions = 'Yes, No';
    } else if (currentType === 'Likert Scale') {
      finalOptions = '1 to 5 Rating';
    } else {
      finalOptions = '';
    }

    const currentBank = Store.getQuestionBank();
    const nextNum = currentBank.length + 1;
    const newId = `Q-${nextNum < 10 ? '0' + nextNum : nextNum}`;

    const newQ = {
      id: newId,
      category: cat,
      text: text,
      type: currentType,
      options: finalOptions,
      voice: voice,
      image: image,
      video: video
    };

    Store.addQuestion(newQ);

    // Reset Title and keep options fresh
    document.getElementById('qsSingleText').value = '';
    ['qsSingleVoice', 'qsSingleImage', 'qsSingleVideo'].forEach(mId => {
      const el = document.getElementById(mId);
      if (el) {
        el.classList.remove('active');
        el.setAttribute('data-active', 'false');
      }
    });

    updateCounts();
    updateCardPreview();
    showToast(`✅ Question "${newId}" saved to Question Bank!`);
    setQBMode('list');
  });

  // ==================== TAB 2: SMART BULK PASTE ====================
  let parsedBulkList = [];

  function parseRawBulkText(rawText, defaultCat = 'Socio-Economic Survey') {
    if (!rawText || !rawText.trim()) return [];

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const parsed = [];
    let currentQ = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Pipe Format: "Question? | Option 1, Option 2 | Type"
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        const qText = parts[0].replace(/^\d+[\.\)\-]\s*/, '').trim();
        const opts = parts[1] || '';
        let qType = parts[2] || '';

        if (!qType) {
          if (opts.toLowerCase().includes('yes') && opts.toLowerCase().includes('no')) qType = 'Dichotomous';
          else if (opts.toLowerCase().includes('rating') || opts.toLowerCase().includes('1-5') || opts.toLowerCase().includes('scale')) qType = 'Likert Scale';
          else if (opts.length > 0) qType = 'Single choice';
          else qType = 'Descriptive';
        }

        parsed.push({
          id: `Q-${parsed.length + 1 < 10 ? '0' + (parsed.length + 1) : parsed.length + 1}`,
          category: defaultCat,
          text: qText,
          type: qType,
          options: opts,
          voice: /voice|audio|record|bayan|aawaz/i.test(qText),
          image: /photo|tasveer|image|picture|meter|upload/i.test(qText),
          video: /video|clip/i.test(qText)
        });
        currentQ = null;
        continue;
      }

      // Excel Tab separated
      if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim());
        const qText = parts[0].replace(/^\d+[\.\)\-]\s*/, '').trim();
        const opts = parts[1] || '';
        const qType = parts[2] || (opts.length > 0 ? (opts.toLowerCase().includes('yes') ? 'Dichotomous' : 'Single choice') : 'Descriptive');

        parsed.push({
          id: `Q-${parsed.length + 1 < 10 ? '0' + (parsed.length + 1) : parsed.length + 1}`,
          category: defaultCat,
          text: qText,
          type: qType,
          options: opts,
          voice: /voice|audio|record|bayan|aawaz/i.test(qText),
          image: /photo|tasveer|image|picture|meter|upload/i.test(qText),
          video: /video|clip/i.test(qText)
        });
        currentQ = null;
        continue;
      }

      // Natural Word Format: Option line (A), B), a., -, *, •)
      const isOptionLine = /^(?:[A-Za-z0-9][\)\.]|\-|\*|\•|\([A-Za-z0-9]\))\s+/.test(line);

      if (isOptionLine && currentQ) {
        const optText = line.replace(/^(?:[A-Za-z0-9][\)\.]|\-|\*|\•|\([A-Za-z0-9]\))\s+/, '').trim();
        if (optText) {
          if (!currentQ.optionsList) currentQ.optionsList = [];
          currentQ.optionsList.push(optText);
          currentQ.options = currentQ.optionsList.join(', ');

          if (currentQ.optionsList.length === 2 && /yes|haan|no|nahi/i.test(currentQ.options)) {
            currentQ.type = 'Dichotomous';
          } else {
            currentQ.type = 'Single choice';
          }
        }
      } else {
        // Question Line
        const qText = line.replace(/^\d+[\.\)\-]\s*/, '').trim();
        let detectedType = 'Single choice';
        if (/rating|rate|scale|1 to 5|1-5/i.test(qText)) detectedType = 'Likert Scale';
        else if (/how many|count|acres|amount|age|rupees|income|number|sankhya/i.test(qText)) detectedType = 'Numeric';
        else if (/explain|detail|describe|remarks|vivaran/i.test(qText)) detectedType = 'Descriptive';

        currentQ = {
          id: `Q-${parsed.length + 1 < 10 ? '0' + (parsed.length + 1) : parsed.length + 1}`,
          category: defaultCat,
          text: qText,
          type: detectedType,
          options: '',
          optionsList: [],
          voice: /voice|audio|record|bayan|aawaz/i.test(qText),
          image: /photo|tasveer|image|picture|meter|upload/i.test(qText),
          video: /video|clip/i.test(qText)
        };
        parsed.push(currentQ);
      }
    }

    return parsed;
  }

  function handleBulkParse() {
    const raw = document.getElementById('qsBulkTextarea')?.value || '';
    const defCat = document.getElementById('qsBulkCategory')?.value.trim() || 'General';
    const container = document.getElementById('qsBulkParsedContainer');

    if (!raw.trim()) {
      if (container) container.style.display = 'none';
      parsedBulkList = [];
      return;
    }

    parsedBulkList = parseRawBulkText(raw, defCat);

    if (parsedBulkList.length > 0) {
      if (container) container.style.display = 'block';
      renderBulkGrid();
    } else {
      if (container) container.style.display = 'none';
    }
  }

  document.getElementById('qsBulkTextarea')?.addEventListener('input', handleBulkParse);

  // "Load 5 Sample Questions" Button
  document.getElementById('btnLoadSampleBulkQs')?.addEventListener('click', () => {
    const sampleText = `1. What is the primary source of household monthly income?
A) Agriculture / Farming
B) Daily Wage Labor
C) Salaried Job (Govt / Private)
D) Business / Retail Shop

2. Does the household possess an active Ayushman Bharat Health Card?
- Yes
- No

3. Rate the quality and reliability of village drinking water supply:
(Rating 1-5)

4. Total agricultural cultivable land owned by the household (in acres)?

5. Please take a photograph of the electricity power connection meter:`;

    const txtArea = document.getElementById('qsBulkTextarea');
    if (txtArea) {
      txtArea.value = sampleText;
      handleBulkParse();
      showToast('Loaded 5 demo questions with options auto-detected!');
    }
  });

  function renderBulkGrid() {
    const tbody = document.getElementById('qsBulkParsedTbody');
    const badge = document.getElementById('qsBulkParsedStatsBadge');
    const lblBtn = document.getElementById('lblConfirmBulkBtn');

    if (badge) badge.textContent = `${parsedBulkList.length} Questions Detected`;
    if (lblBtn) lblBtn.textContent = `Save ${parsedBulkList.length} Questions to Bank`;

    if (!tbody) return;

    tbody.innerHTML = parsedBulkList.map((q, idx) => {
      const optsPills = q.options ? q.options.split(',').map(o => `<span style="display:inline-block; font-size:0.72rem; background:#f1f5f9; border:1px solid #cbd5e1; padding:2px 6px; border-radius:4px; margin:2px;">${o.trim()}</span>`).join('') : '<span style="color:#94a3b8; font-size:0.75rem;">(None)</span>';

      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="font-weight: 700; color: #1837d4;"><span class="qb-code-badge">${q.id}</span></td>
          <td>
            <div style="font-weight: 600; color: #1e293b;">${q.text}</div>
          </td>
          <td>
            <select class="form-control-select" style="height: 32px; font-size: 0.78rem; padding: 2px 6px;" onchange="window.updateParsedType(${idx}, this.value)">
              <option value="Single choice" ${q.type === 'Single choice' ? 'selected' : ''}>🔘 Single Choice</option>
              <option value="Multiple choice" ${q.type === 'Multiple choice' ? 'selected' : ''}>☑️ Multiple Choice</option>
              <option value="Likert Scale" ${q.type === 'Likert Scale' ? 'selected' : ''}>⭐ Rating (1-5)</option>
              <option value="Dichotomous" ${q.type === 'Dichotomous' ? 'selected' : ''}>⚖️ Yes / No</option>
              <option value="Numeric" ${q.type === 'Numeric' ? 'selected' : ''}>🔢 Number</option>
              <option value="Descriptive" ${q.type === 'Descriptive' ? 'selected' : ''}>✍️ Text Response</option>
            </select>
          </td>
          <td>
            <div style="max-height: 48px; overflow-y: auto;">${optsPills}</div>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <button type="button" class="qs-table-media-btn ${q.voice ? 'active-voice' : ''}" title="Toggle Audio Voice Input" onclick="window.toggleBulkMedia(${idx}, 'voice')">🎙️</button>
              <button type="button" class="qs-table-media-btn ${q.image ? 'active-photo' : ''}" title="Toggle Photo Upload" onclick="window.toggleBulkMedia(${idx}, 'image')">📷</button>
              <button type="button" class="qs-table-media-btn ${q.video ? 'active-video' : ''}" title="Toggle Video Clip" onclick="window.toggleBulkMedia(${idx}, 'video')">🎥</button>
            </div>
          </td>
          <td style="text-align: center;">
            <button type="button" onclick="window.removeBulkItem(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete row">
              <i class="pi pi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.updateParsedType = function(idx, newType) {
    if (parsedBulkList[idx]) {
      parsedBulkList[idx].type = newType;
      renderBulkGrid();
    }
  };

  window.toggleBulkMedia = function(idx, mediaType) {
    if (parsedBulkList[idx]) {
      parsedBulkList[idx][mediaType] = !parsedBulkList[idx][mediaType];
      renderBulkGrid();
    }
  };

  window.removeBulkItem = function(idx) {
    parsedBulkList.splice(idx, 1);
    parsedBulkList.forEach((q, i) => {
      q.id = `Q-${i + 1 < 10 ? '0' + (i + 1) : i + 1}`;
    });
    renderBulkGrid();
  };

  // 1-Click Global Media Buttons
  document.getElementById('btnBulkMediaVoiceAll')?.addEventListener('click', () => {
    parsedBulkList.forEach(q => q.voice = true);
    renderBulkGrid();
    showToast('🎙️ Audio Voice enabled for all parsed questions.');
  });

  document.getElementById('btnBulkMediaPhotoAll')?.addEventListener('click', () => {
    parsedBulkList.forEach(q => q.image = true);
    renderBulkGrid();
    showToast('📷 Photo upload enabled for all parsed questions.');
  });

  document.getElementById('btnBulkMediaVideoAll')?.addEventListener('click', () => {
    parsedBulkList.forEach(q => q.video = true);
    renderBulkGrid();
    showToast('🎥 Video recording enabled for all parsed questions.');
  });

  document.getElementById('btnBulkMediaResetAll')?.addEventListener('click', () => {
    parsedBulkList.forEach(q => {
      q.voice = false;
      q.image = false;
      q.video = false;
    });
    renderBulkGrid();
    showToast('⚪ Media inputs reset to off.');
  });

  // Confirm Save Bulk Questions to Bank
  document.getElementById('btnConfirmSaveBulkQuestions')?.addEventListener('click', () => {
    if (parsedBulkList.length === 0) {
      alert('No parsed questions to save.');
      return;
    }

    const currentBank = Store.getQuestionBank();
    const startNum = currentBank.length;
    let savedCount = 0;

    parsedBulkList.forEach((pq, i) => {
      const codeNum = startNum + i + 1;
      const finalId = `Q-${codeNum < 10 ? '0' + codeNum : codeNum}`;
      const savedQ = {
        id: finalId,
        category: pq.category,
        text: pq.text,
        type: pq.type,
        options: pq.options || '',
        voice: !!pq.voice,
        image: !!pq.image,
        video: !!pq.video
      };
      Store.addQuestion(savedQ);
      savedCount++;
    });

    document.getElementById('qsBulkTextarea').value = '';
    parsedBulkList = [];
    document.getElementById('qsBulkParsedContainer').style.display = 'none';

    updateCounts();
    showToast(`⚡ Successfully saved ${savedCount} questions into Question Bank!`);
    setQBMode('list');
  });

  // ==================== CATALOG RENDERING & FILTERING ====================
  function renderCatalog() {
    updateCounts();
    const allQuestions = Store.getQuestions();
    populateCategoryDropdown(allQuestions);
    filterAndRenderCatalog();
  }

  function populateCategoryDropdown(questions) {
    const catSelect = document.getElementById('catalogCategoryFilter');
    if (!catSelect) return;

    const currentVal = catSelect.value;
    const categories = [...new Set(questions.map(q => q.category || 'General').filter(Boolean))].sort();

    catSelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === currentVal) opt.selected = true;
      catSelect.appendChild(opt);
    });
  }

  function filterAndRenderCatalog() {
    const allQuestions = Store.getQuestions();
    const search = (document.getElementById('catalogSearchInput')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('catalogCategoryFilter')?.value || '';
    const type = document.getElementById('catalogTypeFilter')?.value || '';

    const filtered = allQuestions.filter(q => {
      const matchSearch = !search ||
        (q.code && q.code.toLowerCase().includes(search)) ||
        (q.id && q.id.toLowerCase().includes(search)) ||
        (q.text && q.text.toLowerCase().includes(search)) ||
        (q.category && q.category.toLowerCase().includes(search)) ||
        (Array.isArray(q.options) && q.options.some(o => (typeof o === 'string' ? o : o.text || '').toLowerCase().includes(search))) ||
        (typeof q.options === 'string' && q.options.toLowerCase().includes(search));

      const matchCat = !cat || q.category === cat;
      const matchType = !type || q.type === type;

      return matchSearch && matchCat && matchType;
    });

    const totalCount = allQuestions.length;
    const countBadge = document.getElementById('catalogCountBadge');
    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${totalCount} Questions`;
    }

    const tabBadge = document.getElementById('tabListBadge');
    if (tabBadge) tabBadge.textContent = totalCount;

    const sidebarBadge = document.getElementById('sidebarQBCountBadge');
    if (sidebarBadge) sidebarBadge.textContent = totalCount;

    const tbody = document.getElementById('catalogTableBody');
    const emptyState = document.getElementById('catalogEmptyState');
    const table = document.getElementById('catalogTableEl');

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (table) table.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (table) table.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(q => {
      let optionsText = '';
      if (Array.isArray(q.options) && q.options.length > 0) {
        optionsText = q.options.map(o => (typeof o === 'string' ? o : o.text || '')).filter(Boolean).join(', ');
      } else if (typeof q.options === 'string' && q.options.trim().length > 0) {
        optionsText = q.options;
      } else if (q.type === 'Numeric') {
        optionsText = '<span style="color:#94a3b8; font-style:italic;">(Numeric Entry)</span>';
      } else {
        optionsText = '<span style="color:#94a3b8; font-style:italic;">(Open Text)</span>';
      }

      const mediaPills = [];
      if (q.mediaVoice || (q.media && q.media.voice) || q.voice) mediaPills.push('<span style="background: #eff6ff; color: #1d4ed8; padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; border: 1px solid #bfdbfe;">🎙️ Voice</span>');
      if (q.mediaPhoto || (q.media && q.media.photo) || q.image) mediaPills.push('<span style="background: #f0fdf4; color: #15803d; padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; border: 1px solid #bbf7d0;">📷 Photo</span>');
      if (q.mediaVideo || (q.media && q.media.video) || q.video) mediaPills.push('<span style="background: #faf5ff; color: #7e22ce; padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; border: 1px solid #e9d5ff;">🎥 Video</span>');

      const mediaHtml = mediaPills.length > 0
        ? `<div style="display: flex; gap: 4px; justify-content: center; flex-wrap: wrap;">${mediaPills.join('')}</div>`
        : '<span style="color: #cbd5e1; font-size: 0.74rem;">None</span>';

      const typeBadgeColor = getTypeBadgeStyle(q.type);

      return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
          <td style="padding: 12px 16px; font-weight: 800; color: #1e3a8a;">
            <span style="background: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 6px; font-size: 0.76rem; border: 1px solid #bfdbfe;">
              ${escapeHtml(q.code || q.id || 'Q')}
            </span>
          </td>
          <td style="padding: 12px 16px;">
            <div style="font-weight: 700; color: #1e293b; font-size: 0.88rem; line-height: 1.4;">
              ${escapeHtml(q.text || '')}
              ${q.required ? '<span style="color: #ef4444; font-weight: 800; margin-left: 2px;">*</span>' : ''}
            </div>
            ${q.category ? `<span style="display: inline-block; font-size: 0.72rem; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 10px; margin-top: 4px;">📁 ${escapeHtml(q.category)}</span>` : ''}
          </td>
          <td style="padding: 12px 16px;">
            <span style="${typeBadgeColor}">
              ${escapeHtml(q.type || 'Text')}
            </span>
          </td>
          <td style="padding: 12px 16px; color: #475569; font-size: 0.82rem; max-width: 320px; line-height: 1.4;">
            ${optionsText}
          </td>
          <td style="padding: 12px 16px; text-align: center;">
            ${mediaHtml}
          </td>
          <td style="padding: 12px 16px; text-align: center;">
            <button type="button" onclick="window.deleteCatalogQ('${escapeHtml(q.code || q.id || '')}')" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem; transition: background 0.15s;" title="Delete question from bank" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='transparent'">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function getTypeBadgeStyle(type) {
    switch (type) {
      case 'Single choice':
        return 'background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 3px 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 700;';
      case 'Multiple choice':
        return 'background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; padding: 3px 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 700;';
      case 'Dichotomous':
        return 'background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 3px 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 700;';
      case 'Likert Scale':
        return 'background: #fefce8; color: #a16207; border: 1px solid #fef08a; padding: 3px 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 700;';
      case 'Numeric':
        return 'background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; padding: 3px 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 700;';
      default:
        return 'background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; padding: 3px 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 700;';
    }
  }

  window.deleteCatalogQ = function(code) {
    if (!code) return;
    const questions = Store.getQuestions();
    const q = questions.find(item => (item.code === code || item.id === code));
    const qTitle = q ? `"${q.text.substring(0, 40)}..."` : code;

    if (confirm(`Are you sure you want to delete question ${qTitle} from the Question Bank?`)) {
      Store.deleteQuestion(code);
      renderCatalog();
    }
  };

  const globalSearch = document.getElementById('globalSearchInput');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      setQBMode('list');
      const catalogInput = document.getElementById('catalogSearchInput');
      if (catalogInput) {
        catalogInput.value = e.target.value;
      }
      filterAndRenderCatalog();
    });
  }

  document.getElementById('catalogSearchInput')?.addEventListener('input', () => filterAndRenderCatalog());
  document.getElementById('catalogCategoryFilter')?.addEventListener('change', () => filterAndRenderCatalog());
  document.getElementById('catalogTypeFilter')?.addEventListener('change', () => filterAndRenderCatalog());
  document.getElementById('btnReloadSampleQuestions')?.addEventListener('click', () => {
    Store.resetToDefaultQuestions();
    renderCatalog();
    showToast('✨ 12 Standardized Field Questions loaded successfully!');
  });

  document.getElementById('btnClearEntireBank')?.addEventListener('click', () => {
    const questions = Store.getQuestions();
    if (questions.length === 0) {
      alert('Question Bank is already empty.');
      return;
    }
    if (confirm(`Are you sure you want to clear all ${questions.length} questions from the Question Bank?`)) {
      Store.clearQuestionBank();
      renderCatalog();
      showToast('🗑️ Question Bank cleared.');
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initial render
  updateTypeUI('Single choice');
  renderCatalog();
  updateCounts();
  if (window.location.hash === '#list') {
    setQBMode('list');
  } else {
    setQBMode('create');
  }
});
