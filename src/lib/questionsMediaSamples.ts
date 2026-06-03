/**
 * Sample questions demonstrating every question type supported by Jawib.
 * Replace mediaUrl values with real hosted assets before production use.
 * These questions are merged into the main question pool via questions.ts.
 */

import type { Question } from './types';

function qs(q: Partial<Question> & Pick<Question, 'id' | 'category' | 'tier' | 'points' | 'text' | 'options' | 'correctIndex'>): Question {
  return q as Question;
}

export const MEDIA_SAMPLE_QUESTIONS: Question[] = [

  // ── TYPE: image ──────────────────────────────────────────────────────────
  qs({
    id: 'sample-image-1',
    category: 'kuwait_history',
    tier: 2,
    points: 200,
    type: 'image',
    text: 'ما اسم هذا المبنى الكويتي التاريخي الظاهر في الصورة؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kuwait_Towers.jpg/1200px-Kuwait_Towers.jpg',
    mediaAlt: 'أبراج الكويت الثلاثة على شاطئ الخليج العربي',
    options: ['أبراج الكويت', 'برج القرين', 'قصر السيف', 'بيت لوتان'],
    correctIndex: 0,
    teaser: 'هذا المبنى رمز وطني بارز يُطلّ على الخليج',
    explanation: 'أبراج الكويت ثلاثة أبراج مشيّدة على الشاطئ الغربي للخليج، أُنجزت عام 1979 وتُعدّ من أبرز المعالم المعمارية في الخليج.',
    funFact: 'صُمّمت الأبراج من قِبل مكتب VBB السويدي وتضم مطعماً دوّاراً على ارتفاع 82 متراً.',
    tags: ['معالم', 'كويت', 'معمار'],
  }),

  // ── TYPE: audio ──────────────────────────────────────────────────────────
  qs({
    id: 'sample-audio-1',
    category: 'music',
    tier: 2,
    points: 200,
    type: 'audio',
    text: 'استمع لهذه المقطوعة الموسيقية الخليجية وأجب: ما اسم هذا النوع من الموسيقى؟',
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    mediaAlt: 'مقطوعة موسيقية خليجية تقليدية',
    mediaDuration: 30,
    options: ['الفِجيري', 'المقام الكويتي', 'الصوت الخليجي', 'البستة'],
    correctIndex: 2,
    teaser: 'غنّاء خليجي أصيل — ما اسم هذا اللون الموسيقي؟',
    explanation: 'الصوت الخليجي لون موسيقي عريق تُؤدّيه فرق تضم أعواد وإيقاعات شعبية وأصوات مغنّين.',
    funFact: 'يُقال إن الصوت الخليجي تأثّر بالأغاني الهندية عبر حركة التجار في القرنين الثامن عشر والتاسع عشر.',
    tags: ['موسيقى', 'خليج', 'فن'],
  }),

  // ── TYPE: video / scene ──────────────────────────────────────────────────
  qs({
    id: 'sample-scene-1',
    category: 'kuwait_history',
    tier: 3,
    points: 300,
    type: 'scene',
    text: 'شاهد هذا المقطع: في أي عام حدثت هذه اللحظة التاريخية للكويت؟',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    mediaAlt: 'مقطع تاريخي عن الاستقلال الكويتي',
    options: ['1961', '1938', '1990', '1975'],
    correctIndex: 0,
    teaser: 'لحظة مفصلية في تاريخ الكويت الحديث',
    explanation: 'في 19 يونيو 1961 أعلنت الكويت استقلالها عن بريطانيا وصارت دولة ذات سيادة كاملة.',
    funFact: 'انضمت الكويت إلى جامعة الدول العربية بعد أسابيع قليلة من استقلالها.',
    tags: ['تاريخ', 'كويت', 'استقلال'],
  }),

  // ── TYPE: guess ──────────────────────────────────────────────────────────
  qs({
    id: 'sample-guess-person-1',
    category: 'kuwait_celebs',
    tier: 2,
    points: 200,
    type: 'guess',
    text: 'انظر للصورة: من هذا الشخصية الكويتية البارزة؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg',
    mediaAlt: 'صورة شخصية كويتية',
    options: ['سعاد عبدالله', 'حياة الفهد', 'فاطمة الزيد', 'مريم الصالح'],
    correctIndex: 0,
    teaser: 'من هذه النجمة الكويتية الأسطورية؟',
    explanation: 'سعاد عبدالله من أبرز ممثلات الخليج العربي، قدّمت مسيرة فنية ممتدة لأكثر من خمسة عقود.',
    funFact: 'لقّبتها الجماهير بـ"سيدة الشاشة الخليجية" تقديراً لمسيرتها الطويلة.',
    tags: ['مشاهير', 'كويت', 'فن'],
  }),

  qs({
    id: 'sample-guess-place-1',
    category: 'geo',
    tier: 1,
    points: 100,
    type: 'guess',
    text: 'ما اسم هذا المكان الجغرافي المشهور؟',
    mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg',
    mediaAlt: 'مبنى إمباير ستيت من الجو في نيويورك',
    options: ['مبنى إمباير ستيت', 'برج إيفل', 'مبنى كرايسلر', 'برج ويليس'],
    correctIndex: 0,
    teaser: 'واحد من أشهر مباني العالم — هل تعرفه؟',
    explanation: 'مبنى إمباير ستيت في مانهاتن بنيويورك، ارتفاعه 443 متراً، كان الأطول في العالم من 1931 حتى 1970.',
    funFact: 'يستقطب مبنى إمباير ستيت أكثر من 3.5 مليون زائر سنوياً.',
    tags: ['جغرافيا', 'عالم', 'مباني'],
  }),

  // ── TYPE: identify (sound/voice) ─────────────────────────────────────────
  qs({
    id: 'sample-identify-1',
    category: 'music',
    tier: 3,
    points: 300,
    type: 'identify',
    text: 'استمع لهذا المقطع الصوتي — ما اسم هذه الآلة الموسيقية؟',
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    mediaAlt: 'صوت آلة موسيقية خليجية',
    mediaDuration: 15,
    options: ['العود', 'القانون', 'الربابة', 'الناي'],
    correctIndex: 0,
    teaser: 'آلة وترية عريقة — هل تعرف صوتها؟',
    explanation: 'العود آلة وترية قديمة تُعدّ "سيّد الآلات" في الموسيقى العربية، لها 11 وتراً مقسّمة على 5 أو 6 دروب.',
    funFact: 'كلمة "عود" عربية وأصبحت في الأوروبية "lute" عبر اللغة الإسبانية.',
    tags: ['موسيقى', 'آلات', 'فنون'],
  }),

  // ── TYPE: math ───────────────────────────────────────────────────────────
  qs({
    id: 'sample-math-1',
    category: 'math_logic',
    tier: 1,
    points: 100,
    type: 'math',
    text: '(12 × 5) − 18 + 3 = ?',
    options: ['45', '40', '50', '48'],
    correctIndex: 0,
    explanation: '12×5 = 60 ← 60−18 = 42 ← 42+3 = 45',
    funFact: 'ترتيب العمليات الحسابية: الضرب والقسمة أولاً، ثم الجمع والطرح من اليسار لليمين.',
    tags: ['رياضيات', 'تحدي'],
  }),

  qs({
    id: 'sample-math-2',
    category: 'math_logic',
    tier: 4,
    points: 400,
    type: 'math',
    text: '∛216 + √49 − 2² = ?',
    options: ['9', '10', '11', '8'],
    correctIndex: 0,
    explanation: '∛216 = 6، √49 = 7، 2² = 4. إذن: 6 + 7 − 4 = 9',
    funFact: '216 = 6³ وهو أيضاً حجم مكعب ضلعه 6 وحدات.',
    tags: ['رياضيات', 'جذور', 'أسس'],
  }),

  // ── TYPE: riddle ─────────────────────────────────────────────────────────
  qs({
    id: 'sample-riddle-1',
    category: 'riddles_ar',
    tier: 2,
    points: 200,
    type: 'riddle',
    text: 'له أسنان لكنه لا يأكل، وله رأس لكنه لا يفكّر. ما هو؟',
    options: ['المشط', 'المفتاح', 'المسمار', 'المطرقة'],
    correctIndex: 0,
    explanation: 'المشط له "أسنان" (الأسنان المعدنية أو البلاستيكية) و"رأس" (الجزء العلوي) لكنه لا يأكل ولا يفكّر.',
    funFact: 'أقدم مشط وُجد في تركيا يعود إلى نحو 5000 سنة مصنوع من العظام.',
    tags: ['لغز', 'ألغاز', 'عربي'],
  }),

  // ── TYPE: text (standard) ────────────────────────────────────────────────
  qs({
    id: 'sample-text-1',
    category: 'culture',
    tier: 1,
    points: 100,
    type: 'text',
    text: 'ما هي أكبر مدينة في المملكة العربية السعودية من حيث عدد السكان؟',
    options: ['الرياض', 'جدة', 'مكة المكرمة', 'الدمام'],
    correctIndex: 0,
    explanation: 'الرياض هي عاصمة المملكة وأكبر مدنها السكانية بأكثر من 7 ملايين نسمة.',
    funFact: 'تعني "الرياض" باللغة العربية الحدائق والبساتين، نسبةً للواحات التي كانت تكثر فيها.',
    tags: ['ثقافة', 'خليج', 'جغرافيا'],
  }),

];
