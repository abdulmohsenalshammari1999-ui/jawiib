// مرحبا - AI Host in Kuwaiti dialect
// Roasts winners and losers equally

const winnerRoasts = [
  'ماشاء الله عليك يا بطل! بس لا تنسى إن أمك هي اللي علمتك كل شي 😂',
  'يا سلام! ذكي ذكي... بس ليش ما تستخدم ذكاءك بشي ثاني غير اللعب؟ 🤣',
  'هههه واو صحيت! قلنا عبقري طلعت تحفظ بس 😜',
  'الله يبارك فيك! بس ترا الحظ لعب دور كبير لا تطيح بالغرور 🫢',
  'يا زين الجواب! بس ترا أخوك الصغير كان بيجاوب أسرع منك 💀',
  'برافو عليك! الحين روح علّم أهلك اللي ما يعرفون شي 😂',
  'تستاهل النقاط! بس المرة الجاية بتطيح طيحة ما تنساها 🔥',
  'ما شاء الله حافظ مو فاهم! بس يلا عطيناك الدرجة 😏',
  'أحسنت يا ذيب! بس لا تتفلسف علينا المرة الجاية 🐺',
  'صح لسانك! بس ترا حتى الساعة المعطلة تصيب مرتين باليوم 😂',
];

const loserRoasts = [
  'يا حسرة! هالسؤال حتى ياهل يعرف جوابه 😂',
  'لا حول ولا قوة! شكلك ما فطرت اليوم 🤣',
  'هههه والله إنك تضحك! روح ارجع المدرسة يا بعدي 💀',
  'يا قلبي عليك! ما تخاف ترا كل الناس تشوفك 😱',
  'أووه! شكلك تخبصت... يلا المرة الجاية إن شاء الله 🫣',
  'والله حرام عليك! السؤال سهل واجد بس إنت صعّبته على نفسك 😭',
  'لا تزعل بس ترا جدتي كانت بتجاوب صح 👵',
  'خلاص لا تفكر واجد... مخك بيعلق 🤯',
  'شكلك نايم وانت تلعب! قوم اغسل وييهك وتعال 😂',
  'يا خسارة النقاط! بس على الأقل ضحكتنا 🤡',
];

const streakMessages = [
  'الله الله! مسلسل صح! وين هالمخ كان مختبي؟ 🔥',
  'ثلاث صح ورا بعض! أقول ما غشيت؟ 🤨',
  'يا سلام سلسلة! شكلك فاتح جوجل بالسر 😂',
  'واااو ستريك! المنافسين يبون يطقون الشاشة 💥',
];

const sabotageMessages = {
  steal: [
    'يا خبيث سرقت نقاطه! هذي خيانة بالدم 💰',
    'شفتوا؟ هذا اللي يقولك أنا صديقك ويسرق نقاطك 😈',
  ],
  block: [
    'حجبته! والله إنك شرير يا ولد 🚫',
    'بلوك! كنه يلعب وياك وإنت تغلق عليه الباب 😂',
  ],
  halve: [
    'نص نقاطه راحت! يا قاسي يا قلبك حجر 💔',
    'قسمتها على اثنين! ألحين يبي يبكي 😭',
  ],
  bomb: [
    'زرع قنبلة! إذا جاوب غلط الدنيا تشتعل 💣💥',
    'ترا القنبلة ما ترحم! اجاوب صح وإلا انفجرت 🔥',
  ],
  freeze: [
    'جمّد وقته! 8 ثواني بس — يلا يسرع 🧊',
    'ثلج على المؤقت! ويش تسوي بكذا وقت؟ ❄️',
  ],
  scramble: [
    'خلط خياراته! الصح فين يا بطل؟ 🔀',
    'بعد الخلط الله يعين — ركّز 😵‍💫',
  ],
  double: [
    'راهن على نفسه! إذا صح يربح ضعف، إذا غلط يبكي 😬⚡',
    'الرهان الكبير! يا فوز يا هوز 🎲',
  ],
  mystery: [
    'فتح الصندوق الغامض! الله يستر ويعطيه الزين 🎁',
    'مفاجأة! إيش فيها؟ يا ربح يا خسارة 🎲',
  ],
};

const welcomeMessages = [
  'يا هلا والله! أنا مرحبا، مقدم اللعبة اللي بيخلي دماغكم يشتغل! يلا نبدي؟ 🎮',
  'أهلين وسهلين! استعدوا لأسئلة بتخلي عقولكم تطق! 🧠💥',
  'حياكم الله في جاوب! اللي يخسر ما يزعل واللي يفوز لا يتفلسف! يلا بسم الله 🏆',
];

