import type { Category, CategoryId } from './types';

export const categories: Category[] = [
  { id: 'culture', name: 'ثقافة عامة', icon: '📚', color: '#D4A017' },
  { id: 'sport', name: 'رياضة', icon: '⚽', color: '#22C55E' },
  { id: 'history', name: 'تاريخ', icon: '🏛️', color: '#A0522D' },
  { id: 'quran', name: 'قرآن وسنة', icon: '🕌', color: '#10B981' },
  { id: 'gulf', name: 'خليجيات', icon: '🐪', color: '#F59E0B' },
  { id: 'science', name: 'علوم', icon: '🔬', color: '#3B82F6' },
  { id: 'geo', name: 'جغرافيا', icon: '🌍', color: '#06B6D4' },
  { id: 'food', name: 'أكل ومطبخ', icon: '🍽️', color: '#EF4444' },
  { id: 'drama', name: 'دراما ومسلسلات', icon: '🎬', color: '#8B5CF6' },
  { id: 'music', name: 'فن وموسيقى', icon: '🎵', color: '#EC4899' },
  { id: 'jokes', name: 'طرائف وألغاز', icon: '😂', color: '#F97316' },
  { id: 'business', name: 'أعمال واقتصاد', icon: '💼', color: '#64748B' },
  { id: 'social', name: 'سوشال ميديا', icon: '📱', color: '#E11D48' },
  { id: 'ramadan', name: 'رمضانيات', icon: '🌙', color: '#7C3AED' },
  { id: 'travel', name: 'سفر وسياحة', icon: '✈️', color: '#0EA5E9' },
  { id: 'family', name: 'عائلة وأطفال', icon: '👨‍👩‍👧‍👦', color: '#F472B6' },
  // Kuwait/GCC
  { id: 'kuwait_history', name: 'تاريخ الكويت', icon: '🇰🇼', color: '#007A3D' },
  { id: 'kuwait_dialect', name: 'لهجة كويتية', icon: '💬', color: '#CA8A04' },
  { id: 'gcc_football',   name: 'كرة خليجية', icon: '⚽', color: '#1D4ED8' },
  { id: 'diwaniya',       name: 'ديوانية وعادات', icon: '🏕️', color: '#92400E' },
  { id: 'kuwait_food',    name: 'مطبخ كويتي', icon: '🍲', color: '#DC2626' },
  { id: 'kuwait_celebs',  name: 'مشاهير الخليج', icon: '⭐', color: '#7C3AED' },
];

export function getCategoryById(id: CategoryId): Category {
  return categories.find((c) => c.id === id)!;
}
