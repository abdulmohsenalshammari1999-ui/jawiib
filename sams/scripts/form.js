// form.js - SAMS applicant form logic

const SECTIONS = [
  { id: 1, name: "Personal Information" },
  { id: 2, name: "Education" },
  { id: 3, name: "Certifications" },
  { id: 4, name: "Languages" },
  { id: 5, name: "Work Experience" },
  { id: 6, name: "Technical Experience" },
  { id: 7, name: "Country Experience" },
  { id: 8, name: "Project Experience" },
  { id: 9, name: "Leadership" },
  { id: 10, name: "Software Skills" },
  { id: 11, name: "References" },
  { id: 12, name: "Declarations" },
  { id: 13, name: "CV Upload" },
  { id: 14, name: "Role-Specific Questions" },
  { id: 15, name: "Review & Submit" },
];

const DRAFT_KEY = `sams_draft_${SAMS_CONFIG.vacancy.id}`;
const SUBMITTED_KEY = `sams_submitted_${SAMS_CONFIG.vacancy.id}`;

let state = {
  current: 1,
  completed: {},
  data: {
    education: [{}],
    certifications: [],
    no_certifications: false,
    languages: [{}],
    domain_tags: [],
    expertise_levels: {},
    key_tools: [],
    countries_worked: [],
    country_details: {},
    projects: [{ proj_countries: [] }],
    software_skills: {},
    references: [{}, {}],
    roleAnswers: {},
    nationality: [],
  },
};

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem(SUBMITTED_KEY) === "true") {
    renderAlreadySubmitted();
    return;
  }
  if (!SAMS_CONFIG.roleQuestions || SAMS_CONFIG.roleQuestions.length === 0) {
    const idx = SECTIONS.findIndex(s => s.id === 14);
    if (idx >= 0) SECTIONS.splice(idx, 1);
  }
  loadDraft();
  initTopBar();
  renderSidebar();
  renderMobileStepper();
  renderSection();
  setInterval(saveDraft, SAMS_CONFIG.form.autoSaveInterval * 1000);
});

function renderAlreadySubmitted() {
  document.getElementById("app-root").innerHTML = `
    <div class="confirmation-screen card">
      <h2>You have already submitted an application for this vacancy.</h2>
      <p class="text-muted">If you believe this is an error, please contact the recruiting team.</p>
    </div>`;
}

function initTopBar() {
  const cfg = SAMS_CONFIG;
  document.getElementById("org-logo").src = cfg.org.logo;
  document.getElementById("org-logo").alt = cfg.org.name;
  document.getElementById("vacancy-title").textContent = cfg.vacancy.title;
  document.getElementById("vacancy-meta").textContent =
    `${cfg.vacancy.department} · Deadline: ${cfg.vacancy.deadline}` +
    (cfg.form.showEstimatedTime ? ` · Est. time: ${cfg.vacancy.estimatedTime}` : "");
  document.documentElement.style.setProperty("--primary", cfg.org.primaryColor);
  document.documentElement.style.setProperty("--accent", cfg.org.accentColor);
}

function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    document.getElementById("resume-banner-container").innerHTML = `
      <div class="resume-banner">
        <span>You have a saved draft from ${new Date(draft.savedAt).toLocaleString()}.</span>
        <div>
          <button class="btn btn-primary" id="resume-btn">Resume Draft</button>
          <button class="btn" id="discard-btn">Start Fresh</button>
        </div>
      </div>`;
    document.getElementById("resume-btn").addEventListener("click", () => {
      state = draft.state;
      document.getElementById("resume-banner-container").innerHTML = "";
      renderSidebar();
      renderMobileStepper();
      renderSection();
    });
    document.getElementById("discard-btn").addEventListener("click", () => {
      localStorage.removeItem(DRAFT_KEY);
      document.getElementById("resume-banner-container").innerHTML = "";
    });
  } catch (e) {
    localStorage.removeItem(DRAFT_KEY);
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), state }));
}

function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = SECTIONS.map(sec => {
    let cls = "sidebar-item";
    if (sec.id === state.current) cls += " current";
    else if (state.completed[sec.id]) cls += " complete";
    else if (sec.id > state.current) cls += " future";
    const icon = state.completed[sec.id] ? '<i class="fa-solid fa-circle-check"></i>' :
      (sec.id === state.current ? '<i class="fa-solid fa-circle-dot"></i>' : '<i class="fa-regular fa-circle"></i>');
    return `<div class="${cls} status-icon-wrap" data-section="${sec.id}"><span class="status-icon">${icon}</span><span>${sec.id}. ${sec.name}</span></div>`;
  }).join("");
  sidebar.querySelectorAll(".sidebar-item").forEach(el => {
    el.addEventListener("click", () => goToSection(Number(el.dataset.section), true));
  });
  updateProgressBar();
}

function renderMobileStepper() {
  const stepper = document.getElementById("mobile-stepper");
  stepper.innerHTML = SECTIONS.map(sec => {
    let cls = "";
    if (sec.id === state.current) cls = "current";
    else if (state.completed[sec.id]) cls = "complete";
    return `<button class="${cls}" data-section="${sec.id}">${sec.id}. ${sec.name}</button>`;
  }).join("");
  stepper.querySelectorAll("button").forEach(el => {
    el.addEventListener("click", () => goToSection(Number(el.dataset.section), true));
  });
}

function updateProgressBar() {
  if (!SAMS_CONFIG.form.showProgressBar) return;
  const totalSections = 14;
  const done = Object.keys(state.completed).filter(k => Number(k) <= totalSections && state.completed[k]).length;
  const pct = Math.round((done / totalSections) * 100);
  document.getElementById("progress-bar-fill").style.width = pct + "%";
  document.getElementById("progress-bar-label").textContent = `${pct}% complete`;
}

function goToSection(num, allowJump) {
  if (num > state.current && allowJump && !state.completed[state.current]) {
    if (!validateSection(state.current)) {
      showBanner("Please complete required fields in the current section before jumping ahead.", "warning");
      return;
    }
    state.completed[state.current] = true;
  }
  if (num < state.current || state.completed[num] || num === state.current || allowJump) {
    state.current = num;
    renderSidebar();
    renderMobileStepper();
    renderSection();
    saveDraft();
    window.scrollTo(0, 0);
  }
}

function renderSection() {
  const root = document.getElementById("section-content");
  root.innerHTML = "";
  const sec = SECTIONS.find(s => s.id === state.current);
  document.getElementById("section-heading").textContent = `${sec.id}. ${sec.name}`;

  switch (state.current) {
    case 1: renderSection1(root); break;
    case 2: renderSection2(root); break;
    case 3: renderSection3(root); break;
    case 4: renderSection4(root); break;
    case 5: renderSection5(root); break;
    case 6: renderSection6(root); break;
    case 7: renderSection7(root); break;
    case 8: renderSection8(root); break;
    case 9: renderSection9(root); break;
    case 10: renderSection10(root); break;
    case 11: renderSection11(root); break;
    case 12: renderSection12(root); break;
    case 13: renderSection13(root); break;
    case 14: renderSection14(root); break;
    case 15: renderReview(root); break;
  }
  renderNav(root);
}

function renderNav(root) {
  const nav = document.createElement("div");
  nav.className = "form-nav";
  const isFirst = state.current === SECTIONS[0].id;
  const isLast = state.current === SECTIONS[SECTIONS.length - 1].id;
  nav.innerHTML = `
    ${isFirst ? "<span></span>" : `<button class="btn" id="back-btn">← Back</button>`}
    ${isLast ? "" : `<button class="btn btn-primary" id="next-btn">Save & Continue</button>`}
  `;
  root.appendChild(nav);
  if (!isFirst) {
    document.getElementById("back-btn").addEventListener("click", () => {
      const idx = SECTIONS.findIndex(s => s.id === state.current);
      goToSection(SECTIONS[idx - 1].id, false);
    });
  }
  if (!isLast) {
    document.getElementById("next-btn").addEventListener("click", () => {
      if (!validateSection(state.current)) {
        showBanner("Please fix the highlighted errors before continuing.", "warning");
        return;
      }
      state.completed[state.current] = true;
      const idx = SECTIONS.findIndex(s => s.id === state.current);
      goToSection(SECTIONS[idx + 1].id, false);
    });
  }
}

