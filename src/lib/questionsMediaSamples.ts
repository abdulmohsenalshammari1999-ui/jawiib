/**
 * Media question bank — image, audio, map, guess, identify, ordering, math, riddle.
 * All image/audio URLs point to Wikipedia Commons (CC-licensed, globally cached CDN).
 * To add your own assets: host on Cloudinary / S3 / /public/media/ and use those URLs.
 *
 * IMPORTANT: all questions use core categories (culture, gulf, sport, science, history,
 * music, geo, kuwait_history) so they appear in every quick game.
 */

import type { Question } from './types';

function qs(q: Partial<Question> & Pick<Question, 'id' | 'category' | 'tier' | 'points' | 'text' | 'options' | 'correctIndex'>): Question {
  return q as Question;
}

export const MEDIA_SAMPLE_QUESTIONS: Question[] = [

  // ── IMAGE / GUESS — landmarks ─────────────────────────────────────────────

  qs({
    id: 'media-img-kuwait-towers',
    category: 'kuwait_history',   // core category — always in rotation
    tier: 2,
    points: 200,
    type: 'image',
    text: 'ما اسم هذا المعلم الكويتي الظاهر في الصورة؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kuwait_Towers.jpg/800px-Kuwait_Towers.jpg',
    mediaAlt: 'أبراج الكويت على شاطئ الخليج',
    options: ['أبراج الكويت', 'برج القرين', 'قصر السيف', 'بيت لوتان'],
    correctIndex: 0,
    teaser: 'معلم وطني يُطلّ على الخليج',
    explanation: 'أبراج الكويت أُنجزت 1979، صمّمها مكتب VBB السويدي، تضم مطعماً دوّاراً على ارتفاع 82م.',
    funFact: 'البرج الرئيسي يحتوي على خزانَي مياه سعتهما 4500 و3000 م³.',
    tags: ['كويت', 'معالم', 'معمار'],
  }),

  qs({
    id: 'media-img-burj-khalifa',
    category: 'gulf',             // core category
    tier: 2,
    points: 200,
    type: 'guess',
    text: 'في أي مدينة يقع هذا الناطحة سحاب الأطول في العالم؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Burj_Khalifa.jpg/500px-Burj_Khalifa.jpg',
    mediaAlt: 'برج خليفة في دبي',
    options: ['دبي', 'أبوظبي', 'الدوحة', 'الرياض'],
    correctIndex: 0,
    teaser: 'الأطول في العالم — أين يقع؟',
    explanation: 'برج خليفة في دبي، ارتفاعه 828م، أطول مبنى في العالم منذ 2010.',
    funFact: 'يضم 163 طابقاً وبُني خلال 6 سنوات باستخدام أكثر من 330,000 م³ من الخرسانة.',
    tags: ['إمارات', 'عمارة', 'خليج'],
  }),

  qs({
    id: 'media-img-empire-state',
    category: 'culture',          // core category
    tier: 1,
    points: 100,
    type: 'guess',
    text: 'ما اسم هذا المبنى الشهير الملتقط من الجو؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg',
    mediaAlt: 'مبنى إمباير ستيت من الجو',
    options: ['مبنى إمباير ستيت', 'مبنى كرايسلر', 'مركز تجارة عالمي', 'برج إيفل'],
    correctIndex: 0,
    teaser: 'واحد من أشهر مباني القرن العشرين',
    explanation: 'إمباير ستيت في مانهاتن، ارتفاعه 443م، كان الأطول في العالم 1931–1970.',
    funFact: 'يستقطب أكثر من 3.5 مليون زائر سنوياً للمراصد في الطابقَين 86 و102.',
    tags: ['جغرافيا', 'عالم', 'مباني'],
  }),

  // ── IMAGE — flags ─────────────────────────────────────────────────────────

  qs({
    id: 'media-flag-kuwait',
    category: 'kuwait_history',   // core
    tier: 1,
    points: 100,
    type: 'image',
    text: 'لأي دولة خليجية تنتمي هذه الراية؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Flag_of_Kuwait.svg/640px-Flag_of_Kuwait.svg.png',
    mediaAlt: 'علم الكويت — أخضر أبيض أحمر مع مثلث أسود',
    options: ['الكويت', 'الأردن', 'فلسطين', 'العراق'],
    correctIndex: 0,
    teaser: 'علم خليجي مميز — من صاحبه؟',
    explanation: 'علم الكويت ثلاثة ألوان (أخضر، أبيض، أحمر) مع مثلث أسود، اعتُمد عام 1961.',
    funFact: 'المثلث الأسود في علم الكويت فريد بين دول الخليج.',
    tags: ['كويت', 'أعلام'],
  }),

  qs({
    id: 'media-flag-saudi',
    category: 'gulf',             // core
    tier: 1,
    points: 100,
    type: 'image',
    text: 'علم أي دولة هذا؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/640px-Flag_of_Saudi_Arabia.svg.png',
    mediaAlt: 'علم المملكة العربية السعودية',
    options: ['المملكة العربية السعودية', 'باكستان', 'إيران', 'الإمارات'],
    correctIndex: 0,
    teaser: 'علم أخضر بسيف وشهادة',
    explanation: 'علم السعودية يحمل الشهادة وسيفاً على خلفية خضراء.',
    funFact: 'علم السعودية هو الوحيد في العالم الذي يصعب عكسه بسبب الكتابة العربية.',
    tags: ['سعودية', 'أعلام', 'خليج'],
  }),

  qs({
    id: 'media-flag-qatar',
    category: 'sport',            // core — فيه مونديال قطر
    tier: 1,
    points: 100,
    type: 'image',
    text: 'العلم الأبيض والكستنائي المُسنَّن — لأي دولة؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Qatar.svg/640px-Flag_of_Qatar.svg.png',
    mediaAlt: 'علم قطر',
    options: ['قطر', 'البحرين', 'المغرب', 'موريتانيا'],
    correctIndex: 0,
    teaser: 'أبيض وكستنائي — من صاحبه؟',
    explanation: 'علم قطر الكستنائي والأبيض المُسنَّن — الدولة التاسعة في الهدنة مع بريطانيا 1916.',
    funFact: 'قطر الدولة الوحيدة ذات علم عرضه أكبر من طوله (نسبة 11:28).',
    tags: ['قطر', 'أعلام'],
  }),

  // ── MAP ───────────────────────────────────────────────────────────────────

  qs({
    id: 'media-map-kuwait',
    category: 'geo',              // core
    tier: 2,
    points: 200,
    type: 'map',
    text: 'الدولة المُلوَّنة على هذه الخريطة — ما اسمها؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Kuwait_in_its_region.svg/640px-Kuwait_in_its_region.svg.png',
    mediaAlt: 'خريطة الخليج مع تمييز الكويت',
    options: ['الكويت', 'البحرين', 'قطر', 'عُمان'],
    correctIndex: 0,
    teaser: 'دولة خليجية مُلوَّنة على الخريطة',
    explanation: 'الكويت تقع شمال غرب الخليج، تحدّها العراق شمالاً والسعودية جنوباً.',
    funFact: 'مساحة الكويت 17,818 كم² — أصغر من ولاية نيوجيرسي.',
    tags: ['جغرافيا', 'خليج', 'خرائط'],
  }),

  // ── AUDIO — identify animals ──────────────────────────────────────────────

  qs({
    id: 'media-audio-lion',
    category: 'science',          // core
    tier: 1,
    points: 100,
    type: 'identify',
    text: 'استمع لهذا الصوت — ما اسم هذا الحيوان؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Lion_waiting_in_Namibia.ogg',
    mediaDuration: 5,
    options: ['الأسد', 'النمر', 'الفهد', 'الضبع'],
    correctIndex: 0,
    teaser: 'ملك الغابة — هل تعرف زئيره؟',
    explanation: 'زئير الأسد يُسمع من 8 كيلومترات.',
    funFact: 'مجموعات الأسود تُسمى "فخراً" وتضم 10–40 فرداً.',
    tags: ['حيوانات', 'أصوات'],
  }),

  qs({
    id: 'media-audio-cuckoo',
    category: 'science',          // core
    tier: 1,
    points: 100,
    type: 'identify',
    text: 'من خلال هذا الصوت — ما اسم هذا الطائر؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Cuculus_canorus_-_cuckoo_-_001.ogg',
    mediaDuration: 6,
    options: ['الوقواق', 'الببغاء', 'الحمام', 'البلبل'],
    correctIndex: 0,
    teaser: 'صوت طائر يعرفه الجميع',
    explanation: 'الوقواق (Cuckoo) — سُمّيت ساعة الكوكو نسبةً لصوته.',
    funFact: 'الوقواق يضع بيضه في أعشاش طيور أخرى لتتكفّل بتربية صغاره.',
    tags: ['حيوانات', 'طيور', 'أصوات'],
  }),

  // ── AUDIO — music ─────────────────────────────────────────────────────────

  qs({
    id: 'media-audio-beethoven',
    category: 'music',            // core
    tier: 3,
    points: 300,
    type: 'audio',
    text: 'استمع لهذه السوناتا الكلاسيكية — من مؤلّفها؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Beethoven_-_Moonlight_Sonata_Op._27_No._2.ogg',
    mediaDuration: 8,
    options: ['بيتهوفن', 'موزارت', 'شوبان', 'باخ'],
    correctIndex: 0,
    teaser: 'أشهر سوناتا في تاريخ الموسيقى الكلاسيكية',
    explanation: 'سوناتة ضوء القمر (Op. 27 No. 2) كتبها بيتهوفن 1801.',
    funFact: 'بيتهوفن كان يعاني من الصمم التدريجي حين ألّف كثيراً من أعظم أعماله.',
    tags: ['موسيقى', 'كلاسيكي'],
  }),

  qs({
    id: 'media-audio-bach',
    category: 'music',            // core
    tier: 3,
    points: 300,
    type: 'audio',
    text: 'استمع — من مؤلف هذه المقطوعة الشهيرة للأرغن؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Bach_toccata_fugue_d_minor.ogg',
    mediaDuration: 10,
    options: ['باخ', 'هاندل', 'ليست', 'فيفالدي'],
    correctIndex: 0,
    teaser: 'مقطوعة بالأرغن لا تُنسى',
    explanation: 'توكاتا وفوغة في ري الصغير (BWV 565) ليوهان سيباستيان باخ، كُتبت ~1704.',
    funFact: 'باخ أنجب 20 طفلاً وكتب أكثر من 1000 قطعة موسيقية.',
    tags: ['موسيقى', 'كلاسيكي', 'أرغن'],
  }),

  // ── ORDERING ─────────────────────────────────────────────────────────────

  qs({
    id: 'media-ordering-planets',
    category: 'science',          // core
    tier: 2,
    points: 200,
    type: 'ordering',
    text: 'رتّب الكواكب من الأقرب للشمس إلى الأبعد',
    options: ['المريخ', 'الزهرة', 'زحل', 'المشتري'],
    correctIndex: 0,
    correctOrder: [1, 0, 3, 2],  // Zuhara, Mars, Jupiter, Saturn
    explanation: 'الترتيب: عطارد ← الزهرة ← الأرض ← المريخ ← المشتري ← زحل…',
    funFact: 'المجموعة الشمسية تضم 8 كواكب بعد إعادة تصنيف بلوتو عام 2006.',
    tags: ['علوم', 'فضاء'],
  }),

  qs({
    id: 'media-ordering-wc-scorers',
    category: 'sport',            // core
    tier: 2,
    points: 200,
    type: 'ordering',
    text: 'رتّب المهاجمين من الأكثر تسجيلاً في كأس العالم إلى الأقل (حتى 2022)',
    options: ['رونالدو (8)', 'كلوزه (16)', 'فونتين (13)', 'بيلي (12)'],
    correctIndex: 0,
    correctOrder: [1, 2, 3, 0],  // Klose 16, Fontaine 13, Pele 12, Ronaldo 8
    explanation: 'كلوزه 16 هدف > فونتين 13 > بيلي 12 > رونالدو 8',
    funFact: 'ميروسلاف كلوزه سجّل أهدافه في 4 نسخ متتالية من 1998 إلى 2014.',
    tags: ['رياضة', 'كأس العالم'],
  }),

  // ── MATH & RIDDLE ─────────────────────────────────────────────────────────

  qs({
    id: 'media-math-1',
    category: 'science',          // core
    tier: 1,
    points: 100,
    type: 'math',
    text: '(12 × 5) − 18 + 3 = ?',
    options: ['45', '40', '50', '48'],
    correctIndex: 0,
    explanation: '12×5=60، 60−18=42، 42+3=45',
    funFact: 'الضرب والقسمة يسبقان الجمع والطرح — قاعدة أولوية العمليات.',
    tags: ['رياضيات'],
  }),

  qs({
    id: 'media-math-hard',
    category: 'science',          // core — will land in 600pt hard bucket
    tier: 5,
    points: 500,
    type: 'math',
    text: '∛216 + √49 − 2² = ?',
    options: ['9', '10', '11', '8'],
    correctIndex: 0,
    explanation: '∛216=6، √49=7، 2²=4 → 6+7−4=9',
    funFact: '216=6³ — حجم مكعب ضلعه 6 وحدات.',
    tags: ['رياضيات', 'جذور'],
  }),

  qs({
    id: 'media-riddle-1',
    category: 'culture',          // core
    tier: 2,
    points: 200,
    type: 'riddle',
    text: 'له أسنان لكنه لا يأكل، وله رأس لكنه لا يفكّر. ما هو؟',
    options: ['المشط', 'المفتاح', 'المسمار', 'المطرقة'],
    correctIndex: 0,
    explanation: 'المشط له "أسنان" و"رأس" لكنه لا يأكل ولا يفكّر.',
    funFact: 'أقدم مشط وُجد في تركيا يعود إلى 5000 سنة مصنوع من العظام.',
    tags: ['لغز', 'ثقافة'],
  }),

  qs({
    id: 'media-riddle-2',
    category: 'history',          // core
    tier: 3,
    points: 300,
    type: 'riddle',
    text: 'أنا صندوق بلا مسمار ولا ذهب، لكن فيّ كنزٌ ذهبي. ما أنا؟',
    options: ['البيضة', 'الصدفة', 'التمر', 'الرمّان'],
    correctIndex: 0,
    explanation: 'البيضة — قشرة صلبة بلا ذهب، لكن الصفار الذهبي بداخلها.',
    funFact: 'قشرة البيضة مكوّنة من 95% كربونات الكالسيوم.',
    tags: ['لغز', 'ألغاز'],
  }),

];
