"""
Build the Jawib "How to Play" PowerPoint presentation.
Run: python3 scripts/build_howtoplay_pptx.py
Output: docs/Jawib_HowToPlay.pptx
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import pptx.oxml.ns as nsmap
from lxml import etree
import os

# ── Palette ──────────────────────────────────────────────────────────────────
BG_DARK   = RGBColor(0x0A, 0x0A, 0x12)   # near-black navy
BG_CARD   = RGBColor(0x12, 0x12, 0x22)   # card surface
GOLD      = RGBColor(0xD4, 0xA9, 0x4A)   # jawwib-gold
PURPLE    = RGBColor(0x7C, 0x3A, 0xED)   # jawwib-purple
BLUE_A    = RGBColor(0x1D, 0x4E, 0xD8)   # team alpha (البحر)
RED_B     = RGBColor(0xB9, 0x1C, 0x1C)   # team beta (البر)
WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
OFF_WHITE = RGBColor(0xE2, 0xD9, 0xC8)   # warm off-white body text
DIM       = RGBColor(0x88, 0x80, 0x78)   # dimmed text
GREEN_OK  = RGBColor(0x16, 0xA3, 0x4A)
AMBER     = RGBColor(0xD9, 0x77, 0x06)

# Point-tier colours matching the board
TIER_COLORS = {
    100: RGBColor(0x15, 0x80, 0x3D),
    200: RGBColor(0x03, 0x69, 0xA1),
    300: RGBColor(0xC8, 0x88, 0x0A),
    400: RGBColor(0xB4, 0x53, 0x09),
    500: RGBColor(0xB9, 0x1C, 0x1C),
    600: RGBColor(0x6D, 0x28, 0xD9),
}

W = Inches(13.33)   # widescreen width
H = Inches(7.5)     # widescreen height

# ── Helpers ───────────────────────────────────────────────────────────────────
def new_prs():
    prs = Presentation()
    prs.slide_width  = W
    prs.slide_height = H
    return prs

def blank_slide(prs):
    blank = prs.slide_layouts[6]   # completely blank
    return prs.slides.add_slide(blank)

def fill_bg(slide, color: RGBColor):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_rect(slide, left, top, width, height, fill_color=None, line_color=None, line_width=Pt(0)):
    shape = slide.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.RECTANGLE
        left, top, width, height
    )
    shape.line.width = line_width
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if line_color:
        shape.line.color.rgb = line_color
    else:
        shape.line.fill.background()
    return shape

def add_text(slide, text, left, top, width, height,
             font_size=Pt(18), bold=False, color=WHITE,
             align=PP_ALIGN.LEFT, italic=False, wrap=True):
    txb = slide.shapes.add_textbox(left, top, width, height)
    txb.word_wrap = wrap
    tf = txb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = font_size
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.italic = italic
    return txb

def add_para(tf, text, font_size=Pt(16), bold=False, color=OFF_WHITE,
             align=PP_ALIGN.RIGHT, space_before=Pt(4), italic=False):
    p = tf.add_paragraph()
    p.alignment = align
    p.space_before = space_before
    run = p.add_run()
    run.text = text
    run.font.size = font_size
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.italic = italic
    return p

def section_label(slide, text, color=GOLD):
    """Small uppercase label in top-left corner."""
    add_text(slide, text,
             Inches(0.35), Inches(0.22), Inches(4), Inches(0.35),
             font_size=Pt(9), bold=True, color=color, align=PP_ALIGN.LEFT)

def slide_number(slide, num, total=13):
    add_text(slide, f"{num} / {total}",
             Inches(12.4), Inches(7.15), Inches(0.7), Inches(0.28),
             font_size=Pt(8), color=DIM, align=PP_ALIGN.RIGHT)

def gold_bar(slide, y=Inches(0.65), width_pct=1.0):
    """Thin gold horizontal accent line."""
    add_rect(slide,
             Inches(0.35), y,
             Inches(12.63 * width_pct), Pt(2),
             fill_color=GOLD)

def card_box(slide, left, top, width, height, accent=GOLD):
    """Rounded-corner-look card (pptx has no rounded rects without XML tricks — use plain)."""
    # shadow layer
    add_rect(slide, left + Pt(3), top + Pt(3), width, height,
             fill_color=RGBColor(0x00,0x00,0x00))
    # card body
    add_rect(slide, left, top, width, height,
             fill_color=BG_CARD, line_color=accent, line_width=Pt(1.5))

# ── SLIDE BUILDERS ────────────────────────────────────────────────────────────

def slide_01_title(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)

    # large gradient-ish rectangle top strip
    add_rect(s, 0, 0, W, Inches(0.6), fill_color=PURPLE)

    # decorative circles (faked with ovals)
    for (cx, cy, r, c) in [
        (Inches(1),   Inches(5.8), Inches(2.8), RGBColor(0x1D,0x4E,0xD8)),
        (Inches(11.5),Inches(1.5), Inches(2.2), RGBColor(0xB9,0x1C,0x1C)),
        (Inches(6.5), Inches(7),   Inches(1.6), PURPLE),
    ]:
        ov = s.shapes.add_shape(9, cx - r/2, cy - r/2, r, r)  # oval
        ov.fill.solid(); ov.fill.fore_color.rgb = c
        ov.line.fill.background()
        # make semi-transparent via alpha in XML
        sp_pr = ov._element.spPr
        solidFill = sp_pr.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
        if solidFill is not None:
            srgb = solidFill.find('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
            if srgb is not None:
                alpha = etree.SubElement(srgb, '{http://schemas.openxmlformats.org/drawingml/2006/main}alpha')
                alpha.set('val', '15000')   # 15 % opacity

    # Game logo / name — huge Arabic
    add_text(s, 'جاويب', Inches(0.5), Inches(1.2), Inches(12.3), Inches(2.4),
             font_size=Pt(120), bold=True, color=GOLD, align=PP_ALIGN.CENTER)

    # English sub-name
    add_text(s, 'JAWIB', Inches(0.5), Inches(3.2), Inches(12.3), Inches(0.8),
             font_size=Pt(36), bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    add_text(s, 'دليل اللعب   •   How to Play', Inches(0.5), Inches(4.0), Inches(12.3), Inches(0.55),
             font_size=Pt(20), bold=False, color=OFF_WHITE, align=PP_ALIGN.CENTER)

    # Bottom tagline strip
    add_rect(s, 0, Inches(6.9), W, Inches(0.6), fill_color=GOLD)
    add_text(s, '🏆  لعبة المعرفة الكويتية  •  The Gulf Knowledge Game  🏆',
             Inches(0), Inches(6.88), W, Inches(0.6),
             font_size=Pt(14), bold=True, color=BG_DARK, align=PP_ALIGN.CENTER)

    slide_number(s, 1)
    return s


def slide_02_what_is(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "WHAT IS JAWIB?")
    gold_bar(s)

    add_text(s, '🧠  ما هو جاويب؟', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.7),
             font_size=Pt(34), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    # Left column — English
    card_box(s, Inches(0.35), Inches(1.6), Inches(5.9), Inches(5.2), accent=BLUE_A)
    txb = s.shapes.add_textbox(Inches(0.55), Inches(1.75), Inches(5.5), Inches(4.8))
    txb.word_wrap = True
    tf = txb.text_frame; tf.word_wrap = True
    p0 = tf.paragraphs[0]; p0.alignment = PP_ALIGN.LEFT
    r0 = p0.add_run(); r0.text = "Jawib is a team trivia battle for 2–8 players."; r0.font.size = Pt(15); r0.font.color.rgb = WHITE; r0.font.bold = True
    for line in [
        "• Pick your categories from 22 topics spanning Gulf culture, history, science, sport, and more.",
        "• Two teams take turns selecting questions from a 6×8 point board.",
        "• Answer correctly to earn points. Wrong? The other team steals!",
        "• Deploy weapons to turn the tide — bombs, shields, forced categories.",
        "• The team with the most points when the board clears wins.",
    ]:
        add_para(tf, line, font_size=Pt(13.5), color=OFF_WHITE, align=PP_ALIGN.LEFT, space_before=Pt(6))

    # Right column — Arabic
    card_box(s, Inches(7.08), Inches(1.6), Inches(5.9), Inches(5.2), accent=RED_B)
    txb2 = s.shapes.add_textbox(Inches(7.18), Inches(1.75), Inches(5.6), Inches(4.8))
    txb2.word_wrap = True
    tf2 = txb2.text_frame; tf2.word_wrap = True
    p0b = tf2.paragraphs[0]; p0b.alignment = PP_ALIGN.RIGHT
    r0b = p0b.add_run(); r0b.text = "لعبة معلومات فريق للاعبين من ٢ إلى ٨"; r0b.font.size = Pt(15); r0b.font.color.rgb = WHITE; r0b.font.bold = True
    for line in [
        "• اختاروا فئاتكم من ٢٢ موضوع: خليج، تاريخ، علوم، رياضة…",
        "• فريقان يتناوبان على اختيار الأسئلة من لوحة نقاط ٦×٨.",
        "• أجب صح تكسب نقاط. غلطت؟ الفريق الثاني يسرق!",
        "• استخدم الأسلحة لتقلب الموازين — قنابل، دروع، فئات مفروضة.",
        "• الفريق الأكثر نقاطاً عند انتهاء اللوحة يفوز.",
    ]:
        add_para(tf2, line, font_size=Pt(13.5), color=OFF_WHITE, align=PP_ALIGN.RIGHT, space_before=Pt(6))

    slide_number(s, 2)
    return s


def slide_03_teams(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "TEAMS SETUP")
    gold_bar(s)

    add_text(s, '👥  تشكيل الفريقين', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(32), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    # Alpha team card
    card_box(s, Inches(0.35), Inches(1.55), Inches(5.9), Inches(5.4), accent=BLUE_A)
    add_text(s, '🌊', Inches(0.55), Inches(1.65), Inches(1), Inches(0.9), font_size=Pt(44), align=PP_ALIGN.LEFT)
    add_text(s, 'Team Alpha', Inches(1.45), Inches(1.72), Inches(4.6), Inches(0.5),
             font_size=Pt(22), bold=True, color=BLUE_A, align=PP_ALIGN.LEFT)
    add_text(s, 'فريق البحر', Inches(1.45), Inches(2.18), Inches(4.6), Inches(0.45),
             font_size=Pt(18), bold=True, color=WHITE, align=PP_ALIGN.LEFT)

    txb = s.shapes.add_textbox(Inches(0.55), Inches(2.72), Inches(5.5), Inches(3.9))
    txb.word_wrap = True; tf = txb.text_frame; tf.word_wrap = True
    tf.paragraphs[0].runs  # empty first para
    for line in [
        "🔵  Hosts the game on their device",
        "🔵  Always plays first",
        "🔵  Blue colour throughout the UI",
        "🔵  ١–٤ players on the same team",
        "🔵  يبدؤون أول جولة دائماً",
    ]:
        add_para(tf, line, font_size=Pt(13), color=OFF_WHITE, align=PP_ALIGN.LEFT, space_before=Pt(5))

    # Beta team card
    card_box(s, Inches(7.08), Inches(1.55), Inches(5.9), Inches(5.4), accent=RED_B)
    add_text(s, '🌿', Inches(7.28), Inches(1.65), Inches(1), Inches(0.9), font_size=Pt(44), align=PP_ALIGN.LEFT)
    add_text(s, 'Team Beta', Inches(8.18), Inches(1.72), Inches(4.6), Inches(0.5),
             font_size=Pt(22), bold=True, color=RED_B, align=PP_ALIGN.LEFT)
    add_text(s, 'فريق البر', Inches(8.18), Inches(2.18), Inches(4.6), Inches(0.45),
             font_size=Pt(18), bold=True, color=WHITE, align=PP_ALIGN.LEFT)

    txb2 = s.shapes.add_textbox(Inches(7.28), Inches(2.72), Inches(5.5), Inches(3.9))
    txb2.word_wrap = True; tf2 = txb2.text_frame; tf2.word_wrap = True
    for line in [
        "🔴  Plays on the same shared device",
        "🔴  Responds after Team Alpha's turn",
        "🔴  Red colour throughout the UI",
        "🔴  ١–٤ players on the same team",
        "🔴  يلعبون في دورهم بعد البحر",
    ]:
        add_para(tf2, line, font_size=Pt(13), color=OFF_WHITE, align=PP_ALIGN.LEFT, space_before=Pt(5))

    # Centre divider label
    add_text(s, 'VS', Inches(6.17), Inches(3.55), Inches(1), Inches(0.8),
             font_size=Pt(28), bold=True, color=GOLD, align=PP_ALIGN.CENTER)

    slide_number(s, 3)
    return s


def slide_04_draft(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "CATEGORY DRAFT")
    gold_bar(s)

    add_text(s, '🗂️  اختيار الفئات — سحب الفئات', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(30), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    # Step boxes
    steps = [
        ('1', BLUE_A,  'Team Alpha picks first', 'يختار البحر أولاً'),
        ('2', RED_B,   'Team Beta picks next',   'يختار البر ثانياً'),
        ('3', RED_B,   'Beta picks again (snake)', 'البر يختار مرة أخرى (عكسي)'),
        ('4', BLUE_A,  'Alpha picks last',        'البحر يختار أخيراً'),
    ]

    box_w = Inches(2.9)
    box_h = Inches(3.2)
    gap   = Inches(0.28)
    start_x = Inches(0.35)
    top   = Inches(1.6)

    for i, (num, col, en, ar) in enumerate(steps):
        lx = start_x + i * (box_w + gap)
        card_box(s, lx, top, box_w, box_h, accent=col)
        add_text(s, num, lx + Inches(0.1), top + Inches(0.1), box_w - Inches(0.2), Inches(0.7),
                 font_size=Pt(36), bold=True, color=col, align=PP_ALIGN.LEFT)
        add_text(s, en, lx + Inches(0.15), top + Inches(0.82), box_w - Inches(0.3), Inches(0.55),
                 font_size=Pt(14), bold=True, color=WHITE, align=PP_ALIGN.LEFT)
        add_text(s, ar, lx + Inches(0.15), top + Inches(1.38), box_w - Inches(0.3), Inches(0.55),
                 font_size=Pt(14), bold=True, color=col, align=PP_ALIGN.RIGHT)

    # Arrow connectors (text arrows)
    for i in range(3):
        lx = start_x + i * (box_w + gap) + box_w + Inches(0.04)
        add_text(s, '→', lx, top + Inches(1.3), gap, Inches(0.6),
                 font_size=Pt(22), bold=True, color=GOLD, align=PP_ALIGN.CENTER)

    # Result box
    card_box(s, Inches(0.35), Inches(5.0), Inches(12.63), Inches(2.15), accent=GOLD)
    add_text(s, '✅  Result', Inches(0.55), Inches(5.1), Inches(5), Inches(0.45),
             font_size=Pt(16), bold=True, color=GOLD, align=PP_ALIGN.LEFT)
    txb = s.shapes.add_textbox(Inches(0.55), Inches(5.55), Inches(12.1), Inches(1.45))
    txb.word_wrap = True; tf = txb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.LEFT
    r = p.add_run()
    r.text = "Each team selects 3–4 categories from 22 available topics. These are the only categories that appear on your board — choose wisely based on your team's strengths!"
    r.font.size = Pt(14); r.font.color.rgb = OFF_WHITE

    add_text(s, 'كل فريق يختار ٣–٤ فئات من ٢٢ موضوع. هذه هي الفئات الوحيدة على لوحتك — اختر بذكاء!',
             Inches(0.55), Inches(5.9), Inches(12.1), Inches(0.8),
             font_size=Pt(14), color=OFF_WHITE, align=PP_ALIGN.RIGHT)

    slide_number(s, 4)
    return s


def slide_05_board(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "THE GAME BOARD")
    gold_bar(s)

    add_text(s, '🎮  لوحة اللعب', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(34), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    # Draw a schematic board
    tiers  = [100, 200, 300, 400, 500, 600]
    cats   = ['📚 ثقافة', '⚽ رياضة', '📜 تاريخ', '🕌 قرآن', '🐪 خليج', '🔭 علوم', '🗺️ جغرافيا', '🥘 أكل']
    cell_w = Inches(1.55)
    cell_h = Inches(0.6)
    cat_w  = Inches(1.15)
    board_left  = Inches(1.58)
    board_top   = Inches(1.55)

    # Tier headers
    for ci, tier in enumerate(tiers):
        col = TIER_COLORS[tier]
        lx = board_left + ci * cell_w
        add_rect(s, lx + Pt(2), board_top, cell_w - Pt(4), cell_h - Pt(4),
                 fill_color=col)
        add_text(s, str(tier), lx + Pt(2), board_top, cell_w - Pt(4), cell_h - Pt(4),
                 font_size=Pt(14), bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    # Category rows
    for ri, cat in enumerate(cats):
        row_top = board_top + cell_h + ri * cell_h
        # cat label
        add_text(s, cat, Inches(0.38), row_top, cat_w, cell_h,
                 font_size=Pt(9), bold=True, color=OFF_WHITE, align=PP_ALIGN.RIGHT)
        for ci, tier in enumerate(tiers):
            lx = board_left + ci * cell_w
            col = TIER_COLORS[tier]
            # alternate answered/unanswered
            answered = (ri + ci) % 5 == 0
            bg = RGBColor(0x20, 0x20, 0x30) if not answered else RGBColor(0x10, 0x10, 0x18)
            border = col if not answered else DIM
            add_rect(s, lx + Pt(2), row_top + Pt(2), cell_w - Pt(4), cell_h - Pt(4),
                     fill_color=bg, line_color=border, line_width=Pt(1))
            txt = '✓' if answered else str(tier)
            tcol = DIM if answered else col
            add_text(s, txt, lx + Pt(2), row_top + Pt(2), cell_w - Pt(4), cell_h - Pt(4),
                     font_size=Pt(11), bold=True, color=tcol, align=PP_ALIGN.CENTER)

    # Annotations on the right
    ann_x = Inches(11.2)
    annotations = [
        (board_top + cell_h * 0,  TIER_COLORS[100], '100 pts — Easiest'),
        (board_top + cell_h * 2,  TIER_COLORS[300], '300 pts — Medium'),
        (board_top + cell_h * 5,  TIER_COLORS[600], '600 pts — Hardest!'),
        (board_top + cell_h * 1.5, DIM, '✓ = Already answered'),
    ]
    for (ay, col, txt) in annotations:
        add_text(s, txt, ann_x, ay, Inches(2), Inches(0.4),
                 font_size=Pt(11), color=col, align=PP_ALIGN.LEFT)

    add_text(s, '← 6 difficulty tiers   |   8 categories →   |   48 total cells',
             Inches(0.35), Inches(6.82), Inches(12.63), Inches(0.4),
             font_size=Pt(12), color=DIM, align=PP_ALIGN.CENTER)

    slide_number(s, 5)
    return s


def slide_06_question_flow(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "QUESTION FLOW")
    gold_bar(s)

    add_text(s, '❓  كيف تسير الجولة؟', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(32), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    flow = [
        ('🎯', BLUE_A, 'Active team\npicks a cell', 'الفريق الفعال\nيختار خانة'),
        ('❓', PURPLE, 'Question\nappears', 'السؤال\nيظهر'),
        ('⏱️', AMBER, 'Timer\ncounts down\n(30 sec)', 'العداد\nيبدأ\n٣٠ ثانية'),
        ('✅', GREEN_OK, 'Correct!\nEarn points', 'صح!\nاكسب نقاط'),
        ('🔄', GOLD, 'Turn passes\nto other team', 'الدور\nيمر للفريق\nالآخر'),
    ]

    flow_wrong = [
        ('❌', RED_B, 'Wrong /\nTime out', 'خطأ أو\nانتهى الوقت'),
        ('⚡', AMBER, 'Other team\ngets steal\nchance', 'الفريق الآخر\nفرصة سرقة\n١٥ ثانية'),
        ('🏆', GREEN_OK, 'Steal correct\n→ they earn\npoints', 'السرقة صح\nيكسبون\nنقاط'),
        ('💨', DIM, 'Steal wrong\n→ no points\nfor anyone', 'السرقة خطأ\nلا نقاط\nلأحد'),
    ]

    bw = Inches(2.1); bh = Inches(3.0)
    top_y = Inches(1.55)
    wrong_y = Inches(1.55)

    # Correct path
    add_text(s, '✅ Correct path', Inches(0.35), top_y - Inches(0.32), Inches(6), Inches(0.3),
             font_size=Pt(11), bold=True, color=GREEN_OK, align=PP_ALIGN.LEFT)
    for i, (icon, col, en, ar) in enumerate(flow):
        lx = Inches(0.35) + i * (bw + Inches(0.14))
        card_box(s, lx, top_y, bw, bh, accent=col)
        add_text(s, icon, lx + Inches(0.1), top_y + Inches(0.1), bw, Inches(0.65),
                 font_size=Pt(28), align=PP_ALIGN.LEFT)
        add_text(s, en, lx + Inches(0.12), top_y + Inches(0.75), bw - Inches(0.2), Inches(0.9),
                 font_size=Pt(12), bold=True, color=WHITE, align=PP_ALIGN.LEFT)
        add_text(s, ar, lx + Inches(0.12), top_y + Inches(1.7), bw - Inches(0.2), Inches(0.9),
                 font_size=Pt(12), bold=True, color=col, align=PP_ALIGN.RIGHT)
        if i < len(flow) - 1:
            add_text(s, '→', lx + bw + Inches(0.01), top_y + Inches(1.15), Inches(0.16), Inches(0.55),
                     font_size=Pt(16), bold=True, color=GOLD, align=PP_ALIGN.CENTER)

    # Wrong path
    wrong_top = Inches(4.85)
    add_text(s, '❌ Wrong / timeout path (steal phase)', Inches(0.35), wrong_top - Inches(0.32), Inches(8), Inches(0.3),
             font_size=Pt(11), bold=True, color=RED_B, align=PP_ALIGN.LEFT)
    for i, (icon, col, en, ar) in enumerate(flow_wrong):
        lx = Inches(0.35) + i * (bw + Inches(0.14))
        card_box(s, lx, wrong_top, bw, Inches(2.3), accent=col)
        add_text(s, icon, lx + Inches(0.1), wrong_top + Inches(0.08), bw, Inches(0.5),
                 font_size=Pt(24), align=PP_ALIGN.LEFT)
        add_text(s, en, lx + Inches(0.12), wrong_top + Inches(0.6), bw - Inches(0.2), Inches(0.72),
                 font_size=Pt(12), bold=True, color=WHITE, align=PP_ALIGN.LEFT)
        add_text(s, ar, lx + Inches(0.12), wrong_top + Inches(1.35), bw - Inches(0.2), Inches(0.72),
                 font_size=Pt(12), bold=True, color=col, align=PP_ALIGN.RIGHT)
        if i < len(flow_wrong) - 1:
            add_text(s, '→', lx + bw + Inches(0.01), wrong_top + Inches(0.9), Inches(0.16), Inches(0.4),
                     font_size=Pt(16), bold=True, color=GOLD, align=PP_ALIGN.CENTER)

    slide_number(s, 6)
    return s


def slide_07_points(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "POINT TIERS")
    gold_bar(s)

    add_text(s, '💰  درجات النقاط', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(34), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    tiers = [
        (100, '🟢', 'Starter',  'مبتدئ',  'Straightforward facts — great for warming up.',
         'أسئلة مباشرة — ابدأ بها لتسخين الفريق.'),
        (200, '🔵', 'Easy',     'سهل',    'Common knowledge, a step up from 100.',
         'معلومات شائعة، درجة فوق المبتدئ.'),
        (300, '🟡', 'Medium',   'متوسط',  'Requires some thought — good mid-game picks.',
         'تحتاج تفكيراً — خيار جيد في منتصف اللعبة.'),
        (400, '🟠', 'Hard',     'صعب',    'Specialist knowledge; high reward.',
         'معلومات متخصصة؛ مكافأة عالية.'),
        (500, '🔴', 'Expert',   'خبير',   'Tricky questions — dangerous if you get it wrong.',
         'أسئلة خادعة — خطيرة إذا أخطأت.'),
        (600, '🟣', 'Legend',   'أسطوري', 'Maximum points, maximum difficulty. Gamble wisely!',
         'أقصى نقاط، أقصى صعوبة. المقامرة بحكمة!'),
    ]

    col_w = Inches(6.0); gap = Inches(0.33)
    row_h = Inches(0.88)
    left_x = Inches(0.35)
    right_x = Inches(6.68)
    top = Inches(1.58)

    for i, (pts, dot, en_diff, ar_diff, en_desc, ar_desc) in enumerate(tiers):
        col = TIER_COLORS[pts]
        row_y = top + i * row_h

        for (lx, desc, align_) in [(left_x, en_desc, PP_ALIGN.LEFT), (right_x, ar_desc, PP_ALIGN.RIGHT)]:
            add_rect(s, lx, row_y + Pt(2), col_w, row_h - Pt(6),
                     fill_color=BG_CARD, line_color=col, line_width=Pt(1.2))
            # colour band on left edge
            add_rect(s, lx, row_y + Pt(2), Inches(0.18), row_h - Pt(6), fill_color=col)
            add_text(s, str(pts), lx + Inches(0.25), row_y + Pt(4), Inches(0.65), row_h - Pt(12),
                     font_size=Pt(20), bold=True, color=col, align=PP_ALIGN.LEFT)
            label = en_diff if align_ == PP_ALIGN.LEFT else ar_diff
            add_text(s, label, lx + Inches(0.95), row_y + Pt(4), Inches(1.1), row_h - Pt(12),
                     font_size=Pt(13), bold=True, color=WHITE, align=PP_ALIGN.LEFT)
            add_text(s, desc, lx + Inches(2.1), row_y + Pt(6), col_w - Inches(2.25), row_h - Pt(14),
                     font_size=Pt(11), color=OFF_WHITE, align=align_, wrap=True)

    # Multiplier note
    add_text(s,
             '⚡ Last Stand: Trailing team gets 3× multiplier when losing by ≥400 pts!  |  '
             '!٣× مضاعف للفريق المتأخر بـ ٤٠٠+ نقطة',
             Inches(0.35), Inches(6.9), Inches(12.63), Inches(0.42),
             font_size=Pt(11), bold=True, color=AMBER, align=PP_ALIGN.CENTER)

    slide_number(s, 7)
    return s


def slide_08_scoring(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "SCORING SYSTEM")
    gold_bar(s)

    add_text(s, '🧮  نظام النقاط', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(34), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    formulas = [
        ('Base Points', 'النقاط الأساسية', 'Cell value (100–600)', 'قيمة الخانة', GOLD),
        ('Time Bonus',  'مكافأة الوقت',    '+10 pts per second remaining', '+١٠ نقطة لكل ثانية متبقية', GREEN_OK),
        ('Streak Bonus','مكافأة التتالي',   '3 correct in a row → +25%', '٣ صح متتالية → +٢٥٪', PURPLE),
        ('Last Stand',  'الوقفة الأخيرة',  '3× multiplier (one-time, trailing by ≥400)', '٣× مضاعف لمرة واحدة (متأخر بـ ٤٠٠+)', AMBER),
        ('Steal',       'السرقة',           'Wrong answer → opponent answers for full points', 'خطأ → الخصم يجيب بكامل النقاط', RED_B),
        ('Immunity',    'الحصانة',          'Weapon: no point deduction on wrong answer', 'سلاح: لا خسارة نقاط عند الخطأ', BLUE_A),
    ]

    bh = Inches(0.83)
    top = Inches(1.58)
    lx = Inches(0.35)
    fw = Inches(12.63)

    for i, (en_name, ar_name, en_val, ar_val, col) in enumerate(formulas):
        row_y = top + i * bh
        add_rect(s, lx, row_y + Pt(2), fw, bh - Pt(4),
                 fill_color=BG_CARD, line_color=col, line_width=Pt(1.2))
        add_rect(s, lx, row_y + Pt(2), Inches(0.18), bh - Pt(4), fill_color=col)
        add_text(s, en_name, lx + Inches(0.28), row_y + Pt(5), Inches(1.9), bh - Pt(10),
                 font_size=Pt(13), bold=True, color=col, align=PP_ALIGN.LEFT)
        add_text(s, ar_name, lx + Inches(0.28), row_y + Pt(22), Inches(1.9), bh - Pt(10),
                 font_size=Pt(11), color=WHITE, align=PP_ALIGN.LEFT)
        add_text(s, en_val, lx + Inches(2.35), row_y + Pt(5), Inches(5.2), bh - Pt(10),
                 font_size=Pt(12), color=OFF_WHITE, align=PP_ALIGN.LEFT)
        add_text(s, ar_val, lx + Inches(7.65), row_y + Pt(5), Inches(4.8), bh - Pt(10),
                 font_size=Pt(12), color=OFF_WHITE, align=PP_ALIGN.RIGHT)

    add_text(s, 'Final Score = (Base + Time Bonus) × Streak × Last Stand Multiplier',
             lx, Inches(6.75), fw, Inches(0.52),
             font_size=Pt(14), bold=True, color=GOLD, align=PP_ALIGN.CENTER)

    slide_number(s, 8)
    return s


def slide_09_weapons(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "WEAPONS SYSTEM")
    gold_bar(s)

    add_text(s, '⚔️  نظام الأسلحة', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(34), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    weapons = [
        ('💣', 'Timer Bomb',      'قنبلة الوقت',   RED_B,
         "Halves the opponent's timer on their next question. Deploy before they pick.",
         'يقطع وقت الخصم إلى النصف على سؤاله الجاي. استخدمه قبل اختيارهم.'),
        ('🛡️', 'Immunity Shield', 'درع الحصانة',  BLUE_A,
         "If your team answers wrong once, you lose no points that round.",
         'إذا أجاب فريقك خطأ مرة واحدة، لا تخسرون نقاطاً في تلك الجولة.'),
        ('🎯', 'Force Category',  'فرض الفئة',    PURPLE,
         "Force the opponent's NEXT question to come from a category you choose.",
         'اجبر الخصم على الإجابة من الفئة التي تختارها في سؤاله القادم.'),
        ('📞', 'Ask a Friend',    'اتصل بصديق',  GREEN_OK,
         "Grants +25 extra seconds on your team's current question timer.",
         'يمنح +٢٥ ثانية إضافية على عداد سؤال فريقك الحالي.'),
        ('⏱️', 'Extra Time',     'وقت إضافي',    AMBER,
         "Adds +15 seconds to your current question — use when the clock is ticking.",
         'يضيف +١٥ ثانية على سؤالك الحالي — استخدمه والعداد يدق.'),
    ]

    bw = Inches(2.33); bh = Inches(5.1)
    top = Inches(1.55)
    gap = Inches(0.22)
    start = Inches(0.35)

    for i, (icon, en_name, ar_name, col, en_hint, ar_hint) in enumerate(weapons):
        lx = start + i * (bw + gap)
        card_box(s, lx, top, bw, bh, accent=col)
        add_text(s, icon, lx + Inches(0.1), top + Inches(0.1), bw - Inches(0.2), Inches(0.75),
                 font_size=Pt(34), align=PP_ALIGN.LEFT)
        add_text(s, en_name, lx + Inches(0.12), top + Inches(0.9), bw - Inches(0.22), Inches(0.52),
                 font_size=Pt(12), bold=True, color=col, align=PP_ALIGN.LEFT)
        add_text(s, ar_name, lx + Inches(0.12), top + Inches(1.4), bw - Inches(0.22), Inches(0.45),
                 font_size=Pt(12), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)
        add_text(s, en_hint, lx + Inches(0.12), top + Inches(1.92), bw - Inches(0.22), Inches(1.5),
                 font_size=Pt(11), color=OFF_WHITE, align=PP_ALIGN.LEFT, wrap=True)
        add_text(s, ar_hint, lx + Inches(0.12), top + Inches(3.48), bw - Inches(0.22), Inches(1.45),
                 font_size=Pt(11), color=DIM, align=PP_ALIGN.RIGHT, wrap=True)

    add_text(s, '💡  Weapons are earned as you play. Use them strategically — each can only be used once!',
             Inches(0.35), Inches(6.88), Inches(12.63), Inches(0.45),
             font_size=Pt(12), color=GOLD, align=PP_ALIGN.CENTER)

    slide_number(s, 9)
    return s


def slide_10_steal(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "THE STEAL")
    gold_bar(s)

    add_text(s, '⚡  السرقة — The Steal', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(34), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    # Left explanation
    card_box(s, Inches(0.35), Inches(1.6), Inches(6.05), Inches(5.5), accent=RED_B)
    txb = s.shapes.add_textbox(Inches(0.55), Inches(1.75), Inches(5.65), Inches(5.2))
    txb.word_wrap = True; tf = txb.text_frame; tf.word_wrap = True
    p0 = tf.paragraphs[0]; p0.alignment = PP_ALIGN.LEFT
    r0 = p0.add_run(); r0.text = "How the Steal Works"; r0.font.size = Pt(18); r0.font.bold = True; r0.font.color.rgb = RED_B
    for line in [
        "1. Active team answers WRONG or runs out of time.",
        "2. The OTHER team gets 15 seconds to steal.",
        "3. If they answer correctly → they earn the FULL point value.",
        "4. If they also answer wrong → NO points for anyone.",
        "5. Either way, the question cell is marked as done.",
        "6. Turn then moves to the opposing team as normal.",
    ]:
        add_para(tf, line, font_size=Pt(13.5), color=OFF_WHITE, align=PP_ALIGN.LEFT, space_before=Pt(7))

    # Right — Arabic
    card_box(s, Inches(7.13), Inches(1.6), Inches(5.85), Inches(5.5), accent=BLUE_A)
    txb2 = s.shapes.add_textbox(Inches(7.28), Inches(1.75), Inches(5.5), Inches(5.2))
    txb2.word_wrap = True; tf2 = txb2.text_frame; tf2.word_wrap = True
    p0b = tf2.paragraphs[0]; p0b.alignment = PP_ALIGN.RIGHT
    r0b = p0b.add_run(); r0b.text = "كيف تعمل السرقة"; r0b.font.size = Pt(18); r0b.font.bold = True; r0b.font.color.rgb = BLUE_A
    for line in [
        "١. الفريق الفعال يجيب خطأ أو ينتهي وقته.",
        "٢. الفريق الآخر يحصل على ١٥ ثانية للسرقة.",
        "٣. إذا أجابوا صح → يكسبون كامل قيمة النقاط.",
        "٤. إذا أجابوا خطأ → لا نقاط لأحد.",
        "٥. في كلتا الحالتين، الخانة تُعلَّم كمجابة.",
        "٦. الدور يمر للفريق المقابل بشكل طبيعي.",
    ]:
        add_para(tf2, line, font_size=Pt(13.5), color=OFF_WHITE, align=PP_ALIGN.RIGHT, space_before=Pt(7))

    slide_number(s, 10)
    return s


def slide_11_categories(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "CATEGORIES")
    gold_bar(s)

    add_text(s, '📋  الفئات المتاحة — Available Categories', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(28), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    cats = [
        ('📚', 'ثقافة عامة',    'Culture'),
        ('⚽', 'رياضة',          'Sport'),
        ('📜', 'تاريخ',         'History'),
        ('🕌', 'قرآن وسنة',     'Quran & Sunnah'),
        ('🐪', 'خليجيات',       'Gulf'),
        ('🔭', 'علوم',          'Science'),
        ('🗺️', 'جغرافيا',      'Geography'),
        ('🥘', 'أكل ومطبخ',    'Food & Kitchen'),
        ('🎭', 'دراما',         'Drama'),
        ('🎙️', 'فن وموسيقى',  'Music & Arts'),
        ('😄', 'طرائف وألغاز', 'Jokes & Riddles'),
        ('🛢️', 'أعمال',        'Business'),
        ('📱', 'سوشال ميديا',  'Social Media'),
        ('🌙', 'رمضانيات',     'Ramadan'),
        ('🌴', 'سفر وسياحة',   'Travel'),
        ('🏡', 'عائلة',         'Family'),
        ('🇰🇼', 'تاريخ الكويت', 'Kuwait History'),
        ('🗣️', 'لهجة كويتية', 'Kuwait Dialect'),
        ('🏆', 'كرة خليجية',   'GCC Football'),
        ('☕', 'ديوانية',       'Diwaniya'),
        ('🍛', 'مطبخ كويتي',   'Kuwait Cuisine'),
        ('🌟', 'مشاهير الخليج', 'Gulf Celebs'),
    ]

    cols = 4
    rows_per_col = 6
    cell_w = Inches(3.1)
    cell_h = Inches(0.82)
    left_start = Inches(0.35)
    top_start  = Inches(1.55)

    for i, (icon, ar, en) in enumerate(cats):
        col_i = i // rows_per_col
        row_i = i % rows_per_col
        lx = left_start + col_i * (cell_w + Inches(0.1))
        ty = top_start + row_i * cell_h

        add_rect(s, lx, ty + Pt(2), cell_w, cell_h - Pt(5),
                 fill_color=BG_CARD, line_color=GOLD, line_width=Pt(0.8))
        add_text(s, icon, lx + Inches(0.08), ty + Pt(4), Inches(0.45), cell_h - Pt(8),
                 font_size=Pt(18), align=PP_ALIGN.LEFT)
        add_text(s, ar, lx + Inches(0.55), ty + Pt(4), cell_w - Inches(0.62), Inches(0.36),
                 font_size=Pt(11), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)
        add_text(s, en, lx + Inches(0.55), ty + Pt(28), cell_w - Inches(0.62), Inches(0.3),
                 font_size=Pt(10), color=DIM, align=PP_ALIGN.LEFT)

    add_text(s, '22 categories total  |  Teams draft 3–4 each per game',
             Inches(0.35), Inches(7.08), Inches(12.63), Inches(0.32),
             font_size=Pt(11), color=GOLD, align=PP_ALIGN.CENTER)

    slide_number(s, 11)
    return s


def slide_12_tips(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)
    section_label(s, "STRATEGY TIPS")
    gold_bar(s)

    add_text(s, '💡  نصائح استراتيجية', Inches(0.35), Inches(0.75), Inches(12.5), Inches(0.65),
             font_size=Pt(34), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)

    tips = [
        ('🗂️', GOLD,    'Draft Smart',       'اختر بذكاء',
         'Pick categories your team knows AND your opponents struggle with.',
         'اختر فئات يُتقنها فريقك وتصعب على خصمك.'),
        ('📈', GREEN_OK, 'Build a Streak',    'اصنع تتالياً',
         '3 consecutive correct answers give +25% bonus — start with easy questions.',
         '٣ إجابات صح متتالية = +٢٥٪ — ابدأ بالأسئلة السهلة.'),
        ('💣', RED_B,   'Time Your Bomb',    'وقّت قنبلتك',
         'Drop the timer bomb right before a high-value question to cripple the steal.',
         'أطلق القنبلة قبل سؤال عالي القيمة لتشل سرقة الخصم.'),
        ('🎯', PURPLE,  'Force Wisely',      'افرض بحكمة',
         'Force the category you excel at — give them your strongest subject.',
         'افرض الفئة التي تُتقنها — ضعهم في ملعبك.'),
        ('⏱️', AMBER,  'Use Time Weapons',  'استخدم أسلحة الوقت',
         'Extra time and Ask-a-Friend are safest to burn early.',
         'الوقت الإضافي والاتصال بصديق أفضل في المراحل المبكرة.'),
        ('🏳️', BLUE_A, 'Last Stand',        'الوقفة الأخيرة',
         'Down by 400? Trigger Last Stand for 3× — one big answer can flip the game.',
         'متأخر بـ ٤٠٠؟ فعّل الوقفة الأخيرة بـ ٣× — إجابة واحدة تقلب الموازين.'),
    ]

    bw = Inches(3.85); bh = Inches(2.7)
    gap_x = Inches(0.27); gap_y = Inches(0.22)
    top = Inches(1.58)

    for i, (icon, col, en_name, ar_name, en_tip, ar_tip) in enumerate(tips):
        row = i // 3; ci = i % 3
        lx = Inches(0.35) + ci * (bw + gap_x)
        ty = top + row * (bh + gap_y)
        card_box(s, lx, ty, bw, bh, accent=col)
        add_text(s, icon + '  ' + en_name, lx + Inches(0.18), ty + Inches(0.12),
                 bw - Inches(0.25), Inches(0.45),
                 font_size=Pt(14), bold=True, color=col, align=PP_ALIGN.LEFT)
        add_text(s, ar_name, lx + Inches(0.18), ty + Inches(0.55),
                 bw - Inches(0.25), Inches(0.4),
                 font_size=Pt(13), bold=True, color=WHITE, align=PP_ALIGN.RIGHT)
        add_text(s, en_tip, lx + Inches(0.18), ty + Inches(1.0),
                 bw - Inches(0.3), Inches(0.75),
                 font_size=Pt(11), color=OFF_WHITE, align=PP_ALIGN.LEFT, wrap=True)
        add_text(s, ar_tip, lx + Inches(0.18), ty + Inches(1.78),
                 bw - Inches(0.3), Inches(0.75),
                 font_size=Pt(11), color=DIM, align=PP_ALIGN.RIGHT, wrap=True)

    slide_number(s, 12)
    return s


def slide_13_end(prs):
    s = blank_slide(prs)
    fill_bg(s, BG_DARK)

    add_rect(s, 0, 0, W, Inches(0.6), fill_color=PURPLE)
    add_rect(s, 0, Inches(6.9), W, Inches(0.6), fill_color=GOLD)

    add_text(s, '🏆', Inches(0.5), Inches(1.2), Inches(12.3), Inches(1.2),
             font_size=Pt(72), align=PP_ALIGN.CENTER)
    add_text(s, 'جاهزين تلعبون؟', Inches(0.5), Inches(2.55), Inches(12.3), Inches(0.9),
             font_size=Pt(48), bold=True, color=GOLD, align=PP_ALIGN.CENTER)
    add_text(s, "Ready to Play?", Inches(0.5), Inches(3.42), Inches(12.3), Inches(0.65),
             font_size=Pt(30), bold=True, color=WHITE, align=PP_ALIGN.CENTER)

    add_text(s,
             'Scan the QR code or visit the app  •  اضغط على الرابط أو امسح QR\n'
             '• Draft your categories  •  اختر فئاتك\n'
             '• Answer fast  •  اسرع بالإجابة  •  Steal wisely  •  اسرق بذكاء\n'
             '• Most points wins!  •  الأكثر نقاطاً يفوز!',
             Inches(1.5), Inches(4.25), Inches(10.3), Inches(1.9),
             font_size=Pt(16), color=OFF_WHITE, align=PP_ALIGN.CENTER)

    add_text(s, 'Good Luck  •  بالتوفيق  🎯', Inches(0), Inches(6.88), W, Inches(0.45),
             font_size=Pt(14), bold=True, color=BG_DARK, align=PP_ALIGN.CENTER)

    slide_number(s, 13)
    return s


# ── MAIN ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    prs = new_prs()

    slide_01_title(prs)
    slide_02_what_is(prs)
    slide_03_teams(prs)
    slide_04_draft(prs)
    slide_05_board(prs)
    slide_06_question_flow(prs)
    slide_07_points(prs)
    slide_08_scoring(prs)
    slide_09_weapons(prs)
    slide_10_steal(prs)
    slide_11_categories(prs)
    slide_12_tips(prs)
    slide_13_end(prs)

    os.makedirs('docs', exist_ok=True)
    out = 'docs/Jawib_HowToPlay.pptx'
    prs.save(out)
    print(f'✅  Saved → {out}  ({len(prs.slides)} slides)')