// ---------- Helpers ----------
function field(label, inputHtml, errorId, required) {
  return `<div class="field-group">
    <label>${label}${required ? ' <span style="color:var(--error)">*</span>' : ""}</label>
    ${inputHtml}
    <div class="error-message" id="${errorId}"></div>
  </div>`;
}

function selectOptions(arr, selected) {
  return arr.map(o => `<option value="${o}" ${selected === o ? "selected" : ""}>${o}</option>`).join("");
}

function yearOptions(start, selected) {
  const end = new Date().getFullYear();
  let opts = "";
  for (let y = end; y >= start; y--) {
    opts += `<option value="${y}" ${String(selected) === String(y) ? "selected" : ""}>${y}</option>`;
  }
  return opts;
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg || "";
  const input = id.replace("-error", "");
  const inputEl = document.getElementById(input);
  if (inputEl) inputEl.classList.toggle("error", !!msg);
}

function multiSelectChips(name, options, selected, max) {
  return `<div class="tag-input-wrap" data-multiselect="${name}">
    ${selected.map(v => `<span class="tag-chip">${v}<button type="button" data-remove="${v}">&times;</button></span>`).join("")}
    <select data-add="${name}" ${max && selected.length >= max ? "disabled" : ""}>
      <option value="">${max && selected.length >= max ? `Max ${max} reached` : "+ Add..."}</option>
      ${options.filter(o => !selected.includes(o)).map(o => `<option value="${o}">${o}</option>`).join("")}
    </select>
  </div>`;
}

function bindMultiSelect(root, name, getArr, onChange) {
  const wrap = root.querySelector(`[data-multiselect="${name}"]`);
  if (!wrap) return;
  wrap.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const arr = getArr();
      const i = arr.indexOf(btn.dataset.remove);
      if (i >= 0) arr.splice(i, 1);
      onChange();
      renderSection();
    });
  });
  const sel = wrap.querySelector("[data-add]");
  if (sel) sel.addEventListener("change", () => {
    if (sel.value) {
      getArr().push(sel.value);
      onChange();
      renderSection();
    }
  });
}

function wordCounter(textareaId, counterId, max) {
  const ta = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);
  if (!ta || !counter) return;
  const update = () => {
    const wc = (ta.value.trim().match(/\S+/g) || []).length;
    counter.textContent = `${wc} / ${max} words`;
    counter.classList.toggle("over", wc > max);
  };
  ta.addEventListener("input", update);
  update();
}

// ---------- SECTION 1: Personal Information ----------
function renderSection1(root) {
  const d = state.data;
  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);
  const maxDobStr = maxDob.toISOString().split("T")[0];

  root.innerHTML += `<div class="card">
    ${field("Full Name", `<input type="text" id="full_name" value="${d.full_name || ""}">`, "full_name-error", true)}
    ${field("Email", `<input type="email" id="email" value="${d.email || ""}">`, "email-error", true)}
    ${field("Phone Number", `<input type="tel" id="phone" placeholder="+1 234 567 8900" value="${d.phone || ""}">`, "phone-error", true)}
    <div class="field-row">
      ${field("Date of Birth", `<input type="date" id="dob" max="${maxDobStr}" value="${d.dob || ""}">`, "dob-error", true)}
      ${field("Age", `<input type="text" id="age" value="${d.age || ""}" disabled>`, "age-error", false)}
    </div>
    ${field("Nationality (max 3)", multiSelectChips("nationality", SAMS_CONFIG.countries, d.nationality, 3), "nationality-error", true)}
    ${field("Country Currently Residing In", `<select id="country_residing">
      <option value="">Select...</option>${selectOptions(SAMS_CONFIG.countries, d.country_residing)}
    </select>`, "country_residing-error", true)}
    ${field("Gender (optional)", `<select id="gender">
      <option value="">Prefer not to specify</option>
      <option value="Male" ${d.gender === "Male" ? "selected" : ""}>Male</option>
      <option value="Female" ${d.gender === "Female" ? "selected" : ""}>Female</option>
      <option value="Prefer not to say" ${d.gender === "Prefer not to say" ? "selected" : ""}>Prefer not to say</option>
    </select>`, "gender-error", false)}
  </div>`;

  ["full_name", "email", "phone", "country_residing", "gender"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => d[id] = document.getElementById(id).value);
    document.getElementById(id).addEventListener("change", () => d[id] = document.getElementById(id).value);
  });
  const dobEl = document.getElementById("dob");
  dobEl.addEventListener("change", () => {
    d.dob = dobEl.value;
    if (d.dob) {
      const birth = new Date(d.dob);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
      d.age = age;
      document.getElementById("age").value = age;
    }
  });
  bindMultiSelect(root, "nationality", () => d.nationality, () => {});
}

// ---------- SECTION 2: Education ----------
function renderSection2(root) {
  const d = state.data;
  if (!d.education || d.education.length === 0) d.education = [{}];
  let html = `<div id="edu-cards"></div>
    ${d.education.length < 4 ? `<button class="btn" id="add-edu" type="button"><i class="fa-solid fa-plus"></i> Add Qualification</button>` : ""}`;
  root.innerHTML += html;
  const container = root.querySelector("#edu-cards");
  d.education.forEach((e, i) => {
    const card = document.createElement("div");
    card.className = "card repeat-card";
    card.innerHTML = `
      <div class="repeat-card-header">
        <strong>Qualification ${i + 1}</strong>
        ${i > 0 ? `<button type="button" class="remove-btn" data-idx="${i}">× Remove</button>` : ""}
      </div>
      ${field("Degree Title", `<input type="text" data-f="degree_title" value="${e.degree_title || ""}">`, `edu${i}-degree_title-error`, true)}
      ${field("Degree Level", `<select data-f="degree_level">
        <option value="">Select...</option>
        ${selectOptions(["PhD", "Masters", "Bachelors", "Diploma", "Other"], e.degree_level)}
      </select>`, `edu${i}-degree_level-error`, true)}
      ${field("Field of Study", `<input type="text" data-f="field_of_study" value="${e.field_of_study || ""}">`, `edu${i}-field_of_study-error`, true)}
      ${field("Institution", `<input type="text" data-f="institution" value="${e.institution || ""}">`, `edu${i}-institution-error`, true)}
      <div class="field-row">
        ${field("Institution Country", `<select data-f="institution_country"><option value="">Select...</option>${selectOptions(SAMS_CONFIG.countries, e.institution_country)}</select>`, `edu${i}-institution_country-error`, true)}
        ${field("Graduation Year", `<select data-f="grad_year"><option value="">Select...</option>${yearOptions(1970, e.grad_year)}</select>`, `edu${i}-grad_year-error`, true)}
        ${field("Grade / GPA (optional)", `<input type="text" data-f="grade_gpa" value="${e.grade_gpa || ""}">`, `edu${i}-grade_gpa-error`, false)}
      </div>
    `;
    card.querySelectorAll("[data-f]").forEach(input => {
      input.addEventListener("input", () => e[input.dataset.f] = input.value);
      input.addEventListener("change", () => e[input.dataset.f] = input.value);
    });
    const removeBtn = card.querySelector(".remove-btn");
    if (removeBtn) removeBtn.addEventListener("click", () => {
      d.education.splice(i, 1);
      renderSection();
    });
    container.appendChild(card);
  });
  const addBtn = root.querySelector("#add-edu");
  if (addBtn) addBtn.addEventListener("click", () => {
    d.education.push({});
    renderSection();
  });
}

