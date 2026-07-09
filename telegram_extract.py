"""
Telegram Chat Export Extractor & Summarizer
Extracts text & images from Telegram HTML exports, summarizes, and saves to PDF.
"""
import os
import re
import html as html_module
from datetime import datetime
from bs4 import BeautifulSoup
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                  Image as RLImage, PageBreak, Table, TableStyle,
                                  HRFlowable, KeepTogether)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── helpers ──────────────────────────────────────────────────────────────────

def html_text(s):
    """Decode basic HTML entities & strip tags."""
    if not s:
        return ''
    # decode common entities
    s = html_module.unescape(str(s))
    # replace <br> with newlines
    s = re.sub(r'<br\s*/?>', '\n', s, flags=re.I)
    # strip remaining tags
    s = re.sub(r'<[^>]+>', '', s)
    # collapse whitespace
    s = re.sub(r'[ \t]+', ' ', s)
    lines = [ln.rstrip() for ln in s.splitlines()]
    return '\n'.join(l for l in lines if l.strip()).strip()

def parse_chat(html_path, photos_base):
    """Return list of {date, time, author, text, images}."""
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    messages = []
    current_date = None

    for msg in soup.select('div.message'):
        cls = msg.get('class', [])

        # date separators
        if 'service' in cls:
            detail = msg.select_one('.body.details')
            if detail:
                txt = html_text(detail)
                # date line like "2 July 2026"
                m = re.match(r'\d?\d\s+\w+\s+\d{4}', txt)
                if m:
                    current_date = m.group()
                else:
                    # joined / created etc – skip or record as meta
                    meta_text = txt.strip()
                    if meta_text:
                        messages.append({
                            'date': current_date or '',
                            'time': '',
                            'author': 'SYSTEM',
                            'text': meta_text,
                            'images': []
                        })
                continue

        # regular messages
        author_el = msg.select_one('.from_name')
        time_el  = msg.select_one('.pull_right.date.details')
        text_el  = msg.select_one('.text')
        imgs     = msg.select('.photo')

        author = html_text(author_el) if author_el else 'Unknown'
        time   = ''
        if time_el:
            t = time_el.get('title', '')
            m = re.search(r'(\d{2}:\d{2}:\d{2})', t)
            if m:
                time = m.group(1)[:5]

        text   = html_text(text_el) if text_el else ''

        imgs_info = []
        for img in imgs:
            src = img.get('src', '')
            if src.startswith('photos/'):
                imgs_info.append({
                    'thumb':   os.path.join(photos_base, os.path.basename(src)),
                    'full':   os.path.join(photos_base, os.path.basename(src).replace('_thumb', ''))
                })
            elif src.startswith('/'):
                # absolute path – reconstruct
                imgs_info.append({'thumb': src, 'full': src})

        if text or imgs_info:
            messages.append({
                'date':    current_date or '',
                'time':    time,
                'author':  author.strip(),
                'text':    text,
                'images':  imgs_info
            })

    return messages


def summarize_text(messages, max_chars=6000):
    """Return a readable summary string of all text messages."""
    parts = []
    total_chars = 0

    for m in messages:
        if not m['text']:
            continue
        block = f"[{m['date']} {m['time']}] {m['author']}:\n{m['text']}"
        if total_chars + len(block) > max_chars:
            remaining = max_chars - total_chars
            if remaining > 100:
                parts.append(block[:remaining] + '\n…(truncated)')
            break
        parts.append(block)
        total_chars += len(block)

    return '\n\n'.join(parts)


def img_exists(path):
    """Check if an image file exists."""
    if not path:
        return False
    # Try as-is first
    if os.path.isfile(path):
        return True
    # Try without _thumb suffix for full images
    full = path.replace('_thumb', '')
    if os.path.isfile(full):
        return True
    return False


# ── PDF builder ─────────────────────────────────────────────────────────────

def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16)/255 for i in (0, 2, 4))

COLOR_ACCRETIA  = colors.HexColor('#ff5222')
COLOR_BELLATTO  = colors.HexColor('#3b82f6')
COLOR_CORA      = colors.HexColor('#a855f7')
COLOR_DARK_BG   = colors.HexColor('#0e1116')
COLOR_CARD_BG   = colors.HexColor('#1a2235')
COLOR_BORDER    = colors.HexColor('#2a3a55')
COLOR_MUTED     = colors.HexColor('#6a8aaa')
COLOR_BODY_TEXT = colors.HexColor('#c0d8f0')
COLOR_TITLE     = colors.HexColor('#ffffff')

