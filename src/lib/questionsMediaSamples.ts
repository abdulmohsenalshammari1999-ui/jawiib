/**
 * Media question bank — image, audio, map, guess, identify, scene, math, riddle.
 * All image/audio URLs point to Wikipedia Commons (CC-licensed, globally cached CDN).
 * To add your own assets: host on Cloudinary / S3 / /public/media/ and use those URLs.
 */

import type { Question } from './types';

function qs(q: Partial<Question> & Pick<Question, 'id' | 'category' | 'tier' | 'points' | 'text' | 'options' | 'correctIndex'>): Question {
  return q as Question;
}

export const MEDIA_SAMPLE_QUESTIONS: Question[] = [

  // ── LANDMARKS — image / guess ─────────────────────────────────────────────

  qs({
    id: 'media-img-kuwait-towers',
    category: 'kuwait_history',
    tier: 2,
    points: 200,
    type: 'image',
    text: 'ما اسم هذا المعلم الكويتي البارز الظاهر في الصورة؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kuwait_Towers.jpg/800px-Kuwait_Towers.jpg',
    mediaAlt: 'أبراج الكويت الثلاثة على شاطئ الخليج العربي',
    options: ['أبراج الكويت', 'برج القرين', 'قصر السيف', 'بيت لوتان'],
    correctIndex: 0,
    teaser: 'معلم وطني يُطلّ على الخليج — هل تعرفه؟',
    explanation: 'أبراج الكويت ثلاثة أبراج على شاطئ الخليج، أُنجزت عام 1979 وصمّمها مكتب VBB السويدي، تضم مطعماً دوّاراً على 82م.',
    funFact: 'البرج الرئيسي يحتوي على خزانَي مياه سعتهما 4500 و3000 متر مكعب.',
    tags: ['كويت', 'معالم', 'معمار'],
  }),

  qs({
    id: 'media-img-burj-khalifa',
    category: 'geo',
    tier: 2,
    points: 200,
    type: 'guess',
    text: 'في أي مدينة يقع هذا الناطحة سحاب الأطول في العالم؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Burj_Khalifa.jpg/500px-Burj_Khalifa.jpg',
    mediaAlt: 'برج خليفة في دبي',
    options: ['دبي', 'أبوظبي', 'الدوحة', 'الرياض'],
    correctIndex: 0,
    teaser: 'الأطول في العالم — أين هو؟',
    explanation: 'برج خليفة في دبي، ارتفاعه 828 متراً، أطول مبنى في العالم منذ افتتاحه عام 2010.',
    funFact: 'يضم برج خليفة 163 طابقاً وبنِيَ خلال 6 سنوات باستخدام أكثر من 330,000 متر مكعب من الخرسانة.',
    tags: ['إمارات', 'عمارة', 'عالم'],
  }),

  qs({
    id: 'media-img-empire-state',
    category: 'geo',
    tier: 1,
    points: 100,
    type: 'guess',
    text: 'ما اسم هذا المبنى الشهير المُلتقَط من الجو؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg',
    mediaAlt: 'مبنى إمباير ستيت من الجو في نيويورك',
    options: ['مبنى إمباير ستيت', 'برج إيفل', 'مبنى كرايسلر', 'مركز ون وورلد تريد'],
    correctIndex: 0,
    teaser: 'واحد من أشهر مباني القرن العشرين — هل تعرفه؟',
    explanation: 'مبنى إمباير ستيت في مانهاتن، ارتفاعه 443م، كان الأطول في العالم من 1931 إلى 1970.',
    funFact: 'يستقطب مبنى إمباير ستيت أكثر من 3.5 مليون زائر سنوياً للمراصد في الطابقَين 86 و102.',
    tags: ['جغرافيا', 'عالم', 'مباني'],
  }),

  // ── FLAGS — image ─────────────────────────────────────────────────────────

  qs({
    id: 'media-flag-kuwait',
    category: 'kuwait_history',
    tier: 1,
    points: 100,
    type: 'image',
    text: 'لأي دولة خليجية تنتمي هذه الراية؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Flag_of_Kuwait.svg/640px-Flag_of_Kuwait.svg.png',
    mediaAlt: 'علم الكويت — أخضر أبيض أحمر مع مثلث أسود',
    options: ['الكويت', 'الأردن', 'فلسطين', 'العراق'],
    correctIndex: 0,
    teaser: 'علم خليجي مميز — هل تعرف صاحبه؟',
    explanation: 'علم الكويت ثلاثة ألوان أفقية (أخضر، أبيض، أحمر) مع مثلث أسود على الجانب الأيسر. اعتُمد عام 1961.',
    funFact: 'المثلث الأسود في علم الكويت فريد بين أعلام دول الخليج.',
    tags: ['كويت', 'أعلام', 'خليج'],
  }),

  qs({
    id: 'media-flag-gcc',
    category: 'gcc_football',
    tier: 2,
    points: 200,
    type: 'image',
    text: 'علم أي دولة خليجية هذا؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/640px-Flag_of_Saudi_Arabia.svg.png',
    mediaAlt: 'علم المملكة العربية السعودية — أخضر مع السيف والشهادة',
    options: ['المملكة العربية السعودية', 'باكستان', 'إيران', 'الإمارات'],
    correctIndex: 0,
    teaser: 'علم أخضر بسيف — لأي دولة؟',
    explanation: 'علم المملكة العربية السعودية يحمل الشهادة (لا إله إلا الله محمد رسول الله) وسيفاً أخضر على خلفية خضراء.',
    funFact: 'علم المملكة هو الوحيد في العالم الذي يصعب عكسه بسبب الكتابة العربية.',
    tags: ['سعودية', 'أعلام', 'خليج'],
  }),

  qs({
    id: 'media-flag-qatar',
    category: 'gcc_football',
    tier: 1,
    points: 100,
    type: 'image',
    text: 'هذا العلم ذو اللون البني والأبيض المُسنَّن — لأي دولة ينتمي؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Qatar.svg/640px-Flag_of_Qatar.svg.png',
    mediaAlt: 'علم قطر — أبيض وكستنائي مع حافة مُسنَّنة',
    options: ['قطر', 'البحرين', 'المغرب', 'موريتانيا'],
    correctIndex: 0,
    teaser: 'أبيض وكستنائي — من صاحبه؟',
    explanation: 'علم قطر يتميز باللون الكستنائي (المارون الداكن) وحافته المُسنَّنة الـ 9 تمثل قطر بوصفها الدولة التاسعة المنضمة للهدنة مع بريطانيا عام 1916.',
    funFact: 'قطر هي الدولة الوحيدة في العالم ذات علم عرضه أكبر من طوله (نسبة 11:28).',
    tags: ['قطر', 'أعلام', 'خليج'],
  }),

  // ── MAPS — map type ───────────────────────────────────────────────────────

  qs({
    id: 'media-map-arabian-peninsula',
    category: 'geo',
    tier: 2,
    points: 200,
    type: 'map',
    text: 'انظر لهذه الخريطة — ما الدولة المُلوَّنة بالأحمر في شبه الجزيرة العربية؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Kuwait_in_its_region.svg/640px-Kuwait_in_its_region.svg.png',
    mediaAlt: 'خريطة الخليج العربي مع تمييز الكويت باللون الأحمر',
    options: ['الكويت', 'البحرين', 'قطر', 'عُمان'],
    correctIndex: 0,
    teaser: 'دولة خليجية صغيرة مُلوَّنة على الخريطة — ما اسمها؟',
    explanation: 'الكويت تقع في الزاوية الشمالية الغربية للخليج العربي، تحدّها العراق شمالاً والمملكة العربية السعودية جنوباً.',
    funFact: 'مساحة الكويت 17,818 كم² — أصغر قليلاً من مساحة ولاية نيوجيرسي الأمريكية.',
    tags: ['جغرافيا', 'خليج', 'خرائط'],
  }),

  // ── AUDIO — audio / identify ──────────────────────────────────────────────

  qs({
    id: 'media-audio-lion',
    category: 'animals',
    tier: 1,
    points: 100,
    type: 'identify',
    text: 'من خلال هذا الصوت — ما اسم هذا الحيوان؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Lion_waiting_in_Namibia.ogg',
    mediaDuration: 5,
    options: ['الأسد', 'النمر', 'الفهد', 'الضبع'],
    correctIndex: 0,
    teaser: 'ملك الغابة — هل تعرف صوته؟',
    explanation: 'زئير الأسد يمكن سماعه من مسافة 8 كيلومترات، ويستخدمه للتواصل مع قطيعه وإعلان حدوده.',
    funFact: 'الأسود الأفريقية هي الوحيدة بين الفصيلة التي تعيش في مجموعات تُسمى "فخراً".',
    tags: ['حيوانات', 'أصوات', 'أفريقيا'],
  }),

  qs({
    id: 'media-audio-beethoven',
    category: 'music',
    tier: 3,
    points: 300,
    type: 'audio',
    text: 'استمع لهذه السوناتا الكلاسيكية الشهيرة — من مؤلّفها؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Beethoven_-_Moonlight_Sonata_Op._27_No._2.ogg',
    mediaDuration: 8,
    options: ['بيتهوفن', 'موزارت', 'شوبان', 'باخ'],
    correctIndex: 0,
    teaser: 'أشهر سوناتا في تاريخ الموسيقى الكلاسيكية — من كتبها؟',
    explanation: 'سوناتة ضوء القمر (Op. 27 No. 2) كتبها بيتهوفن عام 1801 وأهداها لطالبته غيوليتا غيشياردي.',
    funFact: 'لودفيغ فان بيتهوفن كان يعاني من الصمم التدريجي حين ألّف كثيراً من أعظم أعماله.',
    tags: ['موسيقى', 'كلاسيكي', 'غرب'],
  }),

  qs({
    id: 'media-audio-bach-toccata',
    category: 'music',
    tier: 3,
    points: 300,
    type: 'audio',
    text: 'استمع — من مؤلف هذه المقطوعة الكلاسيكية الشهيرة للأرغن؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Bach_toccata_fugue_d_minor.ogg',
    mediaDuration: 10,
    options: ['باخ', 'هاندل', 'ليست', 'فيفالدي'],
    correctIndex: 0,
    teaser: 'مقطوعة بالأرغن لا يُنساها أحد — من كتبها؟',
    explanation: 'توكاتا وفوغة في ري الصغير (BWV 565) لـ يوهان سيباستيان باخ، كُتبت حوالي 1704 وهي من أشهر أعمال الأرغن في العالم.',
    funFact: 'باخ أنجب 20 طفلاً وكتب أكثر من 1000 قطعة موسيقية طوال حياته.',
    tags: ['موسيقى', 'كلاسيكي', 'أرغن'],
  }),

  qs({
    id: 'media-audio-cuckoo',
    category: 'animals',
    tier: 1,
    points: 100,
    type: 'identify',
    text: 'من خلال هذا الصوت — ما اسم هذا الطائر؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Cuculus_canorus_-_cuckoo_-_001.ogg',
    mediaDuration: 6,
    options: ['الوقواق', 'الببغاء', 'الحمام', 'البلبل'],
    correctIndex: 0,
    teaser: 'صوت طائر يعرفه الجميع — ما اسمه؟',
    explanation: 'الوقواق (Cuckoo) يُعدّ من أشهر أصوات الطبيعة في العالم، وسمّيت ساعة الكوكو نسبةً لصوته.',
    funFact: 'الوقواق يضع بيضه في أعشاش طيور أخرى وتتكفّل بتربية صغاره بدلاً منه.',
    tags: ['حيوانات', 'طيور', 'أصوات'],
  }),

  // ── MATH ─────────────────────────────────────────────────────────────────

  qs({
    id: 'media-math-1',
    category: 'math_logic',
    tier: 1,
    points: 100,
    type: 'math',
    text: '(12 × 5) − 18 + 3 = ?',
    options: ['45', '40', '50', '48'],
    correctIndex: 0,
    explanation: '12×5=60، 60−18=42، 42+3=45',
    funFact: 'ترتيب العمليات: الضرب والقسمة أولاً، ثم الجمع والطرح من اليسار لليمين.',
    tags: ['رياضيات'],
  }),

  qs({
    id: 'media-math-2',
    category: 'math_logic',
    tier: 4,
    points: 400,
    type: 'math',
    text: '∛216 + √49 − 2² = ?',
    options: ['9', '10', '11', '8'],
    correctIndex: 0,
    explanation: '∛216=6، √49=7، 2²=4. إذن: 6+7−4=9',
    funFact: '216=6³ وهو حجم مكعب ضلعه 6 وحدات.',
    tags: ['رياضيات', 'جذور'],
  }),

  // ── RIDDLES ───────────────────────────────────────────────────────────────

  qs({
    id: 'media-riddle-1',
    category: 'riddles_ar',
    tier: 2,
    points: 200,
    type: 'riddle',
    text: 'له أسنان لكنه لا يأكل، وله رأس لكنه لا يفكّر. ما هو؟',
    options: ['المشط', 'المفتاح', 'المسمار', 'المطرقة'],
    correctIndex: 0,
    explanation: 'المشط له "أسنان" بلاستيكية و"رأس" علوي لكنه لا يأكل ولا يفكّر.',
    funFact: 'أقدم مشط وُجد في تركيا يعود إلى 5000 سنة مصنوع من العظام.',
    tags: ['لغز', 'ألغاز'],
  }),

  qs({
    id: 'media-riddle-2',
    category: 'riddles_ar',
    tier: 3,
    points: 300,
    type: 'riddle',
    text: 'أنا صندوق بلا مسمار ولا ذهب، لكن فيّ كنزٌ ذهبي. ما أنا؟',
    options: ['البيضة', 'الصدفة', 'التمر', 'الرمّان'],
    correctIndex: 0,
    explanation: 'البيضة — قشرة صلبة بلا مسمار ولا ذهب، لكن الصفار (الكنز الذهبي) بداخلها.',
    funFact: 'قشرة البيضة مكوّنة من 95% كربونات الكالسيوم وهي أقوى مما تبدو عليه.',
    tags: ['لغز', 'ألغاز'],
  }),

];
