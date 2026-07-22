/**
 * Murder Mystery scenarios for "مَن الفاعل؟" mode.
 * 6 suspects × 6 locations × 6 methods = 216 unique solutions per scenario.
 * Clues are generated at draw-time from the solution triple, not hand-authored per game.
 */

export interface Suspect {
  id: string;
  nameAr: string;
  roleAr: string;
  emoji: string;
  clues: [string, string]; // 2 true clues pointing toward this suspect
}

export interface MysteryLocation {
  id: string;
  nameAr: string;
  emoji: string;
  clues: [string, string]; // 2 true clues pointing toward this location
}

export interface MysteryMethod {
  id: string;
  nameAr: string;
  emoji: string;
  clues: [string, string]; // 2 true clues pointing toward this method
}

export interface Scenario {
  id: string;
  titleAr: string;
  settingAr: string;
  crimeAr: string;
  suspects: Suspect[];
  locations: MysteryLocation[];
  methods: MysteryMethod[];
}

// ── Solution draw ─────────────────────────────────────────────────────────────

export interface DrawnSolution {
  suspect: Suspect;
  location: MysteryLocation;
  method: MysteryMethod;
}

export function drawSolution(scenario: Scenario): DrawnSolution {
  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  return {
    suspect:  pick(scenario.suspects),
    location: pick(scenario.locations),
    method:   pick(scenario.methods),
  };
}

// ── Tile clue generation ──────────────────────────────────────────────────────

export type TileRow = 'witness' | 'physical' | 'document';

