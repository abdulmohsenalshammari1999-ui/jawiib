// admin.js - recruiter dashboard

// Phase 2 stub
async function sendBulkNotification(applicants, templateType) {
  console.log("Email integration not yet configured.");
}

let allRows = [];
let filteredRows = [];
let sortKey = "TOTAL_SCORE";
let sortDir = "desc";

document.addEventListener("DOMContentLoaded", () => {
  const cfg = SAMS_CONFIG;
  document.documentElement.style.setProperty("--primary", cfg.org.primaryColor);
  document.documentElement.style.setProperty("--accent", cfg.org.accentColor);
  document.getElementById("org-logo").src = cfg.org.logo;
  document.getElementById("vacancy-title").textContent = cfg.vacancy.title;

  document.getElementById("sync-btn").addEventListener("click", sync);
  document.getElementById("apply-filters").addEventListener("click", applyFilters);
  document.getElementById("reset-filters").addEventListener("click", resetFilters);
  document.getElementById("export-btn").addEventListener("click", exportToExcel);
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (sortKey === key) sortDir = sortDir === "asc" ? "desc" : "asc";
      else { sortKey = key; sortDir = "desc"; }
      renderTable();
    });
  });

  sync();
});

async function sync() {
  const btn = document.getElementById("sync-btn");
  btn.disabled = true;
  try {
    allRows = await callSheetsWithRetry(() => SHEETS.readAll());
    filteredRows = [...allRows];
    populateNationalityFilter();
    document.getElementById("last-synced").textContent = new Date().toLocaleString();
    document.getElementById("applicant-count").textContent = allRows.length;
    renderTable();
    renderSummary();
  } catch (e) {
    // banner shown by callSheetsWithRetry
  } finally {
    btn.disabled = false;
  }
}

function populateNationalityFilter() {
  const sel = document.getElementById("f-nationality");
  const current = sel.value;
  const set = new Set();
  allRows.forEach(r => (r.Nationality || "").split("|").filter(Boolean).forEach(n => set.add(n)));
  sel.innerHTML = `<option value="">All</option>` + [...set].sort().map(n => `<option value="${n}">${n}</option>`).join("");
  sel.value = current;
}

function applyFilters() {
  const scoreMin = parseFloat(document.getElementById("f-score-min").value);
  const scoreMax = parseFloat(document.getElementById("f-score-max").value);
  const minExp = parseFloat(document.getElementById("f-min-exp").value);
  const status = document.getElementById("f-status").value;
  const nationality = document.getElementById("f-nationality").value;
  const relocate = document.getElementById("f-relocate").value;
  const keyword = document.getElementById("f-keyword").value.trim().toLowerCase();

  filteredRows = allRows.filter(r => {
    const score = Number(r.TOTAL_SCORE) || 0;
    const exp = Number(r.Total_Years_Exp) || 0;
    if (!isNaN(scoreMin) && score < scoreMin) return false;
    if (!isNaN(scoreMax) && score > scoreMax) return false;
    if (!isNaN(minExp) && exp < minExp) return false;
    if (status && (r.Status || "Pending") !== status) return false;
    if (nationality && !(r.Nationality || "").split("|").includes(nationality)) return false;
    if (relocate && r.Willing_Relocate !== relocate) return false;
    if (keyword) {
      const haystack = [
        r.Full_Name, r.Email, r.Domain_Tags, r.Countries_Worked_List, r.Nationality
      ].join(" ").toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });
  renderTable();
  renderSummary();
}

function resetFilters() {
  ["f-score-min", "f-score-max", "f-min-exp", "f-keyword"].forEach(id => document.getElementById(id).value = "");
  ["f-status", "f-nationality", "f-relocate"].forEach(id => document.getElementById(id).value = "");
  filteredRows = [...allRows];
  renderTable();
  renderSummary();
}

function scoreClass(score) {
  if (score >= 85) return { bg: "#D1FAE5", fg: "#166534" };
  if (score >= 70) return { bg: "#DCFCE7", fg: "#15803D" };
  if (score >= 50) return { bg: "#FEF3C7", fg: "#D97706" };
  return { bg: "#FEE2E2", fg: "#DC2626" };
}

function renderTable() {
  const sorted = [...filteredRows].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (sortKey === "rank") { av = Number(a.TOTAL_SCORE) || 0; bv = Number(b.TOTAL_SCORE) || 0; }
    const an = Number(av), bn = Number(bv);
    if (!isNaN(an) && !isNaN(bn) && av !== "" && bv !== "") {
      return sortDir === "asc" ? an - bn : bn - an;
    }
    av = (av || "").toString().toLowerCase();
    bv = (bv || "").toString().toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const tbody = document.getElementById("applicants-tbody");
  tbody.innerHTML = sorted.map((r, i) => {
    const score = Number(r.TOTAL_SCORE) || 0;
    const sc = scoreClass(score);
    const band = r.Score_Band || "";
    const status = r.Status || "Pending";
    return `<tr data-appid="${r.App_ID}">
      <td>${i + 1}</td>
      <td>${r.App_ID}</td>
      <td>${r.Full_Name || ""}</td>
      <td>${(r.Nationality || "").split("|").join(", ")}</td>
      <td>${r.Country_Residing || ""}</td>
      <td>${r.Total_Years_Exp || ""}</td>
      <td>${r.Domain_Years_Exp || ""}</td>
      <td><span class="score-pill" style="background:${sc.bg};color:${sc.fg}">${score}</span></td>
      <td>${band}</td>
      <td>
        <select class="status-select" data-appid="${r.App_ID}">
          ${["Pending", "Shortlist", "Hold", "Reject"].map(s => `<option value="${s}" ${status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <span class="save-indicator" data-appid="${r.App_ID}"></span>
      </td>
      <td><button class="btn" data-view="${r.App_ID}">View Profile</button></td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll(".status-select").forEach(sel => {
    sel.addEventListener("change", () => updateStatus(sel.dataset.appid, sel.value));
  });
  tbody.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.open(`profile.html?id=${encodeURIComponent(btn.dataset.view)}&source=sheet`, "_blank");
    });
  });
}

