import type { CategoryId } from './types';

/**
 * Contextual images shown as a visual banner inside the QuestionCard
 * for each category — Quran questions show a Quran page, geography shows
 * a map, Kuwait history shows Kuwait Towers, etc.
 *
 * External images: Wikimedia Commons 640px thumbnails (CC-licensed / PD).
 * Missing-category fallback: inline SVG with the category emoji — zero
 * external requests, loads instantly, never shows a broken-image placeholder.
 */
export interface CategoryMedia {
  url: string;
  alt: string;
  position?: string; // CSS object-position, default 'center'
}

// Generates a dark-themed SVG data URI centered on a single emoji.
// Used for categories that don't yet have a Wikimedia photo.
function svgEmoji(emoji: string): string {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160">',
    '<defs>',
    '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0%" stop-color="#2C1F10"/>',
    '<stop offset="100%" stop-color="#1A1208"/>',
    '</linearGradient>',
    '</defs>',
    '<rect width="320" height="160" fill="url(#g)"/>',
    `<text x="160" y="88" font-size="72" text-anchor="middle" dominant-baseline="middle">${emoji}</text>`,
    '</svg>',
  ].join('');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const CATEGORY_CONTEXT_IMAGES: Partial<Record<CategoryId, CategoryMedia>> = {

  // ── Quran & Islamic ────────────────────────────────────────────────────────
  quran: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Folio_from_a_Quran_MET_09.192.1.jpg/640px-Folio_from_a_Quran_MET_09.192.1.jpg',
    alt: 'صفحة من القرآن الكريم بخط عربي أنيق',
    position: 'center top',
  },
  quran_tafsir: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Folio_from_a_Quran_MET_09.192.1.jpg/640px-Folio_from_a_Quran_MET_09.192.1.jpg',
    alt: 'صفحة من القرآن الكريم',
    position: 'center top',
  },
  hadith: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Blue_Mosque_Istanbul.jpg/640px-Blue_Mosque_Istanbul.jpg',
    alt: 'المسجد الأزرق في إسطنبول',
  },
  islamic_history: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Al_Aqsa_Mosque_1.jpg/640px-Al_Aqsa_Mosque_1.jpg',
    alt: 'المسجد الأقصى الشريف',
  },
  prophets: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image-Al-Aqsa_Mosque.jpg/640px-Image-Al-Aqsa_Mosque.jpg',
    alt: 'المسجد الأقصى في القدس',
  },
  ramadan: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Ramadan_Kareem.jpg/640px-Ramadan_Kareem.jpg',
    alt: 'هلال رمضان المبارك',
  },

  // ── Kuwait ─────────────────────────────────────────────────────────────────
  kuwait_history: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kuwait_Towers.jpg/640px-Kuwait_Towers.jpg',
    alt: 'أبراج الكويت على شاطئ الخليج',
  },
  diwaniya: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Typical_Kuwaiti_Coffee_Pot_-_Dallah.jpg/640px-Typical_Kuwaiti_Coffee_Pot_-_Dallah.jpg',
    alt: 'دلة قهوة عربية كويتية',
    position: 'center',
  },
  kuwait_food: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Machboos.jpg/640px-Machboos.jpg',
    alt: 'المچبوس الكويتي',
  },
  kuwait_dialect: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kuwait_Towers.jpg/640px-Kuwait_Towers.jpg',
    alt: 'الكويت',
  },
  kuwait_celebs: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kuwait_Towers.jpg/640px-Kuwait_Towers.jpg',
    alt: 'الكويت',
    position: 'center',
  },
  gulf: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Empty_Quarter.jpg/640px-Empty_Quarter.jpg',
    alt: 'الربع الخالي — صحراء الجزيرة العربية',
  },
  gcc_football: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Soccer_ball.svg/640px-Soccer_ball.svg.png',
    alt: 'كرة قدم',
  },

  // ── Geography & Maps ───────────────────────────────────────────────────────
  geo: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/640px-World_map_-_low_resolution.svg.png',
    alt: 'خريطة العالم',
  },
  flags_maps: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/640px-World_map_-_low_resolution.svg.png',
    alt: 'خريطة العالم والأعلام',
  },
  arab_world: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Arab_League_orthographic.svg/640px-Arab_League_orthographic.svg.png',
    alt: 'خريطة الوطن العربي',
  },
  travel: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Blue_Mosque_Istanbul.jpg/640px-Blue_Mosque_Istanbul.jpg',
    alt: 'السفر والسياحة',
  },

  // ── History ────────────────────────────────────────────────────────────────
  history: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/432px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    alt: 'لوحة فنية تاريخية',
    position: 'center top',
  },
  world_history: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Colosseo_2020.jpg/640px-Colosseo_2020.jpg',
    alt: 'الكولوسيوم الروماني',
  },
  politics: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Arab_League_orthographic.svg/640px-Arab_League_orthographic.svg.png',
    alt: 'خريطة سياسية',
  },

  // ── Science & Nature ───────────────────────────────────────────────────────
  science: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Simple_Periodic_Table_Chart-en.svg/640px-Simple_Periodic_Table_Chart-en.svg.png',
    alt: 'الجدول الدوري للعناصر',
  },
  space: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/640px-The_Earth_seen_from_Apollo_17.jpg',
    alt: 'كوكب الأرض من الفضاء',
  },
  environment: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/640px-Above_Gotham.jpg',
    alt: 'البيئة الطبيعية',
  },
  animals: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Camels_in_Jordan.jpg/640px-Camels_in_Jordan.jpg',
    alt: 'إبل في الصحراء',
  },
  medicine: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/640px-Red_Apple.jpg',
    alt: 'الصحة والطب',
  },
  human_body: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Simple_Periodic_Table_Chart-en.svg/640px-Simple_Periodic_Table_Chart-en.svg.png',
    alt: 'علم الأحياء',
  },
  psychology: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Human-brain.SVG/640px-Human-brain.SVG.png',
    alt: 'الدماغ البشري',
  },

  // ── Arts & Culture ─────────────────────────────────────────────────────────
  culture: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Empty_Quarter.jpg/640px-Empty_Quarter.jpg',
    alt: 'الثقافة العربية',
  },
  architecture: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Colosseo_2020.jpg/640px-Colosseo_2020.jpg',
    alt: 'العمارة التاريخية',
  },
  literature: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Folio_from_a_Quran_MET_09.192.1.jpg/640px-Folio_from_a_Quran_MET_09.192.1.jpg',
    alt: 'الأدب العربي',
    position: 'center top',
  },
  art_visual: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/432px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    alt: 'الفن التشكيلي',
    position: 'center top',
  },
  arabic_language: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Folio_from_a_Quran_MET_09.192.1.jpg/640px-Folio_from_a_Quran_MET_09.192.1.jpg',
    alt: 'الخط العربي الأنيق',
    position: 'center top',
  },
  music: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/GuitareClassique5.png/434px-GuitareClassique5.png',
    alt: 'آلات موسيقية',
  },
  drama: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Opera_Garnier_grand_foyer.jpg/640px-Opera_Garnier_grand_foyer.jpg',
    alt: 'مسرح أوبرا',
  },

  // ── Sports ─────────────────────────────────────────────────────────────────
  sport: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Soccer_ball.svg/640px-Soccer_ball.svg.png',
    alt: 'رياضة',
  },

  // ── Entertainment ──────────────────────────────────────────────────────────
  movies_intl: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Opera_Garnier_grand_foyer.jpg/640px-Opera_Garnier_grand_foyer.jpg',
    alt: 'عالم السينما',
  },
  food: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Machboos.jpg/640px-Machboos.jpg',
    alt: 'المأكولات',
  },

  // ── Technology ─────────────────────────────────────────────────────────────
  technology: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Simple_Periodic_Table_Chart-en.svg/640px-Simple_Periodic_Table_Chart-en.svg.png',
    alt: 'التقنية والتكنولوجيا',
  },

  // ── Gulf & Kuwait Heritage ─────────────────────────────────────────────────
  gulf_dialect: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Typical_Kuwaiti_Coffee_Pot_-_Dallah.jpg/640px-Typical_Kuwaiti_Coffee_Pot_-_Dallah.jpg',
    alt: 'دلة القهوة العربية — رمز الضيافة الخليجية',
  },
  kuwait_bedou: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Camels_in_Jordan.jpg/640px-Camels_in_Jordan.jpg',
    alt: 'الإبل — رمز الحياة البدوية',
    position: 'center',
  },
  hadar_dialect: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Typical_Kuwaiti_Coffee_Pot_-_Dallah.jpg/640px-Typical_Kuwaiti_Coffee_Pot_-_Dallah.jpg',
    alt: 'ضيافة الحضر الكويتية',
    position: 'center',
  },
  kuwait_tribes: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Empty_Quarter.jpg/640px-Empty_Quarter.jpg',
    alt: 'الصحراء العربية — موطن القبائل',
    position: 'center',
  },
  kuwait_old: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kuwait_Towers.jpg/640px-Kuwait_Towers.jpg',
    alt: 'الكويت القديمة',
    position: 'center top',
  },

  // ── Economy ────────────────────────────────────────────────────────────────
  economics: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kuwait_Towers.jpg/640px-Kuwait_Towers.jpg',
    alt: 'الاقتصاد',
  },
  business: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kuwait_Towers.jpg/640px-Kuwait_Towers.jpg',
    alt: 'الأعمال والتجارة',
  },

  // ── Social & Family ────────────────────────────────────────────────────────
  social: { url: svgEmoji('🤝'), alt: 'التفاعل الاجتماعي' },
  family: { url: svgEmoji('👨‍👩‍👧‍👦'), alt: 'العائلة والأسرة' },
  jokes:  { url: svgEmoji('😄'), alt: 'نكت وطرائف' },

  // ── Finance & Entrepreneurship ────────────────────────────────────────────
  finance:          { url: svgEmoji('💰'), alt: 'المال والتمويل' },
  entrepreneurship: { url: svgEmoji('🚀'), alt: 'ريادة الأعمال' },

  // ── Technology specialisations ─────────────────────────────────────────────
  ai_tech:       { url: svgEmoji('🤖'), alt: 'الذكاء الاصطناعي' },
  cybersecurity: { url: svgEmoji('🔒'), alt: 'الأمن السيبراني' },
  programming:   { url: svgEmoji('💻'), alt: 'البرمجة والتطوير' },

  // ── Entertainment ──────────────────────────────────────────────────────────
  tv_shows_intl:    { url: svgEmoji('📺'), alt: 'المسلسلات العالمية' },
  video_games:      { url: svgEmoji('🎮'), alt: 'ألعاب الفيديو' },
  celebrities_intl: { url: svgEmoji('⭐'), alt: 'مشاهير العالم' },

  // ── Challenge modes ────────────────────────────────────────────────────────
  math_logic: { url: svgEmoji('🔢'), alt: 'الرياضيات والمنطق' },
  riddles_ar:  { url: svgEmoji('🧩'), alt: 'الألغاز والأحاجي' },
};
