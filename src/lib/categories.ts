/**
 * Static category definitions — 52 categories (22 original + 30 new).
 */
import type { Category, CategoryId } from './types';

export const categories: Category[] = [
  // ── Original 22 ─────────────────────────────────────────────────────────
  { id: 'culture',           name: 'ثقافة عامة',          icon: '📚',  color: '#B07D1A' },
  { id: 'sport',             name: 'رياضة',                icon: '⚽',  color: '#1A5FA8' },
  { id: 'history',           name: 'تاريخ',                icon: '📜',  color: '#8A6010' },
  { id: 'quran',             name: 'قرآن وسنة',            icon: '🕌',  color: '#1A7A42' },
  { id: 'gulf',              name: 'خليجيات',              icon: '🐪',  color: '#D4A94A' },
  { id: 'science',           name: 'علوم',                 icon: '🔭',  color: '#1A5FA8' },
  { id: 'geo',               name: 'جغرافيا',              icon: '🗺️',  color: '#0891B2' },
  { id: 'food',              name: 'أكل ومطبخ',            icon: '🥘',  color: '#C2410C' },
  { id: 'drama',             name: 'دراما ومسلسلات',       icon: '🎭',  color: '#6B4CAA' },
  { id: 'music',             name: 'فن وموسيقى',           icon: '🎙️',  color: '#BE185D' },
  { id: 'jokes',             name: 'طرائف وألغاز',         icon: '😄',  color: '#EA580C' },
  { id: 'business',          name: 'أعمال واقتصاد',        icon: '🛢️',  color: '#7A6040' },
  { id: 'social',            name: 'سوشال ميديا',          icon: '📱',  color: '#B82118' },
  { id: 'ramadan',           name: 'رمضانيات',             icon: '🌙',  color: '#7C3AED' },
  { id: 'travel',            name: 'سفر وسياحة',           icon: '🌴',  color: '#0284C7' },
  { id: 'family',            name: 'عائلة وأطفال',         icon: '🏡',  color: '#DB2777' },
  { id: 'kuwait_history',    name: 'تاريخ الكويت',         icon: '🇰🇼',  color: '#007A3D' },
  { id: 'kuwait_dialect',    name: 'لهجة كويتية',          icon: '🗣️',  color: '#CA8A04' },
  { id: 'gcc_football',      name: 'كرة خليجية',           icon: '🏆',  color: '#1D4ED8' },
  { id: 'diwaniya',          name: 'ديوانية وعادات',       icon: '☕',  color: '#92400E' },
  { id: 'kuwait_food',       name: 'مطبخ كويتي',           icon: '🍛',  color: '#B91C1C' },
  { id: 'kuwait_celebs',     name: 'مشاهير الخليج',        icon: '🌟',  color: '#7C3AED' },

  // ── Islamic ──────────────────────────────────────────────────────────────
  { id: 'quran_tafsir',      name: 'تفسير القرآن',         icon: '📖',  color: '#166534' },
  { id: 'hadith',            name: 'حديث نبوي',            icon: '🌿',  color: '#15803D' },
  { id: 'islamic_history',   name: 'التاريخ الإسلامي',     icon: '🕋',  color: '#047857' },
  { id: 'prophets',          name: 'الأنبياء والرسل',      icon: '⭐',  color: '#059669' },

  // ── Arab & World ─────────────────────────────────────────────────────────
  { id: 'arab_world',        name: 'العالم العربي',         icon: '🌍',  color: '#0369A1' },
  { id: 'world_history',     name: 'التاريخ العالمي',       icon: '🏛️',  color: '#1E3A8A' },
  { id: 'politics',          name: 'سياسة وحكومات',        icon: '🗳️',  color: '#3730A3' },

  // ── Economy & Business ───────────────────────────────────────────────────
  { id: 'economics',         name: 'اقتصاد وتجارة',        icon: '📊',  color: '#78350F' },
  { id: 'finance',           name: 'مال ومحافظ',            icon: '💰',  color: '#92400E' },
  { id: 'entrepreneurship',  name: 'ريادة الأعمال',         icon: '🚀',  color: '#B45309' },

  // ── Technology ───────────────────────────────────────────────────────────
  { id: 'technology',        name: 'تكنولوجيا',             icon: '💻',  color: '#1D4ED8' },
  { id: 'ai_tech',           name: 'ذكاء اصطناعي',          icon: '🤖',  color: '#4338CA' },
  { id: 'cybersecurity',     name: 'أمن إلكتروني',          icon: '🔐',  color: '#6D28D9' },
  { id: 'programming',       name: 'برمجة وتطوير',          icon: '👨‍💻', color: '#5B21B6' },

  // ── Health & Mind ────────────────────────────────────────────────────────
  { id: 'medicine',          name: 'طب وصحة',               icon: '🏥',  color: '#0F766E' },
  { id: 'human_body',        name: 'جسم الإنسان',           icon: '🫀',  color: '#0D9488' },
  { id: 'psychology',        name: 'علم النفس',              icon: '🧠',  color: '#0891B2' },

  // ── Nature & Universe ────────────────────────────────────────────────────
  { id: 'space',             name: 'الفضاء والكون',          icon: '🚀',  color: '#1E1B4B' },
  { id: 'environment',       name: 'بيئة وطبيعة',           icon: '🌿',  color: '#166534' },
  { id: 'animals',           name: 'حيوانات',                icon: '🦁',  color: '#713F12' },

  // ── Arts & Culture ───────────────────────────────────────────────────────
  { id: 'architecture',      name: 'عمارة وبناء',            icon: '🏗️',  color: '#78350F' },
  { id: 'literature',        name: 'أدب وشعر',               icon: '✍️',  color: '#9D174D' },
  { id: 'art_visual',        name: 'فنون بصرية',             icon: '🎨',  color: '#BE185D' },
  { id: 'arabic_language',   name: 'اللغة العربية',           icon: '📝',  color: '#B45309' },

  // ── Entertainment ────────────────────────────────────────────────────────
  { id: 'movies_intl',       name: 'أفلام عالمية',           icon: '🎬',  color: '#7C3AED' },
  { id: 'tv_shows_intl',     name: 'مسلسلات عالمية',         icon: '📺',  color: '#6D28D9' },
  { id: 'video_games',       name: 'ألعاب إلكترونية',        icon: '🎮',  color: '#4338CA' },
  { id: 'celebrities_intl',  name: 'مشاهير عالميون',         icon: '🌟',  color: '#B45309' },
  { id: 'flags_maps',        name: 'أعلام وخرائط',           icon: '🏴',  color: '#0369A1' },

  // ── Challenge Modes ──────────────────────────────────────────────────────
  { id: 'math_logic',        name: 'رياضيات ومنطق',          icon: '🔢',  color: '#1E40AF' },
  { id: 'riddles_ar',        name: 'ألغاز وأحاجي',            icon: '🧩',  color: '#7C3AED' },

  // ── Gulf & Kuwait Heritage ───────────────────────────────────────────────
  { id: 'gulf_dialect',      name: 'كلمات خليجية',            icon: '🗣️',  color: '#B45309' },
  { id: 'kuwait_tribes',     name: 'لجهات وقبايل',            icon: '🏕️',  color: '#92400E' },
  { id: 'kuwait_old',        name: 'الكويت أول',              icon: '⚓',   color: '#0369A1' },
];

export function getCategoryById(id: CategoryId): Category {
  return categories.find((c) => c.id === id)!;
}
