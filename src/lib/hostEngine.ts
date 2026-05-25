// hostEngine.ts — Contextual Arabic (Kuwaiti dialect) commentary engine for جاوب
// Anti-repetition sliding window of size 4 per category.

export type TonePreset = 'savage' | 'hype' | 'chill';

export type HostEvent =
  | { type: 'game_start'; playerCount: number; mode: 'ffa' | 'teams' }
  | { type: 'correct'; playerName: string; points: number; streak: number; teamColor?: string }
  | { type: 'wrong'; playerName: string; streak: number; teamColor?: string }
  | { type: 'timeout'; playerName: string; teamColor?: string }
  | { type: 'streak'; playerName: string; streak: number; teamColor?: string }
  | { type: 'comeback'; trailingName: string; leadingName: string; delta: number }
  | { type: 'domination'; leadingName: string; trailingName: string; delta: number }
  | { type: 'sabotage'; attackerName: string; victimName: string; sabotageType: string; blocked: boolean }
  | { type: 'sudden_death'; score1: number; score2: number }
  | { type: 'team_lead'; teamName: string; leadPts: number }
  | { type: 'game_over'; winnerName: string; score: number };

// ─── Dialogue banks ──────────────────────────────────────────────────────────

const BANKS: Record<string, string[]> = {
  // FFA intro — welcoming chaos
  game_start_ffa: [
    'يا هلا بالشياطين! 😈 {{playerCount}} لاعبين والكل يبي يكسر الثاني — يلا بسم الله!',
    'اللعبة بدت يا ناس! {{playerCount}} عقول تتبارى واحد بيطلع وياه النقاط والباقين يبكون 😂🏆',
    'أهلين وسهلين! {{playerCount}} لاعب ومكو رحمة — كل واحد لنفسه! 🔥',
    'بدينا! {{playerCount}} مشتركين والدم بيسيل نقاطًا الليلة 😂💥',
    'يلا يلا! {{playerCount}} لاعب وكل واحد شايف نفسه بطل — بكره نشوف من الأبطال ومن الكومبارس! 🎭',
    'صافر الحكم! {{playerCount}} لاعبين يتقاتلون على النقاط — الله يعين المهزوم 😂🔔',
    'كل واحد لنفسه! {{playerCount}} لاعبين والرحمة ما لها محل هنا — حظ الجميع! 🤺',
  ],

  // Teams intro — hyping rivalry
  game_start_teams: [
    'فريقين وجهًا لوجه! 🆚 بكره نشوف مين بيسوّي الدوشة الحقيقية — يلا قومو!',
    'الفرق تتجمع والمعركة بدت! 🔴🔵 كل فريق يريد يثبت إنه الأذكى — بسم الله نبدي!',
    'تيم ضد تيم! لا مجاملات ولا ودّ — بس نقاط وفوز! 🏅🔥',
    'الليلة الفرق تتكلم بالنقاط! 💪 اللي بيتعاون فريقه بيفوز واللي يلعب لروحه بيخسر الجميع 😤',
    'وحدة الفريق هي السلاح! 🛡️ شوفوا مين بيثق بزملاؤه ومين بيروح لوحده — يلا!',
    'حرب الفرق بدت! 🚩 كل هدف صواريخ والكل يريد يفوز — مو وقت نوم!',
    'تيم على تيم! الأذكى يفوز والثاني يدفع الحساب 😂🏆',
  ],

  // Correct answer — streak < 3 — praise with backhanded compliment
  correct_base: [
    '{{playerName}} جاوب صح! ماشاء الله بس ترا الساعة المعطلة تصيب مرتين باليوم 😂✅',
    'صح يا {{playerName}}! ولو إن السؤال كان سهل شوية… 😏',
    'أحسنت يا {{playerName}}! بس لا تعلّق آمال كبيرة — الجاي أصعب 🫡',
    'الله يبارك يا {{playerName}}! جاوب صح… هالمرة 🤭',
    'برافو {{playerName}}! بس ترا أخوك الصغير كان بيجاوب أسرع 😂',
    'يعطيك العافية يا {{playerName}}! بس ترا ما تعلم يا بطل المرة الجاية 😉',
    'صواب يا {{playerName}}! ألحين قل لنا هل تعرف ليش الجواب صح ولا حزرت؟ 🤔',
  ],

  // Correct — streak >= 3 — hyping the hot streak, taunting opponents
  correct_streak: [
    '🔥🔥🔥 {{playerName}} على نار! {{streak}} صح ورا بعض — المنافسين يبوّن يطقون الشاشة!',
    'ستريك من {{streak}} يا {{playerName}}! شكلك فاتح جوجل بالسر 😂🔥',
    '{{playerName}} ما يوقف! {{streak}} إجابات صح — قولوا للباقين يرسلون استسلام! 🏳️',
    'الله الله على {{playerName}}! {{streak}} متتالية — وين هالمخ كان مختبي من أول؟ 😤🧠',
    'مسلسل صح يا {{playerName}}! {{streak}} بدون غلط — المنافسين ابدأوا تبكون 😂💀',
    '{{playerName}} يحرق الإجابات! {{streak}} متتالي والجميع يتفرج — يا خسارة الباقين 🔥👑',
    'ستريك {{streak}} يا {{playerName}}! إذا جاوب صح مرة ثانية أنا أعتزل التقديم 🫡🔥',
  ],

  // Wrong answer — streak not broken
  wrong_base: [
    '{{playerName}} غلّط! 😂 يا قلبي عليك — السؤال كان ودّ يساعدك بس إنت ما ساعدت نفسك',
    'لا حول ولا قوة يا {{playerName}}! حتى ياهل يعرفون الجواب الصح 😅',
    'هههه يا {{playerName}}! شكلك ما فطرت اليوم — روح اشرب قهوة وتعال 😂☕',
    '{{playerName}} خبّط! بس لا تزعل ترا كل الناس شافوا 😱',
    'أووه يا {{playerName}}! جاوبت وكنك تحزر من الهوا — تقريبًا صح بس مو صح 🫣',
    'والله حرام عليك يا {{playerName}}! السؤال سهل واجد بس إنت صعّبته على نفسك 😭',
    '{{playerName}} طاح! جدتي كانت بتجاوب هالسؤال صح بعيونها مسكرة 👵😂',
  ],

  // Wrong — streak was >= 3 before this wrong answer — dramatic roast
  wrong_streak_broken: [
    'انكسر الستريك يا {{playerName}}! 💔 كل هالنار انطفت بغلطة وحدة — يا مصيبة!',
    'يا ويلك يا {{playerName}}! كان عندك ستريك {{streak}} وخلصته بهالجواب المجنون 😂💀',
    'الستريك راح يا {{playerName}}! بنيت بُرج من النقاط وطحته بيدك 😱',
    'من بطل للأرض! يا {{playerName}} كان عندك {{streak}} ستريك — والحين؟ صفر كبير 😂🔥',
    '{{playerName}} طيّح نفسه! الستريك {{streak}} انتهى — هذي هي اللعبة يا ناس 💀',
    'الله المستعان يا {{playerName}}! ستريك {{streak}} بخّر في ثانية — تذكر هالموقف 😭😂',
    'يا فرحتنا كسرت ستريكه! {{playerName}} كان يطير والحين يحفر الأرض 🪦😂',
  ],

  // Timeout — time expired — roasting about being slow
  timeout: [
    '{{playerName}} ما جاوب بالوقت! 😂 شكلك تفكر في مستقبلك وإنت تحل السؤال',
    'الوقت خلص يا {{playerName}}! ترا اللعبة مو استراحة مريم — يلا سرّع 🐢💀',
    'وقت انتهى يا {{playerName}}! حتى السلحفاة كانت بتوصل قبلك 🐢😂',
    '{{playerName}} تجمّد! ثلاثة عشر ثانية ما كفّت؟ يا رب الصبر 😤',
    'ذهب الوقت يا {{playerName}}! اللي يأخذ وقته بالتفكير بيصير فيه كذا 😂⏰',
    '{{playerName}} نام وانت تلعب؟ الوقت راح وما جبت شي — قوم اغسل وييهك 😴',
    'ما أجاب {{playerName}}! شكله يحسب من أول — يلا بكره لا تتأخر 🕐😂',
  ],

  // Comeback — exciting commentary
  comeback: [
    '🔥 {{trailingName}} يلحق! الفارق {{delta}} نقطة فقط — {{leadingName}} ابدأ تعرق!',
    'رجعة قوية من {{trailingName}}! {{delta}} نقطة بس تفرقه عن {{leadingName}} — اللعبة مو خلصت!',
    'انتبه يا {{leadingName}}! {{trailingName}} يقترب بشكل خطير — {{delta}} نقطة وبس 😱',
    'الدراما بدت! {{trailingName}} يرجع من الميت ومافي الا {{delta}} نقطة لـ{{leadingName}} 🔥💀',
    '{{leadingName}} لا تستاهل! {{trailingName}} قادم بسرعة — {{delta}} نقطة فقط 💨🔥',
    'قلب اللعبة! {{trailingName}} ما رفع الراية البيضاء وها هو يقترب من {{leadingName}} بـ{{delta}} نقطة 🏳️❌',
    'الإثارة جاية! {{trailingName}} لحق و{{delta}} نقطة بس تفصله عن {{leadingName}} — هل يكمل؟ 😤',
  ],

  // Domination — leader way ahead
  domination: [
    '{{leadingName}} يحكم! 👑 بـ{{delta}} نقطة أمام {{trailingName}} — هذا مو لعب هذا تعذيب!',
    'الهيمنة الكاملة! {{leadingName}} بعيد {{delta}} نقطة عن {{trailingName}} — يا ساتر 😂',
    '{{trailingName}} تعبنا منك! {{leadingName}} أمامك بـ{{delta}} نقطة — متى تصحى؟ 😴',
    '{{leadingName}} يطحن الجميع! {{delta}} نقطة فارق و{{trailingName}} يشوف نجوم 😵',
    'يا ويل {{trailingName}}! {{leadingName}} أمامه بـ{{delta}} نقطة والفارق يكبر 📈💀',
    '{{leadingName}} على القمة! {{delta}} نقطة فارقة — {{trailingName}} اللي ما يستسلم يرفع يده 🙋😂',
    'هيمنة {{leadingName}} مستمرة! {{delta}} نقطة وكأنهم يلعبون لعبتين منفصلتين 🏆😂',
  ],

  // Sudden death — tension
  sudden_death: [
    '⚡ الشوط الأخير! الفارق ضئيل والقلوب تدق — كل سؤال بيقرر المصير!',
    'السكتة الدماغية وشيكة! النقاط متقاربة والأسئلة تخلص — تنفسوا بس لا تطقون 😤🔥',
    'اللحظة الفاصلة! كل إجابة ممكن تقلب الطاولة — يلا تركيز 💣',
    'الدم الحار والأعصاب الباردة! النقاط متعادلة تقريبًا واللعبة ما تغفر 😰',
    'هذا هو الوقت! كل سؤال بيحسم مصير اللاعبين — مو وقت تردد 🎯🔥',
    'قلوب تدق وعقول تشتعل! الفارق ضئيل واللعبة على وشك تنتهي — من بيتماسك؟ 😱',
    'الموت المباشر! نقطة أو نقطتين بتحسم كل شي — الله يعين اللاعبين 💀🔥',
  ],

  // Sabotage steal
  sabotage_steal: [
    '{{attackerName}} سرق نقاط {{victimName}}! 😈💰 يا خيانة الأصحاب!',
    'شفتوا؟ {{attackerName}} قلّب على {{victimName}} وأخذ ربعه 😂🔪',
    '{{attackerName}} لص بالنهار! سرق من {{victimName}} بعيون الجميع 💸😱',
    '{{victimName}} خسر نقاط وما دري! {{attackerName}} الخبيث سبقه 😅',
    'السرقة الكبرى! {{attackerName}} يحتفل بنقاط {{victimName}} — هذا وجع 😂',
    '{{attackerName}} ما عنده رحمة! سرق من {{victimName}} والكل شايف 🤣💰',
    'يا ساتر يا {{attackerName}}! نقاط {{victimName}} ما أمنت منك 😈',
  ],

  // Sabotage block deflected
  sabotage_block: [
    '🛡️ {{victimName}} حجب الهجوم! {{attackerName}} ضرب في الهوا 😂',
    'بلوك يا {{attackerName}}! {{victimName}} كان جاهز وطيّح خطتك 😤',
    '{{victimName}} عنده حصانة! {{attackerName}} حاول وخسر — يا خيبة الأمل 😂🚫',
    'انكسر السلاح! {{attackerName}} أرسل تخريبه ورجع عليه بالفارغ — {{victimName}} أذكى 😏',
    '{{attackerName}} صدم جدار! {{victimName}} كان محصّن والهجوم ارتد 🔰😂',
    'ما وصل! {{attackerName}} فكر إنه ذكي بس {{victimName}} أذكى 🛡️😂',
    'الدرع نشط! {{victimName}} كان مستعد لهجوم {{attackerName}} — التخطيط دفع 🔰👏',
  ],

  // Sabotage halve
  sabotage_halve: [
    '{{attackerName}} قسّم نقاط {{victimName}} على اثنين! 💔 يا قاسي يا قلبك حجر',
    'نص نقاط {{victimName}} راحت بسبب {{attackerName}} — قل الله يا {{victimName}} 😭',
    '{{attackerName}} شقّ نقاط {{victimName}} بالنص! وجع حقيقي هذا 😱',
    'الشق الكبير! {{attackerName}} خذ نص ما عند {{victimName}} — هذا تخريب حقيقي 💸',
    '{{victimName}} شاف نقاطه تتنصف! {{attackerName}} بلا رحمة 😤💔',
    'تنصيف مؤلم على {{victimName}} من {{attackerName}} — يا خسارة اللي اجتهد 😭',
    '{{attackerName}} حلاّل! نقاط {{victimName}} انحلت على نصين — بكاء بكاء 😂💀',
  ],

  // Sabotage bomb planted
  sabotage_bomb_set: [
    '💣 {{attackerName}} زرع قنبلة على {{victimName}}! إذا جاوب غلط الدنيا تشتعل',
    '{{victimName}} عليه قنبلة من {{attackerName}}! يلا اجاوب صح وإلا انفجر 🔥💣',
    'قنبلة موقوتة على {{victimName}}! {{attackerName}} بيستمتع بشوف الخوف 😈💣',
    '{{attackerName}} يلعب بالنار! زرع قنبلة عند {{victimName}} — الحرارة ترتفع 🌡️💣',
    '{{victimName}} الحين تحت ضغط القنبلة! {{attackerName}} نشط تخريبه — الله يعين 💣😱',
    'الميدان اشتعل! {{attackerName}} زرع قنبلة على {{victimName}} — اجاوب صح أو فقد كل شي 💣🔥',
    '{{victimName}} وقع في شرك {{attackerName}} والقنبلة تدق 💣⏱️',
  ],

  // Sabotage freeze applied
  sabotage_freeze: [
    '🧊 {{attackerName}} جمّد وقت {{victimName}}! 8 ثواني بس — يلا يسرع!',
    '{{victimName}} مجمّد! {{attackerName}} ما عنده رحمة — الثلج على المؤقت ❄️',
    'الجليد نشط على {{victimName}}! {{attackerName}} خسّس وقته — يا ويله 🥶',
    '{{attackerName}} برّد جو {{victimName}}! 8 ثواني وبس — اجاوب صح بالسرعة 🕐❄️',
    '{{victimName}} مو قادر يتنفس! {{attackerName}} جمّده وألحين الوقت يعدّ بسرعة ❄️😱',
    'تجميد تام على {{victimName}} من {{attackerName}}! ثماني ثواني — الله يجيب الصح 🧊',
    '{{attackerName}} اختار وقت {{victimName}} — ثمانية ثواني وما في تمديد 🥶😂',
  ],

  // Sabotage scramble applied
  sabotage_scramble: [
    '🔀 {{attackerName}} خلّط خيارات {{victimName}}! الصح فين يا بطل؟',
    '{{victimName}} دوّخته {{attackerName}}! الخيارات اختلطت والله يعين 😵‍💫',
    'فوضى الخيارات! {{attackerName}} خلّط على {{victimName}} — ركّز وإلا تطيح 😵',
    '{{victimName}} محتاج يفرّق الأجوبة! {{attackerName}} شوّش وشاف 😏🔀',
    '{{attackerName}} لعب بعقل {{victimName}}! الخيارات متقلبة — الله يعين اللي يقدر يركّز 😂',
    'خلط الأوراق! {{attackerName}} شوّش على {{victimName}} — مو وقت تتعب، ركّز 🔀😤',
    '{{victimName}} يحاول يرتب الخيارات! {{attackerName}} ضحك وشاف 😂🔀',
  ],

  // Sabotage double — won the bet
  sabotage_double_win: [
    '⚡ المراهنة ربحت! ضاعف نقاطه — المقامرة الذكية دفعت 🎰🔥',
    'رهان ناجح! الضعف تحقق — هذا الذكاء بعينه 😎⚡',
    'مراهنة ومكسب! نقاط مضاعفة على طبق من ذهب 🎯💰',
    'الرهان الكبير ربح! النقاط طارت لفوق — قرار صح في الوقت الصح 🔥🏆',
    'ضعّف نقاطه وكسب! اللي يجازف يكسب — هذا الدرس 🎲💪',
    'المراهنة جابت ثمرتها! نقاط ضاعفت وما خسر — بطل القرارات 😏⚡',
    'رهن نفسه وربح! الثقة بالنفس خلّت النقاط تتضاعف 🔥🎯',
  ],

  // Sabotage double — lost the bet
  sabotage_double_loss: [
    '💸 الرهان انقلب! جاوب غلط وخسر نقاط إضافية — يا حسرة اللي جازف!',
    'مراهنة خسرانة! الضعف صار خسارة مضاعفة 😂💀',
    'هههه! رهن نفسه وخسر — هذا اللي يجازف بدون دراسة 😭😂',
    'يا ويلك! الرهان طاح وفوق كذا خسر نقاط — موقف محرج 😅💸',
    'الرهان كذب! فكر بيربح وطاح — الثقة الزيادة أم الخسائر 😂',
    'المقامرة انكسرت! جاوب غلط والرهان أكله — ما أشد وجعه 😭💸',
    'من ضعف إلى خسارة! الرهان كان فاشل — يلا المرة الجاية فكّر 😂',
  ],

  // Sabotage mystery box opened
  sabotage_mystery: [
    '🎁 فتح الصندوق الغامض! الله يستر — أيش طلع؟',
    'المفاجأة كشفت! الصندوق السري مو دايمًا حلو 🎲😱',
    '🎁 يلا اكشف الغموض! ما أدرى مدري الصندوق يعطي أو ياخذ 😂',
    'صندوق المصير! كل ما فيه مفاجأة — يا ربح يا خسارة 🎁',
    'الغموض انكشف! المستقبل في الصندوق والصندوق قال كلامه 🎁🎲',
    'فتح الميسر الغامض! اللي طلع طلع — قدر ومكتوب 😂🎁',
    'الصندوق السري يتكلم! اللي يلعب بالصندوق مو عارف ايش يجي 🎁😤',
  ],

  // Sabotage was blocked by target's shield
  sabotage_blocked: [
    '🛡️ التخريب ارتد! الهدف عنده حصانة — ضرب في الحيط!',
    'الدرع أنقذه! ما وصل التخريب — الحصانة كانت نشطة 🔰',
    'محصّن ومحمي! التخريب ما قدر ياثّر — يلا حاول ثانية 🛡️😂',
    'الدرع يعمل! التخريب انكسر على باب الحصانة — ما في مدخل 🛡️😤',
    'محصّن! التخريب رجع فارغ — الحصانة أقوى من السلاح 🔰😂',
    'الحصانة أنقذته! التخريب ما حقق هدفه — يلا غيّر الخطة 🛡️',
    'جدار الحصانة صمد! التخريب ارتد بدون نتيجة — مو كل يوم جمعة 😂🛡️',
  ],

  // Team lead — team pulling ahead
  team_lead: [
    '{{teamName}} يشدّ! 🚀 يقودون بـ{{leadPts}} نقطة — الخصوم يشوفون ظهورهم',
    'فريق {{teamName}} على القمة! {{leadPts}} نقطة أمام الجميع — هل يثبتون؟ 🏆',
    '{{teamName}} يقود! {{leadPts}} نقطة فارقة — الفريق الثاني يحتاج معجزة 😤',
    'هيمنة {{teamName}}! {{leadPts}} نقطة تفرقهم عن الخصم — مو وقت استرخاء 💪',
    '{{teamName}} يرفعون الرأس! {{leadPts}} نقطة تفوق — يكملون؟ 🔝',
    'الفريق الرائد {{teamName}} بـ{{leadPts}} نقطة — الخصم يعدّ خياراته 😂',
    '{{teamName}} ما يوقفون! {{leadPts}} نقطة تقدّم والفريق الثاني يحاول يلحق 🔥',
  ],

  // Game over
  game_over: [
    '{{winnerName}} يفوز بـ{{score}} نقطة! 🏆 مبروك يا بطل — حتى أنا كنت أشجعك بالسر 😂',
    'انتهت اللعبة والفائز {{winnerName}} بـ{{score}} نقطة! ألف مبروك — الباقيين يبوّن عذر 😂🏆',
    '{{winnerName}} يطير بـ{{score}} نقطة! 🎉 هذا هو الفائز — تستاهل يا بطل!',
    'اللعبة خلصت! {{winnerName}} بـ{{score}} نقطة حصد الجائزة الكبرى — يلا المرة الجاية 🏆',
    '{{winnerName}} بـ{{score}} نقطة على القمة! مو هيّن هالفوز — واللي خسر ذاكر وتعال 😂👑',
    'تهانينا لـ{{winnerName}}! {{score}} نقطة وفوز مستحق — الجميع شهد الانتصار 🎊🏆',
    '{{winnerName}} كتب اسمه بـ{{score}} نقطة! بطل اليوم بلا منازع — المرة الجاية؟ نشوف 😏👑',
  ],
};