async function updateStatus(appId, status) {
  const indicator = document.querySelector(`.save-indicator[data-appid="${appId}"]`);
  indicator.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
  try {
    await callSheetsWithRetry(() => SHEETS.updateStatus(appId, status));
    indicator.innerHTML = `<i class="fa-solid fa-check" style="color:#166534"></i>`;
    const row = allRows.find(r => r.App_ID === appId);
    if (row) row.Status = status;
    setTimeout(() => { indicator.innerHTML = ""; }, 2000);
  } catch (e) {
    indicator.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:#DC2626"></i>`;
  }
}

function exportToExcel() {
  if (typeof XLSX === "undefined") {
    showBanner("Excel export library failed to load.", "error");
    return;
  }
  const data = filteredRows.map((r, i) => ({
    Rank: i + 1, App_ID: r.App_ID, Full_Name: r.Full_Name, Nationality: r.Nationality,
    Country_Residing: r.Country_Residing, Total_Years_Exp: r.Total_Years_Exp,
    Domain_Years_Exp: r.Domain_Years_Exp, Score: r.TOTAL_SCORE, Band: r.Score_Band, Status: r.Status || "Pending"
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Applicants");
  XLSX.writeFile(wb, `applicants_${SAMS_CONFIG.vacancy.id}.xlsx`);
}

function renderSummary() {
  const bands = { "Highly Recommended": 0, "Recommended": 0, "Borderline": 0, "Not Recommended": 0 };
  let scoreSum = 0, expSum = 0, n = 0;
  const natCount = {};
  filteredRows.forEach(r => {
    const band = r.Score_Band;
    if (bands[band] !== undefined) bands[band]++;
    scoreSum += Number(r.TOTAL_SCORE) || 0;
    expSum += Number(r.Total_Years_Exp) || 0;
    n++;
    (r.Nationality || "").split("|").filter(Boolean).forEach(nat => natCount[nat] = (natCount[nat] || 0) + 1);
  });
  const topNats = Object.entries(natCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  document.getElementById("summary-stats").innerHTML = `
    <div class="stat-block">
      <h4>By Score Band</h4>
      ${Object.entries(bands).map(([k, v]) => `<div>${k}: ${v}</div>`).join("")}
    </div>
    <div class="stat-block">
      <h4>Averages</h4>
      <div>Avg Score: ${n ? (scoreSum / n).toFixed(1) : 0}</div>
      <div>Avg Years Experience: ${n ? (expSum / n).toFixed(1) : 0}</div>
    </div>
    <div class="stat-block">
      <h4>Top Nationalities</h4>
      ${topNats.map(([nat, c]) => `<div>${nat}: ${c}</div>`).join("") || "—"}
    </div>
  `;
}