// ---------- SECTION 3: Certifications ----------
function renderSection3(root) {
  const d = state.data;
  if (!d.certifications) d.certifications = [];
  root.innerHTML += `<div class="card field-group">
    <label><input type="checkbox" id="no_certs" ${d.no_certifications ? "checked" : ""}> I have no relevant certifications</label>
  </div>
  <div id="cert-section" ${d.no_certifications ? 'style="display:none"' : ""}>
    <div id="cert-cards"></div>
    ${d.certifications.length < 6 ? `<button class="btn" id="add-cert" type="button"><i class="fa-solid fa-plus"></i> Add Certification</button>` : ""}
  </div>`;

  document.getElementById("no_certs").addEventListener("change", e => {
    d.no_certifications = e.target.checked;
    renderSection();
  });

  if (d.no_certifications) return;
  const container = root.querySelector("#cert-cards");
  d.certifications.forEach((c, i) => {
    const card = document.createElement("div");
    card.className = "card repeat-card";
    card.innerHTML = `
      <div class="repeat-card-header"><strong>Certification ${i + 1}</strong>
      <button type="button" class="remove-btn" data-idx="${i}">× Remove</button></div>
      ${field("Certification Name", `<input type="text" data-f="cert_name" value="${c.cert_name || ""}">`, `cert${i}-cert_name-error`, true)}
      ${field("Issuing Body", `<input type="text" data-f="cert_body" value="${c.cert_body || ""}">`, `cert${i}-cert_body-error`, true)}
      <div class="field-row">
        ${field("Year Obtained", `<select data-f="cert_year"><option value="">Select...</option>${yearOptions(1990, c.cert_year)}</select>`, `cert${i}-cert_year-error`, true)}
        ${field("Expiry Date (optional)", `<input type="date" data-f="cert_expiry" value="${c.cert_expiry || ""}">`, `cert${i}-cert_expiry-error`, false)}
        ${field("Certificate Number (optional)", `<input type="text" data-f="cert_number" value="${c.cert_number || ""}">`, `cert${i}-cert_number-error`, false)}
      </div>
    `;
    card.querySelectorAll("[data-f]").forEach(input => {
      input.addEventListener("input", () => c[input.dataset.f] = input.value);
      input.addEventListener("change", () => c[input.dataset.f] = input.value);
    });
    card.querySelector(".remove-btn").addEventListener("click", () => {
      d.certifications.splice(i, 1);
      renderSection();
    });
    container.appendChild(card);
  });
  const addBtn = root.querySelector("#add-cert");
  if (addBtn) addBtn.addEventListener("click", () => {
    d.certifications.push({});
    renderSection();
  });
}

// ---------- SECTION 4: Languages ----------
function renderSection4(root) {
  const d = state.data;
  if (!d.languages || d.languages.length === 0) d.languages = [{}];
  root.innerHTML += `<div id="lang-rows"></div>
    ${d.languages.length < 8 ? `<button class="btn" id="add-lang" type="button"><i class="fa-solid fa-plus"></i> Add Language</button>` : ""}`;
  const container = root.querySelector("#lang-rows");
  d.languages.forEach((l, i) => {
    const card = document.createElement("div");
    card.className = "card repeat-card";
    card.innerHTML = `
      <div class="repeat-card-header"><strong>Language ${i + 1}</strong>
      ${i > 0 ? `<button type="button" class="remove-btn" data-idx="${i}">× Remove</button>` : ""}</div>
      <div class="field-row">
        ${field("Language", `<select data-f="language"><option value="">Select...</option>${selectOptions(SAMS_CONFIG.languages, l.language)}</select>
          ${l.language === "Other" ? `<input type="text" data-f="language_other" placeholder="Specify language" value="${l.language_other || ""}" style="margin-top:6px">` : ""}`, `lang${i}-language-error`, true)}
        ${field("Proficiency", `<select data-f="proficiency"><option value="">Select...</option>${selectOptions(SAMS_CONFIG.proficiencyLevels, l.proficiency)}</select>`, `lang${i}-proficiency-error`, true)}
        ${field("Formally Tested?", `<div class="radio-group">
          <label><input type="radio" name="lang_tested${i}" data-f="language_tested" value="Yes" ${l.language_tested === "Yes" ? "checked" : ""}> Yes</label>
          <label><input type="radio" name="lang_tested${i}" data-f="language_tested" value="No" ${l.language_tested === "No" ? "checked" : ""}> No</label>
        </div>`, `lang${i}-language_tested-error`, false)}
      </div>
      ${l.language_tested === "Yes" ? `<div class="field-row">
        ${field("Test Name", `<input type="text" data-f="test_name" value="${l.test_name || ""}">`, `lang${i}-test_name-error`, false)}
        ${field("Test Score", `<input type="text" data-f="test_score" value="${l.test_score || ""}">`, `lang${i}-test_score-error`, false)}
      </div>` : ""}
    `;
    card.querySelectorAll("[data-f]").forEach(input => {
      const ev = (input.type === "radio" || input.tagName === "SELECT") ? "change" : "input";
      input.addEventListener(ev, () => {
        l[input.dataset.f] = input.value;
        if (input.dataset.f === "language_tested" || input.dataset.f === "language") renderSection();
      });
    });
    const removeBtn = card.querySelector(".remove-btn");
    if (removeBtn) removeBtn.addEventListener("click", () => {
      d.languages.splice(i, 1);
      renderSection();
    });
    container.appendChild(card);
  });
  const addBtn = root.querySelector("#add-lang");
  if (addBtn) addBtn.addEventListener("click", () => {
    d.languages.push({});
    renderSection();
  });
}

// ---------- SECTION 5: Work Experience Overview ----------
function renderSection5(root) {
  const d = state.data;
  root.innerHTML += `<div class="card">
    <div class="field-row">
      ${field("Total Years of Experience", `<input type="number" id="total_years_exp" min="0" max="60" value="${d.total_years_exp ?? ""}">`, "total_years_exp-error", true)}
      ${field("Years of Domain-Relevant Experience", `<input type="number" id="domain_years_exp" min="0" max="${d.total_years_exp || 60}" value="${d.domain_years_exp ?? ""}">`, "domain_years_exp-error", true)}
    </div>
    ${field("Current Employment Status", `<select id="current_status"><option value="">Select...</option>${selectOptions(["Employed", "Actively Seeking", "Freelance/Consultant", "Career Break", "Other"], d.current_status)}</select>`, "current_status-error", true)}
    ${field("Notice Period (weeks)", `<input type="number" id="notice_period_weeks" min="0" max="52" value="${d.notice_period_weeks ?? ""}">`, "notice_period_weeks-error", true)}
    <div class="field-row">
      ${field("Salary Currency", `<select id="salary_currency"><option value="">Select...</option>${selectOptions(["USD", "EUR", "GBP", "AED", "SAR", "KWD", "Other"], d.salary_currency)}</select>`, "salary_currency-error", true)}
      ${field("Minimum Expected Salary (optional)", `<input type="number" id="salary_min" value="${d.salary_min ?? ""}">`, "salary_min-error", false)}
      ${field("Maximum Expected Salary (optional)", `<input type="number" id="salary_max" value="${d.salary_max ?? ""}">`, "salary_max-error", false)}
    </div>
  </div>`;
  ["total_years_exp", "domain_years_exp", "current_status", "notice_period_weeks", "salary_currency", "salary_min", "salary_max"].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => d[id] = el.value);
    el.addEventListener("change", () => d[id] = el.value);
  });
}

