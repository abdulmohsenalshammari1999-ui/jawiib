// scoring.js - SAMS scoring engine

function wordCount(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function scoreApplication(formData, config) {
  const s = config.scoring;

  // ---- EDUCATION ----
  let education = 0;
  const educationEntries = formData.education || [];
  const degreePoints = { "PhD": 8, "Masters": 6, "Bachelors": 4, "Diploma": 2, "Other": 2 };
  let highestDegreePts = 0;
  educationEntries.forEach(e => {
    const pts = degreePoints[e.degree_level] ?? 0;
    if (pts > highestDegreePts) highestDegreePts = pts;
  });
  const certCount = (formData.no_certifications ? 0 : (formData.certifications || []).length);
  const certBonus = Math.min(certCount, 7);
  education = Math.min(highestDegreePts + certBonus, s.education);

  // ---- LANGUAGES ----
  let languages = 0;
  const langEntries = formData.languages || [];
  const englishEntry = langEntries.find(l => l.language === "English");
  const arabicEntry = langEntries.find(l => l.language === "Arabic");
  const engLevelPts = { "Native": 4, "Fluent": 4, "Professional Working": 3, "Basic": 1 };
  const araLevelPts = { "Native": 3, "Fluent": 3, "Professional Working": 2, "Basic": 1 };
  const englishScore = englishEntry ? (engLevelPts[englishEntry.proficiency] || 0) : 0;
  const arabicScore = arabicEntry ? (araLevelPts[arabicEntry.proficiency] || 0) : 0;
  const otherLangsCount = langEntries.filter(l => l.language !== "English" && l.language !== "Arabic").length;
  const otherBonus = Math.min(otherLangsCount * 0.5, 3);
  languages = Math.min(englishScore + arabicScore + otherBonus, s.languages);

  // ---- EXPERIENCE ----
  let experience = 0;
  const totalYears = Number(formData.total_years_exp) || 0;
  const domainYears = Number(formData.domain_years_exp) || 0;
  let band = 0;
  if (totalYears > 10) band = 15;
  else if (totalYears >= 6) band = 12;
  else if (totalYears >= 3) band = 8;
  else if (totalYears >= 0) band = 4;
  let ratio = 0;
  if (totalYears > 0) {
    ratio = domainYears / totalYears;
    ratio = Math.max(0.5, ratio);
  } else {
    ratio = 0;
  }
  experience = Math.min(band * ratio, s.experience);

  // ---- TECHNICAL ----
  let technical = 0;
  const domainTags = formData.domain_tags || [];
  const expertiseLevels = formData.expertise_levels || {}; // tag -> level
  const expMultiplier = { "Foundational": 0.5, "Proficient": 0.7, "Advanced": 0.9, "Expert": 1.0 };
  let techSum = 0;
  domainTags.slice(0, 3).forEach(tag => {
    const lvl = expertiseLevels[tag];
    const mult = expMultiplier[lvl] || 0;
    techSum += 4 * mult;
  });
  technical = Math.min(techSum, s.technical);

  // ---- COUNTRY EXPERIENCE ----
  let countryExperience = 0;
  const countriesWorked = formData.countries_worked || [];
  const cCount = countriesWorked.length;
  let cPts = 0;
  if (cCount >= 7) cPts = 10;
  else if (cCount >= 4) cPts = 8;
  else if (cCount >= 2) cPts = 5;
  else if (cCount === 1) cPts = 2;
  countryExperience = Math.min(cPts, s.countryExperience);

  // ---- PROJECTS ----
  let projects = 0;
  const projectEntries = (formData.projects || []).slice(0, 5);
  let projSum = 0;
  projectEntries.forEach(p => {
    if (p.proj_title && p.proj_client && p.proj_role && p.proj_outcome) {
      let pts = 2;
      if (wordCount(p.proj_outcome) > 50) pts += 1;
      projSum += pts;
    }
  });
  projects = Math.min(projSum, s.projects);

  // ---- LEADERSHIP ----
  let leadership = 0;
  const teamSize = Number(formData.team_size_managed) || 0;
  let teamPts = 0;
  if (teamSize >= 16) teamPts = 9;
  else if (teamSize >= 6) teamPts = 6;
  else if (teamSize >= 1) teamPts = 3;
  else teamPts = 0;
  let leadSum = teamPts;
  if (formData.leadership_type === "Line Management") leadSum += 1;
  if (formData.budget_oversight === "Yes") leadSum += 1;
  leadership = Math.min(leadSum, s.leadership);

  // ---- SOFTWARE ----
  let software = 0;
  const softwareSkills = formData.software_skills || {}; // tool -> level
  const swLevelPts = { "Beginner": 0.5, "Intermediate": 0.75, "Advanced": 1.0, "Expert": 1.25 };
  let swSum = 0;
  Object.values(softwareSkills).forEach(level => {
    swSum += swLevelPts[level] || 0;
  });
  let totalToolsPossible = 0;
  Object.values(config.softwareCategories).forEach(arr => totalToolsPossible += arr.length);
  software = totalToolsPossible > 0
    ? Math.min((swSum / (totalToolsPossible * 1.25)) * s.software, s.software)
    : 0;

  // ---- COMPLETENESS BONUS ----
  let completenessBonus = 0;
  // (a) certifications
  const certsValid = formData.no_certifications || (formData.certifications || []).length >= 1;
  if (certsValid) completenessBonus += 1;
  // (b) at least one language tested with score
  const langTested = langEntries.some(l => l.language_tested === "Yes" && l.test_score);
  if (langTested) completenessBonus += 1;
  // (c) all projects present have proj_contract_value filled
  const allProjectsHaveValue = projectEntries.length > 0
    ? projectEntries.every(p => p.proj_contract_value)
    : true;
  if (allProjectsHaveValue) completenessBonus += 1;
  // (d) leadership_desc filled when team_size_managed>0
  if (teamSize > 0) {
    if (formData.leadership_desc) completenessBonus += 1;
  } else {
    completenessBonus += 1;
  }
  // (e) cv_uploaded
  if (formData.cv_uploaded === true) completenessBonus += 1;
  completenessBonus = Math.min(completenessBonus, 5);

  // ---- TOTAL ----
  let total = education + languages + experience + technical + countryExperience + projects + leadership + software + completenessBonus;
  total = Math.min(total, 100);

  // ---- COMPLETENESS (fraction of required fields filled) ----
  const completeness = computeCompleteness(formData, config);

  // ---- BAND ----
  let bandResult;
  if (total >= 85) bandResult = { label: "Highly Recommended", color: "#166534" };
  else if (total >= 70) bandResult = { label: "Recommended", color: "#15803D" };
  else if (total >= 50) bandResult = { label: "Borderline", color: "#D97706" };
  else bandResult = { label: "Not Recommended", color: "#DC2626" };

  return {
    education: round2(education),
    languages: round2(languages),
    experience: round2(experience),
    technical: round2(technical),
    countryExperience: round2(countryExperience),
    projects: round2(projects),
    leadership: round2(leadership),
    software: round2(software),
    completenessBonus: round2(completenessBonus),
    total: round2(total),
    completeness,
    band: bandResult
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function computeCompleteness(formData, config) {
  // Reasonable approximation: check a representative set of required fields across sections
  const checks = [];
  checks.push(!!formData.full_name);
  checks.push(!!formData.email);
  checks.push(!!formData.phone);
  checks.push(!!formData.dob);
  checks.push((formData.nationality || []).length > 0);
  checks.push(!!formData.country_residing);
  checks.push((formData.education || []).length > 0 && formData.education.every(e => e.degree_title && e.degree_level && e.field_of_study && e.institution && e.institution_country && e.grad_year));
  checks.push(formData.no_certifications === true || (formData.certifications || []).length >= 0);
  checks.push((formData.languages || []).length > 0 && formData.languages.every(l => l.language && l.proficiency));
  checks.push(formData.total_years_exp !== undefined && formData.total_years_exp !== "");
  checks.push(formData.domain_years_exp !== undefined && formData.domain_years_exp !== "");
  checks.push(!!formData.current_status);
  checks.push(formData.notice_period_weeks !== undefined && formData.notice_period_weeks !== "");
  checks.push(!!formData.salary_currency);
  checks.push(!!formData.tech_summary);
  checks.push((formData.domain_tags || []).length > 0);
  checks.push((formData.countries_worked || []).length > 0);
  checks.push((formData.projects || []).length > 0 && formData.projects.every(p => p.proj_title && p.proj_client && (p.proj_countries||[]).length && p.proj_sector && p.proj_role && p.proj_start && (p.proj_end || p.proj_ongoing) && p.proj_contribution && p.proj_outcome));
  checks.push(formData.team_size_managed !== undefined && formData.team_size_managed !== "");
  checks.push(!!formData.leadership_type);
  checks.push(!!formData.budget_oversight);
  checks.push((formData.references || []).length >= 2 && formData.references.every(r => r.ref_name && r.ref_title && r.ref_org && r.ref_relationship && r.ref_email && r.ref_consent));
  checks.push(!!formData.available_date);
  checks.push(!!formData.willing_relocate);
  checks.push(!!formData.conflict_of_interest);
  checks.push(formData.accuracy_declaration === true);
  checks.push(formData.data_consent === true);
  (config.roleQuestions || []).forEach(rq => {
    const val = (formData.roleAnswers || {})[rq.id];
    checks.push(val !== undefined && val !== null && val !== "");
  });

  const filled = checks.filter(Boolean).length;
  return checks.length > 0 ? round2(filled / checks.length) : 0;
}

async function getAIScoreRationale(formData, scores) {
  return { rationale: "AI scoring not yet enabled.", flags: [] };
}
