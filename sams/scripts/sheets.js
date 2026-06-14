// sheets.js - Google Sheets API integration + shared banner utility

function showBanner(msg, type = "error", containerId = "sams-error-banner") {
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.className = "banner-container";
    document.body.prepend(container);
  }
  const banner = document.createElement("div");
  banner.className = `banner banner-${type}`;
  banner.innerHTML = `<span>${msg}</span><button class="banner-close" aria-label="Dismiss">&times;</button>`;
  banner.querySelector(".banner-close").addEventListener("click", () => banner.remove());
  container.appendChild(banner);
  if (type === "success") {
    setTimeout(() => banner.remove(), 5000);
  }
  return banner;
}

const SHEETS = {
  baseUrl() {
    return `https://sheets.googleapis.com/v4/spreadsheets/${SAMS_CONFIG.sheets.spreadsheetId}`;
  },
  async appendRow(rowArray) {
    const url = `${this.baseUrl()}/values/${encodeURIComponent(SAMS_CONFIG.sheets.masterRange)}:append?valueInputOption=USER_ENTERED&key=${SAMS_CONFIG.sheets.apiKey}`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [rowArray] }) });
    if (!res.ok) throw new Error(`Sheets append failed: ${res.status} ${await res.text()}`);
    return res.json();
  },
  async readAll() {
    const url = `${this.baseUrl()}/values/${encodeURIComponent(SAMS_CONFIG.sheets.masterRange)}?key=${SAMS_CONFIG.sheets.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sheets read failed: ${res.status}`);
    const data = await res.json();
    if (!data.values || data.values.length < 2) return [];
    const [headers, ...rows] = data.values;
    return rows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ''])));
  },
  async updateStatus(appId, status, notes = '', reviewerName = '') {
    const allIds = await this.getColumn('A');
    const rowIndex = allIds.indexOf(appId) + 1;
    if (rowIndex <= 0) throw new Error('App ID not found in sheet');
    const updates = [
      { range: `Master List!CQ${rowIndex + 1}`, values: [[status]] },
      { range: `Master List!CR${rowIndex + 1}`, values: [[notes]] },
      { range: `Master List!CS${rowIndex + 1}`, values: [[reviewerName]] },
      { range: `Master List!CT${rowIndex + 1}`, values: [[new Date().toISOString()]] },
    ];
    const url = `${this.baseUrl()}/values:batchUpdate?key=${SAMS_CONFIG.sheets.apiKey}`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: updates }) });
    if (!res.ok) throw new Error(`Status update failed: ${res.status}`);
    return res.json();
  },
  async getColumn(col) {
    const url = `${this.baseUrl()}/values/Master List!${col}:${col}?key=${SAMS_CONFIG.sheets.apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.values || []).flat();
  }
};

// Phase 2 stub
async function uploadCVtoDrive(base64Data, appId) {
  return { driveUrl: null };
}

// Wrapper with 429 retry-with-backoff (max 3 attempts, 2s delay) and banner error handling
async function callSheetsWithRetry(fn, options = {}) {
  const maxAttempts = 3;
  const delayMs = 2000;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      if (msg.includes('429') && attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      break;
    }
  }
  // Determine banner message
  const msg = lastError ? lastError.message : 'Unknown error';
  if (!navigator.onLine) {
    showBanner('You appear to be offline. Changes saved locally where possible.', 'error');
  } else if (msg.includes('403')) {
    showBanner('Google Sheets API key is invalid or not authorized (403). Check config.js and SETUP.md.', 'error');
  } else if (msg.includes('404')) {
    showBanner('Google Sheet or range not found (404). Check spreadsheetId and tab name "Master List" in config.js.', 'error');
  } else if (msg.includes('429')) {
    showBanner('Google Sheets API rate limit reached (429). Please try again shortly.', 'error');
  } else {
    showBanner(`Connection to Google Sheets failed: ${msg}`, 'error');
  }
  throw lastError;
}