// ---------- SECTION 6: Technical Experience ----------
function renderSection6(root) {
  const d = state.data;
  root.innerHTML += `<div class="card">
    ${field("Summary of Relevant Technical Experience (max 200 words)", `<textarea id="tech_summary">${d.tech_summary || ""}</textarea><div class="word-counter" id="tech_summary-counter"></div>`, "tech_summary-error", true)}
    ${field("Domain Tags (select 1-5)", multiSelectChips("domain_tags", SAMS_CONFIG.sectors, d.domain_tags, 5), "domain_tags-error", true)}
    <div id="expertise-levels"></div>
    ${field("Key Tools / Methodologies (optional)", `<div class="tag-input-wrap" id="key-tools-wrap">
      ${d.key_tools.map(t => `<span class="tag-chip">${t}<button type="button" data-remove-tool="${t}">&times;</button></span>`).join("")}
      <input type="text" id="key_tools_input" placeholder="e.g. Results Framework, MEAL, PMP">
    </div>`, "key_tools-error", false)}
  </div>`;

  wordCounter("tech_summary", "tech_summary-counter", 200);
  document.getElementById("tech_summary").addEventListener("input", e => d.tech_summary = e.target.value);

  bindMultiSelect(root, "domain_tags", () => d.domain_tags, () => {
    Object.keys(d.expertise_levels).forEach(k => { if (!d.domain_tags.includes(k)) delete d.expertise_levels[k]; });
  });

  const expDiv = root.querySelector("#expertise-levels");
  d.domain_tags.forEach(tag => {
    const wrap = document.createElement("div");
    wrap.innerHTML = field(`Expertise Level: ${tag}`, `<select data-tag="${tag}"><option value="">Select...</option>${selectOptions(SAMS_CONFIG.expertiseLevels, d.expertise_levels[tag])}</select>`, `expertise-${tag}-error`, true);
    expDiv.appendChild(wrap);
  });
  expDiv.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("change", () => d.expertise_levels[sel.dataset.tag] = sel.value);
  });

  document.getElementById("key_tools_input").addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      d.key_tools.push(e.target.value.trim());
      renderSection();
    }
  });
  root.querySelectorAll("[data-remove-tool]").forEach(btn => {
    btn.addEventListener("click", () => {
      d.key_tools = d.key_tools.filter(t => t !== btn.dataset.removeTool);
      renderSection();
    });
  });
}

// ---------- SECTION 7: Country Experience ----------
function renderSection7(root) {
  const d = state.data;
  root.innerHTML += `<div class="card">
    ${field("Countries Worked In", multiSelectChips("countries_worked", SAMS_CONFIG.countries, d.countries_worked, null), "countries_worked-error", true)}
    <div id="country-details"></div>
  </div>`;
  bindMultiSelect(root, "countries_worked", () => d.countries_worked, () => {
    Object.keys(d.country_details).forEach(k => { if (!d.countries_worked.includes(k)) delete d.country_details[k]; });
  });
  const detailsDiv = root.querySelector("#country-details");
  d.countries_worked.forEach(country => {
    if (!d.country_details[country]) d.country_details[country] = {};
    const cd = d.country_details[country];
    const wrap = document.createElement("div");
    wrap.className = "card repeat-card";
    wrap.innerHTML = `<strong>${country}</strong>
      <div class="field-row">
        ${field("Years in Country", `<input type="number" min="0.5" step="0.5" data-f="years_in_country" value="${cd.years_in_country ?? ""}">`, `country-${country}-years-error`, true)}
        ${field("Engagement Type", `<select data-f="engagement_type"><option value="">Select...</option>${selectOptions(["Resident", "Field Mission", "Remote Support", "Short-Term Assignment"], cd.engagement_type)}</select>`, `country-${country}-engagement-error`, true)}
        ${field("Language Used (optional)", `<select data-f="language_used"><option value="">Select...</option>${selectOptions(SAMS_CONFIG.languages, cd.language_used)}</select>`, `country-${country}-lang-error`, false)}
      </div>`;
    wrap.querySelectorAll("[data-f]").forEach(input => {
      const ev = input.tagName === "SELECT" ? "change" : "input";
      input.addEventListener(ev, () => cd[input.dataset.f] = input.value);
    });
    detailsDiv.appendChild(wrap);
  });
}

// ---------- SECTION 8: Project Experience ----------
function renderSection8(root) {
  const d = state.data;
  if (!d.projects || d.projects.length === 0) d.projects = [{ proj_countries: [] }];
  root.innerHTML += `<div id="proj-cards"></div>
    ${d.projects.length < 5 ? `<button class="btn" id="add-proj" type="button"><i class="fa-solid fa-plus"></i> Add Project</button>` : ""}`;
  const container = root.querySelector("#proj-cards");
  d.projects.forEach((p, i) => {
    if (!p.proj_countries) p.proj_countries = [];
    const card = document.createElement("div");
    card.className = "card repeat-card";
    const isOpen = p._open !== false;
    card.innerHTML = `
      <div class="repeat-card-header">
        <button type="button" class="accordion-header" data-toggle="${i}" style="width:auto;flex:1;text-align:left">${p.proj_title || `Project ${i + 1}`} <i class="fa-solid fa-chevron-${isOpen ? "up" : "down"}"></i></button>
        ${i > 0 ? `<button type="button" class="remove-btn" data-idx="${i}">× Remove</button>` : ""}
      </div>
      <div class="proj-body" ${isOpen ? "" : 'style="display:none"'}>
        ${field("Project Title", `<input type="text" data-f="proj_title" value="${p.proj_title || ""}">`, `proj${i}-title-error`, true)}
        ${field("Client / Funder", `<input type="text" data-f="proj_client" value="${p.proj_client || ""}">`, `proj${i}-client-error`, true)}
        ${field("Project Countries", multiSelectChips(`proj_countries_${i}`, SAMS_CONFIG.countries, p.proj_countries, null), `proj${i}-countries-error`, true)}
        <div class="field-row">
          ${field("Sector", `<select data-f="proj_sector"><option value="">Select...</option>${selectOptions(SAMS_CONFIG.sectors, p.proj_sector)}</select>`, `proj${i}-sector-error`, true)}
          ${field("Your Role", `<input type="text" data-f="proj_role" value="${p.proj_role || ""}">`, `proj${i}-role-error`, true)}
          ${field("Contract Value (optional)", `<select data-f="proj_contract_value"><option value="">Select...</option>${selectOptions(["Under $50K", "$50K–$250K", "$250K–$1M", "$1M–$5M", "Over $5M", "Unknown"], p.proj_contract_value)}</select>`, `proj${i}-value-error`, false)}
        </div>
        <div class="field-row">
          ${field("Start Date", `<input type="month" data-f="proj_start" value="${p.proj_start || ""}">`, `proj${i}-start-error`, true)}
          ${field("End Date", `<input type="month" data-f="proj_end" value="${p.proj_end || ""}" ${p.proj_ongoing ? "disabled" : ""}>
            <label style="font-weight:400;font-size:13px;margin-top:4px;display:block"><input type="checkbox" data-f="proj_ongoing" ${p.proj_ongoing ? "checked" : ""}> Ongoing</label>`, `proj${i}-end-error`, true)}
        </div>
        ${field("Your Contribution (max 150 words)", `<textarea data-f="proj_contribution" id="proj${i}-contribution">${p.proj_contribution || ""}</textarea><div class="word-counter" id="proj${i}-contribution-counter"></div>`, `proj${i}-contribution-error`, true)}
        ${field("Outcome / Result (max 100 words)", `<textarea data-f="proj_outcome" id="proj${i}-outcome">${p.proj_outcome || ""}</textarea><div class="word-counter" id="proj${i}-outcome-counter"></div>`, `proj${i}-outcome-error`, true)}
      </div>
    `;
    card.querySelectorAll("[data-f]").forEach(input => {
      if (input.dataset.f === "proj_ongoing") {
        input.addEventListener("change", () => {
          p.proj_ongoing = input.checked;
          if (input.checked) p.proj_end = "";
          renderSection();
        });
        return;
      }
      const ev = (input.tagName === "SELECT" || input.type === "month" || input.type === "checkbox") ? "change" : "input";
      input.addEventListener(ev, () => {
        p[input.dataset.f] = input.value;
        if (input.dataset.f === "proj_title") renderSection();
      });
    });
    card.querySelector(`[data-toggle="${i}"]`).addEventListener("click", () => {
      p._open = !isOpen;
      renderSection();
    });
    const removeBtn = card.querySelector(".remove-btn");
    if (removeBtn) removeBtn.addEventListener("click", () => {
      d.projects.splice(i, 1);
      renderSection();
    });
    container.appendChild(card);
    bindMultiSelect(card, `proj_countries_${i}`, () => p.proj_countries, () => {});
    if (isOpen) {
      wordCounter(`proj${i}-contribution`, `proj${i}-contribution-counter`, 150);
      wordCounter(`proj${i}-outcome`, `proj${i}-outcome-counter`, 100);
    }
  });
  const addBtn = root.querySelector("#add-proj");
  if (addBtn) addBtn.addEventListener("click", () => {
    d.projects.forEach(p => p._open = false);
    d.projects.push({ proj_countries: [], _open: true });
    renderSection();
  });
}

