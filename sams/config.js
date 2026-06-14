const SAMS_CONFIG = {
  org: {
    name: "Your Organization",
    logo: "assets/logo-placeholder.svg",
    primaryColor: "#1B3A6B",
    accentColor: "#C8973A"
  },
  vacancy: {
    id: "VAC-2025-001",
    title: "Senior Technical Advisor",
    department: "Programme Delivery",
    deadline: "2025-08-31",
    estimatedTime: "40 minutes"
  },
  sheets: {
    apiKey: "PASTE_YOUR_GOOGLE_API_KEY_HERE",
    spreadsheetId: "PASTE_YOUR_GOOGLE_SHEET_ID_HERE",
    masterRange: "Master List!A:CT",
    writeMode: "APPEND"
  },
  scoring: {
    education: 15,
    languages: 10,
    experience: 15,
    technical: 20,
    countryExperience: 10,
    projects: 15,
    leadership: 10,
    software: 5
  },
  roleQuestions: [
    { id: "rq1", type: "text", required: true, maxWords: 150, label: "Describe your experience working in fragile or conflict-affected states." },
    { id: "rq2", type: "radio", required: true, label: "Have you managed a budget exceeding $500,000 USD?", options: ["Yes", "No"] },
    { id: "rq3", type: "rating", required: true, label: "Rate your proficiency in results-based management (RBM) frameworks.", scale: 5 }
  ],
  form: {
    autoSaveInterval: 60,
    showProgressBar: true,
    showEstimatedTime: true,
    allowCVUpload: true,
    cvMaxSizeMB: 2
  },
  countries: ["Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bangladesh","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Cambodia","Cameroon","Canada","Chad","Chile","Colombia","Congo (DRC)","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Czech Republic","Denmark","Ecuador","Egypt","El Salvador","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Haiti","Honduras","Hungary","India","Indonesia","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kosovo","Kuwait","Kyrgyzstan","Laos","Lebanon","Liberia","Libya","Madagascar","Malawi","Malaysia","Mali","Mauritania","Mexico","Moldova","Mongolia","Morocco","Mozambique","Myanmar","Nepal","Netherlands","Nicaragua","Niger","Nigeria","North Macedonia","Norway","Pakistan","Palestine","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone","Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Tajikistan","Tanzania","Thailand","Timor-Leste","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe","Other"],
  sectors: ["Agriculture & Food Security","Climate & Environment","Conflict & Stabilisation","Democracy & Governance","Disaster Risk Reduction","Economic Development","Education","Energy","Gender & Social Inclusion","Health","Humanitarian Assistance","Infrastructure","Livelihoods","Migration","Monitoring & Evaluation","Natural Resources","Peace & Security","Private Sector Development","Public Finance Management","Rule of Law","Urban Development","WASH (Water, Sanitation & Hygiene)","Other"],
  languages: ["Arabic","Chinese (Mandarin)","Dutch","English","French","German","Hindi","Italian","Japanese","Korean","Persian (Farsi)","Polish","Portuguese","Russian","Spanish","Swahili","Turkish","Urdu","Other"],
  proficiencyLevels: ["Native","Fluent","Professional Working","Basic"],
  expertiseLevels: ["Foundational","Proficient","Advanced","Expert"],
  leadershipTypes: ["Line Management","Project / Team Leadership","Advisory / Technical Lead","Matrix Management","No Direct Leadership"],
  softwareCategories: {
    "Productivity & Office": ["Microsoft Word","Microsoft Excel","Microsoft PowerPoint","Google Docs","Google Sheets","Google Slides"],
    "Data & Analytics": ["SPSS","Stata","R","Python","Power BI","Tableau","NVIVO","KOBO Toolbox"],
    "Project Management": ["MS Project","JIRA","Asana","Monday.com","Trello","Smartsheet"],
    "Communication & Collaboration": ["Microsoft Teams","Zoom","Slack","SharePoint","Salesforce"],
    "GIS & Mapping": ["ArcGIS","QGIS","Google Earth Pro","MapInfo"]
  }
};