def build_pdf(output_path, chat_name, messages, summary_text, image_gallery):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=1.5*cm, rightMargin=1.5*cm,
        topMargin=1.5*cm, bottomMargin=1.5*cm,
        title=f"{chat_name} – Chat Export",
        author="Telegram Export Tool"
    )

    W, H = A4
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle('Title',
        fontName='Helvetica-Bold', fontSize=20,
        textColor=COLOR_TITLE, spaceAfter=4,
        alignment=TA_CENTER)
    subtitle_style = ParagraphStyle('Subtitle',
        fontName='Helvetica', fontSize=10,
        textColor=COLOR_MUTED, spaceAfter=12,
        alignment=TA_CENTER)
    section_header = ParagraphStyle('SectionH',
        fontName='Helvetica-Bold', fontSize=13,
        textColor=COLOR_ACCRETIA, spaceBefore=14, spaceAfter=6,
        borderPad=4)
    msg_author = ParagraphStyle('Author',
        fontName='Helvetica-Bold', fontSize=9,
        textColor=COLOR_MUTED, spaceAfter=1)
    msg_text = ParagraphStyle('MsgText',
        fontName='Helvetica', fontSize=9,
        textColor=COLOR_BODY_TEXT, leading=13,
        spaceAfter=6)
    meta_style = ParagraphStyle('Meta',
        fontName='Helvetica', fontSize=8,
        textColor=COLOR_MUTED, spaceAfter=2)

    story = []

    # ── Cover ──────────────────────────────────────────────────────────────
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("[TELEGRAM CHAT EXPORT]", title_style))
    story.append(Paragraph(chat_name, subtitle_style))
    story.append(Paragraph(
        f"Exported: {datetime.now().strftime('%Y-%m-%d %H:%M')}  |  "
        f"{len(messages)} messages  |  {len(image_gallery)} images",
        subtitle_style))
    story.append(HRFlowable(width='100%', thickness=1, color=COLOR_BORDER))
    story.append(Spacer(1, 0.5*cm))

    # ── Section 1: Text Summary ─────────────────────────────────────────────
    story.append(Paragraph("=== TEXT SUMMARY ===", section_header))
    story.append(HRFlowable(width='100%', thickness=0.5, color=COLOR_ACCRETIA, spaceAfter=8))

    for line in summary_text.split('\n'):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 4))
            continue
        # Detect "[date time] Author:" pattern
        m = re.match(r'\[(.+?)\]\s*(.+?):\s*(.*)', line, re.DOTALL)
        if m:
            meta, author, body = m.groups()
            story.append(Paragraph(
                f"<font color='#6a8aaa'>{meta}</font>  "
                f"<font color='#ffb48f'><b>{author}:</b></font>",
                meta_style))
            if body.strip():
                story.append(Paragraph(body, msg_text))
        else:
            story.append(Paragraph(line, msg_text))

    story.append(PageBreak())

    # ── Section 2: Image Gallery ────────────────────────────────────────────
    story.append(Paragraph("=== IMAGE GALLERY ===", section_header))
    story.append(HRFlowable(width='100%', thickness=0.5, color=COLOR_ACCRETIA, spaceAfter=8))

    if not image_gallery:
        story.append(Paragraph("No images found in this export.", meta_style))
    else:
        IMG_W = (W - 3*cm) / 2 - 0.3*cm   # 2 columns
        IMG_H = IMG_W * 0.85

        for i in range(0, len(image_gallery), 2):
            row_imgs = []
            row_captions = []
            for j in range(2):
                idx = i + j
                if idx < len(image_gallery):
                    entry = image_gallery[idx]
                    path = entry['path']
                    caption = entry.get('caption', f'Image {idx+1}')
                    if os.path.isfile(path):
                        try:
                            rl_img = RLImage(path, width=IMG_W, height=IMG_H)
                            row_imgs.append(rl_img)
                            row_captions.append(Paragraph(
                                f"<font color='#6a8aaa'>#{idx+1}</font> — {caption}",
                                ParagraphStyle('Cap', fontName='Helvetica', fontSize=8,
                                               textColor=COLOR_MUTED, alignment=TA_CENTER)))
                        except Exception as e:
                            row_imgs.append(Paragraph(f"[Image error: {e}]", meta_style))
                            row_captions.append(Spacer(1, 4))
                    else:
                        row_imgs.append(Paragraph(f"[File not found: {os.path.basename(path)}]", meta_style))
                        row_captions.append(Spacer(1, 4))
                else:
                    row_imgs.append(Spacer(1, 1))
                    row_captions.append(Spacer(1, 1))

            row_table = Table(
                [[img, Spacer(1, 1)] for img in row_imgs] +
                [[cap, Spacer(1, 1)] for cap in row_captions],
                colWidths=[IMG_W, IMG_W + 0.6*cm]
            )
            row_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(KeepTogether(row_table))
            story.append(Spacer(1, 0.3*cm))

    doc.build(story)
    print(f"[OK] PDF saved: {output_path}")