export interface MysteryTileClue {
  tileId: string;
  row: TileRow;
  points: 200 | 400 | 600;
  clueText: string;
  clueEmoji: string;
  isRedHerring: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate 9 tile clues (3 per row) from the drawn solution.
 * Each row: 2 real clues + 1 red herring (randomly positioned).
 */
export function generateClues(scenario: Scenario, solution: DrawnSolution): MysteryTileClue[] {
  // Red herring picks — different entity from the solution
  const otherSuspect  = scenario.suspects.find((s) => s.id !== solution.suspect.id)!;
  const otherLocation = scenario.locations.find((l) => l.id !== solution.location.id)!;
  const otherMethod   = scenario.methods.find((m) => m.id !== solution.method.id)!;

  const makeRow = (
    row: TileRow,
    real1: string, real2: string, herring: string,
    realEmoji: string, herringEmoji: string,
  ): MysteryTileClue[] => {
    const items = shuffle([
      { clueText: real1,   clueEmoji: realEmoji,    isRedHerring: false },
      { clueText: real2,   clueEmoji: realEmoji,    isRedHerring: false },
      { clueText: herring, clueEmoji: herringEmoji, isRedHerring: true  },
    ]);
    return ([200, 400, 600] as const).map((pts, i) => ({
      tileId: `${row}-${pts}`,
      row,
      points: pts,
      ...items[i],
    }));
  };

  return [
    ...makeRow('witness',
      solution.suspect.clues[0], solution.suspect.clues[1],
      otherSuspect.clues[0],
      solution.suspect.emoji, otherSuspect.emoji,
    ),
    ...makeRow('physical',
      solution.location.clues[0], solution.location.clues[1],
      otherLocation.clues[0],
      solution.location.emoji, otherLocation.emoji,
    ),
    ...makeRow('document',
      solution.method.clues[0], solution.method.clues[1],
      otherMethod.clues[0],
      solution.method.emoji, otherMethod.emoji,
    ),
  ];
}

// ── Scenario data ─────────────────────────────────────────────────────────────

export const SCENARIOS: Scenario[] = [
  {
    id: 'pearl',
    titleAr: 'لؤلؤة بيت الراشد اختفت!',
    settingAr: 'بيت الراشد العريق في قلب الكويت القديمة',
    crimeAr: 'خلال جلسة ديوانية، اختفت اللؤلؤة التاريخية التي توارثتها العائلة جيلاً بعد جيل. ستة مشتبه بهم… والجاني لا يزال بيننا.',
    suspects: [
      {
        id: 's_abdullah', nameAr: 'عبدالله الراشد', roleAr: 'ابن الأسرة الأكبر — مثقل بالديون',
        emoji: '👨‍💼',
        clues: [
          'سُمع يتحدث عن بيع اللؤلؤة قبل أسبوع من الحادثة.',
          'وُجدت آثار أصابعه على غطاء الخزنة.',
        ],
      },
      {
        id: 's_noura', nameAr: 'نورة العجيل', roleAr: 'جارة وصديقة العائلة',
        emoji: '👩‍🏫',
        clues: [
          'قضت وقتاً طويلاً وحدها داخل المنزل بحجة البحث عن الحمام.',
          'عُثر في حقيبتها على صورة قديمة للؤلؤة.',
        ],
      },
      {
        id: 's_salem', nameAr: 'سالم المزروعي', roleAr: 'تاجر زائر — ثروته مشكوك فيها',
        emoji: '🧔',
        clues: [
          'أبدى اهتماماً لافتاً باللؤلؤة طوال السهرة.',
          'غادر المنزل خمس دقائق قبل اكتشاف الاختفاء.',
        ],
      },
      {
        id: 's_fatima', nameAr: 'فاطمة الخادمة', roleAr: 'عملت في البيت عشرين عاماً',
        emoji: '👩',
        clues: [
          'وحدها تعرف مكان مفتاح الخزنة الاحتياطي.',
          'لاحظ أحد الضيوف أنها كانت متوترة بشكل غير معتاد تلك الليلة.',
        ],
      },
      {
        id: 's_yousef', nameAr: 'يوسف الراشد', roleAr: 'الأخ الأصغر — يريد نصيبه من الميراث',
        emoji: '👦',
        clues: [
          'رفض أن يبقى في الديوانية مع بقية الضيوف ساعة الحادثة.',
          'يعلم قيمة اللؤلؤة أكثر من أي شخص آخر.',
        ],
      },
      {
        id: 's_hamad', nameAr: 'حمد العقاري', roleAr: 'شريك أعمال الأسرة',
        emoji: '🤵',
        clues: [
          'له نزاع مالي قديم مع العائلة لم يُحسم.',
          'طلب استعراض المقتنيات الثمينة تحت ستار التقييم العقاري.',
        ],
      },
    ],
    locations: [
      {
        id: 'l_diwan', nameAr: 'الديوانية', emoji: '🏛️',
        clues: [
          'وُجد كوب شاي فارغ في زاوية بعيدة بعيداً عن مجلس الضيوف.',
          'أحد الستائر كان مرفوعاً بشكل غير معتاد يخفي الخزنة جزئياً.',
        ],
      },
      {
        id: 'l_kitchen', nameAr: 'المطبخ', emoji: '🍽️',
        clues: [
          'وُجد على أرض المطبخ خيط من نفس القماش المستخدم في حفظ اللؤلؤة.',
          'أحد درّاج المطبخ كان مفتوحاً وبه حقيبة صغيرة فارغة.',
        ],
      },
      {
        id: 'l_bedroom', nameAr: 'غرفة النوم الرئيسية', emoji: '🛏️',
        clues: [
          'وُجد باب الغرفة مقفلاً من الداخل دون أي سبب واضح.',
          'رائحة عطر غريب لا ينتمي لأي من أفراد الأسرة.',
        ],
      },
      {
        id: 'l_storage', nameAr: 'المخزن الخلفي', emoji: '📦',
        clues: [
          'وُجد صندوق معدني فارغ كان مخصصاً للمقتنيات الثمينة.',
          'آثار أقدام طازجة في غبار المخزن تشير إلى شخص دخل مؤخراً.',
        ],
      },
      {
        id: 'l_garden', nameAr: 'الحديقة الخلفية', emoji: '🌴',
        clues: [
          'وُجد في الحديقة خيط من قماش أزرق كان يُستخدم لربط الخزنة.',
          'آثار حذاء في التراب قرب الجدار الخلفي تدل على محاولة تسلق.',
        ],
      },
      {
        id: 'l_vault', nameAr: 'غرفة الخزنة', emoji: '🔒',
        clues: [
          'علامات خدش حول قفل الخزنة تدل على فتحها بأداة غير مفتاحها.',
          'الكاميرا الأمنية أُغلقت من الداخل قبل ساعة من الحادثة.',
        ],
      },
    ],
    methods: [
      {
        id: 'm_direct', nameAr: 'السرقة المباشرة', emoji: '🤲',
        clues: [
          'اللؤلؤة لم تكن مربوطة ويمكن أخذها بيد واحدة بسهولة.',
          'مدة الغياب عن مجلس الضيوف تتوافق مع وقت كافٍ لأخذ اللؤلؤة والعودة.',
        ],
      },
      {
        id: 'm_keys', nameAr: 'تزوير المفاتيح', emoji: '🗝️',
        clues: [
          'وُجدت طبعة شمعية لمفتاح في جيب أحد الضيوف.',
          'أحد الأقفال على الخزنة يحتاج مفتاحاً ولا يمكن كسره بالقوة.',
        ],
      },
      {
        id: 'm_distract', nameAr: 'التشتيت والسرقة', emoji: '🎭',
        clues: [
          'حدث جدال مفتعل في الديوانية أشغل الجميع لعدة دقائق حاسمة.',
          'الجاني كان يعرف مسبقاً موقع اللؤلؤة بالضبط ولم يضع وقتاً في البحث.',
        ],
      },
      {
        id: 'm_coerce', nameAr: 'الإكراه', emoji: '⚠️',
        clues: [
          'أحد أفراد الأسرة بدا مرتبكاً وأحجم عن الكلام عند الاستجواب.',
          'وُجدت رسالة تهديد مكتوبة بخط مجهول في أحد الأدراج.',
        ],
      },
      {
        id: 'm_accomplice', nameAr: 'مساعد خارجي', emoji: '🤝',
        clues: [
          'شوهدت سيارة غير معروفة تنتظر خارج البيت بعد منتصف الليل.',
          'مكالمة هاتفية مشبوهة أُجريت من داخل البيت قبل الحادثة بساعة.',
        ],
      },
      {
        id: 'm_trust', nameAr: 'استغلال الثقة', emoji: '💔',
        clues: [
          'الجاني لديه صلاحية دخول مطلقة للمنزل دون إثارة الشكوك.',
          'استُغلت علاقة قوية بصاحب البيت للوصول إلى مكان اللؤلؤة.',
        ],
      },
    ],
  },

  // ─── Scenario 2 ───────────────────────────────────────────────────────────────
  {
    id: 'dallah',
    titleAr: 'سر الدلّة المفقود!',
    settingAr: 'مقهى "دلّة الجد" الشهير في قلب السوق الكويتي القديم',
    crimeAr: 'اختفت الوصفة السرية التي توارثها المقهى منذ تأسيسه عام 1954. من سرق سر الدلّة؟',
    suspects: [
      {
        id: 's_rashid', nameAr: 'راشد الجابر', roleAr: 'المنافس — يملك مقهى مجاوراً',
        emoji: '☕',
        clues: [
          'حاول شراء الوصفة أكثر من مرة ورُفض في كل مرة.',
          'كان حاضراً في السوق ليلة الاختفاء دون سبب واضح.',
        ],
      },
      {
        id: 's_mariam', nameAr: 'مريم الصباح', roleAr: 'موظفة جديدة — جاءت من مقهى منافس',
        emoji: '👩‍🍳',
        clues: [
          'طلبت الاطلاع على "أسرار الإعداد" في أول أسبوع من عملها.',
          'لاحظ صاحب المقهى أنها التقطت صوراً في المطبخ الخلفي.',
        ],
      },
      {
        id: 's_talib', nameAr: 'طالب العتيبي', roleAr: 'موظف قديم — يشعر بالظلم',
        emoji: '👨‍🍳',
        clues: [
          'يعرف مكان الوصفة الأصلية أكثر من أي شخص آخر.',
          'خاض مؤخراً نقاشاً حاداً مع المالك بشأن الراتب.',
        ],
      },
      {
        id: 's_investor', nameAr: 'فهد المستثمر', roleAr: 'مستثمر يريد شراء المقهى',
        emoji: '💼',
        clues: [
          'قدّم عرضاً بمبلغ ضخم لشراء المقهى مشروطاً بالحصول على الوصفة.',
          'بقي في المقهى حتى ما بعد إغلاقه بحجة "مراجعة الحسابات".',
        ],
      },
      {
        id: 's_cousin', nameAr: 'عمر ابن عم المالك', roleAr: 'يدّعي حق الشراكة',
        emoji: '👨',
        clues: [
          'يزعم أن الوصفة ملك مشترك لعائلته وليست للمالك وحده.',
          'طلب نسخة من الوصفة ورُفض طلبه رسمياً قبل أسبوعين.',
        ],
      },
      {
        id: 's_supplier', nameAr: 'جاسم المورد', roleAr: 'يورد البن والهيل للمقهى',
        emoji: '🌿',
        clues: [
          'اكتشف مصادر مكونات الوصفة من خلال الكميات التي يورّدها.',
          'يتعاون مع مقاهٍ منافسة ويمكنه بيع الوصفة بسعر عالٍ.',
        ],
      },
    ],
    locations: [
      {
        id: 'l_counter', nameAr: 'عداد الاستقبال', emoji: '🪵',
        clues: [
          'درج الكاشير كان مفتوحاً ولم يكن يُخزّن فيه مال.',
          'وُجد على العداد أثر حبر من ورقة كانت موضوعة عليه مؤخراً.',
        ],
      },
      {
        id: 'l_backroom', nameAr: 'المخزن الخلفي', emoji: '🚪',
        clues: [
          'الخزنة الصغيرة داخل المخزن فُتحت بدون كسر — شخص يعرف الرمز.',
          'وُجد قهوة مسكوبة على الأرض مما يدل على تسرع شخص كان داخله.',
        ],
      },
      {
        id: 'l_kitchen', nameAr: 'المطبخ', emoji: '🔥',
        clues: [
          'كاميرا المطبخ الداخلية فُصلت عن الكهرباء تلك الليلة.',
          'الوصفة كانت مكتوبة على لوحة مثبتة خلف باب المطبخ.',
        ],
      },
      {
        id: 'l_office', nameAr: 'مكتب المالك', emoji: '🖥️',
        clues: [
          'قفل المكتب حمل آثار خدش تدل على فتحه بطريقة غير رسمية.',
          'وُجد نسخة طبق الأصل من الوصفة في طابعة المكتب.',
        ],
      },
      {
        id: 'l_terrace', nameAr: 'الرواق الخارجي', emoji: '🌙',
        clues: [
          'شاهد حارس الأمن شخصاً يقف في الرواق وقت الحادثة.',
          'وُجد كيس قماش فارغ كان يُستخدم لحفظ الوثائق الثمينة.',
        ],
      },
      {
        id: 'l_basement', nameAr: 'القبو القديم', emoji: '🏚️',
        clues: [
          'النسخة الأصلية من الوصفة مُخزّنة هناك منذ تأسيس المقهى.',
          'آثار خطوات في غبار القبو لا تعود لأي من الموظفين المعتادين.',
        ],
      },
    ],
    methods: [
      {
        id: 'm_photo', nameAr: 'التصوير السري', emoji: '📸',
        clues: [
          'وُجد بالقرب من مكان الوصفة جهاز صغير قد يكون كاميرا مخفية.',
          'نسيج الوصفة الأصلية سليم — لم تُسرق ورقياً بل نُقلت رقمياً.',
        ],
      },
      {
        id: 'm_copy', nameAr: 'النسخ والاستبدال', emoji: '📋',
        clues: [
          'ورقة الوصفة الموجودة الآن مكتوبة بخط مختلف عن الخط الأصلي.',
          'وُجدت قصاصات ورق عند سلة المهملات تشبه تنسيق الوصفة.',
        ],
      },
      {
        id: 'm_bribe', nameAr: 'الرشوة', emoji: '💰',
        clues: [
          'أحد الموظفين حصل على مبلغ نقدي كبير لم يُفصح عن مصدره.',
          'محادثة مشبوهة سُمعت بين موظف والمشتبه به.',
        ],
      },
      {
        id: 'm_hack', nameAr: 'الاختراق الرقمي', emoji: '💻',
        clues: [
          'الحاسوب الخاص بالمالك تعرض لمحاولة وصول غير مرخص تلك الليلة.',
          'وُجد على الشبكة ملف بصيغة pdf يحمل اسم الوصفة الأصلية.',
        ],
      },
      {
        id: 'm_insider', nameAr: 'مساعدة من الداخل', emoji: '🤫',
        clues: [
          'أحد الموظفين تغيب عن موقع عمله تماماً ساعة الحادثة.',
          'أبواب المقهى كانت مقفلة — لا يمكن الدخول بدون مساعدة من الداخل.',
        ],
      },
      {
        id: 'm_distract', nameAr: 'إلهاء الشهود', emoji: '🎪',
        clues: [
          'انقطع التيار الكهربائي لدقيقتين في الوقت الحرج — لم يكن عطلاً عارضاً.',
          'حدثت ضجة مفاجئة أمام المقهى أشغلت الجميع في اللحظة الحاسمة.',
        ],
      },
    ],
  },
];