const gameOverMessages = {
  winner: [
    'مبروووك يا بطل! فزت! بس ترا ما بتاخذ شي غير الفخر 😂🏆',
    'ألف مبروك! فزت اللعبة! ألحين روح فز بالحياة 🎉',
    'يا سلام عليك يا مبدع! بس لا تنسى إن الجاي أصعب 😏',
  ],
  loser: [
    'ما يخالف يا قلبي! المرة الجاية إن شاء الله... أو لا 😂',
    'خسرت! بس على الأقل ضحكتنا وهذا أهم شي 🤣',
    'يلا عادي، مو كل مرة تسلم الجرة! روح ذاكر وتعال 📚',
  ],
};

const idleMessages = [
  'يلا اختاروا سؤال! مو وقت نوم 😴',
  'شفيكم واقفين؟ يلا حركة! ⚡',
  'ترا الوقت يمشي وإنتو قاعدين تفكرون! 🕐',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getWelcomeMessage(): string {
  return randomFrom(welcomeMessages);
}

export function getWinnerRoast(): string {
  return randomFrom(winnerRoasts);
}

export function getLoserRoast(): string {
  return randomFrom(loserRoasts);
}

export function getStreakMessage(): string {
  return randomFrom(streakMessages);
}

export function getSabotageMessage(type: keyof typeof sabotageMessages): string {
  return randomFrom(sabotageMessages[type] ?? sabotageMessages.steal);
}

export function getBombExplosionMessage(): string {
  return randomFrom(['القنبلة انفجرت! 💥 نقاط راحت!', 'بووووم! الخسارة مؤلمة 💣']);
}

export function getDoubleWinMessage(): string {
  return randomFrom(['ضاعف نقاطه! ذكي واللي جاوب! ⚡🔥', 'رهان ربحه! المقامرة اشتغلت! 🎰']);
}

export function getDoubleLossMessage(): string {
  return randomFrom(['خسر الرهان 😂 يا خسارة ما تعلّم!', 'الرهان انقلب عليه! 💸']);
}

export function getMysteryMessage(msg: string): string {
  return msg;
}

export function getImmunityMessage(): string {
  return randomFrom(['محصّن! ما يأثّر فيه التخريب الحين 🛡️', 'حصانة نشطة — ما تقدر تضره 🔰']);
}

export function getEarnedSabotageMessage(type: string): string {
  return `كسبت تخريب جديد: ${type}! 🎁`;
}

export function getGameOverMessage(isWinner: boolean): string {
  return randomFrom(isWinner ? gameOverMessages.winner : gameOverMessages.loser);
}

export function getIdleMessage(): string {
  return randomFrom(idleMessages);
}

export function getMysteryBoxMessage(): string {
  return randomFrom([
    'ثلاثة صح ورا بعض! يستاهلون صندوق الغموض! 🎁',
    'سلسلة ذهبية! الصندوق يفتح — الله يستر إيش فيه 🎲',
    'ماشاء الله! سلسلة صح = صندوق أسلحة! 🏆',
  ]);
}

export function getWeaponEarnedMessage(weapon: string): string {
  const names: Record<string, string> = {
    timer_bomb:      'قنبلة الوقت 💣',
    immunity:        'درع الحصانة 🛡️',
    forced_category: 'فرض الفئة 🎯',
    ask_friend:      'اتصل بصديق 📞',
    extra_time:      'وقت إضافي ⏱️',
  };
  return `كسبتم سلاح: ${names[weapon] ?? weapon}! استخدموه بحكمة 😈`;
}

export function getWeaponUsedTimerBomb(): string {
  return randomFrom([
    'قنبلة الوقت انطلقت! وقت الخصم نص! ⏱️💣',
    'تكتك... الخصم بيجاوب بنص الوقت! 💥',
  ]);
}

export function getWeaponUsedImmunity(): string {
  return randomFrom([
    'الحصانة نشطة! إذا غلطتوا المرة الجاية ما راح تخسرون شي 🛡️',
    'درع الحماية جاهز! سؤال مضمون بدون خسارة 🔰',
  ]);
}

export function getWeaponUsedForcedCategory(catName: string): string {
  return `فرضتوا على الخصم: ${catName}! لازم يجاوب منها 🎯`;
}

export function getWeaponUsedAskFriend(): string {
  return randomFrom([
    'اتصلوا بصديق! +25 ثانية على الوقت 📞⏱️',
    'صديق المشوار! الوقت زاد — استخدموه صح 🤝',
  ]);
}

export function getWeaponUsedExtraTime(): string {
  return randomFrom([
    'تمديد الوقت! عندكم فرصة ذهبية ⏱️✨',
    '+15 ثانية! استخدموها بحكمة 🕐💛',
  ]);
}

export function getStealPhaseMessage(teamName: string): string {
  return randomFrom([
    `فرصة السرقة! ${teamName} عندهم 30 ثانية يجاوبون! 🎯⚡`,
    `${teamName} يحاولون يسرقون النقاط — يلا اجاوبوا صح! 🏴‍☠️`,
    `السرقة المشروعة! ${teamName} الفرصة جاءتكم! 👀`,
  ]);
}

export function getStealSuccessMessage(teamName: string): string {
  return randomFrom([
    `سرقة ناجحة! ${teamName} خطفوا النقاط 🎉💰`,
    `${teamName} اجابوا صح وسرقوا السؤال! 🏴‍☠️✅`,
  ]);
}

export function getStealFailMessage(): string {
  return randomFrom([
    'انتهت فرصة السرقة — السؤال بلا نقاط! 💀',
    'الاثنين غلطوا — السؤال يمشي بدون نقاط 😅',
  ]);
}

export function getImmunityProtectedMessage(): string {
  return randomFrom([
    'الحصانة أنقذتكم! الغلطة راحت بدون عقوبة 🛡️✨',
    'درع الحماية شتغل! ما خسرتوا شي 🔰',
  ]);
}

export function getForcedCategoryActiveMessage(catName: string): string {
  return `تحذير: الخصم فرض عليكم فئة "${catName}" — لازم تختارون منها! 🎯`;
}

export function getFinalQuestionMessage(): string {
  return randomFrom([
    'الآن أو لا! 🔥 هذا آخر سؤال والتاريخ بيُكتب الحين!',
    'السؤال الأخير! 💀 كل شي بيتقرر — بدّ الله يا ناس!',
    'الساعة الحاسمة! ⚡ آخر سؤال والنتيجة على الكف!',
    'النهاية جاءت! 🏆 من بيثبّت قدمه في اللحظة الأخيرة؟',
  ]);
}

export function getLastStandMessage(): string {
  return randomFrom([
    '🛡️ صمود أخير! الفريق يراهن كل شي — إذا صح 3 أضعاف!',
    '💪 آخر رصاصة نشطة! اجاوبوا صح واقلبوا الطاولة!',
    '🃏 الورقة الأخيرة! 3 أضعاف على المحك — يلا بقلب جريء!',
  ]);
}

export function getBahrCelebrationMessage(): string {
  return randomFrom([
    'فريق البحر يهدر! 🌊 أبناء الغوص والتجارة ما يعرفون الخسارة!',
    'البحر يلمع! 💎 مثل اللؤلؤ في الأعماق — نادر وثمين!',
    'أبناء البحر! 🌊 رجال الموج والرياح والنجوم — ما ييخافون!',
  ]);
}

export function getBurCelebrationMessage(): string {
  return randomFrom([
    'فريق البر يثور! 🐪 أبناء القوافل ما في طريق يوقفهم!',
    'البر يصرخ! 🦅 مثل الصقر فوق الرمال — حاد وسريع!',
    'أبناء البر! 🐪 رجال الصحراء والضيافة — كلامهم أقوى من الصخر!',
  ]);
}

export function getStreakHypeMessage(streak: number): string {
  if (streak >= 5) return randomFrom([
    `👑 سلسلة ذهبية ${streak}! هذا مو إنسان هذا أسطورة!`,
    `🔥×${streak} الصواريخ بلا توقف! المنافسين ابتكروا عذر جاهز 😂`,
  ]);
  if (streak >= 4) return randomFrom([
    `💥 أربعة متتالية! الفريق المقابل يعيد حساباته 😤`,
    `🔥🔥🔥🔥 ستريك ${streak}! وين هالعقل كان مختبي؟`,
  ]);
  return randomFrom([
    `🔥 ثلاثة صح! شوفوا — عندهم نار الحين! 🏆`,
    `ستريك ${streak}! المنافسين يبون يطقون الشاشة 💥`,
  ]);
}