// ---------- SECTION 9: Leadership ----------
function renderSection9(root) {
  const d = state.data;
  const teamSize = Number(d.team_size_managed) || 0;
  root.innerHTML += `<div class="card">
    ${field("Team Size Managed", `<input type="number" id="team_size_managed" min="0" value="${d.team_size_managed ?? ""}">`, "team_size_managed-error", true)}
    ${field("Leadership Type", `<select id="leadership_type"><option value="">Select...</option>${selectOptions(SAMS_CONFIG.leadershipTypes, d.leadership_type)}</select>`, "leadership_type-error", true)}
    ${teamSize > 0 ? field("Leadership Description (max 200 words)", `<textarea id="leadership_desc">${d.leadership_desc || ""}</textarea><div class="word-counter" id="leadership_desc-counter"></div>`, "leadership_desc-error", true) : ""}
    ${field("Budget Oversight?", `<div class="radio-group">
      <label><input type="radio" name="budget_oversight" value="Yes" ${d.budget_oversight === "Yes" ? "checked" : ""}> Yes</label>
      <label><input type="radio" name="budget_oversight" value="No" ${d.budget_oversight === "No" ? "checked" : ""}> No</label>
    </div>`, "budget_oversight-error", true)}
    ${d.budget_oversight === "Yes" ? field("Budget Range", `<select id="budget_range"><option value="">Select...</option>${selectOptions(["Under $100K", "$100K–$500K", "$500K–$2M", "Over $2M"], d.budget_range)}</select>`, "budget_range-error", true) : ""}
  </div>`;

  document.getElementById("team_size_managed").addEventListener("input", e => {
    d.team_size_managed = e.target.value;
    if ((Number(e.target.value) > 0) !== (teamSize > 0)) renderSection();
  });
  document.getElementById("leadership_type").addEventListener("change", e => d.leadership_type = e.target.value);
  if (teamSize > 0) {
    wordCounter("leadership_desc", "leadership_desc-counter", 200);
    document.getElementById("leadership_desc").addEventListener("input", e => d.leadership_desc = e.target.value);
  }
  root.querySelectorAll('input[name="budget_oversight"]').forEach(r => {
    r.addEventListener("change", () => {
      d.budget_oversight = r.value;
      renderSection();
    });
  });
  if (d.budget_oversight === "Yes") {
    document.getElementById("budget_range").addEventListener("change", e => d.budget_range = e.target.value);
  }
}

// ---------- SECTION 10: Software Skills ----------
function renderSection10(root) {
  const d = state.data;
  if (!d.software_skills) d.software_skills = {};
  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const div = document.createElement("div");
  Object.entries(SAMS_CONFIG.softwareCategories).forEach(([category, tools]) => {
    const sorted = [...tools].sort((a, b) => {
      const aChecked = !!d.software_skills[a], bChecked = !!d.software_skills[b];
      if (aChecked === bChecked) return 0;
      return aChecked ? -1 : 1;
    });
    const sec = document.createElement("div");
    sec.className = "accordion-section";
    sec.innerHTML = `<button type="button" class="accordion-header" data-cat="${category}">${category} <i class="fa-solid fa-chevron-down"></i></button>
      <div class="accordion-body ${d._openCat === category ? "" : "collapsed"}">
        ${sorted.map(tool => `<div class="software-tool-row">
          <label><input type="checkbox" data-tool="${tool}" ${d.software_skills[tool] ? "checked" : ""}> ${tool}</label>
          ${d.software_skills[tool] ? `<select data-tool-level="${tool}">${selectOptions(levels, d.software_skills[tool])}</select>` : ""}
        </div>`).join("")}
      </div>`;
    sec.querySelector(".accordion-header").addEventListener("click", () => {
      d._openCat = d._openCat === category ? null : category;
      renderSection();
    });
    sec.querySelectorAll("[data-tool]").forEach(cb => {
      cb.addEventListener("change", () => {
        if (cb.checked) d.software_skills[cb.dataset.tool] = "Beginner";
        else delete d.software_skills[cb.dataset.tool];
        d._openCat = category;
        renderSection();
      });
    });
    sec.querySelectorAll("[data-tool-level]").forEach(sel => {
      sel.addEventListener("change", () => d.software_skills[sel.dataset.toolLevel] = sel.value);
    });
    div.appendChild(sec);
  });
  root.appendChild(div);
}

// ---------- SECTION 11: References ----------
function renderSection11(root) {
  const d = state.data;
  if (!d.references || d.references.length < 2) d.references = [{}, {}];
  root.innerHTML += `<div id="ref-cards"></div>
    ${d.references.length < 3 ? `<button class="btn" id="add-ref" type="button"><i class="fa-solid fa-plus"></i> Add Reference</button>` : ""}`;
  const container = root.querySelector("#ref-cards");
  d.references.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "card repeat-card";
    card.innerHTML = `
      <div class="repeat-card-header"><strong>Reference ${i + 1}</strong>
      ${i > 1 ? `<button type="button" class="remove-btn" data-idx="${i}">× Remove</button>` : ""}</div>
      <div class="field-row">
        ${field("Name", `<input type="text" data-f="ref_name" value="${r.ref_name || ""}">`, `ref${i}-name-error`, true)}
        ${field("Title", `<input type="text" data-f="ref_title" value="${r.ref_title || ""}">`, `ref${i}-title-error`, true)}
        ${field("Organization", `<input type="text" data-f="ref_org" value="${r.ref_org || ""}">`, `ref${i}-org-error`, true)}
      </div>
      <div class="field-row">
        ${field("Relationship", `<select data-f="ref_relationship"><option value="">Select...</option>${selectOptions(["Line Manager", "Senior Colleague", "Client", "Academic", "Other"], r.ref_relationship)}</select>`, `ref${i}-relationship-error`, true)}
        ${field("Email", `<input type="email" data-f="ref_email" value="${r.ref_email || ""}">`, `ref${i}-email-error`, true)}
        ${field("Phone (optional)", `<input type="tel" data-f="ref_phone" value="${r.ref_phone || ""}">`, `ref${i}-phone-error`, false)}
      </div>
      ${field("Consent", `<div class="radio-group">
        <label><input type="radio" name="ref_consent${i}" data-f="ref_consent" value="Yes, contact now" ${r.ref_consent === "Yes, contact now" ? "checked" : ""}> Yes, contact now</label>
        <label><input type="radio" name="ref_consent${i}" data-f="ref_consent" value="Not until offer stage" ${r.ref_consent === "Not until offer stage" ? "checked" : ""}> Not until offer stage</label>
      </div>`, `ref${i}-consent-error`, true)}
    `;
    card.querySelectorAll("[data-f]").forEach(input => {
      const ev = (input.tagName === "SELECT" || input.type === "radio") ? "change" : "input";
      input.addEventListener(ev, () => r[input.dataset.f] = input.value);
    });
    const removeBtn = card.querySelector(".remove-btn");
    if (removeBtn) removeBtn.addEventListener("click", () => {
      d.references.splice(i, 1);
      renderSection();
    });
    container.appendChild(card);
  });
  const addBtn = root.querySelector("#add-ref");
  if (addBtn) addBtn.addEventListener("click", () => {
    d.references.push({});
    renderSection();
  });
}

