/**
 * Complaints Page Controller
 * Matches Schame-managemt fellow complaints UI and interactions
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
  let activeTab = 'my_complaints'; // 'my_complaints' | 'review_interns'
  let currentStatusFilter = 'all';
  let searchQuery = '';

  // DOM Elements - Tabs
  const tabBtnMy = document.getElementById('tabBtnMy');
  const tabBtnInterns = document.getElementById('tabBtnInterns');
  const countBadgeMy = document.getElementById('countBadgeMy');
  const countBadgeInterns = document.getElementById('countBadgeInterns');
  const internPendingDot = document.getElementById('internPendingDot');

  // DOM Elements - KPIs
  const kpiTotal = document.getElementById('kpiTotal');
  const kpiPending = document.getElementById('kpiPending');
  const kpiResolved = document.getElementById('kpiResolved');
  const kpiRejected = document.getElementById('kpiRejected');

  // Filter Pills & Search
  const filterPills = document.querySelectorAll('.cmp-pill-btn');
  const searchInput = document.getElementById('cmpSearchInput');
  const cardsContainer = document.getElementById('cmpCardsContainer');

  // Modals
  const btnOpenFileModal = document.getElementById('btnOpenFileModal');
  const addModal = document.getElementById('addComplaintModal');
  const closeAddModalBtn = document.getElementById('closeAddModalBtn');
  const addForm = document.getElementById('addComplaintForm');

  const detailsModal = document.getElementById('complaintDetailsModal');
  const closeDetailsBtn = document.getElementById('closeDetailsBtn');

  const reviewModal = document.getElementById('reviewComplaintModal');
  const closeReviewBtn = document.getElementById('closeReviewBtn');
  const reviewActionTitle = document.getElementById('reviewActionTitle');
  const reviewActionComment = document.getElementById('reviewActionComment');
  const btnSubmitReview = document.getElementById('btnSubmitReview');

  let currentReviewComplaintId = null;
  let currentReviewAction = 'resolve'; // 'resolve' | 'reject' | 'forward'

  function formatDate(dStr) {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dStr;
    }
  }

  function getCategoryName(cat) {
    const map = {
      'stipend': 'Stipend & Disbursal Delay',
      'field_travel': 'Field Travel & Conveyance',
      'infrastructure': 'Hardware & Infrastructure',
      'workload_tasks': 'Workload & Task Allocation',
      'interpersonal': 'Interpersonal & Behavioral',
      'other': 'General Issue'
    };
    return map[cat] || cat;
  }

  function renderKPIs(list) {
    const total = list.length;
    const pending = list.filter(c => c.status === 'pending').length;
    const resolved = list.filter(c => c.status === 'resolved').length;
    const rejected = list.filter(c => c.status === 'rejected').length;

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiPending) kpiPending.textContent = pending;
    if (kpiResolved) kpiResolved.textContent = resolved;
    if (kpiRejected) kpiRejected.textContent = rejected;
  }

  function updateTabCounts() {
    const all = window.ComplaintStore ? window.ComplaintStore.getAll() : [];
    const myCount = all.filter(c => c.applicantRole === 'fellow').length;
    const internList = all.filter(c => c.applicantRole === 'intern');
    const internCount = internList.length;
    const internPendingCount = internList.filter(c => c.status === 'pending').length;

    if (countBadgeMy) countBadgeMy.textContent = myCount;
    if (countBadgeInterns) countBadgeInterns.textContent = internCount;

    if (internPendingDot) {
      internPendingDot.style.display = internPendingCount > 0 ? 'inline-block' : 'none';
    }
  }

  function renderCards() {
    updateTabCounts();
    const sourceList = activeTab === 'my_complaints'
      ? window.ComplaintStore.getMyComplaints()
      : window.ComplaintStore.getInternComplaints();

    renderKPIs(sourceList);

    const filtered = sourceList.filter(c => {
      const matchesStatus = currentStatusFilter === 'all' || c.status === currentStatusFilter;
      const q = searchQuery.toLowerCase();
      const matchesQuery = !searchQuery ||
        c.subject.toLowerCase().includes(q) ||
        c.ticketNumber.toLowerCase().includes(q) ||
        (c.applicantName && c.applicantName.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });

    if (!cardsContainer) return;

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 48px 20px; text-align: center;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: inline-flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 12px;">
            <i class="pi pi-inbox"></i>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 6px;">No complaints found</h3>
          <p style="font-size: 0.82rem; color: #64748b; max-width: 400px; margin: 0 auto 16px;">
            ${searchQuery ? `No complaints match your search "${searchQuery}".` : 'No active grievance tickets in this view.'}
          </p>
          ${activeTab === 'my_complaints' ? `
            <button type="button" class="btn-file-complaint-main" onclick="document.getElementById('addComplaintModal').style.display='flex'">
              <i class="pi pi-plus"></i>
              <span>File a Complaint</span>
            </button>
          ` : ''}
        </div>
      `;
      return;
    }

    cardsContainer.innerHTML = filtered.map(c => {
      let statusClass = 'status-pending';
      let statusLabel = 'Pending';
      let statusIcon = 'pi-clock';

      if (c.status === 'resolved') {
        statusClass = 'status-resolved';
        statusLabel = 'Resolved';
        statusIcon = 'pi-check-circle';
      } else if (c.status === 'rejected') {
        statusClass = 'status-rejected';
        statusLabel = 'Rejected';
        statusIcon = 'pi-times-circle';
      }

      let priorityClass = 'priority-medium';
      if (c.priority === 'urgent') priorityClass = 'priority-urgent';
      else if (c.priority === 'high') priorityClass = 'priority-high';
      else if (c.priority === 'low') priorityClass = 'priority-low';

      return `
        <div class="cmp-card" data-id="${c.id}">
          <div>
            <!-- Top Badges Row -->
            <div class="cmp-card-top">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="cmp-ticket-pill">${c.ticketNumber}</span>
                <span class="cmp-priority-badge ${priorityClass}">${c.priority || 'MEDIUM'}</span>
              </div>
              <span class="cmp-status-badge ${statusClass}">
                <i class="pi ${statusIcon}" style="font-size: 11px;"></i>
                <span>${statusLabel}</span>
              </span>
            </div>

            <!-- Applicant Info -->
            <div class="cmp-card-applicant">
              <span class="cmp-applicant-name">${escapeHtml(c.applicantName)}</span>
              <span class="cmp-applicant-role">${c.applicantRole}</span>
              ${c.assignedLocation ? `<span class="cmp-applicant-loc">• ${escapeHtml(c.assignedLocation)}</span>` : ''}
            </div>

            <!-- Category & Subject -->
            <div style="margin-top: 8px;">
              <span style="font-size: 0.7rem; font-weight: 800; color: #4338ca; background: #eef2ff; padding: 2px 7px; border-radius: 4px;">
                ${escapeHtml(getCategoryName(c.category))}
              </span>
              <h3 class="cmp-card-title">${escapeHtml(c.subject)}</h3>
              <p class="cmp-card-desc">${escapeHtml(c.description)}</p>
            </div>

            <!-- Audio Note if attached -->
            ${c.voiceNoteName ? `
              <div class="cmp-audio-pill" onclick="alert('Playing voice note: ${escapeHtml(c.voiceNoteName)}')">
                <div class="cmp-audio-icon"><i class="pi pi-play"></i></div>
                <span>${escapeHtml(c.voiceNoteName)}</span>
                <span style="color: #64748b; font-size: 0.7rem;">(${c.voiceNoteDuration || 15}s)</span>
              </div>
            ` : ''}

            <!-- Document if attached -->
            ${c.documentName ? `
              <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #2563eb; font-weight: 700; margin-top: 8px;">
                <i class="pi pi-paperclip"></i>
                <span>${escapeHtml(c.documentName)}</span>
              </div>
            ` : ''}

            <!-- Date -->
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 10px; display: flex; align-items: center; gap: 5px;">
              <i class="pi pi-calendar"></i>
              <span>Submitted on ${formatDate(c.appliedAt)}</span>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="cmp-card-footer">
            <button type="button" class="btn-cmp-details" data-action="details" data-id="${c.id}">
              <i class="pi pi-eye"></i>
              <span>Details</span>
            </button>

            ${activeTab === 'review_interns' && c.status === 'pending' ? `
              <div class="cmp-action-group">
                <button type="button" class="btn-cmp-resolve" data-action="resolve" data-id="${c.id}" title="Resolve Complaint">
                  <i class="pi pi-check"></i>
                  <span>Resolve</span>
                </button>
                <button type="button" class="btn-cmp-reject" data-action="reject" data-id="${c.id}" title="Reject Complaint">
                  <i class="pi pi-times"></i>
                  <span>Reject</span>
                </button>
                <button type="button" class="btn-cmp-forward" data-action="forward" data-id="${c.id}" title="Forward to PC">
                  <i class="pi pi-arrow-up-right"></i>
                  <span>Forward</span>
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach Event Listeners on cards
    attachCardListeners();
  }

  function attachCardListeners() {
    // Details
    cardsContainer.querySelectorAll('[data-action="details"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDetailsModal(id);
      });
    });

    // Resolve
    cardsContainer.querySelectorAll('[data-action="resolve"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openReviewModal(id, 'resolve');
      });
    });

    // Reject
    cardsContainer.querySelectorAll('[data-action="reject"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openReviewModal(id, 'reject');
      });
    });

    // Forward
    cardsContainer.querySelectorAll('[data-action="forward"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openReviewModal(id, 'forward');
      });
    });
  }

  // ── Details Modal ──
  function openDetailsModal(id) {
    const c = window.ComplaintStore.getById(id);
    if (!c || !detailsModal) return;

    document.getElementById('detTicketNum').textContent = c.ticketNumber;
    document.getElementById('detSubject').textContent = c.subject;
    document.getElementById('detCategory').textContent = getCategoryName(c.category);
    document.getElementById('detPriority').textContent = (c.priority || 'MEDIUM').toUpperCase();
    document.getElementById('detStatus').textContent = (c.status || 'PENDING').toUpperCase();
    document.getElementById('detApplicant').textContent = `${c.applicantName} (${c.applicantRole})`;
    document.getElementById('detLocation').textContent = c.assignedLocation || 'N/A';
    document.getElementById('detIncidentDate').textContent = formatDate(c.incidentDate || c.appliedAt);
    document.getElementById('detDescription').textContent = c.description;

    const reviewSection = document.getElementById('detReviewSection');
    if (c.reviewedBy) {
      reviewSection.style.display = 'block';
      document.getElementById('detReviewerInfo').textContent = `${c.reviewedBy} (${c.reviewerRole || 'Supervisor'}) • ${formatDate(c.reviewedAt)}`;
      document.getElementById('detReviewerComment').textContent = c.reviewerComment || 'No remarks provided.';
    } else if (c.isEscalated) {
      reviewSection.style.display = 'block';
      document.getElementById('detReviewerInfo').textContent = `Forwarded to Program Coordinator (${c.forwardedBy || 'Supervisor'})`;
      document.getElementById('detReviewerComment').textContent = c.forwardComment || 'Escalated for higher administrative intervention.';
    } else {
      reviewSection.style.display = 'none';
    }

    detailsModal.style.display = 'flex';
  }

  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', () => detailsModal.style.display = 'none');
  }

  // ── Review Modal ──
  function openReviewModal(id, action) {
    currentReviewComplaintId = id;
    currentReviewAction = action;
    const c = window.ComplaintStore.getById(id);
    if (!c || !reviewModal) return;

    if (action === 'resolve') {
      reviewActionTitle.textContent = `Resolve Complaint: ${c.ticketNumber}`;
      btnSubmitReview.textContent = 'Confirm Resolution';
      btnSubmitReview.style.background = '#059669';
      reviewActionComment.placeholder = 'Provide resolution notes, instructions given to intern, or action taken...';
    } else if (action === 'reject') {
      reviewActionTitle.textContent = `Reject Complaint: ${c.ticketNumber}`;
      btnSubmitReview.textContent = 'Confirm Rejection';
      btnSubmitReview.style.background = '#e11d48';
      reviewActionComment.placeholder = 'State valid grounds for rejection according to program guidelines...';
    } else if (action === 'forward') {
      reviewActionTitle.textContent = `Forward Complaint to PC: ${c.ticketNumber}`;
      btnSubmitReview.textContent = 'Forward to Coordinator';
      btnSubmitReview.style.background = '#4338ca';
      reviewActionComment.placeholder = 'Explain why this requires Program Coordinator escalation...';
    }

    reviewActionComment.value = '';
    reviewModal.style.display = 'flex';
  }

  if (closeReviewBtn) {
    closeReviewBtn.addEventListener('click', () => reviewModal.style.display = 'none');
  }

  if (btnSubmitReview) {
    btnSubmitReview.addEventListener('click', () => {
      const comment = reviewActionComment.value.trim();
      if (!comment) {
        alert('Please enter a remark or comment before proceeding.');
        return;
      }

      if (currentReviewAction === 'resolve') {
        window.ComplaintStore.updateStatus(currentReviewComplaintId, 'resolved', comment);
      } else if (currentReviewAction === 'reject') {
        window.ComplaintStore.updateStatus(currentReviewComplaintId, 'rejected', comment);
      } else if (currentReviewAction === 'forward') {
        window.ComplaintStore.forwardComplaint(currentReviewComplaintId, comment);
      }

      reviewModal.style.display = 'none';
      renderCards();
    });
  }

  // Media Attachments State for Add Complaint Modal
  let attachedVoice = null;
  let attachedVideo = null;
  let attachedDoc = null;
  let isRecording = false;
  let recordingTimer = null;
  let recSecs = 0;

  const btnCancelAddModal = document.getElementById('btnCancelAddModal');
  const btnRecordVoiceNote = document.getElementById('btnRecordVoiceNote');
  const btnUploadAudioLink = document.getElementById('btnUploadAudioLink');
  const voiceIcon = document.getElementById('voiceIcon');
  const voiceNoteCircle = document.getElementById('voiceNoteCircle');
  const voiceNoteStatusText = document.getElementById('voiceNoteStatusText');

  const btnVideoNote = document.getElementById('btnVideoNote');
  const btnUploadVideoLink = document.getElementById('btnUploadVideoLink');
  const btnDocNote = document.getElementById('btnDocNote');

  const cmpAudioInputHidden = document.getElementById('cmpAudioInputHidden');
  const cmpVideoInputHidden = document.getElementById('cmpVideoInputHidden');
  const cmpDocInputHidden = document.getElementById('cmpDocInputHidden');
  const attachedMediaPillsRow = document.getElementById('attachedMediaPillsRow');

  function renderMediaPills() {
    if (!attachedMediaPillsRow) return;
    let html = '';
    if (attachedVoice) {
      html += `
        <span style="font-size: 0.74rem; font-weight: 700; background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
          <i class="pi pi-microphone"></i>
          <span>${escapeHtml(attachedVoice.name)} (${attachedVoice.duration}s)</span>
          <i class="pi pi-times" style="cursor: pointer; font-size: 10px;" id="removeVoicePill"></i>
        </span>
      `;
    }
    if (attachedVideo) {
      html += `
        <span style="font-size: 0.74rem; font-weight: 700; background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
          <i class="pi pi-video"></i>
          <span>${escapeHtml(attachedVideo.name)}</span>
          <i class="pi pi-times" style="cursor: pointer; font-size: 10px;" id="removeVideoPill"></i>
        </span>
      `;
    }
    if (attachedDoc) {
      html += `
        <span style="font-size: 0.74rem; font-weight: 700; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
          <i class="pi pi-file"></i>
          <span>${escapeHtml(attachedDoc.name)}</span>
          <i class="pi pi-times" style="cursor: pointer; font-size: 10px;" id="removeDocPill"></i>
        </span>
      `;
    }
    attachedMediaPillsRow.innerHTML = html;

    const rV = document.getElementById('removeVoicePill');
    if (rV) rV.addEventListener('click', () => { attachedVoice = null; renderMediaPills(); });
    const rVid = document.getElementById('removeVideoPill');
    if (rVid) rVid.addEventListener('click', () => { attachedVideo = null; renderMediaPills(); });
    const rD = document.getElementById('removeDocPill');
    if (rD) rD.addEventListener('click', () => { attachedDoc = null; renderMediaPills(); });
  }

  // Voice note toggle
  if (btnRecordVoiceNote) {
    btnRecordVoiceNote.addEventListener('click', (e) => {
      if (e.target.id === 'btnUploadAudioLink') return; // Handled separately
      if (!isRecording) {
        isRecording = true;
        recSecs = 0;
        voiceNoteCircle.style.background = '#e11d48';
        voiceNoteCircle.style.color = '#ffffff';
        voiceNoteStatusText.innerHTML = '<span style="color: #e11d48; font-weight: 800;">Recording (0s)... Click to stop</span>';
        recordingTimer = setInterval(() => {
          recSecs++;
          voiceNoteStatusText.innerHTML = `<span style="color: #e11d48; font-weight: 800;">Recording (${recSecs}s)... Click to stop</span>`;
        }, 1000);
      } else {
        isRecording = false;
        clearInterval(recordingTimer);
        voiceNoteCircle.style.background = '#f3e8ff';
        voiceNoteCircle.style.color = '#7e22ce';
        attachedVoice = {
          name: `Voice_Note_${Date.now().toString().slice(-4)}.m4a`,
          duration: recSecs || 12
        };
        voiceNoteStatusText.innerHTML = 'Record &bull; <a id="btnUploadAudioLink">Upload</a>';
        renderMediaPills();
      }
    });
  }

  if (btnUploadAudioLink && cmpAudioInputHidden) {
    btnUploadAudioLink.addEventListener('click', (e) => {
      e.stopPropagation();
      cmpAudioInputHidden.click();
    });
  }

  if (cmpAudioInputHidden) {
    cmpAudioInputHidden.addEventListener('change', () => {
      if (cmpAudioInputHidden.files && cmpAudioInputHidden.files[0]) {
        attachedVoice = {
          name: cmpAudioInputHidden.files[0].name,
          duration: 15
        };
        renderMediaPills();
      }
    });
  }

  // Video note upload
  if (btnVideoNote && cmpVideoInputHidden) {
    btnVideoNote.addEventListener('click', () => cmpVideoInputHidden.click());
  }

  if (cmpVideoInputHidden) {
    cmpVideoInputHidden.addEventListener('change', () => {
      if (cmpVideoInputHidden.files && cmpVideoInputHidden.files[0]) {
        attachedVideo = {
          name: cmpVideoInputHidden.files[0].name
        };
        renderMediaPills();
      }
    });
  }

  // Document upload
  if (btnDocNote && cmpDocInputHidden) {
    btnDocNote.addEventListener('click', () => cmpDocInputHidden.click());
  }

  if (cmpDocInputHidden) {
    cmpDocInputHidden.addEventListener('change', () => {
      if (cmpDocInputHidden.files && cmpDocInputHidden.files[0]) {
        attachedDoc = {
          name: cmpDocInputHidden.files[0].name
        };
        renderMediaPills();
      }
    });
  }

  // ── Add Complaint Modal Open/Close ──
  if (btnOpenFileModal) {
    btnOpenFileModal.addEventListener('click', () => {
      if (addForm) addForm.reset();
      attachedVoice = null;
      attachedVideo = null;
      attachedDoc = null;
      renderMediaPills();
      const incDate = document.getElementById('addCmpIncidentDate');
      if (incDate) incDate.value = new Date().toISOString().split('T')[0];
      addModal.style.display = 'flex';
    });
  }

  if (closeAddModalBtn) {
    closeAddModalBtn.addEventListener('click', () => addModal.style.display = 'none');
  }

  if (btnCancelAddModal) {
    btnCancelAddModal.addEventListener('click', () => addModal.style.display = 'none');
  }

  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const category = document.getElementById('addCmpCategory').value;
      const incidentDate = document.getElementById('addCmpIncidentDate').value;
      const subject = document.getElementById('addCmpSubject').value.trim();
      const description = document.getElementById('addCmpDesc').value.trim();

      if (!subject || subject.length < 5) {
        alert('Subject must be at least 5 characters.');
        document.getElementById('addCmpSubject').focus();
        return;
      }
      if (!description || description.length < 10) {
        alert('Please provide sufficient description details.');
        document.getElementById('addCmpDesc').focus();
        return;
      }

      window.ComplaintStore.addComplaint({
        category,
        categoryLabel: getCategoryName(category),
        priority: category === 'infrastructure' || category === 'stipend' ? 'urgent' : 'high',
        incidentDate,
        subject,
        description,
        documentName: attachedDoc?.name || null,
        voiceNoteName: attachedVoice?.name || null,
        voiceNoteDuration: attachedVoice?.duration || null
      });

      addModal.style.display = 'none';
      activeTab = 'my_complaints';
      tabBtnMy.classList.add('active');
      tabBtnInterns.classList.remove('active');
      currentStatusFilter = 'all';
      filterPills.forEach(p => p.classList.remove('active'));
      document.querySelector('[data-status="all"]')?.classList.add('active');
      renderCards();
    });
  }

  // Tab buttons click
  if (tabBtnMy) {
    tabBtnMy.addEventListener('click', () => {
      activeTab = 'my_complaints';
      tabBtnMy.classList.add('active');
      tabBtnInterns.classList.remove('active');
      currentStatusFilter = 'all';
      filterPills.forEach(p => p.classList.remove('active'));
      document.querySelector('[data-status="all"]')?.classList.add('active');
      renderCards();
    });
  }

  if (tabBtnInterns) {
    tabBtnInterns.addEventListener('click', () => {
      activeTab = 'review_interns';
      tabBtnInterns.classList.add('active');
      tabBtnMy.classList.remove('active');
      currentStatusFilter = 'all';
      filterPills.forEach(p => p.classList.remove('active'));
      document.querySelector('[data-status="all"]')?.classList.add('active');
      renderCards();
    });
  }

  // Status Filter Pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentStatusFilter = pill.getAttribute('data-status');
      renderCards();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCards();
    });
  }

  // Close modals on backdrop click or escape
  [addModal, detailsModal, reviewModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [addModal, detailsModal, reviewModal].forEach(m => {
        if (m) m.style.display = 'none';
      });
    }
  });

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
