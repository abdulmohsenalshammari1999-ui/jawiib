"""
Build Jawib How to Play PDF (13 slides, widescreen 13.33×7.5 in)
"""
import os
from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color

# Page size (matches PowerPoint widescreen)
W = 13.33 * inch
H = 7.5  * inch

# ── Palette ──────────────────────────────────────────────────────────────────
BG       = HexColor('#F4EED8')   # desert sand
SURFACE  = HexColor('#FBF8EE')   # pearl white
CARD     = HexColor('#FFFFFF')
BORDER   = HexColor('#C9A87A')   # camel leather
GOLD     = HexColor('#B07D1A')   # gahwa gold
GOLD_L   = HexColor('#D4A94A')   # light gold
TEXT     = HexColor('#1A1208')   # dark coffee
DIM      = HexColor('#7A6040')   # muted sand
GREEN    = HexColor('#1A7A42')
RED      = HexColor('#B82118')
BLUE     = HexColor('#1A5FA8')
PURPLE   = HexColor('#6B4CAA')
WHITE    = HexColor('#FFFFFF')
BLACK    = HexColor('#000000')

TIER_COLORS = {
    100: HexColor('#15803D'),
    200: HexColor('#0369A1'),
    300: HexColor('#C8880A'),
    400: HexColor('#B45309'),
    500: HexColor('#B91C1C'),
    600: HexColor('#6D28D9'),
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def fill_bg(c, color=None):
    c.setFillColor(color or BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)

def draw_rect(c, x, y, w, h, fill=None, stroke=None, lw=1):
    if fill:
        c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(lw)
    c.rect(x, y, w, h,
           fill=1 if fill else 0,
           stroke=1 if stroke else 0)

def gold_bar(c, y=None, x=0.35*inch, width=None):
    if y is None: y = H - 0.68*inch
    if width is None: width = W - 0.7*inch
    c.setFillColor(GOLD)
    c.rect(x, y, width, 2, fill=1, stroke=0)

def section_label(c, text, color=GOLD):
    c.setFillColor(color)
    c.setFont('Helvetica-Bold', 7)
    c.drawString(0.35*inch, H - 0.3*inch, text.upper())

def slide_num(c, n, total=13):
    c.setFillColor(DIM)
    c.setFont('Helvetica', 7)
    c.drawRightString(W - 0.25*inch, 0.2*inch, f'{n} / {total}')

def card(c, x, y, w, h, fill=CARD, border=BORDER, lw=1.5):
    c.setFillColor(fill)
    c.setStrokeColor(border)
    c.setLineWidth(lw)
    c.rect(x, y, w, h, fill=1, stroke=1)

def txt(c, text, x, y, size=11, color=TEXT, font='Helvetica', align='left'):
    c.setFillColor(color)
    c.setFont(font, size)
    if align == 'left':
        c.drawString(x, y, text)
    elif align == 'right':
        c.drawRightString(x, y, text)
    elif align == 'center':
        c.drawCentredString(x, y, text)

def bold(c, text, x, y, size=11, color=TEXT, align='left'):
    txt(c, text, x, y, size, color, 'Helvetica-Bold', align)

def wrapped(c, text, x, y, max_w, size=10, color=TEXT, line_h=14, font='Helvetica'):
    """Very simple word-wrap."""
    c.setFillColor(color)
    c.setFont(font, size)
    words = text.split()
    line = ''
    cur_y = y
    for w in words:
        test = (line + ' ' + w).strip()
        if c.stringWidth(test, font, size) <= max_w:
            line = test
        else:
            if line:
                c.drawString(x, cur_y, line)
                cur_y -= line_h
            line = w
    if line:
        c.drawString(x, cur_y, line)

def sadu_bar(c, y, x=0, width=None, h=6):
    """Decorative striped sadu bar."""
    if width is None: width = W
    colors_list = [GOLD, BORDER, GOLD_L, TEXT, GOLD, BORDER]
    seg = width / len(colors_list)
    for i, col in enumerate(colors_list):
        c.setFillColor(col)
        c.rect(x + i*seg, y, seg, h, fill=1, stroke=0)

# ── SLIDES ────────────────────────────────────────────────────────────────────

def slide_01_title(c):
    fill_bg(c, BG)
    sadu_bar(c, H - 8)

    # Decorative circles
    c.setFillColor(Color(0.1, 0.37, 0.66, alpha=0.06))
    c.circle(1.2*inch, 2*inch, 2.2*inch, fill=1, stroke=0)
    c.setFillColor(Color(0.72, 0.13, 0.09, alpha=0.05))
    c.circle(12*inch, 6*inch, 1.8*inch, fill=1, stroke=0)
    c.setFillColor(Color(0.42, 0.30, 0.67, alpha=0.05))
    c.circle(6.5*inch, 0.6*inch, 1.4*inch, fill=1, stroke=0)

    # Big Arabic title
    bold(c, 'JAWIB', W/2, H - 2.2*inch, 80, GOLD, 'center')
    bold(c, 'How to Play', W/2, H - 3.1*inch, 30, TEXT, 'center')
    txt(c, 'The Gulf Knowledge Game  |  لعبة المعرفة الخليجية', W/2, H - 3.75*inch, 15, DIM, align='center')

    # Stat pills
    stats = [('456', 'Questions'), ('22', 'Categories'), ('5', 'Weapons'), ('🏴', 'Steal')]
    px = 3.2*inch
    for s in stats:
        card(c, px, H-5.0*inch, 1.55*inch, 0.65*inch, fill=SURFACE, border=BORDER)
        bold(c, s[0], px + 0.775*inch, H - 4.52*inch, 16, GOLD, 'center')
        txt(c, s[1], px + 0.775*inch, H - 4.75*inch, 8, DIM, align='center')
        px += 1.72*inch

    sadu_bar(c, 0)
    bold(c, '🏆  دليل اللعب  •  Player Guide  🏆', W/2, 0.18*inch, 10, CARD, 'center')
    slide_num(c, 1)

def slide_02_what_is(c):
    fill_bg(c)
    section_label(c, 'WHAT IS JAWIB?')
    gold_bar(c)
    bold(c, '🧠  What is Jawib?  |  ما هو جاويب؟', W/2, H - 1.05*inch, 22, TEXT, 'center')

    # Left card — English
    card(c, 0.35*inch, 0.5*inch, 5.9*inch, 5.6*inch, border=BLUE)
    bold(c, 'How it works:', 0.55*inch, H - 1.85*inch, 12, BLUE)
    lines_en = [
        '• A team trivia battle for 2–8 players.',
        '• Draft categories from 22 topics.',
        '• Two teams alternate picking questions',
        '  from a 100–600 point board.',
        '• Answer correctly to earn points.',
        '• Wrong? The other team STEALS!',
        '• Deploy weapons to turn the tide.',
        '• Most points when board clears wins.',
    ]
    y = H - 2.22*inch
    for l in lines_en:
        txt(c, l, 0.55*inch, y, 10, TEXT)
        y -= 0.36*inch

    # Right card — Arabic
    card(c, 7.08*inch, 0.5*inch, 5.9*inch, 5.6*inch, border=RED)
    bold(c, 'كيف تعمل اللعبة:', W - 0.55*inch, H - 1.85*inch, 12, RED, 'right')
    lines_ar = [
        '• لعبة معلومات فريق للاعبين.',
        '• اختر فئاتك من 22 موضوعاً.',
        '• فريقان يتناوبان على لوحة',
        '  نقاط 100–600.',
        '• أجب صح تكسب النقاط.',
        '• غلطت؟ الفريق الثاني يسرق!',
        '• استخدم أسلحتك لتقلب الموازين.',
        '• الأكثر نقاطاً يفوز.',
    ]
    y = H - 2.22*inch
    for l in lines_ar:
        txt(c, l, W - 0.55*inch, y, 10, TEXT, align='right')
        y -= 0.36*inch

    bold(c, 'VS', W/2, H/2 - 0.1*inch, 28, GOLD, 'center')
    slide_num(c, 2)

def slide_03_teams(c):
    fill_bg(c)
    section_label(c, 'TEAMS SETUP')
    gold_bar(c)
    bold(c, '👥  Teams  |  الفريقان', W/2, H - 1.05*inch, 22, TEXT, 'center')

    # Alpha
    card(c, 0.35*inch, 0.5*inch, 5.9*inch, 5.6*inch, border=BLUE)
    bold(c, '🌊  Team Alpha  —  فريق البحر', 0.55*inch, H - 1.82*inch, 13, BLUE)
    for i, l in enumerate([
        '🔵  Hosts the game on their device',
        '🔵  Always plays first',
        '🔵  Blue colour throughout the UI',
        '🔵  1–4 players per team',
        '🔵  يبدؤون أول جولة دائماً',
    ]):
        txt(c, l, 0.65*inch, H - 2.28*inch - i*0.42*inch, 11, TEXT)

    # Beta
    card(c, 7.08*inch, 0.5*inch, 5.9*inch, 5.6*inch, border=RED)
    bold(c, '🌿  Team Beta  —  فريق البر', 7.28*inch, H - 1.82*inch, 13, RED)
    for i, l in enumerate([
        '🔴  Plays on the same shared device',
        '🔴  Responds after Team Alpha\'s turn',
        '🔴  Red colour throughout the UI',
        '🔴  1–4 players per team',
        '🔴  يلعبون في دورهم بعد البحر',
    ]):
        txt(c, l, 7.28*inch, H - 2.28*inch - i*0.42*inch, 11, TEXT)

    bold(c, 'VS', W/2, H/2 - 0.1*inch, 28, GOLD, 'center')
    slide_num(c, 3)

def slide_04_draft(c):
    fill_bg(c)
    section_label(c, 'CATEGORY DRAFT')
    gold_bar(c)
    bold(c, '🗂️  Category Draft  |  سحب الفئات', W/2, H - 1.05*inch, 22, TEXT, 'center')

    steps = [
        ('1', BLUE, 'Team Alpha picks first', 'البحر يختار أولاً'),
        ('2', RED,  'Team Beta picks',        'البر يختار'),
        ('3', RED,  'Beta picks again',       'البر يختار مجدداً'),
        ('4', BLUE, 'Alpha picks last',       'البحر يختار أخيراً'),
    ]
    bw = 2.8*inch; bh = 3.3*inch; gap = 0.32*inch
    x0 = 0.35*inch
    for i, (num, col, en, ar) in enumerate(steps):
        lx = x0 + i*(bw+gap)
        card(c, lx, H - 4.6*inch, bw, bh, border=col, fill=SURFACE)
        bold(c, num, lx+0.18*inch, H - 2.05*inch, 36, col)
        bold(c, en, lx+0.18*inch, H - 2.72*inch, 12, TEXT)
        bold(c, ar, lx+0.18*inch, H - 3.08*inch, 11, col)

    # Result box
    card(c, 0.35*inch, 0.32*inch, W - 0.7*inch, 1.5*inch, fill=HexColor('#FFF8E8'), border=GOLD)
    bold(c, '✅  Result:', 0.55*inch, 1.45*inch, 12, GOLD)
    txt(c, 'Each team selects 3–4 categories. These are the ONLY categories on your board — choose what your team knows!',
        0.55*inch, 1.10*inch, 10, TEXT)
    txt(c, 'كل فريق يختار 3–4 فئات. هذه هي الفئات الوحيدة على لوحتك — اختر ما يُتقنه فريقك!',
        W - 0.55*inch, 0.70*inch, 10, DIM, align='right')
    slide_num(c, 4)

def slide_05_board(c):
    fill_bg(c)
    section_label(c, 'THE GAME BOARD')
    gold_bar(c)
    bold(c, '🎮  The Game Board  |  لوحة اللعب', W/2, H - 1.05*inch, 22, TEXT, 'center')

    tiers = [100,200,300,400,500,600]
    cats  = ['📚 Culture','⚽ Sport','📜 History','🕌 Quran','🐪 Gulf','🔭 Science','🗺️ Geo','🥘 Food']
    cw = 1.52*inch; ch = 0.57*inch; cat_w = 1.1*inch
    bx = 1.6*inch; by = H - 1.72*inch

    # Tier headers
    for ci, tier in enumerate(tiers):
        col = TIER_COLORS[tier]
        c.setFillColor(col)
        c.rect(bx + ci*cw, by, cw-2, ch-2, fill=1, stroke=0)
        bold(c, str(tier), bx + ci*cw + cw/2, by+0.16*inch, 12, WHITE, 'center')

    for ri, cat in enumerate(cats):
        ry = by - (ri+1)*ch
        txt(c, cat, bx - 0.1*inch, ry+0.18*inch, 8, DIM, align='right')
        for ci, tier in enumerate(tiers):
            answered = (ri+ci) % 5 == 0
            bg = HexColor('#E8E0D0') if answered else CARD
            border = DIM if answered else TIER_COLORS[tier]
            c.setFillColor(bg); c.setStrokeColor(border); c.setLineWidth(1)
            c.rect(bx+ci*cw+1, ry+1, cw-3, ch-3, fill=1, stroke=1)
            label = '✓' if answered else str(tier)
            col2  = DIM if answered else TIER_COLORS[tier]
            txt(c, label, bx+ci*cw+cw/2, ry+0.16*inch, 9, col2, align='center')

    txt(c, '← 6 difficulty tiers  |  8 categories →  |  48 total cells',
        W/2, 0.35*inch, 9, DIM, align='center')
    slide_num(c, 5)

def slide_06_flow(c):
    fill_bg(c)
    section_label(c, 'QUESTION FLOW')
    gold_bar(c)
    bold(c, '❓  Question Flow  |  سير الجولة', W/2, H - 1.05*inch, 22, TEXT, 'center')

    flow = [
        ('🎯', BLUE,    'Pick a cell',      'اختر خانة'),
        ('❓', PURPLE,  'Question appears', 'يظهر السؤال'),
        ('⏱️',HexColor('#D97706'),'30 sec timer','عداد 30 ثانية'),
        ('✅', GREEN,   'Correct! Earn pts','صح! اكسب نقاط'),
        ('🔄', GOLD,    'Turn passes',      'الدور يمر'),
    ]
    bw=2.1*inch; bh=2.75*inch; gap=0.13*inch
    top=H-4.2*inch
    for i,(ico,col,en,ar) in enumerate(flow):
        lx=0.35*inch+i*(bw+gap)
        card(c,lx,top,bw,bh,border=col,fill=SURFACE)
        txt(c,ico,lx+0.12*inch,top+bh-0.48*inch,22,col)
        bold(c,en,lx+0.12*inch,top+bh-0.88*inch,10,col)
        txt(c,ar,lx+bw-0.12*inch,top+bh-1.22*inch,10,DIM,align='right')
        if i<4:
            bold(c,'→',lx+bw+0.02*inch,top+bh/2-0.08*inch,14,GOLD,'center')

    bold(c,'❌  Wrong / Timeout  →  STEAL phase opens for the other team!',
         W/2, H-4.45*inch, 11, RED, 'center')

    wrong = [
        ('❌',RED,  'Wrong/timeout','خطأ أو انتهى الوقت'),
        ('⚡',HexColor('#D97706'),'Steal: 30 sec','سرقة: 30 ثانية'),
        ('🏆',GREEN,'Steal correct','السرقة صح'),
        ('💨',DIM,  'Steal wrong — no pts','السرقة خطأ'),
    ]
    bw2=2.8*inch; bh2=2.0*inch; top2=0.4*inch
    for i,(ico,col,en,ar) in enumerate(wrong):
        lx=0.35*inch+i*(bw2+0.15*inch)
        card(c,lx,top2,bw2,bh2,border=col,fill=SURFACE)
        txt(c,ico,lx+0.12*inch,top2+bh2-0.4*inch,18,col)
        bold(c,en,lx+0.12*inch,top2+bh2-0.7*inch,10,col)
        txt(c,ar,lx+bw2-0.12*inch,top2+0.22*inch,10,DIM,align='right')

    slide_num(c,6)

def slide_07_tiers(c):
    fill_bg(c)
    section_label(c,'POINT TIERS')
    gold_bar(c)
    bold(c,'💰  Point Tiers  |  درجات النقاط', W/2, H-1.05*inch, 22, TEXT, 'center')

    rows=[
        (100,'🟢','Easiest','مبتدئ','Straightforward facts — warm up here.','أسئلة مباشرة — سخّن فريقك.'),
        (200,'🔵','Easy','سهل','Common knowledge, a step up.','معلومات شائعة.'),
        (300,'🟡','Medium','متوسط','Requires some thought.','تحتاج تفكيراً.'),
        (400,'🟠','Hard','صعب','Specialist knowledge, high reward.','معلومات متخصصة.'),
        (500,'🔴','Expert','خبير','Tricky — dangerous if wrong.','خادعة — خطيرة إذا أخطأت.'),
        (600,'🟣','Legend','أسطوري','Maximum points, maximum difficulty!','أقصى نقاط، أقصى صعوبة!'),
    ]
    row_h=0.83*inch; top=H-1.72*inch; lw2=0.4*inch; rw2=6.0*inch; gap2=0.33*inch
    for i,(pts,dot,en_d,ar_d,en_t,ar_t) in enumerate(rows):
        col=TIER_COLORS[pts]; ry=top-i*row_h
        # Left half
        card(c,0.35*inch,ry,rw2,row_h-4,border=col,fill=SURFACE)
        c.setFillColor(col); c.rect(0.35*inch,ry,lw2,row_h-4,fill=1,stroke=0)
        bold(c,str(pts),0.35*inch+lw2+0.12*inch,ry+0.28*inch,16,col)
        bold(c,en_d,0.35*inch+lw2+1.0*inch,ry+0.5*inch,12,TEXT)
        txt(c,en_t,0.35*inch+lw2+2.2*inch,ry+0.3*inch,9,DIM)
        # Right half
        rx=0.35*inch+rw2+gap2
        card(c,rx,ry,rw2,row_h-4,border=col,fill=SURFACE)
        c.setFillColor(col); c.rect(rx,ry,lw2,row_h-4,fill=1,stroke=0)
        bold(c,ar_d,rx+lw2+0.15*inch,ry+0.5*inch,12,col)
        txt(c,ar_t,W-0.55*inch,ry+0.3*inch,9,DIM,align='right')

    bold(c,'⚡ Last Stand: losing by ≥400 pts? Get 3× multiplier (once per game)!  |  !متأخر بـ 400؟ ×3 مضاعف',
         W/2,0.22*inch,10,HexColor('#D97706'),'center')
    slide_num(c,7)

def slide_08_scoring(c):
    fill_bg(c)
    section_label(c,'SCORING SYSTEM')
    gold_bar(c)
    bold(c,'🧮  Scoring  |  نظام النقاط', W/2, H-1.05*inch, 22, TEXT, 'center')

    rows=[
        ('Base Points','النقاط الأساسية','Cell value 100–600','قيمة الخانة 100–600',GOLD),
        ('Time Bonus','مكافأة الوقت','+10 pts per second remaining','+10 نقطة لكل ثانية متبقية',GREEN),
        ('Streak Bonus','مكافأة التتالي','3 correct in a row → +25%','3 صح متتالية → +25%',PURPLE),
        ('Last Stand','الوقفة الأخيرة','Trailing by ≥400 → 3× (once)','متأخر بـ 400+ → ×3 لمرة واحدة',HexColor('#D97706')),
        ('Steal','السرقة','Wrong answer → opponent earns full pts','خطأ → الخصم يكسب كامل النقاط',RED),
        ('Immunity','الحصانة','Weapon: no point loss on wrong answer','سلاح: لا خسارة نقاط عند الخطأ',BLUE),
    ]
    row_h=0.82*inch; top=H-1.72*inch; fw=W-0.7*inch; lw3=0.35*inch
    for i,(en_n,ar_n,en_v,ar_v,col) in enumerate(rows):
        ry=top-i*row_h
        card(c,0.35*inch,ry,fw,row_h-4,border=col,fill=SURFACE)
        c.setFillColor(col); c.rect(0.35*inch,ry,lw3,row_h-4,fill=1,stroke=0)
        bold(c,en_n,0.35*inch+lw3+0.15*inch,ry+0.46*inch,11,col)
        txt(c,ar_n,0.35*inch+lw3+0.15*inch,ry+0.22*inch,10,DIM)
        txt(c,en_v,0.35*inch+lw3+2.2*inch,ry+0.46*inch,10,TEXT)
        txt(c,ar_v,W-0.55*inch,ry+0.46*inch,10,DIM,align='right')

    bold(c,'Final Score = (Base + Time Bonus) × Streak × Last Stand Multiplier',
         W/2,0.22*inch,11,GOLD,'center')
    slide_num(c,8)

def slide_09_weapons(c):
    fill_bg(c)
    section_label(c,'WEAPONS SYSTEM')
    gold_bar(c)
    bold(c,'⚔️  Weapons  |  الأسلحة', W/2, H-1.05*inch, 22, TEXT, 'center')

    weapons=[
        ('💣','Timer Bomb','قنبلة الوقت',RED,
         "Halves the opponent's timer on their next question.",
         'يقطع وقت الخصم إلى النصف على سؤاله الجاي.'),
        ('🛡️','Immunity','حصانة',BLUE,
         'If your team answers wrong once, you lose no points.',
         'إذا أجاب فريقك خطأ، لا تخسرون نقاطاً.'),
        ('🎯','Force Cat.','فرض الفئة',PURPLE,
         "Force opponent's next question from a category you choose.",
         'اجبر الخصم على الإجابة من فئة تختارها.'),
        ('📞','Ask Friend','اتصل بصديق',GREEN,
         '+25 extra seconds on your current question.',
         '+25 ثانية إضافية على سؤالك الحالي.'),
        ('⏱️','Extra Time','وقت إضافي',HexColor('#D97706'),
         '+15 seconds added to your current question timer.',
         '+15 ثانية على عداد سؤالك الحالي.'),
    ]
    bw=2.3*inch; bh=5.1*inch; top=H-6.85*inch; gap=0.21*inch
    for i,(ico,en_n,ar_n,col,en_h,ar_h) in enumerate(weapons):
        lx=0.35*inch+i*(bw+gap)
        card(c,lx,top,bw,bh,border=col,fill=SURFACE)
        txt(c,ico,lx+0.14*inch,top+bh-0.52*inch,26,col)
        bold(c,en_n,lx+0.14*inch,top+bh-0.92*inch,11,col)
        bold(c,ar_n,lx+bw-0.14*inch,top+bh-1.28*inch,11,WHITE if col==RED else col,align='right')
        wrapped(c,en_h,lx+0.14*inch,top+bh-1.68*inch,bw-0.28*inch,9,TEXT,13)
        wrapped(c,ar_h,lx+0.14*inch,top+0.35*inch,bw-0.28*inch,9,DIM,13)

    txt(c,'💡  Weapons are earned as you play. Each can be used once!  |  كل سلاح يُستخدم مرة واحدة فقط',
        W/2,0.22*inch,10,GOLD,align='center')
    slide_num(c,9)

def slide_10_steal(c):
    fill_bg(c)
    section_label(c,'THE STEAL')
    gold_bar(c)
    bold(c,'🏴‍☠️  The Steal  |  السرقة', W/2, H-1.05*inch, 22, TEXT, 'center')

    card(c,0.35*inch,0.5*inch,5.9*inch,5.6*inch,border=RED,fill=SURFACE)
    bold(c,'How the Steal Works',0.55*inch,H-1.82*inch,13,RED)
    for i,l in enumerate([
        '1. Active team answers WRONG or times out.',
        '2. The OTHER team gets 30 seconds to steal.',
        '3. Same question — fresh options, no hints.',
        '4. Steal CORRECT → earn the FULL point value.',
        '5. Steal WRONG → nobody gets the points.',
        '6. Either way, cell is done. Turn moves on.',
    ]):
        txt(c,l,0.65*inch,H-2.28*inch-i*0.44*inch,10.5,TEXT)

    card(c,7.08*inch,0.5*inch,5.9*inch,5.6*inch,border=BLUE,fill=SURFACE)
    bold(c,'كيف تعمل السرقة',W-0.55*inch,H-1.82*inch,13,BLUE,align='right')
    for i,l in enumerate([
        '.١  الفريق الفعال يجيب خطأ أو ينتهي وقته',
        '.٢  الفريق الآخر يحصل على 30 ثانية للسرقة',
        '.٣  نفس السؤال — خيارات نظيفة، لا تلميحات',
        '.٤  السرقة صح → يكسبون كامل قيمة النقاط',
        '.٥  السرقة خطأ → لا نقاط لأحد',
        '.٦  في كلتا الحالتين، الدور يمر للفريق التالي',
    ]):
        txt(c,l,W-0.65*inch,H-2.28*inch-i*0.44*inch,10.5,TEXT,align='right')

    slide_num(c,10)

def slide_11_categories(c):
    fill_bg(c)
    section_label(c,'CATEGORIES')
    gold_bar(c)
    bold(c,'📋  Available Categories  |  الفئات المتاحة', W/2, H-1.05*inch, 22, TEXT, 'center')

    cats=[
        ('📚','ثقافة','Culture'),('⚽','رياضة','Sport'),
        ('📜','تاريخ','History'),('🕌','قرآن','Quran'),
        ('🐪','خليج','Gulf'),('🔭','علوم','Science'),
        ('🗺','جغرافيا','Geo'),('🥘','أكل','Food'),
        ('🎭','دراما','Drama'),('🎙','فن','Music'),
        ('😄','طرائف','Jokes'),('🛢','أعمال','Business'),
        ('📱','سوشال','Social'),('🌙','رمضان','Ramadan'),
        ('🌴','سفر','Travel'),('🏡','عائلة','Family'),
        ('🇰🇼','تاريخ الكويت','Kuwait Hist.'),('🗣','لهجة','Dialect'),
        ('🏆','كرة خليجية','GCC Football'),('☕','ديوانية','Diwaniya'),
        ('🍛','مطبخ','Kuwait Food'),('🌟','مشاهير','Celebs'),
    ]
    cols=4; rows_per_col=6
    cw=3.0*inch; ch=0.8*inch
    x0=0.35*inch; y0=H-1.72*inch
    for i,(ico,ar,en) in enumerate(cats):
        ci=i//rows_per_col; ri=i%rows_per_col
        lx=x0+ci*(cw+0.1*inch); ty=y0-ri*ch
        card(c,lx,ty,cw,ch-4,border=BORDER,fill=CARD)
        txt(c,ico,lx+0.1*inch,ty+0.24*inch,16,GOLD)
        bold(c,ar,lx+0.55*inch,ty+0.44*inch,10,TEXT)
        txt(c,en,lx+0.55*inch,ty+0.2*inch,9,DIM)

    bold(c,'22 categories total  |  Teams draft 3–4 each per game',
         W/2,0.22*inch,10,GOLD,'center')
    slide_num(c,11)

def slide_12_tips(c):
    fill_bg(c)
    section_label(c,'STRATEGY TIPS')
    gold_bar(c)
    bold(c,'💡  Strategy Tips  |  نصائح', W/2, H-1.05*inch, 22, TEXT, 'center')

    tips=[
        ('🗂️',GOLD,'Draft Smart','اختر بذكاء',
         'Pick what you know + what opponents struggle with.',
         'اختر فئات تُتقنها وتصعب على خصمك.'),
        ('📈',GREEN,'Build a Streak','اصنع تتالياً',
         '3 correct in a row = +25% bonus. Start easy.',
         '3 صح متتالية = +25% — ابدأ بالسهل.'),
        ('💣',RED,'Time Your Bomb','وقّت قنبلتك',
         'Drop before a high-value question.',
         'أطلقها قبل سؤال عالي القيمة.'),
        ('🎯',PURPLE,'Force Wisely','افرض بحكمة',
         'Force the category YOU excel at.',
         'افرض الفئة التي تُتقنها.'),
        ('⏱️',HexColor('#D97706'),'Use Time Weapons','أسلحة الوقت',
         'Extra time and Ask-a-Friend are safest early.',
         'الوقت الإضافي أفضل في البداية.'),
        ('🏳',BLUE,'Last Stand','الوقفة الأخيرة',
         'Down by 400? Activate for 3× multiplier.',
         'متأخر بـ 400؟ فعّل 3× مضاعف.'),
    ]
    bw=3.8*inch; bh=2.55*inch; gap_x=0.26*inch; gap_y=0.2*inch
    top=H-1.72*inch
    for i,(ico,col,en_n,ar_n,en_t,ar_t) in enumerate(tips):
        row=i//3; ci=i%3
        lx=0.35*inch+ci*(bw+gap_x)
        ty=top-row*(bh+gap_y)
        card(c,lx,ty,bw,bh,border=col,fill=SURFACE)
        txt(c,ico+' ',lx+0.14*inch,ty+bh-0.45*inch,14,col)
        bold(c,en_n,lx+0.5*inch,ty+bh-0.45*inch,13,col)
        bold(c,ar_n,lx+bw-0.14*inch,ty+bh-0.8*inch,11,col,align='right')
        wrapped(c,en_t,lx+0.14*inch,ty+bh-1.15*inch,bw-0.3*inch,10,TEXT,14)
        wrapped(c,ar_t,lx+0.14*inch,ty+0.28*inch,bw-0.3*inch,10,DIM,14)

    slide_num(c,12)

def slide_13_end(c):
    fill_bg(c,BG)
    sadu_bar(c,H-8)

    c.setFillColor(Color(0.1,0.37,0.66,alpha=0.05))
    c.circle(2*inch,2*inch,2.5*inch,fill=1,stroke=0)
    c.setFillColor(Color(0.72,0.13,0.09,alpha=0.05))
    c.circle(11*inch,5.5*inch,2*inch,fill=1,stroke=0)

    bold(c,'🏆',W/2,H-2.0*inch,60,GOLD,'center')
    bold(c,"Ready to Play?", W/2, H-3.0*inch, 36, TEXT, 'center')
    bold(c,'جاهزين تلعبون؟', W/2, H-3.65*inch, 30, GOLD, 'center')

    for i,l in enumerate([
        '• Draft your categories  •  اختر فئاتك',
        '• Answer fast  •  اسرع بالإجابة  •  Steal wisely  •  اسرق بذكاء',
        '• Most points wins!  •  الأكثر نقاطاً يفوز!',
    ]):
        txt(c,l,W/2,H-4.45*inch-i*0.42*inch,13,DIM,'Helvetica',align='center')

    sadu_bar(c,0)
    bold(c,'Good Luck  •  بالتوفيق  🎯', W/2, 0.15*inch, 12, CARD, 'center')
    slide_num(c,13)

# ── MAIN ──────────────────────────────────────────────────────────────────────
if __name__=='__main__':
    out = 'docs/Jawib_HowToPlay.pdf'
    os.makedirs('docs', exist_ok=True)
    c = canvas.Canvas(out, pagesize=(W, H))
    c.setTitle('Jawib — How to Play')
    c.setAuthor('Jawib')
    c.setSubject('How to Play Guide')

    slides = [
        slide_01_title, slide_02_what_is, slide_03_teams, slide_04_draft,
        slide_05_board, slide_06_flow,   slide_07_tiers, slide_08_scoring,
        slide_09_weapons, slide_10_steal, slide_11_categories, slide_12_tips,
        slide_13_end,
    ]
    for fn in slides:
        fn(c)
        c.showPage()

    c.save()
    import os as _os
    size = _os.path.getsize(out)
    print(f'✅  Saved → {out}  ({size//1024} KB,  {len(slides)} pages)')