// ─── Tone filtering limits ────────────────────────────────────────────────────
// savage = all, hype = first ceil(n/2), chill = first 3

function getPool(messages: string[], tone: TonePreset): string[] {
  if (tone === 'chill') return messages.slice(0, 3);
  if (tone === 'hype')  return messages.slice(0, Math.ceil(messages.length / 2));
  return messages; // savage
}

// ─── Template substitution ───────────────────────────────────────────────────

function substitute(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

// ─── HostEngine class ─────────────────────────────────────────────────────────

export class HostEngine {
  private defaultTone: TonePreset = 'savage';
  /** Sliding window: category → last 4 picked indices */
  private history: Map<string, number[]> = new Map();
  private readonly WINDOW = 4;

  /** Anti-repetition aware pick */
  private pick(messages: string[], category: string): string {
    if (messages.length === 0) return '';
    const seen = this.history.get(category) ?? [];
    // Build candidate indices that were not recently used
    const candidates = messages
      .map((_, i) => i)
      .filter((i) => !seen.includes(i));
    // Fall back to all indices if all have been used
    const pool = candidates.length > 0 ? candidates : messages.map((_, i) => i);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    // Update window
    const updated = [...seen, chosen].slice(-this.WINDOW);
    this.history.set(category, updated);
    return messages[chosen];
  }

  setDefaultTone(tone: TonePreset): void {
    this.defaultTone = tone;
  }

  reset(): void {
    this.history.clear();
  }

  react(event: HostEvent, tone?: TonePreset): string {
    const t = tone ?? this.defaultTone;

    switch (event.type) {
      case 'game_start': {
        const bankKey = event.mode === 'ffa' ? 'game_start_ffa' : 'game_start_teams';
        const pool = getPool(BANKS[bankKey], t);
        const msg  = this.pick(pool, bankKey);
        return substitute(msg, { playerCount: event.playerCount });
      }

      case 'correct': {
        const isStreak = event.streak >= 3;
        const bankKey  = isStreak ? 'correct_streak' : 'correct_base';
        const pool     = getPool(BANKS[bankKey], t);
        const msg      = this.pick(pool, bankKey);
        return substitute(msg, {
          playerName: event.playerName,
          streak:     event.streak,
          teamColor:  event.teamColor ?? '',
          points:     event.points,
        });
      }

      case 'wrong': {
        const isStreakBroken = event.streak >= 3;
        const bankKey        = isStreakBroken ? 'wrong_streak_broken' : 'wrong_base';
        const pool           = getPool(BANKS[bankKey], t);
        const msg            = this.pick(pool, bankKey);
        return substitute(msg, {
          playerName: event.playerName,
          streak:     event.streak,
          teamColor:  event.teamColor ?? '',
        });
      }

      case 'timeout': {
        const pool = getPool(BANKS['timeout'], t);
        const msg  = this.pick(pool, 'timeout');
        return substitute(msg, {
          playerName: event.playerName,
          teamColor:  event.teamColor ?? '',
        });
      }

      case 'streak': {
        const pool = getPool(BANKS['correct_streak'], t);
        const msg  = this.pick(pool, 'correct_streak_explicit');
        return substitute(msg, {
          playerName: event.playerName,
          streak:     event.streak,
          teamColor:  event.teamColor ?? '',
        });
      }

      case 'comeback': {
        const pool = getPool(BANKS['comeback'], t);
        const msg  = this.pick(pool, 'comeback');
        return substitute(msg, {
          trailingName: event.trailingName,
          leadingName:  event.leadingName,
          delta:        event.delta,
        });
      }

      case 'domination': {
        const pool = getPool(BANKS['domination'], t);
        const msg  = this.pick(pool, 'domination');
        return substitute(msg, {
          leadingName:  event.leadingName,
          trailingName: event.trailingName,
          delta:        event.delta,
        });
      }

      case 'sudden_death': {
        const pool = getPool(BANKS['sudden_death'], t);
        const msg  = this.pick(pool, 'sudden_death');
        return substitute(msg, {
          score1: event.score1,
          score2: event.score2,
        });
      }

      case 'sabotage': {
        let bankKey: string;
        if (event.blocked) {
          bankKey = 'sabotage_blocked';
        } else {
          const typeMap: Record<string, string> = {
            steal:   'sabotage_steal',
            block:   'sabotage_block',
            halve:   'sabotage_halve',
            bomb:    'sabotage_bomb_set',
            freeze:  'sabotage_freeze',
            scramble:'sabotage_scramble',
            double:  'sabotage_double_win',
            mystery: 'sabotage_mystery',
          };
          bankKey = typeMap[event.sabotageType] ?? 'sabotage_mystery';
        }
        const pool = getPool(BANKS[bankKey] ?? BANKS['sabotage_mystery'], t);
        const msg  = this.pick(pool, bankKey);
        return substitute(msg, {
          attackerName: event.attackerName,
          victimName:   event.victimName,
        });
      }

      case 'team_lead': {
        const pool = getPool(BANKS['team_lead'], t);
        const msg  = this.pick(pool, 'team_lead');
        return substitute(msg, {
          teamName: event.teamName,
          leadPts:  event.leadPts,
        });
      }

      case 'game_over': {
        const pool = getPool(BANKS['game_over'], t);
        const msg  = this.pick(pool, 'game_over');
        return substitute(msg, {
          winnerName: event.winnerName,
          score:      event.score,
        });
      }

      default:
        return '';
    }
  }
}

export const hostEngine = new HostEngine();
