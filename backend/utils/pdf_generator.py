"""
utils/pdf_generator.py
PDF generation for certificates, invoices, and article pages.
Requires: pip install reportlab
"""
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT


# ── Colour palette ─────────────────────────────────────────────────────────────
NAVY   = colors.HexColor("#0B1E3D")
BLUE   = colors.HexColor("#0066CC")
LIGHT  = colors.HexColor("#E8F0FE")
GRAY   = colors.HexColor("#F5F5F5")
DARK   = colors.HexColor("#333333")
WHITE  = colors.white
GOLD   = colors.HexColor("#C8A84B")


def _base_styles():
    styles = getSampleStyleSheet()
    return styles


def generate_certificate(manuscript, article=None) -> bytes:
    """
    Generate a PDF publication certificate.
    Returns the PDF as raw bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )

    styles = _base_styles()
    elements = []

    # ── Header bar ────────────────────────────────────────────────────────────
    header_data = [["CERTIFICATE OF PUBLICATION"]]
    header_table = Table(header_data, colWidths=[17*cm])
    header_table.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), NAVY),
        ("TEXTCOLOR",    (0, 0), (-1, -1), WHITE),
        ("FONTNAME",     (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 20),
        ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING",   (0, 0), (-1, -1), 20),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 20),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.8*cm))

    # ── Sub-header ────────────────────────────────────────────────────────────
    sub_style = ParagraphStyle(
        "sub", fontSize=11, textColor=BLUE,
        alignment=TA_CENTER, spaceAfter=6,
    )
    elements.append(Paragraph("International Journal of Transformative Development (IJTD)", sub_style))
    elements.append(Paragraph("ISSN (Online): 1434-6036 | ISSN (Print): 1434-6028 | Impact Factor: 10", sub_style))
    elements.append(Spacer(1, 0.6*cm))
    elements.append(HRFlowable(width="100%", thickness=1, color=GOLD))
    elements.append(Spacer(1, 0.6*cm))

    # ── Body ──────────────────────────────────────────────────────────────────
    body_center = ParagraphStyle(
        "bc", fontSize=12, alignment=TA_CENTER, spaceAfter=8, textColor=DARK,
    )
    elements.append(Paragraph("This is to certify that the research article", body_center))
    elements.append(Spacer(1, 0.3*cm))

    title_style = ParagraphStyle(
        "title", fontSize=14, alignment=TA_CENTER, spaceAfter=8,
        textColor=NAVY, fontName="Helvetica-Bold",
    )
    title_text = article.title if article else manuscript.title
    elements.append(Paragraph(f'<b>"{title_text}"</b>', title_style))
    elements.append(Spacer(1, 0.3*cm))

    elements.append(Paragraph("authored by", body_center))
    elements.append(Spacer(1, 0.3*cm))

    author_style = ParagraphStyle(
        "author", fontSize=13, alignment=TA_CENTER,
        textColor=NAVY, fontName="Helvetica-Bold", spaceAfter=8,
    )
    authors = article.authors if article else manuscript.authors
    elements.append(Paragraph(authors, author_style))
    elements.append(Spacer(1, 0.3*cm))

    elements.append(Paragraph(
        "has been successfully published in the <b>International Journal of Transformative Development</b>.",
        body_center,
    ))
    elements.append(Spacer(1, 0.6*cm))
    elements.append(HRFlowable(width="60%", thickness=0.5, color=GOLD))
    elements.append(Spacer(1, 0.6*cm))

    # ── Details table ─────────────────────────────────────────────────────────
    ms_number  = manuscript.manuscript_number
    pub_date   = article.published_at.strftime("%B %d, %Y") if article and article.published_at else "In Press"
    doi        = article.doi if article else "Pending"

    details = [
        ["Manuscript Number:", ms_number],
        ["Publication Date:", pub_date],
        ["DOI:", doi],
        ["Journal:", "International Journal of Transformative Development"],
        ["Publisher:", "ASAIE Publishing, Yaoundé, Cameroon"],
        ["Certificate Issued:", datetime.now().strftime("%B %d, %Y")],
    ]
    detail_table = Table(details, colWidths=[5*cm, 12*cm])
    detail_table.setStyle(TableStyle([
        ("FONTNAME",     (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",     (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE",     (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",    (0, 0), (0, -1), NAVY),
        ("TEXTCOLOR",    (1, 0), (1, -1), DARK),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [GRAY, WHITE]),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
    ]))
    elements.append(detail_table)
    elements.append(Spacer(1, 1*cm))

    # ── Signature line ────────────────────────────────────────────────────────
    sig_data = [
        ["_________________________", "_________________________"],
        ["Editor-in-Chief", "Co-Editor-in-Chief"],
        ["Alain Pangop Cyr", "Clautaire Mwebi Ekengoue"],
    ]
    sig_table = Table(sig_data, colWidths=[8.5*cm, 8.5*cm])
    sig_table.setStyle(TableStyle([
        ("ALIGN",    (0, 0), (-1, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (0, 2), (-1, 2), "Helvetica-Bold"),
        ("TEXTCOLOR",(0, 0), (-1, -1), DARK),
        ("TOPPADDING",(0, 0), (-1, -1), 4),
    ]))
    elements.append(sig_table)

    # ── Footer ────────────────────────────────────────────────────────────────
    elements.append(Spacer(1, 0.6*cm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT))
    footer_style = ParagraphStyle(
        "footer", fontSize=8, textColor=colors.gray, alignment=TA_CENTER,
    )
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(
        "This certificate is issued by IJTD. Verify authenticity at www.ijtd.com | contact@ijtd.com",
        footer_style,
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


def generate_invoice(payment_data) -> bytes:
    """
    Generate an APC invoice PDF.
    payment_data keys: author_name, email, manuscript_number, title,
                       amount, currency, payment_method, date
    Returns raw bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )

    styles = _base_styles()
    elements = []

    # Header
    hdr = Table([["INVOICE — ARTICLE PROCESSING CHARGE"]], colWidths=[17*cm])
    hdr.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), NAVY),
        ("TEXTCOLOR",    (0, 0), (-1, -1), WHITE),
        ("FONTNAME",     (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 16),
        ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING",   (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 16),
    ]))
    elements.append(hdr)
    elements.append(Spacer(1, 0.5*cm))

    sub_style = ParagraphStyle("sub2", fontSize=10, textColor=BLUE, alignment=TA_CENTER)
    elements.append(Paragraph("International Journal of Transformative Development (IJTD)", sub_style))
    elements.append(Paragraph("ASAIE Publishing, Yaoundé, Cameroon | contact@ijtd.com", sub_style))
    elements.append(Spacer(1, 0.6*cm))

    invoice_num = f"INV-{payment_data.get('manuscript_number', 'XXXX')}"
    inv_date    = payment_data.get("date", datetime.now().strftime("%Y-%m-%d"))
    elements.append(Paragraph(f"<b>Invoice #:</b> {invoice_num} &nbsp;&nbsp; <b>Date:</b> {inv_date}",
                               ParagraphStyle("inv", fontSize=10, textColor=DARK)))
    elements.append(Spacer(1, 0.4*cm))

    bill_to = [
        ["BILL TO", ""],
        ["Name:", payment_data.get("author_name", "")],
        ["Email:", payment_data.get("email", "")],
        ["Institution:", payment_data.get("institution", "")],
    ]
    bt = Table(bill_to, colWidths=[4*cm, 13*cm])
    bt.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (0, 0), "Helvetica-Bold"),
        ("FONTSIZE",  (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), NAVY),
        ("BACKGROUND",(0, 0), (-1, 0), LIGHT),
        ("TOPPADDING",(0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(bt)
    elements.append(Spacer(1, 0.4*cm))

    items = [
        ["Description", "Amount"],
        [f"APC — Manuscript #{payment_data.get('manuscript_number', '')}", ""],
        [payment_data.get("title", "")[:80], payment_data.get("amount", "")],
        ["TOTAL", payment_data.get("amount", "")],
    ]
    it = Table(items, colWidths=[13*cm, 4*cm])
    it.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BACKGROUND",   (0, -1), (-1, -1), LIGHT),
        ("FONTNAME",     (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 10),
        ("ALIGN",        (1, 0), (1, -1), "RIGHT"),
        ("GRID",         (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LEFTPADDING",  (0, 0), (-1, -1), 8),
    ]))
    elements.append(it)
    elements.append(Spacer(1, 0.4*cm))

    note_style = ParagraphStyle("note", fontSize=9, textColor=colors.gray)
    elements.append(Paragraph(
        f"Payment method: {payment_data.get('payment_method', '')} | "
        f"Currency: {payment_data.get('currency', '')}",
        note_style,
    ))
    elements.append(Paragraph("Thank you for publishing with IJTD.", note_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()