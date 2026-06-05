/**
 * Media question bank — all 52 categories, every question type.
 * image/audio/map URLs → Wikipedia Commons (CC-licensed CDN).
 * ordering / riddle / math types need no URL.
 *
 * Adding ≥1 non-text question per category ensures every quick-game
 * session surfaces at least one visual/audio/puzzle card.
 */

import type { Question } from './types';

function qs(q: Partial<Question> & Pick<Question, 'id' | 'category' | 'tier' | 'points' | 'text' | 'options' | 'correctIndex'>): Question {
  return q as Question;
}

const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
const WD = 'https://upload.wikimedia.org/wikipedia/commons';

export const MEDIA_SAMPLE_QUESTIONS: Question[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // ORIGINAL 22 CATEGORIES
  // ══════════════════════════════════════════════════════════════════════════

  // ── culture ───────────────────────────────────────────────────────────────
  qs({
    id: 'media-img-empire-state',
    category: 'culture', tier: 1, points: 100, type: 'guess',
    text: 'ما اسم هذا المبنى الشهير الملتقط من الجو؟',
    mediaUrl: `${W}/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg`,
    mediaAlt: 'مبنى إمباير ستيت من الجو',
    options: ['مبنى إمباير ستيت', 'مبنى كرايسلر', 'مركز تجارة عالمي', 'برج إيفل'],
    correctIndex: 0,
    teaser: 'أشهر مباني القرن العشرين',
    explanation: 'إمباير ستيت في مانهاتن 443م — كان الأطول 1931–1970.',
    tags: ['معالم', 'عالم'],
  }),
  qs({
    id: 'media-riddle-comb',
    category: 'culture', tier: 2, points: 200, type: 'riddle',
    text: 'له أسنان لكنه لا يأكل، وله رأس لكنه لا يفكّر. ما هو؟',
    options: ['المشط', 'المفتاح', 'المسمار', 'المطرقة'],
    correctIndex: 0,
    explanation: 'المشط له "أسنان" و"رأس" لكنه لا يأكل ولا يفكّر.',
    funFact: 'أقدم مشط وُجد في تركيا يعود إلى 5000 سنة مصنوع من العظام.',
    tags: ['لغز', 'ثقافة'],
  }),
  qs({
    id: 'media-order-culture-wc',
    category: 'culture', tier: 3, points: 300, type: 'ordering',
    text: 'رتّب دول المضيف من الأقدم إلى الأحدث في كأس العالم',
    options: ['قطر 2022', 'ألمانيا 2006', 'روسيا 2018', 'البرازيل 2014'],
    correctIndex: 0,
    correctOrder: [1, 3, 2, 0],
    explanation: 'ألمانيا 2006 ← البرازيل 2014 ← روسيا 2018 ← قطر 2022',
    tags: ['رياضة', 'كأس العالم'],
  }),

  // ── sport ─────────────────────────────────────────────────────────────────
  qs({
    id: 'media-flag-qatar',
    category: 'sport', tier: 1, points: 100, type: 'image',
    text: 'العلم الأبيض والكستنائي — لأي دولة استضافت كأس العالم 2022؟',
    mediaUrl: `${W}/6/65/Flag_of_Qatar.svg/640px-Flag_of_Qatar.svg.png`,
    mediaAlt: 'علم قطر',
    options: ['قطر', 'البحرين', 'المغرب', 'موريتانيا'],
    correctIndex: 0,
    explanation: 'علم قطر الكستنائي والأبيض المُسنَّن — استضافت مونديال 2022.',
    funFact: 'قطر الدولة الوحيدة ذات علم عرضه أكبر من طوله (نسبة 11:28).',
    tags: ['قطر', 'أعلام'],
  }),
  qs({
    id: 'media-ordering-wc-scorers',
    category: 'sport', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب من الأكثر تسجيلاً في كأس العالم إلى الأقل (حتى 2022)',
    options: ['رونالدو (8)', 'كلوزه (16)', 'فونتين (13)', 'بيلي (12)'],
    correctIndex: 0,
    correctOrder: [1, 2, 3, 0],
    explanation: 'كلوزه 16 > فونتين 13 > بيلي 12 > رونالدو 8',
    funFact: 'كلوزه سجّل أهدافه عبر 4 نسخ متتالية 1998–2014.',
    tags: ['رياضة', 'كأس العالم'],
  }),

  // ── history ───────────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-egg',
    category: 'history', tier: 3, points: 300, type: 'riddle',
    text: 'أنا صندوق بلا مسمار ولا ذهب، لكن فيّ كنزٌ ذهبي. ما أنا؟',
    options: ['البيضة', 'الصدفة', 'التمر', 'الرمّان'],
    correctIndex: 0,
    explanation: 'البيضة — قشرة صلبة والصفار الذهبي بداخلها.',
    funFact: 'قشرة البيضة مكوّنة من 95% كربونات الكالسيوم.',
    tags: ['لغز'],
  }),
  qs({
    id: 'media-order-history-events',
    category: 'history', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب الأحداث الإسلامية من الأقدم إلى الأحدث',
    options: ['فتح مكة', 'الهجرة النبوية', 'معركة بدر', 'وفاة النبي ﷺ'],
    correctIndex: 0,
    correctOrder: [1, 2, 0, 3],
    explanation: 'الهجرة 622 ← بدر 624 ← فتح مكة 630 ← وفاة النبي 632',
    tags: ['تاريخ', 'إسلام'],
  }),
  qs({
    id: 'media-img-pyramids',
    category: 'history', tier: 1, points: 100, type: 'guess',
    text: 'في أي دولة تقع هذه الأهرامات الشهيرة؟',
    mediaUrl: `${W}/e/e3/Kheops-Pyramid.jpg/640px-Kheops-Pyramid.jpg`,
    mediaAlt: 'هرم خوفو في الجيزة',
    options: ['مصر', 'العراق', 'السودان', 'المغرب'],
    correctIndex: 0,
    explanation: 'أهرامات الجيزة في مصر — بُني الهرم الأكبر ~2560 ق.م.',
    funFact: 'الهرم الأكبر كان أطول بناء بشري لأكثر من 3800 سنة.',
    tags: ['تاريخ', 'معالم'],
  }),

  // ── quran ─────────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-arkan',
    category: 'quran', tier: 1, points: 100, type: 'ordering',
    text: 'رتّب أركان الإسلام بالترتيب الصحيح',
    options: ['الصوم', 'الشهادتان', 'الحج', 'الصلاة'],
    correctIndex: 0,
    correctOrder: [1, 3, 0, 2],
    explanation: 'الشهادتان ← الصلاة ← الصوم ← الحج (مع الزكاة الغائبة عن الخيارات)',
    tags: ['إسلام', 'أركان'],
  }),
  qs({
    id: 'media-riddle-quran',
    category: 'quran', tier: 2, points: 200, type: 'riddle',
    text: 'أنا سورة في القرآن اسمها حيوان، وأنا من أطول السور. ما اسمي؟',
    options: ['البقرة', 'النمل', 'النحل', 'الفيل'],
    correctIndex: 0,
    explanation: 'سورة البقرة — أطول سور القرآن (286 آية) وسُمّيت بالبقرة.',
    funFact: 'سورة البقرة تحتوي على آية الكرسي (الآية 255).',
    tags: ['قرآن', 'سور'],
  }),

  // ── gulf ──────────────────────────────────────────────────────────────────
  qs({
    id: 'media-img-burj-khalifa',
    category: 'gulf', tier: 2, points: 200, type: 'guess',
    text: 'في أي مدينة يقع هذا الناطحة سحاب الأطول في العالم؟',
    mediaUrl: `${W}/9/93/Burj_Khalifa.jpg/500px-Burj_Khalifa.jpg`,
    mediaAlt: 'برج خليفة في دبي',
    options: ['دبي', 'أبوظبي', 'الدوحة', 'الرياض'],
    correctIndex: 0,
    explanation: 'برج خليفة في دبي 828م — أطول مبنى في العالم منذ 2010.',
    funFact: 'يضم 163 طابقاً واستغرق بناؤه 6 سنوات.',
    tags: ['إمارات', 'عمارة'],
  }),
  qs({
    id: 'media-flag-saudi',
    category: 'gulf', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة هذا؟',
    mediaUrl: `${W}/0/0d/Flag_of_Saudi_Arabia.svg/640px-Flag_of_Saudi_Arabia.svg.png`,
    mediaAlt: 'علم المملكة العربية السعودية',
    options: ['المملكة العربية السعودية', 'باكستان', 'إيران', 'الإمارات'],
    correctIndex: 0,
    explanation: 'علم السعودية — الشهادة وسيف على خلفية خضراء.',
    funFact: 'علم السعودية هو الوحيد الذي يصعب عكسه بسبب الكتابة.',
    tags: ['سعودية', 'أعلام'],
  }),
  qs({
    id: 'media-map-saudi',
    category: 'gulf', tier: 2, points: 200, type: 'map',
    text: 'الدولة المُلوَّنة على الخريطة — ما اسمها؟',
    mediaUrl: `${W}/6/62/Saudi_Arabia_in_its_region.svg/640px-Saudi_Arabia_in_its_region.svg.png`,
    mediaAlt: 'خريطة المنطقة مع تمييز السعودية',
    options: ['السعودية', 'العراق', 'إيران', 'تركيا'],
    correctIndex: 0,
    explanation: 'المملكة العربية السعودية — أكبر دول الخليج مساحةً.',
    tags: ['خرائط', 'خليج'],
  }),

  // ── science ───────────────────────────────────────────────────────────────
  qs({
    id: 'media-audio-lion',
    category: 'science', tier: 1, points: 100, type: 'identify',
    text: 'استمع لهذا الصوت — ما اسم هذا الحيوان؟',
    mediaUrl: `${WD}/7/73/Lion_waiting_in_Namibia.ogg`,
    mediaDuration: 5,
    options: ['الأسد', 'النمر', 'الفهد', 'الضبع'],
    correctIndex: 0,
    explanation: 'زئير الأسد يُسمع من 8 كيلومترات.',
    funFact: 'مجموعات الأسود تُسمى "فخراً" وتضم 10–40 فرداً.',
    tags: ['حيوانات', 'أصوات'],
  }),
  qs({
    id: 'media-audio-cuckoo',
    category: 'science', tier: 1, points: 100, type: 'identify',
    text: 'من خلال هذا الصوت — ما اسم هذا الطائر؟',
    mediaUrl: `${WD}/4/4d/Cuculus_canorus_-_cuckoo_-_001.ogg`,
    mediaDuration: 6,
    options: ['الوقواق', 'الببغاء', 'الحمام', 'البلبل'],
    correctIndex: 0,
    explanation: 'الوقواق (Cuckoo) — سُمّيت ساعة الكوكو نسبةً لصوته.',
    funFact: 'الوقواق يضع بيضه في أعشاش طيور أخرى.',
    tags: ['طيور', 'أصوات'],
  }),
  qs({
    id: 'media-ordering-planets',
    category: 'science', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب الكواكب من الأقرب للشمس إلى الأبعد',
    options: ['المريخ', 'الزهرة', 'زحل', 'المشتري'],
    correctIndex: 0,
    correctOrder: [1, 0, 3, 2],
    explanation: 'الزهرة ← المريخ ← المشتري ← زحل',
    funFact: 'المجموعة الشمسية تضم 8 كواكب بعد تصنيف بلوتو 2006.',
    tags: ['علوم', 'فضاء'],
  }),
  qs({
    id: 'media-math-1',
    category: 'science', tier: 1, points: 100, type: 'math',
    text: '(12 × 5) − 18 + 3 = ?',
    options: ['45', '40', '50', '48'],
    correctIndex: 0,
    explanation: '12×5=60، 60−18=42، 42+3=45',
    funFact: 'الضرب والقسمة يسبقان الجمع والطرح — قاعدة أولوية العمليات.',
    tags: ['رياضيات'],
  }),
  qs({
    id: 'media-math-hard',
    category: 'science', tier: 5, points: 500, type: 'math',
    text: '∛216 + √49 − 2² = ?',
    options: ['9', '10', '11', '8'],
    correctIndex: 0,
    explanation: '∛216=6، √49=7، 2²=4 → 6+7−4=9',
    funFact: '216=6³ — حجم مكعب ضلعه 6 وحدات.',
    tags: ['رياضيات', 'جذور'],
  }),
  qs({
    id: 'media-img-saturn',
    category: 'science', tier: 2, points: 200, type: 'image',
    text: 'أي كواكب المجموعة الشمسية يظهر في هذه الصورة؟',
    mediaUrl: `${W}/c/c7/Saturn_during_Equinox.jpg/640px-Saturn_during_Equinox.jpg`,
    mediaAlt: 'كوكب زحل مع حلقاته',
    options: ['زحل', 'المشتري', 'أورانوس', 'نبتون'],
    correctIndex: 0,
    explanation: 'زحل — أجمل كواكب المجموعة الشمسية بحلقاته المميزة.',
    funFact: 'حلقات زحل مكوّنة من الجليد والصخور، قطرها 282,000 كم.',
    tags: ['فضاء', 'كواكب'],
  }),

  // ── geo ───────────────────────────────────────────────────────────────────
  qs({
    id: 'media-map-kuwait',
    category: 'geo', tier: 2, points: 200, type: 'map',
    text: 'الدولة المُلوَّنة على هذه الخريطة — ما اسمها؟',
    mediaUrl: `${W}/b/b0/Kuwait_in_its_region.svg/640px-Kuwait_in_its_region.svg.png`,
    mediaAlt: 'خريطة الخليج مع تمييز الكويت',
    options: ['الكويت', 'البحرين', 'قطر', 'عُمان'],
    correctIndex: 0,
    explanation: 'الكويت شمال غرب الخليج، تحدّها العراق شمالاً والسعودية جنوباً.',
    funFact: 'مساحة الكويت 17,818 كم².',
    tags: ['جغرافيا', 'خليج'],
  }),
  qs({
    id: 'media-map-egypt',
    category: 'geo', tier: 2, points: 200, type: 'map',
    text: 'الدولة المُلوَّنة على الخريطة؟',
    mediaUrl: `${W}/e/e0/Egypt_in_its_region.svg/640px-Egypt_in_its_region.svg.png`,
    mediaAlt: 'خريطة المنطقة مع تمييز مصر',
    options: ['مصر', 'ليبيا', 'السودان', 'تونس'],
    correctIndex: 0,
    explanation: 'مصر — تربط قارتي أفريقيا وآسيا عبر سيناء.',
    tags: ['جغرافيا', 'خرائط'],
  }),

  // ── food ──────────────────────────────────────────────────────────────────
  qs({
    id: 'media-img-baklava',
    category: 'food', tier: 2, points: 200, type: 'image',
    text: 'ما اسم هذا الحلوى الشرقية الشهيرة؟',
    mediaUrl: `${W}/5/56/Baklava_-_Turkish_special%2C_80_pieces.jpg/640px-Baklava_-_Turkish_special%2C_80_pieces.jpg`,
    mediaAlt: 'طبق البقلاوة',
    options: ['البقلاوة', 'الكنافة', 'المقروطة', 'اللقيمات'],
    correctIndex: 0,
    explanation: 'البقلاوة — حلوى طبقات من الفيلو والمكسرات والعسل.',
    funFact: 'البقلاوة معروفة في تركيا واليونان والدول العربية منذ القرن العاشر.',
    tags: ['حلوى', 'مطبخ شرقي'],
  }),
  qs({
    id: 'media-riddle-food',
    category: 'food', tier: 1, points: 100, type: 'riddle',
    text: 'أنا ثمرة بلا بذرة ظاهرة، تُكنز وتُيبَّس، وأنا من أحب ما يُفطر عليه المسلم. ما أنا؟',
    options: ['التمر', 'العنب', 'الزيتون', 'التين'],
    correctIndex: 0,
    explanation: 'التمر — ذُكر في القرآن الكريم وهو سُنَّة الإفطار.',
    funFact: 'السعودية والإمارات من أكبر منتجي التمر في العالم.',
    tags: ['تمر', 'إسلام'],
  }),

  // ── drama ─────────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-drama-eras',
    category: 'drama', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب هذه الأفلام الكلاسيكية من الأقدم إلى الأحدث',
    options: ['تيتانيك (1997)', 'الرسالة (1976)', 'لورنس العرب (1962)', 'أفاتار (2009)'],
    correctIndex: 0,
    correctOrder: [2, 1, 0, 3],
    explanation: 'لورنس العرب 1962 ← الرسالة 1976 ← تيتانيك 1997 ← أفاتار 2009',
    tags: ['سينما', 'أفلام'],
  }),

  // ── music ─────────────────────────────────────────────────────────────────
  qs({
    id: 'media-audio-beethoven',
    category: 'music', tier: 3, points: 300, type: 'audio',
    text: 'استمع لهذه السوناتا الكلاسيكية — من مؤلّفها؟',
    mediaUrl: `${WD}/a/ac/Beethoven_-_Moonlight_Sonata_Op._27_No._2.ogg`,
    mediaDuration: 8,
    options: ['بيتهوفن', 'موزارت', 'شوبان', 'باخ'],
    correctIndex: 0,
    teaser: 'أشهر سوناتا في التاريخ',
    explanation: 'سوناتة ضوء القمر (Op. 27 No. 2) كتبها بيتهوفن 1801.',
    funFact: 'بيتهوفن كان يعاني من الصمم التدريجي حين ألّف معظم أعماله.',
    tags: ['موسيقى', 'كلاسيكي'],
  }),
  qs({
    id: 'media-audio-bach',
    category: 'music', tier: 3, points: 300, type: 'audio',
    text: 'استمع — من مؤلف هذه المقطوعة الشهيرة للأرغن؟',
    mediaUrl: `${WD}/b/b3/Bach_toccata_fugue_d_minor.ogg`,
    mediaDuration: 10,
    options: ['باخ', 'هاندل', 'ليست', 'فيفالدي'],
    correctIndex: 0,
    explanation: 'توكاتا وفوغة في ري الصغير (BWV 565) ليوهان سيباستيان باخ ~1704.',
    funFact: 'باخ أنجب 20 طفلاً وكتب أكثر من 1000 قطعة موسيقية.',
    tags: ['موسيقى', 'كلاسيكي'],
  }),
  qs({
    id: 'media-audio-mozart',
    category: 'music', tier: 2, points: 200, type: 'audio',
    text: 'استمع لهذه السيمفونية — من مؤلّفها؟',
    mediaUrl: `${WD}/5/5a/Mozart_-_Symphony_40_-_1._Allegro_molto.ogg`,
    mediaDuration: 8,
    options: ['موزارت', 'بيتهوفن', 'شوبان', 'هايدن'],
    correctIndex: 0,
    explanation: 'سيمفونية رقم 40 في صول الصغير لموزارت — ألّفها 1788.',
    funFact: 'موزارت ألّف هذه السيمفونية وهو في 32 من عمره.',
    tags: ['موسيقى', 'كلاسيكي'],
  }),
  qs({
    id: 'media-riddle-music',
    category: 'music', tier: 1, points: 100, type: 'riddle',
    text: 'لا يُرى ولا يُلمس، لكنه يملأ القاعات ويُحرّك القلوب. ما هو؟',
    options: ['الصوت الموسيقي', 'الضوء', 'الهواء', 'الحرارة'],
    correctIndex: 0,
    explanation: 'الصوت الموسيقي — موجات صوتية تنتقل في الهواء.',
    tags: ['موسيقى', 'لغز'],
  }),

  // ── jokes ─────────────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-jokes',
    category: 'jokes', tier: 1, points: 100, type: 'riddle',
    text: 'ما الشيء الذي كلما أكثرت منه قلّت منه؟',
    options: ['الحفرة', 'الماء', 'الطعام', 'النوم'],
    correctIndex: 0,
    explanation: 'الحفرة — كلما حفرت أكثر صارت أعمق وأقل تراباً.',
    tags: ['لغز', 'نكتة'],
  }),

  // ── business ──────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-business-companies',
    category: 'business', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب من الأعلى قيمة سوقية تقريباً (2023)',
    options: ['أمازون', 'أبل', 'أرامكو', 'مايكروسوفت'],
    correctIndex: 0,
    correctOrder: [1, 3, 2, 0],
    explanation: 'أبل > مايكروسوفت > أرامكو > أمازون (تقريباً 2023)',
    tags: ['أعمال', 'اقتصاد'],
  }),

  // ── social ────────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-social-users',
    category: 'social', tier: 1, points: 100, type: 'ordering',
    text: 'رتّب من الأكثر مستخدمين نشطين شهرياً إلى الأقل (2023)',
    options: ['تويتر X', 'فيسبوك', 'إنستغرام', 'يوتيوب'],
    correctIndex: 0,
    correctOrder: [1, 3, 2, 0],
    explanation: 'فيسبوك ~3B > يوتيوب ~2.7B > إنستغرام ~2B > تويتر ~350M',
    tags: ['تواصل اجتماعي'],
  }),

  // ── ramadan ───────────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-ramadan',
    category: 'ramadan', tier: 1, points: 100, type: 'riddle',
    text: 'أنا شهر أُضاعَف فيه الحسنات، وتُفتح فيّ أبواب الجنة. من أنا؟',
    options: ['رمضان', 'شعبان', 'محرم', 'ذو الحجة'],
    correctIndex: 0,
    explanation: 'شهر رمضان — شهر الصيام ونزول القرآن.',
    funFact: 'رمضان التاسع في التقويم الهجري.',
    tags: ['رمضان', 'إسلام'],
  }),
  qs({
    id: 'media-order-ramadan',
    category: 'ramadan', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب هذه العبادات بأهميتها في رمضان من الأساسي إلى الإضافي',
    options: ['قيام الليل', 'الصيام', 'قراءة القرآن', 'العمرة'],
    correctIndex: 0,
    correctOrder: [1, 2, 0, 3],
    explanation: 'الصيام ركن ← قراءة القرآن سُنَّة ← قيام الليل مستحب ← العمرة فضيلة',
    tags: ['رمضان', 'عبادات'],
  }),

  // ── travel ────────────────────────────────────────────────────────────────
  qs({
    id: 'media-img-eiffel',
    category: 'travel', tier: 1, points: 100, type: 'guess',
    text: 'في أي مدينة يقع هذا البرج الشهير؟',
    mediaUrl: `${W}/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/800px-Tour_Eiffel_Wikimedia_Commons.jpg`,
    mediaAlt: 'برج إيفل في باريس',
    options: ['باريس', 'لندن', 'برلين', 'روما'],
    correctIndex: 0,
    explanation: 'برج إيفل في باريس، فرنسا — بُني 1887-1889 للمعرض العالمي.',
    funFact: 'برج إيفل يمتد 15 سم في الصيف بسبب تمدد الحديد.',
    tags: ['فرنسا', 'معالم', 'سفر'],
  }),
  qs({
    id: 'media-img-colosseum',
    category: 'travel', tier: 2, points: 200, type: 'guess',
    text: 'ما اسم هذا المعلم الروماني القديم؟',
    mediaUrl: `${W}/d/de/Colosseo_2020.jpg/800px-Colosseo_2020.jpg`,
    mediaAlt: 'الكولوسيوم في روما',
    options: ['الكولوسيوم', 'البانثيون', 'قوس النصر', 'ميدان روما'],
    correctIndex: 0,
    explanation: 'الكولوسيوم (المدرّج الروماني) في روما — بُني بين 70-80م.',
    funFact: 'الكولوسيوم كان يستوعب 50,000–80,000 متفرج.',
    tags: ['روما', 'معالم', 'تاريخ'],
  }),
  qs({
    id: 'media-img-taj',
    category: 'travel', tier: 2, points: 200, type: 'guess',
    text: 'هذا المعلم الشهير — في أي دولة يقع؟',
    mediaUrl: `${W}/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/800px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg`,
    mediaAlt: 'تاج محل في أغرا بالهند',
    options: ['الهند', 'باكستان', 'إيران', 'تركيا'],
    correctIndex: 0,
    explanation: 'تاج محل في أغرا بالهند — بُني 1631-1648م.',
    funFact: 'شاه جهان بناه حبّاً لزوجته ممتاز محل.',
    tags: ['الهند', 'معالم', 'سفر'],
  }),

  // ── family ────────────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-family',
    category: 'family', tier: 1, points: 100, type: 'riddle',
    text: 'أنا لك لكنّك لا تستخدمني إلا الآخرون. ما أنا؟',
    options: ['اسمك', 'وجهك', 'ظلّك', 'صوتك'],
    correctIndex: 0,
    explanation: 'اسمك — يستخدمه الآخرون لمناداتك أكثر مما تستخدمه أنت.',
    tags: ['لغز', 'عائلة'],
  }),

  // ── kuwait_history ────────────────────────────────────────────────────────
  qs({
    id: 'media-img-kuwait-towers',
    category: 'kuwait_history', tier: 2, points: 200, type: 'image',
    text: 'ما اسم هذا المعلم الكويتي الظاهر في الصورة؟',
    mediaUrl: `${W}/7/71/Kuwait_Towers.jpg/800px-Kuwait_Towers.jpg`,
    mediaAlt: 'أبراج الكويت على شاطئ الخليج',
    options: ['أبراج الكويت', 'برج القرين', 'قصر السيف', 'بيت لوتان'],
    correctIndex: 0,
    teaser: 'معلم وطني يُطلّ على الخليج',
    explanation: 'أبراج الكويت أُنجزت 1979، تضم مطعماً دوّاراً على ارتفاع 82م.',
    funFact: 'البرج الرئيسي يحتوي على خزانَي مياه سعتهما 4500 و3000 م³.',
    tags: ['كويت', 'معالم'],
  }),
  qs({
    id: 'media-flag-kuwait',
    category: 'kuwait_history', tier: 1, points: 100, type: 'image',
    text: 'لأي دولة خليجية تنتمي هذه الراية؟',
    mediaUrl: `${W}/a/aa/Flag_of_Kuwait.svg/640px-Flag_of_Kuwait.svg.png`,
    mediaAlt: 'علم الكويت — أخضر أبيض أحمر مع مثلث أسود',
    options: ['الكويت', 'الأردن', 'فلسطين', 'العراق'],
    correctIndex: 0,
    explanation: 'علم الكويت (أخضر، أبيض، أحمر) مع مثلث أسود — اعتُمد 1961.',
    funFact: 'المثلث الأسود فريد بين دول الخليج.',
    tags: ['كويت', 'أعلام'],
  }),
  qs({
    id: 'media-order-kuwait-rulers',
    category: 'kuwait_history', tier: 3, points: 300, type: 'ordering',
    text: 'رتّب أمراء الكويت من الأقدم إلى الأحدث',
    options: ['الشيخ صباح الأحمد', 'الشيخ جابر الأحمد', 'الشيخ عبدالله السالم', 'الشيخ سعد العبدالله'],
    correctIndex: 0,
    correctOrder: [2, 1, 3, 0],
    explanation: 'عبدالله السالم ← جابر الأحمد ← سعد العبدالله ← صباح الأحمد',
    tags: ['كويت', 'تاريخ', 'حكام'],
  }),

  // ── kuwait_dialect ────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-dialect-1',
    category: 'kuwait_dialect', tier: 1, points: 100, type: 'riddle',
    text: 'بالكويتي: "الكَيْف" تعني؟',
    options: ['المزاج الجيد / الراحة', 'نوع من التبغ', 'الحزن الشديد', 'الغضب'],
    correctIndex: 0,
    explanation: '"الكيف" في اللهجة الكويتية تعني المتعة والراحة والمزاج الجيد.',
    tags: ['لهجة', 'كويت'],
  }),
  qs({
    id: 'media-riddle-dialect-2',
    category: 'kuwait_dialect', tier: 2, points: 200, type: 'riddle',
    text: 'بالكويتي: "يَفْهَق" تعني؟',
    options: ['يكذب / يبالغ', 'يصرخ', 'يضحك', 'يرقص'],
    correctIndex: 0,
    explanation: '"يفهق" في اللهجة الكويتية تعني يبالغ ويكذب.',
    tags: ['لهجة', 'كويت'],
  }),

  // ── gcc_football ──────────────────────────────────────────────────────────
  qs({
    id: 'media-order-gcc-cups',
    category: 'gcc_football', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب من الأكثر فوزاً بدوري أبطال آسيا إلى الأقل',
    options: ['الهلال السعودي', 'النصر السعودي', 'يوكوهاما ماريناس', 'بوهانغ ستيلرز'],
    correctIndex: 0,
    correctOrder: [0, 3, 2, 1],
    explanation: 'الهلال 4 ألقاب > بوهانغ 3 > يوكوهاما 3 > النصر 1',
    tags: ['كأس آسيا', 'كرة قدم'],
  }),

  // ── diwaniya ──────────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-diwaniya',
    category: 'diwaniya', tier: 1, points: 100, type: 'riddle',
    text: 'مجلس خاص في الكويت يُعقد أسبوعياً للتواصل والنقاش، أدرجته اليونسكو تراثاً إنسانياً 2019. ما اسمه؟',
    options: ['الديوانية', 'المجلس البلدي', 'الدرّاسة', 'الملتقى'],
    correctIndex: 0,
    explanation: 'الديوانية — مجلس اجتماعي كويتي تقليدي يُقام في المنازل.',
    funFact: 'الديوانية تُصنَّف من أعرق أشكال التواصل الاجتماعي في الخليج.',
    tags: ['كويت', 'تراث'],
  }),

  // ── kuwait_food ───────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-machboos',
    category: 'kuwait_food', tier: 1, points: 100, type: 'riddle',
    text: 'أنا الطبق الكويتي الوطني، أُحضَّر بالأرز والسمك أو اللحم والبهارات. ما اسمي؟',
    options: ['المجبوس', 'الهريس', 'الباجة', 'الغزي'],
    correctIndex: 0,
    explanation: 'المجبوس (المچبوس) — رمز المطبخ الكويتي والخليجي.',
    funFact: 'الزعفران والبزار من أبرز بهارات المجبوس.',
    tags: ['كويت', 'طعام'],
  }),

  // ── kuwait_celebs ─────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-celebs',
    category: 'kuwait_celebs', tier: 1, points: 100, type: 'riddle',
    text: 'فنان كويتي لُقّب بـ"ناصر المسرح الكويتي"، توفي 2017. من هو؟',
    options: ['عبدالحسين عبدالرضا', 'طارق العلي', 'داوود حسين', 'محمد المنصور'],
    correctIndex: 0,
    explanation: 'عبدالحسين عبدالرضا (1939-2017) — رائد المسرح الكويتي الكوميدي.',
    tags: ['فن', 'كويت'],
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // ISLAMIC CATEGORIES
  // ══════════════════════════════════════════════════════════════════════════

  // ── quran_tafsir ──────────────────────────────────────────────────────────
  qs({
    id: 'media-order-surahs-length',
    category: 'quran_tafsir', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب السور التالية من الأطول إلى الأقصر (عدد الآيات)',
    options: ['آل عمران', 'البقرة', 'الأنعام', 'النساء'],
    correctIndex: 0,
    correctOrder: [1, 0, 3, 2],
    explanation: 'البقرة 286 ← آل عمران 200 ← النساء 176 ← الأنعام 165',
    tags: ['قرآن', 'سور'],
  }),

  // ── hadith ────────────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-hadith',
    category: 'hadith', tier: 1, points: 100, type: 'riddle',
    text: 'قال النبي ﷺ: "إنما الأعمال بـ..." — أكمل الحديث',
    options: ['النيات', 'الطيبات', 'الثمرات', 'البركات'],
    correctIndex: 0,
    explanation: '"إنما الأعمال بالنيات" — متفق عليه، أول حديث في صحيح البخاري.',
    funFact: 'هذا الحديث يُعدّ من أجمع الأحاديث النبوية وأهمها.',
    tags: ['حديث', 'إسلام'],
  }),

  // ── islamic_history ───────────────────────────────────────────────────────
  qs({
    id: 'media-order-islamic-events',
    category: 'islamic_history', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب الدول الإسلامية الكبرى من الأقدم تأسيساً إلى الأحدث',
    options: ['الدولة العثمانية', 'الخلافة العباسية', 'الدولة الأموية', 'الخلافة الراشدة'],
    correctIndex: 0,
    correctOrder: [3, 2, 1, 0],
    explanation: 'الراشدة 632 ← الأموية 661 ← العباسية 750 ← العثمانية 1299',
    tags: ['تاريخ إسلامي'],
  }),
  qs({
    id: 'media-img-hagia-sophia',
    category: 'islamic_history', tier: 2, points: 200, type: 'guess',
    text: 'ما اسم هذا المبنى التاريخي الشهير في إسطنبول؟',
    mediaUrl: `${W}/2/22/Hagia_Sophia_Istanbul_2020-1_edit.jpg/640px-Hagia_Sophia_Istanbul_2020-1_edit.jpg`,
    mediaAlt: 'آيا صوفيا في إسطنبول',
    options: ['آيا صوفيا', 'المسجد الأزرق', 'الباب العالي', 'قصر طوب قابي'],
    correctIndex: 0,
    explanation: 'آيا صوفيا — كنيسة بيزنطية 537م، تحوّلت لمسجد 1453م.',
    funFact: 'في 2020 أُعيدت آيا صوفيا مسجداً بعد أن كانت متحفاً.',
    tags: ['تاريخ', 'إسطنبول'],
  }),

  // ── prophets ──────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-prophets',
    category: 'prophets', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب الأنبياء من الأقدم إلى الأحدث زمنياً',
    options: ['موسى ﷺ', 'إبراهيم ﷺ', 'محمد ﷺ', 'عيسى ﷺ'],
    correctIndex: 0,
    correctOrder: [1, 0, 3, 2],
    explanation: 'إبراهيم ← موسى ← عيسى ← محمد ﷺ',
    funFact: 'الأنبياء الأربعة من أولي العزم الخمسة.',
    tags: ['أنبياء', 'إسلام'],
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // ARAB & WORLD CATEGORIES
  // ══════════════════════════════════════════════════════════════════════════

  // ── arab_world ────────────────────────────────────────────────────────────
  qs({
    id: 'media-flag-egypt',
    category: 'arab_world', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة عربية هذا؟',
    mediaUrl: `${W}/f/fe/Flag_of_Egypt.svg/640px-Flag_of_Egypt.svg.png`,
    mediaAlt: 'علم مصر',
    options: ['مصر', 'سوريا', 'اليمن', 'العراق'],
    correctIndex: 0,
    explanation: 'علم مصر — ثلاثة أشرطة (أحمر، أبيض، أسود) مع نسر صلاح الدين.',
    tags: ['مصر', 'أعلام'],
  }),
  qs({
    id: 'media-img-petra',
    category: 'arab_world', tier: 2, points: 200, type: 'guess',
    text: 'في أي دولة عربية تقع مدينة البتراء الأثرية الشهيرة؟',
    mediaUrl: `${W}/d/d2/The_monastery_al-Deir_Petra.jpg/640px-The_monastery_al-Deir_Petra.jpg`,
    mediaAlt: 'دير البتراء في الأردن',
    options: ['الأردن', 'مصر', 'السعودية', 'اليمن'],
    correctIndex: 0,
    explanation: 'البتراء في الأردن — مدينة النبط المنحوتة في الصخر (~300 ق.م).',
    funFact: 'البتراء من أجمل عجائب العالم السبع الجديدة.',
    tags: ['الأردن', 'آثار'],
  }),

  // ── world_history ─────────────────────────────────────────────────────────
  qs({
    id: 'media-img-great-wall',
    category: 'world_history', tier: 1, points: 100, type: 'guess',
    text: 'في أي دولة يقع هذا السور الشهير؟',
    mediaUrl: `${W}/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/640px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg`,
    mediaAlt: 'سور الصين العظيم',
    options: ['الصين', 'اليابان', 'كوريا الجنوبية', 'منغوليا'],
    correctIndex: 0,
    explanation: 'سور الصين العظيم — بُني على مدى قرون لحماية الدولة من الغزو.',
    funFact: 'إجمالي طول السور مع الفروع يتجاوز 21,000 كيلومتر.',
    tags: ['الصين', 'معالم', 'تاريخ'],
  }),
  qs({
    id: 'media-order-world-events',
    category: 'world_history', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب هذه الأحداث العالمية من الأقدم إلى الأحدث',
    options: ['الحرب العالمية الثانية', 'الثورة الفرنسية', 'الحرب الباردة', 'سقوط روما'],
    correctIndex: 0,
    correctOrder: [3, 1, 0, 2],
    explanation: 'سقوط روما 476 ← الثورة الفرنسية 1789 ← ح.ع. الثانية 1945 ← الحرب الباردة 1947-91',
    tags: ['تاريخ عالمي'],
  }),

  // ── politics ──────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-un-founders',
    category: 'politics', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب هذه المنظمات الدولية من حيث تأسيسها (الأقدم أولاً)',
    options: ['منظمة التعاون الإسلامي', 'الأمم المتحدة', 'جامعة الدول العربية', 'مجلس التعاون الخليجي'],
    correctIndex: 0,
    correctOrder: [2, 1, 0, 3],
    explanation: 'جامعة الدول العربية 1945 ← الأمم المتحدة 1945 ← منظمة التعاون الإسلامي 1969 ← مجلس التعاون 1981',
    tags: ['سياسة', 'منظمات'],
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // ECONOMY & BUSINESS
  // ══════════════════════════════════════════════════════════════════════════

  // ── economics ─────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-gdp',
    category: 'economics', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب الدول من الأكبر ناتجاً محلياً إلى الأصغر (2023)',
    options: ['اليابان', 'الصين', 'أمريكا', 'ألمانيا'],
    correctIndex: 0,
    correctOrder: [2, 1, 3, 0],
    explanation: 'أمريكا $27T > الصين $18T > ألمانيا $4.4T > اليابان $4.2T',
    tags: ['اقتصاد', 'ناتج محلي'],
  }),

  // ── finance ───────────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-finance',
    category: 'finance', tier: 2, points: 200, type: 'riddle',
    text: 'كلما أنفقتني تحتاجني أكثر، لكن كلما خزّنتني من غير حكمة ذُبتُ. ما أنا؟',
    options: ['المال', 'الوقت', 'الطاقة', 'الذكاء'],
    correctIndex: 0,
    explanation: 'المال — يُولّد حاجة مستمرة، ويفقد قيمته مع التضخم إن لم يُستثمر.',
    tags: ['مال', 'اقتصاد'],
  }),

  // ── entrepreneurship ──────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-entrepreneur',
    category: 'entrepreneurship', tier: 2, points: 200, type: 'riddle',
    text: 'أنا مؤسس أمازون الذي كان أغنى رجل في العالم. من أنا؟',
    options: ['جيف بيزوس', 'إيلون ماسك', 'بيل غيتس', 'مارك زوكربيرغ'],
    correctIndex: 0,
    explanation: 'جيف بيزوس — أسّس أمازون 1994 في كراج منزله.',
    funFact: 'أمازون بدأت كمتجر لبيع الكتب الإلكترونية عبر الإنترنت.',
    tags: ['ريادة أعمال', 'تقنية'],
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // TECHNOLOGY
  // ══════════════════════════════════════════════════════════════════════════

  // ── technology ────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-tech-inventions',
    category: 'technology', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب الاختراعات التقنية من الأقدم إلى الأحدث',
    options: ['الطائرة', 'المطبعة', 'الهاتف', 'الإنترنت'],
    correctIndex: 0,
    correctOrder: [1, 2, 0, 3],
    explanation: 'المطبعة 1440 ← الهاتف 1876 ← الطائرة 1903 ← الإنترنت 1969',
    tags: ['تقنية', 'اختراعات'],
  }),
  qs({
    id: 'media-riddle-tech',
    category: 'technology', tier: 1, points: 100, type: 'riddle',
    text: 'لا عيون لكنه يرى، لا أذنان لكنه يسمع، لا دماغ لكنه يفكر. ما هو؟',
    options: ['الحاسوب', 'الكاميرا', 'الساعة الذكية', 'الروبوت'],
    correctIndex: 0,
    explanation: 'الحاسوب — يعالج المعلومات ويُنجز مهام معقدة.',
    tags: ['تقنية', 'لغز'],
  }),

  // ── ai_tech ───────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-ai-milestones',
    category: 'ai_tech', tier: 3, points: 300, type: 'ordering',
    text: 'رتّب إنجازات الذكاء الاصطناعي من الأقدم إلى الأحدث',
    options: ['ChatGPT', 'ديب بلو (شطرنج)', 'ألفا غو', 'GPT-2'],
    correctIndex: 0,
    correctOrder: [1, 2, 3, 0],
    explanation: 'ديب بلو 1997 ← ألفا غو 2016 ← GPT-2 2019 ← ChatGPT 2022',
    tags: ['ذكاء اصطناعي'],
  }),

  // ── cybersecurity ─────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-cyber',
    category: 'cybersecurity', tier: 2, points: 200, type: 'riddle',
    text: 'أنا حارس بوابة لا يُرى، كلمة سرية تحمي دخولك. ما أنا؟',
    options: ['كلمة المرور', 'جدار الحماية', 'المضاد للفيروسات', 'التشفير'],
    correctIndex: 0,
    explanation: 'كلمة المرور — خط الدفاع الأول في الأمن الرقمي.',
    tags: ['أمن', 'تقنية'],
  }),

  // ── programming ───────────────────────────────────────────────────────────
  qs({
    id: 'media-order-languages',
    category: 'programming', tier: 3, points: 300, type: 'ordering',
    text: 'رتّب لغات البرمجة من الأقدم إلى الأحدث',
    options: ['بايثون', 'جافا', 'C++', 'C'],
    correctIndex: 0,
    correctOrder: [3, 2, 0, 1],
    explanation: 'C 1972 ← C++ 1983 ← Python 1991 ← Java 1995',
    tags: ['برمجة', 'لغات'],
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // HEALTH & MIND
  // ══════════════════════════════════════════════════════════════════════════

  // ── medicine ──────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-organs-weight',
    category: 'medicine', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب الأعضاء من الأثقل إلى الأخف',
    options: ['القلب', 'الكبد', 'الطحال', 'الدماغ'],
    correctIndex: 0,
    correctOrder: [1, 3, 0, 2],
    explanation: 'الكبد ~1.5kg > الدماغ ~1.4kg > القلب ~300g > الطحال ~170g',
    tags: ['طب', 'جسم الإنسان'],
  }),

  // ── human_body ────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-bones',
    category: 'human_body', tier: 1, points: 100, type: 'ordering',
    text: 'رتّب هذه العظام من الأطول إلى الأقصر',
    options: ['عظم الذراع (الكعبرة)', 'الفخذ', 'عظم الساق', 'الترقوة'],
    correctIndex: 0,
    correctOrder: [1, 2, 0, 3],
    explanation: 'الفخذ أطول عظمة في الجسم > الساق > الذراع > الترقوة',
    tags: ['علم التشريح', 'عظام'],
  }),

  // ── psychology ────────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-psychology',
    category: 'psychology', tier: 2, points: 200, type: 'riddle',
    text: 'كلما أحاول إخفاءه أصبح أظهر، وكلما كبتّه كبر. ما هو؟',
    options: ['الشعور بالذنب', 'الجوع', 'التعب', 'الحزن'],
    correctIndex: 0,
    explanation: 'الشعور بالذنب — علم النفس يثبت أن الكبت يُضاعف الضغط الداخلي.',
    tags: ['علم نفس', 'لغز'],
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // NATURE & UNIVERSE
  // ══════════════════════════════════════════════════════════════════════════

  // ── space ─────────────────────────────────────────────────────────────────
  qs({
    id: 'media-img-earth',
    category: 'space', tier: 1, points: 100, type: 'image',
    text: 'ما اسم هذا الكوكب كما يبدو من الفضاء؟',
    mediaUrl: `${W}/9/97/The_Earth_seen_from_Apollo_17.jpg/640px-The_Earth_seen_from_Apollo_17.jpg`,
    mediaAlt: 'الأرض من رحلة أبولو 17',
    options: ['الأرض', 'المريخ', 'الزهرة', 'نبتون'],
    correctIndex: 0,
    explanation: 'الأرض كما التقطتها رحلة أبولو 17 عام 1972 — "رخامة الزرقاء".',
    funFact: 'هذه الصورة من أكثر الصور التقاطاً في التاريخ.',
    tags: ['فضاء', 'أرض'],
  }),
  qs({
    id: 'media-img-moon',
    category: 'space', tier: 1, points: 100, type: 'image',
    text: 'ما اسم هذا الجرم السماوي المُضيء في الليل؟',
    mediaUrl: `${W}/e/e1/FullMoon2010.jpg/640px-FullMoon2010.jpg`,
    mediaAlt: 'صورة البدر الكاملة',
    options: ['القمر', 'الشمس', 'المريخ', 'الزهرة'],
    correctIndex: 0,
    explanation: 'القمر — يدور حول الأرض كل 27.3 يوم.',
    funFact: 'نيل أرمسترونج أول إنسان مشى على القمر في يوليو 1969.',
    tags: ['فضاء', 'قمر'],
  }),
  qs({
    id: 'media-order-distance-sun',
    category: 'space', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب الكواكب من الأقرب للشمس إلى الأبعد',
    options: ['أورانوس', 'المريخ', 'المشتري', 'زحل'],
    correctIndex: 0,
    correctOrder: [1, 2, 3, 0],
    explanation: 'المريخ ← المشتري ← زحل ← أورانوس',
    tags: ['فضاء', 'كواكب'],
  }),

  // ── environment ───────────────────────────────────────────────────────────
  qs({
    id: 'media-order-oceans',
    category: 'environment', tier: 1, points: 100, type: 'ordering',
    text: 'رتّب المحيطات من الأكبر إلى الأصغر مساحةً',
    options: ['الأطلسي', 'الهندي', 'الهادئ', 'المتجمد الشمالي'],
    correctIndex: 0,
    correctOrder: [2, 0, 1, 3],
    explanation: 'الهادئ > الأطلسي > الهندي > المتجمد الشمالي',
    funFact: 'المحيط الهادئ وحده يغطي أكثر من ثلث سطح الأرض.',
    tags: ['جغرافيا', 'محيطات'],
  }),
  qs({
    id: 'media-riddle-environment',
    category: 'environment', tier: 2, points: 200, type: 'riddle',
    text: 'أنا رئة الأرض، أُعطي الأكسجين وأمتص الكربون. ما أنا؟',
    options: ['الغابات المطرية', 'الصحاري', 'المحيطات', 'الجبال'],
    correctIndex: 0,
    explanation: 'الغابات المطرية (خاصة الأمازون) — تُنتج 20% من أكسجين الأرض.',
    funFact: 'الأمازون تضم 10% من أنواع الكائنات الحية على الأرض.',
    tags: ['بيئة', 'غابات'],
  }),

  // ── animals ───────────────────────────────────────────────────────────────
  qs({
    id: 'media-img-camel',
    category: 'animals', tier: 1, points: 100, type: 'image',
    text: 'ما الحيوان الذي يُلقَّب بـ"سفينة الصحراء"؟',
    mediaUrl: `${W}/4/43/Camels_in_Jordan_wadi_rum.jpg/640px-Camels_in_Jordan_wadi_rum.jpg`,
    mediaAlt: 'إبل في وادي رم بالأردن',
    options: ['الجمل', 'الحمار الوحشي', 'الفيل', 'الحصان'],
    correctIndex: 0,
    explanation: 'الجمل يتحمل العطش والحرارة الشديدة، ولهذا سُمّي سفينة الصحراء.',
    funFact: 'الجمل يستطيع شرب 200 لتر من الماء دفعة واحدة.',
    tags: ['حيوانات', 'صحراء'],
  }),
  qs({
    id: 'media-img-falcon',
    category: 'animals', tier: 2, points: 200, type: 'image',
    text: 'ما اسم هذا الطائر رمز الصيد في الخليج؟',
    mediaUrl: `${W}/8/80/Falco_peregrinus_-_01.jpg/640px-Falco_peregrinus_-_01.jpg`,
    mediaAlt: 'صقر الشاهين',
    options: ['الصقر', 'النسر', 'الحدأة', 'البازي'],
    correctIndex: 0,
    explanation: 'الصقر — أسرع طائر على الأرض، يبلغ سرعته 389 كم/ساعة في الانقضاض.',
    funFact: 'الصقارة تراث خليجي وعالمي أدرجته اليونسكو منذ 2016.',
    tags: ['طيور', 'خليج', 'صيد'],
  }),
  qs({
    id: 'media-order-animals-speed',
    category: 'animals', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب الحيوانات من الأسرع إلى الأبطأ',
    options: ['الأسد', 'الفهد', 'النعامة', 'الحمار الوحشي'],
    correctIndex: 0,
    correctOrder: [1, 0, 3, 2],
    explanation: 'الفهد 112km/h > الأسد 80 > الحمار الوحشي 65 > النعامة 60',
    tags: ['حيوانات', 'سرعة'],
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // ARTS & CULTURE
  // ══════════════════════════════════════════════════════════════════════════

  // ── architecture ──────────────────────────────────────────────────────────
  qs({
    id: 'media-img-sydney-opera',
    category: 'architecture', tier: 1, points: 100, type: 'guess',
    text: 'في أي مدينة يقع هذا المبنى الفريد الشبيه بالأشرعة؟',
    mediaUrl: `${W}/a/a0/Sydney_Opera_House_-_Dec_2008.jpg/640px-Sydney_Opera_House_-_Dec_2008.jpg`,
    mediaAlt: 'دار أوبرا سيدني',
    options: ['سيدني', 'ملبورن', 'أوكلاند', 'سنغافورة'],
    correctIndex: 0,
    explanation: 'دار أوبرا سيدني — افتُتحت 1973، صمّمها يُورن أوتزون الدنماركي.',
    funFact: 'تضم 1000 غرفة وقاعات متعددة للأداء الموسيقي والمسرحي.',
    tags: ['أستراليا', 'معمار'],
  }),
  qs({
    id: 'media-img-alhambra',
    category: 'architecture', tier: 3, points: 300, type: 'guess',
    text: 'هذا القصر الأندلسي الشهير — في أي مدينة إسبانية يقع؟',
    mediaUrl: `${W}/9/92/Alhambra_evening_panorama_Mirador_San_Nicolas_sRGB-1.jpg/800px-Alhambra_evening_panorama_Mirador_San_Nicolas_sRGB-1.jpg`,
    mediaAlt: 'قصر الحمراء في غرناطة',
    options: ['غرناطة', 'إشبيلية', 'قرطبة', 'مدريد'],
    correctIndex: 0,
    explanation: 'قصر الحمراء في غرناطة — يُعدّ تحفة معمارية إسلامية في الأندلس.',
    funFact: 'الحمراء من أكثر المعالم السياحية زيارةً في إسبانيا (>2M سنوياً).',
    tags: ['أندلس', 'إسبانيا', 'معمار إسلامي'],
  }),
  qs({
    id: 'media-order-tallest',
    category: 'architecture', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب المباني من الأطول إلى الأقصر',
    options: ['برج خليفة', 'برج إيفل', 'برج الساعة بمكة', 'أمباير ستيت'],
    correctIndex: 0,
    correctOrder: [0, 2, 3, 1],
    explanation: 'برج خليفة 828m > ساعة مكة 601m > إمباير ستيت 443m > إيفل 330m',
    tags: ['معمار', 'أطول مبانٍ'],
  }),

  // ── literature ────────────────────────────────────────────────────────────
  qs({
    id: 'media-order-arab-authors',
    category: 'literature', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب هؤلاء الأدباء العرب من الأقدم ولادةً إلى الأحدث',
    options: ['نجيب محفوظ', 'جبران خليل جبران', 'طه حسين', 'أدونيس'],
    correctIndex: 0,
    correctOrder: [1, 2, 0, 3],
    explanation: 'جبران 1883 ← طه حسين 1889 ← نجيب محفوظ 1911 ← أدونيس 1930',
    tags: ['أدب عربي'],
  }),
  qs({
    id: 'media-riddle-book',
    category: 'literature', tier: 1, points: 100, type: 'riddle',
    text: 'أنا أتكلم بلا فم، وأحكي بلا صوت، وأعطي حكمةً بلا درس. ما أنا؟',
    options: ['الكتاب', 'الصورة', 'الموسيقى', 'الصمت'],
    correctIndex: 0,
    explanation: 'الكتاب — ينقل المعرفة والحكمة عبر الكلمة المكتوبة.',
    tags: ['كتب', 'قراءة'],
  }),

  // ── art_visual ────────────────────────────────────────────────────────────
  qs({
    id: 'media-img-mona-lisa',
    category: 'art_visual', tier: 1, points: 100, type: 'guess',
    text: 'من رسم هذه اللوحة الأشهر في العالم؟',
    mediaUrl: `${W}/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/400px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg`,
    mediaAlt: 'لوحة الموناليزا',
    options: ['ليوناردو دافنشي', 'مايكل أنجلو', 'رافاييل', 'فان غوخ'],
    correctIndex: 0,
    explanation: 'الموناليزا رسمها ليوناردو دافنشي ~1503-1519، محفوظة في اللوفر.',
    funFact: 'الموناليزا محمية بزجاج مقاوم للرصاص وتُزار من 9 ملايين شخص سنوياً.',
    tags: ['فن', 'لوحات'],
  }),
  qs({
    id: 'media-img-starry-night',
    category: 'art_visual', tier: 2, points: 200, type: 'guess',
    text: 'من رسم هذه اللوحة الانطباعية الشهيرة "ليلة النجوم"؟',
    mediaUrl: `${W}/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/640px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg`,
    mediaAlt: 'لوحة ليلة النجوم لفان غوخ',
    options: ['فان غوخ', 'بيكاسو', 'مونيه', 'رينوار'],
    correctIndex: 0,
    explanation: 'رسمها فان غوخ 1889 من نافذة مستشفى في سان ريمي بفرنسا.',
    funFact: 'فان غوخ لم يبع سوى لوحة واحدة طوال حياته.',
    tags: ['فن', 'لوحات', 'انطباعية'],
  }),

  // ── arabic_language ───────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-arabic',
    category: 'arabic_language', tier: 1, points: 100, type: 'riddle',
    text: 'أنا حرف عربي يُكتب بثلاث أشكال ولا يتصل بما بعده. ما أنا؟',
    options: ['الألف', 'الباء', 'النون', 'الفاء'],
    correctIndex: 0,
    explanation: 'الألف لا تتصل بالحرف التالي في أغلب أشكالها.',
    funFact: 'الألف هو الحرف الأول في الأبجدية العربية وأكثرها ورداً.',
    tags: ['لغة عربية'],
  }),
  qs({
    id: 'media-order-arabic-letters',
    category: 'arabic_language', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب هذه الحروف بترتيب الأبجدية العربية (أبجد هوّز)',
    options: ['الحاء', 'الهاء', 'الواو', 'الزاي'],
    correctIndex: 0,
    correctOrder: [0, 3, 2, 1],
    explanation: 'في أبجد هوّز: الهمزة أ، ب، ج، د، هـ، و، ز، ح...',
    tags: ['لغة عربية', 'أبجدية'],
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // ENTERTAINMENT
  // ══════════════════════════════════════════════════════════════════════════

  // ── movies_intl ───────────────────────────────────────────────────────────
  qs({
    id: 'media-order-oscars',
    category: 'movies_intl', tier: 3, points: 300, type: 'ordering',
    text: 'رتّب هذه الأفلام من الأقدم إلى الأحدث',
    options: ['أفاتار (2009)', 'تيتانيك (1997)', 'شوشانك (1994)', 'هاري بوتر (2001)'],
    correctIndex: 0,
    correctOrder: [2, 1, 3, 0],
    explanation: 'شوشانك 1994 ← تيتانيك 1997 ← هاري بوتر 2001 ← أفاتار 2009',
    tags: ['سينما', 'أفلام'],
  }),
  qs({
    id: 'media-riddle-movies',
    category: 'movies_intl', tier: 2, points: 200, type: 'riddle',
    text: 'أنا مدينة السينما، وفيّ تُصنع النجوم. ما اسمي؟',
    options: ['هوليوود', 'بوليوود', 'بارامونت', 'كانّ'],
    correctIndex: 0,
    explanation: 'هوليوود في لوس أنجلوس — عاصمة صناعة السينما الأمريكية.',
    tags: ['سينما'],
  }),

  // ── tv_shows_intl ─────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-tvshows',
    category: 'tv_shows_intl', tier: 2, points: 200, type: 'riddle',
    text: 'مسلسل أمريكي شهير عن التفاعلات الكيميائية، بطله استاذ كيمياء يُدعى والتر وايت. ما اسمه؟',
    options: ['Breaking Bad', 'Better Call Saul', 'Ozark', 'Dexter'],
    correctIndex: 0,
    explanation: 'Breaking Bad — من أشهر المسلسلات الأمريكية الدرامية.',
    tags: ['مسلسلات', 'أمريكا'],
  }),

  // ── video_games ───────────────────────────────────────────────────────────
  qs({
    id: 'media-order-games',
    category: 'video_games', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب هذه سلاسل ألعاب الفيديو من الأقدم إصداراً',
    options: ['GTA', 'Minecraft', 'Mario', 'Fortnite'],
    correctIndex: 0,
    correctOrder: [2, 0, 1, 3],
    explanation: 'Mario 1985 ← GTA 1997 ← Minecraft 2011 ← Fortnite 2017',
    tags: ['ألعاب', 'فيديو'],
  }),

  // ── celebrities_intl ──────────────────────────────────────────────────────
  qs({
    id: 'media-img-einstein',
    category: 'celebrities_intl', tier: 1, points: 100, type: 'guess',
    text: 'من هذا العالم الفيزيائي الشهير صاحب نظرية النسبية؟',
    mediaUrl: `${W}/d/d3/Albert_Einstein_Head.jpg/400px-Albert_Einstein_Head.jpg`,
    mediaAlt: 'صورة ألبرت أينشتاين',
    options: ['ألبرت أينشتاين', 'إسحاق نيوتن', 'ستيفن هوكينغ', 'نيلز بور'],
    correctIndex: 0,
    explanation: 'أينشتاين — ألمانيّ الأصل، حاز نوبل الفيزياء 1921.',
    funFact: 'أينشتاين رفض رئاسة إسرائيل عام 1952.',
    tags: ['علماء', 'مشاهير'],
  }),
  qs({
    id: 'media-order-scientists',
    category: 'celebrities_intl', tier: 2, points: 200, type: 'ordering',
    text: 'رتّب العلماء من الأقدم ولادةً إلى الأحدث',
    options: ['ستيفن هوكينغ', 'نيوتن', 'أينشتاين', 'ماري كوري'],
    correctIndex: 0,
    correctOrder: [1, 3, 2, 0],
    explanation: 'نيوتن 1643 ← ماري كوري 1867 ← أينشتاين 1879 ← هوكينغ 1942',
    tags: ['علماء', 'تاريخ العلوم'],
  }),

  // ── flags_maps ────────────────────────────────────────────────────────────
  qs({
    id: 'media-flag-uae',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة هذا؟',
    mediaUrl: `${W}/c/cb/Flag_of_the_United_Arab_Emirates.svg/640px-Flag_of_the_United_Arab_Emirates.svg.png`,
    mediaAlt: 'علم الإمارات العربية المتحدة',
    options: ['الإمارات', 'اليمن', 'ليبيا', 'مصر'],
    correctIndex: 0,
    explanation: 'علم الإمارات — أخضر، أبيض، أسود مع شريط أحمر عمودي.',
    tags: ['إمارات', 'أعلام'],
  }),
  qs({
    id: 'media-flag-bahrain',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة خليجية هذا؟',
    mediaUrl: `${W}/2/2c/Flag_of_Bahrain.svg/640px-Flag_of_Bahrain.svg.png`,
    mediaAlt: 'علم البحرين',
    options: ['البحرين', 'قطر', 'الكويت', 'عُمان'],
    correctIndex: 0,
    explanation: 'علم البحرين — أبيض وأحمر مع خمسة رؤوس مسنّنة.',
    funFact: 'الرؤوس الخمسة تمثّل أركان الإسلام.',
    tags: ['البحرين', 'أعلام'],
  }),
  qs({
    id: 'media-flag-oman',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة يظهر هنا؟',
    mediaUrl: `${W}/d/dd/Flag_of_Oman.svg/640px-Flag_of_Oman.svg.png`,
    mediaAlt: 'علم عُمان',
    options: ['عُمان', 'الأردن', 'المغرب', 'تونس'],
    correctIndex: 0,
    explanation: 'علم عُمان — ثلاثة ألوان مع شعار السيفين والخنجر.',
    tags: ['عمان', 'أعلام'],
  }),
  qs({
    id: 'media-flag-jordan',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة عربية هذا؟',
    mediaUrl: `${W}/c/c0/Flag_of_Jordan.svg/640px-Flag_of_Jordan.svg.png`,
    mediaAlt: 'علم الأردن',
    options: ['الأردن', 'مصر', 'السودان', 'فلسطين'],
    correctIndex: 0,
    explanation: 'علم الأردن — أسود أبيض أخضر مع مثلث أحمر ونجمة بيضاء.',
    tags: ['الأردن', 'أعلام'],
  }),
  qs({
    id: 'media-flag-morocco',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة مغاربية هذا؟',
    mediaUrl: `${W}/2/2c/Flag_of_Morocco.svg/640px-Flag_of_Morocco.svg.png`,
    mediaAlt: 'علم المغرب',
    options: ['المغرب', 'الجزائر', 'تونس', 'موريتانيا'],
    correctIndex: 0,
    explanation: 'علم المغرب — أحمر مع نجمة خضراء خماسية.',
    tags: ['المغرب', 'أعلام'],
  }),
  qs({
    id: 'media-flag-turkey',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة هذا؟',
    mediaUrl: `${W}/b/b4/Flag_of_Turkey.svg/640px-Flag_of_Turkey.svg.png`,
    mediaAlt: 'علم تركيا',
    options: ['تركيا', 'تونس', 'باكستان', 'أذربيجان'],
    correctIndex: 0,
    explanation: 'علم تركيا — أحمر مع هلال ونجمة بيضاء.',
    tags: ['تركيا', 'أعلام'],
  }),
  qs({
    id: 'media-flag-france',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة أوروبية هذا؟',
    mediaUrl: `${W}/c/c3/Flag_of_France.svg/640px-Flag_of_France.svg.png`,
    mediaAlt: 'علم فرنسا',
    options: ['فرنسا', 'هولندا', 'بلجيكا', 'إيطاليا'],
    correctIndex: 0,
    explanation: 'علم فرنسا — ثلاثي الألوان (أزرق، أبيض، أحمر) منذ الثورة الفرنسية.',
    tags: ['فرنسا', 'أعلام'],
  }),
  qs({
    id: 'media-flag-germany',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة أوروبية هذا؟',
    mediaUrl: `${W}/b/ba/Flag_of_Germany.svg/640px-Flag_of_Germany.svg.png`,
    mediaAlt: 'علم ألمانيا',
    options: ['ألمانيا', 'بلجيكا', 'النمسا', 'هولندا'],
    correctIndex: 0,
    explanation: 'علم ألمانيا — أسود وأحمر وذهبي، ألوان الثورة الألمانية 1848.',
    tags: ['ألمانيا', 'أعلام'],
  }),
  qs({
    id: 'media-flag-uk',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة هذا؟',
    mediaUrl: `${W}/a/ae/Flag_of_the_United_Kingdom.svg/640px-Flag_of_the_United_Kingdom.svg.png`,
    mediaAlt: 'علم المملكة المتحدة (يونيون جاك)',
    options: ['المملكة المتحدة', 'أستراليا', 'نيوزيلندا', 'كندا'],
    correctIndex: 0,
    explanation: 'يونيون جاك — يجمع صلبان إنجلترا وأسكتلندا وأيرلندا الشمالية.',
    tags: ['بريطانيا', 'أعلام'],
  }),
  qs({
    id: 'media-flag-japan',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة آسيوية هذا؟',
    mediaUrl: `${W}/9/9e/Flag_of_Japan.svg/640px-Flag_of_Japan.svg.png`,
    mediaAlt: 'علم اليابان',
    options: ['اليابان', 'كوريا الجنوبية', 'الصين', 'تايوان'],
    correctIndex: 0,
    explanation: 'علم اليابان — أبيض مع دائرة حمراء تمثل الشمس المشرقة.',
    tags: ['اليابان', 'أعلام'],
  }),
  qs({
    id: 'media-flag-brazil',
    category: 'flags_maps', tier: 2, points: 200, type: 'image',
    text: 'علم أي دولة أمريكية لاتينية هذا؟',
    mediaUrl: `${W}/0/05/Flag_of_Brazil.svg/640px-Flag_of_Brazil.svg.png`,
    mediaAlt: 'علم البرازيل',
    options: ['البرازيل', 'الأرجنتين', 'كولومبيا', 'البيرو'],
    correctIndex: 0,
    explanation: 'علم البرازيل — أخضر بمعيّن أصفر وكرة زرقاء وشريط "Ordem e Progresso".',
    tags: ['البرازيل', 'أعلام'],
  }),
  qs({
    id: 'media-flag-usa',
    category: 'flags_maps', tier: 1, points: 100, type: 'image',
    text: 'علم أي دولة هذا؟',
    mediaUrl: `${W}/a/a4/Flag_of_the_United_States.svg/640px-Flag_of_the_United_States.svg.png`,
    mediaAlt: 'علم الولايات المتحدة',
    options: ['الولايات المتحدة', 'كوبا', 'بورتوريكو', 'ليبيريا'],
    correctIndex: 0,
    explanation: 'علم أمريكا — 50 نجمة (للولايات) و13 شريطاً (للمستعمرات الأصلية).',
    tags: ['أمريكا', 'أعلام'],
  }),
  qs({
    id: 'media-map-turkey',
    category: 'flags_maps', tier: 2, points: 200, type: 'map',
    text: 'الدولة المُلوَّنة على الخريطة بين قارتين — ما اسمها؟',
    mediaUrl: `${W}/7/7b/Turkey_in_its_region.svg/640px-Turkey_in_its_region.svg.png`,
    mediaAlt: 'خريطة المنطقة مع تمييز تركيا',
    options: ['تركيا', 'اليونان', 'إيران', 'بلغاريا'],
    correctIndex: 0,
    explanation: 'تركيا — تمتد بين أوروبا (الجزء الأوروبي) وآسيا.',
    tags: ['خرائط', 'تركيا'],
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // CHALLENGE MODES
  // ══════════════════════════════════════════════════════════════════════════

  // ── math_logic ────────────────────────────────────────────────────────────
  qs({
    id: 'media-math-logic-1',
    category: 'math_logic', tier: 1, points: 100, type: 'math',
    text: '7² − √64 + 15 ÷ 3 = ?',
    options: ['46', '44', '48', '50'],
    correctIndex: 0,
    explanation: '7²=49، √64=8، 15÷3=5 → 49−8+5=46',
    tags: ['رياضيات'],
  }),
  qs({
    id: 'media-math-logic-2',
    category: 'math_logic', tier: 2, points: 200, type: 'math',
    text: 'إذا كان x² = 144، فما قيمة x + 5؟',
    options: ['17', '16', '14', '18'],
    correctIndex: 0,
    explanation: 'x² = 144 → x = 12 → 12 + 5 = 17',
    tags: ['رياضيات', 'جبر'],
  }),
  qs({
    id: 'media-order-math-sequence',
    category: 'math_logic', tier: 3, points: 300, type: 'ordering',
    text: 'رتّب هذه القيم من الأصغر إلى الأكبر',
    options: ['√9', '∛8', '2²', '10÷3'],
    correctIndex: 0,
    correctOrder: [1, 0, 3, 2],
    explanation: '∛8=2 < √9=3 < 10÷3≈3.33 < 2²=4',
    tags: ['رياضيات', 'جذور'],
  }),

  // ── riddles_ar ────────────────────────────────────────────────────────────
  qs({
    id: 'media-riddle-ar-1',
    category: 'riddles_ar', tier: 1, points: 100, type: 'riddle',
    text: 'أُمشط كل يوم لكنني لستُ شعراً، وأُصطاد فيّ لكنني لستُ بحراً. ما أنا؟',
    options: ['الشبكة', 'المنخل', 'السلة', 'الصنّارة'],
    correctIndex: 0,
    explanation: 'الشبكة — تُمشط بمعنى تُمرَّر عبرها، وتُصطاد بها الأسماك.',
    tags: ['لغز', 'عربي'],
  }),
  qs({
    id: 'media-riddle-ar-2',
    category: 'riddles_ar', tier: 2, points: 200, type: 'riddle',
    text: 'بيتي لا باب له ولا نافذة، وسكّاني يخرجون منه ولا يعودون. ما أنا؟',
    options: ['البيضة', 'الكوكون', 'البراعم', 'الجراب'],
    correctIndex: 0,
    explanation: 'البيضة — الفرخ يخرج ولا يعود إليها.',
    tags: ['لغز', 'عربي'],
  }),
  qs({
    id: 'media-riddle-ar-3',
    category: 'riddles_ar', tier: 2, points: 200, type: 'riddle',
    text: 'يمشي بلا أرجل، ويتكلم بلا لسان، ويرسل بلا يد. ما هو؟',
    options: ['الرسالة', 'الريح', 'الصدى', 'الخبر'],
    correctIndex: 0,
    explanation: 'الرسالة — تنتقل دون أن تمشي، وتحمل كلاماً دون لسان.',
    tags: ['لغز', 'عربي'],
  }),
  qs({
    id: 'media-riddle-ar-4',
    category: 'riddles_ar', tier: 3, points: 300, type: 'riddle',
    text: 'أنا لا أُولد ولا أموت، لكنني أعيش في عقلك وتحتاجني للنجاح. ما أنا؟',
    options: ['الفكرة', 'الحلم', 'الذاكرة', 'الشجاعة'],
    correctIndex: 0,
    explanation: 'الفكرة — لا تولد ولا تموت، تعيش وتتطور في العقل.',
    tags: ['لغز', 'فلسفة'],
  }),

];
