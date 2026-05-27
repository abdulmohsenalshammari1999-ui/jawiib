/**
 * Static category definitions.
 *
 * CMS alignment (future): each entry maps to AdminCategory in future-backend.ts.
 * Fields to add when migrating: active (bool), questionCount, nameEn, updatedAt.
 * Admin import: CSV columns = id, nameAr, nameEn, icon, color, active.
 */
import type { Category, CategoryId } from './types';

export const categories: Category[] = [
  { id: 'culture',        name: 'ثقافة عامة',       icon: '📚',  color: '#B07D1A' },
  { id: 'sport',          name: 'رياضة',             icon: '⚽',  color: '#1A5FA8' },
  { id: 'history',        name: 'تاريخ',             icon: '📜',  color: '#8A6010' },
  { id: 'quran',          name: 'قرآن وسنة',         icon: '🕌',  color: '#1A7A42' },
  { id: 'gulf',           name: 'خليجيات',           icon: '🐪',  color: '#D4A94A' },
  { id: 'science',        name: 'علوم',              icon: '🔭',  color: '#1A5FA8' },
  { id: 'geo',            name: 'جغرافيا',           icon: '🗺️',  color: '#0891B2' },
  { id: 'food',           name: 'أكل ومطبخ',         icon: '🥘',  color: '#C2410C' },
  { id: 'drama',          name: 'دراما ومسلسلات',    icon: '🎭',  color: '#6B4CAA' },
  { id: 'music',          name: 'فن وموسيقى',        icon: '🎙️',  color: '#BE185D' },
  { id: 'jokes',          name: 'طرائف وألغاز',      icon: '😄',  color: '#EA580C' },
  { id: 'business',       name: 'أعمال واقتصاد',     icon: '🛢️',  color: '#7A6040' },
  { id: 'social',         name: 'سوشال ميديا',       icon: '📱',  color: '#B82118' },
  { id: 'ramadan',        name: 'رمضانيات',          icon: '🌙',  color: '#7C3AED' },
  { id: 'travel',         name: 'سفر وسياحة',        icon: '🌴',  color: '#0284C7' },
  { id: 'family',         name: 'عائلة وأطفال',      icon: '🏡',  color: '#DB2777' },
  // Kuwait/GCC
  { id: 'kuwait_history', name: 'تاريخ الكويت',      icon: '🇰🇼',  color: '#007A3D' },
  { id: 'kuwait_dialect', name: 'لهجة كويتية',       icon: '🗣️',  color: '#CA8A04' },
  { id: 'gcc_football',   name: 'كرة خليجية',        icon: '🏆',  color: '#1D4ED8' },
  { id: 'diwaniya',       name: 'ديوانية وعادات',    icon: '☕',  color: '#92400E' },
  { id: 'kuwait_food',    name: 'مطبخ كويتي',        icon: '🍛',  color: '#B91C1C' },
  { id: 'kuwait_celebs',  name: 'مشاهير الخليج',     icon: '🌟',  color: '#7C3AED' },
];

export function getCategoryById(id: CategoryId): Category {
  return categories.find((c) => c.id === id)!;
}
