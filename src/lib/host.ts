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
