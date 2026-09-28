/**
 * AIGGPA - Question Bank Catalog Controller
 * Dedicated page for viewing, filtering, and managing standardized survey questions.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderQuestionCatalog();
  setupFilterListeners();
});

function setupFilterListeners() {
  const searchInput = document.getElementById('catalogSearchInput');
  const catFilter = document.getElementById('catalogCategoryFilter');
  const typeFilter = document.getElementById('catalogTypeFilter');
  const btnClearAll = document.getElementById('btnClearEntireBank');

  if (searchInput) {
    searchInput.addEventListener('input', () => filterAndRenderCatalog());
  }
  if (catFilter) {
    catFilter.addEventListener('change', () => filterAndRenderCatalog());
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', () => filterAndRenderCatalog());
  }
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      const questions = Store.getQuestions();
      if (questions.length === 0) {
        alert('Question Bank is already empty.');
        return;
      }
      if (confirm(`Are you sure you want to delete all ${questions.length} questions from the Question Bank? This cannot be undone.`)) {
        Store.saveQuestions([]);
        renderQuestionCatalog();
      }
    });
  }
}

function renderQuestionCatalog() {
  const questions = Store.getQuestions();
  populateCategoryDropdown(questions);
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
      (q.text && q.text.toLowerCase().includes(search)) ||
      (q.category && q.category.toLowerCase().includes(search)) ||
      (Array.isArray(q.options) && q.options.some(o => (typeof o === 'string' ? o : o.text || '').toLowerCase().includes(search)));

    const matchCat = !cat || q.category === cat;
    const matchType = !type || q.type === type;

    return matchSearch && matchCat && matchType;
  });

  // Update counts
  const totalCount = allQuestions.length;
  const countBadge = document.getElementById('headerCatalogCountBadge');
  if (countBadge) {
    countBadge.textContent = `${filtered.length} of ${totalCount} Questions`;
  }

  const sidebarBadge = document.getElementById('sidebarQBCountBadge');
  if (sidebarBadge) {
    sidebarBadge.textContent = totalCount;
  }

  const tbody = document.getElementById('catalogTableBody');
  const emptyState = document.getElementById('catalogEmptyState');
  const table = tbody?.closest('table');

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
    const optionsText = Array.isArray(q.options) && q.options.length > 0
      ? q.options.map(o => (typeof o === 'string' ? o : o.text || '')).filter(Boolean).join(', ')
      : (q.type === 'Numeric' ? '<span style="color:#94a3b8; font-style:italic;">(Numeric Entry)</span>' : '<span style="color:#94a3b8; font-style:italic;">(Open Text)</span>');

    const mediaPills = [];
    if (q.mediaVoice || (q.media && q.media.voice)) mediaPills.push('<span style="background: #eff6ff; color: #1d4ed8; padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; border: 1px solid #bfdbfe;">🎙️ Voice</span>');
    if (q.mediaPhoto || (q.media && q.media.photo)) mediaPills.push('<span style="background: #f0fdf4; color: #15803d; padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; border: 1px solid #bbf7d0;">📷 Photo</span>');
    if (q.mediaVideo || (q.media && q.media.video)) mediaPills.push('<span style="background: #faf5ff; color: #7e22ce; padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; border: 1px solid #e9d5ff;">🎥 Video</span>');

    const mediaHtml = mediaPills.length > 0
      ? `<div style="display: flex; gap: 4px; justify-content: center; flex-wrap: wrap;">${mediaPills.join('')}</div>`
      : '<span style="color: #cbd5e1; font-size: 0.74rem;">None</span>';

    const typeBadgeColor = getTypeBadgeStyle(q.type);

    return `
      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
        <td style="padding: 12px 16px; font-weight: 800; color: #1e3a8a;">
          <span style="background: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 6px; font-size: 0.76rem; border: 1px solid #bfdbfe;">
            ${escapeHtml(q.code || 'Q')}
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
          <button type="button" onclick="deleteQuestionItem('${escapeHtml(q.code || '')}')" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem; transition: background 0.15s;" title="Delete question from bank" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='transparent'">
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

window.deleteQuestionItem = function(code) {
  if (!code) return;
  const questions = Store.getQuestions();
  const q = questions.find(item => item.code === code);
  const qTitle = q ? `"${q.text.substring(0, 40)}..."` : code;

  if (confirm(`Are you sure you want to delete question ${qTitle} from the Question Bank?`)) {
    const updated = questions.filter(item => item.code !== code);
    Store.saveQuestions(updated);
    renderQuestionCatalog();
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
