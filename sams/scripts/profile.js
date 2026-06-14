// profile.js - renders the one-page applicant profile

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const appId = params.get("id");
  const source = params.get("source");
  const root = document.getElementById("profile-root");

  if (!appId) {
    root.innerHTML = `<p>No application ID specified. Add <code>?id=APP_ID</code> to the URL.</p>`;
    return;
  }

  let profile;
  if (source === "sheet") {
    try {
      const rows = await callSheetsWithRetry(() => SHEETS.readAll());
      const row = rows.find(r => r.App_ID === appId);
      if (!row) {
        root.innerHTML = `<p>No applicant found with ID ${appId} in the sheet.</p>`;
        return;
      }
      profile = profileFromSheetRow(row);
    } catch (e) {
      root.innerHTML = `<p>Failed to load profile from Google Sheet.</p>`;
      return;
    }
  } else {
    const raw = localStorage.getItem(`sams_profile_${appId}`);
    if (!raw) {
      root.innerHTML = `<p>No profile found for ID ${appId} in local storage. Try opening with <code>&source=sheet</code>.</p>`;
      return;
    }
    profile = JSON.parse(raw);
  }

  renderProfile(root, profile);
});

function profileFromSheetRow(row) {
  const num = v => (v === "" || v === undefined ? 0 : Number(v));
  const education = [{
    degree_title: "", degree_level: row.Highest_Degree, field_of_study: row.Degree_Field,
    institution: row.Degree_Institution, institution_country: row.Degree_Country, grad_year: row.Degree_Year
  }];
  const languages = [];
  if (row.English_Level) languages.push({ language: "English", proficiency: row.English_Level });
  if (row.Arabic_Level) languages.push({ language: "Arabic", proficiency: row.Arabic_Level });
  (row.Other_Languages || "").split("|").filter(Boolean).forEach(pair => {
    const [lang, level] = pair.split(":");
    languages.push({ language: lang, proficiency: level });
  });

  const expertiseLevels = {};
  (row.Expertise_Levels || "").split("|").filter(Boolean).forEach(pair => {
    const [tag, level] = pair.split(":");
    expertiseLevels[tag] = level;
  });

  const countriesWorked = (row.Countries_Worked_List || "").split("|").filter(Boolean);

  const projects = [];
  for (let i = 1; i <= 5; i++) {
    const title = row[`Proj${i}_Title`];
    if (!title) continue;
    const duration = row[`Proj${i}_Duration`] || "";
    const [start, end] = duration.split(" - ");
    projects.push({
      proj_title: title, proj_client: row[`Proj${i}_Client`],
      proj_countries: (row[`Proj${i}_Countries`] || "").split("|").filter(Boolean),
      proj_role: row[`Proj${i}_Role`], proj_start: start, proj_end: end === "Ongoing" ? "" : end,
      proj_ongoing: end === "Ongoing", proj_outcome: row[`Proj${i}_Outcome`]
    });
  }

  const softwareSkills = {};
  (row.Software_Skills_List || "").split("|").filter(Boolean).forEach(pair => {
    const [tool, level] = pair.split(":");
    softwareSkills[tool] = level;
  });

  const references = [];
  if (row.Ref1_Name) references.push({ ref_name: row.Ref1_Name, ref_org: row.Ref1_Org, ref_consent: row.Ref1_Consent });
  if (row.Ref2_Name) references.push({ ref_name: row.Ref2_Name, ref_org: row.Ref2_Org, ref_consent: row.Ref2_Consent });

  return {
    appId: row.App_ID, submissionDate: row.Submission_Date,
    vacancy: { title: row.Vacancy_Title, id: row.Vacancy_ID },
    full_name: row.Full_Name,
    nationality: (row.Nationality || "").split("|").filter(Boolean),
    country_residing: row.Country_Residing,
    total_years_exp: row.Total_Years_Exp, domain_years_exp: row.Domain_Years_Exp,
    countries_worked: countriesWorked, country_details: {},
    languages, highest_degree: education[0], education,
    certifications: (row.Certifications_List || "").split("|").filter(Boolean).reduce((acc, val, idx, arr) => {
      if (idx % 3 === 0) acc.push({ cert_name: arr[idx], cert_body: arr[idx + 1], cert_year: arr[idx + 2] });
      return acc;
    }, []),
    domain_tags: (row.Domain_Tags || "").split("|").filter(Boolean),
    expertise_levels: expertiseLevels,
    key_tools: (row.Key_Tools || "").split(",").map(s => s.trim()).filter(Boolean),
    projects,
    team_size_managed: row.Team_Size_Managed, leadership_type: row.Leadership_Type,
    budget_oversight: row.Budget_Oversight, budget_range: row.Budget_Range,
    software_skills: softwareSkills, references,
    available_date: row.Available_Date, willing_relocate: row.Willing_Relocate,
    scores: {
      education: num(row.Score_Education), languages: num(row.Score_Languages), experience: num(row.Score_Experience),
      technical: num(row.Score_Technical), countryExperience: num(row.Score_Countries), projects: num(row.Score_Projects),
      leadership: num(row.Score_Leadership), software: num(row.Score_Software), completenessBonus: num(row.Score_Completeness_Bonus),
      total: num(row.TOTAL_SCORE), completeness: num(row.Completeness_Pct) / 100,
      band: bandFor(num(row.TOTAL_SCORE))
    }
  };
}