// ---------- SECTION 12: Declarations & Availability ----------
function renderSection12(root) {
  const d = state.data;
  const today = new Date().toISOString().split("T")[0];
  root.innerHTML += `<div class="card">
    ${field("Available From", `<input type="date" id="available_date" min="${today}" value="${d.available_date || ""}">`, "available_date-error", true)}
    ${field("Willing to Relocate?", `<select id="willing_relocate"><option value="">Select...</option>${selectOptions(["Yes", "No", "Negotiable"], d.willing_relocate)}</select>`, "willing_relocate-error", true)}
    ${field("Do you have any conflict of interest?", `<div class="radio-group">
      <label><input type="radio" name="coi" value="Yes" ${d.conflict_of_interest === "Yes" ? "checked" : ""}> Yes</label>
      <label><input type="radio" name="coi" value="No" ${d.conflict_of_interest === "No" ? "checked" : ""}> No</label>
    </div>`, "conflict_of_interest-error", true)}
    ${d.conflict_of_interest === "Yes" ? field("Please provide details (max 150 words)", `<textarea id="coi_details">${d.coi_details || ""}</textarea><div class="word-counter" id="coi_details-counter"></div>`, "coi_details-error", true) : ""}
    <div class="field-group">
      <label style="font-weight:400"><input type="checkbox" id="accuracy_declaration" ${d.accuracy_declaration ? "checked" : ""}> I confirm all information provided is accurate and complete</label>
      <div class="error-message" id="accuracy_declaration-error"></div>
    </div>
    <div class="field-group">
      <label style="font-weight:400"><input type="checkbox" id="data_consent" ${d.data_consent ? "checked" : ""}> I consent to the processing of my personal data for recruitment purposes</label>
      <div class="error-message" id="data_consent-error"></div>
    </div>
  </div>`;

  document.getElementById("available_date").addEventListener("change", e => d.available_date = e.target.value);
  document.getElementById("willing_relocate").addEventListener("change", e => d.willing_relocate = e.target.value);
  root.querySelectorAll('input[name="coi"]').forEach(r => {
    r.addEventListener("change", () => {
      d.conflict_of_interest = r.value;
      renderSection();
    });
  });
  if (d.conflict_of_interest === "Yes") {
    wordCounter("coi_details", "coi_details-counter", 150);
    document.getElementById("coi_details").addEventListener("input", e => d.coi_details = e.target.value);
  }
  document.getElementById("accuracy_declaration").addEventListener("change", e => d.accuracy_declaration = e.target.checked);
  document.getElementById("data_consent").addEventListener("change", e => d.data_consent = e.target.checked);
}

// ---------- SECTION 13: CV Upload ----------
function renderSection13(root) {
  const d = state.data;
  root.innerHTML += `<div class="card">
    <p class="text-muted">Optional supporting document. Your structured answers above are the primary review document.</p>
    ${field("Upload CV (PDF, max " + SAMS_CONFIG.form.cvMaxSizeMB + "MB)", `<input type="file" id="cv_file" accept="application/pdf">`, "cv_file-error", false)}
    ${d.cv_uploaded ? `<p class="text-muted"><i class="fa-solid fa-check"></i> File uploaded: ${d.cv_filename}</p>` : ""}
  </div>`;
  document.getElementById("cv_file").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("cv_file-error", "Only PDF files are accepted.");
      e.target.value = "";
      return;
    }
    if (file.size > SAMS_CONFIG.form.cvMaxSizeMB * 1024 * 1024) {
      setError("cv_file-error", `File exceeds ${SAMS_CONFIG.form.cvMaxSizeMB}MB limit.`);
      e.target.value = "";
      return;
    }
    setError("cv_file-error", "");
    const reader = new FileReader();
    reader.onload = () => {
      d.cv_base64 = reader.result;
      d.cv_uploaded = true;
      d.cv_filename = file.name;
      renderSection();
    };
    reader.readAsDataURL(file);
  });
}

// ---------- SECTION 14: Role-Specific Questions ----------
function renderSection14(root) {
  const d = state.data;
  const card = document.createElement("div");
  card.className = "card";
  SAMS_CONFIG.roleQuestions.forEach(q => {
    const wrap = document.createElement("div");
    let inputHtml = "";
    if (q.type === "text") {
      inputHtml = `<textarea data-q="${q.id}" id="rq-${q.id}">${d.roleAnswers[q.id] || ""}</textarea><div class="word-counter" id="rq-${q.id}-counter"></div>`;
    } else if (q.type === "select") {
      inputHtml = `<select data-q="${q.id}"><option value="">Select...</option>${selectOptions(q.options, d.roleAnswers[q.id])}</select>`;
    } else if (q.type === "radio") {
      inputHtml = `<div class="radio-group">${q.options.map(o => `<label><input type="radio" name="rq-${q.id}" data-q="${q.id}" value="${o}" ${d.roleAnswers[q.id] === o ? "checked" : ""}> ${o}</label>`).join("")}</div>`;
    } else if (q.type === "rating") {
      const rating = Number(d.roleAnswers[q.id]) || 0;
      inputHtml = `<div class="star-rating" data-q="${q.id}">${Array.from({ length: q.scale }, (_, i) => `<span class="star ${i < rating ? "active" : ""}" data-val="${i + 1}"><i class="fa-solid fa-star"></i></span>`).join("")}</div>`;
    }
    wrap.innerHTML = field(q.label, inputHtml, `rq-${q.id}-error`, q.required);
    card.appendChild(wrap);
  });
  root.appendChild(card);

  SAMS_CONFIG.roleQuestions.forEach(q => {
    if (q.type === "text") {
      wordCounter(`rq-${q.id}`, `rq-${q.id}-counter`, q.maxWords);
      document.getElementById(`rq-${q.id}`).addEventListener("input", e => d.roleAnswers[q.id] = e.target.value);
    } else if (q.type === "select") {
      card.querySelector(`[data-q="${q.id}"]`).addEventListener("change", e => d.roleAnswers[q.id] = e.target.value);
    } else if (q.type === "radio") {
      card.querySelectorAll(`[data-q="${q.id}"]`).forEach(r => r.addEventListener("change", () => d.roleAnswers[q.id] = r.value));
    } else if (q.type === "rating") {
      card.querySelectorAll(`[data-q="${q.id}"] .star`).forEach(star => {
        star.addEventListener("click", () => {
          d.roleAnswers[q.id] = Number(star.dataset.val);
          renderSection();
        });
      });
    }
  });
}