# ── main ─────────────────────────────────────────────────────────────────────

def process_chat(html_path, photos_dir, chat_name, output_pdf):
    print(f"\n{'='*60}")
    print(f"Processing: {chat_name}")
    print(f"{'='*60}")

    messages = parse_chat(html_path, photos_dir)
    print(f"  Found {len(messages)} messages")

    text_msgs = [m for m in messages if m['text']]
    img_msgs  = [m for m in messages if m['images']]
    print(f"  Text messages: {len(text_msgs)}")
    print(f"  Messages with images: {len(img_msgs)}")

    summary = summarize_text(messages)

    # Build image gallery
    image_gallery = []
    seen = set()
    for m in messages:
        for img in m['images']:
            key = os.path.basename(img['thumb'])
            if key not in seen:
                seen.add(key)
                path = img['full'] if os.path.isfile(img['full']) else img['thumb']
                if os.path.isfile(path):
                    image_gallery.append({
                        'path': path,
                        'caption': f"Shared by {m['author']} on {m['date']}"
                    })
                else:
                    # Try photo directory directly
                    basename = os.path.basename(path)
                    alt = os.path.join(os.path.dirname(photos_dir), 'photos', basename)
                    if os.path.isfile(alt):
                        image_gallery.append({
                            'path': alt,
                            'caption': f"Shared by {m['author']} on {m['date']}"
                        })

    print(f"  Unique images in gallery: {len(image_gallery)}")

    build_pdf(output_pdf, chat_name, messages, summary, image_gallery)
    return messages, summary, image_gallery


if __name__ == '__main__':
    # Chat 1: Project Rising Fantasy Online
    chat1_html   = 'C:/Users/USER/Downloads/Telegram Desktop/ChatExport_2026-07-09/messages.html'
    chat1_photos = 'C:/Users/USER/Downloads/Telegram Desktop/ChatExport_2026-07-09/photos'
    chat1_name   = 'Project Rising Fantasy Online'
    chat1_pdf    = 'C:/Users/USER/Downloads/Telegram Desktop/ChatExport_2026-07-09_ChatExport.pdf'

    # Chat 2: Dedek - Th
    chat2_html   = 'C:/Users/USER/Downloads/Telegram Desktop/ChatExport_2026-07-09 _dedek/messages.html'
    chat2_photos = 'C:/Users/USER/Downloads/Telegram Desktop/ChatExport_2026-07-09 _dedek/photos'
    chat2_name   = 'Dedek - Th'
    chat2_pdf    = 'C:/Users/USER/Downloads/Telegram Desktop/ChatExport_2026-07-09 _dedek_ChatExport.pdf'

    msgs1, summ1, imgs1 = process_chat(chat1_html, chat1_photos, chat1_name, chat1_pdf)
    msgs2, summ2, imgs2 = process_chat(chat2_html, chat2_photos, chat2_name, chat2_pdf)

    print(f"\n{'='*60}")
    print("ALL DONE!")
    print(f"  PDF 1: {chat1_pdf}")
    print(f"  PDF 2: {chat2_pdf}")
    print(f"{'='*60}")

    # Print summaries to console too
    print("\n\n### CHAT 1 SUMMARY ###")
    print(summ1[:3000])
    print("\n\n### CHAT 2 SUMMARY ###")
    print(summ2[:3000])