function bandFor(total) {
  if (total >= 85) return { label: "Highly Recommended", color: "#166534" };
  if (total >= 70) return { label: "Recommended", color: "#15803D" };
  if (total >= 50) return { label: "Borderline", color: "#D97706" };
  return { label: "Not Recommended", color: "#DC2626" };
}

function softwareDotClass(level) {
  return { Beginner: "dot-beginner", Intermediate: "dot-intermediate", Advanced: "dot-advanced", Expert: "dot-expert" }[level] || "dot-beginner";
}

function renderProfile(root, p) {
  const cfg = SAMS_CONFIG;
  document.documentElement.style.setProperty("--primary", cfg.org.primaryColor);
  document.documentElement.style.setProperty("--accent", cfg.org.accentColor);

  const topDegrees = (p.education || []).slice(0, 2);
  const topCerts = (p.certifications || []).slice(0, 4);
  const topDomains = (p.domain_tags || []).slice(0, 3);
  const countries = p.countries_worked || [];
  const shownCountries = countries.slice(0, 4);
  const moreCountries = countries.length - shownCountries.length;
  const topProjects = (p.projects || []).slice(0, 3);
  const s = p.scores || {};

  root.innerHTML = `
    <div class="print-btn-wrap no-print">
      <button class="btn btn-primary" onclick="window.print()"><i class="fa-solid fa-print"></i> Print / Save as PDF</button>
    </div>

    <div class="profile-header">
      <div>
        <h1>${p.full_name || ""}</h1>
        <div class="sub">${(p.nationality || []).join(", ")} · Residing in ${p.country_residing || ""}</div>
        <div class="sub">App ID: ${p.appId} · Submitted: ${p.submissionDate ? new Date(p.submissionDate).toLocaleString() : ""} · ${p.vacancy ? p.vacancy.title : ""}</div>
      </div>
      <img src="${cfg.org.logo}" alt="${cfg.org.name}">
    </div>

    <div class="snapshot-bar">
      <div class="stat-box"><div class="value">${p.total_years_exp || 0}</div><div class="label">Total Experience (yrs)</div></div>
      <div class="stat-box"><div class="value">${p.domain_years_exp || 0}</div><div class="label">Domain Experience (yrs)</div></div>
      <div class="stat-box"><div class="value">${countries.length}</div><div class="label">Countries Worked</div></div>
      <div class="stat-box"><div class="value">${(p.languages || []).length}</div><div class="label">Languages</div></div>
      <div class="stat-box"><div class="value">${p.highest_degree ? (p.highest_degree.degree_level || "") : ""}</div><div class="label">Highest Qualification</div></div>
    </div>

    <div class="card">
      <h3>Education & Certifications</h3>
      <div class="two-col">
        <div>
          ${topDegrees.map(e => `<div class="review-row"><div class="value">${e.degree_title || ""} ${e.degree_level ? `(${e.degree_level})` : ""}<br><span class="text-muted">${e.field_of_study || ""}, ${e.institution || ""} — ${e.grad_year || ""}</span></div></div>`).join("") || "—"}
        </div>
        <div>
          ${topCerts.map(c => `<div class="review-row"><div class="value">${c.cert_name} <span class="text-muted">— ${c.cert_body} (${c.cert_year})</span></div></div>`).join("") || "<span class='text-muted'>No certifications</span>"}
        </div>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <h3>Technical Profile</h3>
        ${topDomains.map(tag => `<div class="review-row"><span class="badge">${tag}: ${(p.expertise_levels || {})[tag] || ""}</span></div>`).join("")}
        <div class="text-muted" style="margin-top:8px">Key Tools: ${(p.key_tools || []).join(", ") || "—"}</div>
      </div>
      <div class="card">
        <h3>Country Experience</h3>
        ${shownCountries.map(c => {
          const cd = (p.country_details || {})[c] || {};
          return `<div class="review-row"><div class="value">${c} · ${cd.years_in_country || ""} yrs · ${cd.engagement_type || ""}</div></div>`;
        }).join("") || "—"}
        ${moreCountries > 0 ? `<div class="text-muted">+ ${moreCountries} more</div>` : ""}
      </div>
    </div>

    <div class="card">
      <h3>Project Highlights</h3>
      <div class="proj-cards">
        ${topProjects.map(proj => `<div class="proj-card">
          <h4>${proj.proj_title || ""}</h4>
          <div class="meta">${proj.proj_client || ""} · ${(proj.proj_countries || []).join(", ")} · ${proj.proj_role || ""}</div>
          <div class="meta">${proj.proj_start || ""} – ${proj.proj_ongoing ? "Ongoing" : (proj.proj_end || "")}</div>
          <div class="outcome">${(proj.proj_outcome || "").split(/\s+/).slice(0, 30).join(" ")}</div>
        </div>`).join("") || "—"}
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <h3>Leadership</h3>
        <div class="review-row"><div class="label">Team Size</div><div class="value">${p.team_size_managed || 0}</div></div>
        <div class="review-row"><div class="label">Leadership Type</div><div class="value">${p.leadership_type || "—"}</div></div>
        <div class="review-row"><div class="label">Budget Oversight</div><div class="value">${p.budget_oversight || "—"} ${p.budget_range ? `(${p.budget_range})` : ""}</div></div>
      </div>
      <div class="card">
        <h3>Software Skills</h3>
        <div class="chip-list">
          ${Object.entries(p.software_skills || {}).map(([tool, level]) => `<span class="chip"><span class="dot ${softwareDotClass(level)}"></span>${tool}</span>`).join("") || "—"}
        </div>
      </div>
    </div>

    <div class="card score-summary">
      <div class="score-subscores">
        <div>Education: ${s.education ?? 0}</div>
        <div>Languages: ${s.languages ?? 0}</div>
        <div>Experience: ${s.experience ?? 0}</div>
        <div>Technical: ${s.technical ?? 0}</div>
        <div>Countries: ${s.countryExperience ?? 0}</div>
        <div>Projects: ${s.projects ?? 0}</div>
        <div>Leadership: ${s.leadership ?? 0}</div>
        <div>Software: ${s.software ?? 0}</div>
        <div>Completeness Bonus: ${s.completenessBonus ?? 0}</div>
      </div>
      <div class="score-total">
        <div class="value">${s.total ?? 0}/100</div>
        <div class="score-band-badge" style="background:${(s.band || {}).color || '#999'}">${(s.band || {}).label || ""}</div>
        <div class="text-muted">Completeness: ${Math.round((s.completeness || 0) * 100)}%</div>
      </div>
    </div>

    <div class="profile-footer">
      <div>References available: ${(p.references || []).length}</div>
      <div>Contact now: ${(p.references || []).some(r => r.ref_consent === "Yes, contact now") ? "Yes" : "No"}</div>
      <div>Willing to relocate: ${p.willing_relocate || "—"}</div>
      <div>Available from: ${p.available_date || "—"}</div>
      <div>App ID: ${p.appId}</div>
      <div>Submitted: ${p.submissionDate ? new Date(p.submissionDate).toLocaleDateString() : ""}</div>
    </div>
  `;
}