// ---------- VALIDATION ----------
function validateSection(num) {
  const d = state.data;
  let valid = true;
  const fail = (id, msg) => { setError(`${id}-error`, msg); valid = false; };
  const clear = (id) => setError(`${id}-error`, "");

  switch (num) {
    case 1: {
      ["full_name", "email", "phone", "dob", "country_residing"].forEach(clear);
      if (!d.full_name) fail("full_name", "Full name is required.");
      if (!d.email) fail("email", "Email is required.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) fail("email", "Enter a valid email address.");
      if (!d.phone) fail("phone", "Phone number is required.");
      if (!d.dob) fail("dob", "Date of birth is required.");
      if (!d.nationality || d.nationality.length === 0) fail("nationality", "Select at least one nationality.");
      if (!d.country_residing) fail("country_residing", "Select your country of residence.");
      break;
    }
    case 2: {
      d.education.forEach((e, i) => {
        ["degree_title", "field_of_study", "institution", "institution_country", "grad_year"].forEach(f => clear(`edu${i}-${f}`));
        ["degree_title", "field_of_study", "institution", "institution_country", "grad_year"].forEach(f => {
          if (!e[f]) fail(`edu${i}-${f}`, "Required.");
        });
        if (!e.degree_level) fail(`edu${i}-degree_level`, "Required.");
      });
      break;
    }
    case 3: {
      if (!d.no_certifications) {
        d.certifications.forEach((c, i) => {
          ["cert_name", "cert_body", "cert_year"].forEach(f => {
            clear(`cert${i}-${f}`);
            if (!c[f]) fail(`cert${i}-${f}`, "Required.");
          });
        });
      }
      break;
    }
    case 4: {
      d.languages.forEach((l, i) => {
        ["language", "proficiency"].forEach(f => {
          clear(`lang${i}-${f}`);
          if (!l[f]) fail(`lang${i}-${f}`, "Required.");
        });
      });
      break;
    }
    case 5: {
      ["total_years_exp", "domain_years_exp", "current_status", "notice_period_weeks", "salary_currency"].forEach(clear);
      if (d.total_years_exp === undefined || d.total_years_exp === "") fail("total_years_exp", "Required.");
      if (d.domain_years_exp === undefined || d.domain_years_exp === "") fail("domain_years_exp", "Required.");
      else if (Number(d.domain_years_exp) > Number(d.total_years_exp)) fail("domain_years_exp", "Cannot exceed total years of experience.");
      if (!d.current_status) fail("current_status", "Required.");
      if (d.notice_period_weeks === undefined || d.notice_period_weeks === "") fail("notice_period_weeks", "Required.");
      if (!d.salary_currency) fail("salary_currency", "Required.");
      break;
    }
    case 6: {
      clear("tech_summary"); clear("domain_tags");
      if (!d.tech_summary) fail("tech_summary", "Required.");
      if (!d.domain_tags || d.domain_tags.length === 0) fail("domain_tags", "Select at least one domain.");
      d.domain_tags.forEach(tag => {
        clear(`expertise-${tag}`);
        if (!d.expertise_levels[tag]) fail(`expertise-${tag}`, "Required.");
      });
      break;
    }
    case 7: {
      clear("countries_worked");
      if (!d.countries_worked || d.countries_worked.length === 0) fail("countries_worked", "Select at least one country.");
      d.countries_worked.forEach(c => {
        const cd = d.country_details[c] || {};
        ["years_in_country", "engagement_type"].forEach(f => {
          clear(`country-${c}-${f === "years_in_country" ? "years" : "engagement"}`);
          if (!cd[f]) fail(`country-${c}-${f === "years_in_country" ? "years" : "engagement"}`, "Required.");
        });
      });
      break;
    }
    case 8: {
      d.projects.forEach((p, i) => {
        ["proj_title", "proj_client", "proj_sector", "proj_role", "proj_start", "proj_contribution", "proj_outcome"].forEach(f => {
          clear(`proj${i}-${f.replace("proj_", "")}`);
        });
        ["proj_title", "proj_client", "proj_sector", "proj_role", "proj_start", "proj_contribution", "proj_outcome"].forEach(f => {
          if (!p[f]) fail(`proj${i}-${f.replace("proj_", "")}`, "Required.");
        });
        if (!p.proj_countries || p.proj_countries.length === 0) fail(`proj${i}-countries`, "Required.");
        if (!p.proj_ongoing && !p.proj_end) fail(`proj${i}-end`, "Required (or mark Ongoing).");
      });
      break;
    }
    case 9: {
      ["team_size_managed", "leadership_type", "budget_oversight"].forEach(clear);
      if (d.team_size_managed === undefined || d.team_size_managed === "") fail("team_size_managed", "Required.");
      if (!d.leadership_type) fail("leadership_type", "Required.");
      if (!d.budget_oversight) fail("budget_oversight", "Required.");
      if (Number(d.team_size_managed) > 0) {
        clear("leadership_desc");
        if (!d.leadership_desc) fail("leadership_desc", "Required.");
      }
      if (d.budget_oversight === "Yes") {
        clear("budget_range");
        if (!d.budget_range) fail("budget_range", "Required.");
      }
      break;
    }
    case 10: break;
    case 11: {
      d.references.forEach((r, i) => {
        ["ref_name", "ref_title", "ref_org", "ref_relationship", "ref_email", "ref_consent"].forEach(f => {
          const key = f.replace("ref_", "");
          clear(`ref${i}-${key}`);
          if (!r[f]) fail(`ref${i}-${key}`, "Required.");
        });
      });
      if (d.references.length < 2) { valid = false; showBanner("At least 2 references are required.", "warning"); }
      break;
    }
    case 12: {
      ["available_date", "willing_relocate", "conflict_of_interest", "accuracy_declaration", "data_consent"].forEach(clear);
      if (!d.available_date) fail("available_date", "Required.");
      if (!d.willing_relocate) fail("willing_relocate", "Required.");
      if (!d.conflict_of_interest) fail("conflict_of_interest", "Required.");
      if (d.conflict_of_interest === "Yes" && !d.coi_details) fail("coi_details", "Required.");
      if (!d.accuracy_declaration) fail("accuracy_declaration", "You must confirm this declaration.");
      if (!d.data_consent) fail("data_consent", "You must provide consent.");
      break;
    }
    case 13: break;
    case 14: {
      SAMS_CONFIG.roleQuestions.forEach(q => {
        clear(`rq-${q.id}`);
        if (q.required && (d.roleAnswers[q.id] === undefined || d.roleAnswers[q.id] === "")) {
          fail(`rq-${q.id}`, "Required.");
        }
      });
      break;
    }
  }
  return valid;
}

// ---------- REVIEW & SUBMIT ----------
function renderReview(root) {
  const d = state.data;
  const completeness = computeCompleteness(d, SAMS_CONFIG);
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="review-section">
      <h3>Completeness: ${Math.round(completeness * 100)}%</h3>
    </div>
    ${reviewSection("Personal Information", [
      ["Full Name", d.full_name], ["Email", d.email], ["Phone", d.phone], ["Date of Birth", d.dob],
      ["Age", d.age], ["Nationality", (d.nationality || []).join(", ")], ["Country Residing", d.country_residing], ["Gender", d.gender || "—"]
    ])}
    ${reviewSection("Education", d.education.map((e, i) => [`Qualification ${i + 1}`, `${e.degree_title || ""} (${e.degree_level || ""}) — ${e.field_of_study || ""}, ${e.institution || ""}, ${e.institution_country || ""}, ${e.grad_year || ""}`]))}
    ${reviewSection("Certifications", d.no_certifications ? [["Certifications", "None declared"]] : d.certifications.map((c, i) => [`Cert ${i + 1}`, `${c.cert_name || ""} — ${c.cert_body || ""} (${c.cert_year || ""})`]))}
    ${reviewSection("Languages", d.languages.map((l, i) => [`Language ${i + 1}`, `${l.language === "Other" ? l.language_other : l.language || ""} — ${l.proficiency || ""}`]))}
    ${reviewSection("Work Experience", [
      ["Total Years Experience", d.total_years_exp], ["Domain Years Experience", d.domain_years_exp],
      ["Current Status", d.current_status], ["Notice Period (weeks)", d.notice_period_weeks],
      ["Salary Expectation", `${d.salary_min || ""}–${d.salary_max || ""} ${d.salary_currency || ""}`]
    ])}
    ${reviewSection("Technical Experience", [
      ["Summary", d.tech_summary], ["Domain Tags", (d.domain_tags || []).map(t => `${t} (${d.expertise_levels[t] || ""})`).join(", ")],
      ["Key Tools", (d.key_tools || []).join(", ")]
    ])}
    ${reviewSection("Country Experience", (d.countries_worked || []).map(c => {
      const cd = d.country_details[c] || {};
      return [c, `${cd.years_in_country || ""} yrs — ${cd.engagement_type || ""}${cd.language_used ? ", " + cd.language_used : ""}`];
    }))}
    ${reviewSection("Projects", d.projects.map((p, i) => [`Project ${i + 1}`, `${p.proj_title || ""} — ${p.proj_client || ""} (${(p.proj_countries || []).join(", ")}), ${p.proj_role || ""}, ${p.proj_start || ""} to ${p.proj_ongoing ? "Ongoing" : (p.proj_end || "")}`]))}
    ${reviewSection("Leadership", [
      ["Team Size Managed", d.team_size_managed], ["Leadership Type", d.leadership_type],
      ["Budget Oversight", d.budget_oversight], ["Budget Range", d.budget_range || "—"]
    ])}
    ${reviewSection("Software Skills", Object.entries(d.software_skills || {}).map(([tool, level]) => [tool, level]))}
    ${reviewSection("References", d.references.map((r, i) => [`Reference ${i + 1}`, `${r.ref_name || ""} — ${r.ref_title || ""}, ${r.ref_org || ""} (${r.ref_relationship || ""})`]))}
    ${reviewSection("Declarations & Availability", [
      ["Available From", d.available_date], ["Willing to Relocate", d.willing_relocate],
      ["Conflict of Interest", d.conflict_of_interest], ["Accuracy Declaration", d.accuracy_declaration ? "Confirmed" : "Not confirmed"],
      ["Data Consent", d.data_consent ? "Given" : "Not given"]
    ])}
    ${reviewSection("CV Upload", [["CV Uploaded", d.cv_uploaded ? d.cv_filename : "Not uploaded"]])}
    ${SAMS_CONFIG.roleQuestions.length ? reviewSection("Role-Specific Questions", SAMS_CONFIG.roleQuestions.map(q => [q.label, d.roleAnswers[q.id]])) : ""}
    <div id="submit-area" style="margin-top:24px">
      <button class="btn btn-primary" id="submit-btn">Submit Application</button>
    </div>
    <div id="confirmation-area"></div>
  `;
  root.appendChild(card);
  document.getElementById("submit-btn").addEventListener("click", submitApplication);
}

function reviewSection(title, rows) {
  return `<div class="review-section">
    <h3>${title}</h3>
    ${rows.map(([label, value]) => `<div class="review-row"><div class="label">${label}</div><div class="value">${value === undefined || value === null || value === "" ? "—" : value}</div></div>`).join("")}
  </div>`;
}

// ---------- SUBMISSION ----------
async function submitApplication() {
  const d = state.data;
  const submitBtn = document.getElementById("submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    const scores = scoreApplication(d, SAMS_CONFIG);
    const appId = `${SAMS_CONFIG.vacancy.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const submissionDate = new Date().toISOString();

    const row = buildRow(d, scores, appId, submissionDate);
    await callSheetsWithRetry(() => SHEETS.appendRow(row));

    const profile = buildProfile(d, scores, appId, submissionDate);
    localStorage.setItem(`sams_profile_${appId}`, JSON.stringify(profile));
    if (d.cv_uploaded && d.cv_base64) {
      localStorage.setItem(`sams_cv_${appId}`, d.cv_base64);
    }
    localStorage.setItem(SUBMITTED_KEY, "true");
    localStorage.removeItem(DRAFT_KEY);

    document.getElementById("confirmation-area").innerHTML = `
      <div class="confirmation-screen">
        <h2><i class="fa-solid fa-circle-check" style="color:#166534"></i> Application Submitted</h2>
        <p>Your Application ID:</p>
        <div class="app-id">${appId}</div>
        <a class="btn btn-primary" href="profile.html?id=${encodeURIComponent(appId)}" target="_blank">View Your Profile</a>
      </div>`;
    document.getElementById("submit-area").style.display = "none";
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Application";
  }
}

function buildRow(d, scores, appId, submissionDate) {
  const edu = d.education[0] || {};
  const degreeLevels = { "PhD": 8, "Masters": 6, "Bachelors": 4, "Diploma": 2, "Other": 2 };
  let highest = d.education.reduce((best, e) => {
    return (degreeLevels[e.degree_level] || 0) > (degreeLevels[best.degree_level] || 0) ? e : best;
  }, edu);

  const englishEntry = d.languages.find(l => l.language === "English");
  const arabicEntry = d.languages.find(l => l.language === "Arabic");
  const otherLangs = d.languages.filter(l => l.language !== "English" && l.language !== "Arabic")
    .map(l => `${l.language === "Other" ? l.language_other : l.language}:${l.proficiency}`).join("|");

  const certsList = d.certifications.map(c => `${c.cert_name}|${c.cert_body}|${c.cert_year}`).join("|");

  const projRows = [];
  for (let i = 0; i < 5; i++) {
    const p = d.projects[i];
    if (p) {
      projRows.push(
        p.proj_title || "", p.proj_client || "", (p.proj_countries || []).join("|"), p.proj_sector || "",
        p.proj_role || "", p.proj_contract_value || "",
        `${p.proj_start || ""} - ${p.proj_ongoing ? "Ongoing" : (p.proj_end || "")}`,
        (p.proj_outcome || "").substring(0, 200)
      );
    } else {
      projRows.push("", "", "", "", "", "", "", "");
    }
  }

  const softwareList = Object.entries(d.software_skills || {}).map(([tool, level]) => `${tool}:${level}`).join("|");
  const ref1 = d.references[0] || {};
  const ref2 = d.references[1] || {};
  const roleAnswers = SAMS_CONFIG.roleQuestions.map(q => {
    const a = d.roleAnswers[q.id];
    return a === undefined || a === null ? "" : String(a);
  });
  while (roleAnswers.length < 3) roleAnswers.push("");

  return [
    appId, submissionDate, SAMS_CONFIG.vacancy.id, SAMS_CONFIG.vacancy.title,
    d.full_name || "", d.email || "", d.phone || "", d.dob || "", d.age ?? "",
    (d.nationality || []).join("|"), d.country_residing || "", d.gender || "",
    highest.degree_level || "", highest.field_of_study || "", highest.institution || "", highest.institution_country || "", highest.grad_year || "",
    d.no_certifications ? 0 : d.certifications.length, certsList,
    d.languages.length,
    englishEntry ? englishEntry.proficiency : "",
    arabicEntry ? arabicEntry.proficiency : "",
    otherLangs,
    d.total_years_exp || "", d.domain_years_exp || "", d.current_status || "", d.notice_period_weeks || "",
    `${d.salary_min || ""}-${d.salary_max || ""} ${d.salary_currency || ""}`,
    (d.tech_summary || "").substring(0, 500),
    (d.domain_tags || []).join("|"),
    Object.entries(d.expertise_levels || {}).map(([k, v]) => `${k}:${v}`).join("|"),
    (d.key_tools || []).join(", "),
    (d.countries_worked || []).length, (d.countries_worked || []).join("|"),
    d.projects.length,
    ...projRows,
    d.team_size_managed || 0, d.leadership_type || "", d.budget_oversight || "", d.budget_range || "",
    softwareList,
    ref1.ref_name || "", ref1.ref_org || "", ref1.ref_email || "", ref1.ref_consent || "",
    ref2.ref_name || "", ref2.ref_org || "", ref2.ref_email || "", ref2.ref_consent || "",
    d.available_date || "", d.willing_relocate || "", d.cv_uploaded ? "Yes" : "No",
    ...roleAnswers,
    scores.education, scores.languages, scores.experience, scores.technical, scores.countryExperience,
    scores.projects, scores.leadership, scores.software, scores.completenessBonus, scores.total,
    scores.band.label, Math.round(scores.completeness * 100),
    "Pending", "", "", ""
  ];
}

function buildProfile(d, scores, appId, submissionDate) {
  const degreeLevels = { "PhD": 8, "Masters": 6, "Bachelors": 4, "Diploma": 2, "Other": 2 };
  let highest = d.education.reduce((best, e) => {
    return (degreeLevels[e.degree_level] || 0) > (degreeLevels[best.degree_level] || 0) ? e : best;
  }, d.education[0] || {});
  return {
    appId, submissionDate, vacancy: SAMS_CONFIG.vacancy,
    full_name: d.full_name, nationality: d.nationality, country_residing: d.country_residing,
    total_years_exp: d.total_years_exp, domain_years_exp: d.domain_years_exp,
    countries_worked: d.countries_worked, country_details: d.country_details,
    languages: d.languages, highest_degree: highest,
    education: d.education, certifications: d.no_certifications ? [] : d.certifications,
    domain_tags: d.domain_tags, expertise_levels: d.expertise_levels, key_tools: d.key_tools,
    projects: d.projects, team_size_managed: d.team_size_managed, leadership_type: d.leadership_type,
    budget_oversight: d.budget_oversight, budget_range: d.budget_range,
    software_skills: d.software_skills, references: d.references,
    available_date: d.available_date, willing_relocate: d.willing_relocate,
    scores,
  };
}
